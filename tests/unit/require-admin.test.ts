import { describe, expect, it } from "vitest";
import {
  postLoginPath,
  resolveAdminAccess,
  type SessionProfile,
} from "@/lib/portal/session";

const profile = (role: SessionProfile["role"]): SessionProfile => ({
  userId: "u1",
  email: "u@dnkhouse.test",
  fullName: "U",
  role,
});

describe("resolveAdminAccess", () => {
  it("null -> redirect-login", () => {
    expect(resolveAdminAccess(null)).toEqual({ status: "redirect-login" });
  });
  it("pending -> redirect-portal", () => {
    expect(resolveAdminAccess(profile("pending"))).toEqual({
      status: "redirect-portal",
    });
  });
  it("client -> redirect-portal", () => {
    expect(resolveAdminAccess(profile("client"))).toEqual({
      status: "redirect-portal",
    });
  });
  it("admin -> ok kèm profile", () => {
    const p = profile("admin");
    expect(resolveAdminAccess(p)).toEqual({ status: "ok", profile: p });
  });
});

describe("postLoginPath", () => {
  it("admin -> /portal/admin", () => {
    expect(postLoginPath("admin")).toBe("/portal/admin");
  });
  it("client -> /portal", () => {
    expect(postLoginPath("client")).toBe("/portal");
  });
  it("pending -> /portal", () => {
    expect(postLoginPath("pending")).toBe("/portal");
  });
  it("null -> /portal", () => {
    expect(postLoginPath(null)).toBe("/portal");
  });
});
