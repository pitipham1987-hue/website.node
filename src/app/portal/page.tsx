import { requireClient } from "@/lib/portal/session";
import { getProjectsForUser } from "@/lib/portal/queries";
import { PendingNotice } from "@/components/portal/PendingNotice";
import { ProjectCard } from "@/components/portal/ProjectCard";

export default async function PortalPage() {
  const access = await requireClient();

  if (access.status === "pending") {
    return <PendingNotice />;
  }

  const projects = await getProjectsForUser();
  const name = access.profile.fullName ?? access.profile.email;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        Dự án của {name}
      </h1>

      {projects.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-muted">
          Chưa có dự án nào được liên kết với tài khoản của bạn. DNK House sẽ cập
          nhật khi dự án của bạn được khởi tạo.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
