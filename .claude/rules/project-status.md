# Trạng thái triển khai — Client Portal (Giai đoạn 1 xong · Giai đoạn 2 nền tảng đã merge)

**Cập nhật lần cuối: 2026-09-09.** Giai đoạn 1 đã hoàn tất từ trước (xem bên dưới).
Giai đoạn 2 (khu quản trị `/portal/admin`) đã có **spec** (`fd0722b`) và **plan**
21 task (`320a6e4`). **Task 1–6 + stub `/portal/admin` đã merge vào `main`** (merge
`--no-ff` `e10f070`, 2026-09-09) và **push `origin/main`**; **worktree
`.claude/worktrees/portal-giai-doan-2` + branch `worktree-portal-giai-doan-2` đã xoá.**
Còn Task 7–21 (UI quản trị, duyệt khách, gán `project_members`, integration RLS +
E2E) — làm ở phiên sau, trực tiếp trên `main` hoặc worktree mới. Docker vẫn tắt nên
phần test DB tiếp tục **bị hoãn**. Cũng trong phiên: `graphify-out/` (knowledge
graph của repo, 502 nodes) đã commit vào `main`. Chi tiết: mục "Phiên 2026-09-09"
bên dưới.

---

# Trạng thái triển khai — Giai đoạn 1 (Client Portal)

**Tổng kết toàn phiên:** Giai đoạn 1 (client portal đăng nhập Google — 4 slice, 33
commit tính năng) đã hoàn tất, review sạch qua từng task lẫn tổng thể, đã merge vào
`main` và **đã push lên `origin/main`** (đồng bộ, cùng commit `f50b335`). Site
**chỉ chạy local** — chưa deploy lên nền tảng nào. Ngày 2026-09-08 đã dựng Supabase
**hosted** (`obcfgqkaokghxgauomxo`, region `ap-northeast-1`), push schema, bật Google
provider và **chạy Google OAuth thật thành công end-to-end**; đã cấp `role='admin'`
cho `luongthedat@gmail.com` và nạp **1 dự án demo** (5 milestone + 3 nhật ký) qua
service key để kiểm thử giao diện. Cùng ngày đã tách môi trường test khỏi `.env.local`
bằng file `.env.test` (**đã commit** — `88c1cb0`, ngoại lệ `!.env.test` trong
`.gitignore`). Việc còn lại: không bao giờ đặt `E2E_TEST_LOGIN=1` ở môi trường thật
(xem [[portal-env-security]]), và nạp dữ liệu **dự án thật** khi có.

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

**Đã commit** (`88c1cb0`, đã push `origin/main` ngày 2026-09-09).

### Phiên 2026-09-08 (tiếp 3) — Giai đoạn 2: khu quản trị `/portal/admin` (đang thực thi)

**Bối cảnh:** brainstorm + spec Giai đoạn 2 đã xong (`fd0722b`), plan 21 task đã
xong (`320a6e4`). Người dùng chọn thực thi qua `subagent-driven-development` trong
**git worktree** (như Giai đoạn 1).

**Thiết lập worktree:**
- `EnterWorktree name=portal-giai-doan-2` → `.claude/worktrees/portal-giai-doan-2`,
  branch `worktree-portal-giai-doan-2`.
- **Lưu ý:** `EnterWorktree` mặc định branch từ `origin/main` (`worktree.baseRef=fresh`),
  mà `origin/main` (`88c1cb0`) đang **sau** local `main` (`320a6e4`) → worktree
  ban đầu thiếu spec + plan. Đã `git reset --hard main` trong worktree để lấy đủ.
- `npm install`, `npm run build` (sinh `.next/types` cho `PageProps`/`LayoutProps`),
  baseline: `tsc=0`, `lint` 0 lỗi (2 warning cũ ở `LoginButton.tsx` +
  `database.types.ts`), unit **25/25**.
- Docker Desktop **TẮT** suốt phiên → chưa chạy được `npx supabase start` →
  integration RLS + E2E + mọi script kiểm truy vấn/ghi thật (Bước 3 của Task 5,6,…)
  **HOÃN**.

**Đã làm (6/21 task, mỗi task 1 subagent + 1 review độc lập):**

