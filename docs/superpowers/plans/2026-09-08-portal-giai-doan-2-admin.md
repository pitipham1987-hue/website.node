# Kế Hoạch Triển Khai — Giai đoạn 2: Khu quản trị `/portal/admin`

> **Dành cho agent thực thi:** SUB-SKILL BẮT BUỘC: Sử dụng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans để triển khai kế hoạch này theo từng nhiệm vụ. Các bước sử dụng cú pháp ô tích (`- [ ]`) để theo dõi.

**Mục tiêu:** Xây một khu quản trị chỉ dành cho `role = 'admin'` trong portal, thay thế **hoàn toàn** các thao tác đang làm tay qua Supabase Studio / service key: CRUD `projects` / `milestones` / `updates`, duyệt khách `pending → client`, gán / gỡ `project_members`.

**Kiến trúc:** Không có migration mới — mô hình dữ liệu 5 bảng và RLS (`is_admin()` được phép mọi thao tác ghi) đã đủ từ Giai đoạn 1. Thêm lớp DAL `requireAdmin()` vào `src/lib/portal/session.ts` (gọi ở đầu mọi page `/portal/admin/**` và đầu mọi Server Action admin — phòng thủ lớp 2 trên RLS). Truy vấn đọc gom vào `src/lib/portal/admin-queries.ts` (`server-only`, RLS tự lọc). Ghi gom vào `src/lib/portal/admin-actions.ts` (`"use server"`); validation thuần tách ra `src/lib/portal/admin-validation.ts`; logic sắp thứ tự mốc tách ra hàm thuần `src/lib/portal/milestone-order.ts` (không đặt trong file `"use server"` được — mọi export của file đó phải là async). UI: Server Component cho phần đọc/danh sách; `"use client"` chỉ ở nơi cần `useActionState` hoặc `confirm()`. `src/app/auth/callback/route.ts` phân luồng redirect theo `role` sau khi đổi code lấy session.

**Công nghệ sử dụng (Tech Stack):**
- Next.js **16.3.1** App Router: dynamic segment (`params` là **Promise**), `PageProps<"...">` / `LayoutProps<"...">` (typed routes, global helper), `notFound()` + `not-found.tsx` (đã có ở `src/app/portal/`), `error.tsx` prop **`retry`** (đã có ở `src/app/portal/`), Server Actions + `revalidatePath` từ `next/cache`, `redirect` từ `next/navigation`.
- React **19.2.8**: `useActionState(action, initialState)` — action đổi chữ ký thành `(prevState, formData)`; hook trả `[state, formAction, pending]`.
- `@supabase/ssr` server client qua `@/lib/supabase/server` (`createClient()` async).
- `lucide-react` (đã có) cho icon.
- `vitest` (unit thuần + integration RLS), `@playwright/test` (E2E).
- `Intl.DateTimeFormat` locale `vi-VN` qua `formatVnDate` (đã có ở `src/lib/portal/format.ts`).

## Hạn Chế Toàn Cục (Global Constraints)

- **Next.js `16.3.1` chính xác** — KHÔNG nâng/hạ. Đọc `node_modules/next/dist/docs/01-app/...` trước khi dùng API mới. `params` / `searchParams` của page là **Promise** → phải `await`. `cookies()` async (đã bọc trong `@/lib/supabase/server`).
- **KHÔNG có migration mới, KHÔNG sửa RLS, KHÔNG sửa file trong `supabase/migrations/`.** Chỉ được sửa `supabase/seed.sql` (nếu thiếu persona) — và **không** đẩy seed lên Supabase hosted.
- **KHÔNG đặt auth check trong `layout.tsx`** (layout không re-render khi điều hướng client-side). Mọi page `/portal/admin/**` gọi `requireAdmin()` ở **dòng đầu**; mọi Server Action admin gọi `await requireAdmin()` **trước** khi làm bất cứ việc gì.
- `redirect()` và `notFound()` **ném** control-flow — gọi ngoài `try/catch`, code phía sau không chạy khi bị chặn. `revalidatePath()` **không** ném.
- `revalidatePath` cho path có dynamic segment **bắt buộc** truyền `type`: `revalidatePath("/portal/admin/projects/[id]", "page")`, `revalidatePath("/portal/[projectId]", "page")`. Path tĩnh thì bỏ `type`: `revalidatePath("/portal/admin")`, `revalidatePath("/portal")`.
- File `"use server"` (`admin-actions.ts`): **mọi export phải là async function**. Hàm thuần (validation, sắp thứ tự) phải nằm ở file khác.
- Style đồng bộ site: token Tailwind khai báo ở `src/app/globals.css` — `bg-background` / `bg-surface` / `text-foreground` / `text-muted` / `border-border` / `bg-accent` / `text-accent-foreground`. Kế hoạch này **thêm** token trạng thái `--danger` / `--danger-foreground` / `--success` vào `globals.css` (Task 10). Card `rounded-2xl`, nút pill `rounded-full`. **Ô nhập form (`input` / `textarea` / `select`) dùng `rounded-lg`** — nhóm phần tử mới, nhất quán trong toàn khu admin; KHÔNG đổi bo góc card/nút hiện có. **KHÔNG hardcode hex** trong class component.
- Toàn bộ chữ portal **tiếng Việt có dấu đầy đủ**. Không i18n.
- Landing `/` + `src/app/page.tsx` + `src/app/layout.tsx` (root) + `src/components/*` (trừ `src/components/portal/*`) **không đổi**. Không đụng `ScrollReveal` / framer-motion trong portal.
- **Không** thêm dependency mới (không `zod`, không thư viện ngày tháng). Validation viết tay.
- Truy vấn dữ liệu **server-only**. Client Component chỉ gọi Server Action (RPC), không gọi Supabase trực tiếp.
- Mobile-friendly: `/portal/admin` và `/portal/admin/projects/[id]` đúng ở **375 / 768 / 1440**.
- Mỗi nhiệm vụ kết thúc bằng `git commit`. Cuối kế hoạch: `npm run build` + `npx tsc --noEmit` + `npm run lint` sạch; `npm run test` (unit + integration RLS) + `npm run test:e2e` (`auth` + `dashboard` + `project-detail` + `admin`) xanh.
- Spec: `docs/superpowers/specs/2026-09-08-portal-giai-doan-2-admin-design.md`. Kiến trúc portal: `.claude/rules/portal-architecture.md`. Nguyên tắc code: `.claude/rules/karpathy-guidelines.md`.
- **Điều kiện tiên quyết:** Giai đoạn 1 xong (`requireClient`, `requireProjectAccess`, `getProjectsForUser`, `getProjectDetail`, `formatVnDate`, `src/app/portal/{layout,page,error,not-found}.tsx`, `src/app/portal/[projectId]/page.tsx`, `src/components/portal/*`, seed 5 user + 2 dự án, `tests/e2e/helpers.ts`, `playwright.config.ts`). Supabase local chạy được: `npx supabase start` (Docker) + `npx supabase db reset`.

---

## Cấu Trúc File

**Tạo mới:**

| File | Trách nhiệm |
|------|-------------|
| `src/lib/portal/admin-validation.ts` | Hàm thuần, không I/O: `validateProjectInput`, `validateMilestoneTitle`, `validateUpdateInput`, `validateProjectIds`, `validateDirection`. Trả `{ ok: true; value } \| { ok: false; error?; fieldErrors }` |
| `src/lib/portal/milestone-order.ts` | Hàm thuần `reorderMilestones(list, targetId, direction)` → danh sách đã sắp lại, `position` đánh số `0..n-1` |
| `src/lib/portal/admin-queries.ts` | `server-only`: `getAdminProjectList`, `getPendingProfiles`, `getPendingProfile`, `getClientProfiles`, `getAdminProjectDetail`, `getAssignableProjects`, `getAssignableClients` |
| `src/lib/portal/admin-actions.ts` | `"use server"`: `createProject`, `updateProject`, `deleteProject`, `addMilestone`, `renameMilestone`, `toggleMilestone`, `deleteMilestone`, `reorderMilestone`, `addUpdate`, `updateUpdate`, `deleteUpdate`, `approveAndAssign`, `addMember`, `removeMember` + type `ActionState` + `initialActionState` |
| `src/components/portal/admin/AdminNav.tsx` | Server Component: thanh phụ "Khu quản trị" + link "Xem giao diện khách" → `/portal` |
| `src/components/portal/admin/DeleteButton.tsx` | `"use client"`: bọc `confirm()` rồi submit form Server Action; prop `action` (đã `.bind`), `confirmText`, `label` |
| `src/components/portal/admin/ProjectForm.tsx` | `"use client"`: tạo/sửa dự án; `useActionState`; lỗi theo field; trạng thái pending |
| `src/components/portal/admin/MilestoneManager.tsx` | `"use client"`: danh sách mốc — toggle done, sửa tiêu đề inline, ▲▼, xoá, ô thêm mốc |
| `src/components/portal/admin/UpdateManager.tsx` | `"use client"`: textarea đăng nhật ký + danh sách sửa (inline) / xoá |
| `src/components/portal/admin/MemberList.tsx` | Server Component: danh sách thành viên + nút "Gỡ" (form action) + `<select>` thêm |
| `src/components/portal/admin/ApproveAssignForm.tsx` | `"use client"`: checkbox list dự án + nút "Duyệt khách" |
| `src/app/portal/admin/page.tsx` | Server Component: trang chủ admin — 3 khu (Dự án / Khách chờ duyệt / Khách đã duyệt) |
| `src/app/portal/admin/projects/new/page.tsx` | Server Component: `<ProjectForm mode="create">` |
| `src/app/portal/admin/projects/[id]/page.tsx` | Server Component: sửa dự án + `MilestoneManager` + `UpdateManager` + `MemberList` + nút xoá |
| `src/app/portal/admin/pending/[profileId]/page.tsx` | Server Component: thông tin khách `pending` + `<ApproveAssignForm>` |
| `tests/unit/admin-validation.test.ts` | Vitest: mọi nhánh hợp lệ / không hợp lệ của `admin-validation.ts` |
| `tests/unit/milestone-order.test.ts` | Vitest: `reorderMilestones` — lên giữa, lên đầu (no-op), xuống cuối (no-op), `position` trùng ban đầu |
| `tests/unit/require-admin.test.ts` | Vitest: `resolveAdminAccess` (`null` / `pending` / `client` / `admin`) + `postLoginPath` |
| `tests/integration/admin-rls.test.ts` | Vitest: token `client` bị RLS chặn ghi 4 bảng; token `admin` ghi + đổi role thành công |
| `tests/e2e/admin.spec.ts` | Playwright: vòng đời dự án; duyệt & gán → khách thấy; chặn non-admin |

**Chỉnh sửa:**

| File | Thay đổi |
|------|----------|
| `src/lib/portal/session.ts` | Thêm `AdminAccess`, `resolveAdminAccess` (thuần), `requireAdmin` (async), `postLoginPath` (thuần) |
| `src/app/auth/callback/route.ts` | Sau `exchangeCodeForSession`: đọc `profiles.role`, redirect `/portal/admin` nếu `admin`, còn lại `/portal` |
| `src/app/globals.css` | Thêm token `--danger`, `--danger-foreground`, `--success` (`:root` + `@theme inline`) |
| `tests/e2e/helpers.ts` | Thêm `EMAILS.admin = "admin@dnkhouse.test"` |
| `supabase/seed.sql` | Kiểm tra đủ ≥1 `admin` + ≥1 `pending` + ≥1 `client` — hiện đã đủ; chỉ sửa nếu thiếu |
| `.claude/rules/portal-architecture.md` | Bỏ dòng "nhập tay qua Studio (Giai đoạn 1)", mô tả `/portal/admin` + `requireAdmin` |
| `.claude/rules/project-status.md` | Cập nhật trạng thái Giai đoạn 2 |
| `CLAUDE.md` | Mục Portal: cập nhật luồng nhập liệu (qua `/portal/admin`, không còn Studio) |

**Không sửa:** `src/proxy.ts`, `src/app/portal/layout.tsx`, `src/app/portal/page.tsx`, `src/app/portal/[projectId]/page.tsx`, `src/app/portal/error.tsx`, `src/app/portal/not-found.tsx`, mọi file `supabase/migrations/*`, `src/lib/portal/{queries,progress,format}.ts`.

---

## Bản đồ interface dùng chung (mọi task tham chiếu về đây)

`src/lib/portal/session.ts` — thêm:

```ts
export type AdminAccess =
  | { status: "redirect-login" }
  | { status: "redirect-portal" }
  | { status: "ok"; profile: SessionProfile };

export function resolveAdminAccess(profile: SessionProfile | null): AdminAccess;
export async function requireAdmin(): Promise<SessionProfile>;
export function postLoginPath(role: Role | null): "/portal" | "/portal/admin";
```

`src/lib/portal/admin-validation.ts`:

```ts
export type Validated<T> =
  | { ok: true; value: T }
  | { ok: false; error?: string; fieldErrors: Record<string, string> };

export interface ProjectInput { name: string; statusLabel: string; summary: string | null }
export function validateProjectInput(formData: FormData): Validated<ProjectInput>;

export function validateMilestoneTitle(formData: FormData): Validated<{ title: string }>;

export interface UpdateInput { body: string; authorName: string }
export function validateUpdateInput(formData: FormData): Validated<UpdateInput>;

export function validateProjectIds(values: string[]): Validated<string[]>;
export function validateDirection(value: FormDataEntryValue | null): Validated<"up" | "down">;
```

`src/lib/portal/milestone-order.ts`:

```ts
export interface MilestoneOrder { id: string; position: number }
export function reorderMilestones(
  list: MilestoneOrder[],
  targetId: string,
  direction: "up" | "down",
): MilestoneOrder[];
```

`src/lib/portal/admin-queries.ts`:

```ts
export interface AdminProjectListItem {
  id: string; name: string; statusLabel: string;
  milestonesDone: number; milestonesTotal: number; memberCount: number;
}
export function getAdminProjectList(): Promise<AdminProjectListItem[]>;

export interface PendingProfile { id: string; email: string; fullName: string | null; createdAt: string }
export function getPendingProfiles(): Promise<PendingProfile[]>;
export function getPendingProfile(id: string): Promise<PendingProfile | null>;

export interface ClientProfile { id: string; email: string; fullName: string | null; projectNames: string[] }
export function getClientProfiles(): Promise<ClientProfile[]>;

export interface AdminMilestone { id: string; title: string; done: boolean; doneAt: string | null; position: number }
export interface AdminUpdate { id: string; body: string; authorName: string; createdAt: string }
export interface AdminMember { profileId: string; email: string; fullName: string | null }
export interface AdminProjectDetail {
  id: string; name: string; statusLabel: string; summary: string | null;
  milestones: AdminMilestone[]; updates: AdminUpdate[]; members: AdminMember[];
}
export function getAdminProjectDetail(id: string): Promise<AdminProjectDetail | null>;

export interface AssignableProject { id: string; name: string }
export function getAssignableProjects(): Promise<AssignableProject[]>;

export interface AssignableClient { id: string; email: string; fullName: string | null }
export function getAssignableClients(projectId: string): Promise<AssignableClient[]>;
```

`src/lib/portal/admin-actions.ts`:

```ts
export interface ActionState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}
export const initialActionState: ActionState = {};

// (prev, formData) — dùng với useActionState:
export function createProject(prev: ActionState, formData: FormData): Promise<ActionState>; // thành công -> redirect("/portal/admin/projects/<id>")
export function updateProject(prev: ActionState, formData: FormData): Promise<ActionState>; // formData: projectId, name, status_label, summary
export function addMilestone(prev: ActionState, formData: FormData): Promise<ActionState>;  // formData: projectId, title
export function renameMilestone(prev: ActionState, formData: FormData): Promise<ActionState>; // formData: projectId, milestoneId, title
export function addUpdate(prev: ActionState, formData: FormData): Promise<ActionState>;     // formData: projectId, body, author_name
export function updateUpdate(prev: ActionState, formData: FormData): Promise<ActionState>;  // formData: projectId, updateId, body, author_name
export function approveAndAssign(prev: ActionState, formData: FormData): Promise<ActionState>; // formData: profileId, projectIds[] -> redirect("/portal/admin")

// bound-args, trả void (throw khi lỗi Supabase) — dùng với <form action={fn.bind(null, ...)}> hoặc startTransition:
export function deleteProject(projectId: string): Promise<void>;                 // -> redirect("/portal/admin")
export function toggleMilestone(projectId: string, milestoneId: string, done: boolean): Promise<void>;
export function deleteMilestone(projectId: string, milestoneId: string): Promise<void>;
export function reorderMilestone(projectId: string, milestoneId: string, direction: "up" | "down"): Promise<void>;
export function deleteUpdate(projectId: string, updateId: string): Promise<void>;
export function addMember(projectId: string, profileId: string): Promise<void>;
export function removeMember(projectId: string, profileId: string): Promise<void>;
```

> **Lưu ý về `redirect` trong action dùng `useActionState`:** `redirect()` ném `NEXT_REDIRECT`; Next bắt và điều hướng — hook **không** coi là lỗi, không set state. Vì vậy `createProject` / `approveAndAssign` khai báo trả `Promise<ActionState>` nhưng nhánh thành công không `return` (gọi `redirect(...)` là `never`).

> **`revalidatePath` mục tiêu (áp dụng xuyên suốt `admin-actions.ts`):**
> - Thao tác trong 1 dự án (mốc, nhật ký, thành viên, sửa dự án): `revalidatePath("/portal/admin/projects/[id]", "page")`.
> - Thao tác đổi danh sách dự án / danh sách khách (`createProject`, `deleteProject`, `approveAndAssign`): thêm `revalidatePath("/portal/admin")`.
> - Thao tác ảnh hưởng giao diện khách (mốc, nhật ký, gán/gỡ thành viên): thêm `revalidatePath("/portal/[projectId]", "page")` **và** `revalidatePath("/portal")`.

---

## Task 1: `resolveAdminAccess` + `requireAdmin` + `postLoginPath` (DAL)

**Files:**
- Chỉnh sửa: `src/lib/portal/session.ts` (thêm cuối file; sửa dòng `import` nếu cần — `redirect` đã được import sẵn)
- Tạo mới: `tests/unit/require-admin.test.ts`

**Interfaces:**
- Consumes: `getSessionProfile` (đã có, bọc `cache`), `SessionProfile`, `Role`, `redirect` từ `next/navigation` (đã import ở dòng 3).
- Produces: `resolveAdminAccess`, `requireAdmin`, `postLoginPath`, type `AdminAccess` (xem "Bản đồ interface dùng chung").

- [ ] **Bước 1: Viết test thất bại — `tests/unit/require-admin.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  postLoginPath,
  resolveAdminAccess,
  type SessionProfile,
} from "@/lib/portal/session";

const profile = (role: SessionProfile["role"]): SessionProfile => ({
  userId: "u1",
  email: "u@dnkhouse.test",
  fullName: "U",
  role,
});

describe("resolveAdminAccess", () => {
  it("null -> redirect-login", () => {
    expect(resolveAdminAccess(null)).toEqual({ status: "redirect-login" });
  });
  it("pending -> redirect-portal", () => {
    expect(resolveAdminAccess(profile("pending"))).toEqual({
      status: "redirect-portal",
    });
  });
  it("client -> redirect-portal", () => {
    expect(resolveAdminAccess(profile("client"))).toEqual({
      status: "redirect-portal",
    });
  });
  it("admin -> ok kèm profile", () => {
    const p = profile("admin");
    expect(resolveAdminAccess(p)).toEqual({ status: "ok", profile: p });
  });
});

describe("postLoginPath", () => {
  it("admin -> /portal/admin", () => {
    expect(postLoginPath("admin")).toBe("/portal/admin");
  });
  it("client -> /portal", () => {
    expect(postLoginPath("client")).toBe("/portal");
  });
  it("pending -> /portal", () => {
    expect(postLoginPath("pending")).toBe("/portal");
  });
  it("null -> /portal", () => {
    expect(postLoginPath(null)).toBe("/portal");
  });
});
```

- [ ] **Bước 2: Chạy test — kỳ vọng THẤT BẠI**

Chạy: `npm run test -- require-admin`
Kỳ vọng: FAIL — `resolveAdminAccess`/`postLoginPath` không export từ `@/lib/portal/session`.

- [ ] **Bước 3: Thêm code vào `src/lib/portal/session.ts` (cuối file)**

```ts
export type AdminAccess =
  | { status: "redirect-login" }
  | { status: "redirect-portal" }
  | { status: "ok"; profile: SessionProfile };

/** Thuần — quyết định quyền vào khu admin. Không admin (gồm pending/client) -> đẩy về /portal. */
export function resolveAdminAccess(
  profile: SessionProfile | null,
): AdminAccess {
  if (!profile) return { status: "redirect-login" };
  if (profile.role !== "admin") return { status: "redirect-portal" };
  return { status: "ok", profile };
}

/**
 * Gọi ở đầu mọi page /portal/admin/** và đầu mọi Server Action admin.
 * redirect() ném control-flow -> code sau không chạy khi bị chặn.
 */
export async function requireAdmin(): Promise<SessionProfile> {
  const access = resolveAdminAccess(await getSessionProfile());
  if (access.status === "redirect-login") redirect("/login");
  if (access.status === "redirect-portal") redirect("/portal");
  return access.profile;
}

/** Thuần — đường dẫn sau đăng nhập theo role (dùng ở /auth/callback). */
export function postLoginPath(role: Role | null): "/portal" | "/portal/admin" {
  return role === "admin" ? "/portal/admin" : "/portal";
}
```

- [ ] **Bước 4: Chạy test + typecheck — kỳ vọng PASS**

Chạy: `npm run test -- require-admin` → 8 case PASS.
Chạy: `npx tsc --noEmit` → `tsc=0`.

- [ ] **Bước 5: Commit**

```bash
git add src/lib/portal/session.ts tests/unit/require-admin.test.ts
git commit -m "feat(portal): requireAdmin + resolveAdminAccess + postLoginPath vào DAL"
```

---

## Task 2: `/auth/callback` phân luồng redirect theo role

**Files:**
- Chỉnh sửa: `src/app/auth/callback/route.ts`

**Interfaces:**
- Consumes: `postLoginPath` (Task 1), `createClient` từ `@/lib/supabase/server`.
- Produces: không có export mới — chỉ đổi hành vi redirect.

- [ ] **Bước 1: Viết lại `src/app/auth/callback/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { postLoginPath, type Role } from "@/lib/portal/session";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let role: Role | null = null;
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        role = (data?.role as Role | undefined) ?? null;
      }
      return NextResponse.redirect(`${origin}${postLoginPath(role)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

- [ ] **Bước 2: Typecheck + lint**

Chạy: `npx tsc --noEmit` → `tsc=0`.
Chạy: `npm run lint` → không lỗi mới.

- [ ] **Bước 3: Kiểm tra thủ công đường dẫn logic**

Không có test tự động cho route handler này (I/O thuần với Supabase Auth; nhánh role đã cover qua `postLoginPath` unit test ở Task 1, nhánh end-to-end kiểm ở E2E khi login khách thật). Xác nhận bằng đọc code: user `admin` → `postLoginPath("admin")` → `/portal/admin`; user khác → `/portal`; exchange lỗi → `/login?error=auth`.

- [ ] **Bước 4: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "feat(portal): /auth/callback redirect theo role (admin -> /portal/admin)"
```

---

## Task 3: `admin-validation.ts` (hàm thuần) + test

**Files:**
- Tạo mới: `src/lib/portal/admin-validation.ts`
- Tạo mới: `tests/unit/admin-validation.test.ts`

**Interfaces:**
- Consumes: không (thuần, không I/O, không `server-only`).
- Produces: `Validated<T>`, `ProjectInput`, `UpdateInput`, `validateProjectInput`, `validateMilestoneTitle`, `validateUpdateInput`, `validateProjectIds`, `validateDirection` (xem "Bản đồ interface dùng chung").

Quy tắc (spec §6.3):

| Trường | Quy tắc |
|---|---|
| `name` | bắt buộc; `trim`; 1–200 ký tự |
| `status_label` | bắt buộc; `trim`; 1–100 ký tự |
| `summary` | tùy chọn; `trim`; ≤ 2000; rỗng → `null` |
| `title` (milestone) | bắt buộc; `trim`; 1–200 |
| `body` (update) | bắt buộc; `trim`; 1–5000 |
| `author_name` (update) | bắt buộc; `trim`; 1–120 |
| `projectIds` | mỗi phần tử là UUID hợp lệ; mảng rỗng hợp lệ |
| `direction` | `"up"` \| `"down"` |

- [ ] **Bước 1: Viết test thất bại — `tests/unit/admin-validation.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  validateDirection,
  validateMilestoneTitle,
  validateProjectIds,
  validateProjectInput,
  validateUpdateInput,
} from "@/lib/portal/admin-validation";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

