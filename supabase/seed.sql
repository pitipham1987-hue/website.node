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
