import { describe, expect, it } from "vitest";
import { milestoneProgress } from "@/lib/portal/progress";

describe("milestoneProgress", () => {
  it("0/0 -> 0 (không chia cho 0)", () => {
    expect(milestoneProgress({ done: 0, total: 0 })).toBe(0);
  });
  it("0/3 -> 0", () => {
    expect(milestoneProgress({ done: 0, total: 3 })).toBe(0);
  });
  it("2/4 -> 50", () => {
    expect(milestoneProgress({ done: 2, total: 4 })).toBe(50);
  });
  it("3/3 -> 100", () => {
    expect(milestoneProgress({ done: 3, total: 3 })).toBe(100);
  });
  it("1/3 -> 33 (làm tròn)", () => {
    expect(milestoneProgress({ done: 1, total: 3 })).toBe(33);
  });
  it("2/3 -> 67 (làm tròn lên)", () => {
    expect(milestoneProgress({ done: 2, total: 3 })).toBe(67);
  });
  it("total âm -> 0", () => {
    expect(milestoneProgress({ done: 1, total: -2 })).toBe(0);
  });
});
