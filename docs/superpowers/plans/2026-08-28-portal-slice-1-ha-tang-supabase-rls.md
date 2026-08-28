# Kế Hoạch Triển Khai — Slice 1: Hạ tầng Supabase + schema + RLS

> **Dành cho agent thực thi:** SUB-SKILL BẮT BUỘC: Sử dụng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans để triển khai kế hoạch này theo từng nhiệm vụ. Các bước sử dụng cú pháp ô tích (`- [ ]`) để theo dõi.

**Mục tiêu:** Dựng toàn bộ nền dữ liệu cho client portal (kết nối Supabase, 5 bảng, 2 hàm helper, 4 trigger, RLS đầy đủ, client Supabase cho Next) và bộ test integration chứng minh RLS cô lập dữ liệu đúng. Kết thúc slice **chưa có route portal nào** — chỉ hạ tầng + kiểm thử.

**Kiến trúc:** Supabase Postgres + Row Level Security là nguồn sự thật về phân quyền. Next đọc/ghi session qua cookie bằng `@supabase/ssr` (3 factory: server / browser / proxy-helper) — không tự chế xử lý cookie. Test integration chạy trên Supabase local (Docker), dùng client authenticated bằng mật khẩu của từng user seed để xác minh policy.

**Công nghệ sử dụng (Tech Stack):**
- Next.js **16.3.1** (App Router, React 19.2), TypeScript strict, path alias `@/* → src/*`
- `@supabase/supabase-js`, `@supabase/ssr` (dependencies)
- `vitest` + `vite-tsconfig-paths` (devDependencies) — unit + integration
- `@playwright/test` (devDependency) — cài sẵn để Slice 2 dùng, slice này chưa viết E2E
- Supabase CLI (qua `npx supabase`, đã có bản 2.116.0) + Docker Desktop (đã có 29.7.2)

## Hạn Chế Toàn Cục (Global Constraints)

- Next.js phiên bản chính xác `16.3.1` — KHÔNG nâng/hạ. Đọc `node_modules/next/dist/docs/` trước khi dùng API Next mới. Middleware ở Next 16 là **Proxy** (`src/proxy.ts`), `cookies()` là **async**.
- Tailwind v4, không có `tailwind.config.*`. Token màu chỉ khai báo trong `src/app/globals.css` (`--background`, `--surface`, `--foreground`, `--muted`, `--accent`, `--accent-foreground`, `--border`). KHÔNG hardcode hex trong component. (Slice 1 gần như không đụng UI.)
- Nội dung tiếng Việt, có dấu đầy đủ. Không i18n.
- Landing page `/` phải **giữ nguyên hành vi** — vẫn SSG, không phụ thuộc Supabase. `src/app/page.tsx` và `src/app/layout.tsx` KHÔNG được sửa trong slice này.
- Không thêm ORM. Không thêm thư viện quản lý session khác ngoài `@supabase/ssr`.
- Tất cả bảng thuộc schema `public`, **bật RLS cho mọi bảng**.
- Hàm helper RLS phải `SECURITY DEFINER` + `set search_path = public` (tránh đệ quy RLS + chèn schema).
- Bảng/cột/role giữ đúng tên trong design doc gốc mục 3: role ∈ (`'pending'`, `'client'`, `'admin'`), mặc định `'pending'`.
- `.env.local` **không bao giờ** được commit. `.env.local.example` **phải** được commit.
- Mỗi nhiệm vụ kết thúc: `git commit`. Cuối slice: `npm run build` + `npx tsc --noEmit` + `npm run lint` đều sạch.
- Design doc gốc: `docs/superpowers/specs/2026-08-28-portal-dang-nhap-google-design.md` (đọc mục 1–3, 8). Spec slice: `docs/superpowers/specs/2026-08-28-portal-slice-1-ha-tang-supabase-rls-design.md`.

---

## Cấu Trúc File

**Tạo mới:**
| File | Trách nhiệm |
|------|-------------|
| `.env.local.example` | Liệt kê 3 biến môi trường Supabase cần thiết (không giá trị thật) |
| `supabase/config.toml` | Cấu hình Supabase local (sinh ra bởi `supabase init`, chỉnh `project_id`) |
| `supabase/migrations/20260828000001_portal_schema.sql` | 5 bảng + index + comment |
| `supabase/migrations/20260828000002_portal_functions_triggers.sql` | 2 hàm helper + 4 hàm trigger + gắn trigger |
| `supabase/migrations/20260828000003_portal_rls.sql` | `enable row level security` + toàn bộ policy 5 bảng |
| `supabase/seed.sql` | 4 user (`auth.users` + `auth.identities`) + set role + 2 dự án + members + milestones + updates |
| `src/lib/supabase/database.types.ts` | Type `Database` sinh từ `supabase gen types` (dùng cho client typed) |
| `src/lib/supabase/server.ts` | `createClient()` async — Supabase client phía server, cookie qua `next/headers` |
| `src/lib/supabase/client.ts` | `createClient()` — Supabase client phía trình duyệt |
| `src/lib/supabase/middleware.ts` | `updateSession(request)` — refresh cookie session cho `proxy.ts` (Slice 2 gắn vào) |
| `vitest.config.ts` | Cấu hình Vitest: môi trường node, alias `@/`, include `tests/**` |
| `tests/helpers/supabase.ts` | Helper tạo client anon/service, đăng nhập theo persona, hằng số local |
| `tests/integration/rls.test.ts` | Toàn bộ kịch bản RLS mục 5.2 design doc gốc + kiểm tra trigger `set_milestone_done_at` |
| `tests/unit/supabase-clients.test.ts` | Smoke test 3 factory client import + tạo được |

