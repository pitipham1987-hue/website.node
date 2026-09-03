import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isPortal = pathname === "/portal" || pathname.startsWith("/portal/");
  const isLogin = pathname === "/login";

  // Chưa đăng nhập mà vào /portal -> /login
  if (isPortal && !isAuthenticated) {
    return redirectKeepingCookies(request, response, "/login");
  }
  // Đã đăng nhập mà vào /login -> /portal
  if (isLogin && isAuthenticated) {
    return redirectKeepingCookies(request, response, "/portal");
  }

  return response;
}

function redirectKeepingCookies(
  request: NextRequest,
  from: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirectResponse = NextResponse.redirect(url);
  // Giữ cookie session đã refresh từ updateSession.
  for (const cookie of from.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }
  return redirectResponse;
}

export const config = {
  matcher: [
    /*
     * Chạy trên mọi path TRỪ:
     * - _next/static, _next/image
     * - favicon.ico
     * - file ảnh tĩnh
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
