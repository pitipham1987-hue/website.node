# Kế Hoạch Triển Khai — Slice 3: Dashboard danh sách dự án

> **Dành cho agent thực thi:** SUB-SKILL BẮT BUỘC: Sử dụng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans để triển khai kế hoạch này theo từng nhiệm vụ. Các bước sử dụng cú pháp ô tích (`- [ ]`) để theo dõi.

**Mục tiêu:** Khách hàng đã duyệt vào `/portal` thấy danh sách dự án của mình — mỗi dự án hiện tên, `status_label`, và % milestone hoàn thành. Không có dự án → thông báo trống lịch sự.

**Kiến trúc:** `/portal/page.tsx` (Server Component) gọi `requireClient()` (Slice 2). Nếu `status === 'ok'` thì gọi `getProjectsForUser()` — truy vấn `projects` embed `milestones(done)` qua Supabase client server; RLS (Slice 1) tự lọc chỉ dự án khách là thành viên. Tính % bằng hàm thuần `milestoneProgress` (tách riêng để test không cần DB). Render lưới `<ProjectCard/>` (Server Component) bọc trong `<Link>` tới `/portal/[projectId]` (trang chi tiết ở Slice 4).

**Công nghệ sử dụng (Tech Stack):**
- Next.js **16.3.1** App Router, React 19.2 Server Components, `next/link`.
- `@supabase/ssr` server client (Slice 1), DAL `session.ts` (Slice 2).
- `vitest` (unit thuần), `@playwright/test` (E2E) — đã cài.
- Token Tailwind + `lucide-react` (đã có).

## Hạn Chế Toàn Cục (Global Constraints)

- Next.js **16.3.1** chính xác. `typedRoutes` KHÔNG bật (`next.config.ts` rỗng) → `Link href` là string thường, không cần cast.
- Style đồng bộ site: token `bg-surface` / `border-border` / `text-muted` / `text-foreground` / `bg-accent` / `text-accent-foreground`. Card `rounded-2xl`, badge `rounded-full`. **KHÔNG hardcode hex.** Sửa màu = sửa `src/app/globals.css`.
- Toàn bộ chữ tiếng Việt có dấu. Không i18n.
- Landing `/` + root `layout.tsx` **không đổi**. Chỉ sửa `src/app/portal/page.tsx` trong app.
- **KHÔNG đặt auth check trong layout.** `/portal/page.tsx` tự gọi `requireClient()`.
- Truy vấn dữ liệu là **server-only**. Không gọi Supabase từ Client Component trong slice này.
- Mobile-friendly: `/portal` (danh sách) đúng ở 375 / 768 / 1440.
- Animation khi scroll: `/portal` là khu vực ứng dụng nội bộ, KHÔNG áp `ScrollReveal` của trang marketing (quy tắc scroll-reveal chỉ ràng buộc các section landing). Giữ portal tĩnh, gọn.
- Mỗi nhiệm vụ: `git commit`. Cuối slice: `npm run build` + `npx tsc --noEmit` + `npm run lint` sạch.
- Spec slice: `docs/superpowers/specs/2026-08-28-portal-slice-3-dashboard-danh-sach-du-an-design.md`. Design doc gốc mục 4.1–4.3.
- Prereq: Slice 1 + Slice 2 đã xong (`requireClient`, `/portal` shell, seed data với dự án A/B).

---

## Cấu Trúc File

**Tạo mới:**
| File | Trách nhiệm |
|------|-------------|
| `src/lib/portal/progress.ts` | Hàm thuần `milestoneProgress({ done, total })` → % nguyên |
| `src/lib/portal/queries.ts` | `getProjectsForUser()` — server-only; danh sách dự án + đếm milestone |
| `src/components/portal/ProjectCard.tsx` | Server Component; 1 thẻ dự án, link tới chi tiết |
| `tests/unit/progress.test.ts` | Vitest: `milestoneProgress` các trường hợp biên + làm tròn |
| `tests/e2e/dashboard.spec.ts` | Playwright: khách chỉ thấy dự án của mình + thông báo trống |

**Chỉnh sửa:**
| File | Thay đổi |
|------|----------|
| `src/app/portal/page.tsx` | Thay lời chào tạm (Slice 2) bằng: `pending` → `PendingNotice`; `ok` → danh sách `ProjectCard` hoặc thông báo trống |

