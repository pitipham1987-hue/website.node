# Trạng thái triển khai — Giai đoạn 1 (Client Portal)

**Tổng kết toàn phiên:** Giai đoạn 1 (client portal đăng nhập Google — 4 slice, 33
commit tính năng) đã hoàn tất, review sạch qua từng task lẫn tổng thể, đã merge vào
`main` và **đã push lên `origin/main`** (đồng bộ, cùng commit `f50b335`). Site
**chỉ chạy local** — chưa deploy lên nền tảng nào. Ngày 2026-09-08 đã dựng Supabase
**hosted** (`obcfgqkaokghxgauomxo`, region `ap-northeast-1`), push schema, bật Google
provider và **chạy Google OAuth thật thành công end-to-end**; đã cấp `role='admin'`
cho `luongthedat@gmail.com` và nạp **1 dự án demo** (5 milestone + 3 nhật ký) qua
service key để kiểm thử giao diện. Cùng ngày đã tách môi trường test khỏi `.env.local`
bằng file `.env.test` được commit (chưa commit — còn trong working tree). Việc còn
lại: không bao giờ đặt `E2E_TEST_LOGIN=1` ở môi trường thật (xem
[[portal-env-security]]), commit/push các thay đổi đang chờ, và nạp dữ liệu **dự án
thật** khi có.

**Cập nhật lần cuối: 2026-09-08.** Giai đoạn 1 (đăng nhập Google + dashboard khách
hàng, xem [[portal-architecture]]) đã **hoàn tất cả 4 slice**, đã merge vào `main`
và **đã push lên `origin/main`** (`f50b335`). Thực thi qua skill
`subagent-driven-development`: mỗi task một subagent riêng, review tách biệt (tuân
thủ spec + chất lượng) sau mỗi task, review tổng thể cuối mỗi slice.

### Phiên 2026-09-08 đã làm

1. **Bỏ Vercel khỏi toàn bộ docs** — site chỉ chạy local (`npm run dev` / `build`
   + `start`), mọi cấu hình nằm trong `.env.local`, không gắn với nền tảng host nào.
   Sửa: `commands-and-stack.md`, `portal-env-security.md`, `.env.local.example`,
   spec + plan Giai đoạn 1.
2. **Dựng Supabase hosted** `obcfgqkaokghxgauomxo` (`ap-northeast-1`) — push 3
   migration bằng `npx supabase db push --db-url "<session pooler URI>"` (không cần
   `supabase login`), bật Google provider, `.env.local` trỏ hosted.
3. **Xác minh Google OAuth thật end-to-end** — login `luongthedat@gmail.com`,
   trigger `handle_new_user` tự tạo `profiles` role `pending`, thấy màn "chờ duyệt".
4. **Cấp `role='admin'`** cho `luongthedat@gmail.com` + **nạp 1 dự án demo**
   ("Trợ lý AI nội bộ — Demo", 5 milestone + 3 nhật ký + `project_members`) qua
   `SUPABASE_SERVICE_ROLE_KEY` (bỏ qua RLS). Portal hiển thị đúng (đã xác nhận).
5. Commit `1328c49` + `586cdd9` trên `main` (docs).

### Phiên 2026-09-08 (tiếp) — Môi trường test local độc lập với `.env.local`

**Vấn đề:** `.env.local` trỏ Supabase hosted (dev thủ công + Google OAuth thật),
nhưng `npm run test` (integration RLS) và `npm run test:e2e` cần Supabase **local**.
Trước đây phải sửa `.env.local` qua lại bằng tay mỗi lần chuyển việc.

**Đã làm:**
1. Thêm **`.env.test` (được commit)** — ngoại lệ `!.env.test` trong `.gitignore`.
   Chứa sẵn 3 giá trị Supabase local: URL `http://127.0.0.1:54321` + bộ key demo cố
   định, công khai (issuer `supabase-demo`), chỉ xác thực được với instance ở
   `127.0.0.1`.
2. `package.json`: `test` / `test:watch` nạp `--env-file-if-exists=.env.test` (thay
   cho `.env.local`).
