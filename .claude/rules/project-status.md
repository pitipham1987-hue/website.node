# Trạng thái triển khai — Giai đoạn 1 (Client Portal)

**Tổng kết toàn phiên:** Giai đoạn 1 (client portal đăng nhập Google — 4 slice, 33
commit tính năng) đã hoàn tất, review sạch qua từng task lẫn tổng thể, và đã merge
vào main cục bộ (37 commit vượt trước origin/main, chưa push). Trước khi deploy
thật, còn 3 việc cần người dùng tự làm: cấu hình Google OAuth thật trên Supabase
hosted + biến môi trường Vercel, không bao giờ đặt `E2E_TEST_LOGIN=1` ở production
(xem [[portal-env-security]]), và cấp `role='admin'` + nhập dữ liệu dự án đầu tiên
qua Supabase Studio.

**Cập nhật lần cuối: 2026-09-03.** Giai đoạn 1 (đăng nhập Google + dashboard khách
hàng, xem [[portal-architecture]]) đã **hoàn tất cả 4 slice**, đã merge cục bộ vào
`main` (37 commit), **chưa push lên `origin/main`**. Thực thi qua skill
`subagent-driven-development`: mỗi task một subagent riêng, review tách biệt (tuân
thủ spec + chất lượng) sau mỗi task, review tổng thể cuối mỗi slice.

## Trạng thái từng phần

| Phần | Trạng thái | Ghi chú |
|------|-----------|---------|
| Slice 1 — Hạ tầng Supabase (schema, RLS, seed, client Next) | ✅ Xong, đã merge | 8 task, 1 vòng vá lỗi (seed thiếu cột token) |
| Slice 2 — Đăng nhập/đăng xuất Google + bảo vệ route | ✅ Xong, đã merge | 8 task. **Luồng Google OAuth thật CHƯA từng chạy** — máy dev chỉ có Supabase local, không có Google provider thật |
| Slice 3 — Dashboard danh sách dự án | ✅ Xong, đã merge | 6 task. 1 regression liên-slice được phát hiện + vá (đổi UI làm vỡ test Slice 2) |
| Slice 4 — Chi tiết dự án (milestone + nhật ký) | ✅ Xong, đã merge | 7 task. Đã kiểm chứng độc lập qua curl thật: không rò rỉ dữ liệu chéo giữa khách hàng |
| Merge vào `main` | ✅ Xong (cục bộ) | Test xanh trên kết quả merge: 34/34 unit+integration, 15/15 E2E, `tsc`/`lint`/`build` sạch |
| Push lên `origin/main` | ⬜ Chưa làm | Quyết định của người dùng — chờ cấu hình Google OAuth thật trước |
| Giai đoạn 2 (`/portal/admin`) | ⬜ Chưa bắt đầu | Cần spec riêng — xem mục "Bước tiếp theo" |

## Bước tiếp theo

1. **Cấu hình Google OAuth thật** (bắt buộc trước khi có người dùng thật) — tạo
   Supabase project hosted, bật Google provider, tạo Google Cloud OAuth Client ID,
   điền `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` vào Vercel Project
   Settings. Xem thiết kế đầy đủ ở `docs/superpowers/specs/2026-08-28-portal-dang-nhap-google-design.md`
   mục 2.2.
2. **Push `main` lên `origin/main`** khi đã sẵn sàng chia sẻ/deploy.
3. **Đặt `role = 'admin'`** cho tài khoản nhân viên DNK House đầu tiên — thao tác
   tay 1 lần qua Supabase Studio (Table Editor → `profiles`).
4. **Nhập dữ liệu dự án thật đầu tiên** qua Supabase Studio — Giai đoạn 1 chưa có
   UI quản trị, mọi thao tác ghi (`projects`, `milestones`, `updates`, duyệt khách
   `pending → client`, gán `project_members`) đều làm tay.
5. **Brainstorm + viết spec Giai đoạn 2** (`/portal/admin`) trước khi viết plan —
   CRUD dự án/milestone/update, duyệt khách, gán `project_members`, thay thế thao
   tác thủ công ở bước 3-4. Dùng skill `brainstorming` trước, không nhảy thẳng vào
   `writing-plans`.
6. **(Tuỳ chọn, không chặn)** `roleToScreen` (`src/lib/portal/session.ts`) hiện chỉ
   được dùng trong unit test, không có call site trong code sản phẩm — cân nhắc
   dùng thật khi làm Giai đoạn 2 hoặc dọn bỏ nếu vẫn không cần.

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
- **Merge vào `main` cục bộ nhưng chưa push** — quyết định của người dùng, không
  phải giới hạn kỹ thuật. `main` hiện vượt trước `origin/main` 37 commit.
- **`requireAdmin()` dời sang Giai đoạn 2** — theo đúng thiết kế gốc: Giai đoạn 1
  không có route/Server Action nào cần, thêm sớm sẽ là code chết.
- **`formatVnDate` tự viết bằng `Intl.DateTimeFormat`**, không thêm thư viện ngày
  tháng ngoài (dayjs/date-fns) — giữ đúng nguyên tắc "không thêm dependency thừa
  cho site nhỏ" của dự án, Node 22 (full-ICU) đủ để định dạng `dd/mm/yyyy` theo
  giờ Việt Nam mà không cần thư viện.
