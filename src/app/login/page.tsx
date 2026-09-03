import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/portal/session";
import { LoginButton } from "@/components/portal/LoginButton";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  if (await getSessionProfile()) redirect("/portal");

  const params = await searchParams;
  const hasError = params.error === "auth";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-sm">
        <p className="text-lg font-bold tracking-tight text-foreground">
          DNK <span className="text-accent">House</span>
        </p>
        <h1 className="mt-6 text-xl font-semibold text-foreground">
          Cổng khách hàng
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Đăng nhập bằng tài khoản Google để xem tiến độ dự án của bạn.
        </p>

        {hasError && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground"
          >
            Đăng nhập không thành công. Vui lòng thử lại.
          </p>
        )}

        <div className="mt-6">
          <LoginButton />
        </div>
      </div>

      <p className="mt-6 text-xs text-muted">
        Chưa được cấp quyền truy cập? Liên hệ DNK House để được thêm vào dự án.
      </p>
    </main>
  );
}
