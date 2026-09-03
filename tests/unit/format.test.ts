import { describe, expect, it } from "vitest";
import { formatVnDate } from "@/lib/portal/format";

describe("formatVnDate", () => {
  it("ISO ban ngày UTC -> dd/mm/yyyy", () => {
    expect(formatVnDate("2026-08-20T03:00:00Z")).toBe("20/08/2026");
  });

  it("ISO tối muộn UTC -> cộng 7h sang ngày hôm sau theo giờ VN", () => {
    // 2026-08-21T18:30:00Z + 7h = 2026-08-22T01:30 giờ VN
    expect(formatVnDate("2026-08-21T18:30:00Z")).toBe("22/08/2026");
  });

  it("có phần offset sẵn trong chuỗi vẫn quy về giờ VN", () => {
    expect(formatVnDate("2026-01-05T23:00:00+00:00")).toBe("06/01/2026");
  });

  it("chuỗi rỗng -> ''", () => {
    expect(formatVnDate("")).toBe("");
  });

  it("chuỗi rác -> ''", () => {
    expect(formatVnDate("không-phải-ngày")).toBe("");
  });
});
