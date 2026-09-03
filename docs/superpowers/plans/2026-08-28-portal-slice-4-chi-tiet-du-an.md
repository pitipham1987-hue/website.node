# Kế Hoạch Triển Khai — Slice 4: Chi tiết dự án (milestone + nhật ký cập nhật)

> **Dành cho agent thực thi:** SUB-SKILL BẮT BUỘC: Sử dụng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans để triển khai kế hoạch này theo từng nhiệm vụ. Các bước sử dụng cú pháp ô tích (`- [ ]`) để theo dõi.

**Mục tiêu:** Khách hàng đã duyệt mở một dự án của mình tại `/portal/[projectId]` thấy tên dự án, badge `status_label`, `summary`, checklist mốc triển khai (đúng thứ tự `position`, đánh dấu hoàn thành + ngày), và nhật ký cập nhật (mới nhất trên đầu). Mở dự án không thuộc quyền hoặc không tồn tại → trang "Không tìm thấy dự án" (không lộ dự án có tồn tại hay không). Kết thúc slice = kết thúc Giai đoạn 1.

**Kiến trúc:** `src/app/portal/[projectId]/page.tsx` (Server Component) gọi `requireProjectAccess(projectId)` (bổ sung vào DAL `session.ts`) — hàm này gọi `requireClient()` (Slice 2), rồi truy vấn 1 dòng `projects` qua Supabase client server; RLS (Slice 1) tự lọc — không có kết quả (không quyền / không tồn tại / id sai định dạng) → `notFound()`. Sau đó `getProjectDetail(project.id)` (bổ sung vào `queries.ts`, Slice 3) lấy `milestones` (sắp `position` asc) + `updates` (sắp `created_at` desc). Render qua 2 Server Component thuần trình bày `MilestoneList` / `UpdatesFeed`. Thêm `portal/not-found.tsx` (thông điệp tiếng Việt) và `portal/error.tsx` (`"use client"`, bắt lỗi truy vấn bất ngờ, nút thử lại). Định dạng ngày tách vào hàm thuần `formatVnDate` để test không cần DOM/DB.

**Công nghệ sử dụng (Tech Stack):**
- Next.js **16.3.1** App Router: dynamic segment `[projectId]` (`params` là **Promise**), `PageProps<"/portal/[projectId]">` (typed routes, global helper), `not-found.tsx` + `notFound()` từ `next/navigation`, `error.tsx` với prop **`retry`** (ổn định từ Next 16.3.0).
- `@supabase/ssr` server client (Slice 1) qua `@/lib/supabase/server`; DAL `session.ts` + `queries.ts` (Slice 2–3).
- `lucide-react` (đã có) cho icon check / mũi tên.
- `vitest` (unit thuần), `@playwright/test` (E2E) — đã cài từ Slice 1–2.
- `Intl.DateTimeFormat` locale `vi-VN`, `timeZone: "Asia/Ho_Chi_Minh"` (Node 20 full-ICU) cho định dạng ngày.

## Hạn Chế Toàn Cục (Global Constraints)

- Next.js **16.3.1** chính xác — KHÔNG nâng/hạ. Đọc `node_modules/next/dist/docs/01-app/...` trước khi dùng API mới. `params` của page là **Promise** — phải `await`. `cookies()` async (đã bọc trong `@/lib/supabase/server`).
- `next.config.ts` rỗng → `typedRoutes` mặc định bật ở Next 16 cho `PageProps`/`Link`. `Link href` là string thường (không cần cast). Nếu `PageProps<"/portal/[projectId]">` chưa có type khi chạy `tsc` lần đầu → chạy `npm run build` (hoặc `npx next typegen`) một lần để sinh `.next/types`, rồi `tsc` lại.
- **KHÔNG đặt auth check trong `layout.tsx`** (layout không re-render khi điều hướng client-side). `page.tsx` tự gọi `requireProjectAccess()`.
- `notFound()` render `not-found` boundary, **KHÔNG** đi vào `error.tsx`. `error.tsx` chỉ cho lỗi truy vấn/render bất ngờ. Đừng bọc `notFound()` trong `try/catch`.
- Style đồng bộ site: token Tailwind `bg-background` / `bg-surface` / `text-foreground` / `text-muted` / `border-border` / `bg-accent` / `text-accent-foreground` (khai báo ở `src/app/globals.css`). Card `rounded-2xl`, badge / nút pill `rounded-full`. **KHÔNG hardcode hex** trong component.
- Toàn bộ chữ portal tiếng Việt có dấu đầy đủ. Không i18n.
- Landing `/` + `src/app/page.tsx` + `src/app/layout.tsx` (root) **không đổi**. Chỉ thêm file trong `src/app/portal/*`, `src/components/portal/*`, `src/lib/portal/*`.
- Truy vấn dữ liệu **server-only**. Không gọi Supabase từ Client Component trong slice này (`error.tsx` là client nhưng chỉ hiển thị, không truy vấn).
- Portal là khu vực ứng dụng nội bộ — **KHÔNG** áp `ScrollReveal` / animation scroll của landing (quy tắc scroll-reveal chỉ ràng buộc section marketing). Giữ portal tĩnh, gọn.
- Mobile-friendly: `/portal/[projectId]` đúng ở 375 / 768 / 1440.
- Mỗi nhiệm vụ: `git commit`. Cuối slice: `npm run build` + `npx tsc --noEmit` + `npm run lint` sạch; `npm run test` + `npm run test:e2e` (`auth` + `dashboard` + `project-detail`) xanh.
- Spec slice: `docs/superpowers/specs/2026-08-28-portal-slice-4-chi-tiet-du-an-design.md`. Design doc gốc: `.../2026-08-28-portal-dang-nhap-google-design.md` (mục 4.1, 4.5, 5.3).
- Prereq: Slice 1–3 đã xong (`requireClient`, `getProjectsForUser` + `ProjectListItem`, `/portal` danh sách card link tới `/portal/[id]`, seed 2 dự án A/B, `tests/e2e/helpers.ts` với `loginAs` + `EMAILS.clientA/clientB/pending`, `playwright.config.ts`, Supabase local chạy được).

