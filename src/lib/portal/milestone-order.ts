/**
 * Sắp lại thứ tự mốc triển khai — hàm thuần, không I/O.
 * Server Action đọc toàn bộ mốc của dự án, gọi hàm này, rồi ghi lại `position`
 * cho từng dòng theo kết quả. Luôn đánh số `position` liên tục 0..n-1 (tự lành
 * dữ liệu cũ có position trùng hoặc rời rạc).
 */

export interface MilestoneOrder {
  id: string;
  position: number;
}

export function reorderMilestones(
  list: MilestoneOrder[],
  targetId: string,
  direction: "up" | "down",
): MilestoneOrder[] {
  // Sắp theo position tăng dần; Array.sort của V8 ổn định -> giữ thứ tự mảy đầu
  // vào khi position bằng nhau.
  const sorted = [...list].sort((a, b) => a.position - b.position);
  const ids = sorted.map((m) => m.id);

  const index = ids.indexOf(targetId);
  if (index !== -1) {
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith >= 0 && swapWith < ids.length) {
      [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
    }
  }

  return ids.map((id, i) => ({ id, position: i }));
}
