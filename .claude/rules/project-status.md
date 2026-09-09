# Trạng thái triển khai — Client Portal (Giai đoạn 1 xong · Giai đoạn 2 code xong, chờ test Docker)

**Cập nhật lần cuối: 2026-09-09.** Giai đoạn 1 đã hoàn tất từ trước (xem bên dưới).
Giai đoạn 2 (khu quản trị `/portal/admin`) — spec `fd0722b`, plan 21 task `320a6e4`.
**Task 1–6 + stub merge `main` (`e10f070`).** Phiên tiếp theo (2026-09-09):
**Task 7–20 thực thi trực tiếp trên `main`** qua `subagent-driven-development` (20
commit tính năng, mỗi task 1 subagent + 1 review độc lập — tất cả CLEAN, 1 vòng fix
ở Task 12 + 2 vòng fix nhỏ ở Task 19–20). Khu admin đã đủ: 3 nhóm Server Action
(dự án/mốc/nhật ký/khách), 7 component, 4 route làm việc thật, token `--danger`/
`--success`. `tsc`/`lint`/`build` xanh xuyên suốt; unit 59/59.
Sau đó thêm 1 UX fix (`a1754d6`): link "Khu quản trị" trên header `/portal` cho
admin (trước đó admin xem giao diện khách bị kẹt, không có lối về `/portal/admin`).
Smoke-test qua dev server trỏ hosted: 4 route `/portal/admin*` khi CHƯA đăng nhập
→ proxy redirect `/login` đúng, không lỗi compile/console.
**Còn HOÃN (cần Docker):** chạy `admin-rls.test.ts` (Task 19, file đã viết) +
`admin.spec.ts` E2E (Task 20, file đã viết) + kiểm truy vấn/ghi Supabase thật (Task
5–9) + Task 21 Bước 5 (xác minh cuối) + `finishing-a-development-branch`. Task 21
docs (rule/status/CLAUDE.md) đã cập nhật. Chi tiết: "Phiên 2026-09-09 (tiếp) —
Giai đoạn 2 Task 7–21".

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

### Phiên 2026-09-09 (tiếp) — Cài graphify commit hook

`graphify hook install` (chạy từ env uv tool `C:\Users\The Dat\AppData\Roaming\uv\tools\graphifyy`):

- **`.git/hooks/post-commit` + `post-checkout`** (không commit được, nằm trong `.git/`):
  sau mỗi commit lấy `git diff HEAD~1`, chạy lại **chỉ AST extraction** trên file code
  thay đổi, rebuild `graphify-out/graph.json` + `GRAPH_REPORT.md`. Chạy **detached**
  (commit trả về ngay), log `~/.cache/graphify-rebuild.log`. Không LLM/Docker/API key.
  Tự bỏ qua khi rebase/merge/cherry-pick và khi chỉ có file `graphify-out/` đổi.
  Docs/ảnh hook bỏ qua — vẫn phải `graphify . --update` thủ công. Tắt 1 lần:
  `GRAPHIFY_SKIP_HOOK=1 git commit`. Gỡ: `graphify hook uninstall`.
- **Merge driver `graphify`** đăng ký trong `.git/config` (local, per-clone —
  clone mới phải chạy lại `graphify hook install`): union-merge cho `graph.json`.
- **`.gitattributes` (mới, đã commit)** — `graphify-out/graph.json merge=graphify`.
  Chỉ khai báo tên driver; driver thật vẫn đăng ký riêng mỗi máy.
- Khôi phục sidecar `graphify-out/.graphify_python` + `.graphify_root` (gitignored,
  không commit) — không cần cho hook (`_PINNED` trong hook đã trỏ đúng python) nhưng
  cần cho các lệnh `graphify query` / `--update` thủ công.

### Phiên 2026-09-09 (tiếp) — Giai đoạn 2 Task 7–21 (`subagent-driven-development`, trên `main`)

**Bối cảnh:** người dùng chọn thực thi **trực tiếp trên `main`** (không worktree —
`origin/main` đã đồng bộ nên không lệch). Workspace SDD mới
`.superpowers/sdd/2026-09-08-portal-giai-doan-2-admin/` (ledger cũ mất khi xoá
worktree). Model: sonnet cho implementer + mọi review. Docker TẮT suốt phiên.

**Đã làm (Task 7–20, 20 commit tính năng — mỗi task 1 implementer + 1 review độc lập):**

