import { expect, test } from "@playwright/test";
import { EMAILS, loginAs } from "./helpers";

test.describe("Khu quản trị /portal/admin (Giai đoạn 2)", () => {
  test("vòng đời dự án: tạo -> mốc -> đổi thứ tự -> đánh dấu xong -> sửa tiêu đề -> đăng nhật ký", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.admin);
    await page.goto("/portal/admin");

    await page.getByRole("link", { name: "Tạo dự án" }).click();
    await expect(page).toHaveURL(/\/portal\/admin\/projects\/new$/);

    const stamp = Date.now();
    const projectName = `E2E Dự án ${stamp}`;
    await page.getByLabel("Tên dự án").fill(projectName);
    await page.getByLabel(/Trạng thái/).fill("Đang triển khai");
    await page.getByRole("button", { name: "Tạo dự án" }).click();

    await expect(page).toHaveURL(
      /\/portal\/admin\/projects\/[0-9a-f-]{36}$/,
    );
    await expect(
      page.getByRole("heading", { level: 1, name: projectName }),
    ).toBeVisible();

    // Thêm 2 mốc.
    const addMilestone = page.getByPlaceholder("Tên mốc mới");
    await addMilestone.fill("Mốc Alpha");
    await page.getByRole("button", { name: "Thêm mốc" }).click();
    await expect(page.getByText("Mốc Alpha")).toBeVisible();
    await addMilestone.fill("Mốc Beta");
    await page.getByRole("button", { name: "Thêm mốc" }).click();
    await expect(page.getByText("Mốc Beta")).toBeVisible();

    const milestones = page.locator("ol > li").filter({ hasText: /Mốc / });
    await expect(milestones.nth(0)).toContainText("Mốc Alpha");

    // Đưa dòng 1 xuống dưới.
    await milestones
      .nth(0)
      .getByRole("button", { name: "Đưa xuống dưới" })
      .click();
    await expect(
      page.locator("ol > li").filter({ hasText: /Mốc / }).nth(0),
    ).toContainText("Mốc Beta");

    // Đánh dấu 1 mốc xong.
    await page
      .locator("ol > li")
      .filter({ hasText: "Mốc Beta" })
      .getByRole("button", { name: "Đánh dấu hoàn thành" })
      .click();
    await expect(
      page.locator("ol > li").filter({ hasText: "Mốc Beta" }),
    ).toContainText("Hoàn thành ngày");

    // Sửa tiêu đề mốc inline.
    await page.getByText("Mốc Alpha").click();
    const editInput = page.getByRole("textbox").filter({ hasText: "" }).last();
    await editInput.fill("Mốc Alpha (đã sửa)");
    await page.getByRole("button", { name: "Lưu" }).first().click();
    await expect(page.getByText("Mốc Alpha (đã sửa)")).toBeVisible();

    // Đăng 1 nhật ký.
    await page.getByLabel("Nội dung cập nhật").fill("Cập nhật E2E đầu tiên.");
    await page.getByRole("button", { name: "Đăng" }).click();
    await expect(page.getByText("Cập nhật E2E đầu tiên.")).toBeVisible();
  });

  test("duyệt & gán khách -> khách thấy dự án", async ({ page }) => {
    // Admin tạo 1 dự án riêng cho kịch bản này.
    await loginAs(page, EMAILS.admin);
    await page.goto("/portal/admin/projects/new");
    const projectName = `E2E Gán ${Date.now()}`;
    await page.getByLabel("Tên dự án").fill(projectName);
    await page.getByLabel(/Trạng thái/).fill("Khảo sát");
    await page.getByRole("button", { name: "Tạo dự án" }).click();
    await expect(page).toHaveURL(/\/portal\/admin\/projects\/[0-9a-f-]{36}$/);

    // Duyệt khách pending, gán vào dự án vừa tạo.
    await page.goto("/portal/admin");
    await page
      .getByRole("link", { name: "Duyệt & gán dự án" })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Duyệt khách" }),
    ).toBeVisible();
    await page.getByRole("checkbox", { name: projectName }).check();
    await page.getByRole("button", { name: "Duyệt khách" }).click();
    await expect(page).toHaveURL(/\/portal\/admin$/);

    // Đăng nhập lại bằng chính khách đó.
    await loginAs(page, EMAILS.pending);
    await expect(
      page.getByRole("heading", { name: projectName }),
    ).toBeVisible();
    await page.getByRole("link", { name: new RegExp(projectName) }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: projectName }),
    ).toBeVisible();
  });

  test("non-admin mở /portal/admin -> bị đẩy về /portal", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    await page.goto("/portal/admin");
    await expect(page).toHaveURL(/\/portal$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /^Dự án của/ }),
    ).toBeVisible();
  });
});
