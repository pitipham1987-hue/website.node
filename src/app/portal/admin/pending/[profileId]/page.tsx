import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/portal/session";
import {
  getAssignableProjects,
  getPendingProfile,
} from "@/lib/portal/admin-queries";
import { formatVnDate } from "@/lib/portal/format";
import { AdminNav } from "@/components/portal/admin/AdminNav";
import { ApproveAssignForm } from "@/components/portal/admin/ApproveAssignForm";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ApprovePendingPage({
  params,
}: PageProps<"/portal/admin/pending/[profileId]">) {
  await requireAdmin();
  const { profileId } = await params;
  if (!UUID_RE.test(profileId)) notFound();

  const [profile, projects] = await Promise.all([
    getPendingProfile(profileId),
    getAssignableProjects(),
  ]);
  if (!profile) notFound();

  return (
    <div>
      <AdminNav />
      <Link
        href="/portal/admin"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Trang quản trị
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Duyệt khách
      </h1>
      <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-foreground">{profile.email}</p>
        <p className="mt-1 text-xs text-muted">
          {profile.fullName ?? "—"} · Đăng ký {formatVnDate(profile.createdAt)}
        </p>
        <div className="mt-6">
          <ApproveAssignForm profileId={profile.id} projects={projects} />
        </div>
      </div>
    </div>
  );
}
