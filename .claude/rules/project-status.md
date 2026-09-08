# Trạng thái triển khai — Giai đoạn 1 (Client Portal)

**Tổng kết toàn phiên:** Giai đoạn 1 (client portal đăng nhập Google — 4 slice, 33
commit tính năng) đã hoàn tất, review sạch qua từng task lẫn tổng thể, đã merge vào
`main` và **đã push lên `origin/main`** (đồng bộ, cùng commit `f50b335`). Site
**chỉ chạy local** — chưa deploy lên nền tảng nào. Ngày 2026-09-08 đã dựng Supabase
**hosted** (`obcfgqkaokghxgauomxo`, region `ap-northeast-1`), push schema, bật Google
provider và **chạy Google OAuth thật thành công end-to-end**; đã cấp `role='admin'`
cho `luongthedat@gmail.com` và nạp **1 dự án demo** (5 milestone + 3 nhật ký) qua
service key để kiểm thử giao diện. Việc còn lại: không bao giờ đặt `E2E_TEST_LOGIN=1`
ở môi trường thật (xem [[portal-env-security]]), và nạp dữ liệu **dự án thật** khi có.

**Cập nhật lần cuối: 2026-09-08.** Giai đoạn 1 (đăng nhập Google + dashboard khách
hàng, xem [[portal-architecture]]) đã **hoàn tất cả 4 slice**, đã merge vào `main`
và **đã push lên `origin/main`** (đồng bộ tại `f50b335`). Thực thi qua skill
`subagent-driven-development`: mỗi task một subagent riêng, review tách biệt (tuân
thủ spec + chất lượng) sau mỗi task, review tổng thể cuối mỗi slice.

## Trạng thái từng phần

| Phần | Trạng thái | Ghi chú |
|------|-----------|---------|
| Slice 1 — Hạ tầng Supabase (schema, RLS, seed, client Next) | ✅ Xong, đã merge | 8 task, 1 vòng vá lỗi (seed thiếu cột token) |
| Slice 2 — Đăng nhập/đăng xuất Google + bảo vệ route | ✅ Xong, đã merge | 8 task. **Google OAuth thật đã chạy end-to-end** (2026-09-08, Supabase hosted): trigger `handle_new_user` tự tạo `profiles` role `pending` khi login lần đầu |
| Slice 3 — Dashboard danh sách dự án | ✅ Xong, đã merge | 6 task. 1 regression liên-slice được phát hiện + vá (đổi UI làm vỡ test Slice 2) |
| Slice 4 — Chi tiết dự án (milestone + nhật ký) | ✅ Xong, đã merge | 7 task. Đã kiểm chứng độc lập qua curl thật: không rò rỉ dữ liệu chéo giữa khách hàng |
| Merge vào `main` | ✅ Xong | Test xanh trên kết quả merge: 34/34 unit+integration, 15/15 E2E, `tsc`/`lint`/`build` sạch |
| Push lên `origin/main` | ✅ Xong | `main` == `origin/main` tại `f50b335` |
| Supabase hosted + OAuth thật | ✅ Xong (2026-09-08) | Project `obcfgqkaokghxgauomxo` (`ap-northeast-1`). 3 migration đã `supabase db push`. Google provider bật, đăng nhập thật OK. `.env.local` trỏ hosted. 1 dự án demo + admin `luongthedat@gmail.com` nạp qua service key |
| Giai đoạn 2 (`/portal/admin`) | ⬜ Chưa bắt đầu | Cần spec riêng — xem mục "Bước tiếp theo" |

## Bước tiếp theo

1. ~~**Cấu hình Google OAuth thật**~~ ✅ Xong (2026-09-08) — Supabase hosted
   `obcfgqkaokghxgauomxo`, Google provider bật, `.env.local` trỏ hosted, đăng nhập
   thật OK. Thiết kế gốc: `docs/superpowers/specs/2026-08-28-portal-dang-nhap-google-design.md`
   mục 2.2.
2. ~~**Push `main` lên `origin/main`**~~ ✅ Đã push (2026-09-08) — `main` đồng bộ `origin/main` tại `f50b335`.
3. ~~**Đặt `role = 'admin'`**~~ ✅ Xong — `luongthedat@gmail.com` đã là `admin` (nạp
   qua service key, không phải Studio).
