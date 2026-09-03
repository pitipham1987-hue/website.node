import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ProjectListItem {
  id: string;
  name: string;
  statusLabel: string;
  summary: string | null;
  milestonesDone: number;
  milestonesTotal: number;
}

/**
 * Danh sách dự án của người dùng hiện tại. RLS (Slice 1) tự lọc theo auth.uid():
 * chỉ trả dự án khách là thành viên (hoặc tất cả nếu admin).
 * Sắp xếp updated_at giảm dần (mới cập nhật lên đầu).
 */
export async function getProjectsForUser(): Promise<ProjectListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status_label, summary, updated_at, milestones(done)")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((project) => {
    const milestones = (project.milestones ?? []) as { done: boolean }[];
    return {
      id: project.id,
      name: project.name,
      statusLabel: project.status_label,
      summary: project.summary,
      milestonesDone: milestones.filter((m) => m.done).length,
      milestonesTotal: milestones.length,
    };
  });
}
