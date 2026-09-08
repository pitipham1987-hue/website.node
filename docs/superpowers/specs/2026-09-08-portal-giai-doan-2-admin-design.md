# Giai đoạn 2 — Client portal: khu quản trị `/portal/admin`

- **Ngày:** 2026-09-08
- **Trạng thái:** Đã duyệt thiết kế (đối thoại), chờ người dùng duyệt bản spec → viết plan
- **Design doc gốc:** [2026-08-28-portal-dang-nhap-google-design.md](./2026-08-28-portal-dang-nhap-google-design.md)
  — mục 2.4 (`requireAdmin()` hoãn sang Giai đoạn 2), mục 6 "Giai đoạn 2 (spec + plan riêng)".
- **Giai đoạn trước:** Giai đoạn 1 (đăng nhập Google + dashboard khách hàng, 4 slice) đã
  hoàn tất, merge vào `main`, và chạy thật end-to-end trên Supabase hosted
  (`obcfgqkaokghxgauomxo`). Xem [project-status.md](../../../.claude/rules/project-status.md).
- **Giai đoạn sau:** không dự kiến (Giai đoạn 2 xoá bỏ toàn bộ thao tác thủ công còn lại).

## 1. Mục tiêu

Thay thế **hoàn toàn** các thao tác đang làm tay qua Supabase Studio / `SUPABASE_SERVICE_ROLE_KEY`
bằng một khu quản trị trong portal, chỉ dành cho `role = 'admin'`:

- CRUD `projects`, `milestones`, `updates`.
- Duyệt khách `pending → client`.
- Gán / gỡ `project_members`.

Sau Giai đoạn 2, nhân viên DNK House không cần mở Supabase Studio để vận hành portal
(ngoại trừ thao tác hiếm: hạ role, xoá hẳn profile — xem §7).

## 2. Bối cảnh kỹ thuật (không đổi ở Giai đoạn 2)

- **Mô hình dữ liệu đã đủ.** 5 bảng (`profiles`, `projects`, `project_members`,
  `milestones`, `updates`) từ `supabase/migrations/20260828000001_portal_schema.sql`.
  **Không có migration mới ở Giai đoạn 2.**
- **RLS đã mở sẵn mọi thao tác ghi cho `is_admin()`**
  (`20260828000003_portal_rls.sql`): `INSERT/UPDATE/DELETE` trên `projects`,
  `milestones`, `updates`, `project_members` đều `with check (public.is_admin())`;
  `profiles` cho `UPDATE` khi `is_admin()`. Hàm `public.is_admin()` đã tồn tại.
- **Trigger đã lo các hệ quả phụ:** `set_updated_at` (projects), `set_milestone_done_at`
  (milestones — tự set/xoá `done_at` theo `done`), `prevent_role_self_change` (chặn
  client tự nâng role; **không** chặn admin đổi role người khác).
- **Kiến trúc portal hiện tại** (xem [portal-architecture.md](../../../.claude/rules/portal-architecture.md)):
  Server Component + Server Action, không SPA; DAL `src/lib/portal/session.ts`;
  truy vấn `src/lib/portal/queries.ts` (`server-only`, RLS tự lọc theo `auth.uid()`);
  3 lớp bảo vệ (`src/proxy.ts` → DAL → RLS); toàn bộ tiếng Việt, không i18n; **không**
  dùng `ScrollReveal` / framer-motion trong portal; style theo token trong
  `src/app/globals.css` + icon `lucide-react`.

## 3. Kiểm soát truy cập

### 3.1 `requireAdmin()` — thêm vào `src/lib/portal/session.ts`

Đã được phác trong design doc gốc mục 2.4. Chữ ký và hành vi:

```ts
export async function requireAdmin(): Promise<SessionProfile>
```

- Gọi `getSessionProfile()` (đã có, bọc `React.cache`).
- `null` → `redirect("/login")`.
- `role !== "admin"` (gồm `pending` và `client`) → `redirect("/portal")`.
- Ngược lại → trả `SessionProfile`.

Tách phần thuần để test giống cặp `resolveClientAccess` / `requireClient` hiện có:

```ts
export function resolveAdminAccess(
  profile: SessionProfile | null,
): { status: "redirect-login" } | { status: "redirect-portal" } | { status: "ok"; profile: SessionProfile }
```

