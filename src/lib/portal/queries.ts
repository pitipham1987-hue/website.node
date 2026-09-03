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

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  doneAt: string | null;
}

export interface ProjectUpdate {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export interface ProjectDetail {
  milestones: Milestone[];
  updates: ProjectUpdate[];
}

/**
 * Con của 1 dự án: mốc triển khai (thứ tự position tăng dần) + nhật ký cập nhật
 * (mới nhất trên đầu). Dự án cơ bản đã lấy ở requireProjectAccess — không truy vấn lại.
 */
export async function getProjectDetail(
  projectId: string,
): Promise<ProjectDetail> {
  const supabase = await createClient();

  const [milestonesRes, updatesRes] = await Promise.all([
    supabase
      .from("milestones")
      .select("id, title, done, done_at")
      .eq("project_id", projectId)
      .order("position", { ascending: true }),
    supabase
      .from("updates")
      .select("id, body, author_name, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
  ]);

  if (milestonesRes.error) throw milestonesRes.error;
  if (updatesRes.error) throw updatesRes.error;

  return {
    milestones: (milestonesRes.data ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      done: m.done,
      doneAt: m.done_at,
    })),
    updates: (updatesRes.data ?? []).map((u) => ({
      id: u.id,
      body: u.body,
      authorName: u.author_name,
      createdAt: u.created_at,
    })),
  };
}
