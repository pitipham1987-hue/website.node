import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
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
