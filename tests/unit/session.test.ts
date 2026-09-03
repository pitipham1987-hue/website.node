import { describe, expect, it } from "vitest";
import {
  resolveClientAccess,
  roleToScreen,
  type SessionProfile,
} from "@/lib/portal/session";

const profile = (role: SessionProfile["role"]): SessionProfile => ({
  userId: "u1",
  email: "u@dnkhouse.test",
  fullName: "U",
  role,
});

describe("resolveClientAccess", () => {
  it("null -> redirect", () => {
    expect(resolveClientAccess(null)).toEqual({ status: "redirect" });
  });
  it("pending -> status pending kèm profile", () => {
    const p = profile("pending");
    expect(resolveClientAccess(p)).toEqual({ status: "pending", profile: p });
  });
  it("client -> status ok", () => {
    const p = profile("client");
    expect(resolveClientAccess(p)).toEqual({ status: "ok", profile: p });
  });
  it("admin -> status ok", () => {
    const p = profile("admin");
    expect(resolveClientAccess(p)).toEqual({ status: "ok", profile: p });
  });
});

describe("roleToScreen", () => {
  it("pending -> notice", () => expect(roleToScreen("pending")).toBe("notice"));
  it("client -> dashboard", () => expect(roleToScreen("client")).toBe("dashboard"));
  it("admin -> dashboard", () => expect(roleToScreen("admin")).toBe("dashboard"));
});
