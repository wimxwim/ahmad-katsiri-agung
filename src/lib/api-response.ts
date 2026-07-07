import { NextResponse } from "next/server";

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export function apiSuccess<T = unknown>(data?: T, status = 200) {
  return NextResponse.json(
    { success: true, ...(data !== undefined ? { data } : {}) },
    { status },
  );
}

export function apiError(
  messageOrCode: string,
  statusOrMessage?: number | string,
  detailsOrCode?: unknown,
  status?: number,
  headers?: Record<string, string>,
) {
  let code: string;
  let message: string;
  let details: unknown;
  let httpStatus: number;

  if (typeof statusOrMessage === "number") {
    // Legacy: apiError(message, status, headers)
    code = statusOrMessage >= 500 ? "INTERNAL_ERROR" : "ERROR";
    message = messageOrCode;
    httpStatus = statusOrMessage;
    details = detailsOrCode;
  } else if (typeof statusOrMessage === "string") {
    // Structured: apiError(code, message, details?, status?, headers?)
    code = messageOrCode;
    message = statusOrMessage;
    details = detailsOrCode;
    httpStatus = status ?? 500;
  } else {
    code = "ERROR";
    message = messageOrCode;
    httpStatus = 500;
  }

  const body: { error: ApiErrorBody } = { error: { code, message } };
  if (details !== undefined) body.error.details = details;

  const init: ResponseInit = { status: httpStatus };
  if (headers) init.headers = headers;

  return NextResponse.json(body, init);
}

export function apiValidationError(details: unknown) {
  return apiError("VALIDATION_ERROR", "Data tidak valid", details, 400);
}

export function apiUnauthorized(message = "Silakan login terlebih dahulu") {
  return apiError("UNAUTHORIZED", message, undefined, 401);
}

export function apiForbidden(message = "Akses ditolak") {
  return apiError("FORBIDDEN", message, undefined, 403);
}

export function apiNotFound(message = "Data tidak ditemukan") {
  return apiError("NOT_FOUND", message, undefined, 404);
}

export function apiConflict(message: string) {
  return apiError("CONFLICT", message, undefined, 409);
}

export function apiRateLimit(retryAfter: number) {
  return apiError(
    "RATE_LIMITED",
    `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`,
    undefined,
    429,
    { "Retry-After": String(retryAfter) },
  );
}
