import "server-only";

export type JobType = "upload" | "extract" | "generate" | "regenerate" | "approve";
export type JobStatus = "start" | "success" | "failure";

export interface JobLog {
  timestamp: string;
  jobType: JobType;
  jobId: string;
  status: JobStatus;
  userId: string;
  durationMs: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

const CONSECUTIVE_FAILURE_THRESHOLD = 3;
const failureCounters = new Map<string, number>();

export function logJob(
  jobType: JobType,
  jobId: string,
  status: JobStatus,
  userId: string,
  durationMs: number,
  error?: string,
  metadata?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === "test") return;

  if (status === "failure" && error) {
    console.error(`[JOB:${jobType}] FAILED id=${jobId} user=${userId} dur=${durationMs}ms err=${error}`, metadata ?? "");
    trackConsecutiveFailures(jobType, jobId, userId);
  } else if (status === "start") {
    console.log(`[JOB:${jobType}] START id=${jobId} user=${userId}`);
  } else {
    console.log(`[JOB:${jobType}] SUCCESS id=${jobId} user=${userId} dur=${durationMs}ms`);
  }
}

export function logError(jobType: JobType, jobId: string, userId: string, error: string): void {
  logJob(jobType, jobId, "failure", userId, 0, error);
}

function trackConsecutiveFailures(jobType: JobType, jobId: string, userId: string): void {
  const key = `${jobType}:${userId}`;
  const current = (failureCounters.get(key) || 0) + 1;
  failureCounters.set(key, current);

  if (current >= CONSECUTIVE_FAILURE_THRESHOLD) {
    console.error(
      `[ALERT] ${current}x consecutive failures for ${jobType} (user=${userId}, lastJob=${jobId}). Periksa sistem.`,
    );
    failureCounters.delete(key);
  }
}

export function resetFailureCounter(jobType: JobType, userId: string): void {
  const key = `${jobType}:${userId}`;
  failureCounters.delete(key);
}