`requireAdmin()` chỉ là lớp mỏng gọi `resolveAdminAccess` rồi `redirect` tương ứng.

**Quy tắc:** mọi page `/portal/admin/**` gọi `requireAdmin()` ở dòng đầu; mọi Server
Action trong `admin-actions.ts` gọi `await requireAdmin()` trước khi làm bất cứ việc gì.

### 3.2 `src/proxy.ts` — không đổi

`pathname.startsWith("/portal/")` đã bao `/portal/admin`. Lớp proxy chỉ kiểm tra
"đã đăng nhập"; phân biệt role là việc của `requireAdmin()` (lớp DAL). Không thêm
logic role vào proxy (proxy chỉ đọc cookie, không có role).

### 3.3 RLS — không đổi

Server Action gọi `requireAdmin()` là **phòng thủ lớp 2**, không thay RLS. Nếu
`requireAdmin()` bị bỏ sót ở đâu đó, RLS `is_admin()` vẫn chặn ghi từ token không phải
admin. Bổ sung test integration khẳng định điều này (§6).

## 4. Route và điều hướng

### 4.1 Route mới (dùng chung `src/app/portal/layout.tsx` hiện có)

| Route | Trang |
|---|---|
| `/portal/admin` | Trang chủ admin — 3 khu (xem §5.1) |
| `/portal/admin/projects/new` | Form tạo dự án |
| `/portal/admin/projects/[id]` | Sửa dự án + quản lý mốc + quản lý nhật ký + quản lý thành viên, trong 1 trang |
| `/portal/admin/pending/[profileId]` | Form "Duyệt & gán dự án" cho 1 khách `pending` |

`src/app/portal/layout.tsx` hiện chỉ hiển thị tên + nút Đăng xuất, bọc mọi thứ dưới
`/portal` — dùng lại nguyên trạng cho khu admin, không sửa.

### 4.2 Điều hướng admin ↔ giao diện khách

- **`src/app/auth/callback/route.ts`** — sau `exchangeCodeForSession`, đọc
  `profiles.role` của user vừa đăng nhập: `admin` → `redirect("/portal/admin")`;
  còn lại → `redirect("/portal")` (hành vi hiện tại). Đây là chỗ **duy nhất** phân
  luồng theo role khi đăng nhập.
- **`/portal` (page khách) — không đổi, không auto-redirect.** Admin gõ hoặc bấm vào
  `/portal` vẫn thấy danh sách mọi dự án (RLS trả hết cho admin) — đây là "xem như
  khách". Không redirect ở page này để `/portal` không trở nên bất khả dụng với admin.
- **`/portal/[projectId]` — không đổi.** Admin xem được chi tiết bất kỳ dự án nào
  đúng như khách thấy.
- Trang admin cung cấp link rõ ràng để khỏi gõ URL:
  - `AdminNav` (thanh phụ đầu mọi trang admin): link **"Xem giao diện khách"** → `/portal`.
  - Mỗi dòng dự án ở `/portal/admin` và ở trang sửa dự án: link phụ **"Xem như khách"**
    → `/portal/[id]`.

## 5. Màn hình & thao tác

### 5.1 `/portal/admin` — trang chủ admin

Server Component. `requireAdmin()` đầu trang. Ba khu, theo thứ tự:

1. **Dự án** — tiêu đề + nút "Tạo dự án" (→ `/portal/admin/projects/new`). Danh sách
   mọi dự án, mỗi dòng: `name`, `status_label`, "N/M mốc", "K thành viên",
   link chính → `/portal/admin/projects/[id]`, link phụ "Xem như khách" → `/portal/[id]`.
   Sắp `updated_at` giảm dần. Rỗng → dòng chữ "Chưa có dự án nào."
2. **Khách chờ duyệt** (`role = 'pending'`) — mỗi dòng: `email`, `full_name` (hoặc "—"),
   ngày tạo (`formatVnDate`), nút "Duyệt & gán dự án" → `/portal/admin/pending/[profileId]`.
   Rỗng → "Không có khách nào đang chờ."
3. **Khách đã duyệt** (`role = 'client'`) — danh sách gọn, mỗi dòng: `email`,
   `full_name`, danh sách tên dự án đang tham gia (chip). Không có thao tác trực tiếp ở
   đây trong Giai đoạn 2 (gán/gỡ làm ở trang dự án — xem 5.3); khu này chỉ để admin
   nhìn tổng thể. Rỗng → "Chưa có khách nào được duyệt."