| Task | Commit | Nội dung | Review |
|---|---|---|---|
| 7 | `4754c9d` | `admin-actions`: 5 action mốc (thêm/đổi tên/toggle/xoá/sắp thứ tự) | CLEAN |
| 8 | `ff3bab6` | `admin-actions`: 3 action nhật ký (thêm/sửa/xoá) | CLEAN |
| 9 | `717fb63` | `admin-actions`: `approveAndAssign` + `addMember`/`removeMember` | CLEAN |
| 10 | `13dda9c` | token `--danger`/`--success` + `DeleteButton` + `AdminNav` | CLEAN |
| 11 | `c0f7b95` | `ProjectForm` + trang `/portal/admin/projects/new` | CLEAN |
| 12 | `a3ce471` + `16fa4d4` | `MilestoneManager` — review bắt lỗi set-state-in-render, fix bằng pattern so sánh prev-state | CLEAN sau fix |
| 13 | `cd1c7fd` | `UpdateManager` — áp sẵn 2 pattern lint từ Task 12 | CLEAN |
| 14 | `72b5ce3` | `MemberList` (Server Component, inline server action) | CLEAN |
| 15 | `0ef7c64` | `ApproveAssignForm` | CLEAN |
| 16 | `b7cec7a` | trang chủ `/portal/admin` 3 khu (thay stub) | CLEAN |
| 17 | `496b194` | trang chi tiết `/portal/admin/projects/[id]` | CLEAN |
| 18 | `b0af2e2` | trang duyệt khách `/portal/admin/pending/[profileId]` | CLEAN |
| 19 | `27f1272` + `4b95ddd` | `admin-rls.test.ts` (5 case) — **chưa chạy**, tên test khớp assertion | CLEAN sau fix |
| 20 | `b04c47f` + `109a9fd` | `admin.spec.ts` E2E + `EMAILS.admin` — **chưa chạy**, fix 2 selector | NEEDS_CHANGES → fix |

Xác minh chung: `tsc=0`, `lint` 0 lỗi (2 warning cũ), `npm run build` xanh, unit
**59/59** — chạy lại sau mỗi task.

**Task 21:** docs (`portal-architecture.md`, file này, `CLAUDE.md`) đã cập nhật.
Seed đủ persona (admin + pending + 3 client) — không sửa. **Bước 5 (xác minh cuối:
`npm run test` + `test:e2e` + kiểm responsive) + `finishing-a-development-branch`
HOÃN** — cần Docker.

**Sau Task 21 — smoke-test + UX fix (ngoài plan, theo yêu cầu người dùng):**
- **Smoke-test** qua `npm run dev` trỏ hosted (`.env.local` → `obcfgqkaokghxgauomxo`):
  4 route `/portal/admin*` khi CHƯA đăng nhập → proxy redirect `/login` (200), 0
  console error, 0 request fail. Lớp bảo vệ 1 (proxy) OK. Luồng đã đăng nhập (CRUD,
  reorder, duyệt khách) người dùng tự kiểm bằng Google OAuth thật (`luongthedat@`).
- **`a1754d6`** — thêm pill "Khu quản trị" (`ShieldCheck` → `/portal/admin`) vào
  header `src/app/portal/layout.tsx`, chỉ hiện khi `profile?.role === "admin"`.
  Trước đó admin bấm "Xem như khách" sang `/portal` rồi bị kẹt, không có lối về khu
  admin theo phiên. Layout đã sẵn gọi `getSessionProfile()` để hiện tên (comment
  ghi rõ: hiển thị, KHÔNG phải auth check) → không thêm truy vấn. Pill cũng hiện
  trên `/portal/admin/*` (trùng nhẹ với `AdminNav`, giữ làm lối tắt cố định). Sai
  lệch có chủ đích so với "Không sửa: `src/app/portal/layout.tsx`" của plan §10.

**Lỗi bắt được trong review (không lọt xuống `main`):**
- Task 12/13: `if (state.ok) setEditing(false)` trong thân render — với `useActionState`,
  `state` giữ `{ ok: true }` tới lần dispatch kế → ô sửa đóng oan lần sau. Lint dự án
  chặn cả set-state-in-render lẫn setState-trong-useEffect → phải dùng pattern React
  "adjust state during render" (so sánh `prev` state). Form reset qua `useEffect` +
  `ref.reset()` (không phải setState nên hợp lệ).
