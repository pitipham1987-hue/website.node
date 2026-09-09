import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/portal/session";
import {
  getAdminProjectList,
  getClientProfiles,
  getPendingProfiles,
} from "@/lib/portal/admin-queries";
import { formatVnDate } from "@/lib/portal/format";
import { AdminNav } from "@/components/portal/admin/AdminNav";

export default async function AdminHomePage() {
  await requireAdmin();
  const [projects, pending, clients] = await Promise.all([
    getAdminProjectList(),
    getPendingProfiles(),
    getClientProfiles(),
  ]);

  return (
    <div>
      <AdminNav />

      {/* Khu 1: Dự án */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Dự án</h1>
          <Link
            href="/portal/admin/projects/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" aria-hidden />
            Tạo dự án
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Chưa có dự án nào.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/portal/admin/projects/${p.id}`}
                    className="text-sm font-medium text-foreground hover:text-accent"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {p.statusLabel} · {p.milestonesDone}/{p.milestonesTotal} mốc
                    · {p.memberCount} thành viên
                  </p>
                </div>
                <Link
                  href={`/portal/${p.id}`}
                  className="shrink-0 text-xs text-muted underline transition-colors hover:text-foreground"
                >
                  Xem như khách
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Khu 2: Khách chờ duyệt */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">
          Khách chờ duyệt
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Không có khách nào đang chờ.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pending.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <span className="text-foreground">{c.email}</span>
                  <p className="text-xs text-muted">
                    {c.fullName ?? "—"} · {formatVnDate(c.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/portal/admin/pending/${c.id}`}
                  className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background"
                >
                  Duyệt &amp; gán dự án
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Khu 3: Khách đã duyệt */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">
          Khách đã duyệt
        </h2>
        {clients.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Chưa có khách nào được duyệt.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {clients.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              >
                <span className="text-foreground">
                  {c.fullName ? `${c.fullName} · ` : ""}
                  <span className="text-muted">{c.email}</span>
                </span>
                {c.projectNames.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {c.projectNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-background px-2 py-0.5 text-xs text-muted"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