### 5.2 `/portal/admin/projects/new` và form dự án

- `new`: `<ProjectForm mode="create">`. Submit → `createProject` → khi thành công
  action `redirect` tới `/portal/admin/projects/[id mới]`.
- Trường: `name` (bắt buộc), `status_label` (bắt buộc, input text tự do — schema là
  text tự do, vd "Đang triển khai"), `summary` (textarea, tùy chọn).

### 5.3 `/portal/admin/projects/[id]` — trang làm việc chính của 1 dự án

Server Component. `requireAdmin()`. `id` sai định dạng UUID hoặc không tồn tại →
`notFound()`. Lấy dữ liệu qua `getAdminProjectDetail(id)`. Bố cục:

- **Sửa thông tin dự án** — `<ProjectForm mode="edit">` (cùng component, đổ sẵn giá
  trị). Submit → `updateProject`. Ở đây có nút **"Xoá dự án"** (`<DeleteButton>`):
  `confirm()` với nội dung nêu rõ "Xoá dự án kèm N mốc, M nhật ký, K gán thành viên —
  không hoàn tác được." → `deleteProject` → action `redirect("/portal/admin")`.
- **Các mốc triển khai** — `<MilestoneManager>` (client):
  - Danh sách theo `position` tăng dần. Mỗi dòng: checkbox `done` (toggle →
    `toggleMilestone`), tiêu đề (bấm vào → thành `<input>` inline, blur/Enter →
    `renameMilestone`, Esc → hủy), nút ▲ / ▼ (→ `reorderMilestone(id, "up"|"down")`;
    ẩn/disable ▲ ở đầu, ▼ ở cuối), nút xoá (`confirm()` → `deleteMilestone`).
  - Cuối danh sách: ô `<input>` + nút "Thêm mốc" → `addMilestone` (`position` = số
    lượng mốc hiện tại).
- **Nhật ký cập nhật** — `<UpdateManager>` (client):
  - Trên cùng: `<textarea>` (`body`) + `<input>` `author_name` **điền sẵn** `full_name`
    của admin đang đăng nhập (cho sửa) + nút "Đăng" → `addUpdate`.
  - Danh sách theo `created_at` giảm dần. Mỗi mục: ngày, `body` (giữ xuống dòng),
    `author_name`; nút "Sửa" (mở form nhỏ inline: textarea + author → `updateUpdate`;
    **không** đổi `created_at`), nút "Xoá" (`confirm()` → `deleteUpdate`).
- **Thành viên** — `<MemberList>` (Server Component + form Server Action):
  - Danh sách thành viên hiện tại (`email`, `full_name`), mỗi dòng nút "Gỡ" →
    `removeMember(projectId, profileId)` (chỉ xoá dòng `project_members`, không đụng `role`).
  - Ô thêm: `<select>` liệt kê `profiles` `role = 'client'` **chưa** ở trong dự án →
    nút "Thêm" → `addMember(projectId, profileId)`.

### 5.4 `/portal/admin/pending/[profileId]` — duyệt & gán (gộp)

Server Component + `<ApproveAssignForm>` (client). `requireAdmin()`. `profileId` không
phải profile `role = 'pending'` → `notFound()` (đã duyệt rồi thì không vào đây nữa).

- Hiện `email`, `full_name`, ngày tạo.
- `<ApproveAssignForm>`: multi-select (checkbox list) mọi dự án (`getAssignableProjects()`)
  + nút "Duyệt khách". Submit → `approveAndAssign(profileId, projectIds[])`:
  - Đổi `profiles.role` `pending → client`.
  - Chèn `project_members` cho từng `projectId` đã chọn.
  - `projectIds` rỗng **vẫn hợp lệ** (duyệt trước, gán sau ở trang dự án).
  - Thành công → action `redirect("/portal/admin")`.

## 6. Truy vấn, Server Actions, validation, lỗi

### 6.1 `src/lib/portal/admin-queries.ts` (mới, `import "server-only"`)

