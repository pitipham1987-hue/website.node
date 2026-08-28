# Thiết kế: Client Portal + đăng nhập Google (DNK House)

- **Ngày:** 2026-08-28
- **Trạng thái:** Đã duyệt thiết kế. Triển khai qua 4 spec slice riêng (xem mục 9).
- **Vai trò tài liệu này:** tham chiếu kiến trúc chung cho Giai đoạn 1 (auth + mô hình dữ liệu + dashboard khách hàng). 4 spec slice trong mục 9 là nguồn sự thật để viết plan. Giai đoạn 2 (admin UI) có spec riêng sau này.

## 1. Bối cảnh & mục tiêu

Dự án hiện tại là landing page tĩnh một trang (Next.js 16 App Router, React 19, Tailwind v4,
không backend, không API route, không database, deploy Vercel).

Yêu cầu: thêm **client portal** để khách hàng của DNK House đăng nhập bằng Google và xem
tiến độ dự án của họ. Việc này biến dự án từ site tĩnh thành ứng dụng full-stack.

### Quyết định phạm vi

Tính năng đầy đủ gồm 4 phần phụ thuộc nhau: (1) nền tảng auth, (2) mô hình dữ liệu + DB,
(3) dashboard khách hàng, (4) giao diện admin. Đây là **một tính năng mạch lạc**, triển khai
theo 2 giai đoạn:

- **Giai đoạn 1 (spec này):** phần 1 + 2 + 3. Dữ liệu dự án nhập tay qua Supabase Studio.
- **Giai đoạn 2 (sau):** phần 4 — trang `/portal/admin` thay thế thao tác thủ công.

### Tiêu chí thành công (Giai đoạn 1)

- Khách hàng đăng nhập bằng tài khoản Google bất kỳ.
- Người chưa được DNK House duyệt chỉ thấy màn hình "chờ duyệt".
- Khách đã duyệt thấy đúng và chỉ đúng dự án của mình: tên dự án, trạng thái tổng,
  checklist milestone, nhật ký cập nhật.
- Cô lập dữ liệu được đảm bảo ở tầng database (RLS), không chỉ ở tầng code.
- Landing page hiện tại không thay đổi hành vi (vẫn SSG ở `/`).

## 2. Kiến trúc & luồng xác thực

### 2.1 Tech stack bổ sung

| Hạng mục | Lựa chọn |
|----------|----------|
| Auth | Supabase Auth, Google provider |
| Database | Supabase Postgres + Row Level Security |
| Tích hợp Next | `@supabase/ssr` (quản lý session qua cookie), `@supabase/supabase-js` |
| Test | `vitest` (unit + integration), `@playwright/test` (E2E) |
| Supabase local | Supabase CLI + Docker (chạy test integration/E2E) |

Không thêm ORM. Truy vấn qua Supabase client. Không thêm thư viện quản lý session khác
(Supabase lo phần này).

### 2.2 Điều kiện tiên quyết (con người thực hiện, ngoài code)

1. Tạo Supabase project. Lấy 3 giá trị:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (chỉ dùng phía server: seed test, thao tác admin)
2. Tạo Google Cloud OAuth 2.0 Client ID. Dán **Authorized redirect URI** trỏ tới callback
   của Supabase (`https://<project>.supabase.co/auth/v1/callback`).
3. Trong Supabase Dashboard → Authentication → Providers → bật Google, điền Client ID +
   Secret.
4. Thêm biến môi trường vào `.env.local` (dev) và Vercel Project Settings (production).
5. Cài Supabase CLI + Docker Desktop trên máy dev (cho `supabase start`).

### 2.3 Luồng đăng nhập