---

## Cấu Trúc File

**Tạo mới:**
| File | Trách nhiệm |
|------|-------------|
| `src/lib/portal/format.ts` | Hàm thuần `formatVnDate(iso)` → `"dd/mm/yyyy"` theo giờ VN; input rỗng/không hợp lệ → `""` |
| `src/components/portal/MilestoneList.tsx` | Server Component thuần trình bày: `<ol>` mốc, icon done/chưa + `title` + ngày hoàn thành nếu có; rỗng → câu thông báo |
| `src/components/portal/UpdatesFeed.tsx` | Server Component thuần trình bày: `<ol>` cập nhật (ngày · tác giả + `body` giữ xuống dòng); rỗng → "Chưa có cập nhật nào." |
| `src/app/portal/[projectId]/page.tsx` | Server Component: `requireProjectAccess` → `getProjectDetail` → render tiêu đề + `MilestoneList` + `UpdatesFeed` + link quay lại `/portal` |
| `src/app/portal/not-found.tsx` | Server Component: thông điệp "Không tìm thấy dự án" tiếng Việt + nút về `/portal`. Render trong `portal/layout.tsx` |
| `src/app/portal/error.tsx` | `"use client"`: bắt lỗi truy vấn bất ngờ trong `/portal*`, thông báo chung + nút "Thử lại" (`retry()`) |
| `tests/unit/format.test.ts` | Vitest: `formatVnDate` — ngày thường, lệch múi giờ qua ngày, chuỗi rỗng, chuỗi rác |
| `tests/e2e/project-detail.spec.ts` | Playwright: khách xem dự án mình (mốc đúng thứ tự + nhật ký mới nhất trên đầu); sửa URL sang dự án khác → "Không tìm thấy"; id không tồn tại / id sai định dạng → "Không tìm thấy" |

**Chỉnh sửa:**
| File | Thay đổi |
|------|----------|
| `src/lib/portal/session.ts` | Thêm `ProjectSummary`, `ProjectAccess`, `resolveProjectAccess` (thuần), `requireProjectAccess` (async); đổi import `next/navigation` để có `notFound` |
| `src/lib/portal/queries.ts` | Thêm `Milestone`, `ProjectUpdate`, `ProjectDetail`, `getProjectDetail(projectId)` |
| `tests/unit/session.test.ts` | Thêm `describe("resolveProjectAccess")` (3 case) |
| `tests/e2e/helpers.ts` | Thêm hằng `PROJECT_IDS` (`projectA`, `projectB`) khớp `supabase/seed.sql` |
| `supabase/seed.sql` | Thêm 1 câu `update` điền `done_at` cho mốc `done` (trigger chỉ chạy before-update nên seed insert không set) |
| `CLAUDE.md` | Thêm mục `## Portal (client portal)` (tóm tắt route + 3 lớp bảo vệ + nhập liệu Giai đoạn 1) |

---

## Task 1: Hàm thuần `formatVnDate`

**Files:**
- Tạo mới: `src/lib/portal/format.ts`
- Tạo mới: `tests/unit/format.test.ts`

**Interfaces:**
- Cung cấp: `formatVnDate(iso: string): string` — nhận ISO timestamp (Supabase `timestamptz`), trả `"dd/mm/yyyy"` theo múi giờ `Asia/Ho_Chi_Minh`. Chuỗi rỗng hoặc không parse được → `""`.

- [ ] **Bước 1: Viết test thất bại — `tests/unit/format.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { formatVnDate } from "@/lib/portal/format";

describe("formatVnDate", () => {
  it("ISO ban ngày UTC -> dd/mm/yyyy", () => {
    expect(formatVnDate("2026-08-20T03:00:00Z")).toBe("20/08/2026");
  });

  it("ISO tối muộn UTC -> cộng 7h sang ngày hôm sau theo giờ VN", () => {
    // 2026-08-21T18:30:00Z + 7h = 2026-08-22T01:30 giờ VN
    expect(formatVnDate("2026-08-21T18:30:00Z")).toBe("22/08/2026");
  });

  it("có phần offset sẵn trong chuỗi vẫn quy về giờ VN", () => {
    expect(formatVnDate("2026-01-05T23:00:00+00:00")).toBe("06/01/2026");
  });

  it("chuỗi rỗng -> ''", () => {
    expect(formatVnDate("")).toBe("");
  });

  it("chuỗi rác -> ''", () => {
    expect(formatVnDate("không-phải-ngày")).toBe("");
  });
});
```

- [ ] **Bước 2: Chạy test — kỳ vọng THẤT BẠI**

```bash
npm run test -- format
```

Kỳ vọng: FAIL — `Cannot find module '@/lib/portal/format'`.

- [ ] **Bước 3: Viết `src/lib/portal/format.ts`**

```ts
/**
 * Định dạng ngày cho portal khách hàng: "dd/mm/yyyy" theo múi giờ Việt Nam.
 * Nhận ISO string (Supabase timestamptz). Không parse được -> chuỗi rỗng
 * (component tự bỏ qua, không render nhãn ngày).
 */
const vnDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function formatVnDate(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return vnDateFormatter.format(date);
}
```

- [ ] **Bước 4: Chạy test — kỳ vọng PASS**

```bash
npm run test -- format
npx tsc --noEmit; echo "tsc=$?"
```