**Chỉnh sửa:**
| File | Thay đổi |
|------|----------|
| `package.json` | Thêm deps + devDeps + scripts `test`, `test:watch`, `test:e2e` |
| `.gitignore` | Thêm `!.env.local.example` sau nhóm `.env*`; thêm `/supabase/.branches`, `/supabase/.temp` |
| `CLAUDE.md` | Mục Commands: `npm run test`, `npm run test:e2e` + ghi chú Docker; thêm mục biến môi trường Supabase |

---

## Task 1: Cài dependencies + scripts + `.gitignore` + file env mẫu

**Files:**
- Chỉnh sửa: `package.json`
- Chỉnh sửa: `.gitignore`
- Tạo mới: `.env.local.example`

**Interfaces:**
- Cung cấp: các package `@supabase/supabase-js`, `@supabase/ssr` (runtime); `vitest`, `vite-tsconfig-paths`, `@playwright/test` (dev). Scripts `npm run test` → chạy Vitest 1 lần, `npm run test:e2e` → `playwright test`.

- [ ] **Bước 1: Cài runtime dependencies**

Chạy tại gốc worktree `D:\AIAGENT\HỌC TẬP\WEBSITE_AI\.claude\worktrees\google-login`:

```bash
npm install @supabase/supabase-js@^2 @supabase/ssr@^0.7
```

Kỳ vọng: `package.json` `dependencies` có `@supabase/supabase-js` và `@supabase/ssr`. Nếu `@supabase/ssr@^0.7` không resolve, dùng `@supabase/ssr@latest` và ghi phiên bản thực tế vào commit message.

- [ ] **Bước 2: Cài dev dependencies**

```bash
npm install -D vitest@^3 vite-tsconfig-paths@^5 @playwright/test@^1
```

- [ ] **Bước 3: Thêm scripts vào `package.json`**

Sửa khối `"scripts"` thành:

```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
```

(Script `test` sẽ được sửa lại để nạp `.env.local` ở Task 6 Bước 3.)

- [ ] **Bước 4: Sửa `.gitignore`**

Tìm dòng `.env*` (trong nhóm `# env files`). Ngay sau nó thêm dòng:

```
!.env.local.example
```

Ở cuối file thêm khối:

```
# supabase
/supabase/.branches
/supabase/.temp
```

- [ ] **Bước 5: Tạo `.env.local.example`**

```bash
# Supabase — client portal (Giai đoạn 1)
# Giá trị dev local: chạy `npx supabase start` rồi copy từ output (hoặc `npx supabase status`).
# Giá trị production: lấy từ Supabase Dashboard -> Project Settings -> API, và điền vào Vercel.

# URL project Supabase (local mặc định: http://127.0.0.1:54321)
NEXT_PUBLIC_SUPABASE_URL=

# Anon / publishable key — an toàn để lộ ra client (RLS bảo vệ dữ liệu)
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Service role key — CHỈ dùng phía server (seed test, thao tác admin). KHÔNG bao giờ để lộ ra client.
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Bước 6: Xác minh `.env.local.example` được git theo dõi, `.env.local` thì không**

```bash
printf 'x=1\n' > .env.local
git check-ignore -v .env.local
git check-ignore -v .env.local.example; echo "exit=$?"
rm .env.local
```

Kỳ vọng: `.env.local` bị ignore (in ra dòng match); `.env.local.example` KHÔNG bị ignore (`exit=1`, không in gì).

- [ ] **Bước 7: Verify typecheck + build vẫn xanh**

```bash
npx tsc --noEmit; echo "tsc=$?"
npm run build
```

Kỳ vọng: `tsc=0`; build thành công (chưa có code mới dùng package).

- [ ] **Bước 8: Commit**

```bash
git add package.json package-lock.json .gitignore .env.local.example
git commit -m "chore(portal): thêm deps Supabase + test, script test, file env mẫu"
```

---

## Task 2: Khởi tạo Supabase local + migration schema (5 bảng)

**Files:**
- Tạo mới: `supabase/config.toml` (qua `supabase init`)
- Tạo mới: `supabase/migrations/20260828000001_portal_schema.sql`

**Interfaces:**
- Cung cấp: 5 bảng `public.profiles`, `public.projects`, `public.project_members`, `public.milestones`, `public.updates` với cột đúng theo design doc gốc mục 3.1.

- [ ] **Bước 1: Khởi tạo Supabase**

```bash
npx supabase init
```

Khi hỏi về VS Code settings / IntelliJ / Deno → chọn **No**. Kỳ vọng: tạo `supabase/config.toml` và `supabase/.gitignore`.

- [ ] **Bước 2: Đặt `project_id` trong `supabase/config.toml`**

Mở `supabase/config.toml`, sửa dòng `project_id` thành:

```toml
project_id = "dnkhouse-portal"
```

Giữ nguyên phần còn lại (cổng mặc định `[api] port = 54321`, `[db] port = 54322`, `[studio] port = 54323`).

- [ ] **Bước 3: Tạo file migration schema**

Tạo `supabase/migrations/20260828000001_portal_schema.sql`:

```sql
-- Slice 1 — Client portal: schema (5 bảng)
-- Tham chiếu: design doc gốc mục 3.1

