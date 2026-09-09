import { requireAdmin } from "@/lib/portal/session";

export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Khu quản trị</h1>
      <p className="mt-6 rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-muted">
        Khu quản trị đang được xây dựng (Giai đoạn 2). Trong lúc chờ, thao tác
        quản trị dự án vẫn thực hiện qua Supabase Studio.
      </p>
    </div>
  );
}