1. `/login` hiển thị nút "Đăng nhập với Google". Click → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: <origin>/auth/callback } })`.
2. Google xác thực → redirect về `/auth/callback?code=...`.
3. `/auth/callback` (Route Handler) gọi `supabase.auth.exchangeCodeForSession(code)` →
   set cookie session → `redirect('/portal')`. Lỗi → `redirect('/login?error=auth')`.
4. Lần đầu đăng nhập: trigger Postgres `handle_new_user()` chèn 1 dòng `public.profiles`
   với `role = 'pending'`, copy `email` và `full_name` từ `auth.users`.
5. `/portal` (Server Component) đọc session + profile qua DAL:
   - `role = 'pending'` → render `PendingNotice`
   - `role = 'client'` hoặc `'admin'` → render danh sách dự án
   - Không có session → `redirect('/login')` (phòng khi proxy bị bỏ qua)

### 2.4 Hai lớp bảo vệ route + một lớp DB

**Lớp 1 — `proxy.ts`** (Next 16: middleware đổi tên thành Proxy, file `proxy.ts` ở gốc
`src/`, chạy Node.js runtime). Kiểm tra "lạc quan" chỉ đọc cookie:
- Path khớp `/portal` (và con) mà không có session → `NextResponse.redirect('/login')`
- Path `/login` mà có session → `redirect('/portal')`
- Mọi request: gọi helper `updateSession(request)` của `@supabase/ssr` để refresh cookie.
- `matcher` bỏ qua asset tĩnh, `_next`, favicon.

**Lớp 2 — DAL** `src/lib/portal/session.ts`:
- `getSessionProfile()` — bọc `React.cache`; đọc session Supabase phía server, join
  `profiles`; trả `{ userId, email, fullName, role }` hoặc `null`.
- `requireClient()` — gọi `getSessionProfile()`; `null` → `redirect('/login')`;
  `role = 'pending'` → không redirect, trả cờ để page render `PendingNotice`.
  (Chi tiết: trả `{ profile, status: 'ok' | 'pending' }`.)
- `requireProjectAccess(projectId)` — kiểm tra qua truy vấn (RLS tự lọc); không có
  quyền → `notFound()`.
- `requireAdmin()` — **dời sang Giai đoạn 2** (cùng `/portal/admin`). Giai đoạn 1 không
  có route/action nào cần, thêm sớm sẽ là code chết.

Mọi page trong `/portal` và mọi Server Action **phải** gọi hàm DAL tương ứng. **Không**
đặt auth check trong `layout.tsx` (layout không re-render khi điều hướng client-side).

**Lớp 3 — RLS** (xem mục 3): phòng thủ cuối cùng ở database.

### 2.5 Ảnh hưởng tới cấu trúc app hiện tại

- `src/app/page.tsx` (landing) + `src/app/layout.tsx` (root): **không đổi**. Root layout
  vẫn chỉ set `<html>`, font, `<body>` — không phụ thuộc auth, `/` vẫn SSG.
- Portal có `src/app/portal/layout.tsx` riêng (thanh trên: logo + tên người dùng +
  "Đăng xuất"; không dùng `Header`/`Footer` marketing).
- `/login` có giao diện riêng, style đồng bộ site (font Inter, token `bg-accent`,
  `rounded-full`, `bg-surface`).

## 3. Mô hình dữ liệu & phân quyền (RLS)

Tất cả bảng thuộc schema `public`. Bật RLS cho mọi bảng.

### 3.1 Bảng

**`profiles`**
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| `id` | `uuid` PK | = `auth.users.id`, FK `on delete cascade` |
| `email` | `text not null` | |
| `full_name` | `text` | nullable (Google có thể không trả) |
| `role` | `text not null default 'pending'` | CHECK in (`'pending'`, `'client'`, `'admin'`) |
| `created_at` | `timestamptz not null default now()` | |

**`projects`**
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| `id` | `uuid` PK `default gen_random_uuid()` | |
| `name` | `text not null` | |
| `status_label` | `text not null` | text tự do, vd "Đang triển khai" |
| `summary` | `text` | mô tả ngắn, nullable |
| `created_at` | `timestamptz not null default now()` | |
| `updated_at` | `timestamptz not null default now()` | trigger cập nhật khi UPDATE |

**`project_members`** (nhiều-nhiều khách ↔ dự án)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| `project_id` | `uuid` FK `projects` `on delete cascade` | |
| `profile_id` | `uuid` FK `profiles` `on delete cascade` | |
| PK | `(project_id, profile_id)` | |

**`milestones`**
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| `id` | `uuid` PK `default gen_random_uuid()` | |
| `project_id` | `uuid` FK `projects` `on delete cascade` | |
| `title` | `text not null` | |
| `position` | `int not null default 0` | thứ tự hiển thị |
| `done` | `boolean not null default false` | |
| `done_at` | `timestamptz` | nullable; set khi `done` chuyển true |
| `created_at` | `timestamptz not null default now()` | |

**`updates`** (nhật ký cập nhật)
| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| `id` | `uuid` PK `default gen_random_uuid()` | |
| `project_id` | `uuid` FK `projects` `on delete cascade` | |
| `body` | `text not null` | plain text, không markdown |
| `author_name` | `text not null` | tên người đăng (DNK House) |
| `created_at` | `timestamptz not null default now()` | sắp xếp giảm dần khi hiển thị |

### 3.2 Hàm hỗ trợ

`SECURITY DEFINER`, `search_path = public`, để tránh đệ quy RLS:

- `public.is_admin() returns boolean` — `exists (select 1 from profiles where id = auth.uid() and role = 'admin')`
- `public.is_project_member(pid uuid) returns boolean` — `exists (select 1 from project_members where project_id = pid and profile_id = auth.uid())`

### 3.3 Trigger

- `handle_new_user()` — `after insert on auth.users`: chèn `profiles (id, email, full_name, role)`
  với `role = 'pending'`, `full_name` lấy từ `new.raw_user_meta_data->>'full_name'` (hoặc
  `name`).
- `set_updated_at()` — `before update on projects`: `new.updated_at = now()`.
- `set_milestone_done_at()` — `before update on milestones`: nếu `new.done` và không
  `old.done` → `new.done_at = now()`; nếu `not new.done` → `new.done_at = null`.
- `prevent_role_self_change()` — `before update on profiles`: nếu `auth.uid() = old.id`
  và `not is_admin()` và `new.role <> old.role` → `raise exception`. (Chặn client tự
  nâng quyền.)

### 3.4 Chính sách RLS

| Bảng | SELECT | INSERT / UPDATE / DELETE |
|------|--------|--------------------------|
| `profiles` | `id = auth.uid()` OR `is_admin()` | UPDATE: `id = auth.uid()` OR `is_admin()` (cột `role` được trigger `prevent_role_self_change` bảo vệ). INSERT/DELETE: `is_admin()` (INSERT thường do trigger `handle_new_user` chạy quyền definer). |
| `projects` | `is_project_member(id)` OR `is_admin()` | chỉ `is_admin()` |
| `project_members` | `profile_id = auth.uid()` OR `is_admin()` | chỉ `is_admin()` |
| `milestones` | `is_project_member(project_id)` OR `is_admin()` | chỉ `is_admin()` |
| `updates` | `is_project_member(project_id)` OR `is_admin()` | chỉ `is_admin()` |

Hàm `is_admin()` vẫn được tạo và dùng trong policy ngay từ Giai đoạn 1 (để chặn ghi từ
token client). Chỉ helper DAL `requireAdmin()` phía Next là dời sang Giai đoạn 2.

**Hệ quả:** client A gọi Supabase bằng token của mình không bao giờ đọc/ghi được dữ liệu
dự án của client B — database từ chối, độc lập với bug ở tầng code.

### 3.5 Nhập liệu Giai đoạn 1 (thủ công qua Supabase Studio)

- Đặt `role = 'admin'` cho tài khoản nhân viên DNK House (làm 1 lần, trực tiếp trong DB).
- Duyệt khách mới: Table Editor → `profiles` lọc `role = 'pending'` → đổi thành `'client'`
  → thêm dòng `project_members` gán vào dự án.
- Tạo `projects`, `milestones`, `updates` bằng tay.

### 3.6 Migrations

- `supabase/migrations/*.sql` — schema, hàm, trigger, policy. Một hoặc vài file có thứ tự.
- `supabase/seed.sql` — dữ liệu mẫu cho dev/test local: 1 admin, 2 client, 2 dự án (mỗi
  client 1 dự án), vài milestone + update.

## 4. Giao diện (Giai đoạn 1)

### 4.1 Route & component

| Route | Loại | Nội dung |
|-------|------|----------|
| `/login` | Server Component + `LoginButton` (client) | Logo DNK House, tiêu đề ngắn, 1 nút "Đăng nhập với Google". Đã đăng nhập → `redirect('/portal')`. Query `?error=auth` → hiện thông báo lỗi tiếng Việt. |
| `/auth/callback` | Route Handler (`route.ts`) | `exchangeCodeForSession` → `redirect('/portal')`; lỗi → `redirect('/login?error=auth')`. |
| `/portal` | Server Component + `portal/layout.tsx` | Layout: thanh trên (logo, tên người dùng, nút "Đăng xuất"). Body theo `status` từ `requireClient()`: `pending` → `<PendingNotice />`; `ok` → danh sách `<ProjectCard />` (tên + `status_label` + % milestone hoàn thành). Không có dự án → thông báo trống lịch sự. |
| `/portal/[projectId]` | Server Component | `requireProjectAccess(projectId)` → không có quyền → `notFound()`. Hiển thị tên + `status_label` + `<MilestoneList />` (checklist done/chưa, theo `position`) + `<UpdatesFeed />` (mới nhất trên đầu: ngày + `body` + `author_name`). |

### 4.2 Component

- `src/components/portal/LoginButton.tsx` — `"use client"`, gọi `signInWithOAuth`.
- `src/components/portal/PendingNotice.tsx` — server; thông báo "Tài khoản đang chờ DNK House duyệt", gợi ý liên hệ.
- `src/components/portal/ProjectCard.tsx` — server; link tới `/portal/[projectId]`.
- `src/components/portal/MilestoneList.tsx` — server; render checklist.
- `src/components/portal/UpdatesFeed.tsx` — server; render danh sách cập nhật.
- Style dùng token Tailwind hiện có (`bg-surface`, `border-border`, `text-muted`,
  `bg-accent`, `rounded-2xl`/`rounded-full`). Không hardcode màu.

### 4.3 Truy vấn dữ liệu

`src/lib/portal/queries.ts` — server-only:
- `getProjectsForUser()` → danh sách dự án + đếm milestone done/tổng (cho % ).
- `getProjectDetail(projectId)` → dự án + milestones (sắp theo `position`) + updates
  (sắp `created_at` desc).

Client Supabase phía server: `src/lib/supabase/server.ts` (đọc cookie).
Client phía trình duyệt: `src/lib/supabase/client.ts`.
Helper cho proxy: `src/lib/supabase/middleware.ts` (`updateSession`).

### 4.4 Server Action

Giai đoạn 1 chỉ có `signOut()` (`src/lib/portal/actions.ts`, `"use server"`):
gọi `supabase.auth.signOut()` → `redirect('/login')`. Mọi thao tác ghi dữ liệu dự án
là thủ công qua Supabase Studio.

### 4.5 Xử lý lỗi

- Callback thất bại → `/login?error=auth` + thông báo tiếng Việt.
- Mất session giữa chừng → proxy đẩy về `/login`.
- Truy cập `projectId` không có quyền hoặc không tồn tại → `notFound()` (không phân biệt
  hai trường hợp, tránh lộ sự tồn tại của dự án).
- Lỗi truy vấn Supabase bất ngờ → `error.tsx` trong `/portal` hiển thị thông báo chung.

### 4.6 Ngôn ngữ

Toàn bộ portal tiếng Việt. Không i18n.

## 5. Kiểm thử

### 5.1 Vitest — unit

- Tính `%` milestone hoàn thành từ `{done, total}` (kể cả `total = 0`).
- Logic phân nhánh `requireClient` / `requireAdmin` / `requireProjectAccess` với DAL mock:
  `null` session, `role = 'pending'`, `role = 'client'`, `role = 'admin'`.
- Map `role` → màn hình (`pending` → notice, còn lại → dashboard).

### 5.2 Vitest — integration (Supabase local)

Chạy `supabase start`, áp migrations + `seed.sql`. Dùng client Supabase với token của
từng user seed:

- Client A `select` `projects` / `milestones` / `updates` của dự án B → kết quả rỗng.
- Client A `insert` / `update` / `delete` vào bất kỳ bảng nào → bị từ chối.
- User `pending` `select` bất kỳ bảng nghiệp vụ nào → rỗng.
- Client tự `update` `profiles.role` của mình thành `admin` → bị từ chối (trigger).
- Admin `select` mọi dự án → đầy đủ; admin `insert` `projects` → thành công.

### 5.3 Playwright — E2E

Seed user qua `SUPABASE_SERVICE_ROLE_KEY` (`auth.admin.createUser` + đặt session/cookie
trực tiếp, **không** gọi Google thật). Kịch bản:

1. Client đã duyệt đăng nhập → `/portal` hiển thị đúng dự án của mình, không thấy dự án khác.
2. Sửa URL sang `projectId` của client khác → trang "Không tìm thấy".
3. User `pending` → thấy màn hình "chờ duyệt", không thấy dữ liệu dự án.
4. Chưa đăng nhập, mở `/portal` hoặc `/portal/<id>` → bị chuyển về `/login`.
5. Nút "Đăng xuất" → về `/login`, mở lại `/portal` → bị chuyển về `/login`.

### 5.4 Scripts (cập nhật `package.json` + CLAUDE.md)

- `npm run test` → `vitest run`
- `npm run test:e2e` → `playwright test`
- Ghi chú trong CLAUDE.md: E2E/integration cần `supabase start` (Docker) chạy trước.

## 6. Ranh giới phạm vi

### Không làm ở Giai đoạn 1

- `/portal/admin` (CRUD dự án, milestone, update; gán khách; duyệt `pending`) → Giai đoạn 2.
- Upload / chia sẻ tài liệu.
- Email thông báo (khách mới chờ duyệt; có cập nhật mới).
- Giới hạn domain email; mời khách qua link.
- i18n cho portal.
- Đổi landing page.

### Giai đoạn 2 (spec + plan riêng)

Trang `/portal/admin` chỉ `role = 'admin'`:
- Form tạo/sửa/xoá `projects`, `milestones`, `updates`.
- Gán `project_members` theo email.
- Đổi `role` từ `pending` sang `client`.
- Thay thế toàn bộ thao tác thủ công qua Supabase Studio.

## 7. Danh sách file dự kiến (Giai đoạn 1)

```
src/
  proxy.ts                              # Next 16 middleware (Proxy)
  app/
    login/page.tsx
    auth/callback/route.ts
    portal/
      layout.tsx
      page.tsx
      [projectId]/page.tsx
      error.tsx
  lib/
    supabase/
      server.ts
      client.ts
      middleware.ts                     # updateSession cho proxy
    portal/
      session.ts                        # DAL: getSessionProfile, requireClient, requireProjectAccess (requireAdmin: Giai đoạn 2)
      queries.ts
      actions.ts                        # signOut
  components/portal/
    LoginButton.tsx
    PendingNotice.tsx
    ProjectCard.tsx
    MilestoneList.tsx
    UpdatesFeed.tsx
supabase/
  config.toml
  migrations/*.sql
  seed.sql
tests/
  unit/*.test.ts
  integration/rls.test.ts
  e2e/portal.spec.ts
.env.local.example                      # liệt kê biến môi trường cần thiết
```

Cập nhật: `package.json` (deps + scripts), `CLAUDE.md` (Commands + kiến trúc portal + biến
môi trường), `.gitignore` (hiện bỏ qua `.env*` — thêm dòng `!.env.local.example` để commit
được file mẫu; hoặc đặt tên `env.example` không có dấu chấm đầu).

## 8. Rủi ro & lưu ý

- **Next 16 khác bản cũ:** middleware là `proxy.ts`; `cookies()` là async; đọc
  `node_modules/next/dist/docs/` trước khi code (theo CLAUDE.md).
- **`@supabase/ssr` + App Router:** phần xử lý cookie trong Server Component vs Route
  Handler vs Proxy khác nhau — theo đúng guide chính thức của Supabase, không tự chế.
- **Test cần Docker:** máy dev/CI phải có Docker để chạy Supabase local. Nếu CI chưa có,
  plan cần thêm bước cấu hình.
- **Trigger trên `auth.users`:** cần quyền phù hợp; nếu Supabase hạn chế, fallback là
  tạo `profiles` từ callback bằng service role key (upsert khi chưa có).

## 9. Phân rã triển khai (slices)

Giai đoạn 1 chia thành **4 slice dọc, tuần tự** (1 → 2 → 3 → 4). Mỗi slice tự build, tự
test và ship được; không để lại code chết. Mỗi slice kết thúc bằng: `npm run build` +
`npx tsc --noEmit` + `npm run lint` sạch, và (từ slice 2) kiểm tra responsive ở
375 / 768 / 1440.

**Mỗi slice có spec riêng** (nguồn sự thật cho việc viết plan); tài liệu này là tham chiếu
kiến trúc chung mà 4 spec đó trỏ về.

| Slice | Spec | Kết quả khi xong |
|-------|------|------------------|
| 1 | [portal-slice-1-ha-tang-supabase-rls](./2026-08-28-portal-slice-1-ha-tang-supabase-rls-design.md) | Schema + RLS + client Supabase + test integration RLS. Chưa có route. |
| 2 | [portal-slice-2-dang-nhap-bao-ve-route](./2026-08-28-portal-slice-2-dang-nhap-bao-ve-route-design.md) | Đăng nhập/đăng xuất Google, proxy + DAL, màn hình `pending`. |
| 3 | [portal-slice-3-dashboard-danh-sach-du-an](./2026-08-28-portal-slice-3-dashboard-danh-sach-du-an-design.md) | `/portal` liệt kê dự án của khách + % milestone. |
| 4 | [portal-slice-4-chi-tiet-du-an](./2026-08-28-portal-slice-4-chi-tiet-du-an-design.md) | `/portal/[projectId]`: milestone checklist + nhật ký cập nhật. |

Mỗi slice đi qua chu kỳ spec → plan → thực thi riêng.
