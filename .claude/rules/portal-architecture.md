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
- **Ba lớp bảo vệ:** (1) `src/proxy.ts` đọc cookie, redirect `/portal ↔ /login`;
  (2) DAL `src/lib/portal/session.ts` (`requireClient`, `requireProjectAccess`)
  gọi ở đầu **mỗi page** — KHÔNG đặt auth check trong `layout.tsx`;
  (3) RLS Postgres là phòng thủ cuối — client chỉ đọc được dự án mình là thành
  viên, mọi thao tác ghi chỉ `admin`.
- **Truy vấn:** `src/lib/portal/queries.ts` — server-only, RLS tự lọc theo
  `auth.uid()`. Client Supabase: `src/lib/supabase/{server,client,middleware}.ts`
  (`@supabase/ssr`).
- **`notFound()`** render `src/app/portal/not-found.tsx`; lỗi truy vấn bất ngờ
  render `src/app/portal/error.tsx` (hai boundary khác nhau).
- **Nhập liệu (Giai đoạn 1):** dự án / mốc / cập nhật nhập tay qua Supabase
  Studio; duyệt khách = đổi `profiles.role` `pending → client` + thêm dòng
  `project_members`. Trang admin (`/portal/admin`) là Giai đoạn 2.
- Toàn bộ portal tiếng Việt, không i18n. KHÔNG dùng `ScrollReveal` của landing
  (component đó thuộc riêng landing page, xem [[architecture]]).

Biến môi trường và cảnh báo bảo mật liên quan: xem [[portal-env-security]].
Trạng thái triển khai hiện tại: xem [[project-status]].
