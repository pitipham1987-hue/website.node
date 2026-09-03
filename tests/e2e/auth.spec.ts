import { expect, test } from "@playwright/test";
import { EMAILS, loginAs } from "./helpers";

test.describe("Auth + bảo vệ route (Slice 2)", () => {
  test("chưa đăng nhập: /portal -> chuyển về /login", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("button", { name: "Đăng nhập với Google" }),
    ).toBeVisible();
  });

  test("chưa đăng nhập: /portal/<id> -> chuyển về /login", async ({ page }) => {
    await page.goto("/portal/aaaaaaaa-0000-0000-0000-000000000001");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("user pending: thấy màn chờ duyệt, không thấy dữ liệu dự án", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.pending);
    await expect(
      page.getByText("Tài khoản đang chờ DNK House duyệt"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: /^Dự án của/ }),
    ).toHaveCount(0);
  });

  test("đăng xuất: về /login và không vào lại /portal được", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    await expect(
      page.getByRole("heading", { level: 1, name: /^Dự án của/ }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Đăng xuất" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("đã đăng nhập: mở /login -> chuyển về /portal", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/portal$/);
  });
});
