export function PendingNotice() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Tài khoản đang chờ DNK House duyệt
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Bạn đã đăng nhập thành công. DNK House sẽ liên kết tài khoản của bạn với
        dự án tương ứng trong thời gian sớm nhất. Nếu cần gấp, vui lòng liên hệ
        người phụ trách dự án của bạn tại DNK House.
      </p>
    </div>
  );
}
