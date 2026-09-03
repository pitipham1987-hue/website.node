import Link from "next/link";

export default function PortalNotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Không tìm thấy dự án
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Dự án bạn tìm không tồn tại, hoặc không thuộc quyền truy cập của tài khoản
        này. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ người phụ trách dự
        án của bạn tại DNK House.
      </p>
      <Link
        href="/portal"
        className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Về danh sách dự án
      </Link>
    </div>
  );
}
