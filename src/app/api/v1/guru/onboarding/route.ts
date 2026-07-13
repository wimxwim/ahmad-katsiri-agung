import { NextRequest, NextResponse } from "next/server";
import { requireGuru, GuardError } from "@/lib/route-guard-v2";
import { db } from "@/lib/db";
import { onboardingProgress } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiRateLimit } from "@/lib/api-response";
import { validateCsrf } from "@/lib/csrf-server";
import { checkRateLimit, ipFromRequest } from "@/lib/rate-limit";

const STEPS = [
  "registration",
  "profile",
  "tour",
  "first_course",
  "first_upload",
  "first_ai",
  "first_publish",
] as const;

type Step = (typeof STEPS)[number];

export async function GET(request: NextRequest) {
  try {
    const session = await requireGuru(request);

    const ip = ipFromRequest(request);
    const rl = await checkRateLimit(`onboarding:${ip}`, 30, 60_000);
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

    const completedSteps = [
      progress.emailVerified,
      progress.profileCompleted,
      progress.tourCompleted,
      progress.firstCourseCreated,
      progress.firstMaterialUploaded,
      progress.firstAiGenerated,
      progress.firstCoursePublished,
    ].filter(Boolean).length;

    return NextResponse.json({
      data: {
        ...progress,
        completedSteps,
        totalSteps: STEPS.length,
        isComplete: progress.completedAt !== null,
        steps: STEPS.map((s, i) => ({
          key: s,
          label: STEP_LABELS[s],
          done: [
            progress.emailVerified,
            progress.profileCompleted,
            progress.tourCompleted,
            progress.firstCourseCreated,
            progress.firstMaterialUploaded,
            progress.firstAiGenerated,
            progress.firstCoursePublished,
          ][i],
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

    const ip2 = ipFromRequest(request);
    const rl2 = await checkRateLimit(`onboarding-write:${ip2}`, 10, 60_000);
    if (!rl2.allowed) return apiRateLimit(rl2.retryAfter);

    const body = await request.json();
    const { step } = body as { step: Step };

    if (!step || !STEPS.includes(step)) {
      return apiError(`Step tidak valid. Gunakan: ${STEPS.join(", ")}`, 400);
    }

    const stepIndex = STEPS.indexOf(step);
    const fieldMap: Record<Step, string> = {
      registration: "emailVerified",
      profile: "profileCompleted",
      tour: "tourCompleted",
      first_course: "firstCourseCreated",
      first_upload: "firstMaterialUploaded",
      first_ai: "firstAiGenerated",
      first_publish: "firstCoursePublished",
    };

    const field = fieldMap[step];
    const isLastStep = stepIndex === STEPS.length - 1;

    const [updated] = await db
      .insert(onboardingProgress)
      .values({
        userId: session.userId,
        [field]: true,
        currentStep: isLastStep ? step : STEPS[stepIndex + 1],
        completedAt: isLastStep ? new Date() : null,
      } as never)
      .onConflictDoUpdate({
        target: onboardingProgress.userId,
        set: {
          [field]: true,
          currentStep: isLastStep ? step : STEPS[stepIndex + 1],
          completedAt: isLastStep ? new Date() : null,
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

const STEP_LABELS: Record<Step, string> = {
  registration: "Verifikasi email",
  profile: "Lengkapi profil",
  tour: "Tur dashboard",
  first_course: "Buat kursus pertama",
  first_upload: "Upload materi pertama",
  first_ai: "Coba AI generator",
  first_publish: "Publikasi kursus",
};
