import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { postLoginPath, type Role } from "@/lib/portal/session";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let role: Role | null = null;
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        role = (data?.role as Role | undefined) ?? null;
      }
      return NextResponse.redirect(`${origin}${postLoginPath(role)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