3. `playwright.config.ts`: `process.loadEnvFile(".env.test")` trước `defineConfig`.
   Playwright merge `process.env` vào lệnh `webServer` (`{ ...DEFAULT_ENV,
   ...process.env, ...options.env }` — đã đọc source `playwright/lib/runner/index.js`);
   `@next/env` không ghi đè biến `process.env` đã set → `next build && start` khi
   chạy E2E dùng đúng Supabase local dù `.env.local` trỏ hosted.
4. Docs: `portal-env-security.md` (mục mới "`.env.test`"), `commands-and-stack.md`,
   `.env.local.example`, file này; sửa thông báo lỗi `tests/helpers/supabase.ts`.

**Xác minh:** `npx tsc --noEmit` sạch; `npm run test -- tests/unit` → 25/25 pass;
`node --env-file-if-exists=.env.test` và `process.loadEnvFile(".env.test")` đều nạp
đúng giá trị local. **Chưa chạy** integration RLS + E2E ở phiên này vì Docker Desktop
chưa bật (cần `npx supabase start` + `npx supabase db reset`).

**Chưa commit** (các thay đổi ở mục này còn nằm trong working tree).

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
| Môi trường test local (`.env.test`) | ✅ Xong (2026-09-08), **chưa commit** | `npm run test` + `npm run test:e2e` tự nạp `.env.test` (được commit) → không cần đổi `.env.local`. Unit 25/25 pass, `tsc` sạch; integration RLS + E2E chưa chạy lại phiên này (thiếu Docker) |
| Giai đoạn 2 (`/portal/admin`) | ⬜ Chưa bắt đầu | Cần spec riêng — xem mục "Bước tiếp theo" |

## Bước tiếp theo (phiên sau)

**Việc dọn dẹp ngay (do phiên 2026-09-08 tạo ra):**

1. **Đổi mật khẩu DB Supabase hosted** — mật khẩu đặt lúc tạo project đã bị lộ trong
   transcript khi chạy `supabase db push --db-url`. Studio → Project Settings →
   Database → Reset database password. App không dùng mật khẩu này (chỉ
   `NEXT_PUBLIC_SUPABASE_*` + service key) nên đổi không ảnh hưởng.
2. **Commit + push `main` lên `origin/main`** — chưa push: `1328c49`, `586cdd9`
   (docs) + thay đổi `.env.test` của phiên "(tiếp)" vẫn đang trong working tree,
   **chưa commit**.
3. **Chạy full test khi bật được Docker** — `npx supabase start` +
   `npx supabase db reset`, rồi `npm run test` (integration RLS) và `npm run test:e2e`,
   để xác nhận `.env.test` hoạt động end-to-end. Phiên thêm `.env.test` chỉ chạy được
   unit (thiếu Docker).
4. ~~Chú ý `.env.local` đang trỏ hosted khi chạy test~~ — **đã xử lý (phiên
   2026-09-08 "(tiếp)"):** `.env.test` (được commit) + `npm run test` /
   `playwright.config.ts` tự nạp. **Không còn phải đổi `.env.local` qua lại.** Chi
   tiết ở mục "Phiên 2026-09-08 (tiếp)" bên trên và [[portal-env-security]].

**Việc tính năng:**

5. **Nhập dữ liệu dự án thật** (khi có khách thật) — vẫn làm tay qua Studio hoặc
   service key: `projects`, `milestones`, `updates`, duyệt khách `pending → client`,
   gán `project_members`. Giai đoạn 1 chưa có UI quản trị. Có thể xoá dự án demo
   "Trợ lý AI nội bộ — Demo" khi không cần nữa.
6. **Brainstorm + viết spec Giai đoạn 2** (`/portal/admin`) trước khi viết plan —
   CRUD dự án/milestone/update, duyệt khách, gán `project_members`, thay thế thao
   tác thủ công ở bước 5. Dùng skill `brainstorming` trước, không nhảy thẳng vào
   `writing-plans`.
7. **(Tuỳ chọn, không chặn)** `roleToScreen` (`src/lib/portal/session.ts`) hiện chỉ
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
- **Merge vào `main` rồi push lên `origin/main`** — ban đầu người dùng giữ cục bộ
  (quyết định của người dùng, không phải giới hạn kỹ thuật); sau đã push. `main` ==
  `origin/main` tại `f50b335`.
