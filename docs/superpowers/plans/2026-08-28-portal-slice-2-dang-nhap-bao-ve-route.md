# Kế Hoạch Triển Khai — Slice 2: Vòng đăng nhập/đăng xuất + bảo vệ route

> **Dành cho agent thực thi:** SUB-SKILL BẮT BUỘC: Sử dụng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans để triển khai kế hoạch này theo từng nhiệm vụ. Các bước sử dụng cú pháp ô tích (`- [ ]`) để theo dõi.





**Mục tiêu:** Người dùng đăng nhập bằng Google, có session, được phân luồng theo `role`. Route `/portal*` được bảo vệ hai lớp (Proxy + DAL). Người `pending` thấy màn hình chờ duyệt. Đăng xuất hoạt động. Kết thúc slice: `/portal` mới chỉ hiện lời chào + trạng thái pending — danh sách dự án đầy đủ ở Slice 3.

**Kiến trúc:** Ba lớp phòng thủ. (1) `src/proxy.ts` — kiểm tra lạc quan dựa trên cookie đã refresh, redirect `/portal↔/login`. (2) DAL `src/lib/portal/session.ts` — `getSessionProfile()` (bọc `React.cache`, xác thực JWT bằng `getUser()`, join `profiles`), `requireClient()` gọi trong page. (3) RLS (đã có từ Slice 1). Đăng nhập dùng OAuth PKCE của Supabase: client gọi `signInWithOAuth` → Google → `/auth/callback` đổi `code` lấy session.

**Công nghệ sử dụng (Tech Stack):**
- Next.js **16.3.1** App Router: **Proxy** (`src/proxy.ts`, Node runtime), Route Handler, Server Action, `error.tsx` prop là **`retry`** (Next ≥16.3), typed routes (`PageProps<"...">`, `LayoutProps<"...">`).
- `@supabase/ssr` (client server/browser/proxy-helper từ Slice 1), `@supabase/supabase-js`.
- `vitest` (unit), `@playwright/test` (E2E) — đã cài ở Slice 1.
- `lucide-react` cho icon (đã có).

## Hạn Chế Toàn Cục (Global Constraints)

- Next.js **16.3.1** chính xác. Đọc `node_modules/next/dist/docs/01-app/...` trước khi dùng API mới. `cookies()` **async**. Middleware = **Proxy** (`src/proxy.ts`), export hàm tên `proxy` + `config.matcher`, **không** set `runtime` trong file proxy.
- **KHÔNG đặt auth check trong `layout.tsx`** (layout không re-render khi điều hướng client-side). Mọi page trong `/portal` và mọi Server Action phải tự gọi hàm DAL.
- Style portal đồng bộ site: font Inter (đã cấu hình ở root layout), token Tailwind `bg-background` / `bg-surface` / `text-foreground` / `text-muted` / `border-border` / `bg-accent` / `text-accent-foreground`. Button pill `rounded-full`, card `rounded-2xl`. **KHÔNG hardcode hex.** Sửa màu = sửa `src/app/globals.css`.
- Toàn bộ chữ tiếng Việt có dấu. Không i18n.
- Landing `/` + `src/app/page.tsx` + `src/app/layout.tsx` (root) **không đổi**. Portal có layout riêng `src/app/portal/layout.tsx`.
- Mobile-friendly: `/login` và `/portal` phải đúng ở 375 / 768 / 1440.
- `.env.local` không commit. Route test-login chỉ hoạt động khi `E2E_TEST_LOGIN=1`.
- Mỗi nhiệm vụ: `git commit`. Cuối slice: `npm run build` + `npx tsc --noEmit` + `npm run lint` sạch.
- Spec slice: `docs/superpowers/specs/2026-08-28-portal-slice-2-dang-nhap-bao-ve-route-design.md`. Design doc gốc: `.../2026-08-28-portal-dang-nhap-google-design.md` (mục 2, 4).
- **Điều kiện tiên quyết (con người):** Supabase project hosted đã bật Google provider + Google Cloud OAuth client cấu hình redirect URI `https://<project>.supabase.co/auth/v1/callback`; `.env.local` có 3 biến Supabase. Với dev/E2E local, không cần Google thật — dùng route test-login.