Kỳ vọng: 5 case xanh; `tsc=0`. Nếu locale `vi-VN` cho ra định dạng khác (`20/08/2026` vs `20/8/2026`) — Node 20 full-ICU trả `dd/mm/yyyy` với `2-digit`. Nếu môi trường thiếu ICU (hiếm), thay bằng ghép tay: lấy `date` qua `new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" })` → `yyyy-mm-dd` rồi đảo thành `dd/mm/yyyy`.

- [ ] **Bước 5: Commit**

```bash
git add src/lib/portal/format.ts tests/unit/format.test.ts
git commit -m "feat(portal): formatVnDate — định dạng ngày dd/mm/yyyy theo giờ VN + test"
```

---

## Task 2: DAL `requireProjectAccess` + `resolveProjectAccess`

**Files:**
- Chỉnh sửa: `src/lib/portal/session.ts`
- Chỉnh sửa: `tests/unit/session.test.ts`

**Interfaces:**
- Consumes: `requireClient` (đã có trong file, Slice 2 — trả `{ status: "ok" | "pending"; profile: SessionProfile }`), `createClient` từ `@/lib/supabase/server` (đã import trong file), `notFound` từ `next/navigation`.
- Cung cấp (Task 5 dùng):
  - `interface ProjectSummary { id: string; name: string; statusLabel: string; summary: string | null }`
  - `type ProjectAccess = { status: "notFound" } | { status: "ok"; project: ProjectSummary }`
  - `resolveProjectAccess(clientStatus: "ok" | "pending", project: ProjectSummary | null): ProjectAccess` — thuần
  - `requireProjectAccess(projectId: string): Promise<ProjectSummary>` — `redirect("/login")` (qua `requireClient`) nếu chưa đăng nhập; `notFound()` nếu `pending`, id sai định dạng UUID, hoặc RLS không trả dòng nào

- [ ] **Bước 1: Thêm test thất bại vào `tests/unit/session.test.ts`**

Thêm import `resolveProjectAccess` vào dòng import sẵn có từ `@/lib/portal/session`, rồi thêm block:

```ts
import {
  resolveClientAccess,
  resolveProjectAccess,
  roleToScreen,
  type SessionProfile,
} from "@/lib/portal/session";

// ... (giữ nguyên các describe cũ) ...

describe("resolveProjectAccess", () => {
  const project = {
    id: "aaaaaaaa-0000-0000-0000-000000000001",
    name: "Dự án 1",
    statusLabel: "Đang triển khai",
    summary: null,
  };

  it("client pending -> notFound (kể cả khi có dữ liệu dự án)", () => {
    expect(resolveProjectAccess("pending", project)).toEqual({
      status: "notFound",
    });
  });

  it("client ok nhưng RLS không trả dòng nào -> notFound", () => {
    expect(resolveProjectAccess("ok", null)).toEqual({ status: "notFound" });
  });

  it("client ok + có dự án -> ok kèm project", () => {
    expect(resolveProjectAccess("ok", project)).toEqual({
      status: "ok",
      project,
    });
  });
});
```

- [ ] **Bước 2: Chạy test — kỳ vọng THẤT BẠI**

```bash
npm run test -- session
```

Kỳ vọng: FAIL — `resolveProjectAccess` không được export (`undefined is not a function` hoặc lỗi import).

- [ ] **Bước 3: Sửa `src/lib/portal/session.ts`**

Đổi dòng import `next/navigation` (Slice 2 chỉ import `redirect`) thành:

```ts
import { notFound, redirect } from "next/navigation";
```

Thêm vào cuối file:

```ts
export interface ProjectSummary {
  id: string;
  name: string;
  statusLabel: string;
  summary: string | null;
}

export type ProjectAccess =
  | { status: "notFound" }
  | { status: "ok"; project: ProjectSummary };

/**
 * Thuần — quyết định quyền xem chi tiết dự án.
 * pending, hoặc RLS không trả dòng nào (không quyền / không tồn tại) -> notFound.
 * Không phân biệt "không tồn tại" với "không có quyền" (tránh lộ sự tồn tại của dự án).
 */
export function resolveProjectAccess(
  clientStatus: "ok" | "pending",
  project: ProjectSummary | null,
): ProjectAccess {
  if (clientStatus === "pending" || !project) return { status: "notFound" };
  return { status: "ok", project };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Gọi ở đầu page /portal/[projectId]. redirect()/notFound() ném control-flow,
 * code phía sau không chạy khi bị chặn.
 */
export async function requireProjectAccess(
  projectId: string,
): Promise<ProjectSummary> {
  const access = await requireClient();

  // id không đúng dạng UUID -> notFound luôn, khỏi để Postgres ném lỗi 22P02 vào error.tsx.
  if (!UUID_RE.test(projectId)) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status_label, summary")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw error;

  const resolved = resolveProjectAccess(
    access.status,
    data
      ? {
          id: data.id,
          name: data.name,
          statusLabel: data.status_label,
          summary: data.summary,
        }
      : null,
  );
  if (resolved.status === "notFound") notFound();
  return resolved.project;
}
```

- [ ] **Bước 4: Chạy test — kỳ vọng PASS**

```bash
npm run test -- session
npx tsc --noEmit; echo "tsc=$?"
```

Kỳ vọng: các case cũ + 3 case `resolveProjectAccess` xanh; `tsc=0`. Nếu `tsc` báo `data.summary` là `string | null | undefined` không gán được vào `string | null` → thêm `?? null`: `summary: data.summary ?? null`. Nếu import `server-only` gây lỗi khi Vitest chạy — đã xử lý ở Slice 2 (mock `server-only` trong `vitest.config.ts` setupFiles); test này import cùng module như `resolveClientAccess` sẵn có nên không phát sinh vấn đề mới.

