/**
 * Định dạng ngày cho portal khách hàng: "dd/mm/yyyy" theo múi giờ Việt Nam.
 * Nhận ISO string (Supabase timestamptz). Không parse được -> chuỗi rỗng
 * (component tự bỏ qua, không render nhãn ngày).
 */
const vnDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function formatVnDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return vnDateFormatter.format(date);
}
