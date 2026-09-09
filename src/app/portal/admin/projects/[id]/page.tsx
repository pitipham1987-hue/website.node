import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/portal/session";
import { getAdminProjectDetail } from "@/lib/portal/admin-queries";
import { deleteProject } from "@/lib/portal/admin-actions";
import { AdminNav } from "@/components/portal/admin/AdminNav";
import { ProjectForm } from "@/components/portal/admin/ProjectForm";
import { MilestoneManager } from "@/components/portal/admin/MilestoneManager";
import { UpdateManager } from "@/components/portal/admin/UpdateManager";
import { MemberList } from "@/components/portal/admin/MemberList";
import { DeleteButton } from "@/components/portal/admin/DeleteButton";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminProjectDetailPage({
  params,
}: PageProps<"/portal/admin/projects/[id]">) {
  const profile = await requireAdmin();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const project = await getAdminProjectDetail(id);
  if (!project) notFound();

  const confirmText = `Xoá dự án "${project.name}" kèm ${project.milestones.length} mốc, ${project.updates.length} nhật ký, ${project.members.length} gán thành viên — không hoàn tác được.`;

  return (
    <div>
      <AdminNav />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/portal/admin"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Trang quản trị
        </Link>
        <Link
          href={`/portal/${project.id}`}
          className="text-xs text-muted underline transition-colors hover:text-foreground"
        >
          Xem như khách
        </Link>
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        {project.name}
      </h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Thông tin dự án
        </h2>
        <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
          <ProjectForm
            mode="edit"
            project={{
              id: project.id,
              name: project.name,
              statusLabel: project.statusLabel,
              summary: project.summary,
            }}
          />
          <div className="mt-6 border-t border-border pt-4">
            <DeleteButton
              action={deleteProject.bind(null, project.id)}
              confirmText={confirmText}
              label="Xoá dự án"
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Các mốc triển khai
        </h2>
        <div className="mt-4">
          <MilestoneManager
            projectId={project.id}
            milestones={project.milestones}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Nhật ký cập nhật
        </h2>
        <div className="mt-4">
          <UpdateManager
            projectId={project.id}
            updates={project.updates}
            defaultAuthorName={profile.fullName ?? "DNK House"}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Thành viên</h2>
        <div className="mt-4">
          <MemberList projectId={project.id} members={project.members} />
        </div>
      </section>
    </div>
  );
}