- [ ] **Bước 5: Commit**

```bash
git add src/lib/portal/session.ts tests/unit/session.test.ts
git commit -m "feat(portal): requireProjectAccess + resolveProjectAccess — notFound khi không quyền/không tồn tại"
```

---

## Task 3: Truy vấn `getProjectDetail`

**Files:**
- Chỉnh sửa: `src/lib/portal/queries.ts`

**Interfaces:**
- Consumes: `createClient` từ `@/lib/supabase/server` (đã import ở đầu file từ Slice 3).
- Cung cấp (Task 4–5 dùng):
  - `interface Milestone { id: string; title: string; done: boolean; doneAt: string | null }`
  - `interface ProjectUpdate { id: string; body: string; authorName: string; createdAt: string }`
  - `interface ProjectDetail { milestones: Milestone[]; updates: ProjectUpdate[] }`
  - `getProjectDetail(projectId: string): Promise<ProjectDetail>` — `milestones` sắp `position` asc, `updates` sắp `created_at` desc. RLS (Slice 1) đã lọc; hàm này giả định `projectId` đã qua `requireProjectAccess`.

- [ ] **Bước 1: Thêm vào cuối `src/lib/portal/queries.ts`**

```ts
export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  doneAt: string | null;
}

export interface ProjectUpdate {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export interface ProjectDetail {
  milestones: Milestone[];
  updates: ProjectUpdate[];
}

/**
 * Con của 1 dự án: mốc triển khai (thứ tự position tăng dần) + nhật ký cập nhật
 * (mới nhất trên đầu). Dự án cơ bản đã lấy ở requireProjectAccess — không truy vấn lại.
 */
export async function getProjectDetail(
  projectId: string,
): Promise<ProjectDetail> {
  const supabase = await createClient();

  const [milestonesRes, updatesRes] = await Promise.all([
    supabase
      .from("milestones")
      .select("id, title, done, done_at")
      .eq("project_id", projectId)
      .order("position", { ascending: true }),
    supabase
      .from("updates")
      .select("id, body, author_name, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
  ]);

  if (milestonesRes.error) throw milestonesRes.error;
  if (updatesRes.error) throw updatesRes.error;

  return {
    milestones: (milestonesRes.data ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      done: m.done,
      doneAt: m.done_at,
    })),
    updates: (updatesRes.data ?? []).map((u) => ({
      id: u.id,
      body: u.body,
      authorName: u.author_name,
      createdAt: u.created_at,
    })),
  };
}
```

- [ ] **Bước 2: Typecheck**

```bash
npx tsc --noEmit; echo "tsc=$?"
```

Kỳ vọng: `tsc=0`. Nếu shape từ `database.types.ts` (sinh ở Slice 1) khiến `m.done_at` là `string | null` — khớp `doneAt: string | null`. Nếu là `string | undefined` → `doneAt: m.done_at ?? null`.

- [ ] **Bước 3: Kiểm tra truy vấn thật bằng script tạm (Supabase local)**

```bash
npx supabase db reset
node --env-file=.env.local - <<'EOF'
import { createClient } from "@supabase/supabase-js";
const c = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);
await c.auth.signInWithPassword({
  email: "client-a@dnkhouse.test",
  password: "portal-dev-123",
});
const pid = "aaaaaaaa-0000-0000-0000-000000000001";
const ms = await c
  .from("milestones")
  .select("title, position, done, done_at")
  .eq("project_id", pid)
  .order("position", { ascending: true });
const up = await c
  .from("updates")
  .select("body, created_at")
  .eq("project_id", pid)
  .order("created_at", { ascending: false });
console.log("MILESTONES", JSON.stringify(ms.data, null, 2));
console.log("UPDATES", JSON.stringify(up.data, null, 2));
// Dự án B: phải rỗng vì RLS
const other = await c
  .from("milestones")
  .select("id")
  .eq("project_id", "bbbbbbbb-0000-0000-0000-000000000002");
console.log("OTHER (kỳ vọng []):", JSON.stringify(other.data));
EOF
```

Kỳ vọng: `MILESTONES` 4 phần tử theo `position` 0→3, hai phần tử đầu `done: true`; `UPDATES` 2 phần tử, phần tử đầu là "Bắt đầu tích hợp lên website, dự kiến 1 tuần." (mới hơn); `OTHER` là `[]`.

- [ ] **Bước 4: Commit**

```bash
git add src/lib/portal/queries.ts
git commit -m "feat(portal): getProjectDetail — milestones theo position + updates mới nhất trên đầu"
```

---

## Task 4: Component `MilestoneList` + `UpdatesFeed`

**Files:**
- Tạo mới: `src/components/portal/MilestoneList.tsx`
- Tạo mới: `src/components/portal/UpdatesFeed.tsx`

**Interfaces:**
- Consumes: `Milestone`, `ProjectUpdate` (`@/lib/portal/queries`), `formatVnDate` (`@/lib/portal/format`), `Check` từ `lucide-react`.
- Cung cấp: `<MilestoneList items={milestones} />`, `<UpdatesFeed items={updates} />` — Server Component thuần trình bày, không truy vấn.

- [ ] **Bước 1: Tạo `src/components/portal/MilestoneList.tsx`**