-- profiles: 1 dòng / user, id = auth.users.id
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'pending' check (role in ('pending', 'client', 'admin')),
  created_at timestamptz not null default now()
);
comment on table public.profiles is 'Hồ sơ khách hàng portal; role quyết định quyền truy cập.';

-- projects: dự án của DNK House cho khách
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status_label text not null,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on column public.projects.status_label is 'Text tự do, vd "Đang triển khai".';

-- project_members: nhiều-nhiều khách <-> dự án
create table public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (project_id, profile_id)
);

-- milestones: cột mốc trong 1 dự án
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  position int not null default 0,
  done boolean not null default false,
  done_at timestamptz,
  created_at timestamptz not null default now()
);

-- updates: nhật ký cập nhật của 1 dự án
create table public.updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  body text not null,
  author_name text not null,
  created_at timestamptz not null default now()
);

-- Index cho các cột lọc/join thường dùng
create index project_members_profile_id_idx on public.project_members (profile_id);
create index milestones_project_id_idx on public.milestones (project_id);
create index updates_project_id_idx on public.updates (project_id);
```

- [ ] **Bước 4: Khởi động Supabase local + áp migration**

```bash
npx supabase start
```

Lần đầu sẽ kéo Docker image (vài phút). Kỳ vọng: in ra `API URL`, `anon key`, `service_role key`, `DB URL`, `Studio URL`.

```bash
npx supabase migration up
```

Kỳ vọng: migration `20260828000001` áp thành công, không lỗi.

- [ ] **Bước 5: Xác minh không có drift**

```bash
npx supabase db diff --schema public
```

Kỳ vọng: output rỗng. Nếu có diff → sửa migration cho khớp rồi `npx supabase db reset`.

- [ ] **Bước 6: Điền `.env.local` từ output `supabase status`**

```bash
npx supabase status
```

Tạo `.env.local` (KHÔNG commit) với 3 giá trị:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key từ supabase status>
SUPABASE_SERVICE_ROLE_KEY=<service_role key từ supabase status>
```

- [ ] **Bước 7: Commit**

```bash
git add supabase/config.toml supabase/.gitignore supabase/migrations/20260828000001_portal_schema.sql
git commit -m "feat(portal): schema Supabase — 5 bảng profiles/projects/members/milestones/updates"
```

---

## Task 3: Migration — hàm helper + trigger

**Files:**
- Tạo mới: `supabase/migrations/20260828000002_portal_functions_triggers.sql`

**Interfaces:**
- Consumes: 5 bảng từ Task 2.
- Cung cấp:
  - `public.is_admin() returns boolean` — true nếu `auth.uid()` có `role = 'admin'`.
  - `public.is_project_member(pid uuid) returns boolean` — true nếu `auth.uid()` là thành viên dự án `pid`.
  - Trigger: `on_auth_user_created` (after insert `auth.users` → `handle_new_user`), `projects_set_updated_at`, `milestones_set_done_at`, `profiles_prevent_role_self_change`.

- [ ] **Bước 1: Tạo file migration**

Tạo `supabase/migrations/20260828000002_portal_functions_triggers.sql`:

```sql
-- Slice 1 — Client portal: hàm helper RLS + trigger
-- Tham chiếu: design doc gốc mục 3.2, 3.3

-- ============ Hàm helper (SECURITY DEFINER để tránh đệ quy RLS) ============

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_project_member(pid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.project_members
    where project_id = pid and profile_id = auth.uid()
  );
$$;

-- ============ Trigger: tạo profile khi có user mới ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    'pending'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ Trigger: projects.updated_at ============

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ============ Trigger: milestones.done_at theo done ============

create or replace function public.set_milestone_done_at()
returns trigger
language plpgsql
as $$
begin
  if new.done and not old.done then
    new.done_at = now();
  elsif not new.done then
    new.done_at = null;
  end if;
  return new;
end;
$$;

create trigger milestones_set_done_at
  before update on public.milestones
  for each row execute function public.set_milestone_done_at();

-- ============ Trigger: chặn client tự đổi role ============

create or replace function public.prevent_role_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id
     and not public.is_admin()
     and new.role is distinct from old.role then
    raise exception 'Không được tự thay đổi vai trò tài khoản';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_self_change
  before update on public.profiles
  for each row execute function public.prevent_role_self_change();
```

