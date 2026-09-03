import { getSessionProfile } from "@/lib/portal/session";
import { signOut } from "@/lib/portal/actions";

export default async function PortalLayout({
  children,
}: LayoutProps<"/portal">) {
  // Chỉ để hiển thị tên trên thanh trên — KHÔNG phải auth check
  // (page tự gọi requireClient; layout không re-render khi điều hướng client-side).
  const profile = await getSessionProfile();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <span className="text-lg font-bold tracking-tight text-foreground">
            DNK <span className="text-accent">House</span>
          </span>
          <div className="flex items-center gap-4">
            {profile && (
              <span className="hidden text-sm text-muted sm:inline">
                {profile.fullName ?? profile.email}
              </span>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        {children}
      </main>
    </div>
  );
}