- Task 20: `getByRole("textbox").filter({hasText:""}).last()` (no-op filter, trúng
  nhầm ô "Người đăng") + `getByRole("button",{name:"Lưu"})` khớp substring "Lưu thay
  đổi" → scope vào `alphaRow` + `exact: true`.

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
| Giai đoạn 2 — Task 7–18 (actions + component + route) | ✅ Xong, trên `main` (2026-09-09) | Task 7–9 action mốc/nhật ký/khách; Task 10–15 token + 7 component; Task 16–18 trang chủ 3 khu + chi tiết dự án + duyệt khách. 20 commit, mỗi task review CLEAN. `tsc`/`lint`/`build` xanh, unit 59/59. ⚠ truy vấn/ghi Supabase chưa kiểm DB thật (Docker tắt) |
| Giai đoạn 2 — Task 19 (integration RLS) | 🟡 File viết xong (`27f1272`+`4b95ddd`) | `tests/integration/admin-rls.test.ts` — 5 case. **CHƯA CHẠY**: cần `npx supabase start && db reset && npm run test -- admin-rls` → kỳ vọng 5/5 |
| Giai đoạn 2 — Task 20 (E2E) | 🟡 File viết xong (`b04c47f`+`109a9fd`) | `tests/e2e/admin.spec.ts` + `EMAILS.admin`. **CHƯA CHẠY**: cần `npx supabase db reset && npm run test:e2e`. Selector có thể phải chỉnh khi chạy thật (không nới lỏng assertion) |
| Giai đoạn 2 — Task 21 (docs + xác minh cuối) | 🟡 Docs xong, xác minh HOÃN | Rule/status/CLAUDE.md đã cập nhật. Bước 5 (chạy full test + e2e + kiểm responsive) + `finishing-a-development-branch` chờ Docker |
| Giai đoạn 2 — smoke-test (dev trỏ hosted) | ✅ Một phần (2026-09-09) | 4 route `/portal/admin*` chưa login → proxy redirect `/login`, 0 lỗi. Luồng đã-login (CRUD/reorder/duyệt) người dùng tự kiểm qua Google OAuth thật |
| Giai đoạn 2 — UX: link "Khu quản trị" ở header portal | ✅ Xong, `a1754d6` | Pill hiện khi `role === "admin"` trên `src/app/portal/layout.tsx` — admin xem giao diện khách có lối quay về `/portal/admin` |
| Knowledge graph (`graphify-out/`) | ✅ Xong (2026-09-09), đã commit `c6165bf` | 502 nodes. Cập nhật: `graphify . --update` từ repo root |
| graphify commit hook | ✅ Cài (2026-09-09) | `post-commit`/`post-checkout` auto-rebuild AST sau mỗi commit (detached, không LLM). `.gitattributes` union-merge cho `graph.json` đã commit; merge driver đăng ký per-clone qua `graphify hook install` |

## Bước tiếp theo (phiên sau)

**Hoàn tất Giai đoạn 2 (ưu tiên — chỉ còn phần cần Docker):**

1. **Bật Docker Desktop** → `npx supabase start` + `npx supabase db reset`.
2. **Chạy Task 21 Bước 5** (xác minh cuối toàn kế hoạch):
   `npm run test` (unit 59 + integration RLS cũ + `admin-rls` 5) ·
   `npm run test:e2e` (auth + dashboard + project-detail + admin) ·
   `npx tsc --noEmit` · `npm run lint` · `npm run build` — kỳ vọng tất cả xanh.
   Nếu `admin.spec.ts` selector không khớp markup thật → chỉnh selector (ưu tiên
   `getByRole` neo chặt, KHÔNG nới lỏng assertion). Nếu shape embed Supabase trong
   `admin-queries.ts` sai runtime → sửa mapping (rủi ro đã biết từ Task 5).
3. **Kiểm thủ công** (spec §11): non-admin (login) mở `/portal/admin*` → `/portal`
   (chưa login → `/login` đã xác minh smoke-test). Responsive `/portal/admin` +
   `projects/[id]` ở 375/768/1440 (skill/agent trình duyệt — xem
   [[mandatory-ui-checks]]). Xác nhận pill "Khu quản trị" ở header `/portal` chỉ
   hiện với admin, ẩn với client (`a1754d6` chưa có E2E — cân nhắc thêm 1 assertion
   vào `admin.spec.ts` / `dashboard.spec.ts`).
4. **Final review toàn nhánh Giai đoạn 2** (gồm cả `a1754d6`) rồi
   `finishing-a-development-branch` → push `origin/main`. Xoá workspace SDD
   `.superpowers/sdd/2026-09-08-portal-giai-doan-2-admin/`.

**Việc dọn dẹp còn tồn:**

5. **Đổi mật khẩu DB Supabase hosted** — mật khẩu đặt lúc tạo project bị lộ trong
   transcript khi chạy `supabase db push --db-url`. Studio → Project Settings →
   Database → Reset. App không dùng mật khẩu này (chỉ `NEXT_PUBLIC_SUPABASE_*` +
   service key) nên đổi không ảnh hưởng.
