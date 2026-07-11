import { describe, it, expect } from "vitest";
import { apiSuccess, apiError, apiValidationError, apiUnauthorized, apiForbidden, apiNotFound, apiConflict, apiRateLimit } from "@/lib/api-response";

async function getBody(response: Response) {
  return response.json();
}

describe("api-response", () => {
  describe("apiSuccess", () => {
    it("default 200", async () => {
      const res = apiSuccess();
      expect(res.status).toBe(200);
      const body = await getBody(res);
      expect(body.success).toBe(true);
    });

    it("dengan data", async () => {
      const res = apiSuccess({ id: 1 });
      const body = await getBody(res);
      expect(body.data).toEqual({ id: 1 });
    });
  });

  describe("apiError", () => {
    it("legacy signature: message + status", async () => {
      const res = apiError("Not found", 404);
      expect(res.status).toBe(404);
      const body = await getBody(res);
      expect(body.error.code).toBe("ERROR");
      expect(body.error.message).toBe("Not found");
    });

    it("structured signature: code + message + details + status", async () => {
      const res = apiError("VALIDATION_ERROR", "Data tidak valid", { field: "email" }, 400);
      expect(res.status).toBe(400);
      const body = await getBody(res);
      expect(body.error.code).toBe("VALIDATION_ERROR");
      expect(body.error.message).toBe("Data tidak valid");
      expect(body.error.details).toEqual({ field: "email" });
    });

    it("default 500 jika tidak ada status", async () => {
      const res = apiError("ERROR", "Something wrong");
      expect(res.status).toBe(500);
    });
  });

  describe("convenience functions", () => {
    it("apiValidationError → 400", async () => {
      const res = apiValidationError({ name: "required" });
      expect(res.status).toBe(400);
      const body = await getBody(res);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    it("apiUnauthorized → 401", async () => {
      const res = apiUnauthorized();
      expect(res.status).toBe(401);
      const body = await getBody(res);
      expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("apiForbidden → 403", async () => {
      const res = apiForbidden();
      expect(res.status).toBe(403);
      const body = await getBody(res);
      expect(body.error.code).toBe("FORBIDDEN");
    });

    it("apiNotFound → 404", async () => {
      const res = apiNotFound();
      expect(res.status).toBe(404);
      const body = await getBody(res);
      expect(body.error.code).toBe("NOT_FOUND");
    });

    it("apiConflict → 409", async () => {
      const res = apiConflict("Email sudah dipakai");
      expect(res.status).toBe(409);
      const body = await getBody(res);
      expect(body.error.code).toBe("CONFLICT");
    });

    it("apiRateLimit → 429 dengan Retry-After header", () => {
      const res = apiRateLimit(60);
      expect(res.status).toBe(429);
      expect(res.headers.get("Retry-After")).toBe("60");
    });
  });
});