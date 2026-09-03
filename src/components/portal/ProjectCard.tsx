import Link from "next/link";
import { milestoneProgress } from "@/lib/portal/progress";
import type { ProjectListItem } from "@/lib/portal/queries";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const percent = milestoneProgress({
    done: project.milestonesDone,
    total: project.milestonesTotal,
  });

  return (
    <Link
      href={`/portal/${project.id}`}
      className="block rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">{project.name}</h2>
        <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          {project.statusLabel}
        </span>
      </div>

      {project.summary && (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {project.summary}
        </p>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Tiến độ milestone</span>
          <span>
            {project.milestonesDone}/{project.milestonesTotal} · {percent}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
