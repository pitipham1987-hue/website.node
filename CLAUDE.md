# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# DNK House — Company Website

Website giới thiệu các **dịch vụ AI** của DNK House. Mục tiêu: trang landing/marketing
tối giản, hiện đại, chuyên nghiệp, truyền tải rõ ràng năng lực AI và giá trị công ty
mang lại cho khách hàng doanh nghiệp. Site gồm 2 phần tách biệt: landing page tĩnh
(`/`) và client portal đăng nhập (`/portal`).

Quy tắc chi tiết của dự án được tách theo chủ đề trong `.claude/rules/` (tự động nạp
theo spec rule của Claude Code — file không có `paths` luôn được nạp, file có `paths`
chỉ nạp khi làm việc trong thư mục tương ứng):

- [`commands-and-stack.md`](.claude/rules/commands-and-stack.md) — lệnh dev/build/test, tech stack
- [`architecture.md`](.claude/rules/architecture.md) — cấu trúc code landing page
- [`mandatory-ui-checks.md`](.claude/rules/mandatory-ui-checks.md) — quy tắc bắt buộc khi sửa UI (screenshot so sánh, responsive, animation)
- [`design-reference.md`](.claude/rules/design-reference.md) — những gì lấy/không lấy từ reference weav.com
- [`content-guidelines.md`](.claude/rules/content-guidelines.md) — nguyên tắc nội dung (DNK House ≠ weav.com), ngôn ngữ, content template
- [`visual-style.md`](.claude/rules/visual-style.md) — bảng màu, typography, spacing, bo góc, chuyển động
- [`site-structure.md`](.claude/rules/site-structure.md) — cấu trúc trang dự kiến
- [`conventions.md`](.claude/rules/conventions.md) — quy ước đặt tên file/component, ảnh, placeholder
- [`portal-architecture.md`](.claude/rules/portal-architecture.md) — kiến trúc client portal (route, 3 lớp bảo vệ, truy vấn)
- [`portal-env-security.md`](.claude/rules/portal-env-security.md) — biến môi trường portal, cảnh báo bảo mật `E2E_TEST_LOGIN`
- [`project-status.md`](.claude/rules/project-status.md) — trạng thái triển khai (Giai đoạn 1 xong; Giai đoạn 2 khu quản trị `/portal/admin` đã triển khai trên `main` — còn chạy test phụ thuộc Docker), bước tiếp theo, quyết định quan trọng
- [`karpathy-guidelines.md`](.claude/rules/karpathy-guidelines.md) — chuẩn hành vi viết code chung (đơn giản, thay đổi có chủ đích, tiêu chí thành công có thể kiểm chứng)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->