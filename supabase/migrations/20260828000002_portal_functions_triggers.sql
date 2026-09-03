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
