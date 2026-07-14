import { csrfHeaders } from "./csrf";

export interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export interface ApiSuccessPayload<T = unknown> {
  success?: boolean;
  data?: T;
}

export interface ApiFetchResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string;
  raw: unknown;
}

export function getApiErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (!payload || typeof payload !== "object") return fallback;
  const p = payload as Record<string, unknown>;
  if (typeof p.error === "object" && p.error !== null) {
    const e = p.error as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
  }
  if (typeof p.error === "string") return p.error;
  if (typeof p.message === "string") return p.message;
  return fallback;
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<ApiFetchResult<T>> {
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(
    options.method?.toUpperCase() || "",
  );

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (isMutation) {
    if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    Object.assign(headers, csrfHeaders());
  }

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  let raw: unknown = null;
  try {
    raw = await res.json();
  } catch {
    raw = null;
  }

  if (!res.ok) {
    let errorMsg = getApiErrorMessage(raw, `Request gagal (${res.status})`);
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const waitSec = retryAfter ? parseInt(retryAfter, 10) : 30;
      errorMsg = `Terlalu banyak request. Coba lagi dalam ${waitSec} detik.`;
    }
    return {
      ok: false,
      status: res.status,
      data: null,
      error: errorMsg,
      raw,
    };
  }

  const payload = raw as ApiSuccessPayload<T>;
  return {
    ok: true,
    status: res.status,
    data: (payload?.data ?? (raw as T)) as T,
    error: "",
    raw,
  };
}