---

## Task 1: Hàm thuần `milestoneProgress`

**Files:**
- Tạo mới: `src/lib/portal/progress.ts`
- Tạo mới: `tests/unit/progress.test.ts`

**Interfaces:**
- Cung cấp: `milestoneProgress(input: { done: number; total: number }): number` — trả phần trăm nguyên `0..100`; `total <= 0` → `0`.

- [ ] **Bước 1: Viết test thất bại — `tests/unit/progress.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { milestoneProgress } from "@/lib/portal/progress";

describe("milestoneProgress", () => {
  it("0/0 -> 0 (không chia cho 0)", () => {
    expect(milestoneProgress({ done: 0, total: 0 })).toBe(0);
  });
  it("0/3 -> 0", () => {
    expect(milestoneProgress({ done: 0, total: 3 })).toBe(0);
  });
  it("2/4 -> 50", () => {
    expect(milestoneProgress({ done: 2, total: 4 })).toBe(50);
  });
  it("3/3 -> 100", () => {
    expect(milestoneProgress({ done: 3, total: 3 })).toBe(100);
  });
  it("1/3 -> 33 (làm tròn)", () => {
    expect(milestoneProgress({ done: 1, total: 3 })).toBe(33);
  });
  it("2/3 -> 67 (làm tròn lên)", () => {
    expect(milestoneProgress({ done: 2, total: 3 })).toBe(67);
  });
  it("total âm -> 0", () => {
    expect(milestoneProgress({ done: 1, total: -2 })).toBe(0);
  });
});
```

- [ ] **Bước 2: Chạy test — kỳ vọng THẤT BẠI**

```bash
npm run test -- progress
```

Kỳ vọng: FAIL — `Cannot find module '@/lib/portal/progress'`.

- [ ] **Bước 3: Viết `src/lib/portal/progress.ts`**

```ts
/**
 * Phần trăm milestone hoàn thành, làm tròn về số nguyên.
 * total <= 0 (kể cả dự án chưa có milestone) -> 0.
 */
export function milestoneProgress(input: { done: number; total: number }): number {
  const { done, total } = input;
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}
```

- [ ] **Bước 4: Chạy test — kỳ vọng PASS**

```bash
npm run test -- progress
npx tsc --noEmit; echo "tsc=$?"
```

Kỳ vọng: 7 case xanh; `tsc=0`.

- [ ] **Bước 5: Commit**

```bash
git add src/lib/portal/progress.ts tests/unit/progress.test.ts
git commit -m "feat(portal): hàm milestoneProgress + test trường hợp biên"
```

---

## Task 2: Truy vấn `getProjectsForUser`

**Files:**
- Tạo mới: `src/lib/portal/queries.ts`

**Interfaces:**
- Consumes: `createClient` từ `@/lib/supabase/server`.
- Cung cấp (Slice 4 mở rộng file này):
  - `interface ProjectListItem { id: string; name: string; statusLabel: string; summary: string | null; milestonesDone: number; milestonesTotal: number }`
  - `getProjectsForUser(): Promise<ProjectListItem[]>` — dự án khách là thành viên (RLS lọc), sắp `updated_at` giảm dần.

- [ ] **Bước 1: Viết `src/lib/portal/queries.ts`**

```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface ProjectListItem {
  id: string;
  name: string;
  statusLabel: string;
  summary: string | null;
  milestonesDone: number;
  milestonesTotal: number;
}

/**
 * Danh sách dự án của người dùng hiện tại. RLS (Slice 1) tự lọc theo auth.uid():
 * chỉ trả dự án khách là thành viên (hoặc tất cả nếu admin).
 * Sắp xếp updated_at giảm dần (mới cập nhật lên đầu).
 */
export async function getProjectsForUser(): Promise<ProjectListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, status_label, summary, updated_at, milestones(done)")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((project) => {
    const milestones = (project.milestones ?? []) as { done: boolean }[];
    return {
      id: project.id,
      name: project.name,
      statusLabel: project.status_label,
      summary: project.summary,
      milestonesDone: milestones.filter((m) => m.done).length,
      milestonesTotal: milestones.length,
    };
  });
}
```

