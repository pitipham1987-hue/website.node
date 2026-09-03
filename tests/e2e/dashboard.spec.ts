import { expect, test } from "@playwright/test";
import { EMAILS, loginAs } from "./helpers";

test.describe("Dashboard danh sách dự án (Slice 3)", () => {
  test("khách A chỉ thấy dự án của mình", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    await expect(
      page.getByRole("heading", { name: "Chatbot CSKH cho Khách A" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Tự động hoá nhập liệu/ }),
    ).toHaveCount(0);
    await expect(page.getByText("2/4 · 50%")).toBeVisible();
  });

  test("khách B chỉ thấy dự án của mình", async ({ page }) => {
    await loginAs(page, EMAILS.clientB);
    await expect(
      page.getByRole("heading", { name: /Tự động hoá nhập liệu/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Chatbot CSKH cho Khách A" }),
    ).toHaveCount(0);
  });

  test("card có link tới trang chi tiết dự án", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    const link = page.getByRole("link", { name: /Chatbot CSKH cho Khách A/ });
    await expect(link).toHaveAttribute("href", /\/portal\/[0-9a-f-]+$/);
  });

  test("khách không có dự án -> thông báo trống", async ({ page }) => {
    await loginAs(page, EMAILS.clientC);
    await expect(
      page.getByText(
        "Chưa có dự án nào được liên kết với tài khoản của bạn",
      ),
    ).toBeVisible();
    await expect(page.locator('a[href^="/portal/"]')).toHaveCount(0);
  });

  test("user pending vẫn thấy màn chờ duyệt, không phải thông báo trống", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.pending);
    await expect(
      page.getByText("Tài khoản đang chờ DNK House duyệt"),
    ).toBeVisible();
    await expect(
      page.getByText("Chưa có dự án nào được liên kết"),
    ).toHaveCount(0);
  });
});