---

## Cấu Trúc File

**Tạo mới:**
| File | Trách nhiệm |
|------|-------------|
| `src/lib/portal/session.ts` | DAL: `Role`, `SessionProfile`, `loadSessionProfile`, `getSessionProfile` (cache), `resolveClientAccess` (thuần), `roleToScreen` (thuần), `requireClient` |
| `src/lib/portal/actions.ts` | Server Action `signOut()` |
| `src/proxy.ts` | Next 16 Proxy: refresh session + redirect `/portal↔/login` |
| `src/app/login/page.tsx` | Server Component: redirect nếu đã đăng nhập; hiện `LoginButton`; `?error=auth` → thông báo |
| `src/components/portal/LoginButton.tsx` | `"use client"` — gọi `signInWithOAuth` Google |
| `src/app/auth/callback/route.ts` | Route Handler: `exchangeCodeForSession` → `/portal`; lỗi → `/login?error=auth` |
| `src/app/auth/test-login/route.ts` | Route Handler test-only (chỉ khi `E2E_TEST_LOGIN=1`): đăng nhập bằng mật khẩu seed |
| `src/app/portal/layout.tsx` | Server Component: thanh trên (logo + tên + nút Đăng xuất). Không auth check. |
| `src/app/portal/page.tsx` | Server Component: `requireClient()` → `pending` = `<PendingNotice/>`, `ok` = lời chào tạm |
| `src/components/portal/PendingNotice.tsx` | Server Component: thông báo chờ duyệt |
| `playwright.config.ts` | Cấu hình Playwright: webServer `next start`, env `E2E_TEST_LOGIN=1`, baseURL |
| `tests/unit/session.test.ts` | Vitest: `resolveClientAccess`, `roleToScreen` (4 role) |
| `tests/e2e/auth.spec.ts` | Playwright: kịch bản 3, 4, 5 (design doc gốc 5.3) |
| `tests/e2e/helpers.ts` | Helper E2E: `loginAs(page, email)` gọi route test-login |

**Chỉnh sửa:**
| File | Thay đổi |
|------|----------|
| `src/lib/supabase/middleware.ts` | `updateSession` đổi return type: `Promise<{ response: NextResponse; isAuthenticated: boolean }>` + guard thiếu env |
| `tests/unit/supabase-clients.test.ts` | Cập nhật assertion cho return type mới của `updateSession` |
| `package.json` | Không đổi script (giữ `test:e2e`). |
| `CLAUDE.md` | Ghi chú route test-login + biến `E2E_TEST_LOGIN` |

---

## Task 1: Cập nhật `updateSession` để Proxy dùng được

**Files:**
- Chỉnh sửa: `src/lib/supabase/middleware.ts`
- Chỉnh sửa: `tests/unit/supabase-clients.test.ts:` (assertion cuối)

**Interfaces:**
- Consumes: `Database` (`@/lib/supabase/database.types`), `@supabase/ssr`.
- Cung cấp: `updateSession(request: NextRequest): Promise<{ response: NextResponse; isAuthenticated: boolean }>` — `response` chứa cookie đã refresh; `isAuthenticated` = có claims hợp lệ hay không.

- [ ] **Bước 1: Viết lại `src/lib/supabase/middleware.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Refresh session Supabase trên mỗi request và đồng bộ cookie giữa request/response.
 * Trả về response (đã có cookie mới) + cờ đã đăng nhập cho src/proxy.ts.
 * KHÔNG chèn logic giữa createServerClient và getClaims().
 */
export async function updateSession(
  request: NextRequest,
): Promise<{ response: NextResponse; isAuthenticated: boolean }> {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    // Thiếu cấu hình -> không chặn request, coi như chưa đăng nhập.
    return { response, isAuthenticated: false };
  }

  let supabaseResponse = response;

  const supabase = createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();

  return { response: supabaseResponse, isAuthenticated: Boolean(data?.claims) };
}
```

- [ ] **Bước 2: Cập nhật assertion trong `tests/unit/supabase-clients.test.ts`**

Đổi case cuối thành:

```ts
  it("updateSession import được và là hàm", async () => {
    const mod = await import("@/lib/supabase/middleware");
    expect(typeof mod.updateSession).toBe("function");
  });
```

(Giữ nguyên — chỉ xác nhận không có assertion nào phụ thuộc kiểu trả về cũ. Nếu có, sửa cho khớp `{ response, isAuthenticated }`.)

- [ ] **Bước 3: Chạy test + typecheck**

```bash
npm run test
npx tsc --noEmit; echo "tsc=$?"
```

Kỳ vọng: xanh; `tsc=0`.

- [ ] **Bước 4: Commit**

```bash
git add src/lib/supabase/middleware.ts tests/unit/supabase-clients.test.ts
git commit -m "refactor(portal): updateSession trả {response, isAuthenticated} cho Proxy"
```

---

## Task 2: DAL `src/lib/portal/session.ts`

**Files:**
- Tạo mới: `src/lib/portal/session.ts`
- Tạo mới: `tests/unit/session.test.ts`

**Interfaces:**
- Consumes: `createClient` từ `@/lib/supabase/server`, `redirect` từ `next/navigation`, `cache` từ `react`.
- Cung cấp (Slice 3–4 dựa vào):
  - `type Role = "pending" | "client" | "admin"`
  - `interface SessionProfile { userId: string; email: string; fullName: string | null; role: Role }`
  - `loadSessionProfile(): Promise<SessionProfile | null>` — impl thực (mockable)
  - `getSessionProfile: () => Promise<SessionProfile | null>` — `cache(loadSessionProfile)`
  - `type ClientAccess = { status: "redirect" } | { status: "pending"; profile: SessionProfile } | { status: "ok"; profile: SessionProfile }`
  - `resolveClientAccess(profile: SessionProfile | null): ClientAccess` — thuần
  - `roleToScreen(role: Role): "notice" | "dashboard"` — thuần
  - `requireClient(): Promise<{ status: "ok" | "pending"; profile: SessionProfile }>` — `redirect("/login")` nếu chưa đăng nhập

- [ ] **Bước 1: Viết test thất bại — `tests/unit/session.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  resolveClientAccess,
  roleToScreen,
  type SessionProfile,
} from "@/lib/portal/session";

const profile = (role: SessionProfile["role"]): SessionProfile => ({
  userId: "u1",
  email: "u@dnkhouse.test",
  fullName: "U",
  role,
});

describe("resolveClientAccess", () => {
  it("null -> redirect", () => {
    expect(resolveClientAccess(null)).toEqual({ status: "redirect" });
  });
  it("pending -> status pending kèm profile", () => {
    const p = profile("pending");
    expect(resolveClientAccess(p)).toEqual({ status: "pending", profile: p });
  });
  it("client -> status ok", () => {
    const p = profile("client");
    expect(resolveClientAccess(p)).toEqual({ status: "ok", profile: p });
  });
  it("admin -> status ok", () => {
    const p = profile("admin");
    expect(resolveClientAccess(p)).toEqual({ status: "ok", profile: p });
  });
});

describe("roleToScreen", () => {
  it("pending -> notice", () => expect(roleToScreen("pending")).toBe("notice"));
  it("client -> dashboard", () => expect(roleToScreen("client")).toBe("dashboard"));
  it("admin -> dashboard", () => expect(roleToScreen("admin")).toBe("dashboard"));
});
```

- [ ] **Bước 2: Chạy test — kỳ vọng THẤT BẠI**

```bash
npm run test -- session
```

Kỳ vọng: FAIL — `Cannot find module '@/lib/portal/session'`.

- [ ] **Bước 3: Viết `src/lib/portal/session.ts`**

