---
paths:
  - "src/app/portal/**"
  - "src/app/login/**"
  - "src/app/auth/**"
  - "src/lib/portal/**"
  - "src/lib/supabase/**"
  - "src/proxy.ts"
---

# Portal (client portal)

Khu vực đăng nhập cho khách hàng DNK House xem tiến độ dự án. Tách biệt hoàn toàn
với landing `/` (vẫn SSG, không phụ thuộc Supabase).

- **Route:**
  - `/login` — nút "Đăng nhập với Google" (Supabase Auth OAuth).
  - `/auth/callback` — Route Handler đổi `code` lấy session.
  - `/portal` — danh sách dự án của khách; `role = 'pending'` → màn "chờ duyệt".
  - `/portal/[projectId]` — chi tiết 1 dự án: mốc triển khai + nhật ký cập nhật.
  - `/portal/admin` — khu quản trị (chỉ `admin`): CRUD dự án/mốc/nhật ký, duyệt
    khách `pending → client`, gán/gỡ `project_members`. `/auth/callback` redirect
    admin thẳng vào đây. Route con: `projects/new`, `projects/[id]`,
    `pending/[profileId]`.
- **Ba lớp bảo vệ:** (1) `src/proxy.ts` đọc cookie, redirect `/portal ↔ /login`
  (proxy chỉ biết cookie, KHÔNG biết `role`); (2) DAL `src/lib/portal/session.ts`
  (`requireClient`, `requireProjectAccess`, `requireAdmin`) gọi ở đầu **mỗi page**
  và đầu **mỗi Server Action admin** — KHÔNG đặt auth check trong `layout.tsx`;
  (3) RLS Postgres là phòng thủ cuối — client chỉ đọc được dự án mình là thành
  viên, mọi thao tác ghi chỉ `admin` (`is_admin()`).
- **Truy vấn:** `src/lib/portal/queries.ts` (khách) + `src/lib/portal/admin-queries.ts`
  (admin, `server-only`) — RLS tự lọc theo `auth.uid()`. Ghi (admin): Server Action
  trong `src/lib/portal/admin-actions.ts` (`"use server"`); validation thuần tách ra
  `admin-validation.ts` + `milestone-order.ts`. Client Supabase:
  `src/lib/supabase/{server,client,middleware}.ts` (`@supabase/ssr`).
- **`notFound()`** render `src/app/portal/not-found.tsx`; lỗi truy vấn bất ngờ
  render `src/app/portal/error.tsx` (hai boundary khác nhau).
- **Nhập liệu (Giai đoạn 2):** dự án / mốc / nhật ký / duyệt khách / gán thành viên
  đều làm trong khu quản trị `/portal/admin` (`role = 'admin'`). Bảo vệ bằng
  `requireAdmin()` (DAL `session.ts`) ở đầu mỗi page `/portal/admin/**` và đầu mỗi
  Server Action trong `src/lib/portal/admin-actions.ts` — RLS `is_admin()` là lớp
  cuối. Studio chỉ còn dùng cho thao tác hiếm: hạ role, xoá hẳn `profiles`.
- Toàn bộ portal tiếng Việt, không i18n. KHÔNG dùng `ScrollReveal` của landing
  (component đó thuộc riêng landing page, xem [[architecture]]).

Biến môi trường và cảnh báo bảo mật liên quan: xem [[portal-env-security]].
Trạng thái triển khai hiện tại: xem [[project-status]].