| Hàm | Trả về |
|---|---|
| `getAdminProjectList()` | Mọi dự án + `milestonesDone` / `milestonesTotal` + `memberCount`, sắp `updated_at` desc |
| `getPendingProfiles()` | `profiles` `role = 'pending'`: `id, email, fullName, createdAt` |
| `getClientProfiles()` | `profiles` `role = 'client'` + tên các dự án đang tham gia |
| `getAdminProjectDetail(id)` | 1 dự án: toàn bộ field + `milestones` (theo `position`) + `updates` (theo `created_at` desc) + `members` (`profileId, email, fullName`). `null` nếu không tồn tại |
| `getAssignableProjects()` | `{ id, name }[]` mọi dự án |
| `getAssignableClients(projectId)` | `profiles` `role = 'client'` chưa là thành viên của `projectId` |

Không tự kiểm role (page đã `requireAdmin()`, RLS đã lọc). Cùng pattern `queries.ts`
hiện tại. UUID được validate ở page trước khi gọi (như `requireProjectAccess` hiện có).

### 6.2 `src/lib/portal/admin-actions.ts` (mới, `"use server"`)

Hai kiểu action:

- **Có phản hồi lỗi theo field** (dùng `useActionState`, chữ ký `(prev, formData)`):
  `createProject`, `updateProject`, `addMilestone`, `renameMilestone`, `addUpdate`,
  `updateUpdate`, `approveAndAssign`.
- **Thao tác 1 bấm, không cần form validate** (form action bind sẵn tham số, trả `void`
  hoặc `throw`): `deleteProject`, `toggleMilestone`, `deleteMilestone`,
  `reorderMilestone`, `deleteUpdate`, `addMember`, `removeMember`.

Khung chung mỗi action:

```ts
export async function xxx(prev: State, formData: FormData): Promise<State> {
  await requireAdmin();
  const parsed = validateXxx(formData);         // §6.3
  if (!parsed.ok) return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  const supabase = await createClient();
  const { error } = await supabase.from(...)...; // ghi
  if (error) throw error;                        // → error.tsx
  revalidatePath(...);                            // path liên quan
  return { ok: true };                            // hoặc redirect(...) nếu nêu ở §5
}
```

Danh sách action:

- **Dự án:** `createProject` (thành công → `redirect` trang sửa), `updateProject`,
  `deleteProject` (→ `redirect("/portal/admin")`).
- **Mốc:** `addMilestone`, `renameMilestone`, `toggleMilestone`, `deleteMilestone`,
  `reorderMilestone(id, direction)`.
  - `reorderMilestone`: đọc toàn bộ mốc của dự án theo `position` hiện tại, hoán vị
    phần tử `id` với phần tử liền kề theo `direction`, rồi **ghi lại `position = 0..n-1`
    cho cả danh sách** theo thứ tự mới (tự lành nếu dữ liệu cũ có `position` trùng —
    seed Giai đoạn 1 dùng giá trị rời rạc nhưng không đảm bảo liên tục). Hàm tính thứ
    tự mới là hàm thuần, test riêng.
- **Nhật ký:** `addUpdate`, `updateUpdate`, `deleteUpdate`.
- **Khách & thành viên:** `approveAndAssign(profileId, projectIds)`,
  `addMember(projectId, profileId)`, `removeMember(projectId, profileId)`.

`revalidatePath` mục tiêu: thao tác trong 1 dự án → `revalidatePath("/portal/admin/projects/[id]", "page")`;
thao tác đổi danh sách/khách → thêm `revalidatePath("/portal/admin")`. Thao tác ảnh
hưởng giao diện khách (mốc, nhật ký, gán thành viên) → thêm `revalidatePath("/portal/[projectId]", "page")`
và `revalidatePath("/portal")`.

### 6.3 Validation — `src/lib/portal/admin-validation.ts` (mới, thuần, không I/O)

Mỗi hàm nhận `FormData` (hoặc giá trị đã rút), trả
`{ ok: true; value } | { ok: false; error?: string; fieldErrors: Record<string,string> }`.

| Trường | Quy tắc |
|---|---|
| `projects.name` | bắt buộc; `trim`; 1–200 ký tự |
| `projects.status_label` | bắt buộc; `trim`; 1–100 ký tự |
| `projects.summary` | tùy chọn; `trim`; ≤ 2000 ký tự; rỗng → `null` |
| `milestones.title` | bắt buộc; `trim`; 1–200 |
| `updates.body` | bắt buộc; `trim`; 1–5000 |
| `updates.author_name` | bắt buộc; `trim`; 1–120 |
| `approveAndAssign.projectIds` | mảng UUID hợp lệ; rỗng hợp lệ; phần tử sai định dạng → lỗi |
| `direction` (reorder) | `"up"` \| `"down"` |

