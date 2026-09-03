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