6. **Nhập dữ liệu dự án thật** (khi có khách) — làm qua `/portal/admin`, không cần
   Studio. Có thể xoá dự án demo "Trợ lý AI nội bộ — Demo".
7. **(Tuỳ chọn)** `roleToScreen` (`src/lib/portal/session.ts`) vẫn chỉ dùng trong
   unit test — Giai đoạn 2 không dùng tới; cân nhắc dọn bỏ hoặc để lại.
8. **graphify-out/ working tree "bẩn" sau mỗi commit** — post-commit hook rebuild
   `graph.json`/`GRAPH_REPORT.md`/... để lại thay đổi chưa commit (và file
   `.graphify_labels.json.sig`, thư mục ngày). Không ảnh hưởng feature commit; chạy
   `graphify . --update` + commit riêng, hoặc dọn `git checkout -- graphify-out/`.

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

### Phiên 2026-09-09 (tiếp) — Giai đoạn 2 Task 7–21

- **Task 7–21 thực thi trực tiếp trên `main`, KHÔNG worktree** (người dùng chọn) —
  `origin/main` đã đồng bộ local `main` nên không lặp lại vấn đề "worktree branch từ
  `origin/main` cũ" của phiên trước. Mỗi feature commit thẳng lên `main`; workspace
  SDD `.superpowers/sdd/...` (gitignored) chỉ để theo dõi tiến độ.
- **Khu admin KHÔNG thêm lớp `NODE_ENV` / proxy check** — `requireAdmin()` (DAL, gọi
  đầu mỗi page `/portal/admin/**` + đầu mỗi Server Action) + RLS `is_admin()` là đủ
  2 lớp trên proxy. Proxy chỉ đọc cookie, không biết `role` (phải query `profiles`)
  → phân biệt role là việc của DAL. Giữ nguyên kiến trúc 3 lớp spec §3.2.
- **`useActionState` + đóng ô sửa: pattern "adjust state during render"** — không
  dùng set-state trong thân render trực tiếp (lint `react-hooks` chặn) cũng không
  setState trong `useEffect` (lint cũng chặn); dùng `const [prev, setPrev] =
  useState(state); if (state !== prev) { setPrev(state); if (state.ok) ... }`. Form
  reset thì `useEffect(() => { if (state.ok) ref.reset() }, [state])` hợp lệ vì
  `.reset()` không phải setState. Áp cho `MilestoneManager` + `UpdateManager`.
- **Test phụ thuộc Docker: viết file, chưa chạy, không chặn** — Docker tắt cả phiên.
  `admin-rls.test.ts` (Task 19) + `admin.spec.ts` (Task 20) viết đầy đủ, `tsc`/`lint`
  xanh, commit lên `main` nhưng **chưa chạy lần nào**. Task 21 Bước 5 + final review
  + `finishing-a-development-branch` hoãn. Rủi ro còn treo: shape embed Supabase
  trong `admin-queries.ts` chưa xác nhận runtime; selector E2E có thể phải chỉnh.
- **Review giữa task bắt 3 lỗi trước khi lên `main`** (Task 12 set-state-in-render,
  Task 20 hai selector sai) — xác nhận giá trị của vòng review độc lập mỗi task kể
  cả khi implementer báo "copy nguyên văn brief" (brief tự nó có bug pattern).
- **Smoke-test qua dev server trỏ hosted, KHÔNG dựng local** — Docker vẫn tắt;
  người dùng chọn `npm run dev` (`.env.local` → hosted) để tự đăng nhập Google thật
  thay vì bật Docker. browser-automation chỉ xác minh được nhánh CHƯA đăng nhập (4
  route admin → proxy redirect `/login`); nhánh đã-login (CRUD/reorder/duyệt) do
  OAuth thật nên người dùng tự bấm. Đánh đổi: CRUD test đổi dữ liệu hosted thật (1
  dự án demo) — chấp nhận vì hosted chỉ để dev.
- **Link "Khu quản trị" đặt ở `portal/layout.tsx` (không phải từng page)** — layout
  bọc cả `/portal`, `/portal/[projectId]` lẫn `/portal/admin/*` và ĐÃ gọi
  `getSessionProfile()` cho việc hiện tên (comment nói rõ: hiển thị ≠ auth check).
  Thêm 1 điều kiện `profile?.role === "admin"` để render pill là rẻ nhất, 1 chỗ,
  không truy vấn mới. Chấp nhận pill hiện lại trên trang admin (trùng nhẹ với
  `AdminNav`) đổi lấy "luôn có lối về" — không cần đọc pathname trong Server
  Component. Sai lệch có chủ đích so với "Không sửa `layout.tsx`" của plan §10
  (yêu cầu người dùng, sau khi plan xong).
