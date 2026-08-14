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
  retryAfter?: string | null;
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
  // F11-2 Offline guard — deteksi navigator.onLine sebelum fetch
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: "Kamu offline — beberapa fitur tidak tersedia",
      raw: null,
      retryAfter: null,
    };
  }

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

  // F11-2 Timeout 15s via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const signal = options.signal
    ? (() => {
        // gabungkan signal eksternal dengan timeout controller
        if (options.signal.aborted) controller.abort();
        else options.signal.addEventListener("abort", () => controller.abort(), { once: true });
        return controller.signal;
      })()
    : controller.signal;

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
      signal,
    });
    clearTimeout(timeoutId);

    let raw: unknown = null;
    try {
      raw = await res.json();
    } catch {
      raw = null;
    }

    const retryAfter = res.headers.get("Retry-After");

    if (!res.ok) {
      let errorMsg = getApiErrorMessage(raw, `Request gagal (${res.status})`);
      // F11-3 Status terdiferensiasi 429/402/403/404
      if (res.status === 429) {
        const waitSec = retryAfter ? parseInt(retryAfter, 10) : 30;
        errorMsg = `Terlalu banyak permintaan, coba lagi dalam ${waitSec} detik`;
      } else if (res.status === 402) {
        errorMsg = "Saldo tidak cukup — Topup Rp10.000";
      } else if (res.status === 403) {
        errorMsg = "Sesi habis, muat ulang halaman";
      } else if (res.status === 404) {
        errorMsg = getApiErrorMessage(raw, "Data tidak ditemukan");
      }
      return {
        ok: false,
        status: res.status,
        data: null,
        error: errorMsg,
        raw,
        retryAfter,
      };
    }

    const payload = raw as ApiSuccessPayload<T>;
    return {
      ok: true,
      status: res.status,
      data: (payload?.data ?? (raw as T)) as T,
      error: "",
      raw,
      retryAfter: null,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    // F11-3 bedakan offline vs abort vs error lain
    const isAbort = err instanceof DOMException && err.name === "AbortError";
    const msg = err instanceof Error ? err.message : String(err);
    const isOfflineFetch = msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed");
    if (isAbort) {
      return {
        ok: false,
        status: 0,
        data: null,
        error: "Request timeout (15 detik) — periksa koneksi lalu coba lagi",
        raw: null,
        retryAfter: null,
      };
    }
    if (isOfflineFetch || (typeof navigator !== "undefined" && !navigator.onLine)) {
      return {
        ok: false,
        status: 0,
        data: null,
        error: "Kamu offline — beberapa fitur tidak tersedia",
        raw: null,
        retryAfter: null,
      };
    }
    return {
      ok: false,
      status: 0,
      data: null,
      error: msg || "Gagal menghubungi server",
      raw: null,
      retryAfter: null,
    };
  }
}