- [ ] **Bước 2: Áp migration**

```bash
npx supabase migration up
```

Kỳ vọng: `20260828000002` áp thành công.

- [ ] **Bước 3: Xác minh không drift**

```bash
npx supabase db diff --schema public
```

Kỳ vọng: output rỗng. (Test hành vi thực của trigger nằm ở Task 6.)

- [ ] **Bước 4: Commit**

```bash
git add supabase/migrations/20260828000002_portal_functions_triggers.sql
git commit -m "feat(portal): hàm is_admin/is_project_member + 4 trigger (profile, updated_at, done_at, chặn đổi role)"
```

---

## Task 4: Migration — RLS policy cho 5 bảng

**Files:**
- Tạo mới: `supabase/migrations/20260828000003_portal_rls.sql`

**Interfaces:**
- Consumes: 5 bảng (Task 2), `is_admin()`, `is_project_member()` (Task 3).
- Cung cấp: RLS bật + policy đúng bảng mục 3.4 design doc gốc.

- [ ] **Bước 1: Tạo file migration**

Tạo `supabase/migrations/20260828000003_portal_rls.sql`:

```sql
-- Slice 1 — Client portal: Row Level Security
-- Tham chiếu: design doc gốc mục 3.4
-- Quy ước: SELECT mở cho thành viên/chủ sở hữu + admin; mọi ghi dữ liệu dự án chỉ admin.

alter table public.profiles        enable row level security;
alter table public.projects        enable row level security;
alter table public.project_members enable row level security;
alter table public.milestones      enable row level security;
alter table public.updates         enable row level security;

-- ============ profiles ============
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy profiles_insert on public.profiles
  for insert with check (public.is_admin());

create policy profiles_delete on public.profiles
  for delete using (public.is_admin());

-- ============ projects ============
create policy projects_select on public.projects
  for select using (public.is_project_member(id) or public.is_admin());
create policy projects_insert on public.projects
  for insert with check (public.is_admin());
create policy projects_update on public.projects
  for update using (public.is_admin()) with check (public.is_admin());
create policy projects_delete on public.projects
  for delete using (public.is_admin());

-- ============ project_members ============
create policy project_members_select on public.project_members
  for select using (profile_id = auth.uid() or public.is_admin());
create policy project_members_insert on public.project_members
  for insert with check (public.is_admin());
create policy project_members_update on public.project_members
  for update using (public.is_admin()) with check (public.is_admin());
create policy project_members_delete on public.project_members
  for delete using (public.is_admin());

-- ============ milestones ============
create policy milestones_select on public.milestones
  for select using (public.is_project_member(project_id) or public.is_admin());
create policy milestones_insert on public.milestones
  for insert with check (public.is_admin());
create policy milestones_update on public.milestones
  for update using (public.is_admin()) with check (public.is_admin());
create policy milestones_delete on public.milestones
  for delete using (public.is_admin());

-- ============ updates ============
create policy updates_select on public.updates
  for select using (public.is_project_member(project_id) or public.is_admin());
create policy updates_insert on public.updates
  for insert with check (public.is_admin());
create policy updates_update on public.updates
  for update using (public.is_admin()) with check (public.is_admin());
create policy updates_delete on public.updates
  for delete using (public.is_admin());
```

- [ ] **Bước 2: Reset DB để chạy toàn bộ migration đúng thứ tự**

```bash
npx supabase db reset
```

Kỳ vọng: 3 migration áp tuần tự, `seed.sql` (còn rỗng) chạy, không lỗi.

- [ ] **Bước 3: Xác minh RLS bật cho cả 5 bảng**

```bash
npx supabase db diff --schema public
```

Kỳ vọng: output rỗng.

- [ ] **Bước 4: Commit**

```bash
git add supabase/migrations/20260828000003_portal_rls.sql
git commit -m "feat(portal): RLS policy — SELECT theo thành viên/admin, ghi chỉ admin"
```

---

## Task 5: `seed.sql` — user + dữ liệu mẫu

**Files:**
- Tạo mới: `supabase/seed.sql`

**Interfaces:**
- Consumes: schema + trigger + RLS (Task 2–4).
- Cung cấp (dữ liệu cố định để Task 6 và Slice 2+ dựa vào):
  - `admin@dnkhouse.test` / `portal-dev-123` → `role='admin'`, id `11111111-1111-1111-1111-111111111111`
  - `client-a@dnkhouse.test` / `portal-dev-123` → `role='client'`, id `22222222-2222-2222-2222-222222222222`, dự án A
  - `client-b@dnkhouse.test` / `portal-dev-123` → `role='client'`, id `33333333-3333-3333-3333-333333333333`, dự án B
  - `pending@dnkhouse.test` / `portal-dev-123` → `role='pending'`, id `44444444-4444-4444-4444-444444444444`, không dự án
  - Dự án A id `aaaaaaaa-0000-0000-0000-000000000001`, dự án B id `bbbbbbbb-0000-0000-0000-000000000002`

