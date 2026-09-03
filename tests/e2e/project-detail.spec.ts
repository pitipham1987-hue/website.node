import { expect, test } from "@playwright/test";
import { EMAILS, PROJECT_IDS, loginAs } from "./helpers";

test.describe("Chi tiết dự án (Slice 4)", () => {
  test("khách A mở dự án của mình: mốc đúng thứ tự + nhật ký mới nhất trên đầu", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.clientA);
    await page
      .getByRole("link", { name: /Chatbot CSKH cho Khách A/ })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/portal/${PROJECT_IDS.projectA}$`),
    );

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Chatbot CSKH cho Khách A",
      }),
    ).toBeVisible();

    const milestones = page
      .getByRole("list", { name: "Các mốc triển khai" })
      .getByRole("listitem");
    await expect(milestones).toHaveCount(4);
    await expect(milestones.nth(0)).toContainText(
      "Chốt yêu cầu & kịch bản hội thoại",
    );
    await expect(milestones.nth(0)).toContainText("đã hoàn thành");
    await expect(milestones.nth(0)).toContainText("Hoàn thành ngày");
    await expect(milestones.nth(3)).toContainText("Chạy thử & bàn giao");
    await expect(milestones.nth(3)).toContainText("chưa hoàn thành");

    const updates = page
      .getByRole("list", { name: "Nhật ký cập nhật" })
      .getByRole("listitem");
    await expect(updates.nth(0)).toContainText(
      "Bắt đầu tích hợp lên website, dự kiến 1 tuần.",
    );
    await expect(updates.nth(1)).toContainText(
      "Đã hoàn tất huấn luyện vòng 1",
    );
  });

  test("khách A sửa URL sang dự án khách B -> Không tìm thấy, không lộ tên dự án B", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.clientA);
    await page.goto(`/portal/${PROJECT_IDS.projectB}`);
    await expect(
      page.getByRole("heading", { name: "Không tìm thấy dự án" }),
    ).toBeVisible();
    await expect(
      page.getByText("Tự động hoá nhập liệu — Khách B"),
    ).toHaveCount(0);
  });

  test("id dự án hợp lệ nhưng không tồn tại -> Không tìm thấy", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.clientA);
    await page.goto("/portal/00000000-0000-0000-0000-000000000000");
    await expect(
      page.getByRole("heading", { name: "Không tìm thấy dự án" }),
    ).toBeVisible();
  });

  test("id dự án sai định dạng -> Không tìm thấy", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    await page.goto("/portal/khong-phai-uuid");
    await expect(
      page.getByRole("heading", { name: "Không tìm thấy dự án" }),
    ).toBeVisible();
  });

  test("khách B mở dự án của mình: thấy đúng dự án B", async ({ page }) => {
    await loginAs(page, EMAILS.clientB);
    await page.goto(`/portal/${PROJECT_IDS.projectB}`);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Tự động hoá nhập liệu — Khách B",
      }),
    ).toBeVisible();
    const milestones = page
      .getByRole("list", { name: "Các mốc triển khai" })
      .getByRole("listitem");
    await expect(milestones).toHaveCount(2);
    await expect(milestones.nth(0)).toContainText(
      "Khảo sát quy trình hiện tại",
    );
  });
});
