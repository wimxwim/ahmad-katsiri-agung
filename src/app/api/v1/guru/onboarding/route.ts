import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { db } from "@/lib/db";
import { onboardingProgress } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { checkRateLimitPerUser } from "@/lib/rate-limit";

const STEPS = ["kursus", "upload", "kelas"] as const;

const OnboardingStepSchema = z.object({
  step: z.enum(STEPS),
});

type Step = (typeof STEPS)[number];

const STEP_LABELS: Record<Step, string> = {
  kursus: "Buat kursus pertamamu",
  upload: "Upload dokumen",
  kelas: "Buat kelas dan undang siswa",
};

const FIELD_MAP: Record<Step, string> = {
  kursus: "firstCourseCreated",
  upload: "firstMaterialUploaded",
  kelas: "firstCoursePublished",
};

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const rl = await checkRateLimitPerUser(`onboarding:${session.userId}`, 30, 60_000);
    if (!rl.allowed) return apiRateLimit(rl.retryAfter);

    let progress = await db.query.onboardingProgress.findFirst({
      where: eq(onboardingProgress.userId, session.userId),
    });

    if (!progress) {
      const [created] = await db
        .insert(onboardingProgress)
        .values({ userId: session.userId })
        .returning();
      progress = created;
    }

    const doneFlags = [
      progress.firstCourseCreated,
      progress.firstMaterialUploaded,
      progress.firstCoursePublished,
    ] as const;
    const completedStepKeys = STEPS.filter((_, i) => doneFlags[i]);
    const completedSteps = completedStepKeys.length;

    return NextResponse.json({
      data: {
        ...progress,
        completedSteps,
        completedStepKeys,
        totalSteps: STEPS.length,
        isComplete: progress.completedAt !== null || completedSteps === STEPS.length,
        steps: STEPS.map((s, i) => ({
          key: s,
          label: STEP_LABELS[s],
          done: doneFlags[i],
        })),
      },
    });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    return apiError("Terjadi kesalahan server", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;
    const session = await requireGuru(request);

    const rl2 = await checkRateLimitPerUser(`onboarding-write:${session.userId}`, 10, 60_000);
    if (!rl2.allowed) return apiRateLimit(rl2.retryAfter);

    const { step } = OnboardingStepSchema.parse(await request.json());

    const stepIndex = STEPS.indexOf(step);
    const field = FIELD_MAP[step];
    const isLastStep = stepIndex === STEPS.length - 1;

    const progress = await db.query.onboardingProgress.findFirst({
      where: eq(onboardingProgress.userId, session.userId),
    });

    const [updated] = await db
      .insert(onboardingProgress)
      .values({
        userId: session.userId,
        [field]: true,
        currentStep: isLastStep ? step : STEPS[stepIndex + 1],
        completedAt: isLastStep ? new Date() : progress?.completedAt ?? null,
      } as never)
      .onConflictDoUpdate({
        target: onboardingProgress.userId,
        set: {
          [field]: true,
          currentStep: isLastStep ? step : STEPS[stepIndex + 1],
          completedAt: isLastStep ? new Date() : progress?.completedAt ?? null,
          updatedAt: new Date(),
        } as never,
      })
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    if (e instanceof GuardError) return apiError(e.message, e.status);
    return apiError("Terjadi kesalahan server", 500);
  }
}