### 6.4 Xử lý lỗi

- **Validation** → trả trong state, form hiện lỗi cạnh field (`useActionState` của React
  19). Không throw, không toast.
- **Lỗi Supabase bất ngờ** → `throw error` → `src/app/portal/error.tsx` (đã bọc `/portal/*`).
- **Không tìm thấy** (`/portal/admin/projects/[id]` id lạ; `/portal/admin/pending/[profileId]`
  không phải pending) → `notFound()` → `src/app/portal/not-found.tsx`.
- **Xoá** → `confirm()` trình duyệt trước submit. Với dự án, nội dung confirm nêu số
  lượng bản ghi con sẽ mất.
- **Race nhẹ** (mốc bị người khác xoá ngay trước khi reorder) → coi là lỗi Supabase
  bất ngờ → `error.tsx`. Không xử lý đặc biệt (1–2 admin, xác suất ~0).

## 7. Ngoài phạm vi

Giữ nguyên từ design doc gốc:

- Upload / chia sẻ tài liệu.
- Email thông báo (khách mới chờ duyệt; có cập nhật mới).
- Mời khách qua link / thêm email trước khi khách đăng nhập (khách **phải** tự đăng
  nhập Google lần đầu để có dòng `profiles`).
- Hạ `client → pending`, xoá hẳn `profiles` (hiếm; làm tay ở Studio khi cần).
- Cột `archived` cho dự án (xoá là xoá cứng, cascade).
- Giới hạn domain email, i18n, đổi landing page.
- Phân trang / tìm kiếm trong các danh sách admin (quy mô nhỏ: vài dự án, vài khách).

## 8. Components

Thư mục mới `src/components/portal/admin/`:

| Component | `"use client"` | Vai trò |
|---|---|---|
| `AdminNav` | không | Thanh phụ đầu trang admin: nhãn "Khu quản trị" + link "Xem giao diện khách" → `/portal` |
| `ProjectForm` | có | Tạo/sửa dự án; `useActionState`; lỗi theo field; trạng thái pending |
| `MilestoneManager` | có | Toggle done, sửa tiêu đề inline, ▲▼, xoá, ô thêm mốc |
| `UpdateManager` | có | Textarea đăng + danh sách có sửa (form inline) / xoá |
| `MemberList` | không | Danh sách thành viên + nút gỡ (form action) + select thêm |
| `ApproveAssignForm` | có | Nút duyệt + checkbox list dự án |
| `DeleteButton` | có | Bọc `confirm()` rồi submit form Server Action; dùng lại cho dự án / mốc / nhật ký |

Server Component thuần cho mọi phần đọc/danh sách; `"use client"` chỉ ở nơi cần
`useActionState` hoặc `confirm()`. Style: token `src/app/globals.css`, icon
`lucide-react`, bo góc / spacing theo [visual-style.md](../../../.claude/rules/visual-style.md).
**Không** `ScrollReveal`, **không** framer-motion.

## 9. Testing

### 9.1 Unit (Vitest) — `tests/unit/`

- `require-admin.test.ts` — `resolveAdminAccess` với `null` / `pending` / `client` /
  `admin` (mock DAL giống test `requireClient` hiện có).
- `admin-validation.test.ts` — mọi nhánh hợp lệ / không hợp lệ ở §6.3.
- `milestone-reorder.test.ts` — hàm thuần tính lại thứ tự `position`: đưa lên ở giữa,
  ở đầu (no-op), ở cuối (no-op), dữ liệu `position` trùng ban đầu.

### 9.2 Integration RLS (Vitest) — `tests/integration/`

- Token `client` `INSERT` / `UPDATE` / `DELETE` vào `projects`, `milestones`,
  `updates`, `project_members` → bị RLS từ chối.
- Token `admin` thực hiện các thao tác trên → thành công.
- (Bổ sung ca nào chưa có; một số đã tồn tại từ Slice 1.)

### 9.3 E2E (Playwright) — `tests/e2e/admin.spec.ts`

Đăng nhập qua `/auth/test-login?email=<admin seed>` (`E2E_TEST_LOGIN=1`).

