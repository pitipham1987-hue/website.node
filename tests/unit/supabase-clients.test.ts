import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} }),
}));

describe("Supabase client factories", () => {
  it("client trình duyệt tạo được instance có auth + from()", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon";
    const { createClient } = await import("@/lib/supabase/client");
    const c = createClient();
    expect(c.auth).toBeDefined();
    expect(typeof c.from).toBe("function");
  });

  it("client server tạo được instance (await) có auth", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon";
    const { createClient } = await import("@/lib/supabase/server");
    const c = await createClient();
    expect(c.auth).toBeDefined();
  });

  it("updateSession import được và là hàm", async () => {
    const mod = await import("@/lib/supabase/middleware");
    expect(typeof mod.updateSession).toBe("function");
  });
});
