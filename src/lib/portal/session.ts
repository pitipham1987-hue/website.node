import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "pending" | "client" | "admin";

export interface SessionProfile {
  userId: string;
  email: string;
  fullName: string | null;
  role: Role;
}

/** Impl thực — tách khỏi cache() để test mock được. */
export async function loadSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();

  // getUser() xác thực JWT với Supabase Auth (không tin getSession trong code server).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return {
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as Role,
  };
}

/** Dùng trong page/action — dedupe trong 1 request. */
export const getSessionProfile = cache(loadSessionProfile);

export type ClientAccess =
  | { status: "redirect" }
  | { status: "pending"; profile: SessionProfile }
  | { status: "ok"; profile: SessionProfile };

export function resolveClientAccess(
  profile: SessionProfile | null,
): ClientAccess {
  if (!profile) return { status: "redirect" };
  if (profile.role === "pending") return { status: "pending", profile };
  return { status: "ok", profile };
}

export function roleToScreen(role: Role): "notice" | "dashboard" {
  return role === "pending" ? "notice" : "dashboard";
}

/** Gọi ở đầu mọi page /portal. redirect() ném control-flow, code sau không chạy. */
export async function requireClient(): Promise<{
  status: "ok" | "pending";
  profile: SessionProfile;
}> {
  const access = resolveClientAccess(await getSessionProfile());
  if (access.status === "redirect") redirect("/login");
  return access;
}

export interface ProjectSummary {
  id: string;
  name: string;
  statusLabel: string;
  summary: string | null;
}

export type ProjectAccess =
  | { status: "notFound" }
  | { status: "ok"; project: ProjectSummary };

/**
 * Thuần — quyết định quyền xem chi tiết dự án.
 * pending, hoặc RLS không trả dòng nào (không quyền / không tồn tại) -> notFound.
 * Không phân biệt "không tồn tại" với "không có quyền" (tránh lộ sự tồn tại của dự án).
 */
export function resolveProjectAccess(
  clientStatus: "ok" | "pending",
  project: ProjectSummary | null,
): ProjectAccess {
  if (clientStatus === "pending" || !project) return { status: "notFound" };
  return { status: "ok", project };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Gọi ở đầu page /portal/[projectId]. redirect()/notFound() ném control-flow,
 * code phía sau không chạy khi bị chặn.
 */
export async function requireProjectAccess(
  projectId: string,
): Promise<ProjectSummary> {
  const access = await requireClient();

  // id không đúng dạng UUID -> notFound luôn, khỏi để Postgres ném lỗi 22P02 vào error.tsx.
  if (!UUID_RE.test(projectId)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status_label, summary")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw error;

  const resolved = resolveProjectAccess(
    access.status,
    data
      ? {
          id: data.id,
          name: data.name,
          statusLabel: data.status_label,
          summary: data.summary ?? null,
        }
      : null,
  );
  if (resolved.status === "notFound") notFound();
  return resolved.project;
}