```ts
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "pending" | "client" | "admin";

export interface SessionProfile {
  userId: string;
  email: string;
  fullName: string | null;
  role: Role;
}

/** Impl thực — tách khỏi cache() để test mock được. */
export async function loadSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();

  // getUser() xác thực JWT với Supabase Auth (không tin getSession trong code server).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return {
    userId: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as Role,
  };
}

/** Dùng trong page/action — dedupe trong 1 request. */
export const getSessionProfile = cache(loadSessionProfile);

export type ClientAccess =
  | { status: "redirect" }
  | { status: "pending"; profile: SessionProfile }
  | { status: "ok"; profile: SessionProfile };

export function resolveClientAccess(
  profile: SessionProfile | null,
): ClientAccess {
  if (!profile) return { status: "redirect" };
  if (profile.role === "pending") return { status: "pending", profile };
  return { status: "ok", profile };
}

export function roleToScreen(role: Role): "notice" | "dashboard" {
  return role === "pending" ? "notice" : "dashboard";
}

/** Gọi ở đầu mọi page /portal. redirect() ném control-flow, code sau không chạy. */
export async function requireClient(): Promise<{
  status: "ok" | "pending";
  profile: SessionProfile;
}> {
  const access = resolveClientAccess(await getSessionProfile());
  if (access.status === "redirect") redirect("/login");
  return access;
}
```

- [ ] **Bước 4: Chạy test — kỳ vọng PASS**

```bash
npm run test -- session
npx tsc --noEmit; echo "tsc=$?"
```

Kỳ vọng: 7 case xanh; `tsc=0`. Nếu `server-only` báo lỗi khi Vitest import (test chỉ import type + hàm thuần nên tree-shake không kéo `createClient`) — nếu vẫn lỗi, thêm vào `vitest.config.ts` `test.server.deps.inline` hoặc mock `server-only` bằng `tests/setup.ts` với `vi.mock("server-only", () => ({}))` khai báo trong `vitest.config.ts` `test.setupFiles`.

- [ ] **Bước 5: Commit**

```bash
git add src/lib/portal/session.ts tests/unit/session.test.ts vitest.config.ts
git commit -m "feat(portal): DAL session.ts — getSessionProfile + requireClient + logic phân nhánh"
```

---

## Task 3: Server Action `signOut` + Proxy

**Files:**
- Tạo mới: `src/lib/portal/actions.ts`
- Tạo mới: `src/proxy.ts`

**Interfaces:**
- Consumes: `updateSession` (Task 1), `createClient` từ `@/lib/supabase/server`.
- Cung cấp: `signOut(): Promise<void>` (`"use server"`); `proxy` + `config` cho Next.

- [ ] **Bước 1: Tạo `src/lib/portal/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Bước 2: Tạo `src/proxy.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isPortal = pathname === "/portal" || pathname.startsWith("/portal/");
  const isLogin = pathname === "/login";

  // Chưa đăng nhập mà vào /portal -> /login
  if (isPortal && !isAuthenticated) {
    return redirectKeepingCookies(request, response, "/login");
  }
  // Đã đăng nhập mà vào /login -> /portal
  if (isLogin && isAuthenticated) {
    return redirectKeepingCookies(request, response, "/portal");
  }

  return response;
}

function redirectKeepingCookies(
  request: NextRequest,
  from: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirectResponse = NextResponse.redirect(url);
  // Giữ cookie session đã refresh từ updateSession.
  for (const cookie of from.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }
  return redirectResponse;
}