- [ ] **Bước 1: Tạo `supabase/seed.sql`**

```sql
-- Slice 1 — Client portal: dữ liệu mẫu cho dev/test local
-- Tham chiếu: design doc gốc mục 3.6. Chỉ dùng local. Mật khẩu chung: portal-dev-123

-- ============ Users (auth.users + auth.identities) ============
-- Trigger handle_new_user sẽ tự tạo public.profiles với role = 'pending'.

insert into auth.users
  (instance_id, id, aud, role, email, encrypted_password,
   email_confirmed_at, created_at, updated_at,
   raw_app_meta_data, raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'authenticated', 'authenticated', 'admin@dnkhouse.test', crypt('portal-dev-123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"DNK Admin"}'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'authenticated', 'authenticated', 'client-a@dnkhouse.test', crypt('portal-dev-123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Khách A"}'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'authenticated', 'authenticated', 'client-b@dnkhouse.test', crypt('portal-dev-123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Khách B"}'),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444',
   'authenticated', 'authenticated', 'pending@dnkhouse.test', crypt('portal-dev-123', gen_salt('bf')),
   now(), now(), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Khách chờ duyệt"}');

insert into auth.identities
  (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@dnkhouse.test"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   '{"sub":"22222222-2222-2222-2222-222222222222","email":"client-a@dnkhouse.test"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333',
   '{"sub":"33333333-3333-3333-3333-333333333333","email":"client-b@dnkhouse.test"}', 'email', now(), now(), now()),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444',
   '{"sub":"44444444-4444-4444-4444-444444444444","email":"pending@dnkhouse.test"}', 'email', now(), now(), now());

-- ============ Set role (seed chạy không có auth.uid() -> trigger prevent_role_self_change không chặn) ============
update public.profiles set role = 'admin'  where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set role = 'client' where id = '22222222-2222-2222-2222-222222222222';
update public.profiles set role = 'client' where id = '33333333-3333-3333-3333-333333333333';
-- pending@ giữ role mặc định 'pending'

-- ============ Projects ============
insert into public.projects (id, name, status_label, summary) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Chatbot CSKH cho Khách A', 'Đang triển khai',
   'Trợ lý AI trả lời khách hàng 24/7 tích hợp website và fanpage.'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Tự động hoá nhập liệu — Khách B', 'Khảo sát',
   'Bóc tách hoá đơn và đồng bộ vào phần mềm kế toán.');

-- ============ Members ============
insert into public.project_members (project_id, profile_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333');

-- ============ Milestones ============
insert into public.milestones (project_id, title, position, done) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Chốt yêu cầu & kịch bản hội thoại', 0, true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Huấn luyện mô hình trên dữ liệu khách', 1, true),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Tích hợp website + fanpage', 2, false),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Chạy thử & bàn giao', 3, false),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Khảo sát quy trình hiện tại', 0, true),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Đề xuất giải pháp AI', 1, false);

-- ============ Updates ============
insert into public.updates (project_id, body, author_name, created_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Đã hoàn tất huấn luyện vòng 1, độ chính xác đạt mức mục tiêu.', 'DNK House', now() - interval '2 days'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Bắt đầu tích hợp lên website, dự kiến 1 tuần.', 'DNK House', now() - interval '6 hours'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Đã thu thập 20 mẫu hoá đơn, đang phân tích cấu trúc.', 'DNK House', now() - interval '1 day');
```

- [ ] **Bước 2: Reset DB để chạy seed**

```bash
npx supabase db reset
```

Kỳ vọng: migration + seed chạy sạch. Nếu lỗi `function crypt/gen_salt does not exist` → thêm dòng đầu file: `create extension if not exists pgcrypto with schema extensions;` rồi reset lại.

- [ ] **Bước 3: Xác minh dữ liệu**

```bash
npx supabase status
```

Mở `Studio URL` → Table Editor: `profiles` 4 dòng đúng role, `projects` 2 dòng, `milestones` 6 dòng, `updates` 3 dòng.

