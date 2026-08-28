# Slice 3 — Dashboard danh sách dự án

- **Ngày:** 2026-08-28
- **Trạng thái:** Đã duyệt thiết kế, chờ viết plan
- **Design doc gốc:** [2026-08-28-portal-dang-nhap-google-design.md](./2026-08-28-portal-dang-nhap-google-design.md)
  — mục 4.1–4.3 (route, component, truy vấn).
- **Slice trước:** [Slice 2](./2026-08-28-portal-slice-2-dang-nhap-bao-ve-route-design.md)
  — đã có auth, `requireClient()`, `/portal` shell + trạng thái pending.
- **Slice sau:** Slice 4 (chi tiết dự án).

## Mục tiêu

Khách hàng đã duyệt vào `/portal` thấy danh sách dự án của mình, mỗi dự án hiện tên,
`status_label`, và % milestone hoàn thành. Không có dự án → thông báo trống lịch sự.

## Phạm vi

### Logic thuần

- `src/lib/portal/progress.ts` — hàm thuần `milestoneProgress({ done, total })` trả phần
  trăm nguyên; `total = 0` → `0`. Tách riêng để test không cần DB.

### Truy vấn

- `src/lib/portal/queries.ts` — `getProjectsForUser()`:
  - Dùng client Supabase phía server (RLS tự lọc theo `auth.uid()`).
  - Trả mỗi dự án: `id`, `name`, `status_label`, `summary`, số milestone `done` và `total`.
  - Sắp xếp: `updated_at` desc (mới cập nhật lên đầu).

### UI

- `src/app/portal/page.tsx` — thay phần "lời chào tạm" của Slice 2 bằng:
  - `status === 'pending'` → `<PendingNotice />` (giữ nguyên)
  - `status === 'ok'` → gọi `getProjectsForUser()`:
    - Có dự án → lưới/danh sách `<ProjectCard />`
    - Rỗng → thông báo trống ("Chưa có dự án nào được liên kết với tài khoản của bạn…").
- `src/components/portal/ProjectCard.tsx` — Server Component; hiện `name`,
  `status_label` (dạng badge), `summary` (nếu có), thanh/nhãn % từ `milestoneProgress`.
  Bọc trong `<Link href={`/portal/${id}`}>`. Style dùng token (`bg-surface`,
  `border-border`, `rounded-2xl`, `text-muted`, `bg-accent`).

### Test

- `tests/unit/progress.test.ts` (Vitest) — `milestoneProgress`: `0/0`, `0/3`, `2/4`,
  `3/3`, làm tròn.
- `tests/e2e/dashboard.spec.ts` (Playwright) — kịch bản 1 của design doc gốc mục 5.3:
  client đã duyệt đăng nhập → thấy đúng dự án của mình, **không** thấy dự án của client
  khác. Thêm: client không có dự án → thấy thông báo trống.

## Ngoài phạm vi (slice sau)

- `/portal/[projectId]`, `getProjectDetail`, `requireProjectAccess`, `MilestoneList`,
  `UpdatesFeed`, `error.tsx` → Slice 4.

## Xác minh hoàn thành

1. `npm run test` (unit + integration) xanh; `npm run test:e2e` (`auth` + `dashboard`) xanh.
2. Dev: đăng nhập client có ≥1 dự án → thấy card đúng; client 0 dự án → thấy thông báo trống.
3. Responsive `/portal` (danh sách) ở 375 / 768 / 1440.
4. `npm run build` xanh; `npx tsc --noEmit` sạch; `npm run lint` sạch.
