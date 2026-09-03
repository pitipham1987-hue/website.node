import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SERVICE) {
  throw new Error(
    "Thiếu biến môi trường Supabase. Chạy `npx supabase start`, copy vào .env.local, " +
      "rồi chạy `npm run test` (script tự nạp .env.local).",
  );
}

export const IDS = {
  admin: "11111111-1111-1111-1111-111111111111",
  clientA: "22222222-2222-2222-2222-222222222222",
  clientB: "33333333-3333-3333-3333-333333333333",
  pending: "44444444-4444-4444-4444-444444444444",
  projectA: "aaaaaaaa-0000-0000-0000-000000000001",
  projectB: "bbbbbbbb-0000-0000-0000-000000000002",
} as const;

type Persona = "admin" | "clientA" | "clientB" | "pending";

const EMAIL: Record<Persona, string> = {
  admin: "admin@dnkhouse.test",
  clientA: "client-a@dnkhouse.test",
  clientB: "client-b@dnkhouse.test",
  pending: "pending@dnkhouse.test",
};

/** Client bypass RLS — chỉ dùng dựng/kiểm chứng dữ liệu, không dùng test policy. */
export function serviceClient(): SupabaseClient {
  return createClient(URL!, SERVICE!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client authenticated đúng như 1 khách gọi từ trình duyệt (chịu RLS). */
export async function signInAs(persona: Persona): Promise<SupabaseClient> {
  const client = createClient(URL!, ANON!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({
    email: EMAIL[persona],
    password: "portal-dev-123",
  });
  if (error) throw new Error(`Đăng nhập ${persona} thất bại: ${error.message}`);
  return client;
}