export const config = {
  matcher: [
    /*
     * Chạy trên mọi path TRỪ:
     * - _next/static, _next/image
     * - favicon.ico
     * - file ảnh tĩnh
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
```

- [ ] **Bước 3: Typecheck + build**

```bash
npx tsc --noEmit; echo "tsc=$?"
npm run build
```

Kỳ vọng: `tsc=0`; build xanh; log build hiện `ƒ Proxy` hoặc tương đương (Proxy được nhận diện). Route `/` vẫn `○ (Static)`.

- [ ] **Bước 4: Commit**

```bash
git add src/lib/portal/actions.ts src/proxy.ts
git commit -m "feat(portal): Proxy bảo vệ /portal + Server Action signOut"
```

---

## Task 4: Trang `/login` + `LoginButton` + callback

**Files:**
- Tạo mới: `src/components/portal/LoginButton.tsx`
- Tạo mới: `src/app/login/page.tsx`
- Tạo mới: `src/app/auth/callback/route.ts`

**Interfaces:**
- Consumes: `createClient` từ `@/lib/supabase/client` (LoginButton) và `@/lib/supabase/server` (callback), `getSessionProfile` (login page).
- Cung cấp: route `/login` (GET), `/auth/callback` (GET).

- [ ] **Bước 1: Tạo `src/components/portal/LoginButton.tsx`**

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setLoading(false);
      window.location.href = "/login?error=auth";
    }
    // Thành công: trình duyệt được Supabase redirect sang Google.
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {loading ? "Đang chuyển tới Google…" : "Đăng nhập với Google"}
    </button>
  );
}
```

- [ ] **Bước 2: Tạo `src/app/login/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/portal/session";
import { LoginButton } from "@/components/portal/LoginButton";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  if (await getSessionProfile()) redirect("/portal");

  const params = await searchParams;
  const hasError = params.error === "auth";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-sm">
        <p className="text-lg font-bold tracking-tight text-foreground">
          DNK <span className="text-accent">House</span>
        </p>
        <h1 className="mt-6 text-xl font-semibold text-foreground">
          Cổng khách hàng
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Đăng nhập bằng tài khoản Google để xem tiến độ dự án của bạn.
        </p>

        {hasError && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground"
          >
            Đăng nhập không thành công. Vui lòng thử lại.
          </p>
        )}

        <div className="mt-6">
          <LoginButton />
        </div>
      </div>

      <p className="mt-6 text-xs text-muted">
        Chưa được cấp quyền truy cập? Liên hệ DNK House để được thêm vào dự án.
      </p>
    </main>
  );
}
```

- [ ] **Bước 3: Tạo `src/app/auth/callback/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/portal`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

- [ ] **Bước 4: Typecheck + build + lint**

```bash
npx tsc --noEmit; echo "tsc=$?"
npm run lint
npm run build
```

Kỳ vọng: sạch. Build hiện route `/login` (`○` hoặc `ƒ`) và `/auth/callback` (`ƒ`). Nếu `PageProps<"/login">` chưa có type (typed routes chưa generate) → chạy `npm run build` một lần để sinh `.next/types`, rồi `npx tsc --noEmit` lại.

- [ ] **Bước 5: Commit**

```bash
git add src/components/portal/LoginButton.tsx src/app/login/page.tsx src/app/auth/callback/route.ts
git commit -m "feat(portal): trang /login + đăng nhập Google + /auth/callback"
```

---

## Task 5: Portal shell — `layout.tsx`, `page.tsx`, `PendingNotice`

**Files:**
- Tạo mới: `src/components/portal/PendingNotice.tsx`
- Tạo mới: `src/app/portal/layout.tsx`
- Tạo mới: `src/app/portal/page.tsx`

**Interfaces:**
- Consumes: `getSessionProfile`, `requireClient` (`@/lib/portal/session`), `signOut` (`@/lib/portal/actions`).
- Cung cấp: route `/portal` (GET), layout bọc `/portal/*` (Slice 3–4 thêm page con).

- [ ] **Bước 1: Tạo `src/components/portal/PendingNotice.tsx`**

```tsx
export function PendingNotice() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        Tài khoản đang chờ DNK House duyệt
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Bạn đã đăng nhập thành công. DNK House sẽ liên kết tài khoản của bạn với
        dự án tương ứng trong thời gian sớm nhất. Nếu cần gấp, vui lòng liên hệ
        người phụ trách dự án của bạn tại DNK House.
      </p>
    </div>
  );
}
```

- [ ] **Bước 2: Tạo `src/app/portal/layout.tsx`**

```tsx
import { getSessionProfile } from "@/lib/portal/session";
import { signOut } from "@/lib/portal/actions";

export default async function PortalLayout({
  children,
}: LayoutProps<"/portal">) {
  // Chỉ để hiển thị tên trên thanh trên — KHÔNG phải auth check
  // (page tự gọi requireClient; layout không re-render khi điều hướng client-side).
  const profile = await getSessionProfile();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <span className="text-lg font-bold tracking-tight text-foreground">
            DNK <span className="text-accent">House</span>
          </span>
          <div className="flex items-center gap-4">
            {profile && (
              <span className="hidden text-sm text-muted sm:inline">
                {profile.fullName ?? profile.email}
              </span>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Bước 3: Tạo `src/app/portal/page.tsx`**

```tsx
import { requireClient } from "@/lib/portal/session";
import { PendingNotice } from "@/components/portal/PendingNotice";

export default async function PortalPage() {
  const access = await requireClient();

  if (access.status === "pending") {
    return <PendingNotice />;
  }

  const name = access.profile.fullName ?? access.profile.email;
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        Xin chào, {name}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Danh sách dự án của bạn sẽ hiển thị ở đây. Tính năng đang được hoàn thiện.
      </p>
    </div>
  );
}
```

- [ ] **Bước 4: Typecheck + build + lint**

```bash
npx tsc --noEmit; echo "tsc=$?"
npm run lint
npm run build
```

Kỳ vọng: sạch. Build hiện `/portal` là `ƒ (Dynamic)` (dùng cookies). `/` vẫn `○ (Static)`.

- [ ] **Bước 5: Kiểm tra thủ công bằng đăng nhập Google thật (nếu `.env.local` trỏ Supabase hosted có Google)**

```bash
npm run dev
```

- Mở `http://localhost:3000/portal` → bị đẩy về `/login`.
- Bấm "Đăng nhập với Google" → đăng nhập → về `/portal` → thấy "Tài khoản đang chờ DNK House duyệt".
- Vào Supabase Studio đổi `profiles.role` của mình thành `client` → refresh `/portal` → thấy "Xin chào, …".
- Bấm "Đăng xuất" → về `/login`.

(Nếu chỉ có Supabase local không Google: bỏ qua bước này, Task 7 E2E phủ luồng qua route test-login.)

- [ ] **Bước 6: Commit**

```bash
git add src/components/portal/PendingNotice.tsx src/app/portal/layout.tsx src/app/portal/page.tsx
git commit -m "feat(portal): portal shell — layout thanh trên, /portal lời chào + màn chờ duyệt"
```

---

## Task 6: Route test-login (E2E seam)

**Files:**
- Tạo mới: `src/app/auth/test-login/route.ts`

**Interfaces:**
- Consumes: `createClient` từ `@/lib/supabase/server`.
- Cung cấp: `GET /auth/test-login?email=<email>` — chỉ hoạt động khi `process.env.E2E_TEST_LOGIN === "1"`; đăng nhập user seed bằng mật khẩu cố định `portal-dev-123` và set cookie session; redirect `/portal`.

- [ ] **Bước 1: Tạo `src/app/auth/test-login/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cửa hậu CHỈ dùng cho test E2E. Trả 404 trừ khi E2E_TEST_LOGIN=1.
 * Đăng nhập user seed (Slice 1) bằng mật khẩu cố định để bỏ qua Google thật.
 */
export async function GET(request: Request) {
  if (process.env.E2E_TEST_LOGIN !== "1") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { searchParams, origin } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return new NextResponse("Thiếu tham số email", { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: "portal-dev-123",
  });
  if (error) {
    return new NextResponse(`Đăng nhập test thất bại: ${error.message}`, {
      status: 401,
    });
  }

  return NextResponse.redirect(`${origin}/portal`);
}
```

- [ ] **Bước 2: Xác minh route 404 khi biến chưa set**

```bash
npm run build && npm run start &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/auth/test-login?email=admin@dnkhouse.test
kill %1
```

Kỳ vọng: `404` (vì `E2E_TEST_LOGIN` chưa set).

- [ ] **Bước 3: Commit**

```bash
git add src/app/auth/test-login/route.ts
git commit -m "test(portal): route test-login cho E2E (404 nếu không bật E2E_TEST_LOGIN)"
```

---

## Task 7: Playwright config + E2E `auth.spec.ts`

**Files:**
- Tạo mới: `playwright.config.ts`
- Tạo mới: `tests/e2e/helpers.ts`
- Tạo mới: `tests/e2e/auth.spec.ts`

**Interfaces:**
- Consumes: route `/auth/test-login`, seed users (Slice 1), `.env.local`.
- Cung cấp: `loginAs(page, email)`.

- [ ] **Bước 1: Tạo `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      E2E_TEST_LOGIN: "1",
    },
  },
});
```

Ghi chú: `next start` tự nạp `.env.local` (3 biến Supabase). `env` ở đây chỉ bổ sung `E2E_TEST_LOGIN`. Supabase local phải đang chạy (`npx supabase start`) và đã `npx supabase db reset` để có user seed.

- [ ] **Bước 2: Cài browser cho Playwright**

```bash
npx playwright install chromium
```

- [ ] **Bước 3: Tạo `tests/e2e/helpers.ts`**

```ts
import type { Page } from "@playwright/test";

