# Slice 1 — Hạ tầng Supabase + schema + RLS

- **Ngày:** 2026-08-28
- **Trạng thái:** Đã duyệt thiết kế, chờ viết plan
- **Design doc gốc:** [2026-08-28-portal-dang-nhap-google-design.md](./2026-08-28-portal-dang-nhap-google-design.md)
  — đọc mục 1–3 và 8 để có bối cảnh, tech stack, mô hình dữ liệu, RLS đầy đủ.
- **Slice trước:** không. Đây là slice đầu tiên của Giai đoạn 1.
- **Slice sau:** Slice 2 (đăng nhập / bảo vệ route).

## Mục tiêu

Dựng toàn bộ nền dữ liệu cho portal: kết nối Supabase, schema, hàm, trigger, RLS, và bộ
test integration chứng minh RLS cô lập dữ liệu đúng. **Kết thúc slice này chưa có route
portal nào hoạt động** — chỉ hạ tầng + kiểm thử.

## Phạm vi

### Dependencies

- `dependencies`: `@supabase/supabase-js`, `@supabase/ssr`
- `devDependencies`: `vitest`, `@playwright/test`
  (Playwright cài ở đây để dùng từ Slice 2; slice này chưa viết E2E.)

### Biến môi trường & git

- Tạo `.env.local.example` liệt kê:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- `.gitignore`: thêm `!.env.local.example` sau nhóm `.env*` để commit được file mẫu.

### Supabase

- `supabase/config.toml` (khởi tạo qua `supabase init`).
- `supabase/migrations/*.sql` — theo design doc gốc:
  - 5 bảng: `profiles`, `projects`, `project_members`, `milestones`, `updates` (mục 3.1)
  - 2 hàm `SECURITY DEFINER`: `is_admin()`, `is_project_member(uuid)` (mục 3.2)
  - 4 trigger: `handle_new_user`, `set_updated_at`, `set_milestone_done_at`,
    `prevent_role_self_change` (mục 3.3)
  - Bật RLS + toàn bộ policy cho 5 bảng (mục 3.4)
- `supabase/seed.sql` — dữ liệu mẫu (mục 3.6): 1 admin, 2 client, 2 dự án (mỗi client 1
  dự án), vài milestone + update mỗi dự án.
  - Lưu ý: seed cần tạo cả bản ghi `auth.users` tương ứng (hoặc script seed dùng service
    role key). Plan xác định cách seed user cho môi trường local.

### Client Supabase (Next)

Theo đúng guide chính thức `@supabase/ssr` cho App Router — **không tự chế** phần xử lý
cookie (design doc gốc mục 8):

- `src/lib/supabase/server.ts` — `createServerClient` đọc/ghi cookie qua `next/headers`
  (`cookies()` là async ở Next 16).
- `src/lib/supabase/client.ts` — `createBrowserClient`.
- `src/lib/supabase/middleware.ts` — `updateSession(request)` cho `proxy.ts` (dùng ở
  Slice 2; tạo sẵn ở đây và có smoke test import được).

### Cấu hình test

- Cấu hình Vitest (`vitest.config.ts` hoặc mục trong config có sẵn); thư mục `tests/`.
- `package.json` scripts:
  - `test` → `vitest run`
  - `test:e2e` → `playwright test`
- `tests/integration/rls.test.ts` — chạy với Supabase local, phủ **toàn bộ** mục 5.2 của
  design doc gốc:
  - Client A không `select` được `projects` / `milestones` / `updates` của dự án B (rỗng).
  - Client A `insert` / `update` / `delete` mọi bảng → bị từ chối.
  - User `pending` `select` bảng nghiệp vụ → rỗng.
  - Client tự `update` `profiles.role` thành `admin` → bị từ chối (trigger
    `prevent_role_self_change`).
  - Admin `select` mọi dự án → đầy đủ; admin `insert` `projects` → thành công.
  - Kiểm tra `set_milestone_done_at`: set `done = true` → `done_at` được điền; set lại
    `false` → `done_at` về `null`.

### Tài liệu

- CLAUDE.md — mục **Commands**: thêm `npm run test`, `npm run test:e2e`, ghi chú
  "integration/E2E cần `supabase start` (Docker) chạy trước".
- CLAUDE.md — thêm danh sách biến môi trường Supabase (trỏ tới `.env.local.example`).

## Ngoài phạm vi (slice sau)

- Mọi route: `/login`, `/auth/callback`, `/portal*` → Slice 2–4.
- `src/proxy.ts` → Slice 2 (file helper `middleware.ts` tạo ở slice này nhưng chưa gắn).
- DAL `src/lib/portal/*` → Slice 2+.
- Test unit và E2E → Slice 2+.

## Xác minh hoàn thành

1. `supabase start` chạy được; migrations + seed áp thành công.
2. `npm run test` → `rls.test.ts` xanh toàn bộ.
3. `npm run build` xanh; `npx tsc --noEmit` sạch; `npm run lint` sạch.
4. Trang `/` (landing) không đổi hành vi — vẫn SSG, không phụ thuộc Supabase.
5. `git status` sạch phần không liên quan; `.env.local` **không** bị commit,
   `.env.local.example` **được** commit.