1. **Vòng đời dự án:** admin tạo dự án → thêm 2 mốc → đổi thứ tự (▼ dòng 1) → đánh dấu
   1 mốc xong → sửa tiêu đề mốc inline → đăng 1 nhật ký. Kiểm tra hiển thị đúng sau mỗi
   bước (dùng `getByRole` với `level`/name neo chặt — bài học Slice 3).
2. **Duyệt & gán → khách thấy:** admin mở khách `pending`, duyệt + gán vào dự án bước 1.
   `test-login` lại bằng email khách đó → khách thấy dự án ở `/portal`, mở ra thấy mốc
   + nhật ký vừa tạo.
3. **Chặn non-admin:** `test-login` bằng khách `role = 'client'` → mở `/portal/admin` →
   bị đẩy về `/portal` (URL cuối là `/portal`, thấy tiêu đề danh sách dự án của khách).

### 9.4 Seed

`supabase/seed.sql` cần có: ≥ 1 `admin`, ≥ 1 `pending`, ≥ 1 `client`. Slice 1–3 đã seed
1 admin + `client-c@dnkhouse.test` (client không dự án) + persona `pending`. Kiểm tra,
bổ sung nếu thiếu; **không** đẩy seed lên Supabase hosted.

## 10. Danh sách file

**Mới:**

```
src/app/portal/admin/page.tsx
src/app/portal/admin/projects/new/page.tsx
src/app/portal/admin/projects/[id]/page.tsx
src/app/portal/admin/pending/[profileId]/page.tsx
src/lib/portal/admin-queries.ts
src/lib/portal/admin-actions.ts
src/lib/portal/admin-validation.ts
src/components/portal/admin/AdminNav.tsx
src/components/portal/admin/ProjectForm.tsx
src/components/portal/admin/MilestoneManager.tsx
src/components/portal/admin/UpdateManager.tsx
src/components/portal/admin/MemberList.tsx
src/components/portal/admin/ApproveAssignForm.tsx
src/components/portal/admin/DeleteButton.tsx
tests/unit/require-admin.test.ts
tests/unit/admin-validation.test.ts
tests/unit/milestone-reorder.test.ts
tests/e2e/admin.spec.ts
```

**Sửa:**

```
src/lib/portal/session.ts          — thêm resolveAdminAccess() + requireAdmin()
src/app/auth/callback/route.ts     — redirect theo role sau khi đổi code lấy session
supabase/seed.sql                  — đảm bảo đủ 3 persona (nếu thiếu)
tests/integration/…                — thêm ca non-admin bị RLS chặn (nếu thiếu)
.claude/rules/portal-architecture.md — bỏ dòng "nhập tay qua Studio (Giai đoạn 1)", mô tả /portal/admin
.claude/rules/project-status.md     — cập nhật trạng thái Giai đoạn 2
CLAUDE.md                           — mục Portal: cập nhật luồng nhập liệu
```

**Không sửa:** `src/proxy.ts`, `src/app/portal/layout.tsx`, `src/app/portal/page.tsx`,
`src/app/portal/[projectId]/page.tsx`, `src/app/portal/error.tsx`,
`src/app/portal/not-found.tsx`, mọi migration, RLS.

## 11. Xác minh hoàn thành

1. `npm run test` (unit + integration RLS) xanh — gồm 3 file unit mới + ca RLS non-admin.
2. `npm run test:e2e` xanh — `auth` + `dashboard` + `project-detail` + `admin` (3 kịch bản §9.3).
3. `npx tsc --noEmit` sạch; `npm run lint` sạch; `npm run build` xanh.
4. Dev thủ công (Supabase local hoặc hosted): tạo dự án → thêm/sắp xếp/đánh dấu mốc →
   đăng/sửa/xoá nhật ký → duyệt 1 khách `pending` + gán → đăng nhập bằng khách đó thấy
   đúng dữ liệu → gỡ thành viên → khách không còn thấy dự án.
5. Non-admin mở `/portal/admin*` → về `/portal`. Khách chưa đăng nhập mở `/portal/admin`
   → về `/login`.
6. Responsive `/portal/admin` và trang sửa dự án ở 375 / 768 / 1440.
7. Không còn thao tác vận hành nào bắt buộc phải mở Supabase Studio (trừ §7).
