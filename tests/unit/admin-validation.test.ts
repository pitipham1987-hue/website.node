import { describe, expect, it } from "vitest";
import {
  validateDirection,
  validateMilestoneTitle,
  validateProjectIds,
  validateProjectInput,
  validateUpdateInput,
} from "@/lib/portal/admin-validation";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

describe("validateProjectInput", () => {
  it("hợp lệ: trim + summary rỗng -> null", () => {
    const r = validateProjectInput(
      fd({ name: "  Dự án X  ", status_label: " Đang triển khai ", summary: "   " }),
    );
    expect(r).toEqual({
      ok: true,
      value: { name: "Dự án X", statusLabel: "Đang triển khai", summary: null },
    });
  });

  it("name rỗng -> fieldErrors.name", () => {
    const r = validateProjectInput(fd({ name: "   ", status_label: "X" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.name).toBeTruthy();
  });

  it("status_label rỗng -> fieldErrors.status_label", () => {
    const r = validateProjectInput(fd({ name: "X", status_label: "" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.status_label).toBeTruthy();
  });

  it("name quá 200 ký tự -> lỗi", () => {
    const r = validateProjectInput(
      fd({ name: "a".repeat(201), status_label: "X" }),
    );
    expect(r.ok).toBe(false);
  });

  it("summary quá 2000 ký tự -> lỗi", () => {
    const r = validateProjectInput(
      fd({ name: "X", status_label: "Y", summary: "a".repeat(2001) }),
    );
    expect(r.ok).toBe(false);
  });

  it("summary hợp lệ -> giữ nguyên (đã trim)", () => {
    const r = validateProjectInput(
      fd({ name: "X", status_label: "Y", summary: "  tóm tắt  " }),
    );
    expect(r).toEqual({
      ok: true,
      value: { name: "X", statusLabel: "Y", summary: "tóm tắt" },
    });
  });
});

describe("validateMilestoneTitle", () => {
  it("hợp lệ", () => {
    expect(validateMilestoneTitle(fd({ title: "  Mốc 1 " }))).toEqual({
      ok: true,
      value: { title: "Mốc 1" },
    });
  });
  it("rỗng -> lỗi", () => {
    expect(validateMilestoneTitle(fd({ title: "  " })).ok).toBe(false);
  });
  it("quá 200 -> lỗi", () => {
    expect(validateMilestoneTitle(fd({ title: "a".repeat(201) })).ok).toBe(false);
  });
});

describe("validateUpdateInput", () => {
  it("hợp lệ", () => {
    expect(
      validateUpdateInput(fd({ body: " Nội dung ", author_name: " DNK House " })),
    ).toEqual({
      ok: true,
      value: { body: "Nội dung", authorName: "DNK House" },
    });
  });
  it("body rỗng -> fieldErrors.body", () => {
    const r = validateUpdateInput(fd({ body: "", author_name: "A" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.body).toBeTruthy();
  });
  it("author_name rỗng -> fieldErrors.author_name", () => {
    const r = validateUpdateInput(fd({ body: "x", author_name: "  " }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.author_name).toBeTruthy();
  });
  it("body quá 5000 -> lỗi", () => {
    expect(
      validateUpdateInput(fd({ body: "a".repeat(5001), author_name: "A" })).ok,
    ).toBe(false);
  });
  it("author_name quá 120 -> lỗi", () => {
    expect(
      validateUpdateInput(fd({ body: "x", author_name: "a".repeat(121) })).ok,
    ).toBe(false);
  });
});

describe("validateProjectIds", () => {
  const uuid = "aaaaaaaa-0000-0000-0000-000000000001";
  it("mảng rỗng -> hợp lệ", () => {
    expect(validateProjectIds([])).toEqual({ ok: true, value: [] });
  });
  it("toàn UUID hợp lệ -> ok", () => {
    expect(validateProjectIds([uuid])).toEqual({ ok: true, value: [uuid] });
  });
  it("có phần tử sai định dạng -> lỗi", () => {
    expect(validateProjectIds([uuid, "khong-phai-uuid"]).ok).toBe(false);
  });
});

describe("validateDirection", () => {
  it("'up' -> ok", () => {
    expect(validateDirection("up")).toEqual({ ok: true, value: "up" });
  });
  it("'down' -> ok", () => {
    expect(validateDirection("down")).toEqual({ ok: true, value: "down" });
  });
  it("giá trị khác -> lỗi", () => {
    expect(validateDirection("sideways").ok).toBe(false);
    expect(validateDirection(null).ok).toBe(false);
  });
});
