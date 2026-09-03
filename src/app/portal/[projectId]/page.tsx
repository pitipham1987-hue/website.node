import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireProjectAccess } from "@/lib/portal/session";
import { getProjectDetail } from "@/lib/portal/queries";
import { MilestoneList } from "@/components/portal/MilestoneList";
import { UpdatesFeed } from "@/components/portal/UpdatesFeed";

export default async function ProjectDetailPage({
  params,
}: PageProps<"/portal/[projectId]">) {
  const { projectId } = await params;
  const project = await requireProjectAccess(projectId);
  const { milestones, updates } = await getProjectDetail(project.id);

  return (
    <div>
      <Link
        href="/portal"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tất cả dự án
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">
          {project.name}
        </h1>
        <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          {project.statusLabel}
        </span>
      </div>

      {project.summary && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {project.summary}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Các mốc triển khai
        </h2>
        <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
          <MilestoneList items={milestones} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Nhật ký cập nhật
        </h2>
        <div className="mt-4">
          <UpdatesFeed items={updates} />
        </div>
      </section>
    </div>
  );
}
