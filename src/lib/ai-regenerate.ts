import { db } from "@/lib/db";
import { aiGeneration, fileMateri, aiRequests, quotas, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractText } from "@/lib/text-extractor";
import { chat, getModelName, getModelForTask, type ChatResult } from "@/lib/ai";
import { parseMateriSafe, parseQuizSafe, parseSoalSafe } from "@/lib/ai-sanitizer";
import { buildQuizSystemPrompt, buildSoalSystemPrompt, buildMateriSystemPrompt } from "@/lib/ai-generator";
import { appendEvent } from "@/lib/event-store";
import { incrementUsage } from "@/lib/quota-guard";

export async function regenerateMateriOnly(generationId: string): Promise<void> {
  const [gen] = await db
    .select()
    .from(aiGeneration)
    .where(eq(aiGeneration.id, generationId))
    .limit(1);
  if (!gen) throw new Error("Generation record tidak ditemukan");

  await db
    .update(aiGeneration)
    .set({ status: "generating", updatedAt: new Date() })
    .where(eq(aiGeneration.id, generationId));
  await appendEvent(`gen:${gen.guruId}`, "gen.materi_regenerating", { generationId });

  let sourceText: string | null = null;
  if (gen.fileMateriId) {
    const [file] = await db
      .select()
      .from(fileMateri)
      .where(eq(fileMateri.id, gen.fileMateriId))
      .limit(1);
    if (file) {
      try {
        const ext = file.tipeMime.includes("pdf")
          ? "pdf"
          : file.tipeMime.includes("word")
            ? "docx"
            : "doc";
        if (file.imagekitFileId && file.lokasi === "IMAGEKIT") {
          const { getStorageAdapter } = await import("@/lib/storage/StorageFactory");
          const adapter = await getStorageAdapter(gen.guruId);
          const link = adapter.getLink(file.imagekitFileId);
          const res = await fetch(link);
          if (res.ok) {
            const bytes = Buffer.from(await res.arrayBuffer());
            sourceText = await extractText(bytes, ext);
          }
        }
      } catch (e) {
        console.error("Re-extract for regen failed:", e);
      }
    }
  }

  if (!sourceText) {
    await db
      .update(aiGeneration)
      .set({ status: "failed", errorMessage: "File sumber tidak bisa dibaca kembali untuk re-generate", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    return;
  }

  const truncatedSource = sourceText.slice(0, 20_000);
  const tingkat = gen.tingkat ?? undefined;
  const materiRes = await chat(
    [
      { role: "system", content: buildMateriSystemPrompt(tingkat) },
      { role: "user", content: `Materi:\n\n${truncatedSource}` },
    ],
    { model: getModelForTask("heavy"), temperature: 0.4, maxTokens: 2500 },
  );
  const materiParsed = parseMateriSafe(materiRes.content);
  if (!materiParsed) {
    await db
      .update(aiGeneration)
      .set({ status: "failed", errorMessage: "AI schema invalid untuk materi", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    return;
  }

  await db
    .update(aiGeneration)
    .set({
      status: "ready",
      materiStatus: "draft",
      materiJudul: materiParsed.judul,
      materiKonten: JSON.stringify({
        ringkasan: materiParsed.ringkasan,
        pendahuluan: materiParsed.pendahuluan,
        konten: materiParsed.konten,
        poinPenting: materiParsed.poinPenting,
      }),
      materiEditedKonten: null,
      materiApprovedAt: null,
      tokenInput: (gen.tokenInput || 0) + materiRes.tokensIn,
      tokenOutput: (gen.tokenOutput || 0) + materiRes.tokensOut,
      modelName: getModelName(),
      updatedAt: new Date(),
    })
    .where(eq(aiGeneration.id, generationId));

  try {
    await db.insert(aiRequests).values({
      userId: gen.guruId,
      model: getModelName(),
      provider: "nararouter",
      requestType: "regenerate_materi",
      promptTokens: materiRes.tokensIn,
      completionTokens: materiRes.tokensOut,
      totalTokens: materiRes.tokensIn + materiRes.tokensOut,
    });
    const guru = await db.query.users.findFirst({ where: eq(users.id, gen.guruId) });
    const guruRole = guru?.role ?? "GURU";
    const quota = await db.query.quotas.findFirst({
      where: and(eq(quotas.role, guruRole), eq(quotas.resourceType, "ai_generation"), eq(quotas.isActive, true)),
    });
    if (quota) await incrementUsage(gen.guruId, quota.id);
  } catch { /* non-critical */ }

  await appendEvent(`gen:${gen.guruId}`, "gen.materi_regenerated", {
    generationId,
    tokensIn: materiRes.tokensIn,
    tokensOut: materiRes.tokensOut,
  });
}

export async function regenerateQuizOnly(generationId: string): Promise<void> {
  // 1. Fetch the aiGeneration record with file relation
  const gen = await db.query.aiGeneration.findFirst({
    where: eq(aiGeneration.id, generationId),
    with: { file: true },
  });
  if (!gen || !gen.file) {
    console.error("regenerateQuizOnly: generation not found or no file", generationId);
    return;
  }

  // 2. Set status to generating
  await db
    .update(aiGeneration)
    .set({ status: "generating", updatedAt: new Date() })
    .where(eq(aiGeneration.id, generationId));
  await appendEvent(`gen:${gen.guruId}`, "gen.quiz_regenerating", { generationId });

  // 3. Re-extract text from source file
  let sourceText = gen.file.extractionText;
  if (!sourceText || sourceText.length < 50) {
    const fileUrl = gen.file.linkAkses;
    if (fileUrl) {
      try {
        const fileRes = await fetch(fileUrl, { signal: AbortSignal.timeout(30_000) });
        if (fileRes.ok) {
          const fileBytes = Buffer.from(await fileRes.arrayBuffer());
          const ext = gen.file.tipeMime?.includes("pdf") ? "pdf" : "docx";
          sourceText = await extractText(fileBytes, ext);
        }
      } catch (e) {
        console.error("regenerateQuizOnly: failed to re-extract text:", e);
      }
    }
  }

  if (!sourceText || sourceText.length < 50) {
    await db
      .update(aiGeneration)
      .set({ status: "failed", errorMessage: "Gagal mengekstrak teks untuk quiz", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    return;
  }

  // 4. Truncate source text
  const truncated = sourceText.slice(0, 20000);

  // 5. Call AI for quiz generation
  const quizCount = 5; // default
  let quizRes: ChatResult;
  try {
    quizRes = await chat(
      [
        { role: "system", content: buildQuizSystemPrompt(quizCount) },
        { role: "user", content: `Buat ${quizCount} soal kuis dari teks berikut:\n\n${truncated}` },
      ],
      { model: getModelForTask("light"), temperature: 0.5, maxTokens: Math.max(800, quizCount * 60) },
    );
  } catch (err) {
    await db
      .update(aiGeneration)
      .set({ status: "failed", errorMessage: "AI gagal merespon untuk quiz", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    return;
  }

  // 6. Parse and validate
  const parsed = parseQuizSafe(quizRes.content);
  if (!parsed) {
    await db
      .update(aiGeneration)
      .set({ status: "failed", errorMessage: "AI schema invalid untuk quiz", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    return;
  }

  // 7. Update DB with quiz results
  const newTokenInput = (gen.tokenInput || 0) + quizRes.tokensIn;
  const newTokenOutput = (gen.tokenOutput || 0) + quizRes.tokensOut;

  await db
    .update(aiGeneration)
    .set({
      status: "ready",
      quizStatus: "draft",
      quizJudul: parsed.judul,
      quizSoal: parsed.soal,
      quizEditedSoal: null,
      quizApprovedAt: null,
      tokenInput: newTokenInput,
      tokenOutput: newTokenOutput,
      modelName: typeof quizRes.model === 'string' ? quizRes.model : String(quizRes.model ?? 'unknown'),
      updatedAt: new Date(),
    })
    .where(eq(aiGeneration.id, generationId));

  // 8. Insert aiRequests record
  await db.insert(aiRequests).values({
    userId: gen.guruId,
    model: quizRes.model,
    provider: "nararouter",
    requestType: "quiz_regenerate",
    promptTokens: quizRes.tokensIn,
    completionTokens: quizRes.tokensOut,
    totalTokens: quizRes.tokensIn + quizRes.tokensOut,
  });

  // 9. Increment quota
  try {
    const guru = await db.query.users.findFirst({ where: eq(users.id, gen.guruId) });
    const guruRole = guru?.role ?? "GURU";
    const quota = await db.query.quotas.findFirst({
      where: and(eq(quotas.role, guruRole), eq(quotas.resourceType, "ai_generation"), eq(quotas.isActive, true)),
    });
    if (quota) await incrementUsage(gen.guruId, quota.id);
  } catch { /* non-critical */ }

  // 10. Fire event
  await appendEvent(`gen:${gen.guruId}`, "gen.quiz_regenerated", {
    generationId,
    tokensIn: quizRes.tokensIn,
    tokensOut: quizRes.tokensOut,
    model: quizRes.model,
  });
}

export async function regenerateSoalOnly(generationId: string): Promise<void> {
  // 1. Fetch the aiGeneration record with file relation
  const gen = await db.query.aiGeneration.findFirst({
    where: eq(aiGeneration.id, generationId),
    with: { file: true },
  });
  if (!gen || !gen.file) {
    console.error("regenerateSoalOnly: generation not found or no file", generationId);
    return;
  }

  // 2. Set status to generating
  await db
    .update(aiGeneration)
    .set({ status: "generating", updatedAt: new Date() })
    .where(eq(aiGeneration.id, generationId));
  await appendEvent(`gen:${gen.guruId}`, "gen.soal_regenerating", { generationId });

  // 3. Re-extract text from source file
  let sourceText = gen.file.extractionText;
  if (!sourceText || sourceText.length < 50) {
    const fileUrl = gen.file.linkAkses;
    if (fileUrl) {
      try {
        const fileRes = await fetch(fileUrl, { signal: AbortSignal.timeout(30_000) });
        if (fileRes.ok) {
          const fileBytes = Buffer.from(await fileRes.arrayBuffer());
          const ext = gen.file.tipeMime?.includes("pdf") ? "pdf" : "docx";
          sourceText = await extractText(fileBytes, ext);
        }
      } catch (e) {
        console.error("regenerateSoalOnly: failed to re-extract text:", e);
      }
    }
  }

  if (!sourceText || sourceText.length < 50) {
    await db
      .update(aiGeneration)
      .set({ status: "failed", errorMessage: "Gagal mengekstrak teks untuk soal", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    return;
  }

  // 4. Truncate source text
  const truncated = sourceText.slice(0, 20000);

  // 5. Call AI for soal generation
  const soalCount = 35; // default
  let soalRes: ChatResult;
  try {
    soalRes = await chat(
      [
        { role: "system", content: buildSoalSystemPrompt(soalCount) },
        { role: "user", content: `Buat ${soalCount} soal dari teks berikut:\n\n${truncated}` },
      ],
      { model: getModelForTask("light"), temperature: 0.5, maxTokens: Math.max(2000, soalCount * 200) },
    );
  } catch (err) {
    await db
      .update(aiGeneration)
      .set({ status: "failed", errorMessage: "AI gagal merespon untuk soal", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    return;
  }

  // 6. Parse and validate
  const parsed = parseSoalSafe(soalRes.content);
  if (!parsed) {
    await db
      .update(aiGeneration)
      .set({ status: "failed", errorMessage: "AI schema invalid untuk soal", updatedAt: new Date() })
      .where(eq(aiGeneration.id, generationId));
    return;
  }

  // 7. Update DB with soal results
  const newTokenInput = (gen.tokenInput || 0) + soalRes.tokensIn;
  const newTokenOutput = (gen.tokenOutput || 0) + soalRes.tokensOut;

  await db
    .update(aiGeneration)
    .set({
      status: "ready",
      soalStatus: "draft",
      soalItems: parsed.soal,
      soalEditedItems: null,
      soalApprovedAt: null,
      tokenInput: newTokenInput,
      tokenOutput: newTokenOutput,
      modelName: typeof soalRes.model === 'string' ? soalRes.model : String(soalRes.model ?? 'unknown'),
      updatedAt: new Date(),
    })
    .where(eq(aiGeneration.id, generationId));

  // 8. Insert aiRequests record
  await db.insert(aiRequests).values({
    userId: gen.guruId,
    model: soalRes.model,
    provider: "nararouter",
    requestType: "soal_regenerate",
    promptTokens: soalRes.tokensIn,
    completionTokens: soalRes.tokensOut,
    totalTokens: soalRes.tokensIn + soalRes.tokensOut,
  });

  // 9. Increment quota
  try {
    const guru = await db.query.users.findFirst({ where: eq(users.id, gen.guruId) });
    const guruRole = guru?.role ?? "GURU";
    const quota = await db.query.quotas.findFirst({
      where: and(eq(quotas.role, guruRole), eq(quotas.resourceType, "ai_generation"), eq(quotas.isActive, true)),
    });
    if (quota) await incrementUsage(gen.guruId, quota.id);
  } catch { /* non-critical */ }

  // 10. Fire event
  await appendEvent(`gen:${gen.guruId}`, "gen.soal_regenerated", {
    generationId,
    tokensIn: soalRes.tokensIn,
    tokensOut: soalRes.tokensOut,
    model: soalRes.model,
  });
}