describe("validateProjectInput", () => {
  it("hợp lệ: trim + summary rỗng -> null", () => {
    const r = validateProjectInput(
      fd({ name: "  Dự án X  ", status_label: " Đang triển khai ", summary: "   " }),
    );
    expect(r).toEqual({
      ok: true,
      value: { name: "Dự án X", statusLabel: "Đang triển khai", summary: null },
    });
  });

  it("name rỗng -> fieldErrors.name", () => {
    const r = validateProjectInput(fd({ name: "   ", status_label: "X" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.name).toBeTruthy();
  });

  it("status_label rỗng -> fieldErrors.status_label", () => {
    const r = validateProjectInput(fd({ name: "X", status_label: "" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.status_label).toBeTruthy();
  });

  it("name quá 200 ký tự -> lỗi", () => {
    const r = validateProjectInput(
      fd({ name: "a".repeat(201), status_label: "X" }),
    );
    expect(r.ok).toBe(false);
  });

  it("summary quá 2000 ký tự -> lỗi", () => {
    const r = validateProjectInput(
      fd({ name: "X", status_label: "Y", summary: "a".repeat(2001) }),
    );
    expect(r.ok).toBe(false);
  });

  it("summary hợp lệ -> giữ nguyên (đã trim)", () => {
    const r = validateProjectInput(
      fd({ name: "X", status_label: "Y", summary: "  tóm tắt  " }),
    );
    expect(r).toEqual({
      ok: true,
      value: { name: "X", statusLabel: "Y", summary: "tóm tắt" },
    });
  });
});

describe("validateMilestoneTitle", () => {
  it("hợp lệ", () => {
    expect(validateMilestoneTitle(fd({ title: "  Mốc 1 " }))).toEqual({
      ok: true,
      value: { title: "Mốc 1" },
    });
  });
  it("rỗng -> lỗi", () => {
    expect(validateMilestoneTitle(fd({ title: "  " })).ok).toBe(false);
  });
  it("quá 200 -> lỗi", () => {
    expect(validateMilestoneTitle(fd({ title: "a".repeat(201) })).ok).toBe(false);
  });
});

describe("validateUpdateInput", () => {
  it("hợp lệ", () => {
    expect(
      validateUpdateInput(fd({ body: " Nội dung ", author_name: " DNK House " })),
    ).toEqual({
      ok: true,
      value: { body: "Nội dung", authorName: "DNK House" },
    });
  });
  it("body rỗng -> fieldErrors.body", () => {
    const r = validateUpdateInput(fd({ body: "", author_name: "A" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.body).toBeTruthy();
  });
  it("author_name rỗng -> fieldErrors.author_name", () => {
    const r = validateUpdateInput(fd({ body: "x", author_name: "  " }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.author_name).toBeTruthy();
  });
  it("body quá 5000 -> lỗi", () => {
    expect(
      validateUpdateInput(fd({ body: "a".repeat(5001), author_name: "A" })).ok,
    ).toBe(false);
  });
  it("author_name quá 120 -> lỗi", () => {
    expect(
      validateUpdateInput(fd({ body: "x", author_name: "a".repeat(121) })).ok,
    ).toBe(false);
  });
});

describe("validateProjectIds", () => {
  const uuid = "aaaaaaaa-0000-0000-0000-000000000001";
  it("mảng rỗng -> hợp lệ", () => {
    expect(validateProjectIds([])).toEqual({ ok: true, value: [] });
  });
  it("toàn UUID hợp lệ -> ok", () => {
    expect(validateProjectIds([uuid])).toEqual({ ok: true, value: [uuid] });
  });
  it("có phần tử sai định dạng -> lỗi", () => {
    expect(validateProjectIds([uuid, "khong-phai-uuid"]).ok).toBe(false);
  });
});

describe("validateDirection", () => {
  it("'up' -> ok", () => {
    expect(validateDirection("up")).toEqual({ ok: true, value: "up" });
  });
  it("'down' -> ok", () => {
    expect(validateDirection("down")).toEqual({ ok: true, value: "down" });
  });
  it("giá trị khác -> lỗi", () => {
    expect(validateDirection("sideways").ok).toBe(false);
    expect(validateDirection(null).ok).toBe(false);
  });
});
```

- [ ] **Bước 2: Chạy test — kỳ vọng THẤT BẠI**

Chạy: `npm run test -- admin-validation`
Kỳ vọng: FAIL — `Cannot find module '@/lib/portal/admin-validation'`.

- [ ] **Bước 3: Viết `src/lib/portal/admin-validation.ts`**

```ts
/**
 * Validation thuần cho Server Actions admin — không I/O, không "server-only"
 * (test chạy trong Node thuần). Mỗi hàm nhận FormData (hoặc giá trị đã rút) và
 * trả kết quả phân biệt rõ hợp lệ / không hợp lệ kèm lỗi theo field.
 */

export type Validated<T> =
  | { ok: true; value: T }
  | { ok: false; error?: string; fieldErrors: Record<string, string> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Rút 1 field text, trim. Không có -> "". */
function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export interface ProjectInput {
  name: string;
  statusLabel: string;
  summary: string | null;
}

export function validateProjectInput(formData: FormData): Validated<ProjectInput> {
  const name = str(formData, "name");
  const statusLabel = str(formData, "status_label");
  const summaryRaw = str(formData, "summary");
  const fieldErrors: Record<string, string> = {};

  if (name.length === 0) fieldErrors.name = "Vui lòng nhập tên dự án.";
  else if (name.length > 200)
    fieldErrors.name = "Tên dự án tối đa 200 ký tự.";

  if (statusLabel.length === 0)
    fieldErrors.status_label = "Vui lòng nhập trạng thái dự án.";
  else if (statusLabel.length > 100)
    fieldErrors.status_label = "Trạng thái tối đa 100 ký tự.";

  if (summaryRaw.length > 2000)
    fieldErrors.summary = "Tóm tắt tối đa 2000 ký tự.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return {
    ok: true,
    value: { name, statusLabel, summary: summaryRaw.length > 0 ? summaryRaw : null },
  };
}

export function validateMilestoneTitle(
  formData: FormData,
): Validated<{ title: string }> {
  const title = str(formData, "title");
  const fieldErrors: Record<string, string> = {};
  if (title.length === 0) fieldErrors.title = "Vui lòng nhập tên mốc.";
  else if (title.length > 200) fieldErrors.title = "Tên mốc tối đa 200 ký tự.";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, value: { title } };
}

export interface UpdateInput {
  body: string;
  authorName: string;
}

export function validateUpdateInput(formData: FormData): Validated<UpdateInput> {
  const body = str(formData, "body");
  const authorName = str(formData, "author_name");
  const fieldErrors: Record<string, string> = {};

  if (body.length === 0) fieldErrors.body = "Vui lòng nhập nội dung cập nhật.";
  else if (body.length > 5000)
    fieldErrors.body = "Nội dung tối đa 5000 ký tự.";

  if (authorName.length === 0)
    fieldErrors.author_name = "Vui lòng nhập tên người đăng.";
  else if (authorName.length > 120)
    fieldErrors.author_name = "Tên người đăng tối đa 120 ký tự.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, value: { body, authorName } };
}

export function validateProjectIds(values: string[]): Validated<string[]> {
  for (const v of values) {
    if (!UUID_RE.test(v))
      return {
        ok: false,
        error: "Danh sách dự án không hợp lệ.",
        fieldErrors: {},
      };
  }
  return { ok: true, value: values };
}

export function validateDirection(
  value: FormDataEntryValue | null,
): Validated<"up" | "down"> {
  if (value === "up" || value === "down") return { ok: true, value };
  return { ok: false, error: "Hướng di chuyển không hợp lệ.", fieldErrors: {} };
}
```

- [ ] **Bước 4: Chạy test + typecheck — kỳ vọng PASS**

Chạy: `npm run test -- admin-validation` → toàn bộ case PASS.
Chạy: `npx tsc --noEmit` → `tsc=0`.

- [ ] **Bước 5: Commit**

```bash
git add src/lib/portal/admin-validation.ts tests/unit/admin-validation.test.ts
git commit -m "feat(portal): admin-validation — hàm thuần validate input + test"
```

---

## Task 4: `milestone-order.ts` (hàm thuần sắp thứ tự) + test

**Files:**
- Tạo mới: `src/lib/portal/milestone-order.ts`
- Tạo mới: `tests/unit/milestone-order.test.ts`

**Interfaces:**
- Consumes: không.
- Produces: `MilestoneOrder`, `reorderMilestones(list, targetId, direction)` — trả **toàn bộ** danh sách đã sắp theo thứ tự mới, `position` đánh số lại `0..n-1`. Đưa lên ở đầu / xuống ở cuối = no-op thứ tự nhưng vẫn đánh số lại (tự lành `position` trùng/rời rạc). Input được sắp theo `position` tăng dần (tie-break: giữ thứ tự mảng đầu vào — dùng `Array.prototype.sort` ổn định của V8).

- [ ] **Bước 1: Viết test thất bại — `tests/unit/milestone-order.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { reorderMilestones } from "@/lib/portal/milestone-order";

const list = [
  { id: "a", position: 0 },
  { id: "b", position: 1 },
  { id: "c", position: 2 },
  { id: "d", position: 3 },
];

describe("reorderMilestones", () => {
  it("đưa phần tử giữa lên trên -> hoán vị với phần tử liền trước, đánh số 0..n-1", () => {
    expect(reorderMilestones(list, "c", "up")).toEqual([
      { id: "a", position: 0 },
      { id: "c", position: 1 },
      { id: "b", position: 2 },
      { id: "d", position: 3 },
    ]);
  });

  it("đưa phần tử giữa xuống dưới -> hoán vị với phần tử liền sau", () => {
    expect(reorderMilestones(list, "b", "down")).toEqual([
      { id: "a", position: 0 },
      { id: "c", position: 1 },
      { id: "b", position: 2 },
      { id: "d", position: 3 },
    ]);
  });

  it("đưa phần tử đầu lên trên -> no-op thứ tự, vẫn đánh số lại", () => {
    expect(reorderMilestones(list, "a", "up")).toEqual([
      { id: "a", position: 0 },
      { id: "b", position: 1 },
      { id: "c", position: 2 },
      { id: "d", position: 3 },
    ]);
  });

  it("đưa phần tử cuối xuống dưới -> no-op thứ tự", () => {
    expect(reorderMilestones(list, "d", "down")).toEqual(list);
  });

  it("position trùng / rời rạc ban đầu -> sắp theo position rồi thứ tự mảng, đánh số lại liên tục", () => {
    const messy = [
      { id: "x", position: 5 },
      { id: "y", position: 5 },
      { id: "z", position: 2 },
    ];
    // sắp theo position: z(2), x(5), y(5) — tie-break giữ thứ tự mảng (x trước y)
    expect(reorderMilestones(messy, "x", "down")).toEqual([
      { id: "z", position: 0 },
      { id: "y", position: 1 },
      { id: "x", position: 2 },
    ]);
  });

  it("targetId không tồn tại -> chỉ chuẩn hoá position", () => {
    expect(reorderMilestones(list, "khong-co", "up")).toEqual(list);
  });
});
```

- [ ] **Bước 2: Chạy test — kỳ vọng THẤT BẠI**

Chạy: `npm run test -- milestone-order`
Kỳ vọng: FAIL — `Cannot find module '@/lib/portal/milestone-order'`.

- [ ] **Bước 3: Viết `src/lib/portal/milestone-order.ts`**

```ts
/**
 * Sắp lại thứ tự mốc triển khai — hàm thuần, không I/O.
 * Server Action đọc toàn bộ mốc của dự án, gọi hàm này, rồi ghi lại `position`
 * cho từng dòng theo kết quả. Luôn đánh số `position` liên tục 0..n-1 (tự lành
 * dữ liệu cũ có position trùng hoặc rời rạc).
 */

export interface MilestoneOrder {
  id: string;
  position: number;
}

export function reorderMilestones(
  list: MilestoneOrder[],
  targetId: string,
  direction: "up" | "down",
): MilestoneOrder[] {
  // Sắp theo position tăng dần; Array.sort của V8 ổn định -> giữ thứ tự mảng đầu
  // vào khi position bằng nhau.
  const sorted = [...list].sort((a, b) => a.position - b.position);
  const ids = sorted.map((m) => m.id);

  const index = ids.indexOf(targetId);
  if (index !== -1) {
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith >= 0 && swapWith < ids.length) {
      [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
    }
  }

  return ids.map((id, i) => ({ id, position: i }));
}
```

- [ ] **Bước 4: Chạy test + typecheck — kỳ vọng PASS**

Chạy: `npm run test -- milestone-order` → 6 case PASS.
Chạy: `npx tsc --noEmit` → `tsc=0`.

- [ ] **Bước 5: Commit**

```bash
git add src/lib/portal/milestone-order.ts tests/unit/milestone-order.test.ts
git commit -m "feat(portal): reorderMilestones — hàm thuần sắp thứ tự mốc + test"
```

---

## Task 5: `admin-queries.ts` — truy vấn đọc cho khu admin

**Files:**
- Tạo mới: `src/lib/portal/admin-queries.ts`

**Interfaces:**
- Consumes: `createClient` từ `@/lib/supabase/server`.
- Produces: 7 hàm + các interface (xem "Bản đồ interface dùng chung"). Không tự kiểm role (page đã `requireAdmin()`, RLS lọc `is_admin()`). UUID validate ở page trước khi gọi.

- [ ] **Bước 1: Viết `src/lib/portal/admin-queries.ts`**

```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminProjectListItem {
  id: string;
  name: string;
  statusLabel: string;
  milestonesDone: number;
  milestonesTotal: number;
  memberCount: number;
}

/** Mọi dự án + đếm mốc xong/tổng + đếm thành viên. Sắp updated_at giảm dần. */
export async function getAdminProjectList(): Promise<AdminProjectListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status_label, updated_at, milestones(done), project_members(profile_id)")
    .order("updated_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((p) => {
    const milestones = (p.milestones ?? []) as { done: boolean }[];
    const members = (p.project_members ?? []) as { profile_id: string }[];
    return {
      id: p.id,
      name: p.name,
      statusLabel: p.status_label,
      milestonesDone: milestones.filter((m) => m.done).length,
      milestonesTotal: milestones.length,
      memberCount: members.length,
    };
  });
}

export interface PendingProfile {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
}

export async function getPendingProfiles(): Promise<PendingProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .eq("role", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    createdAt: r.created_at,
  }));
}

/** 1 khách đang chờ duyệt. null nếu id không tồn tại hoặc role != 'pending'. */
export async function getPendingProfile(
  id: string,
): Promise<PendingProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at, role")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.role !== "pending") return null;
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    createdAt: data.created_at,
  };
}

export interface ClientProfile {
  id: string;
  email: string;
  fullName: string | null;
  projectNames: string[];
}

export async function getClientProfiles(): Promise<ClientProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, project_members(projects(name))")
    .eq("role", "client")
    .order("email", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((r) => {
    const links = (r.project_members ?? []) as {
      projects: { name: string } | null;
    }[];
    return {
      id: r.id,
      email: r.email,
      fullName: r.full_name,
      projectNames: links
        .map((l) => l.projects?.name)
        .filter((n): n is string => Boolean(n)),
    };
  });
}

export interface AdminMilestone {
  id: string;
  title: string;
  done: boolean;
  doneAt: string | null;
  position: number;
}

export interface AdminUpdate {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export interface AdminMember {
  profileId: string;
  email: string;
  fullName: string | null;
}

export interface AdminProjectDetail {
  id: string;
  name: string;
  statusLabel: string;
  summary: string | null;
  milestones: AdminMilestone[];
  updates: AdminUpdate[];
  members: AdminMember[];
}

/** Toàn bộ dữ liệu 1 dự án cho trang làm việc admin. null nếu không tồn tại. */
export async function getAdminProjectDetail(
  id: string,
): Promise<AdminProjectDetail | null> {
  const supabase = await createClient();

  const projectRes = await supabase
    .from("projects")
    .select("id, name, status_label, summary")
    .eq("id", id)
    .maybeSingle();
  if (projectRes.error) throw projectRes.error;
  if (!projectRes.data) return null;

  const [milestonesRes, updatesRes, membersRes] = await Promise.all([
    supabase
      .from("milestones")
      .select("id, title, done, done_at, position")
      .eq("project_id", id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("updates")
      .select("id, body, author_name, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_members")
      .select("profile_id, profiles(email, full_name)")
      .eq("project_id", id),
  ]);
  if (milestonesRes.error) throw milestonesRes.error;
  if (updatesRes.error) throw updatesRes.error;
  if (membersRes.error) throw membersRes.error;

  return {
    id: projectRes.data.id,
    name: projectRes.data.name,
    statusLabel: projectRes.data.status_label,
    summary: projectRes.data.summary ?? null,
    milestones: (milestonesRes.data ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      done: m.done,
      doneAt: m.done_at,
      position: m.position,
    })),
    updates: (updatesRes.data ?? []).map((u) => ({
      id: u.id,
      body: u.body,
      authorName: u.author_name,
      createdAt: u.created_at,
    })),
    members: (membersRes.data ?? []).map((row) => {
      const profile = (row.profiles ?? null) as {
        email: string;
        full_name: string | null;
      } | null;
      return {
        profileId: row.profile_id,
        email: profile?.email ?? "—",
        fullName: profile?.full_name ?? null,
      };
    }),
  };
}

export interface AssignableProject {
  id: string;
  name: string;
}

export async function getAssignableProjects(): Promise<AssignableProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p) => ({ id: p.id, name: p.name }));
}

export interface AssignableClient {
  id: string;
  email: string;
  fullName: string | null;
}