- [ ] **Bước 4: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat(portal): seed dữ liệu mẫu — 4 user, 2 dự án, milestones, updates"
```

---

## Task 6: Test integration RLS (Vitest + Supabase local)

**Files:**
- Tạo mới: `vitest.config.ts`
- Tạo mới: `tests/helpers/supabase.ts`
- Tạo mới: `tests/integration/rls.test.ts`
- Chỉnh sửa: `package.json` (script `test`, `test:watch`)

**Interfaces:**
- Consumes: `.env.local` (URL + anon + service role), seed data (Task 5).
- Cung cấp: `signInAs(persona)` → `Promise<SupabaseClient>` authenticated; `serviceClient()` → `SupabaseClient` bypass RLS; hằng số `IDS`.

- [ ] **Bước 1: Tạo `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Integration test dùng chung 1 DB local -> chạy tuần tự, timeout rộng.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
```

- [ ] **Bước 2: Tạo `tests/helpers/supabase.ts`**

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SERVICE) {
  throw new Error(
    "Thiếu biến môi trường Supabase. Chạy `npx supabase start`, copy vào .env.local, " +
      "rồi chạy `npm run test` (script tự nạp .env.local).",
  );
}

export const IDS = {
  admin: "11111111-1111-1111-1111-111111111111",
  clientA: "22222222-2222-2222-2222-222222222222",
  clientB: "33333333-3333-3333-3333-333333333333",
  pending: "44444444-4444-4444-4444-444444444444",
  projectA: "aaaaaaaa-0000-0000-0000-000000000001",
  projectB: "bbbbbbbb-0000-0000-0000-000000000002",
} as const;

type Persona = "admin" | "clientA" | "clientB" | "pending";

const EMAIL: Record<Persona, string> = {
  admin: "admin@dnkhouse.test",
  clientA: "client-a@dnkhouse.test",
  clientB: "client-b@dnkhouse.test",
  pending: "pending@dnkhouse.test",
};

/** Client bypass RLS — chỉ dùng dựng/kiểm chứng dữ liệu, không dùng test policy. */
export function serviceClient(): SupabaseClient {
  return createClient(URL!, SERVICE!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client authenticated đúng như 1 khách gọi từ trình duyệt (chịu RLS). */
export async function signInAs(persona: Persona): Promise<SupabaseClient> {
  const client = createClient(URL!, ANON!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({
    email: EMAIL[persona],
    password: "portal-dev-123",
  });
  if (error) throw new Error(`Đăng nhập ${persona} thất bại: ${error.message}`);
  return client;
}
```

- [ ] **Bước 3: Sửa script `test` để nạp `.env.local`**

Trong `package.json`:

```json
    "test": "node --env-file=.env.local node_modules/vitest/vitest.mjs run",
    "test:watch": "node --env-file=.env.local node_modules/vitest/vitest.mjs",
```

Kiểm tra đường dẫn: `ls node_modules/vitest/vitest.mjs`. Nếu không tồn tại, dùng biến thể: `"test": "dotenv -e .env.local -- vitest run"` sau khi `npm i -D dotenv-cli`, hoặc `node -r` phù hợp. Mục tiêu bất biến: Vitest chạy với `process.env` đã có 3 biến Supabase.

- [ ] **Bước 4: Viết test — `tests/integration/rls.test.ts`**

```ts
import { beforeAll, describe, expect, it } from "vitest";
import { IDS, serviceClient, signInAs } from "../helpers/supabase";

describe("RLS — cô lập dữ liệu dự án", () => {
  beforeAll(async () => {
    const svc = serviceClient();
    const { data } = await svc.from("projects").select("id");
    if (!data || data.length < 2) {
      throw new Error("Chưa seed dữ liệu. Chạy `npx supabase db reset` trước.");
    }
  });

  it("Khách A không đọc được dự án B", async () => {
    const a = await signInAs("clientA");
    const { data } = await a.from("projects").select("id").eq("id", IDS.projectB);
    expect(data).toEqual([]);
  });

  it("Khách A không đọc được milestones/updates của dự án B", async () => {
    const a = await signInAs("clientA");
    const ms = await a.from("milestones").select("id").eq("project_id", IDS.projectB);
    const up = await a.from("updates").select("id").eq("project_id", IDS.projectB);
    expect(ms.data).toEqual([]);
    expect(up.data).toEqual([]);
  });

  it("Khách A đọc được đúng dự án của mình", async () => {
    const a = await signInAs("clientA");
    const { data } = await a.from("projects").select("id").eq("id", IDS.projectA);
    expect(data).toEqual([{ id: IDS.projectA }]);
  });

  it("Khách A không ghi được vào bảng nghiệp vụ", async () => {
    const a = await signInAs("clientA");
    const ins = await a
      .from("updates")
      .insert({ project_id: IDS.projectA, body: "hack", author_name: "hacker" });
    expect(ins.error).not.toBeNull();

    await a.from("projects").update({ name: "đổi tên" }).eq("id", IDS.projectA);
    const svc = serviceClient();
    const check = await svc
      .from("projects")
      .select("name")
      .eq("id", IDS.projectA)
      .single();
    expect(check.data?.name).not.toBe("đổi tên");

    await a.from("milestones").delete().eq("project_id", IDS.projectA);
    const left = await svc.from("milestones").select("id").eq("project_id", IDS.projectA);
    expect((left.data ?? []).length).toBeGreaterThan(0);
  });

  it("User pending không đọc được bảng nghiệp vụ nào", async () => {
    const p = await signInAs("pending");
    for (const table of ["projects", "milestones", "updates", "project_members"] as const) {
      const { data } = await p.from(table).select("*");
      expect(data).toEqual([]);
    }
  });

  it("Client tự nâng role thành admin -> bị trigger từ chối", async () => {
    const a = await signInAs("clientA");
    const { error } = await a
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", IDS.clientA);
    expect(error).not.toBeNull();
    const svc = serviceClient();
    const { data } = await svc
      .from("profiles")
      .select("role")
      .eq("id", IDS.clientA)
      .single();
    expect(data?.role).toBe("client");
  });

  it("Admin đọc được mọi dự án và insert được project", async () => {
    const admin = await signInAs("admin");
    const all = await admin.from("projects").select("id");
    expect((all.data ?? []).length).toBeGreaterThanOrEqual(2);
    const ins = await admin
      .from("projects")
      .insert({ name: "Dự án test admin", status_label: "Nháp" })
      .select("id")
      .single();
    expect(ins.error).toBeNull();
    if (ins.data?.id) {
      await serviceClient().from("projects").delete().eq("id", ins.data.id);
    }
  });

  it("Trigger set_milestone_done_at: bật done điền done_at, tắt done xoá done_at", async () => {
    const svc = serviceClient();
    const { data: m } = await svc
      .from("milestones")
      .select("id")
      .eq("project_id", IDS.projectA)
      .eq("done", false)
      .limit(1)
      .single();
    const id = m!.id;
    const on = await svc
      .from("milestones")
      .update({ done: true })
      .eq("id", id)
      .select("done_at")
      .single();
    expect(on.data?.done_at).not.toBeNull();
    const off = await svc
      .from("milestones")
      .update({ done: false })
      .eq("id", id)
      .select("done_at")
      .single();
    expect(off.data?.done_at).toBeNull();
  });
});
```

