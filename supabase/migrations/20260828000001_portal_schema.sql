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
