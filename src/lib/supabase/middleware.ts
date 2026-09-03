import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Refresh session Supabase trên mỗi request và đồng bộ cookie giữa request/response.
 * Trả về response (đã có cookie mới) + cờ đã đăng nhập cho src/proxy.ts.
 * KHÔNG chèn logic giữa createServerClient và getClaims().
 */
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; isAuthenticated: boolean }> {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    // Thiếu cấu hình -> không chặn request, coi như chưa đăng nhập.
    return { response, isAuthenticated: false };
  }

  let supabaseResponse = response;

  const supabase = createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();

  return { response: supabaseResponse, isAuthenticated: Boolean(data?.claims) };
}