| Task | Commit | Nội dung | Review |
|---|---|---|---|
| 1 | `64b67d5` | `resolveAdminAccess` + `requireAdmin` + `postLoginPath` vào `src/lib/portal/session.ts` (thuần + async, 8 unit test) | CLEAN |
| 2 | `5cecdfd` | `src/app/auth/callback/route.ts` redirect theo `role` (admin → `/portal/admin`) | CLEAN |
| 3 | `513b8bc` | `src/lib/portal/admin-validation.ts` — 5 hàm validate thuần (20 unit test) | CLEAN |
| 4 | `b050f21` | `src/lib/portal/milestone-order.ts` — `reorderMilestones` thuần (6 unit test) | CLEAN |
| 5 | `9031806` | `src/lib/portal/admin-queries.ts` — 7 hàm truy vấn đọc (`server-only`) | CLEAN (⚠ chưa kiểm DB thật) |
| 6 | `f0cbaf3` | `src/lib/portal/admin-actions.ts` (`"use server"`) — `createProject`/`updateProject`/`deleteProject` + `admin-action-state.ts` (type `ActionState` + `initialActionState`) | CLEAN (⚠ chưa kiểm DB thật) |

Xác minh chung sau Task 6: `tsc=0`, `lint` 0 lỗi, `npm run build` xanh, unit
**59/59** pass (25 cũ + 8 `require-admin` + 20 `admin-validation` + 6 `milestone-order`).

