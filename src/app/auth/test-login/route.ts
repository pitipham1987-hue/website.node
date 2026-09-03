import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cửa hậu CHỈ dùng cho test E2E. Trả 404 trừ khi E2E_TEST_LOGIN=1.
 * Đăng nhập user seed (Slice 1) bằng mật khẩu cố định để bỏ qua Google thật.
 */
export async function GET(request: Request) {
  if (process.env.E2E_TEST_LOGIN !== "1") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { searchParams, origin } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return new NextResponse("Thiếu tham số email", { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: "portal-dev-123",
  });
  if (error) {
    return new NextResponse(`Đăng nhập test thất bại: ${error.message}`, {
      status: 401,
    });
  }

  return NextResponse.redirect(`${origin}/portal`);
}
