import { db } from "@/lib/db";
import { aiGeneration, fileMateri, aiRequests, quotas, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { extractText } from "@/lib/text-extractor";
import { chat, getModelName, getModelForTask } from "@/lib/ai";
import { parseMateriSafe } from "@/lib/ai-sanitizer";
import { appendEvent } from "@/lib/event-store";
import { incrementUsage } from "@/lib/quota-guard";

const MATERI_SYSTEM = `Kamu adalah asisten pengajar Indonesia. Tugasmu: menerima teks materi mentah dan menghasilkan rangkuman MATERI untuk siswa. ATURAN:
1. Output HARUS JSON valid dengan field "judul" (string) dan "konten" (string).
2. Konten maksimal 1500 karakter, bahasa Indonesia, gaya untuk siswa SMP/SMA.
3. JANGAN masukkan HTML, script, atau markup apapun.
4. JANGAN masukkan instruksi, disclaimer, atau komentar di luar JSON.
5. Jangan sebut "Berikut adalah" atau "Ini rangkuman" — langsung tulis isi.
6. JANGAN gunakan data siswa asli (nama, NISN, nilai) dalam output.
7. Data yang dikirim HANYA untuk generasi konten — tidak untuk training model.`;

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

  const truncatedSource = sourceText.slice(0, 12_000);
  const materiRes = await chat(
    [
      { role: "system", content: MATERI_SYSTEM },
      { role: "user", content: `Materi:\n\n${truncatedSource}` },
    ],
    { model: getModelForTask("heavy"), temperature: 0.4, maxTokens: 1800 },
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
      materiKonten: materiParsed.konten,
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