4. ~~**Nhập dữ liệu dự án đầu tiên**~~ ✅ Đã nạp **1 dự án demo** ("Trợ lý AI nội
   bộ — Demo", 5 milestone + 3 nhật ký + `project_members`) qua service key để test
   giao diện. **Dữ liệu dự án thật** vẫn phải nhập tay (`projects`, `milestones`,
   `updates`, duyệt khách `pending → client`, gán `project_members`) — Giai đoạn 1
   chưa có UI quản trị.
5. **Brainstorm + viết spec Giai đoạn 2** (`/portal/admin`) trước khi viết plan —
   CRUD dự án/milestone/update, duyệt khách, gán `project_members`, thay thế thao
   tác thủ công ở bước 4. Dùng skill `brainstorming` trước, không nhảy thẳng vào
   `writing-plans`.
6. **(Tuỳ chọn, không chặn)** `roleToScreen` (`src/lib/portal/session.ts`) hiện chỉ
   được dùng trong unit test, không có call site trong code sản phẩm — cân nhắc
   dùng thật khi làm Giai đoạn 2 hoặc dọn bỏ nếu vẫn không cần.
7. **Đổi mật khẩu DB Supabase hosted** — mật khẩu đặt lúc tạo project đã bị lộ khi
   chạy `supabase db push` qua transcript. Studio → Project Settings → Database →
   Reset database password. App không dùng mật khẩu này (chỉ `NEXT_PUBLIC_SUPABASE_*`
   + service key) nên đổi không ảnh hưởng.
8. **`.env.local` giờ trỏ hosted** → `npm run test` (integration RLS) và
   `npm run test:e2e` vẫn cần Supabase **local** (`npx supabase start`). Khi chạy
   test phải tạm đổi `.env.local` về giá trị local, hoặc giữ 2 bản.

## Quyết định quan trọng đã đưa ra (và lý do)

- **`E2E_TEST_LOGIN` KHÔNG có lớp bảo vệ `NODE_ENV` đi kèm** — dù đây là cửa hậu
  đăng nhập bỏ qua Google. Lý do: `next start` (kể cả khi build để chạy E2E cục bộ
  qua `playwright.config.ts` `webServer`) tự đặt `NODE_ENV=production` khi biến này
  chưa được set từ trước — đã kiểm chứng thực nghiệm bằng cách đọc
  `node_modules/next/dist/bin/next`. Thêm điều kiện `NODE_ENV !== "production"` sẽ
  khiến route luôn 404 ngay cả khi chạy E2E hợp lệ, tự phá vỡ toàn bộ chiến lược
  test (test trên production build thật, không phải `next dev`). Biện pháp bảo vệ
  thực sự là kỷ luật vận hành — xem cảnh báo ở [[portal-env-security]] — không
  phải code.
- **Loại `.claude/**` khỏi phạm vi ESLint** (`eslint.config.mjs`) — `npm run lint`
  vốn đã fail từ trước (9 lỗi `no-require-imports` trong script CommonJS của
  `.claude/skills/*`, có từ commit `04f1aa9`, không liên quan portal). Không sửa
  thì mọi task/slice từ Slice 1 Task 7 trở đi đều "fail lint" oan, làm mất ý nghĩa
  của bước xác minh "lint sạch".
- **Thêm user seed `client-c@dnkhouse.test`** (role `client`, không có dự án nào) —
  plan gốc của Slice 3 để ngỏ 2 phương án cho việc test màn "thông báo trống" mà
  không chọn phương án nào (vi phạm nguyên tắc không-placeholder của
  `writing-plans`); chốt bằng cách seed thêm persona thay vì tái dùng user
  `pending` (2 màn hình có nội dung/điều kiện khác nhau, dùng chung persona sẽ
  không phân biệt được 2 nhánh code).
- **`getByRole("heading", ...)` thay vì `getByText(...)` cho các assertion E2E
  quan trọng** — 2 sự cố thật trong Slice 3: (1) `getByText("Dự án của")` khớp
  nhầm câu văn không liên quan trong `PendingNotice`; (2)
  `getByRole("link", {name: /portal\//})` khớp accessible name thay vì `href`,
  khiến assertion luôn pass giả tạo. Bài học: ưu tiên `getByRole` với `level`/name
  neo chặt (`^...`), tránh chuỗi ngắn/chung chung.
- **Merge vào `main` rồi push lên `origin/main`** — ban đầu người dùng giữ cục bộ
  (quyết định của người dùng, không phải giới hạn kỹ thuật); sau đã push. `main` ==
  `origin/main` tại `f50b335`.
- **Supabase hosted dùng cho dev thủ công, Supabase local dùng cho test** — sau khi
  dựng hosted (`obcfgqkaokghxgauomxo`, `ap-northeast-1`) để chạy Google OAuth thật,
  `.env.local` trỏ hosted. Test integration/E2E vẫn cần local. Chấp nhận phải đổi
  `.env.local` qua lại (hoặc giữ 2 bản), không cố gộp làm một. Schema hosted đẩy
  bằng `supabase db push --db-url` (không `supabase login`); seed test **không** đẩy
  lên hosted. Dữ liệu demo nạp qua `SUPABASE_SERVICE_ROLE_KEY` (bỏ qua RLS).
- **`requireAdmin()` dời sang Giai đoạn 2** — theo đúng thiết kế gốc: Giai đoạn 1
  không có route/Server Action nào cần, thêm sớm sẽ là code chết.
- **`formatVnDate` tự viết bằng `Intl.DateTimeFormat`**, không thêm thư viện ngày
  tháng ngoài (dayjs/date-fns) — giữ đúng nguyên tắc "không thêm dependency thừa
  cho site nhỏ" của dự án, Node 22 (full-ICU) đủ để định dạng `dd/mm/yyyy` theo
  giờ Việt Nam mà không cần thư viện.
