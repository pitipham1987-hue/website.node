import type { Page } from "@playwright/test";

export const EMAILS = {
  clientA: "client-a@dnkhouse.test",
  pending: "pending@dnkhouse.test",
} as const;

/** Đăng nhập qua route test-login (bỏ qua Google). Kết thúc ở /portal. */
export async function loginAs(page: Page, email: string): Promise<void> {
  await page.goto(`/auth/test-login?email=${encodeURIComponent(email)}`);
  await page.waitForURL("**/portal");
}