- [ ] **Bước 5: Chạy test**

```bash
npx supabase db reset
npm run test
```

Kỳ vọng: `tests/integration/rls.test.ts` tất cả xanh. Nếu case "không ghi được" flaky do PostgREST trả về khác kỳ vọng, giữ nguyên nguyên tắc assert: **dữ liệu không đổi sau thao tác của client A** (verify lại bằng `serviceClient()`).

- [ ] **Bước 6: Commit**

```bash
git add vitest.config.ts tests/helpers/supabase.ts tests/integration/rls.test.ts package.json
git commit -m "test(portal): integration RLS — cô lập dữ liệu, chặn ghi, trigger done_at"
```

---

## Task 7: Client Supabase cho Next (`src/lib/supabase/*`) + type DB

**Files:**
- Tạo mới: `src/lib/supabase/database.types.ts`
- Tạo mới: `src/lib/supabase/server.ts`
- Tạo mới: `src/lib/supabase/client.ts`
- Tạo mới: `src/lib/supabase/middleware.ts`
- Tạo mới: `tests/unit/supabase-clients.test.ts`

**Interfaces:**
- Cung cấp (Slice 2 dựa vào):
  - `import { createClient } from "@/lib/supabase/server"` — `function createClient(): Promise<SupabaseClient<Database>>`
  - `import { createClient } from "@/lib/supabase/client"` — `function createClient(): SupabaseClient<Database>`
  - `import { updateSession } from "@/lib/supabase/middleware"` — `function updateSession(request: NextRequest): Promise<NextResponse>`
  - `import type { Database } from "@/lib/supabase/database.types"`

- [ ] **Bước 1: Sinh type Database từ Supabase local**

```bash
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

Kỳ vọng: file có `export type Database = { ... }` với đủ 5 bảng trong `public.Tables`. Thêm dòng đầu file: `/* eslint-disable */` và `// File sinh tự động: npx supabase gen types typescript --local`.

- [ ] **Bước 2: Tạo `src/lib/supabase/client.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Bước 3: Tạo `src/lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

/** Tạo client mới trong MỖI request (không đặt vào biến global). */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Gọi từ Server Component — bỏ qua được vì proxy.ts đã refresh session.
          }
        },
      },
    },
  );
}
```

- [ ] **Bước 4: Tạo `src/lib/supabase/middleware.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Refresh session Supabase trên mỗi request và đồng bộ cookie giữa request/response.
 * Gọi từ src/proxy.ts (Slice 2). KHÔNG chèn logic giữa createServerClient và getClaims().
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Bắt buộc gọi để refresh token; đừng xoá, đừng chèn code phía trên.
  await supabase.auth.getClaims();

  return supabaseResponse;
}
```

- [ ] **Bước 5: Viết test — `tests/unit/supabase-clients.test.ts`**

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} }),
}));

describe("Supabase client factories", () => {
  it("client trình duyệt tạo được instance có auth + from()", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon";
    const { createClient } = await import("@/lib/supabase/client");
    const c = createClient();
    expect(c.auth).toBeDefined();
    expect(typeof c.from).toBe("function");
  });

  it("client server tạo được instance (await) có auth", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon";
    const { createClient } = await import("@/lib/supabase/server");
    const c = await createClient();
    expect(c.auth).toBeDefined();
  });

  it("updateSession import được và là hàm", async () => {
    const mod = await import("@/lib/supabase/middleware");
    expect(typeof mod.updateSession).toBe("function");
  });
});
```

