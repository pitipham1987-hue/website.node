"use client";

export default function PortalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  void error;

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Đã xảy ra lỗi khi tải dữ liệu
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Không thể hiển thị nội dung lúc này. Vui lòng thử lại sau giây lát; nếu
        vẫn lỗi, hãy liên hệ DNK House.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Thử lại
      </button>
    </div>
  );
}
