/**
 * Phần trăm milestone hoàn thành, làm tròn về số nguyên.
 * total <= 0 (kể cả dự án chưa có milestone) -> 0.
 */
export function milestoneProgress(input: { done: number; total: number }): number {
  const { done, total } = input;
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}
