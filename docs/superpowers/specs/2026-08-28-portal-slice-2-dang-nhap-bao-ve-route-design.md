# Slice 2 — Vòng đăng nhập/đăng xuất + bảo vệ route

- **Ngày:** 2026-08-28
- **Trạng thái:** Đã duyệt thiết kế, chờ viết plan
- **Design doc gốc:** [2026-08-28-portal-dang-nhap-google-design.md](./2026-08-28-portal-dang-nhap-google-design.md)
  — đọc mục 2 (kiến trúc & luồng xác thực) và 4 (giao diện) cho chi tiết.
- **Slice trước:** [Slice 1](./2026-08-28-portal-slice-1-ha-tang-supabase-rls-design.md)
  — đã có schema, RLS, client Supabase (`src/lib/supabase/*`), Vitest + Playwright cài sẵn.
- **Slice sau:** Slice 3 (dashboard danh sách dự án).

## Mục tiêu

Người dùng đăng nhập bằng Google, có session, được phân luồng theo `role`. Route `/portal*`
được bảo vệ hai lớp (proxy + DAL). Người `pending` thấy màn hình chờ duyệt. Đăng xuất hoạt
động.

Kết thúc slice: `/portal` mới chỉ hiện lời chào + trạng thái pending — **danh sách dự án
đầy đủ ở Slice 3**.

## Điều kiện tiên quyết (con người, xem design doc gốc mục 2.2)

- Supabase project đã bật Google provider; Google Cloud OAuth client đã cấu hình.
- `.env.local` đã có 3 biến Supabase.

## Phạm vi

### Đăng nhập

- `src/app/login/page.tsx` — Server Component. Đã có session → `redirect('/portal')`.
  Query `?error=auth` → hiện thông báo lỗi tiếng Việt. Style đồng bộ site (Inter,
  `bg-accent`, `rounded-full`, `bg-surface`).
- `src/components/portal/LoginButton.tsx` — `"use client"`;
  `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: <origin>/auth/callback } })`.
- `src/app/auth/callback/route.ts` — Route Handler; `exchangeCodeForSession(code)` →
  `redirect('/portal')`; lỗi → `redirect('/login?error=auth')`.

### Bảo vệ route

- `src/proxy.ts` — Next 16 Proxy (Node.js runtime). Chỉ đọc cookie (kiểm tra lạc quan):
  - `/portal` và con, không session → `redirect('/login')`
  - `/login`, có session → `redirect('/portal')`
  - Mọi request: gọi `updateSession(request)` từ `src/lib/supabase/middleware.ts`
  - `matcher` bỏ `_next/*`, asset tĩnh, favicon
- `src/lib/portal/session.ts` (DAL):
  - `getSessionProfile()` — bọc `React.cache`; đọc session Supabase phía server, join
    `profiles`; trả `{ userId, email, fullName, role }` hoặc `null`.
  - `requireClient()` — `null` → `redirect('/login')`; ngược lại trả
    `{ profile, status: 'ok' | 'pending' }` (`pending` khi `role === 'pending'`).

### Portal shell

- `src/app/portal/layout.tsx` — Server Component. Thanh trên: logo + `fullName`/`email` +
  nút "Đăng xuất" (form gọi Server Action). Không dùng `Header`/`Footer` marketing.
  **Không** đặt auth check ở đây (design doc gốc mục 2.4).
- `src/app/portal/page.tsx` — tối giản: gọi `requireClient()`;
  `status === 'pending'` → `<PendingNotice />`; ngược lại → lời chào tạm
  ("Xin chào {tên}") + ghi chú danh sách dự án sắp có.
- `src/components/portal/PendingNotice.tsx` — Server Component; "Tài khoản đang chờ DNK
  House duyệt", gợi ý kênh liên hệ.

### Đăng xuất

- `src/lib/portal/actions.ts` — `"use server"`; `signOut()` gọi
  `supabase.auth.signOut()` → `redirect('/login')`.

### Test

- `tests/unit/session.test.ts` (Vitest) — mock DAL:
  - `requireClient`: `null` session, `role = 'pending'`, `role = 'client'`, `role = 'admin'`.
  - Map `role` → màn hình (`pending` → notice; còn lại → dashboard).
- `tests/e2e/auth.spec.ts` (Playwright) — seed user qua `SUPABASE_SERVICE_ROLE_KEY`, đặt
  session/cookie trực tiếp (không gọi Google thật). Phủ kịch bản 3, 4, 5 của design doc
  gốc mục 5.3:
  - User `pending` → màn hình chờ duyệt, không thấy dữ liệu dự án.
  - Chưa đăng nhập → mở `/portal` hoặc `/portal/<id>` → chuyển về `/login`.
  - "Đăng xuất" → về `/login`; mở lại `/portal` → chuyển về `/login`.

## Ngoài phạm vi (slice sau)

- `getProjectsForUser`, `ProjectCard`, danh sách dự án → Slice 3.
- `/portal/[projectId]`, `requireProjectAccess`, `MilestoneList`, `UpdatesFeed` → Slice 4.
- `requireAdmin`, `/portal/admin` → Giai đoạn 2.

## Xác minh hoàn thành

1. `npm run test` (unit + integration Slice 1) xanh; `npm run test:e2e` (`auth.spec.ts`) xanh.
2. Đăng nhập Google thật ở dev 1 lần: lần đầu → `pending` → thấy `PendingNotice`; sau khi
   sửa `role = 'client'` trong Supabase Studio → thấy lời chào.
3. Responsive `/login` và `/portal` ở 375 / 768 / 1440.
4. `npm run build` xanh; `npx tsc --noEmit` sạch; `npm run lint` sạch.
5. Trang `/` không đổi.
