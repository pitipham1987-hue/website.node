"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/session";
import {
  validateDirection,
  validateMilestoneTitle,
  validateProjectIds,
  validateProjectInput,
  validateUpdateInput,
} from "@/lib/portal/admin-validation";
import { reorderMilestones } from "@/lib/portal/milestone-order";
import type { ActionState } from "@/lib/portal/admin-action-state";

const GENERIC_ERROR =
  "Không lưu được thay đổi. Vui lòng thử lại; nếu vẫn lỗi hãy báo DNK House.";

function projectPath(id: string) {
  return `/portal/admin/projects/${id}`;
}

/** Revalidate trang làm việc 1 dự án + (tuỳ chọn) các trang danh sách/giao diện khách. */
function revalidateProject(
  id: string,
  opts: { list?: boolean; clientView?: boolean } = {},
) {
  revalidatePath("/portal/admin/projects/[id]", "page");
  if (opts.list) revalidatePath("/portal/admin");
  if (opts.clientView) {
    revalidatePath("/portal/[projectId]", "page");
    revalidatePath("/portal");
  }
}

export async function createProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = validateProjectInput(formData);
  if (!parsed.ok)
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: parsed.value.name,
      status_label: parsed.value.statusLabel,
      summary: parsed.value.summary,
    })
    .select("id")
    .single();
  if (error || !data) return { error: GENERIC_ERROR };

  revalidatePath("/portal/admin");
  redirect(projectPath(data.id));
}

export async function updateProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = validateProjectInput(formData);
  if (!parsed.ok)
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.value.name,
      status_label: parsed.value.statusLabel,
      summary: parsed.value.summary,
    })
    .eq("id", projectId);
  if (error) return { error: GENERIC_ERROR };

  revalidateProject(projectId, { list: true, clientView: true });
  return { ok: true };
}

export async function deleteProject(projectId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  // ON DELETE CASCADE lo milestones / updates / project_members.
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;

  revalidatePath("/portal/admin");
  revalidatePath("/portal");
  redirect("/portal/admin");
}

// ============ Mốc triển khai ============

export async function addMilestone(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = validateMilestoneTitle(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("milestones")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (countError) return { error: GENERIC_ERROR };

  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    title: parsed.value.title,
    position: count ?? 0,
  });
  if (error) return { error: GENERIC_ERROR };

  revalidateProject(projectId, { list: true, clientView: true });
  return { ok: true };
}

export async function renameMilestone(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  const milestoneId = String(formData.get("milestoneId") ?? "");
  const parsed = validateMilestoneTitle(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("milestones")
    .update({ title: parsed.value.title })
    .eq("id", milestoneId)
    .eq("project_id", projectId);
  if (error) return { error: GENERIC_ERROR };

  revalidateProject(projectId, { clientView: true });
  return { ok: true };
}

export async function toggleMilestone(
  projectId: string,
  milestoneId: string,
  done: boolean,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  // Trigger set_milestone_done_at tự set/xoá done_at.
  const { error } = await supabase
    .from("milestones")
    .update({ done })
    .eq("id", milestoneId)
    .eq("project_id", projectId);
  if (error) throw error;

  revalidateProject(projectId, { list: true, clientView: true });
}

export async function deleteMilestone(
  projectId: string,
  milestoneId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", milestoneId)
    .eq("project_id", projectId);
  if (error) throw error;

  // Không renumber ở đây — reorderMilestone tự lành position lần kế tiếp.
  revalidateProject(projectId, { list: true, clientView: true });
}

export async function reorderMilestone(
  projectId: string,
  milestoneId: string,
  direction: "up" | "down",
): Promise<void> {
  await requireAdmin();
  const dir = validateDirection(direction);
  if (!dir.ok) throw new Error(dir.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .select("id, position")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;

  const reordered = reorderMilestones(data ?? [], milestoneId, dir.value);
  for (const m of reordered) {
    const { error: updError } = await supabase
      .from("milestones")
      .update({ position: m.position })
      .eq("id", m.id)
      .eq("project_id", projectId);
    if (updError) throw updError;
  }

  revalidateProject(projectId, { clientView: true });
}

// ============ Nhật ký cập nhật ============

export async function addUpdate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = validateUpdateInput(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("updates").insert({
    project_id: projectId,
    body: parsed.value.body,
    author_name: parsed.value.authorName,
  });
  if (error) return { error: GENERIC_ERROR };

  revalidateProject(projectId, { list: true, clientView: true });
  return { ok: true };
}

export async function updateUpdate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  const updateId = String(formData.get("updateId") ?? "");
  const parsed = validateUpdateInput(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  // KHÔNG đổi created_at.
  const { error } = await supabase
    .from("updates")
    .update({ body: parsed.value.body, author_name: parsed.value.authorName })
    .eq("id", updateId)
    .eq("project_id", projectId);
  if (error) return { error: GENERIC_ERROR };

  revalidateProject(projectId, { clientView: true });
  return { ok: true };
}

export async function deleteUpdate(
  projectId: string,
  updateId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("updates")
    .delete()
    .eq("id", updateId)
    .eq("project_id", projectId);
  if (error) throw error;

  revalidateProject(projectId, { clientView: true });
}

// ============ Khách & thành viên ============

export async function approveAndAssign(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const profileId = String(formData.get("profileId") ?? "");
  const projectIds = formData
    .getAll("projectIds")
    .map((v) => String(v));
  const parsed = validateProjectIds(projectIds);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();

  const { error: roleError } = await supabase
    .from("profiles")
    .update({ role: "client" })
    .eq("id", profileId)
    .eq("role", "pending");
  if (roleError) return { error: GENERIC_ERROR };

  if (parsed.value.length > 0) {
    const { error: memberError } = await supabase
      .from("project_members")
      .insert(
        parsed.value.map((projectId) => ({
          project_id: projectId,
          profile_id: profileId,
        })),
      );
    if (memberError) return { error: GENERIC_ERROR };
  }

  revalidatePath("/portal/admin");
  revalidatePath("/portal");
  redirect("/portal/admin");
}

export async function addMember(
  projectId: string,
  profileId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, profile_id: profileId });
  if (error) throw error;

  revalidateProject(projectId, { list: true, clientView: true });
}

export async function removeMember(
  projectId: string,
  profileId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  // Chỉ xoá dòng project_members — KHÔNG đụng profiles.role.
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("profile_id", profileId);
  if (error) throw error;

  revalidateProject(projectId, { list: true, clientView: true });
}
