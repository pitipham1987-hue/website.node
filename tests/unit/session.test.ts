import { describe, expect, it } from "vitest";
import {
  resolveClientAccess,
  resolveProjectAccess,
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

describe("resolveProjectAccess", () => {
  const project = {
    id: "aaaaaaaa-0000-0000-0000-000000000001",
    name: "Dự án 1",
    statusLabel: "Đang triển khai",
    summary: null,
  };

  it("client pending -> notFound (kể cả khi có dữ liệu dự án)", () => {
    expect(resolveProjectAccess("pending", project)).toEqual({
      status: "notFound",
    });
  });

  it("client ok nhưng RLS không trả dòng nào -> notFound", () => {
    expect(resolveProjectAccess("ok", null)).toEqual({ status: "notFound" });
  });

  it("client ok + có dự án -> ok kèm project", () => {
    expect(resolveProjectAccess("ok", project)).toEqual({
      status: "ok",
      project,
    });
  });
});