```tsx
import { Check } from "lucide-react";
import { formatVnDate } from "@/lib/portal/format";
import type { Milestone } from "@/lib/portal/queries";

export function MilestoneList({ items }: { items: Milestone[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        Chưa có mốc triển khai nào cho dự án này.
      </p>
    );
  }

  return (
    <ol aria-label="Các mốc triển khai" className="space-y-4">
      {items.map((milestone) => (
        <li key={milestone.id} className="flex items-start gap-3">
          <span
            aria-hidden
            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
              milestone.done
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background"
            }`}
          >
            {milestone.done && <Check className="size-3" />}
          </span>
          <div className="min-w-0">
            <p
              className={`text-sm ${
                milestone.done ? "text-foreground" : "text-muted"
              }`}
            >
              {milestone.title}
              <span className="sr-only">
                {" — "}
                {milestone.done ? "đã hoàn thành" : "chưa hoàn thành"}
              </span>
            </p>
            {milestone.done && milestone.doneAt && (
              <p className="mt-0.5 text-xs text-muted">
                Hoàn thành ngày {formatVnDate(milestone.doneAt)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Bước 2: Tạo `src/components/portal/UpdatesFeed.tsx`**

```tsx
import { formatVnDate } from "@/lib/portal/format";
import type { ProjectUpdate } from "@/lib/portal/queries";

export function UpdatesFeed({ items }: { items: ProjectUpdate[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Chưa có cập nhật nào.</p>;
  }

  return (
    <ol aria-label="Nhật ký cập nhật" className="space-y-4">
      {items.map((update) => (
        <li
          key={update.id}
          className="rounded-2xl border border-border bg-surface p-5"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <time dateTime={update.createdAt}>
              {formatVnDate(update.createdAt)}
            </time>
            <span aria-hidden>·</span>
            <span>{update.authorName}</span>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
            {update.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Bước 3: Typecheck + lint**

```bash
npx tsc --noEmit; echo "tsc=$?"
npm run lint
```

Kỳ vọng: sạch. `size-*` là utility Tailwind v4 hợp lệ. `whitespace-pre-line` giữ xuống dòng trong `body` plain text.

- [ ] **Bước 4: Commit**

```bash
git add src/components/portal/MilestoneList.tsx src/components/portal/UpdatesFeed.tsx
git commit -m "feat(portal): MilestoneList + UpdatesFeed — component trình bày mốc & nhật ký"
```

---

## Task 5: Trang chi tiết + `not-found.tsx` + `error.tsx`

**Files:**
- Tạo mới: `src/app/portal/[projectId]/page.tsx`
- Tạo mới: `src/app/portal/not-found.tsx`
- Tạo mới: `src/app/portal/error.tsx`

**Interfaces:**
- Consumes: `requireProjectAccess` (`@/lib/portal/session`, Task 2), `getProjectDetail` (`@/lib/portal/queries`, Task 3), `MilestoneList` / `UpdatesFeed` (Task 4), `ArrowLeft` từ `lucide-react`, `Link` từ `next/link`.
- Cung cấp: route `/portal/[projectId]` (GET); `not-found` boundary + `error` boundary cho toàn bộ `/portal*`.

- [ ] **Bước 1: Tạo `src/app/portal/[projectId]/page.tsx`**

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireProjectAccess } from "@/lib/portal/session";
import { getProjectDetail } from "@/lib/portal/queries";
import { MilestoneList } from "@/components/portal/MilestoneList";
import { UpdatesFeed } from "@/components/portal/UpdatesFeed";

export default async function ProjectDetailPage({
  params,
}: PageProps<"/portal/[projectId]">) {
  const { projectId } = await params;
  const project = await requireProjectAccess(projectId);
  const { milestones, updates } = await getProjectDetail(project.id);

  return (
    <div>
      <Link
        href="/portal"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tất cả dự án
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-foreground">
          {project.name}
        </h1>
        <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          {project.statusLabel}
        </span>
      </div>

      {project.summary && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {project.summary}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Các mốc triển khai
        </h2>
        <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
          <MilestoneList items={milestones} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-foreground">
          Nhật ký cập nhật
        </h2>
        <div className="mt-4">
          <UpdatesFeed items={updates} />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Bước 2: Tạo `src/app/portal/not-found.tsx`**

```tsx
import Link from "next/link";

export default function PortalNotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Không tìm thấy dự án
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Dự án bạn tìm không tồn tại, hoặc không thuộc quyền truy cập của tài khoản
        này. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ người phụ trách dự
        án của bạn tại DNK House.
      </p>
      <Link
        href="/portal"
        className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Về danh sách dự án
      </Link>
    </div>
  );
}
```

- [ ] **Bước 3: Tạo `src/app/portal/error.tsx`**

```tsx
"use client";

export default function PortalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Đã xảy ra lỗi khi tải dữ liệu
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Không thể hiển thị nội dung lúc này. Vui lòng thử lại sau giây lát; nếu
        vẫn lỗi, hãy liên hệ DNK House.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Thử lại
      </button>
    </div>
  );
}
```

Ghi chú: `error` nằm trong signature để khớp kiểu prop của `error.tsx` (Next truyền vào) — không dùng trực tiếp trong UI (tránh lộ chi tiết lỗi từ Server Component). Nếu `npm run lint` báo `error` unused → đổi thành `_error` hoặc thêm `void error;` trong thân, hoặc log: `if (typeof window !== "undefined") console.error(error);`. Ưu tiên `void error;` cho gọn.

- [ ] **Bước 4: Typecheck + lint + build**

```bash
npx tsc --noEmit; echo "tsc=$?"
npm run lint
npm run build
```

Kỳ vọng: sạch. Build hiện `/portal/[projectId]` là `ƒ (Dynamic)`. `/` vẫn `○ (Static)`. Nếu `tsc` báo không tìm thấy type `PageProps<"/portal/[projectId]">` → chạy `npm run build` một lần (sinh `.next/types`) rồi `npx tsc --noEmit` lại; nếu vẫn thiếu, tạm thay bằng `{ params }: { params: Promise<{ projectId: string }> }` và ghi chú trong commit.

- [ ] **Bước 5: Kiểm tra thủ công (Supabase local)**

```bash
npx supabase db reset
E2E_TEST_LOGIN=1 npm run dev
```

- `/auth/test-login?email=client-a@dnkhouse.test` → `/portal` → bấm card "Chatbot CSKH cho Khách A" → `/portal/aaaaaaaa-0000-0000-0000-000000000001`:
  - Tiêu đề "Chatbot CSKH cho Khách A", badge "Đang triển khai", có `summary`.
  - 4 mốc theo thứ tự: "Chốt yêu cầu & kịch bản hội thoại" (✓), "Huấn luyện mô hình trên dữ liệu khách" (✓), "Tích hợp website + fanpage", "Chạy thử & bàn giao".
  - Nhật ký: "Bắt đầu tích hợp lên website, dự kiến 1 tuần." trên "Đã hoàn tất huấn luyện vòng 1…".
  - Link "Tất cả dự án" quay về `/portal`.
- Sửa URL sang `/portal/bbbbbbbb-0000-0000-0000-000000000002` (dự án Khách B) → "Không tìm thấy dự án", KHÔNG thấy tên dự án B.
- `/portal/khong-phai-uuid` và `/portal/00000000-0000-0000-0000-000000000000` → "Không tìm thấy dự án".

- [ ] **Bước 6: Commit**

```bash
git add src/app/portal/[projectId]/page.tsx src/app/portal/not-found.tsx src/app/portal/error.tsx
git commit -m "feat(portal): trang /portal/[projectId] + not-found + error boundary"
```

---

## Task 6: Seed `done_at` + E2E `project-detail.spec.ts`

**Files:**
- Chỉnh sửa: `supabase/seed.sql`
- Chỉnh sửa: `tests/e2e/helpers.ts`
- Tạo mới: `tests/e2e/project-detail.spec.ts`

**Interfaces:**
- Consumes: `loginAs`, `EMAILS` (Slice 2–3), seed data (Slice 1).
- Cung cấp: `PROJECT_IDS` trong `tests/e2e/helpers.ts`.

- [ ] **Bước 1: Sửa `supabase/seed.sql` — điền `done_at` cho mốc đã xong**

Ngay sau khối `insert into public.milestones (...)` (Slice 1), thêm:

```sql
-- Mốc đã hoàn thành cần done_at để portal hiển thị ngày hoàn thành.
-- Trigger set_milestone_done_at chỉ chạy BEFORE UPDATE, không set khi seed INSERT.
update public.milestones set done_at = now() - interval '20 days' where done;
```

- [ ] **Bước 2: Thêm `PROJECT_IDS` vào `tests/e2e/helpers.ts`**

```ts
export const PROJECT_IDS = {
  projectA: "aaaaaaaa-0000-0000-0000-000000000001",
  projectB: "bbbbbbbb-0000-0000-0000-000000000002",
} as const;
```

(Giữ nguyên `EMAILS`, `loginAs` sẵn có.)

- [ ] **Bước 3: Viết `tests/e2e/project-detail.spec.ts`**

```ts
import { expect, test } from "@playwright/test";
import { EMAILS, PROJECT_IDS, loginAs } from "./helpers";

