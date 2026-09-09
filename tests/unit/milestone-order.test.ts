import { describe, expect, it } from "vitest";
import { reorderMilestones } from "@/lib/portal/milestone-order";

const list = [
  { id: "a", position: 0 },
  { id: "b", position: 1 },
  { id: "c", position: 2 },
  { id: "d", position: 3 },
];

describe("reorderMilestones", () => {
  it("đưa phần tử giữa lên trên -> hoán vị với phần tử liền trước, đánh số 0..n-1", () => {
    expect(reorderMilestones(list, "c", "up")).toEqual([
      { id: "a", position: 0 },
      { id: "c", position: 1 },
      { id: "b", position: 2 },
      { id: "d", position: 3 },
    ]);
  });

  it("đưa phần tử giữa xuống dưới -> hoán vị với phần tử liền sau", () => {
    expect(reorderMilestones(list, "b", "down")).toEqual([
      { id: "a", position: 0 },
      { id: "c", position: 1 },
      { id: "b", position: 2 },
      { id: "d", position: 3 },
    ]);
  });

  it("đưa phần tử đầu lên trên -> no-op thứ tự, vẫn đánh số lại", () => {
    expect(reorderMilestones(list, "a", "up")).toEqual([
      { id: "a", position: 0 },
      { id: "b", position: 1 },
      { id: "c", position: 2 },
      { id: "d", position: 3 },
    ]);
  });

  it("đưa phần tử cuối xuống dưới -> no-op thứ tự", () => {
    expect(reorderMilestones(list, "d", "down")).toEqual(list);
  });

  it("position trùng / rời rạc ban đầu -> sắp theo position rồi thứ tự mảng, đánh số lại liên tục", () => {
    const messy = [
      { id: "x", position: 5 },
      { id: "y", position: 5 },
      { id: "z", position: 2 },
    ];
    // sắp theo position: z(2), x(5), y(5) — tie-break giữ thứ tự mảy (x trước y)
    expect(reorderMilestones(messy, "x", "down")).toEqual([
      { id: "z", position: 0 },
      { id: "y", position: 1 },
      { id: "x", position: 2 },
    ]);
  });

  it("targetId không tồn tại -> chỉ chuẩn hoá position", () => {
    expect(reorderMilestones(list, "khong-co", "up")).toEqual(list);
  });
});
