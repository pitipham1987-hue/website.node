"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/session";
import { validateProjectInput } from "@/lib/portal/admin-validation";
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