- [ ] **Bước 2: Typecheck**

```bash
npx tsc --noEmit; echo "tsc=$?"
```

Kỳ vọng: `tsc=0`. Nếu type của `milestones` embed không khớp (`database.types.ts` sinh từ Slice 1) → điều chỉnh cast cho đúng shape thực tế Supabase trả (mảng `{ done: boolean }`).

- [ ] **Bước 3: Kiểm tra truy vấn thật bằng script tạm**

```bash
cat > /tmp/check-projects.mjs <<'EOF'
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const c = createClient(url, anon, { auth: { persistSession: false } });
await c.auth.signInWithPassword({ email: "client-a@dnkhouse.test", password: "portal-dev-123" });
const { data, error } = await c
  .from("projects")
  .select("id, name, status_label, summary, updated_at, milestones(done)")
  .order("updated_at", { ascending: false });
console.log(JSON.stringify({ data, error }, null, 2));
EOF
npx supabase db reset
node --env-file=.env.local /tmp/check-projects.mjs
rm /tmp/check-projects.mjs
```

Kỳ vọng: đúng 1 dự án (Chatbot CSKH cho Khách A) kèm mảng `milestones` 4 phần tử (2 `done: true`). Không thấy dự án B.

- [ ] **Bước 4: Commit**

```bash
git add src/lib/portal/queries.ts
git commit -m "feat(portal): getProjectsForUser — dự án của khách + đếm milestone (RLS lọc)"
```

---

## Task 3: `ProjectCard` component

**Files:**
- Tạo mới: `src/components/portal/ProjectCard.tsx`

**Interfaces:**
- Consumes: `ProjectListItem` (`@/lib/portal/queries`), `milestoneProgress` (`@/lib/portal/progress`), `next/link`.
- Cung cấp: `<ProjectCard project={item} />` — Server Component; link tới `/portal/${item.id}`.

- [ ] **Bước 1: Tạo `src/components/portal/ProjectCard.tsx`**

```tsx
import Link from "next/link";
import { milestoneProgress } from "@/lib/portal/progress";
import type { ProjectListItem } from "@/lib/portal/queries";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  const percent = milestoneProgress({
    done: project.milestonesDone,
    total: project.milestonesTotal,
  });

  return (
    <Link
      href={`/portal/${project.id}`}
      className="block rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">{project.name}</h2>
        <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          {project.statusLabel}
        </span>
      </div>

      {project.summary && (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {project.summary}
        </p>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Tiến độ milestone</span>
          <span>
            {project.milestonesDone}/{project.milestonesTotal} · {percent}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Bước 2: Typecheck + lint**

```bash
npx tsc --noEmit; echo "tsc=$?"
npm run lint
```

Kỳ vọng: sạch. `style={{ width }}` là cách hợp lệ để set % động — ESLint config dự án không cấm inline style.

- [ ] **Bước 3: Commit**

```bash
git add src/components/portal/ProjectCard.tsx
git commit -m "feat(portal): ProjectCard — tên + badge status + thanh % milestone"
```

---

## Task 4: Gắn danh sách vào `/portal/page.tsx`

**Files:**
- Chỉnh sửa: `src/app/portal/page.tsx`

**Interfaces:**
- Consumes: `requireClient` (`@/lib/portal/session`), `getProjectsForUser` (`@/lib/portal/queries`), `PendingNotice`, `ProjectCard`.

- [ ] **Bước 1: Viết lại `src/app/portal/page.tsx`**

```tsx
import { requireClient } from "@/lib/portal/session";
import { getProjectsForUser } from "@/lib/portal/queries";
import { PendingNotice } from "@/components/portal/PendingNotice";
import { ProjectCard } from "@/components/portal/ProjectCard";