- [ ] **Bước 6: Chạy test**

```bash
npm run test
```

Kỳ vọng: file mới xanh + `rls.test.ts` vẫn xanh.

- [ ] **Bước 7: Verify typecheck + lint + build**

```bash
npx tsc --noEmit; echo "tsc=$?"
npm run lint
npm run build
```

Kỳ vọng: sạch cả 3. Nếu `database.types.ts` bị lint kêu → `/* eslint-disable */` đã thêm ở Bước 1 xử lý.

- [ ] **Bước 8: Commit**

```bash
git add src/lib/supabase tests/unit/supabase-clients.test.ts
git commit -m "feat(portal): client Supabase server/browser/proxy-helper + type Database"
```

---

## Task 8: Cập nhật CLAUDE.md + xác minh hoàn thành slice

**Files:**
- Chỉnh sửa: `CLAUDE.md`

- [ ] **Bước 1: Sửa mục Commands trong `CLAUDE.md`**

Trong khối ```` ```bash ```` dưới `## Commands`, thêm sau dòng `npx tsc --noEmit`:

```
npm run test      # Vitest (unit + integration). Integration cần `npx supabase start` (Docker).
npm run test:e2e  # Playwright E2E (từ Slice 2). Cần Supabase local + app chạy.
```

Sửa câu "Chưa có test runner nào được cấu hình — không có `npm test`..." thành:

```
Test: Vitest (`npm run test`) cho unit + integration RLS; Playwright (`npm run test:e2e`) cho E2E
(từ Slice 2). Integration/E2E cần Supabase local: `npx supabase start` (yêu cầu Docker Desktop).
```

- [ ] **Bước 2: Thêm mục biến môi trường vào `CLAUDE.md`** (trước `## Conventions`)

```markdown
## Biến môi trường (client portal)

Xem `.env.local.example`. Ba biến Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — công khai, dùng cả client lẫn server.
- `SUPABASE_SERVICE_ROLE_KEY` — **chỉ server** (seed test, thao tác admin). Không import vào code chạy ở trình duyệt.

Dev local: `npx supabase start` rồi copy 3 giá trị (`npx supabase status`) vào `.env.local`.
Migrations + seed: `npx supabase db reset`.
```

- [ ] **Bước 3: Xác minh landing page không đổi**

```bash
npm run build
```

Kỳ vọng: route `/` vẫn `○ (Static) prerendered as static content`. Không có route động mới.

- [ ] **Bước 4: Chạy toàn bộ verify checklist của spec slice**

```bash
npx supabase db reset && npm run test
npx tsc --noEmit; echo "tsc=$?"
npm run lint
npm run build
git status
git check-ignore .env.local; echo "ignored=$?"
```

Kỳ vọng: test xanh; `tsc=0`; lint sạch; build chỉ `/` + `/_not-found`; `git status` không có `.env.local`; `ignored=0`.

- [ ] **Bước 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(portal): CLAUDE.md — lệnh test + biến môi trường Supabase"
```

- [ ] **Bước 6: Review slice** — dùng skill `superpowers:requesting-code-review` cho toàn bộ diff Slice 1 trước khi sang Slice 2.

---

## Tự Kiểm Tra Kế Hoạch (đã chạy)

**Bao phủ spec slice 1:** Dependencies → Task 1; `.env.local.example` + `.gitignore` → Task 1; `supabase init`/`config.toml` → Task 2; 5 bảng (3.1) → Task 2; 2 hàm `SECURITY DEFINER` (3.2) → Task 3; 4 trigger (3.3) → Task 3; RLS + policy 5 bảng (3.4) → Task 4; `seed.sql` → Task 5; `src/lib/supabase/{server,client,middleware}.ts` → Task 7; cấu hình Vitest + scripts → Task 6; `rls.test.ts` phủ toàn bộ 5.2 + trigger `done_at` → Task 6; CLAUDE.md → Task 8. Không lỗ hổng.

**Placeholder:** không có. Mọi SQL/TS đầy đủ, chạy được.

**Nhất quán type:** `createClient` (server async / client sync), `updateSession(request)`, `Database`, `IDS`, uuid seed — nhất quán Task 6–8, Slice 2 tham chiếu đúng các tên này.

**Rủi ro đã xử lý:** trigger `auth.users` (local OK; hosted có fallback ở Slice 2); `crypt/gen_salt` (Task 5 B2); `--env-file`/đường dẫn vitest (Task 6 B3); lint file sinh tự động (Task 7 B1).