/** profiles role='client' CHƯA là thành viên của projectId. Lọc trong JS (quy mô nhỏ). */
export async function getAssignableClients(
  projectId: string,
): Promise<AssignableClient[]> {
  const supabase = await createClient();

  const [clientsRes, membersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("role", "client")
      .order("email", { ascending: true }),
    supabase
      .from("project_members")
      .select("profile_id")
      .eq("project_id", projectId),
  ]);
  if (clientsRes.error) throw clientsRes.error;
  if (membersRes.error) throw membersRes.error;

  const memberIds = new Set(
    (membersRes.data ?? []).map((m) => m.profile_id),
  );
  return (clientsRes.data ?? [])
    .filter((c) => !memberIds.has(c.id))
    .map((c) => ({ id: c.id, email: c.email, fullName: c.full_name }));
}
```

- [ ] **Bước 2: Typecheck**

Chạy: `npx tsc --noEmit; echo "tsc=$?"`
Kỳ vọng: `tsc=0`. Nếu type embed của Supabase (`milestones(done)`, `project_members(projects(name))`, `profiles(email, full_name)`) không khớp shape thực tế → điều chỉnh cast cho đúng (mảng object, hoặc object đơn / `null` với quan hệ 1-1). `database.types.ts` (sinh từ Slice 1) là nguồn type.

- [ ] **Bước 3: Kiểm tra truy vấn thật bằng script tạm (Supabase local)**

Yêu cầu: `npx supabase start` + `npx supabase db reset` đã chạy.

```bash
cat > "$TMPDIR/check-admin-queries.mjs" <<'EOF'
import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env.test");
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);
await s.auth.signInWithPassword({
  email: "admin@dnkhouse.test",
  password: "portal-dev-123",
});
const projects = await s
  .from("projects")
  .select("id, name, status_label, updated_at, milestones(done), project_members(profile_id)")
  .order("updated_at", { ascending: false });
console.log("projects:", JSON.stringify(projects.data, null, 2));
const pending = await s.from("profiles").select("id, email, full_name, created_at").eq("role", "pending");
console.log("pending:", pending.data);
const clients = await s
  .from("profiles")
  .select("id, email, full_name, project_members(projects(name))")
  .eq("role", "client");
console.log("clients:", JSON.stringify(clients.data, null, 2));
EOF
node "$TMPDIR/check-admin-queries.mjs"
rm "$TMPDIR/check-admin-queries.mjs"
```

Kỳ vọng: `projects` có 2 dòng (A, B) kèm mảng `milestones` và `project_members`; `pending` có 1 dòng (`pending@dnkhouse.test`); `clients` có 3 dòng, khách A/B kèm tên dự án, khách C mảng rỗng. Nếu shape khác kỳ vọng, sửa mapping ở Bước 1 cho khớp rồi chạy lại.

- [ ] **Bước 4: Commit**

```bash
git add src/lib/portal/admin-queries.ts
git commit -m "feat(portal): admin-queries — truy vấn đọc cho khu quản trị"
```

---

## Task 6: `admin-actions.ts` — CRUD dự án

**Files:**
- Tạo mới: `src/lib/portal/admin-actions.ts`

**Interfaces:**
- Consumes: `requireAdmin` (Task 1), `validateProjectInput` (Task 3), `createClient` (`@/lib/supabase/server`), `revalidatePath` (`next/cache`), `redirect` (`next/navigation`).
- Produces: `ActionState`, `initialActionState`, `createProject`, `updateProject`, `deleteProject` (xem "Bản đồ interface dùng chung"). Các action mốc/nhật ký/thành viên thêm ở Task 7–9 **cùng file này**.

- [ ] **Bước 1: Viết `src/lib/portal/admin-actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/session";
import { validateProjectInput } from "@/lib/portal/admin-validation";

export interface ActionState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export const initialActionState: ActionState = {};

const GENERIC_ERROR =
  "Không lưu được thay đổi. Vui lòng thử lại; nếu vẫn lỗi hãy báo DNK House.";

function projectPath(id: string) {
  return `/portal/admin/projects/${id}`;
}

/** Revalidate trang làm việc 1 dự án + (tuỳ chọn) các trang danh sách/giao diện khách. */
function revalidateProject(
  id: string,
  opts: { list?: boolean; clientView?: boolean } = {},
) {
  revalidatePath("/portal/admin/projects/[id]", "page");
  if (opts.list) revalidatePath("/portal/admin");
  if (opts.clientView) {
    revalidatePath("/portal/[projectId]", "page");
    revalidatePath("/portal");
  }
}

export async function createProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = validateProjectInput(formData);
  if (!parsed.ok)
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: parsed.value.name,
      status_label: parsed.value.statusLabel,
      summary: parsed.value.summary,
    })
    .select("id")
    .single();
  if (error || !data) return { error: GENERIC_ERROR };

  revalidatePath("/portal/admin");
  redirect(projectPath(data.id));
}

export async function updateProject(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = validateProjectInput(formData);
  if (!parsed.ok)
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.value.name,
      status_label: parsed.value.statusLabel,
      summary: parsed.value.summary,
    })
    .eq("id", projectId);
  if (error) return { error: GENERIC_ERROR };

  revalidateProject(projectId, { list: true, clientView: true });
  return { ok: true };
}

export async function deleteProject(projectId: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  // ON DELETE CASCADE lo milestones / updates / project_members.
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;

  revalidatePath("/portal/admin");
  revalidatePath("/portal");
  redirect("/portal/admin");
}
```

> **Ghi chú kiểu:** `deleteProject` dùng làm `<form action={deleteProject.bind(null, id)}>` — React truyền thêm `FormData` khi submit, nhưng chữ ký chỉ khai báo `projectId` và bỏ qua tham số thừa (JS cho phép). Nếu ESLint cảnh báo, thêm `_formData?: FormData` vào chữ ký. Giữ nhất quán cho mọi action bound-args ở Task 7–9.

- [ ] **Bước 2: Typecheck + lint**

Chạy: `npx tsc --noEmit` → `tsc=0`.
Chạy: `npm run lint` → không lỗi mới.

- [ ] **Bước 3: Kiểm tra hành vi bằng script tạm (đi qua RLS như admin)**

```bash
cat > "$TMPDIR/check-project-crud.mjs" <<'EOF'
import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env.test");
const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);
await s.auth.signInWithPassword({ email: "admin@dnkhouse.test", password: "portal-dev-123" });
const ins = await s.from("projects").insert({ name: "KT tạm", status_label: "Nháp" }).select("id").single();
console.log("insert:", ins.error ?? ins.data);
const upd = await s.from("projects").update({ name: "KT tạm 2" }).eq("id", ins.data.id);
console.log("update err:", upd.error);
const del = await s.from("projects").delete().eq("id", ins.data.id);
console.log("delete err:", del.error);
EOF
node "$TMPDIR/check-project-crud.mjs"
rm "$TMPDIR/check-project-crud.mjs"
```

Kỳ vọng: insert trả `{ id }`, update/delete `err: null`.

- [ ] **Bước 4: Commit**

```bash
git add src/lib/portal/admin-actions.ts
git commit -m "feat(portal): admin-actions — CRUD dự án (create/update/delete)"
```

---

## Task 7: `admin-actions.ts` — action cho mốc triển khai

**Files:**
- Chỉnh sửa: `src/lib/portal/admin-actions.ts` (thêm import + 5 hàm)

**Interfaces:**
- Consumes: `validateMilestoneTitle`, `validateDirection` (Task 3), `reorderMilestones` (Task 4), các helper `revalidateProject` / `GENERIC_ERROR` (Task 6).
- Produces: `addMilestone`, `renameMilestone`, `toggleMilestone`, `deleteMilestone`, `reorderMilestone` (xem "Bản đồ interface dùng chung").

- [ ] **Bước 1: Thêm import vào đầu `src/lib/portal/admin-actions.ts`**

```ts
import {
  validateDirection,
  validateMilestoneTitle,
  validateProjectInput,
} from "@/lib/portal/admin-validation";
import { reorderMilestones } from "@/lib/portal/milestone-order";
```

(gộp dòng `validateProjectInput` đã có — thay import cũ bằng import gộp ở trên; thêm dòng `reorderMilestones`.)

- [ ] **Bước 2: Thêm 5 hàm vào cuối `src/lib/portal/admin-actions.ts`**

```ts
// ============ Mốc triển khai ============

export async function addMilestone(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = validateMilestoneTitle(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("milestones")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (countError) return { error: GENERIC_ERROR };

  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    title: parsed.value.title,
    position: count ?? 0,
  });
  if (error) return { error: GENERIC_ERROR };

  revalidateProject(projectId, { list: true, clientView: true });
  return { ok: true };
}

export async function renameMilestone(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  const milestoneId = String(formData.get("milestoneId") ?? "");
  const parsed = validateMilestoneTitle(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("milestones")
    .update({ title: parsed.value.title })
    .eq("id", milestoneId)
    .eq("project_id", projectId);
  if (error) return { error: GENERIC_ERROR };

  revalidateProject(projectId, { clientView: true });
  return { ok: true };
}

export async function toggleMilestone(
  projectId: string,
  milestoneId: string,
  done: boolean,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  // Trigger set_milestone_done_at tự set/xoá done_at.
  const { error } = await supabase
    .from("milestones")
    .update({ done })
    .eq("id", milestoneId)
    .eq("project_id", projectId);
  if (error) throw error;

  revalidateProject(projectId, { list: true, clientView: true });
}

export async function deleteMilestone(
  projectId: string,
  milestoneId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", milestoneId)
    .eq("project_id", projectId);
  if (error) throw error;

  // Không renumber ở đây — reorderMilestone tự lành position lần kế tiếp.
  revalidateProject(projectId, { list: true, clientView: true });
}

export async function reorderMilestone(
  projectId: string,
  milestoneId: string,
  direction: "up" | "down",
): Promise<void> {
  await requireAdmin();
  const dir = validateDirection(direction);
  if (!dir.ok) throw new Error(dir.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .select("id, position")
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;

  const reordered = reorderMilestones(data ?? [], milestoneId, dir.value);
  for (const m of reordered) {
    const { error: updError } = await supabase
      .from("milestones")
      .update({ position: m.position })
      .eq("id", m.id)
      .eq("project_id", projectId);
    if (updError) throw updError;
  }

  revalidateProject(projectId, { clientView: true });
}
```

- [ ] **Bước 3: Typecheck + lint**

Chạy: `npx tsc --noEmit` → `tsc=0`. Chạy: `npm run lint` → không lỗi mới.

- [ ] **Bước 4: Kiểm tra bằng script tạm (thêm/đổi tên/toggle/reorder/xoá mốc như admin)**

```bash
cat > "$TMPDIR/check-milestones.mjs" <<'EOF'
import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env.test");
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
await s.auth.signInWithPassword({ email: "admin@dnkhouse.test", password: "portal-dev-123" });
const P = "aaaaaaaa-0000-0000-0000-000000000001";
const before = await s.from("milestones").select("id, title, position, done").eq("project_id", P).order("position");
console.log("before:", before.data);
const on = await s.from("milestones").update({ done: true }).eq("id", before.data.at(-1).id).select("done, done_at").single();
console.log("toggle done -> done_at set:", on.data);
await s.from("milestones").update({ done: false }).eq("id", before.data.at(-1).id);
EOF
node "$TMPDIR/check-milestones.mjs"
rm "$TMPDIR/check-milestones.mjs"
```

Kỳ vọng: `before` liệt kê 4 mốc dự án A theo `position`; toggle `done=true` → `done_at` khác `null` (trigger chạy).

- [ ] **Bước 5: Commit**

```bash
git add src/lib/portal/admin-actions.ts
git commit -m "feat(portal): admin-actions — mốc (thêm/đổi tên/toggle/xoá/sắp thứ tự)"
```

---

## Task 8: `admin-actions.ts` — action cho nhật ký cập nhật

**Files:**
- Chỉnh sửa: `src/lib/portal/admin-actions.ts` (thêm import `validateUpdateInput` + 3 hàm)

**Interfaces:**
- Consumes: `validateUpdateInput` (Task 3).
- Produces: `addUpdate`, `updateUpdate`, `deleteUpdate` (xem "Bản đồ interface dùng chung").

- [ ] **Bước 1: Bổ sung `validateUpdateInput` vào import validation ở đầu file**

```ts
import {
  validateDirection,
  validateMilestoneTitle,
  validateProjectInput,
  validateUpdateInput,
} from "@/lib/portal/admin-validation";
```

- [ ] **Bước 2: Thêm 3 hàm vào cuối `src/lib/portal/admin-actions.ts`**

```ts
// ============ Nhật ký cập nhật ============

export async function addUpdate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  const parsed = validateUpdateInput(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("updates").insert({
    project_id: projectId,
    body: parsed.value.body,
    author_name: parsed.value.authorName,
  });
  if (error) return { error: GENERIC_ERROR };

  revalidateProject(projectId, { list: true, clientView: true });
  return { ok: true };
}

export async function updateUpdate(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const projectId = String(formData.get("projectId") ?? "");
  const updateId = String(formData.get("updateId") ?? "");
  const parsed = validateUpdateInput(formData);
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const supabase = await createClient();
  // KHÔNG đổi created_at.
  const { error } = await supabase
    .from("updates")
    .update({ body: parsed.value.body, author_name: parsed.value.authorName })
    .eq("id", updateId)
    .eq("project_id", projectId);
  if (error) return { error: GENERIC_ERROR };

  revalidateProject(projectId, { clientView: true });
  return { ok: true };
}

export async function deleteUpdate(
  projectId: string,
  updateId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("updates")
    .delete()
    .eq("id", updateId)
    .eq("project_id", projectId);
  if (error) throw error;

  revalidateProject(projectId, { clientView: true });
}
```

- [ ] **Bước 3: Typecheck + lint**

Chạy: `npx tsc --noEmit` → `tsc=0`. Chạy: `npm run lint` → không lỗi mới.

- [ ] **Bước 4: Commit**

```bash
git add src/lib/portal/admin-actions.ts
git commit -m "feat(portal): admin-actions — nhật ký cập nhật (thêm/sửa/xoá)"
```

---

## Task 9: `admin-actions.ts` — duyệt khách + gán/gỡ thành viên

**Files:**
- Chỉnh sửa: `src/lib/portal/admin-actions.ts` (thêm import `validateProjectIds` + 3 hàm)

**Interfaces:**
- Consumes: `validateProjectIds` (Task 3).
- Produces: `approveAndAssign`, `addMember`, `removeMember` (xem "Bản đồ interface dùng chung").

- [ ] **Bước 1: Bổ sung `validateProjectIds` vào import validation ở đầu file**

```ts
import {
  validateDirection,
  validateMilestoneTitle,
  validateProjectIds,
  validateProjectInput,
  validateUpdateInput,
} from "@/lib/portal/admin-validation";
```

- [ ] **Bước 2: Thêm 3 hàm vào cuối `src/lib/portal/admin-actions.ts`**

```ts
// ============ Khách & thành viên ============

export async function approveAndAssign(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const profileId = String(formData.get("profileId") ?? "");
  const projectIds = formData
    .getAll("projectIds")
    .map((v) => String(v));
  const parsed = validateProjectIds(projectIds);
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();

  const { error: roleError } = await supabase
    .from("profiles")
    .update({ role: "client" })
    .eq("id", profileId)
    .eq("role", "pending");
  if (roleError) return { error: GENERIC_ERROR };

  if (parsed.value.length > 0) {
    const { error: memberError } = await supabase
      .from("project_members")
      .insert(
        parsed.value.map((projectId) => ({
          project_id: projectId,
          profile_id: profileId,
        })),
      );
    if (memberError) return { error: GENERIC_ERROR };
  }

  revalidatePath("/portal/admin");
  revalidatePath("/portal");
  redirect("/portal/admin");
}

export async function addMember(
  projectId: string,
  profileId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, profile_id: profileId });
  if (error) throw error;

  revalidateProject(projectId, { list: true, clientView: true });
}

