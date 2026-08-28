# Slice 4 — Chi tiết dự án (milestone + nhật ký cập nhật)

- **Ngày:** 2026-08-28
- **Trạng thái:** Đã duyệt thiết kế, chờ viết plan
- **Design doc gốc:** [2026-08-28-portal-dang-nhap-google-design.md](./2026-08-28-portal-dang-nhap-google-design.md)
  — mục 4.1 (route `/portal/[projectId]`), 4.5 (xử lý lỗi).
- **Slice trước:** [Slice 3](./2026-08-28-portal-slice-3-dashboard-danh-sach-du-an-design.md)
  — đã có danh sách dự án + `ProjectCard` link tới `/portal/[projectId]`.
- **Slice sau:** không (kết thúc Giai đoạn 1). Giai đoạn 2 = `/portal/admin`.

## Mục tiêu

Khách hàng mở một dự án của mình thấy: tên, `status_label`, checklist milestone (theo
thứ tự, đánh dấu hoàn thành), và nhật ký cập nhật (mới nhất trên đầu). Truy cập dự án
không thuộc quyền → trang "không tìm thấy" (không lộ dự án có tồn tại hay không).

## Phạm vi

### DAL

- `src/lib/portal/session.ts` — thêm `requireProjectAccess(projectId)`:
  - Gọi `requireClient()` trước (session hợp lệ, không `pending`).
  - Truy vấn dự án theo `projectId` bằng client server (RLS lọc). Không có kết quả →
    `notFound()`.
  - Trả dữ liệu dự án cơ bản để page dùng lại (tránh truy vấn 2 lần).

### Truy vấn

- `src/lib/portal/queries.ts` — `getProjectDetail(projectId)`:
  - `milestones` của dự án, sắp theo `position` asc.
  - `updates` của dự án, sắp theo `created_at` desc.
  - (Dự án cơ bản đã có từ `requireProjectAccess`; hàm này chỉ lấy con.)

### UI

- `src/app/portal/[projectId]/page.tsx` — Server Component:
  - `const project = await requireProjectAccess(params.projectId)`
  - `const { milestones, updates } = await getProjectDetail(project.id)`
  - Render: tiêu đề `project.name`, badge `status_label`, `summary`,
    `<MilestoneList items={milestones} />`, `<UpdatesFeed items={updates} />`.
  - Link quay lại `/portal`.
- `src/app/portal/error.tsx` — `"use client"`; bắt lỗi truy vấn bất ngờ trong `/portal*`,
  hiện thông báo chung tiếng Việt + nút thử lại. (Lưu ý: `notFound()` KHÔNG vào đây — nó
  render `not-found`; dùng `not-found.tsx` mặc định của App Router hoặc thêm
  `src/app/portal/not-found.tsx` nếu muốn thông điệp riêng.)
- `src/components/portal/MilestoneList.tsx` — Server Component; mỗi dòng: icon done/chưa
  + `title`; hiện `done_at` (ngày) nếu có.
- `src/components/portal/UpdatesFeed.tsx` — Server Component; mỗi mục: ngày `created_at`,
  `body` (plain text, giữ xuống dòng), `author_name`. Rỗng → "Chưa có cập nhật nào."

### Test

- `tests/e2e/project-detail.spec.ts` (Playwright) — kịch bản 2 của design doc gốc mục
  5.3: client đăng nhập rồi sửa URL sang `projectId` của client khác → trang "không tìm
  thấy". Thêm: client mở dự án của chính mình → thấy milestone + updates đúng.

### Tài liệu

- CLAUDE.md — thêm mục kiến trúc **"Portal (client portal)"**: tóm tắt route
  (`/login`, `/auth/callback`, `/portal`, `/portal/[projectId]`), hai lớp bảo vệ
  (`src/proxy.ts` + DAL `src/lib/portal/session.ts`), RLS là lớp cuối, client Supabase ở
  `src/lib/supabase/*`, dữ liệu nhập tay qua Supabase Studio (Giai đoạn 1).

## Ngoài phạm vi

- `/portal/admin` và toàn bộ Giai đoạn 2.
- Upload tài liệu, email thông báo, mời khách qua link.

## Xác minh hoàn thành

1. Toàn bộ `npm run test` + `npm run test:e2e` (`auth` + `dashboard` + `project-detail`) xanh.
2. Dev: client mở dự án của mình → thấy milestone (đúng thứ tự, đúng trạng thái) + nhật ký
   (mới nhất trên đầu); sửa URL sang dự án người khác → "không tìm thấy".
3. Responsive `/portal/[projectId]` ở 375 / 768 / 1440.
4. `npm run build` xanh; `npx tsc --noEmit` sạch; `npm run lint` sạch.
5. CLAUDE.md đã có mục Portal.