- Plan đã sửa 1 lần: `c3a0b8d` (tách `ActionState`/`initialActionState` — xem "Quyết
  định" bên dưới).
- Ledger SDD: `.superpowers/sdd/2026-09-08-portal-giai-doan-2-admin/progress.md`
  (**gitignored**, chỉ tồn tại trong worktree). Task brief + report + review từng
  task cũng ở thư mục đó.

**Còn lại (Task 7–21):**
- 7–9: `admin-actions.ts` thêm action cho mốc / nhật ký / khách+thành viên.
- 10–15: components (`AdminNav`, `DeleteButton`, `ProjectForm`, `MilestoneManager`,
  `UpdateManager`, `MemberList`, `ApproveAssignForm`) + token `--danger`/`--success`
  vào `globals.css`.
- 16–18: pages (`/portal/admin`, `projects/new`, `projects/[id]`, `pending/[profileId]`).
- 19: integration RLS (`tests/integration/admin-rls.test.ts`) — **cần Docker**.
- 20: E2E (`tests/e2e/admin.spec.ts`, thêm `EMAILS.admin`) — **cần Docker**.
- 21: cập nhật docs (`portal-architecture.md`, file này, `CLAUDE.md`) + xác minh
  hoàn thành toàn kế hoạch + final review toàn nhánh + `finishing-a-development-branch`.

### Phiên 2026-09-09 — Merge nền tảng Giai đoạn 2 + graphify

1. **`graphify-out/` vào `main`** — chạy graphify trên repo (95 file: `src/`,
   `supabase/`, `.claude/rules/`, `docs/superpowers/`; loại `.claude/skills/**` +
   `.superpowers/**`). Kết quả: `graph.json` 502 nodes · 704 edges · 46 community,
   `graph.html`, `GRAPH_REPORT.md`, `cache/`. `graphify-out/.gitignore` loại file
   máy-cụ-thể (`.graphify_python`, `.graphify_root`, `cache/last_query_stamp`).
   Commit `c6165bf`. Cần `pip`/`uv` package `graphifyy[sql]` để AST bắt migration SQL.
2. **Stub `/portal/admin`** (`cf9c218`) — `/auth/callback` đã redirect admin →
   `/portal/admin` từ Task 2 (`5cecdfd`), nhưng route chưa có → admin đăng nhập bị
   **404**. Thêm `src/app/portal/admin/page.tsx` gọi `requireAdmin()` (non-admin →
   `/portal`, chưa login → `/login`) + thông báo "đang xây dựng". Trang làm việc
   thật vẫn thuộc Task 16–18.
3. **Merge worktree → `main`** (`e10f070`, `--no-ff`) — fast-forward được nhưng
   dùng `--no-ff` cho rõ lịch sử. Kiểm trước merge (trên nhánh): `tsc` sạch, unit
   **59/59**, `build` OK, `lint` 0 lỗi. Kiểm sau merge (trên `main`): `tsc` sạch,
   unit 59/59, `build` OK.
4. **Xoá worktree + branch** — `git worktree remove` + `git branch -d
   worktree-portal-giai-doan-2`. `.claude/worktrees/` giờ rỗng. Ledger SDD
   `.superpowers/sdd/...` (gitignored) mất theo worktree.
5. **Push `origin/main`** — `main` đồng bộ `origin/main` sau nhiều phiên chỉ giữ local.

**Task 7–21 còn lại:** làm trực tiếp trên `main` hoặc tạo worktree mới (nếu tạo
worktree, push `main` trước hoặc `git reset --hard main` trong worktree — xem quyết
định "EnterWorktree branch từ origin/main" bên dưới). Không còn ledger SDD cũ; bắt
đầu lại vòng `subagent-driven-development` từ Task 7 theo plan `320a6e4`.

## Trạng thái từng phần

| Phần | Trạng thái | Ghi chú |
|------|-----------|---------|
| Slice 1 — Hạ tầng Supabase (schema, RLS, seed, client Next) | ✅ Xong, đã merge | 8 task, 1 vòng vá lỗi (seed thiếu cột token) |
| Slice 2 — Đăng nhập/đăng xuất Google + bảo vệ route | ✅ Xong, đã merge | 8 task. **Google OAuth thật đã chạy end-to-end** (2026-09-08, Supabase hosted): trigger `handle_new_user` tự tạo `profiles` role `pending` khi login lần đầu |
| Slice 3 — Dashboard danh sách dự án | ✅ Xong, đã merge | 6 task. 1 regression liên-slice được phát hiện + vá (đổi UI làm vỡ test Slice 2) |
| Slice 4 — Chi tiết dự án (milestone + nhật ký) | ✅ Xong, đã merge | 7 task. Đã kiểm chứng độc lập qua curl thật: không rò rỉ dữ liệu chéo giữa khách hàng |
| Merge vào `main` | ✅ Xong | Test xanh trên kết quả merge: 34/34 unit+integration, 15/15 E2E, `tsc`/`lint`/`build` sạch |
| Push lên `origin/main` | ✅ Xong (2026-09-09) | `main` == `origin/main` sau merge Giai đoạn 2 (`e10f070`) |
| Supabase hosted + OAuth thật | ✅ Xong (2026-09-08) | Project `obcfgqkaokghxgauomxo` (`ap-northeast-1`). 3 migration đã `supabase db push`. Google provider bật, đăng nhập thật OK. `.env.local` trỏ hosted. 1 dự án demo + admin `luongthedat@gmail.com` nạp qua service key |
| Môi trường test local (`.env.test`) | ✅ Xong, **đã commit** (`88c1cb0`) + push | `npm run test` + `npm run test:e2e` tự nạp `.env.test` → không cần đổi `.env.local`. Unit pass, `tsc` sạch; integration RLS + E2E chưa chạy lại (thiếu Docker) |
| Giai đoạn 2 — spec + plan | ✅ Xong | Spec `fd0722b`, plan 21 task `320a6e4` (đều trên `main`) |
| Giai đoạn 2 — thực thi (Task 1–6 + stub) | ✅ Đã merge `main` (`e10f070`, 2026-09-09) | DAL `requireAdmin`/`postLoginPath`, `/auth/callback` theo role, `admin-validation`, `milestone-order`, `admin-queries`, `admin-actions` (CRUD dự án), stub `/portal/admin`. Task 1–6 review CLEAN (Task 5–6 ⚠ chưa kiểm DB thật). Worktree + branch đã xoá |
| Giai đoạn 2 — Task 7–21 | ⬜ Chưa làm | actions mốc/nhật ký/khách, 7 component, page làm việc thật, integration RLS + E2E (cần Docker), docs + final review. Làm trên `main` hoặc worktree mới |
| Knowledge graph (`graphify-out/`) | ✅ Xong (2026-09-09), đã commit `c6165bf` | 502 nodes. Cập nhật: `graphify . --update` từ repo root |

## Bước tiếp theo (phiên sau)

**Tiếp tục Giai đoạn 2 (ưu tiên):**

1. **Bật Docker Desktop** → `npx supabase start` + `npx supabase db reset`. Bắt buộc
   cho Task 19 (integration RLS), Task 20 (E2E), và để chạy lại phần kiểm truy
   vấn/ghi thật đã hoãn ở Task 5–6 (và sẽ hoãn ở Task 7, 9).
2. **Bắt đầu lại vòng `subagent-driven-development` từ Task 7** theo plan `320a6e4`.
   Worktree + ledger SDD cũ đã mất khi xoá nhánh — dựng workspace SDD mới. Làm trực
   tiếp trên `main` hoặc worktree mới (nếu worktree: push `main` trước, hoặc
   `git reset --hard main` trong worktree — xem quyết định "EnterWorktree" bên dưới).
   Model: haiku cho task cơ học, sonnet cho task tích hợp + mọi review.
3. **Cuối kế hoạch:** final review toàn nhánh → `finishing-a-development-branch` →
   merge `main` + push. Nếu dùng worktree thì xoá worktree + workspace SDD sau merge.

**Việc dọn dẹp còn tồn:**

4. **Đổi mật khẩu DB Supabase hosted** — mật khẩu đặt lúc tạo project bị lộ trong
   transcript khi chạy `supabase db push --db-url`. Studio → Project Settings →
   Database → Reset. App không dùng mật khẩu này (chỉ `NEXT_PUBLIC_SUPABASE_*` +
   service key) nên đổi không ảnh hưởng.
5. **Nhập dữ liệu dự án thật** (khi có khách) — sau Giai đoạn 2 sẽ làm qua
   `/portal/admin`, không cần Studio. Có thể xoá dự án demo "Trợ lý AI nội bộ — Demo".
6. **(Tuỳ chọn)** `roleToScreen` (`src/lib/portal/session.ts`) vẫn chỉ dùng trong
   unit test — Giai đoạn 2 không dùng tới; cân nhắc dọn bỏ ở Task 21 hoặc để lại.

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

### Giai đoạn 2 (phiên 2026-09-08 "tiếp 3")

- **Giai đoạn 2 KHÔNG có migration mới, KHÔNG sửa RLS** — mô hình 5 bảng và policy
  `is_admin()` (cho mọi `INSERT/UPDATE/DELETE`) đã đủ từ Slice 1. Khu admin chỉ
  thêm lớp DAL `requireAdmin()` (phòng thủ lớp 2 trên RLS) + trang + Server Action.
  Chốt trong spec sau khi rà lại `20260828000003_portal_rls.sql`.
- **`requireAdmin()` KHÔNG thêm điều kiện role vào `src/proxy.ts`** — proxy chỉ đọc
  cookie, không biết `role` (phải query `profiles`). Phân biệt role là việc của DAL
  (`requireAdmin` gọi ở đầu mỗi page `/portal/admin/**` + đầu mỗi Server Action),
  RLS `is_admin()` là lớp cuối. Giữ đúng kiến trúc 3 lớp Slice 2.
- **`/auth/callback` là chỗ DUY NHẤT phân luồng redirect theo role** (`admin` →
  `/portal/admin`, còn lại → `/portal`). `/portal` KHÔNG auto-redirect admin đi đâu
  cả — admin gõ `/portal` vẫn xem được danh sách mọi dự án ("xem như khách"), nếu
  redirect thì `/portal` thành bất khả dụng với admin. Tách nhánh này thành hàm
  thuần `postLoginPath(role)` để unit test (nhất quán với `roleToScreen` sẵn có).
- **Tách `ActionState` + `initialActionState` sang `src/lib/portal/admin-action-state.ts`**
  (file thường, KHÔNG `"use server"`) — file `"use server"` chỉ được export **async
  function**; `export const initialActionState = {}` trong `admin-actions.ts` sẽ làm
  `next build` fail. Plan gốc đặt nhầm trong `admin-actions.ts`; đã sửa plan
  (`c3a0b8d`) + cập nhật import ở Task 11–15. `admin-actions.ts` chỉ `import type
  { ActionState }`; component import `initialActionState` trực tiếp từ file mới.
- **Ô nhập form (`input`/`textarea`/`select`) dùng `rounded-lg`** — `visual-style.md`
  chỉ quy định bo góc cho card (`rounded-2xl`) và nút (pill), không nói về form
  control. Chốt `rounded-lg` làm nhóm mới nhất quán trong khu admin, không đụng bo
  góc card/nút hiện có.
- **Thêm token `--danger` / `--danger-foreground` / `--success` vào `globals.css`**
  (Task 10) — spec cấm hardcode hex, mà chưa có token cho trạng thái lỗi/thành công
  của form. Thêm token thay vì dùng class `text-red-600` off-palette. Đây là sai
  lệch có chủ đích so với "danh sách file §10" của spec (spec không nhắc `globals.css`).
- **Hàm thuần tách khỏi file `"use server"`** — `admin-validation.ts` và
  `milestone-order.ts` (`reorderMilestones`) phải là file riêng, không nhét trong
  `admin-actions.ts`, cùng lý do "use server" chỉ export async. Spec §6.2/§9.1 yêu
  cầu "hàm thuần test riêng" nhưng không đặt tên file → tách file là cách hợp lệ.
- **Thực thi Giai đoạn 2 trong git worktree** (người dùng chọn, như Giai đoạn 1) —
  `.claude/worktrees/portal-giai-doan-2`. **`EnterWorktree` mặc định branch từ
  `origin/main` (`worktree.baseRef=fresh`)** mà `origin/main` đang sau local `main`
  → worktree thiếu spec + plan; phải `git reset --hard main` trong worktree. Ghi
  nhớ cho lần tạo worktree sau: hoặc push `main` trước, hoặc reset sau khi tạo.
- **Model theo vai trò** — `haiku` cho task cơ học (hàm thuần + copy code từ brief:
  Task 1–4), `sonnet` cho task tích hợp (truy vấn/action Supabase: Task 5–6) và
  **mọi** task review. Tiết kiệm chi phí, giữ chất lượng.
- **Phần test phụ thuộc Docker bị hoãn, không chặn** — Docker Desktop tắt suốt phiên.
  Các bước "kiểm truy vấn/ghi thật bằng script tạm" (Bước 3 của Task 5, 6, và sẽ là
  Task 7, 9), Task 19 (integration RLS), Task 20 (E2E) **hoãn** tới khi bật Docker.
  Task cơ học/thuần + `tsc`/`lint`/`build` vẫn xác minh đầy đủ. Rủi ro: shape embed
  Supabase trong `admin-queries.ts` chưa chạy thật (tsc chấp nhận cast nhưng runtime
  chưa xác nhận).

### Phiên 2026-09-09

- **Merge Giai đoạn 2 dở dang (Task 1–6) vào `main`** — người dùng chốt merge sớm
  thay vì đợi hết 21 task. Phần đã merge là code nền (DAL guard, hàm thuần, query/
  action đọc-ghi chưa gắn UID) + stub page; không phá luồng khách hiện có. Đánh đổi:
  `admin-queries`/`admin-actions` vào `main` khi chưa kiểm DB thật (Docker tắt).
- **Thêm stub `/portal/admin` khi merge** — Task 2 (`5cecdfd`) đã đấu
  `postLoginPath("admin") → "/portal/admin"` nhưng route thuộc Task 16–18. Merge
  nguyên trạng ⇒ admin login 404. Chọn thêm page tối giản (gọi `requireAdmin()` +
  thông báo) thay vì hoãn merge hoặc lùi Task 2 — rẻ, không chặn, tự thay khi Task
  16–18 làm trang thật.
- **Merge `--no-ff` dù fast-forward được** — nhánh chứa toàn bộ `main` nên FF được,
  nhưng `--no-ff` giữ 1 merge commit gom nhóm Giai đoạn 2 trong lịch sử (nhất quán
  với cách merge Giai đoạn 1).
- **`graphify-out/` commit vào repo (kể cả `cache/`)** — người dùng chọn commit thay
  vì gitignore, để clone về là `graphify query` / `--update` chạy ngay. Chỉ gitignore
  file máy-cụ-thể (`graphify-out/.gitignore`). Loại `.claude/skills/**` +
  `.superpowers/**` khỏi corpus (scaffolding, không phải nội dung dự án).
