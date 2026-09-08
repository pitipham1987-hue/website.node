import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminProjectListItem {
  id: string;
  name: string;
  statusLabel: string;
  milestonesDone: number;
  milestonesTotal: number;
  memberCount: number;
}

/** Mọi dự án + đếm mốc xong/tổng + đếm thành viên. Sắp updated_at giảm dần. */
export async function getAdminProjectList(): Promise<AdminProjectListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, name, status_label, updated_at, milestones(done), project_members(profile_id)",
    )
    .order("updated_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((p) => {
    const milestones = (p.milestones ?? []) as { done: boolean }[];
    const members = (p.project_members ?? []) as { profile_id: string }[];
    return {
      id: p.id,
      name: p.name,
      statusLabel: p.status_label,
      milestonesDone: milestones.filter((m) => m.done).length,
      milestonesTotal: milestones.length,
      memberCount: members.length,
    };
  });
}

export interface PendingProfile {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
}

export async function getPendingProfiles(): Promise<PendingProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .eq("role", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    createdAt: r.created_at,
  }));
}

/** 1 khách đang chờ duyệt. null nếu id không tồn tại hoặc role != 'pending'. */
export async function getPendingProfile(
  id: string,
): Promise<PendingProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at, role")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.role !== "pending") return null;
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    createdAt: data.created_at,
  };
}

export interface ClientProfile {
  id: string;
  email: string;
  fullName: string | null;
  projectNames: string[];
}

export async function getClientProfiles(): Promise<ClientProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, project_members(projects(name))")
    .eq("role", "client")
    .order("email", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((r) => {
    const links = (r.project_members ?? []) as {
      projects: { name: string } | null;
    }[];
    return {
      id: r.id,
      email: r.email,
      fullName: r.full_name,
      projectNames: links
        .map((l) => l.projects?.name)
        .filter((n): n is string => Boolean(n)),
    };
  });
}

export interface AdminMilestone {
  id: string;
  title: string;
  done: boolean;
  doneAt: string | null;
  position: number;
}

export interface AdminUpdate {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export interface AdminMember {
  profileId: string;
  email: string;
  fullName: string | null;
}

export interface AdminProjectDetail {
  id: string;
  name: string;
  statusLabel: string;
  summary: string | null;
  milestones: AdminMilestone[];
  updates: AdminUpdate[];
  members: AdminMember[];
}

/** Toàn bộ dữ liệu 1 dự án cho trang làm việc admin. null nếu không tồn tại. */
export async function getAdminProjectDetail(
  id: string,
): Promise<AdminProjectDetail | null> {
  const supabase = await createClient();

  const projectRes = await supabase
    .from("projects")
    .select("id, name, status_label, summary")
    .eq("id", id)
    .maybeSingle();
  if (projectRes.error) throw projectRes.error;
  if (!projectRes.data) return null;

  const [milestonesRes, updatesRes, membersRes] = await Promise.all([
    supabase
      .from("milestones")
      .select("id, title, done, done_at, position")
      .eq("project_id", id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("updates")
      .select("id, body, author_name, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_members")
      .select("profile_id, profiles(email, full_name)")
      .eq("project_id", id),
  ]);
  if (milestonesRes.error) throw milestonesRes.error;
  if (updatesRes.error) throw updatesRes.error;
  if (membersRes.error) throw membersRes.error;

  return {
    id: projectRes.data.id,
    name: projectRes.data.name,
    statusLabel: projectRes.data.status_label,
    summary: projectRes.data.summary ?? null,
    milestones: (milestonesRes.data ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      done: m.done,
      doneAt: m.done_at,
      position: m.position,
    })),
    updates: (updatesRes.data ?? []).map((u) => ({
      id: u.id,
      body: u.body,
      authorName: u.author_name,
      createdAt: u.created_at,
    })),
    members: (membersRes.data ?? []).map((row) => {
      const profile = (row.profiles ?? null) as {
        email: string;
        full_name: string | null;
      } | null;
      return {
        profileId: row.profile_id,
        email: profile?.email ?? "—",
        fullName: profile?.full_name ?? null,
      };
    }),
  };
}

export interface AssignableProject {
  id: string;
  name: string;
}

export async function getAssignableProjects(): Promise<AssignableProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p) => ({ id: p.id, name: p.name }));
}

export interface AssignableClient {
  id: string;
  email: string;
  fullName: string | null;
}

/** profiles role='client' CHƯA là thành viên của projectId. Lọc trong JS (quy mô nhỏ). */
export async function getAssignableClients(
  projectId: string,
): Promise<AssignableClient[]> {
  const supabase = await createClient();

  const [clientsRes, membersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("role", "client")
      .order("email", { ascending: true }),
    supabase
      .from("project_members")
      .select("profile_id")
      .eq("project_id", projectId),
  ]);
  if (clientsRes.error) throw clientsRes.error;
  if (membersRes.error) throw membersRes.error;

  const memberIds = new Set((membersRes.data ?? []).map((m) => m.profile_id));
  return (clientsRes.data ?? [])
    .filter((c) => !memberIds.has(c.id))
    .map((c) => ({ id: c.id, email: c.email, fullName: c.full_name }));
}