export const EMAILS = {
  clientA: "client-a@dnkhouse.test",
  pending: "pending@dnkhouse.test",
} as const;

/** Đăng nhập qua route test-login (bỏ qua Google). Kết thúc ở /portal. */
export async function loginAs(page: Page, email: string): Promise<void> {
  await page.goto(`/auth/test-login?email=${encodeURIComponent(email)}`);
  await page.waitForURL("**/portal");
}
```

- [ ] **Bước 4: Viết `tests/e2e/auth.spec.ts`**

```ts
import { expect, test } from "@playwright/test";
import { EMAILS, loginAs } from "./helpers";

test.describe("Auth + bảo vệ route (Slice 2)", () => {
  test("chưa đăng nhập: /portal -> chuyển về /login", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("button", { name: "Đăng nhập với Google" }),
    ).toBeVisible();
  });

  test("chưa đăng nhập: /portal/<id> -> chuyển về /login", async ({ page }) => {
    await page.goto("/portal/aaaaaaaa-0000-0000-0000-000000000001");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("user pending: thấy màn chờ duyệt, không thấy dữ liệu dự án", async ({
    page,
  }) => {
    await loginAs(page, EMAILS.pending);
    await expect(
      page.getByText("Tài khoản đang chờ DNK House duyệt"),
    ).toBeVisible();
    await expect(page.getByText("Xin chào")).toHaveCount(0);
  });

  test("đăng xuất: về /login và không vào lại /portal được", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    await expect(page.getByText("Xin chào")).toBeVisible();

    await page.getByRole("button", { name: "Đăng xuất" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/portal");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("đã đăng nhập: mở /login -> chuyển về /portal", async ({ page }) => {
    await loginAs(page, EMAILS.clientA);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/portal$/);
  });
});
```

- [ ] **Bước 5: Chạy E2E**

```bash
npx supabase db reset          # đảm bảo user seed sạch
npm run test:e2e
```

Kỳ vọng: 5 test xanh. Nếu `webServer` timeout do `npm run build` lâu, tăng `timeout` hoặc chạy `next start` từ bản build sẵn.

- [ ] **Bước 6: Verify toàn bộ**

```bash
npm run test                   # unit + integration vẫn xanh
npx tsc --noEmit; echo "tsc=$?"
npm run lint
npm run build
```

- [ ] **Bước 7: Commit**

```bash
git add playwright.config.ts tests/e2e/helpers.ts tests/e2e/auth.spec.ts
git commit -m "test(portal): E2E auth — redirect chưa đăng nhập, màn pending, đăng xuất"
```

---

## Task 8: Responsive + CLAUDE.md + xác minh hoàn thành slice

**Files:**
- Chỉnh sửa: `CLAUDE.md`

- [ ] **Bước 1: Kiểm tra responsive `/login` và `/portal`**

Dùng skill `browser-automation` (hoặc `npm run dev` + DevTools) chụp `/login` và `/portal` (đăng nhập client-a qua `/auth/test-login` khi chạy dev với `E2E_TEST_LOGIN=1`) ở 3 breakpoint:
- 375px: card `/login` không tràn, chữ đọc được; thanh trên `/portal` tên bị ẩn (`sm:inline`), nút Đăng xuất vẫn thấy.
- 768px: bố cục thoáng, card căn giữa.
- 1440px: nội dung `max-w-4xl` căn giữa, không kéo dài toàn màn.

Sửa class Tailwind nếu lệch. Không thêm token màu mới.

- [ ] **Bước 2: Cập nhật `CLAUDE.md`**

Thêm vào mục "Biến môi trường (client portal)" (tạo ở Slice 1):

```markdown
- `E2E_TEST_LOGIN` — đặt `1` **chỉ khi chạy Playwright**. Bật route `/auth/test-login?email=<email>`
  đăng nhập user seed bằng mật khẩu cố định (bỏ qua Google). Route trả 404 khi biến này khác `1`.
  `playwright.config.ts` tự set biến này cho webServer.