test.describe("Chi tiết dự án (Slice 4)", () => {
  test("khách A mở dự án của mình: mốc đúng thứ tự + nhật ký mới nhất trên đầu", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.clientA);
    await page
      .getByRole("link", { name: /Chatbot CSKH cho Khách A/ })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/portal/${PROJECT_IDS.projectA}$`),
    );

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Chatbot CSKH cho Khách A",
      }),
    ).toBeVisible();

    const milestones = page
      .getByRole("list", { name: "Các mốc triển khai" })
      .getByRole("listitem");
    await expect(milestones).toHaveCount(4);
    await expect(milestones.nth(0)).toContainText(
      "Chốt yêu cầu & kịch bản hội thoại",
    );
    await expect(milestones.nth(0)).toContainText("đã hoàn thành");
    await expect(milestones.nth(0)).toContainText("Hoàn thành ngày");
    await expect(milestones.nth(3)).toContainText("Chạy thử & bàn giao");
    await expect(milestones.nth(3)).toContainText("chưa hoàn thành");

    const updates = page
      .getByRole("list", { name: "Nhật ký cập nhật" })
      .getByRole("listitem");
    await expect(updates.nth(0)).toContainText(
      "Bắt đầu tích hợp lên website, dự kiến 1 tuần.",
    );
    await expect(updates.nth(1)).toContainText(
      "Đã hoàn tất huấn luyện vòng 1",
    );
  });

  test("khách A sửa URL sang dự án khách B -> Không tìm thấy, không lộ tên dự án B", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.clientA);
    await page.goto(`/portal/${PROJECT_IDS.projectB}`);
    await expect(
      page.getByRole("heading", { name: "Không tìm thấy dự án" }),
    ).toBeVisible();
    await expect(
      page.getByText("Tự động hoá nhập liệu — Khách B"),
    ).toHaveCount(0);
  });

  test("id dự án hợp lệ nhưng không tồn tại -> Không tìm thấy", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.clientA);
    await page.goto("/portal/00000000-0000-0000-0000-000000000000");
    await expect(
      page.getByRole("heading", { name: "Không tìm thấy dự án" }),
    ).toBeVisible();
  });

  test("id dự án sai định dạng -> Không tìm thấy", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    await page.goto("/portal/khong-phai-uuid");
    await expect(
      page.getByRole("heading", { name: "Không tìm thấy dự án" }),
    ).toBeVisible();
  });

  test("khách B mở dự án của mình: thấy đúng dự án B", async ({ page }) => {
    await loginAs(page, EMAILS.clientB);
    await page.goto(`/portal/${PROJECT_IDS.projectB}`);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Tự động hoá nhập liệu — Khách B",
      }),
    ).toBeVisible();
    const milestones = page
      .getByRole("list", { name: "Các mốc triển khai" })
      .getByRole("listitem");
    await expect(milestones).toHaveCount(2);
    await expect(milestones.nth(0)).toContainText(
      "Khảo sát quy trình hiện tại",
    );
  });
});
```

- [ ] **Bước 4: Chạy E2E**

```bash
npx supabase db reset
npm run test:e2e
```

Kỳ vọng: `auth.spec.ts` (Slice 2) + `dashboard.spec.ts` (Slice 3) + `project-detail.spec.ts` đều xanh. Nếu `getByRole("list", { name: ... })` không khớp — xác nhận `aria-label` trên `<ol>` ở Task 4 đúng chính tả ("Các mốc triển khai" / "Nhật ký cập nhật").

- [ ] **Bước 5: Commit**

```bash
git add supabase/seed.sql tests/e2e/helpers.ts tests/e2e/project-detail.spec.ts
git commit -m "test(portal): E2E chi tiết dự án — cô lập theo khách, thứ tự mốc/nhật ký, seed done_at"
```

---

## Task 7: Responsive + CLAUDE.md + xác minh hoàn thành slice

**Files:**
- Chỉnh sửa: `CLAUDE.md`

- [ ] **Bước 1: Kiểm tra responsive `/portal/[projectId]`**

Dùng skill `browser-automation` (hoặc `E2E_TEST_LOGIN=1 npm run dev` + DevTools), đăng nhập `client-a` qua `/auth/test-login?email=client-a@dnkhouse.test`, mở `/portal/aaaaaaaa-0000-0000-0000-000000000001`:
- **375px:** tiêu đề + badge xuống dòng gọn (`flex-wrap`), không tràn ngang; mốc và card nhật ký full-width, chữ đọc được; link "Tất cả dự án" không bị cắt.
- **768px:** bố cục thoáng, nội dung trong `max-w-4xl` của `portal/layout.tsx`.
- **1440px:** nội dung căn giữa theo `max-w-4xl`, `summary` giới hạn `max-w-2xl` không kéo dài.

Sửa class Tailwind nếu lệch. **Không** thêm token màu mới vào `globals.css`.

- [ ] **Bước 2: Thêm mục `## Portal (client portal)` vào `CLAUDE.md`**

Chèn ngay **trước** mục `## Biến môi trường (client portal)` (tạo ở Slice 1):

```markdown
## Portal (client portal)

Khu vực đăng nhập cho khách hàng DNK House xem tiến độ dự án. Tách biệt hoàn toàn
với landing `/` (vẫn SSG, không phụ thuộc Supabase).

- **Route:**
  - `/login` — nút "Đăng nhập với Google" (Supabase Auth OAuth).
  - `/auth/callback` — Route Handler đổi `code` lấy session.
  - `/portal` — danh sách dự án của khách; `role = 'pending'` → màn "chờ duyệt".
  - `/portal/[projectId]` — chi tiết 1 dự án: mốc triển khai + nhật ký cập nhật.
- **Ba lớp bảo vệ:** (1) `src/proxy.ts` đọc cookie, redirect `/portal ↔ /login`;
  (2) DAL `src/lib/portal/session.ts` (`requireClient`, `requireProjectAccess`)
  gọi ở đầu **mỗi page** — KHÔNG đặt auth check trong `layout.tsx`;
  (3) RLS Postgres là phòng thủ cuối — client chỉ đọc được dự án mình là thành
  viên, mọi thao tác ghi chỉ `admin`.
- **Truy vấn:** `src/lib/portal/queries.ts` — server-only, RLS tự lọc theo
  `auth.uid()`. Client Supabase: `src/lib/supabase/{server,client,middleware}.ts`
  (`@supabase/ssr`).
- **`notFound()`** render `src/app/portal/not-found.tsx`; lỗi truy vấn bất ngờ
  render `src/app/portal/error.tsx` (hai boundary khác nhau).
- **Nhập liệu (Giai đoạn 1):** dự án / mốc / cập nhật nhập tay qua Supabase
  Studio; duyệt khách = đổi `profiles.role` `pending → client` + thêm dòng
  `project_members`. Trang admin (`/portal/admin`) là Giai đoạn 2.
- Toàn bộ portal tiếng Việt, không i18n. KHÔNG dùng `ScrollReveal` của landing.
```

- [ ] **Bước 3: Chạy checklist xác minh của spec slice**

```bash
npx supabase db reset
npm run test        # unit (format, session, progress, supabase-clients) + integration (rls) xanh
npm run test:e2e    # auth + dashboard + project-detail xanh
npx tsc --noEmit; echo "tsc=$?"   # 0
npm run lint        # sạch
npm run build       # xanh; / vẫn ○ Static; /portal/[projectId] là ƒ Dynamic
git status          # sạch; .env.local không xuất hiện
```

- [ ] **Bước 4: Xác minh `/` không đổi**

```bash
npm run build
```

Kỳ vọng: route `/` `○ (Static) prerendered as static content`, không warning mới.

- [ ] **Bước 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(portal): CLAUDE.md — mục kiến trúc Portal (client portal)"
```

- [ ] **Bước 6: Review slice** — dùng skill `superpowers:requesting-code-review` cho toàn bộ diff Slice 4. Sau khi pass, Giai đoạn 1 hoàn tất — cân nhắc `superpowers:finishing-a-development-branch`.

---

## Tự Kiểm Tra Kế Hoạch (đã chạy)

**Bao phủ spec slice 4:**
- DAL `requireProjectAccess(projectId)` — gọi `requireClient()` trước, truy vấn `projects` theo id (RLS lọc), không kết quả → `notFound()`, trả dữ liệu dự án cơ bản (`ProjectSummary`) để page dùng lại → **Task 2** ✅
- Truy vấn `getProjectDetail(projectId)` — `milestones` sắp `position` asc, `updates` sắp `created_at` desc, chỉ lấy con → **Task 3** ✅
- `src/app/portal/[projectId]/page.tsx` — `requireProjectAccess` → `getProjectDetail` → render `name` / badge `statusLabel` / `summary` / `MilestoneList` / `UpdatesFeed` + link về `/portal` → **Task 5** ✅
- `src/app/portal/error.tsx` — `"use client"`, thông báo chung tiếng Việt + nút thử lại (`retry`) → **Task 5** ✅
- `not-found` — thêm `src/app/portal/not-found.tsx` thông điệp riêng tiếng Việt (spec cho phép chọn phương án này) → **Task 5** ✅
- `MilestoneList` — Server Component, mỗi dòng icon done/chưa + `title`, hiện `done_at` (ngày) nếu có → **Task 4** ✅
- `UpdatesFeed` — Server Component, mỗi mục `created_at` + `body` (giữ xuống dòng qua `whitespace-pre-line`) + `author_name`; rỗng → "Chưa có cập nhật nào." → **Task 4** ✅
- Test E2E `tests/e2e/project-detail.spec.ts` — kịch bản 2 của design doc gốc 5.3 (client sửa URL sang `projectId` khách khác → "không tìm thấy") + client mở dự án của chính mình thấy milestone + updates đúng → **Task 6** ✅
- Tài liệu — CLAUDE.md mục "Portal (client portal)": route, hai lớp `proxy.ts` + DAL, RLS lớp cuối, client Supabase `src/lib/supabase/*`, nhập liệu tay qua Supabase Studio (Giai đoạn 1) → **Task 7** ✅
- Xác minh hoàn thành spec (5 mục): test + e2e xanh (Task 6–7), kiểm tra dev thủ công (Task 5 Bước 5), responsive 375/768/1440 (Task 7 Bước 1), build/tsc/lint sạch (Task 7 Bước 3–4), CLAUDE.md có mục Portal (Task 7 Bước 2) ✅

**Rà soát placeholder:** không có "TBD/TODO/tương tự Task N". Mọi bước viết code có block code đầy đủ, chạy được. Các nhánh xử lý lỗi type (`?? null`, `PageProps` chưa sinh, `error` unused, locale ICU) đều nêu cách xử lý cụ thể, không phải "xử lý cho phù hợp".

**Nhất quán type:**
- `ProjectSummary { id, name, statusLabel, summary }` — định nghĩa Task 2, dùng Task 5 (`project.name`, `project.statusLabel`, `project.summary`, `project.id`).
- `resolveProjectAccess(clientStatus, project)` — Task 2, test Task 2.
- `requireProjectAccess(projectId): Promise<ProjectSummary>` — Task 2, gọi Task 5.
- `Milestone { id, title, done, doneAt }` / `ProjectUpdate { id, body, authorName, createdAt }` / `ProjectDetail { milestones, updates }` — định nghĩa Task 3, dùng Task 4 (`milestone.done`, `milestone.doneAt`, `milestone.title`; `update.body`, `update.authorName`, `update.createdAt`) và Task 5 (`{ milestones, updates }`).
- `getProjectDetail(projectId): Promise<ProjectDetail>` — Task 3, gọi Task 5.
- `formatVnDate(iso): string` — Task 1, dùng Task 4 (cả 2 component).
- `<MilestoneList items={...} />` / `<UpdatesFeed items={...} />` prop tên `items` — Task 4, dùng Task 5.
- `aria-label` `<ol>` = "Các mốc triển khai" / "Nhật ký cập nhật" — Task 4, khớp selector E2E Task 6.
- `PROJECT_IDS.projectA/projectB` + tên dự án ("Chatbot CSKH cho Khách A" / "Tự động hoá nhập liệu — Khách B") + nội dung update/milestone — khớp `supabase/seed.sql` Slice 1.
- `requireClient()` return `{ status: "ok" | "pending"; profile }` — từ Slice 2, Task 2 dùng đúng `access.status`.
- `loginAs` / `EMAILS.clientA/clientB` — từ Slice 2–3, Task 6 mở rộng `PROJECT_IDS`.

**Sai lệch so với spec (có chủ đích, đã ghi rõ):**
- Thêm `src/lib/portal/format.ts` (ngoài danh sách file spec) — tách định dạng ngày thành hàm thuần test được, tránh lặp logic `Intl` trong 2 component (DRY). Spec mục Test chỉ liệt kê E2E; unit test cho hàm thuần là bổ sung hợp lý theo TDD.
- Thêm `src/app/portal/not-found.tsx` — spec nêu đây là lựa chọn ("nếu muốn thông điệp riêng"); chọn có vì portal toàn tiếng Việt, trang 404 mặc định của Next là tiếng Anh và nằm ngoài `portal/layout.tsx`.
- Guard UUID regex trong `requireProjectAccess` — id sai định dạng làm Postgres ném lỗi `22P02` vào `error.tsx` thay vì trang "không tìm thấy"; regex đưa nó về `notFound()` đúng ý spec 4.5 ("không phân biệt không tồn tại / không quyền").
- Sửa `supabase/seed.sql` thêm `update ... set done_at` — mốc `done` trong seed Slice 1 có `done_at = NULL` vì trigger `set_milestone_done_at` chỉ chạy `before update`. Không sửa thì tính năng "hiện ngày hoàn thành" không quan sát được ở dev/E2E. Thay đổi chỉ ảnh hưởng dữ liệu mẫu local, không đụng migration/RLS; `rls.test.ts` (Slice 1) và `dashboard.spec.ts` (Slice 3) không assert `done_at` nên không hỏng.