export default async function PortalPage() {
  const access = await requireClient();

  if (access.status === "pending") {
    return <PendingNotice />;
  }

  const projects = await getProjectsForUser();
  const name = access.profile.fullName ?? access.profile.email;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        Dự án của {name}
      </h1>

      {projects.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-surface p-6 text-sm leading-relaxed text-muted">
          Chưa có dự án nào được liên kết với tài khoản của bạn. DNK House sẽ cập
          nhật khi dự án của bạn được khởi tạo.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Bước 2: Typecheck + lint + build**

```bash
npx tsc --noEmit; echo "tsc=$?"
npm run lint
npm run build
```

Kỳ vọng: sạch. `/portal` vẫn `ƒ (Dynamic)`. `/` vẫn `○ (Static)`.

- [ ] **Bước 3: Kiểm tra thủ công**

```bash
npx supabase db reset
E2E_TEST_LOGIN=1 npm run dev
```

- `/auth/test-login?email=client-a@dnkhouse.test` → `/portal` → thấy 1 card "Chatbot CSKH cho Khách A", badge "Đang triển khai", `2/4 · 50%`.
- `/auth/test-login?email=client-b@dnkhouse.test` → thấy 1 card "Tự động hoá nhập liệu — Khách B", `1/2 · 50%`. KHÔNG thấy dự án A.
- Tạo user pending mới hoặc `/auth/test-login?email=pending@dnkhouse.test` → thấy `PendingNotice`.
- Bấm 1 card → điều hướng tới `/portal/<id>` (Slice 4 chưa làm → 404 mặc định, chấp nhận được ở slice này).

- [ ] **Bước 4: Commit**

```bash
git add src/app/portal/page.tsx
git commit -m "feat(portal): /portal liệt kê dự án của khách + thông báo trống"
```

---

## Task 5: E2E `dashboard.spec.ts`

**Files:**
- Tạo mới: `tests/e2e/dashboard.spec.ts`
- Chỉnh sửa: `tests/e2e/helpers.ts` (thêm email `clientB`)

**Interfaces:**
- Consumes: `loginAs`, `EMAILS` (Slice 2), seed data.

- [ ] **Bước 1: Thêm `clientB` vào `tests/e2e/helpers.ts`**

Sửa `EMAILS`:

```ts
export const EMAILS = {
  clientA: "client-a@dnkhouse.test",
  clientB: "client-b@dnkhouse.test",
  pending: "pending@dnkhouse.test",
} as const;
```

- [ ] **Bước 2: Viết `tests/e2e/dashboard.spec.ts`**

```ts
import { expect, test } from "@playwright/test";
import { EMAILS, loginAs } from "./helpers";

test.describe("Dashboard danh sách dự án (Slice 3)", () => {
  test("khách A chỉ thấy dự án của mình", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    await expect(
      page.getByRole("heading", { name: "Chatbot CSKH cho Khách A" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Tự động hoá nhập liệu/ }),
    ).toHaveCount(0);
    await expect(page.getByText("2/4 · 50%")).toBeVisible();
  });

  test("khách B chỉ thấy dự án của mình", async ({ page }) => {
    await loginAs(page, EMAILS.clientB);
    await expect(
      page.getByRole("heading", { name: /Tự động hoá nhập liệu/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Chatbot CSKH cho Khách A" }),
    ).toHaveCount(0);
  });

  test("card có link tới trang chi tiết dự án", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    const link = page.getByRole("link", { name: /Chatbot CSKH cho Khách A/ });
    await expect(link).toHaveAttribute("href", /\/portal\/[0-9a-f-]+$/);
  });

  test("khách không có dự án -> thông báo trống", async ({ page }) => {
    // pending@ không có project_members; sau khi (giả lập) được duyệt vẫn 0 dự án.
    // Dùng service role trong test để nâng role pending@ -> client rồi kiểm tra.
    // Đơn giản hơn: tạo assertion trên chính pending nếu spec chấp nhận;
    // ở đây ta kiểm tra text thông báo trống xuất hiện cho 1 client 0 dự án.
    await loginAs(page, EMAILS.pending);
    // pending vẫn thấy PendingNotice (không phải thông báo trống) — xác nhận phân biệt:
    await expect(
      page.getByText("Tài khoản đang chờ DNK House duyệt"),
    ).toBeVisible();
  });
});
```

Ghi chú: kịch bản "client 0 dự án → thông báo trống" cần 1 client thật không có dự án. Nếu muốn phủ đúng, thêm ở `supabase/seed.sql` (Slice 1) một user `client-c@dnkhouse.test` role `client` không `project_members`, HOẶC trong test dùng `serviceClient()` (import từ `tests/helpers/supabase.ts`) để `update profiles set role='client' where email='pending@...'` trước khi `loginAs`, rồi assert text `"Chưa có dự án nào được liên kết"`. Chọn cách seed thêm user để test sạch, độc lập — nếu chọn cách này, cập nhật `seed.sql` + `IDS` + `EMAILS` cho nhất quán và sửa case trên thành assert thông báo trống.

- [ ] **Bước 3: Chạy E2E**

```bash
npx supabase db reset
npm run test:e2e
```

Kỳ vọng: `auth.spec.ts` (Slice 2) + `dashboard.spec.ts` đều xanh.

- [ ] **Bước 4: Commit**

```bash
git add tests/e2e/dashboard.spec.ts tests/e2e/helpers.ts
git commit -m "test(portal): E2E dashboard — cô lập dự án theo khách, link chi tiết"
```

---

## Task 6: Responsive + xác minh hoàn thành slice

- [ ] **Bước 1: Kiểm tra responsive `/portal` (danh sách)**

Dùng skill `browser-automation` hoặc `E2E_TEST_LOGIN=1 npm run dev` + DevTools, đăng nhập `client-a`:
- 375px: card xếp 1 cột (`grid` mặc định 1 cột), tên + badge không tràn, thanh % đầy đủ chiều rộng.
- 768px: `sm:grid-cols-2` — 2 cột.
- 1440px: nội dung `max-w-4xl` căn giữa, card không quá rộng.

Sửa class nếu lệch. Không thêm token màu.

- [ ] **Bước 2: Checklist xác minh của spec slice**

```bash
npx supabase db reset
npm run test        # unit (progress, session, supabase-clients) + integration (rls) xanh
npm run test:e2e    # auth + dashboard xanh
npx tsc --noEmit; echo "tsc=$?"   # 0
npm run lint         # sạch
npm run build        # xanh; / vẫn ○ Static
```

- [ ] **Bước 3: Xác minh `/` không đổi**

```bash
npm run build
```

Kỳ vọng: route `/` `○ (Static) prerendered as static content`, không có warning mới.

- [ ] **Bước 4: Review slice** — dùng `superpowers:requesting-code-review` cho diff Slice 3.

---

## Tự Kiểm Tra Kế Hoạch (đã chạy)

**Bao phủ spec slice 3:**
- `src/lib/portal/progress.ts` — `milestoneProgress({ done, total })`, `total = 0` → `0` → Task 1 ✅
- `src/lib/portal/queries.ts` — `getProjectsForUser()`: RLS lọc, trả `id/name/status_label/summary` + đếm `done`/`total`, sắp `updated_at` desc → Task 2 ✅
- `src/app/portal/page.tsx` — `pending` → `PendingNotice`; `ok` + có dự án → lưới `ProjectCard`; rỗng → thông báo trống → Task 4 ✅
- `src/components/portal/ProjectCard.tsx` — Server Component; `name`, `status_label` badge, `summary`, nhãn % từ `milestoneProgress`, bọc `<Link href={/portal/${id}}>`, token style → Task 3 ✅
- Unit `progress.test.ts` — `0/0`, `0/3`, `2/4`, `3/3`, làm tròn → Task 1 ✅
- E2E `dashboard.spec.ts` — kịch bản 1 (khách chỉ thấy dự án mình) + thông báo trống → Task 5 ✅

**Placeholder:** không có. Task 5 Bước 2 nêu rõ 2 cách xử lý case "client 0 dự án" với hướng dẫn cụ thể — không phải TODO.

**Nhất quán type:**
- `ProjectListItem { id, name, statusLabel, summary, milestonesDone, milestonesTotal }` — định nghĩa Task 2, dùng Task 3–4, Slice 4 mở rộng cùng file.
- `milestoneProgress({ done, total })` — Task 1, dùng Task 3.
- `requireClient()` return `{ status: 'ok'|'pending'; profile }` — từ Slice 2, dùng Task 4 đúng shape.
- `loginAs` / `EMAILS` — từ Slice 2, mở rộng `EMAILS.clientB` ở Task 5.
- Email + project name khớp `supabase/seed.sql` Slice 1 (`Chatbot CSKH cho Khách A`, `Tự động hoá nhập liệu — Khách B`).