```

- [ ] **Bước 3: Chạy checklist xác minh của spec slice**

```bash
npx supabase db reset
npm run test        # unit (session, supabase-clients) + integration (rls) xanh
npm run test:e2e    # auth.spec.ts xanh
npx tsc --noEmit; echo "tsc=$?"   # 0
npm run lint         # sạch
npm run build        # xanh; / vẫn ○ Static; /portal là ƒ Dynamic
git status           # sạch; .env.local không xuất hiện
```

- [ ] **Bước 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(portal): CLAUDE.md — biến E2E_TEST_LOGIN"
```

- [ ] **Bước 5: Review slice** — dùng `superpowers:requesting-code-review` cho diff Slice 2.

---

## Tự Kiểm Tra Kế Hoạch (đã chạy)

**Bao phủ spec slice 2:**
- `login/page.tsx` (redirect nếu có session, `?error=auth`, style token) → Task 4 ✅
- `LoginButton.tsx` (`"use client"`, `signInWithOAuth` google, redirectTo `/auth/callback`) → Task 4 ✅
- `auth/callback/route.ts` (`exchangeCodeForSession` → `/portal`; lỗi → `/login?error=auth`) → Task 4 ✅
- `src/proxy.ts` (Next 16 Proxy, đọc cookie, redirect `/portal↔/login`, `updateSession`, matcher bỏ static) → Task 3 ✅
- `src/lib/portal/session.ts` (`getSessionProfile` bọc `React.cache`; `requireClient` trả `{profile, status:'ok'|'pending'}`; `null` → `redirect('/login')`) → Task 2 ✅
- `portal/layout.tsx` (thanh trên logo + tên + Đăng xuất; không auth check) → Task 5 ✅
- `portal/page.tsx` (`requireClient()`; `pending` → `PendingNotice`; ngược lại lời chào + ghi chú) → Task 5 ✅
- `PendingNotice.tsx` (Server Component) → Task 5 ✅
- `actions.ts` (`"use server"`, `signOut` → `signOut()` + `redirect('/login')`) → Task 3 ✅
- Unit `session.test.ts` (`requireClient`/`resolveClientAccess` với 4 role; map role → màn hình) → Task 2 ✅
- E2E `auth.spec.ts` (kịch bản 3, 4, 5 của 5.3) → Task 7 ✅
- Responsive 375/768/1440 → Task 8 ✅

