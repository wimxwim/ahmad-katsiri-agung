import { describe, it, expect } from "vitest";
import { roleToSessionRole, ROLE_HOME_PATHS, INTENT_PORTAL, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/session";

describe("session", () => {
  describe("roleToSessionRole", () => {
    it("GURU → guru", () => {
      expect(roleToSessionRole("GURU")).toBe("guru");
    });

    it("ASISTEN_GURU → guru", () => {
      expect(roleToSessionRole("ASISTEN_GURU")).toBe("guru");
    });

    it("OWNER → owner", () => {
      expect(roleToSessionRole("OWNER")).toBe("owner");
    });

    it("ADMIN_SEKOLAH → admin_sekolah", () => {
      expect(roleToSessionRole("ADMIN_SEKOLAH")).toBe("admin_sekolah");
    });

    it("ORANG_TUA → orang_tua", () => {
      expect(roleToSessionRole("ORANG_TUA")).toBe("orang_tua");
    });

    it("SISWA → murid", () => {
      expect(roleToSessionRole("SISWA")).toBe("murid");
    });

    it("unknown → murid (default)", () => {
      expect(roleToSessionRole("UNKNOWN")).toBe("murid");
    });
  });

  describe("ROLE_HOME_PATHS", () => {
    it("setiap role punya home path", () => {
      expect(ROLE_HOME_PATHS.guru).toBe("/guru");
      expect(ROLE_HOME_PATHS.murid).toBe("/siswa");
      expect(ROLE_HOME_PATHS.owner).toBe("/owner");
      expect(ROLE_HOME_PATHS.admin_sekolah).toBe("/admin-sekolah");
      expect(ROLE_HOME_PATHS.orang_tua).toBe("/orang-tua");
    });
  });

  describe("INTENT_PORTAL", () => {
    it("portal guru mencakup guru, owner, admin_sekolah", () => {
      expect(INTENT_PORTAL.guru).toContain("guru");
      expect(INTENT_PORTAL.guru).toContain("owner");
      expect(INTENT_PORTAL.guru).toContain("admin_sekolah");
    });

    it("portal siswa mencakup murid, orang_tua", () => {
      expect(INTENT_PORTAL.siswa).toContain("murid");
      expect(INTENT_PORTAL.siswa).toContain("orang_tua");
    });

    it("portal guru TIDAK mencakup murid", () => {
      expect(INTENT_PORTAL.guru).not.toContain("murid");
    });

    it("portal siswa TIDAK mencakup guru", () => {
      expect(INTENT_PORTAL.siswa).not.toContain("guru");
    });
  });

  describe("constants", () => {
    it("SESSION_COOKIE_NAME = akal_sesi", () => {
      expect(SESSION_COOKIE_NAME).toBe("akal_sesi");
    });

    it("SESSION_DURATION_SECONDS = 8 jam", () => {
      expect(SESSION_DURATION_SECONDS).toBe(8 * 60 * 60);
    });
  });
});