- **Bỏ Vercel khỏi docs, site chỉ chạy local** (phiên 2026-09-08) — người dùng chốt
  chưa deploy lên nền tảng nào. Mọi hướng dẫn "điền biến vào Vercel" đổi thành điền
  vào `.env.local`. Khi nào cần đưa lên internet mới chọn nền tảng (Vercel chỉ là
  gợi ý cũ, không bắt buộc — xem [[commands-and-stack]]).
- **Supabase hosted dùng cho dev thủ công, Supabase local dùng cho test** — sau khi
  dựng hosted (`obcfgqkaokghxgauomxo`, `ap-northeast-1`) để chạy Google OAuth thật,
  `.env.local` trỏ hosted. Test integration/E2E vẫn cần local — nhưng **không đổi
  `.env.local` qua lại nữa**: thêm file `.env.test` (được commit, chứa sẵn bộ key
  Supabase local demo cố định) mà `npm run test` và `playwright.config.ts` tự nạp,
  đè lên giá trị hosted. `.env.local` cứ để nguyên trỏ hosted. Schema hosted đẩy
  bằng `supabase db push --db-url` (không `supabase login` — chỉ cần chuỗi session
  pooler; host thật là `aws-0-ap-northeast-1.pooler.supabase.com`, không phải
  `db.<ref>.supabase.co` vì direct connection IPv6-only). Seed test **không** đẩy
  lên hosted.
- **`.env.test` được commit dù có dòng `SUPABASE_SERVICE_ROLE_KEY`** (phiên
  2026-09-08 "(tiếp)") — 3 giá trị là key demo Supabase **local**: cố định, công
  khai (issuer `supabase-demo`), chỉ xác thực được với instance ở `127.0.0.1`
  (`supabase/config.toml` không đặt JWT secret riêng → mọi `supabase start` sinh ra
  đúng bộ này). Không phải bí mật. Commit để clone về là chạy test được ngay, bỏ
  hẳn bước "copy giá trị vào file" thủ công. Người dùng chọn phương án này thay vì
  `.env.test.local` (gitignored) + `.env.test.example`. `.gitignore` vốn đã ghi chú
  "can opt-in for committing if needed"; thêm ngoại lệ `!.env.test`.
- **E2E lấy env qua `process.loadEnvFile` trong `playwright.config.ts`, không nhồi
  thẳng vào `webServer.env`** — Playwright merge theo thứ tự `{ ...DEFAULT_ENV,
  ...process.env, ...webServer.env }` (đọc source `playwright/lib/runner/index.js`),
  nên nạp `.env.test` vào `process.env` một lần ở đầu file là đủ cho cả `next build`
  lẫn `next start`; `webServer.env` chỉ giữ `E2E_TEST_LOGIN`. `@next/env` không ghi
  đè biến `process.env` đã tồn tại → `.env.local` (hosted) không lấn át.
- **Nạp dữ liệu qua `SUPABASE_SERVICE_ROLE_KEY` thay vì Studio Table Editor** — cho
  set `role='admin'` + dự án demo. Nhanh, script được, và service key bỏ qua RLS lẫn
  trigger `prevent_role_self_change` (trigger chỉ chặn khi có `auth.uid()`).
- **Dùng dự án demo trước khi có dự án thật** — người dùng chọn kiểm thử giao diện
  portal ngay với 1 dự án giả đầy đủ (milestone xong/chưa, nhiều nhật ký) thay vì
  chờ dữ liệu khách hàng thật. Xoá được khi không cần.
- **`requireAdmin()` dời sang Giai đoạn 2** — theo đúng thiết kế gốc: Giai đoạn 1
  không có route/Server Action nào cần, thêm sớm sẽ là code chết.
- **`formatVnDate` tự viết bằng `Intl.DateTimeFormat`**, không thêm thư viện ngày
  tháng ngoài (dayjs/date-fns) — giữ đúng nguyên tắc "không thêm dependency thừa
  cho site nhỏ" của dự án, Node 22 (full-ICU) đủ để định dạng `dd/mm/yyyy` theo
  giờ Việt Nam mà không cần thư viện.