**Placeholder:** không có. Mọi component + route có code đầy đủ.

**Nhất quán type:**
- `updateSession` return `{ response, isAuthenticated }` — định nghĩa Task 1, dùng Task 3.
- `SessionProfile { userId, email, fullName, role }`, `Role`, `resolveClientAccess`, `roleToScreen`, `requireClient` return `{ status: 'ok'|'pending'; profile }` — định nghĩa Task 2, dùng Task 5, Slice 3–4 tham chiếu.
- `signOut` — Task 3, dùng Task 5 (`<form action={signOut}>`).
- Mật khẩu seed `portal-dev-123` + email `client-a@ / pending@dnkhouse.test` + project id `aaaaaaaa-...0001` — khớp `supabase/seed.sql` của Slice 1.

**Sai lệch so với spec (có chủ đích, đã ghi rõ):**
- DAL dùng `supabase.auth.getUser()` (xác thực JWT) thay vì đọc "session" trực tiếp — theo khuyến nghị bảo mật của Supabase ("không tin `getSession()` trong code server"). Spec chỉ nói "đọc session phía server", không cấm.
- Unit test tập trung vào hàm thuần `resolveClientAccess`/`roleToScreen` (bao trọn logic phân nhánh spec liệt kê) thay vì mock toàn bộ Supabase query builder; luồng `requireClient` thực được E2E phủ.
- Thêm route `/auth/test-login` (ngoài danh sách file spec) làm seam cho E2E "đặt session/cookie trực tiếp" — an toàn vì 404 khi `E2E_TEST_LOGIN != 1`.