export async function removeMember(
  projectId: string,
  profileId: string,
): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  // Chỉ xoá dòng project_members — KHÔNG đụng profiles.role.
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("profile_id", profileId);
  if (error) throw error;

  revalidateProject(projectId, { list: true, clientView: true });
}
```

- [ ] **Bước 3: Typecheck + lint**

Chạy: `npx tsc --noEmit` → `tsc=0`. Chạy: `npm run lint` → không lỗi mới.

- [ ] **Bước 4: Kiểm tra bằng script tạm (duyệt + gán + gỡ — nhớ khôi phục seed sau)**

```bash
cat > "$TMPDIR/check-approve.mjs" <<'EOF'
import { createClient } from "@supabase/supabase-js";
process.loadEnvFile(".env.test");
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
await s.auth.signInWithPassword({ email: "admin@dnkhouse.test", password: "portal-dev-123" });
const PENDING = "44444444-4444-4444-4444-444444444444";
const P = "aaaaaaaa-0000-0000-0000-000000000001";
console.log("role->client:", (await s.from("profiles").update({ role: "client" }).eq("id", PENDING).eq("role", "pending")).error);
console.log("add member:", (await s.from("project_members").insert({ project_id: P, profile_id: PENDING })).error);
console.log("remove member:", (await s.from("project_members").delete().eq("project_id", P).eq("profile_id", PENDING)).error);
EOF
node "$TMPDIR/check-approve.mjs"
rm "$TMPDIR/check-approve.mjs"
npx supabase db reset   # khôi phục seed sau khi đã đổi role user pending
```

Kỳ vọng: cả 3 dòng in `null` (không lỗi). `npx supabase db reset` đưa seed về trạng thái đầu.

- [ ] **Bước 5: Commit**

```bash
git add src/lib/portal/admin-actions.ts
git commit -m "feat(portal): admin-actions — duyệt khách + gán/gỡ thành viên"
```

---

## Task 10: Token trạng thái + `DeleteButton` + `AdminNav`

**Files:**
- Chỉnh sửa: `src/app/globals.css`
- Tạo mới: `src/components/portal/admin/DeleteButton.tsx`
- Tạo mới: `src/components/portal/admin/AdminNav.tsx`

**Interfaces:**
- Consumes: `Link` từ `next/link`, `lucide-react`.
- Produces:
  - `DeleteButton({ action, confirmText, label }: { action: (formData: FormData) => void | Promise<void>; confirmText: string; label: string })` — `"use client"`; render `<form>` với `onSubmit` chặn nếu `!confirm(confirmText)`.
  - `AdminNav()` — Server Component; thanh phụ tĩnh.

- [ ] **Bước 1: Thêm token vào `src/app/globals.css`**

Trong `:root` (sau `--border`):

```css
  --danger: #b91c1c;
  --danger-foreground: #ffffff;
  --success: #15803d;
```

Trong `@theme inline` (sau `--color-border`):

```css
  --color-danger: var(--danger);
  --color-danger-foreground: var(--danger-foreground);
  --color-success: var(--success);
```

- [ ] **Bước 2: Viết `src/components/portal/admin/DeleteButton.tsx`**

```tsx
"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  confirmText,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmText: string;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-full border border-danger px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger hover:text-danger-foreground"
      >
        <Trash2 className="size-3.5" aria-hidden />
        {label}
      </button>
    </form>
  );
}
```

- [ ] **Bước 3: Viết `src/components/portal/admin/AdminNav.tsx`**

```tsx
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

export function AdminNav() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
        <ShieldCheck className="size-4 text-accent" aria-hidden />
        Khu quản trị
      </span>
      <Link
        href="/portal"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        Xem giao diện khách
        <ArrowUpRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
```

- [ ] **Bước 4: Typecheck + lint + build (sinh type route mới không cần ở bước này, nhưng kiểm CSS token)**

Chạy: `npx tsc --noEmit` → `tsc=0`. Chạy: `npm run lint` → sạch.
Chạy: `npm run build` → xanh (xác nhận class `text-danger` / `bg-danger` / `text-success` được Tailwind nhận từ `@theme inline`).

- [ ] **Bước 5: Commit**

```bash
git add src/app/globals.css src/components/portal/admin/DeleteButton.tsx src/components/portal/admin/AdminNav.tsx
git commit -m "feat(portal): token trạng thái + DeleteButton + AdminNav"
```

---

## Task 11: `ProjectForm` + trang `/portal/admin/projects/new`

**Files:**
- Tạo mới: `src/components/portal/admin/ProjectForm.tsx`
- Tạo mới: `src/app/portal/admin/projects/new/page.tsx`

**Interfaces:**
- Consumes: `useActionState` (`react`), `createProject`, `updateProject`, `ActionState`, `initialActionState` (Task 6), `requireAdmin` (Task 1), `AdminNav` (Task 10).
- Produces:
  - `ProjectForm({ mode, project }: { mode: "create" | "edit"; project?: { id: string; name: string; statusLabel: string; summary: string | null } })` — `"use client"`.

- [ ] **Bước 1: Viết `src/components/portal/admin/ProjectForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import {
  createProject,
  initialActionState,
  updateProject,
} from "@/lib/portal/admin-actions";

interface ProjectFormProps {
  mode: "create" | "edit";
  project?: { id: string; name: string; statusLabel: string; summary: string | null };
}

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

export function ProjectForm({ mode, project }: ProjectFormProps) {
  const action = mode === "create" ? createProject : updateProject;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" && (
        <input type="hidden" name="projectId" value={project!.id} />
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Tên dự án
        </label>
        <input
          id="name"
          name="name"
          defaultValue={project?.name ?? ""}
          maxLength={200}
          required
          className={fieldClass}
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="status_label"
          className="block text-sm font-medium text-foreground"
        >
          Trạng thái (vd: Đang triển khai)
        </label>
        <input
          id="status_label"
          name="status_label"
          defaultValue={project?.statusLabel ?? ""}
          maxLength={100}
          required
          className={fieldClass}
        />
        {state.fieldErrors?.status_label && (
          <p className="mt-1 text-xs text-danger">
            {state.fieldErrors.status_label}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-foreground"
        >
          Tóm tắt <span className="text-muted">(tùy chọn)</span>
        </label>
        <textarea
          id="summary"
          name="summary"
          defaultValue={project?.summary ?? ""}
          maxLength={2000}
          rows={3}
          className={fieldClass}
        />
        {state.fieldErrors?.summary && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.summary}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending
            ? "Đang lưu…"
            : mode === "create"
              ? "Tạo dự án"
              : "Lưu thay đổi"}
        </button>
        {mode === "edit" && state.ok && (
          <span className="text-sm text-success">Đã lưu.</span>
        )}
      </div>
    </form>
  );
}
```

- [ ] **Bước 2: Viết `src/app/portal/admin/projects/new/page.tsx`**

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/portal/session";
import { AdminNav } from "@/components/portal/admin/AdminNav";
import { ProjectForm } from "@/components/portal/admin/ProjectForm";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div>
      <AdminNav />
      <Link
        href="/portal/admin"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Trang quản trị
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Tạo dự án mới
      </h1>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <ProjectForm mode="create" />
      </div>
    </div>
  );
}
```

- [ ] **Bước 3: Build (sinh type route) + typecheck + lint**

Chạy: `npm run build` → xanh (sinh `.next/types` cho route `/portal/admin/projects/new`).
Chạy: `npx tsc --noEmit` → `tsc=0`. Chạy: `npm run lint` → sạch.

- [ ] **Bước 4: Kiểm thử thủ công (dev server + Supabase local, đăng nhập admin)**

`npm run dev`, đăng nhập `admin@dnkhouse.test` (qua `/auth/test-login?email=admin@dnkhouse.test` nếu chạy với `E2E_TEST_LOGIN=1`, hoặc Google thật nếu `.env.local` trỏ hosted). Mở `/portal/admin/projects/new`:
- Submit form trống → thấy lỗi field "Vui lòng nhập tên dự án." / "…trạng thái…", không điều hướng.
- Nhập hợp lệ → điều hướng sang `/portal/admin/projects/<id mới>` (trang này 404 tới Task 12–18 xong; xác nhận URL đổi đúng dạng UUID là đủ ở bước này).

- [ ] **Bước 5: Commit**

```bash
git add src/components/portal/admin/ProjectForm.tsx src/app/portal/admin/projects/new/page.tsx
git commit -m "feat(portal): ProjectForm + trang tạo dự án /portal/admin/projects/new"
```

---

## Task 12: `MilestoneManager` (client)

**Files:**
- Tạo mới: `src/components/portal/admin/MilestoneManager.tsx`

**Interfaces:**
- Consumes: `useActionState`, `useState`, `useRef`, `useTransition` (`react`); `addMilestone`, `renameMilestone`, `toggleMilestone`, `deleteMilestone`, `reorderMilestone`, `initialActionState` (Task 7); `formatVnDate` (`@/lib/portal/format`); `lucide-react`; `AdminMilestone` (Task 5).
- Produces: `MilestoneManager({ projectId, milestones }: { projectId: string; milestones: AdminMilestone[] })` — `"use client"`. Chứa child `MilestoneRow` cùng file.

- [ ] **Bước 1: Viết `src/components/portal/admin/MilestoneManager.tsx`**

```tsx
"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Check, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import {
  addMilestone,
  deleteMilestone,
  initialActionState,
  renameMilestone,
  reorderMilestone,
  toggleMilestone,
} from "@/lib/portal/admin-actions";
import { formatVnDate } from "@/lib/portal/format";
import type { AdminMilestone } from "@/lib/portal/admin-queries";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

export function MilestoneManager({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: AdminMilestone[];
}) {
  const [addState, addAction, adding] = useActionState(
    addMilestone,
    initialActionState,
  );
  const addFormRef = useRef<HTMLFormElement>(null);

  // Reset ô nhập sau khi thêm thành công.
  if (addState.ok && addFormRef.current) addFormRef.current.reset();

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {milestones.length === 0 ? (
        <p className="text-sm text-muted">Chưa có mốc nào.</p>
      ) : (
        <ol className="space-y-2">
          {milestones.map((m, i) => (
            <MilestoneRow
              key={m.id}
              projectId={projectId}
              milestone={m}
              isFirst={i === 0}
              isLast={i === milestones.length - 1}
            />
          ))}
        </ol>
      )}

      <form
        ref={addFormRef}
        action={addAction}
        className="mt-4 flex flex-wrap items-start gap-2"
      >
        <input type="hidden" name="projectId" value={projectId} />
        <div className="min-w-[12rem] flex-1">
          <input
            name="title"
            placeholder="Tên mốc mới"
            maxLength={200}
            required
            className={fieldClass}
          />
          {addState.fieldErrors?.title && (
            <p className="mt-1 text-xs text-danger">
              {addState.fieldErrors.title}
            </p>
          )}
          {addState.error && (
            <p className="mt-1 text-xs text-danger">{addState.error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={adding}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:opacity-60"
        >
          {adding ? "Đang thêm…" : "Thêm mốc"}
        </button>
      </form>
    </div>
  );
}

function MilestoneRow({
  projectId,
  milestone,
  isFirst,
  isLast,
}: {
  projectId: string;
  milestone: AdminMilestone;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [renameState, renameAction] = useActionState(
    renameMilestone,
    initialActionState,
  );

  // Đóng ô sửa khi lưu thành công.
  if (renameState.ok && editing) setEditing(false);

  return (
    <li className="flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <button
        type="button"
        aria-label={
          milestone.done ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"
        }
        aria-pressed={milestone.done}
        disabled={pending}
        onClick={() =>
          startTransition(() =>
            toggleMilestone(projectId, milestone.id, !milestone.done),
          )
        }
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
          milestone.done
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border bg-background"
        }`}
      >
        {milestone.done && <Check className="size-3" aria-hidden />}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <form action={renameAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="milestoneId" value={milestone.id} />
            <input
              name="title"
              defaultValue={milestone.title}
              maxLength={200}
              required
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditing(false);
              }}
              className={`${fieldClass} flex-1`}
            />
            <button
              type="submit"
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted"
            >
              Huỷ
            </button>
            {renameState.fieldErrors?.title && (
              <p className="w-full text-xs text-danger">
                {renameState.fieldErrors.title}
              </p>
            )}
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="group inline-flex items-center gap-1.5 text-left text-sm text-foreground"
          >
            {milestone.title}
            <Pencil
              className="size-3 text-muted opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </button>
        )}
        {milestone.done && milestone.doneAt && !editing && (
          <p className="mt-0.5 text-xs text-muted">
            Hoàn thành ngày {formatVnDate(milestone.doneAt)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Đưa lên trên"
          disabled={isFirst || pending}
          onClick={() =>
            startTransition(() =>
              reorderMilestone(projectId, milestone.id, "up"),
            )
          }
          className="rounded-md border border-border p-1 text-muted disabled:opacity-30"
        >
          <ChevronUp className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Đưa xuống dưới"
          disabled={isLast || pending}
          onClick={() =>
            startTransition(() =>
              reorderMilestone(projectId, milestone.id, "down"),
            )
          }
          className="rounded-md border border-border p-1 text-muted disabled:opacity-30"
        >
          <ChevronDown className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Xoá mốc"
          disabled={pending}
          onClick={() => {
            if (window.confirm(`Xoá mốc "${milestone.title}"?`)) {
              startTransition(() => deleteMilestone(projectId, milestone.id));
            }
          }}
          className="rounded-md border border-border p-1 text-danger disabled:opacity-30"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}
```

> **Ghi chú:** gọi `startTransition(() => serverAction(...))` với action trả `Promise<void>` là hợp lệ ở React 19 (transition chờ promise). `addFormRef.current.reset()` / `setEditing(false)` gọi trong thân render dựa trên `state.ok` — chấp nhận được vì `state` chỉ `ok` đúng 1 lần sau submit; nếu reviewer thấy rủi ro double-render, chuyển sang `useEffect(() => { if (state.ok) ... }, [state])`.

- [ ] **Bước 2: Build + typecheck + lint**

Chạy: `npm run build` → xanh. `npx tsc --noEmit` → `tsc=0`. `npm run lint` → sạch.

- [ ] **Bước 3: Commit**

```bash
git add src/components/portal/admin/MilestoneManager.tsx
git commit -m "feat(portal): MilestoneManager — quản lý mốc (toggle/sửa/sắp xếp/xoá/thêm)"
```

---

## Task 13: `UpdateManager` (client)

**Files:**
- Tạo mới: `src/components/portal/admin/UpdateManager.tsx`

**Interfaces:**
- Consumes: `useActionState`, `useState`, `useRef` (`react`); `addUpdate`, `updateUpdate`, `deleteUpdate`, `initialActionState` (Task 8); `formatVnDate`; `lucide-react`; `AdminUpdate` (Task 5).
- Produces: `UpdateManager({ projectId, updates, defaultAuthorName }: { projectId: string; updates: AdminUpdate[]; defaultAuthorName: string })` — `"use client"`. Child `UpdateRow` cùng file.

- [ ] **Bước 1: Viết `src/components/portal/admin/UpdateManager.tsx`**

```tsx
"use client";

import { useActionState, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  addUpdate,
  deleteUpdate,
  initialActionState,
  updateUpdate,
} from "@/lib/portal/admin-actions";
import { formatVnDate } from "@/lib/portal/format";
import type { AdminUpdate } from "@/lib/portal/admin-queries";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

export function UpdateManager({
  projectId,
  updates,
  defaultAuthorName,
}: {
  projectId: string;
  updates: AdminUpdate[];
  defaultAuthorName: string;
}) {
  const [addState, addAction, adding] = useActionState(
    addUpdate,
    initialActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  if (addState.ok && formRef.current) formRef.current.reset();

  return (
    <div>
      <form
        ref={formRef}
        action={addAction}
        className="space-y-3 rounded-2xl border border-border bg-surface p-5"
      >
        <input type="hidden" name="projectId" value={projectId} />
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-foreground">
            Nội dung cập nhật
          </label>
          <textarea
            id="body"
            name="body"
            rows={3}
            maxLength={5000}
            required
            className={`${fieldClass} mt-1`}
          />
          {addState.fieldErrors?.body && (
            <p className="mt-1 text-xs text-danger">{addState.fieldErrors.body}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="author_name"
            className="block text-sm font-medium text-foreground"
          >
            Người đăng
          </label>
          <input
            id="author_name"
            name="author_name"
            defaultValue={defaultAuthorName}
            maxLength={120}
            required
            className={`${fieldClass} mt-1`}
          />
          {addState.fieldErrors?.author_name && (
            <p className="mt-1 text-xs text-danger">
              {addState.fieldErrors.author_name}
            </p>
          )}
        </div>
        {addState.error && (
          <p className="text-sm text-danger">{addState.error}</p>
        )}
        <button
          type="submit"
          disabled={adding}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {adding ? "Đang đăng…" : "Đăng"}
        </button>
      </form>

      {updates.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Chưa có cập nhật nào.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {updates.map((u) => (
            <UpdateRow key={u.id} projectId={projectId} update={u} />
          ))}
        </ol>
      )}
    </div>
  );
}

function UpdateRow({
  projectId,
  update,
}: {
  projectId: string;
  update: AdminUpdate;
}) {
  const [editing, setEditing] = useState(false);
  const [editState, editAction, saving] = useActionState(
    updateUpdate,
    initialActionState,
  );
  if (editState.ok && editing) setEditing(false);

  return (
    <li className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>
          <time dateTime={update.createdAt}>
            {formatVnDate(update.createdAt)}
          </time>
          {" · "}
          {update.authorName}
        </span>
        {!editing && (
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 text-muted transition-colors hover:text-foreground"
            >
              <Pencil className="size-3.5" aria-hidden />
              Sửa
            </button>
            <form
              action={deleteUpdate.bind(null, projectId, update.id)}
              onSubmit={(e) => {
                if (!window.confirm("Xoá nhật ký này?")) e.preventDefault();
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1 text-danger transition-opacity hover:opacity-80"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Xoá
              </button>
            </form>
          </span>
        )}
      </div>

      {editing ? (
        <form action={editAction} className="mt-3 space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="updateId" value={update.id} />
          <textarea
            name="body"
            defaultValue={update.body}
            rows={3}
            maxLength={5000}
            required
            className={fieldClass}
          />
          {editState.fieldErrors?.body && (
            <p className="text-xs text-danger">{editState.fieldErrors.body}</p>
          )}
          <input
            name="author_name"
            defaultValue={update.authorName}
            maxLength={120}
            required
            className={fieldClass}
          />
          {editState.fieldErrors?.author_name && (
            <p className="text-xs text-danger">
              {editState.fieldErrors.author_name}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-60"
            >
              {saving ? "Đang lưu…" : "Lưu"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-border px-4 py-1.5 text-xs text-muted"
            >
              Huỷ
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {update.body}
        </p>
      )}
    </li>
  );
}
```

- [ ] **Bước 2: Build + typecheck + lint**

Chạy: `npm run build` → xanh. `npx tsc --noEmit` → `tsc=0`. `npm run lint` → sạch.

- [ ] **Bước 3: Commit**

```bash
git add src/components/portal/admin/UpdateManager.tsx
git commit -m "feat(portal): UpdateManager — đăng/sửa/xoá nhật ký cập nhật"
```

---

## Task 14: `MemberList` (Server Component + form action)

**Files:**
- Tạo mới: `src/components/portal/admin/MemberList.tsx`

**Interfaces:**
- Consumes: `addMember`, `removeMember` (Task 9); `getAssignableClients` (Task 5); `AdminMember` (Task 5); `lucide-react`.
- Produces: `MemberList({ projectId, members }: { projectId: string; members: AdminMember[] })` — **async Server Component** (tự gọi `getAssignableClients(projectId)`).

- [ ] **Bước 1: Viết `src/components/portal/admin/MemberList.tsx`**

```tsx
import { UserMinus, UserPlus } from "lucide-react";
import { addMember, removeMember } from "@/lib/portal/admin-actions";
import { getAssignableClients } from "@/lib/portal/admin-queries";
import type { AdminMember } from "@/lib/portal/admin-queries";

export async function MemberList({
  projectId,
  members,
}: {
  projectId: string;
  members: AdminMember[];
}) {
  const assignable = await getAssignableClients(projectId);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {members.length === 0 ? (
        <p className="text-sm text-muted">Chưa có thành viên nào.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.profileId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="text-foreground">
                {m.fullName ? `${m.fullName} · ` : ""}
                <span className="text-muted">{m.email}</span>
              </span>
              <form action={removeMember.bind(null, projectId, m.profileId)}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-xs text-danger transition-opacity hover:opacity-80"
                >
                  <UserMinus className="size-3.5" aria-hidden />
                  Gỡ
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {assignable.length > 0 && (
        <form
          action={async (formData: FormData) => {
            "use server";
            const profileId = String(formData.get("profileId") ?? "");
            if (profileId) await addMember(projectId, profileId);
          }}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <select
            name="profileId"
            required
            defaultValue=""
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="" disabled>
              Chọn khách để thêm…
            </option>
            {assignable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName ? `${c.fullName} — ${c.email}` : c.email}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            <UserPlus className="size-4" aria-hidden />
            Thêm
          </button>
        </form>
      )}
    </div>
  );
}
```

> **Ghi chú:** inline Server Action trong `form action={async () => { "use server"; ... }}` được Next 16 hỗ trợ. Nếu build cảnh báo về closure encryption/serialize, chuyển sang một action `addMemberFromForm(projectId: string, formData: FormData)` trong `admin-actions.ts` và dùng `.bind(null, projectId)`. Bám phương án inline trước; đổi nếu build không xanh.

- [ ] **Bước 2: Build + typecheck + lint**

Chạy: `npm run build` → xanh. `npx tsc --noEmit` → `tsc=0`. `npm run lint` → sạch. Nếu build lỗi ở inline action → áp phương án `.bind` nêu trên, thêm `addMemberFromForm` vào `admin-actions.ts` (Task 9 file), commit kèm.

- [ ] **Bước 3: Commit**

```bash
git add src/components/portal/admin/MemberList.tsx
git commit -m "feat(portal): MemberList — danh sách + thêm/gỡ thành viên dự án"
```

---

## Task 15: `ApproveAssignForm` (client)

**Files:**
- Tạo mới: `src/components/portal/admin/ApproveAssignForm.tsx`

**Interfaces:**
- Consumes: `useActionState` (`react`); `approveAndAssign`, `initialActionState` (Task 9); `AssignableProject` (Task 5).
- Produces: `ApproveAssignForm({ profileId, projects }: { profileId: string; projects: AssignableProject[] })` — `"use client"`.

- [ ] **Bước 1: Viết `src/components/portal/admin/ApproveAssignForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { approveAndAssign, initialActionState } from "@/lib/portal/admin-actions";
import type { AssignableProject } from "@/lib/portal/admin-queries";

export function ApproveAssignForm({
  profileId,
  projects,
}: {
  profileId: string;
  projects: AssignableProject[];
}) {
  const [state, formAction, pending] = useActionState(
    approveAndAssign,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="profileId" value={profileId} />

      <fieldset>
        <legend className="text-sm font-medium text-foreground">
          Gán vào dự án <span className="text-muted">(có thể để trống)</span>
        </legend>
        {projects.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Chưa có dự án nào.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {projects.map((p) => (
              <li key={p.id}>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="projectIds"
                    value={p.id}
                    className="size-4 rounded border-border"
                  />
                  {p.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Đang duyệt…" : "Duyệt khách"}
      </button>
    </form>
  );
}
```

- [ ] **Bước 2: Build + typecheck + lint**

Chạy: `npm run build` → xanh. `npx tsc --noEmit` → `tsc=0`. `npm run lint` → sạch.

- [ ] **Bước 3: Commit**

```bash
git add src/components/portal/admin/ApproveAssignForm.tsx
git commit -m "feat(portal): ApproveAssignForm — duyệt khách + gán dự án"
```

---

## Task 16: Trang chủ admin `/portal/admin`

**Files:**
- Tạo mới: `src/app/portal/admin/page.tsx`

**Interfaces:**
- Consumes: `requireAdmin` (Task 1); `getAdminProjectList`, `getPendingProfiles`, `getClientProfiles` (Task 5); `AdminNav` (Task 10); `formatVnDate`; `milestoneProgress` KHÔNG cần (chỉ hiện "N/M mốc"); `Link`, `lucide-react`.
- Produces: default export page.

- [ ] **Bước 1: Viết `src/app/portal/admin/page.tsx`**

```tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/portal/session";
import {
  getAdminProjectList,
  getClientProfiles,
  getPendingProfiles,
} from "@/lib/portal/admin-queries";
import { formatVnDate } from "@/lib/portal/format";
import { AdminNav } from "@/components/portal/admin/AdminNav";

export default async function AdminHomePage() {
  await requireAdmin();
  const [projects, pending, clients] = await Promise.all([
    getAdminProjectList(),
    getPendingProfiles(),
    getClientProfiles(),
  ]);

  return (
    <div>
      <AdminNav />

      {/* Khu 1: Dự án */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-foreground">Dự án</h1>
          <Link
            href="/portal/admin/projects/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" aria-hidden />
            Tạo dự án
          </Link>
        </div>

        {projects.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Chưa có dự án nào.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/portal/admin/projects/${p.id}`}
                    className="text-sm font-medium text-foreground hover:text-accent"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {p.statusLabel} · {p.milestonesDone}/{p.milestonesTotal} mốc
                    · {p.memberCount} thành viên
                  </p>
                </div>
                <Link
                  href={`/portal/${p.id}`}
                  className="shrink-0 text-xs text-muted underline transition-colors hover:text-foreground"
                >
                  Xem như khách
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Khu 2: Khách chờ duyệt */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">
          Khách chờ duyệt
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Không có khách nào đang chờ.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pending.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <span className="text-foreground">{c.email}</span>
                  <p className="text-xs text-muted">
                    {c.fullName ?? "—"} · {formatVnDate(c.createdAt)}
                  </p>
                </div>
                <Link
                  href={`/portal/admin/pending/${c.id}`}
                  className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-background"
                >
                  Duyệt &amp; gán dự án
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Khu 3: Khách đã duyệt */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-foreground">
          Khách đã duyệt
        </h2>
        {clients.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Chưa có khách nào được duyệt.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {clients.map((c) => (
              <li
                key={c.id}
                className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              >
                <span className="text-foreground">
                  {c.fullName ? `${c.fullName} · ` : ""}
                  <span className="text-muted">{c.email}</span>
                </span>
                {c.projectNames.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {c.projectNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-background px-2 py-0.5 text-xs text-muted"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Bước 2: Build (sinh type route) + typecheck + lint**

Chạy: `npm run build` → xanh. `npx tsc --noEmit` → `tsc=0`. `npm run lint` → sạch.

- [ ] **Bước 3: Kiểm thử thủ công (dev + Supabase local, đăng nhập admin)**

Mở `/portal/admin`: thấy 3 khu; khu Dự án liệt kê 2 dự án seed (A, B) kèm "x/y mốc · z thành viên"; khu Khách chờ duyệt có `pending@dnkhouse.test`; khu Khách đã duyệt có 3 khách, A/B kèm chip tên dự án, C không chip.

- [ ] **Bước 4: Commit**

```bash
git add src/app/portal/admin/page.tsx
git commit -m "feat(portal): trang chủ /portal/admin — 3 khu (dự án / chờ duyệt / đã duyệt)"
```

---

## Task 17: Trang chi tiết dự án `/portal/admin/projects/[id]`

**Files:**
- Tạo mới: `src/app/portal/admin/projects/[id]/page.tsx`

**Interfaces:**
- Consumes: `requireAdmin` (Task 1); `getAdminProjectDetail` (Task 5); `deleteProject` (Task 6); `ProjectForm` (Task 11), `MilestoneManager` (Task 12), `UpdateManager` (Task 13), `MemberList` (Task 14), `DeleteButton` + `AdminNav` (Task 10); `Link`, `lucide-react`, `notFound` (`next/navigation`).
- Produces: default export page. `params` là `Promise<{ id: string }>`.

- [ ] **Bước 1: Viết `src/app/portal/admin/projects/[id]/page.tsx`**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/portal/session";
import { getAdminProjectDetail } from "@/lib/portal/admin-queries";
import { deleteProject } from "@/lib/portal/admin-actions";
import { AdminNav } from "@/components/portal/admin/AdminNav";
import { ProjectForm } from "@/components/portal/admin/ProjectForm";
import { MilestoneManager } from "@/components/portal/admin/MilestoneManager";
import { UpdateManager } from "@/components/portal/admin/UpdateManager";
import { MemberList } from "@/components/portal/admin/MemberList";
import { DeleteButton } from "@/components/portal/admin/DeleteButton";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminProjectDetailPage({
  params,
}: PageProps<"/portal/admin/projects/[id]">) {
  const profile = await requireAdmin();
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const project = await getAdminProjectDetail(id);
  if (!project) notFound();

  const confirmText = `Xoá dự án "${project.name}" kèm ${project.milestones.length} mốc, ${project.updates.length} nhật ký, ${project.members.length} gán thành viên — không hoàn tác được.`;

  return (
    <div>
      <AdminNav />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/portal/admin"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Trang quản trị
        </Link>
        <Link
          href={`/portal/${project.id}`}
          className="text-xs text-muted underline transition-colors hover:text-foreground"
        >
          Xem như khách
        </Link>
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        {project.name}
      </h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Thông tin dự án
        </h2>
        <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
          <ProjectForm
            mode="edit"
            project={{
              id: project.id,
              name: project.name,
              statusLabel: project.statusLabel,
              summary: project.summary,
            }}
          />
          <div className="mt-6 border-t border-border pt-4">
            <DeleteButton
              action={deleteProject.bind(null, project.id)}
              confirmText={confirmText}
              label="Xoá dự án"
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Các mốc triển khai
        </h2>
        <div className="mt-4">
          <MilestoneManager
            projectId={project.id}
            milestones={project.milestones}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Nhật ký cập nhật
        </h2>
        <div className="mt-4">
          <UpdateManager
            projectId={project.id}
            updates={project.updates}
            defaultAuthorName={profile.fullName ?? "DNK House"}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">Thành viên</h2>
        <div className="mt-4">
          <MemberList projectId={project.id} members={project.members} />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Bước 2: Build + typecheck + lint**

Chạy: `npm run build` → xanh (sinh type `PageProps<"/portal/admin/projects/[id]">`). `npx tsc --noEmit` → `tsc=0`. `npm run lint` → sạch.

- [ ] **Bước 3: Kiểm thử thủ công (dev + Supabase local, admin)**

- `/portal/admin/projects/<id A>` → thấy form sửa đổ sẵn giá trị, danh sách 4 mốc, 2 nhật ký, danh sách thành viên (khách A) + select thêm.
- Sửa tên dự án → "Đã lưu."; reload `/portal/admin` thấy tên mới.
- Thêm mốc / toggle done / ▲▼ / sửa tiêu đề inline / xoá mốc → cập nhật ngay.
- Đăng nhật ký (author điền sẵn tên admin) → xuất hiện đầu danh sách; sửa inline không đổi ngày; xoá.
- Gỡ thành viên → biến mất; select xuất hiện lại khách đó; thêm lại.
- `/portal/admin/projects/khong-phai-uuid` và `/portal/admin/projects/00000000-0000-0000-0000-000000000000` → trang "Không tìm thấy".
- Nút "Xoá dự án" → `confirm()` nêu số bản ghi con; đồng ý → về `/portal/admin`, dự án biến mất. (Test trên dự án tạo tạm, không xoá seed A/B; hoặc `npx supabase db reset` sau.)

- [ ] **Bước 4: Commit**

```bash
git add "src/app/portal/admin/projects/[id]/page.tsx"
git commit -m "feat(portal): trang chi tiết dự án /portal/admin/projects/[id]"
```

---

## Task 18: Trang duyệt khách `/portal/admin/pending/[profileId]`

**Files:**
- Tạo mới: `src/app/portal/admin/pending/[profileId]/page.tsx`

**Interfaces:**
- Consumes: `requireAdmin` (Task 1); `getPendingProfile`, `getAssignableProjects` (Task 5); `ApproveAssignForm` (Task 15); `AdminNav` (Task 10); `formatVnDate`; `Link`, `lucide-react`, `notFound`.
- Produces: default export page. `params` là `Promise<{ profileId: string }>`.

- [ ] **Bước 1: Viết `src/app/portal/admin/pending/[profileId]/page.tsx`**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/portal/session";
import {
  getAssignableProjects,
  getPendingProfile,
} from "@/lib/portal/admin-queries";
import { formatVnDate } from "@/lib/portal/format";
import { AdminNav } from "@/components/portal/admin/AdminNav";
import { ApproveAssignForm } from "@/components/portal/admin/ApproveAssignForm";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ApprovePendingPage({
  params,
}: PageProps<"/portal/admin/pending/[profileId]">) {
  await requireAdmin();
  const { profileId } = await params;
  if (!UUID_RE.test(profileId)) notFound();

  const [profile, projects] = await Promise.all([
    getPendingProfile(profileId),
    getAssignableProjects(),
  ]);
  if (!profile) notFound();

  return (
    <div>
      <AdminNav />
      <Link
        href="/portal/admin"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Trang quản trị
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Duyệt khách
      </h1>
      <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-foreground">{profile.email}</p>
        <p className="mt-1 text-xs text-muted">
          {profile.fullName ?? "—"} · Đăng ký {formatVnDate(profile.createdAt)}
        </p>
        <div className="mt-6">
          <ApproveAssignForm profileId={profile.id} projects={projects} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Bước 2: Build + typecheck + lint**

Chạy: `npm run build` → xanh. `npx tsc --noEmit` → `tsc=0`. `npm run lint` → sạch.

- [ ] **Bước 3: Kiểm thử thủ công (dev + Supabase local, admin)**

- `/portal/admin/pending/<id pending>` → thấy email + checkbox list dự án.
- Chọn 1 dự án → "Duyệt khách" → về `/portal/admin`; khách chuyển sang khu "Khách đã duyệt" kèm chip dự án.
- Mở lại `/portal/admin/pending/<id vừa duyệt>` → "Không tìm thấy dự án" (không còn `role='pending'`).
- `npx supabase db reset` khôi phục seed.

- [ ] **Bước 4: Commit**

```bash
git add "src/app/portal/admin/pending/[profileId]/page.tsx"
git commit -m "feat(portal): trang duyệt & gán khách /portal/admin/pending/[profileId]"
```

---

## Task 19: Integration RLS — non-admin bị chặn, admin ghi được

**Files:**
- Tạo mới: `tests/integration/admin-rls.test.ts`

**Interfaces:**
- Consumes: `IDS`, `serviceClient`, `signInAs` từ `tests/helpers/supabase.ts` (đã có).
- Produces: bộ test khẳng định RLS là phòng thủ lớp cuối (spec §3.3, §9.2).

- [ ] **Bước 1: Viết `tests/integration/admin-rls.test.ts`**

```ts
import { afterAll, describe, expect, it } from "vitest";
import { IDS, serviceClient, signInAs } from "../helpers/supabase";

describe("RLS Giai đoạn 2 — chỉ admin ghi được bảng nghiệp vụ", () => {
  const createdProjectIds: string[] = [];

  afterAll(async () => {
    const svc = serviceClient();
    for (const id of createdProjectIds) {
      await svc.from("projects").delete().eq("id", id);
    }
    // Khôi phục role user pending nếu test đổi nhầm.
    await svc.from("profiles").update({ role: "pending" }).eq("id", IDS.pending);
  });

  it("token client: INSERT/UPDATE/DELETE projects đều bị từ chối", async () => {
    const a = await signInAs("clientA");
    const ins = await a
      .from("projects")
      .insert({ name: "x", status_label: "y" })
      .select("id");
    expect(ins.error).not.toBeNull();

    await a.from("projects").update({ name: "đổi" }).eq("id", IDS.projectA);
    const svc = serviceClient();
    const check = await svc
      .from("projects")
      .select("name")
      .eq("id", IDS.projectA)
      .single();
    expect(check.data?.name).not.toBe("đổi");
  });

  it("token client: INSERT milestones / updates bị từ chối", async () => {
    const a = await signInAs("clientA");
    const m = await a
      .from("milestones")
      .insert({ project_id: IDS.projectA, title: "hack", position: 99 });
    expect(m.error).not.toBeNull();
    const u = await a
      .from("updates")
      .insert({ project_id: IDS.projectA, body: "hack", author_name: "h" });
    expect(u.error).not.toBeNull();
  });

  it("token client: INSERT/DELETE project_members bị từ chối", async () => {
    const a = await signInAs("clientA");
    const ins = await a
      .from("project_members")
      .insert({ project_id: IDS.projectB, profile_id: IDS.clientA });
    expect(ins.error).not.toBeNull();
  });

  it("token client: nâng role người khác pending -> client bị từ chối", async () => {
    const a = await signInAs("clientA");
    await a.from("profiles").update({ role: "client" }).eq("id", IDS.pending);
    const svc = serviceClient();
    const { data } = await svc
      .from("profiles")
      .select("role")
      .eq("id", IDS.pending)
      .single();
    expect(data?.role).toBe("pending");
  });

  it("token admin: INSERT project + milestone + update + member, và đổi role pending->client", async () => {
    const admin = await signInAs("admin");

    const proj = await admin
      .from("projects")
      .insert({ name: "GĐ2 admin test", status_label: "Nháp" })
      .select("id")
      .single();
    expect(proj.error).toBeNull();
    createdProjectIds.push(proj.data!.id);
    const pid = proj.data!.id;

    const ms = await admin
      .from("milestones")
      .insert({ project_id: pid, title: "Mốc 1", position: 0 });
    expect(ms.error).toBeNull();

    const up = await admin
      .from("updates")
      .insert({ project_id: pid, body: "Khởi động", author_name: "DNK House" });
    expect(up.error).toBeNull();

    const role = await admin
      .from("profiles")
      .update({ role: "client" })
      .eq("id", IDS.pending)
      .eq("role", "pending");
    expect(role.error).toBeNull();

    const mem = await admin
      .from("project_members")
      .insert({ project_id: pid, profile_id: IDS.pending });
    expect(mem.error).toBeNull();

    const del = await admin
      .from("project_members")
      .delete()
      .eq("project_id", pid)
      .eq("profile_id", IDS.pending);
    expect(del.error).toBeNull();
  });
});
```

- [ ] **Bước 2: Chạy — kỳ vọng PASS (cần Supabase local)**

Yêu cầu: `npx supabase start` + `npx supabase db reset`.
Chạy: `npm run test -- admin-rls`
Kỳ vọng: 5 case PASS. `afterAll` dọn dự án tạo tạm + khôi phục role pending.

- [ ] **Bước 3: Commit**

```bash
git add tests/integration/admin-rls.test.ts
git commit -m "test(portal): integration RLS — non-admin bị chặn ghi, admin ghi được (GĐ2)"
```

---

## Task 20: E2E `admin.spec.ts`

**Files:**
- Chỉnh sửa: `tests/e2e/helpers.ts` (thêm `EMAILS.admin`)
- Tạo mới: `tests/e2e/admin.spec.ts`

**Interfaces:**
- Consumes: `loginAs`, `EMAILS`, `PROJECT_IDS` (`tests/e2e/helpers.ts`); `@playwright/test`.
- Produces: 3 kịch bản E2E (spec §9.3). `loginAs` sau `test-login` luôn kết thúc ở `/portal` (route test-login hardcode redirect `/portal`, không qua `/auth/callback`) — kịch bản admin điều hướng tiếp bằng `page.goto("/portal/admin")`.

- [ ] **Bước 1: Thêm `admin` vào `EMAILS` trong `tests/e2e/helpers.ts`**

```ts
export const EMAILS = {
  admin: "admin@dnkhouse.test",
  clientA: "client-a@dnkhouse.test",
  clientB: "client-b@dnkhouse.test",
  clientC: "client-c@dnkhouse.test",
  pending: "pending@dnkhouse.test",
} as const;
```

- [ ] **Bước 2: Viết `tests/e2e/admin.spec.ts`**

```ts
import { expect, test } from "@playwright/test";
import { EMAILS, loginAs } from "./helpers";

test.describe("Khu quản trị /portal/admin (Giai đoạn 2)", () => {
  test("vòng đời dự án: tạo -> mốc -> đổi thứ tự -> đánh dấu xong -> sửa tiêu đề -> đăng nhật ký", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.admin);
    await page.goto("/portal/admin");

    await page.getByRole("link", { name: "Tạo dự án" }).click();
    await expect(page).toHaveURL(/\/portal\/admin\/projects\/new$/);

    const stamp = Date.now();
    const projectName = `E2E Dự án ${stamp}`;
    await page.getByLabel("Tên dự án").fill(projectName);
    await page.getByLabel(/Trạng thái/).fill("Đang triển khai");
    await page.getByRole("button", { name: "Tạo dự án" }).click();

    await expect(page).toHaveURL(
      /\/portal\/admin\/projects\/[0-9a-f-]{36}$/,
    );
    await expect(
      page.getByRole("heading", { level: 1, name: projectName }),
    ).toBeVisible();

    // Thêm 2 mốc.
    const addMilestone = page.getByPlaceholder("Tên mốc mới");
    await addMilestone.fill("Mốc Alpha");
    await page.getByRole("button", { name: "Thêm mốc" }).click();
    await expect(page.getByText("Mốc Alpha")).toBeVisible();
    await addMilestone.fill("Mốc Beta");
    await page.getByRole("button", { name: "Thêm mốc" }).click();
    await expect(page.getByText("Mốc Beta")).toBeVisible();

    const milestones = page.locator("ol > li").filter({ hasText: /Mốc / });
    await expect(milestones.nth(0)).toContainText("Mốc Alpha");

    // Đưa dòng 1 xuống dưới.
    await milestones
      .nth(0)
      .getByRole("button", { name: "Đưa xuống dưới" })
      .click();
    await expect(
      page.locator("ol > li").filter({ hasText: /Mốc / }).nth(0),
    ).toContainText("Mốc Beta");

    // Đánh dấu 1 mốc xong.
    await page
      .locator("ol > li")
      .filter({ hasText: "Mốc Beta" })
      .getByRole("button", { name: "Đánh dấu hoàn thành" })
      .click();
    await expect(
      page.locator("ol > li").filter({ hasText: "Mốc Beta" }),
    ).toContainText("Hoàn thành ngày");

    // Sửa tiêu đề mốc inline.
    await page.getByText("Mốc Alpha").click();
    const editInput = page.getByRole("textbox").filter({ hasText: "" }).last();
    await editInput.fill("Mốc Alpha (đã sửa)");
    await page.getByRole("button", { name: "Lưu" }).first().click();
    await expect(page.getByText("Mốc Alpha (đã sửa)")).toBeVisible();

    // Đăng 1 nhật ký.
    await page.getByLabel("Nội dung cập nhật").fill("Cập nhật E2E đầu tiên.");
    await page.getByRole("button", { name: "Đăng" }).click();
    await expect(page.getByText("Cập nhật E2E đầu tiên.")).toBeVisible();
  });

  test("duyệt & gán khách -> khách thấy dự án", async ({ page }) => {
    // Admin tạo 1 dự án riêng cho kịch bản này.
    await loginAs(page, EMAILS.admin);
    await page.goto("/portal/admin/projects/new");
    const projectName = `E2E Gán ${Date.now()}`;
    await page.getByLabel("Tên dự án").fill(projectName);
    await page.getByLabel(/Trạng thái/).fill("Khảo sát");
    await page.getByRole("button", { name: "Tạo dự án" }).click();
    await expect(page).toHaveURL(/\/portal\/admin\/projects\/[0-9a-f-]{36}$/);

    // Duyệt khách pending, gán vào dự án vừa tạo.
    await page.goto("/portal/admin");
    await page
      .getByRole("link", { name: "Duyệt & gán dự án" })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Duyệt khách" }),
    ).toBeVisible();
    await page.getByRole("checkbox", { name: projectName }).check();
    await page.getByRole("button", { name: "Duyệt khách" }).click();
    await expect(page).toHaveURL(/\/portal\/admin$/);

    // Đăng nhập lại bằng chính khách đó.
    await loginAs(page, EMAILS.pending);
    await expect(
      page.getByRole("heading", { name: projectName }),
    ).toBeVisible();
    await page.getByRole("link", { name: new RegExp(projectName) }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: projectName }),
    ).toBeVisible();
  });

  test("non-admin mở /portal/admin -> bị đẩy về /portal", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    await page.goto("/portal/admin");
    await expect(page).toHaveURL(/\/portal$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /^Dự án của/ }),
    ).toBeVisible();
  });
});
```

> **Ghi chú test:** kịch bản 2 dùng user `pending@dnkhouse.test` và **đổi role** của họ thành `client` — E2E chạy `fullyParallel: false, workers: 1` trên DB local dùng lại (`reuseExistingServer`), nên chạy `npx supabase db reset` trước mỗi lần `npm run test:e2e` (đã là quy ước từ Slice 2–4). Sau kịch bản 2, user `pending` không còn ở khu "chờ duyệt" — kịch bản 1 và 3 không phụ thuộc điều đó. Nếu về sau thêm test cần lại persona `pending`, seed thêm persona `pending-2` thay vì tái dùng.

- [ ] **Bước 3: Chạy E2E đầy đủ (cần Supabase local + reset)**

```bash
npx supabase db reset
npm run test:e2e
```

Kỳ vọng: `auth` + `dashboard` + `project-detail` + `admin` toàn bộ PASS. Nếu selector `getByRole`/`getByLabel` không khớp do khác biệt markup, chỉnh selector (ưu tiên `getByRole` với `level`/name neo chặt — bài học Slice 3), **không** nới lỏng assertion.

- [ ] **Bước 4: Commit**

```bash
git add tests/e2e/helpers.ts tests/e2e/admin.spec.ts
git commit -m "test(portal): E2E khu quản trị — vòng đời dự án, duyệt & gán, chặn non-admin"
```

---

## Task 21: Cập nhật tài liệu + seed + xác minh hoàn thành

**Files:**
- Kiểm tra: `supabase/seed.sql` (≥1 admin + ≥1 pending + ≥1 client — hiện đã đủ; chỉ sửa nếu thiếu)
- Chỉnh sửa: `.claude/rules/portal-architecture.md`
- Chỉnh sửa: `.claude/rules/project-status.md`
- Chỉnh sửa: `CLAUDE.md`

- [ ] **Bước 1: Xác nhận seed đủ persona**

Đọc `supabase/seed.sql`: có `admin@dnkhouse.test` (role `admin`), `pending@dnkhouse.test` (role `pending`), `client-a/b/c` (role `client`). **Đủ — không sửa.** Nếu thiếu bất kỳ role nào, bổ sung theo đúng khuôn user hiện có (auth.users + auth.identities + `update public.profiles set role=...`).

- [ ] **Bước 2: Sửa `.claude/rules/portal-architecture.md`**

Thay mục "Nhập liệu (Giai đoạn 1)" bằng:

```md
- **Nhập liệu (Giai đoạn 2):** dự án / mốc / nhật ký / duyệt khách / gán thành viên
  đều làm trong khu quản trị `/portal/admin` (`role = 'admin'`). Bảo vệ bằng
  `requireAdmin()` (DAL `session.ts`) ở đầu mỗi page `/portal/admin/**` và đầu mỗi
  Server Action trong `src/lib/portal/admin-actions.ts` — RLS `is_admin()` là lớp
  cuối. Đọc: `src/lib/portal/admin-queries.ts`. Studio chỉ còn dùng cho thao tác
  hiếm: hạ role, xoá hẳn `profiles`.
```

Bổ sung route vào danh sách `- **Route:**`:

```md
  - `/portal/admin` — khu quản trị (chỉ `admin`): CRUD dự án/mốc/nhật ký, duyệt
    khách `pending → client`, gán/gỡ `project_members`. `/auth/callback` redirect
    admin thẳng vào đây.
```

- [ ] **Bước 3: Sửa `.claude/rules/project-status.md`**

- Bảng "Trạng thái từng phần": đổi dòng "Giai đoạn 2 (`/portal/admin`)" từ `⬜ Chưa bắt đầu` → `✅ Xong` kèm ghi chú ngắn (số task, kết quả test).
- Thêm một mục nhật ký phiên ngắn: đã triển khai khu admin theo plan `docs/superpowers/plans/2026-09-08-portal-giai-doan-2-admin.md`; không migration mới; `requireAdmin` + `postLoginPath` vào DAL; `/auth/callback` redirect theo role; token `--danger`/`--success` thêm vào `globals.css`.
- Mục "Bước tiếp theo": bỏ mục 6 (viết spec GĐ2) — đã xong; mục 5 (nhập dữ liệu thật) đổi thành "làm qua `/portal/admin`, không cần Studio".
- Mục "Quyết định quan trọng": thêm gạch đầu dòng — "Khu admin không thêm lớp `NODE_ENV`/proxy check: `requireAdmin()` (DAL) + RLS `is_admin()` là đủ 2 lớp; proxy chỉ biết cookie, không biết role (giữ nguyên spec §3.2)."; "Hàm thuần `reorderMilestones` / `admin-validation` tách khỏi `admin-actions.ts` vì file `\"use server\"` chỉ được export async."

- [ ] **Bước 4: Sửa `CLAUDE.md` (mục Portal, nếu có mô tả luồng nhập liệu)**

Tìm mô tả "nhập tay qua Studio" / "Giai đoạn 2" trong `CLAUDE.md`; cập nhật: client portal nhập liệu qua `/portal/admin` (`role='admin'`), Giai đoạn 2 đã hoàn tất. Nếu `CLAUDE.md` chỉ trỏ sang `.claude/rules/*` mà không lặp nội dung → **không sửa** (surgical: rule file đã đủ).

- [ ] **Bước 5: Xác minh hoàn thành toàn kế hoạch**

```bash
npx supabase db reset
npm run test          # unit + integration RLS
npm run test:e2e      # auth + dashboard + project-detail + admin
npx tsc --noEmit
npm run lint
npm run build
```

Kỳ vọng — tất cả xanh:
- `npm run test`: unit cũ (25) + `require-admin` (8) + `admin-validation` + `milestone-order` (6) + integration RLS cũ + `admin-rls` (5).
- `npm run test:e2e`: 4 file spec PASS.
- `tsc=0`, `lint` sạch, `build` xanh.

Kiểm thủ công lần cuối (spec §11):
- Non-admin mở `/portal/admin*` → về `/portal`. Chưa đăng nhập mở `/portal/admin` → về `/login` (proxy).
- Responsive `/portal/admin` + `/portal/admin/projects/[id]` ở 375 / 768 / 1440 (dùng skill/agent trình duyệt, chụp 3 breakpoint — theo `.claude/rules/mandatory-ui-checks.md`).
- Không còn thao tác vận hành nào bắt buộc mở Supabase Studio (trừ hạ role / xoá `profiles`).

- [ ] **Bước 6: Commit**

```bash
git add .claude/rules/portal-architecture.md .claude/rules/project-status.md CLAUDE.md supabase/seed.sql
git commit -m "docs(portal): Giai đoạn 2 hoàn tất — cập nhật rule/status, luồng nhập liệu qua /portal/admin"
```

- [ ] **Bước 7: Kết thúc nhánh**

Dùng skill `superpowers:finishing-a-development-branch` để quyết định merge / giữ nhánh (theo quy ước Giai đoạn 1: merge `main` rồi push `origin/main` — xác nhận với người dùng trước).

---

## Tự Kiểm Tra Kế Hoạch (đã chạy khi soạn)

**1. Bao phủ Spec:**

| Mục spec | Task |
|---|---|
| §3.1 `requireAdmin` + `resolveAdminAccess` | Task 1 |
| §3.2 proxy không đổi / §3.3 RLS không đổi | Không có task (khẳng định trong Global Constraints + Task 19 test) |
| §4.1 4 route mới | Task 11, 16, 17, 18 |
| §4.2 `/auth/callback` redirect theo role | Task 2 |
| §4.2 link "Xem giao diện khách" / "Xem như khách" | Task 10 (`AdminNav`), 16, 17 |
| §5.1 trang chủ 3 khu | Task 16 |
| §5.2 `new` + `ProjectForm` | Task 11 |
| §5.3 trang dự án: sửa + xoá + mốc + nhật ký + thành viên | Task 12, 13, 14, 17 |
| §5.4 duyệt & gán | Task 15, 18 |
| §6.1 `admin-queries.ts` (6 hàm + `getPendingProfile`) | Task 5 |
| §6.2 `admin-actions.ts` (2 nhóm action) + `revalidatePath` | Task 6, 7, 8, 9 |
| §6.2 `reorderMilestone` (hàm thuần test riêng) | Task 4 + Task 7 |
| §6.3 `admin-validation.ts` | Task 3 |
| §6.4 xử lý lỗi (validation state / throw → error.tsx / notFound) | Task 6–9 (throw), Task 17–18 (`notFound`) |
| §8 components (7 cái) | Task 10–15 |
| §9.1 unit (3 file) | Task 1, 3, 4 |
| §9.2 integration RLS | Task 19 |
| §9.3 E2E (3 kịch bản) | Task 20 |
| §9.4 seed | Task 21 |
| §10 danh sách file | Khớp, trừ 2 bổ sung có chủ đích (dưới) |
| §11 xác minh hoàn thành | Task 21 Bước 5 |

**Bổ sung ngoài §10 (có lý do):**
- `src/lib/portal/milestone-order.ts` — hàm thuần `reorderMilestones` **không** đặt được trong `admin-actions.ts` (`"use server"` chỉ export async). Spec §6.2/§9.1 yêu cầu "hàm thuần test riêng" nhưng không đặt tên file → tách file là cách hợp lệ duy nhất.
- `src/app/globals.css` + token `--danger`/`--danger-foreground`/`--success` — spec yêu cầu "style theo token, không hardcode hex" nhưng chưa có token trạng thái; thêm là hệ quả bắt buộc. Không đụng token màu hiện có.
- `postLoginPath` trong `session.ts` — tách nhánh redirect của §4.2 thành hàm thuần để test được (Task 1); nhất quán với `roleToScreen` sẵn có.

**2. Rà soát Placeholder:** không còn "TBD/TODO/tương tự Task N"; mọi bước viết code có block code đầy đủ; mọi test có assertion cụ thể.

**3. Nhất quán Type:** `ActionState`/`initialActionState` (Task 6) dùng xuyên Task 7–15. `AdminMilestone`/`AdminUpdate`/`AdminMember`/`AdminProjectDetail` (Task 5) dùng ở Task 12–14, 17. `MilestoneOrder` (Task 4) khớp `select("id, position")` ở `reorderMilestone` (Task 7). `Validated<T>` (Task 3) khớp cách đọc `.ok`/`.fieldErrors`/`.value` ở Task 6–9. `postLoginPath(role: Role | null)` (Task 1) khớp cách gọi ở Task 2. Tên action ở "Bản đồ interface dùng chung" khớp import ở mọi component.

---

## Bàn Giao Thực Thi

Kế hoạch đã hoàn tất và được lưu tại `docs/superpowers/plans/2026-09-08-portal-giai-doan-2-admin.md`. Có hai lựa chọn thực thi:

1. **Điều phối Subagent (Khuyến nghị)** — điều phối một subagent mới cho mỗi task, review 2 giai đoạn (tuân thủ spec + chất lượng) giữa các task, review tổng thể cuối. Đúng quy trình đã dùng cho Giai đoạn 1. **SUB-SKILL BẮT BUỘC:** `superpowers:subagent-driven-development`.
2. **Thực thi Trực tiếp (Inline)** — thực thi các task ngay trong session này, chạy theo đợt kèm điểm kiểm tra review. **SUB-SKILL BẮT BUỘC:** `superpowers:executing-plans`.

Bạn chọn phương án nào?
