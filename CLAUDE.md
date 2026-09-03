# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# DNK House — Company Website

Website giới thiệu các **dịch vụ AI** của DNK House. Mục tiêu: trang landing/marketing
tối giản, hiện đại, chuyên nghiệp, truyền tải rõ ràng năng lực AI và giá trị công ty
mang lại cho khách hàng doanh nghiệp.

## Commands

```bash
npm run dev      # Next dev server (http://localhost:3000)
npm run build    # production build — chạy trước khi coi là hoàn thành thay đổi lớn
npm run start    # chạy bản đã build
npm run lint     # ESLint (flat config: eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit # kiểm tra type (tsconfig strict, noEmit)
npm run test      # Vitest (unit + integration). Integration cần `npx supabase start` (Docker).
npm run test:e2e  # Playwright E2E (từ Slice 2). Cần Supabase local + app chạy.
```

Test: Vitest (`npm run test`) cho unit + integration RLS; Playwright (`npm run test:e2e`) cho E2E
(từ Slice 2). Integration/E2E cần Supabase local: `npx supabase start` (yêu cầu Docker Desktop).

## Architecture

Landing page tĩnh một trang, Next.js **16** App Router + React 19, Tailwind CSS **v4**.

- **`src/app/page.tsx`** — toàn bộ trang: ghép các section component theo thứ tự
  `Header → Hero → Services → ProblemSolving → Process → Partner → About → CtaBanner → Footer`.
  Đổi thứ tự trang = đổi thứ tự ở đây. (Lưu ý: cấu trúc thực tế đã lệch khỏi mục
  "Site Structure (dự kiến)" bên dưới — `page.tsx` là nguồn sự thật.)
- **`src/app/layout.tsx`** — root layout: font Inter qua `next/font` (biến
  `--font-inter`), `<html lang="vi">`, body dùng token `bg-background text-foreground`,
  `metadata` (title/description). Dùng type `LayoutProps<"/">` của Next 16 (typed routes).
- **`src/app/globals.css`** — **nguồn duy nhất của bảng màu/typography**. Token màu
  là CSS var trong `:root` (`--background`, `--surface`, `--foreground`, `--muted`,
  `--accent`, `--accent-foreground`, `--border`), map sang Tailwind qua `@theme inline`.
  Tailwind v4 không có `tailwind.config.*` — đổi màu/font phải sửa file này, không
  hardcode hex trong class component. Class dùng: `bg-accent`, `text-muted`,
  `border-border`...
- **`src/components/ScrollReveal.tsx`** — wrapper scroll-reveal **duy nhất** toàn
  site (framer-motion `whileInView`, `opacity 0 → 1` + `y 20 → 0`, `once: true`,
  `viewport margin -80px`, `duration 0.5`, prop `delay` để stagger, prop `className`).
  Mọi section bọc nội dung trong component này. **Không** thêm kỹ thuật animation
  khác (IntersectionObserver thủ công, CSS-only, parallax...).
- **Section components** (`src/components/*.tsx`) — mặc định là Server Component;
  chỉ `Header.tsx` (menu mobile, `useState`) và `ScrollReveal.tsx` có `"use client"`.
  Nội dung (danh sách dịch vụ, nav link, bước quy trình...) là mảng `const` khai báo
  ngay đầu mỗi file component — không có data layer / CMS. Sửa nội dung = sửa trực
  tiếp trong component.
- **Anchor IDs** — nav trong `Header.tsx` (`NAV_LINKS`) trỏ tới `#dich-vu` (Services),
  `#quy-trinh` (Process), `#ve-chung-toi` (About), `#lien-he` (liên hệ). Khi đổi
  `id` của section phải cập nhật `NAV_LINKS` cho khớp.
- **Path alias** — `@/*` → `src/*`.
- **Ảnh reference** `weav.com_*.png` nằm ở **repo root** (không phải `public/`);
  asset thật của site đặt trong `public/`.

## Quy tắc bắt buộc

- **So sánh với design gốc:** sau mỗi thay đổi UI lớn (thêm/sửa section, đổi layout,
  đổi màu/typography), chụp screenshot trang (desktop + mobile) và so sánh với ảnh
  design gốc (`weav.com_.png`, `weav.com_goc.png` cho pattern cấu trúc, hoặc mockup
  chính thức của DNK House nếu có) trước khi coi là hoàn thành. Dùng skill/agent trình
  duyệt sẵn có để chụp và kiểm tra, không tự nhận đã xong nếu chưa xem qua ảnh chụp.
- **Full-page screenshot phải cuộn qua trang trước khi chụp:** mọi section dùng
  scroll-reveal animation (opacity 0 ban đầu) — chụp full-page ngay lập tức sẽ ra ảnh
  trắng/mờ sai sự thật. Luôn cuộn qua hết chiều cao trang (hoặc dùng script cuộn từng
  đoạn + đợi) trước khi chụp để đánh giá đúng.
- **Mobile-friendly bắt buộc:** mọi section phải responsive đúng ở 3 breakpoint tối
  thiểu — mobile (375px), tablet (768px), desktop (1440px). Không merge/coi là xong
  một tính năng UI nếu chưa kiểm tra trên mobile.
- **Animation khi scroll bắt buộc:** mọi section (trừ header cố định) phải có hiệu
  ứng xuất hiện khi scroll vào viewport (fade-in/slide-in nhẹ). Dùng một cách triển
  khai nhất quán toàn site (ví dụ: `framer-motion` với `whileInView`, hoặc
  IntersectionObserver + CSS transition) — không trộn nhiều kỹ thuật animation khác
  nhau trong cùng một site.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Deploy:** Vercel (mặc định giả định — đổi nếu dùng nền tảng khác)
- **Fonts:** load qua `next/font` (không dùng CDN ngoài để tránh layout shift)
- **Icons:** lucide-react (nhẹ, style outline nhất quán với thẩm mỹ tối giản)
- **Animation:** framer-motion (`whileInView`) cho mọi scroll-reveal, dùng chung 1
  component wrapper (`ScrollReveal`) để nhất quán toàn site

## Design Reference

Ảnh tham khảo phong cách: `weav.com_.png`, `weav.com_goc.png` (screenshot trang chủ
weav.com — công ty AI customer service thật, dùng làm reference thiết kế/cấu trúc).

Những gì lấy cảm hứng từ reference (về **cấu trúc & pattern**, không phải màu sắc):

- Bố cục xen kẽ theo section, mỗi section một thông điệp/tính năng duy nhất, nhiều
  khoảng trắng, không nhồi nhét.
- Hệ chữ lớn, đậm, tự tin ở headline (48–72px desktop), phần mô tả nhỏ và nhẹ hơn
  nhiều để tạo tương phản rõ.
- Nút CTA dạng pill (bo tròn hoàn toàn, `rounded-full`), có 1 nút primary (nền đặc)
  và 1 nút secondary (outline/ghost) đi cạnh nhau.
- Card/mockup UI (dashboard, trạng thái tiến độ, chat...) đặt trong khung bo góc lớn,
  đổ bóng nhẹ, có thể có badge/số liệu nổi (floating card) cạnh card chính để tăng
  sức nặng thị giác cho hero — minh hoạ dịch vụ bằng hình thay vì chỉ dùng text.
- Section theo công thức "vấn đề → cách giải quyết khác biệt" với card bằng chứng
  trực quan (progress bar, checklist, trạng thái) đặt cạnh phần text.
- Section pricing/CTA cuối trang rõ ràng, tách biệt hẳn (đổi nền, thường là màu
  accent đậm) trước footer.
- Dải tagline khép lại (ví dụ "Bạn đã thấy cách chúng tôi làm việc...") ngay trên
  copyright bar, kèm 1 CTA cuối cùng.
- Footer nhiều cột, gọn, chia nhóm liên kết rõ ràng.

Những gì **KHÔNG** lấy theo (vì yêu cầu là tối giản/chuyên nghiệp, khác với weav
vốn dùng màu sắc rực rỡ, hoạ tiết sóng lặp lại, phong cách hơi playful):

- Không dùng block màu xanh dương/hồng chói lặp lại toàn trang.
- Không dùng hoạ tiết trang trí (zigzag/wave pattern) làm chia section.
- Không lạm dụng màu nền tương phản mạnh giữa các section liên tiếp.
- Không dùng dải logo khách hàng/đối tác nếu không có logo thật — thêm logo giả để
  tạo "trust signal" là nội dung sai sự thật, không dùng dù reference có mục này.
- Không dùng mockup UI/screenshot giả mạo trông như sản phẩm thật đã hoàn thiện nếu
  chưa có sản phẩm/asset thật — ưu tiên card trừu tượng (số liệu, trạng thái, progress
  bar) rõ ràng là minh hoạ, không phải ảnh chụp sản phẩm giả.

## Về nội dung: DNK House ≠ weav.com

weav.com là công ty AI customer service **thật, không liên quan đến DNK House**.
File này và ảnh `weav.com_*.png` chỉ được dùng làm **tham khảo thiết kế/cấu trúc**.
Vì DNK House cũng làm dịch vụ AI (cùng lĩnh vực với weav), rủi ro "vô tình" viết lại
gần giống nội dung thật của weav là cao hơn bình thường — cần đặc biệt chú ý:

- Không copy nguyên văn câu chữ, tên tính năng, hay value proposition cụ thể của weav
  (vd: không dùng lại các tên như "Ask Weav", "Inbox", câu "Master of your tone,
  partner to your team"...).
- Chỉ mượn **công thức cấu trúc câu** (headline nêu nỗi đau → giải pháp, feature grid
  ngắn gọn, section "vấn đề → cách giải quyết khác biệt"...), viết lại hoàn toàn bằng
  nội dung và ngôn từ của DNK House.
- Danh sách dịch vụ AI cụ thể, số liệu, tên tính năng phải lấy từ thông tin thật của
  DNK House — hiện tại là placeholder, xem mục Content Template bên dưới.

## Visual Style — DNK House

- **Bảng màu:** nền trung tính (trắng / xám rất nhạt, ví dụ `#FAFAFA`, `#F5F5F5`),
  chữ chính gần đen (`#111111`–`#1A1A1A`), một màu accent duy nhất cho CTA/highlight
  (mặc định: xanh navy đậm `#14213D` — xác nhận với brand color thật của DNK House
  nếu có). Tránh dùng quá 2 màu ngoài neutral trên cùng một section.
- **Typography:** một font sans-serif hiện đại (Inter, Geist, hoặc tương đương) cho
  toàn bộ site. Heading: đậm (600–700), tracking hơi âm ở size lớn (đặc biệt hero,
  có thể dùng `tracking-tighter` + `text-6xl`–`text-7xl` để tạo sức nặng như reference).
  Body: 400, line-height rộng (1.6+) để dễ đọc.
- **Spacing:** dùng thang spacing nhất quán của Tailwind (4/8px base). Section
  padding tối thiểu `py-20`–`py-28` desktop, `py-16` mobile. Đừng để section nào chật.
- **Bo góc:** nhất quán một mức bo góc cho card/button trong toàn site — pill/
  `rounded-full` cho button, `rounded-2xl`/`rounded-3xl` cho card lớn. Giữ nhất quán,
  không trộn lẫn với bo góc nhỏ `rounded-lg`.
- **Ảnh/mockup:** ưu tiên screenshot thật của sản phẩm/dashboard AI khi có. Chưa có
  asset thật thì dùng card trừu tượng (số liệu, trạng thái, progress bar, icon) rõ
  ràng là minh hoạ — không dựng ảnh giả tạo cảm giác "đã hoàn thiện".
- **Chuyển động:** mọi section đều có animation khi scroll vào view (xem [Quy tắc
  bắt buộc](#quy-tắc-bắt-buộc)), nhưng giữ subtle — fade/slide nhẹ (translate 16–24px,
  duration 400–600ms), không dùng hiệu ứng phô trương, bounce, hay parallax mạnh.

## Site Structure (dự kiến)

- Header: logo + nav (Dịch vụ / Quy trình / Về chúng tôi / Liên hệ) + 1 CTA button,
  sticky, có menu mobile dạng hamburger
- Hero: badge nhỏ + headline lớn + subheadline + 2 CTA (primary + secondary) + card
  mockup AI (dashboard/trạng thái) có floating badge số liệu bên cạnh
- Sections dịch vụ AI: feature grid ngắn (mỗi dịch vụ = icon + tên + 1 câu mô tả)
- Section "vấn đề → giải pháp khác biệt": layout xen kẽ text/card bằng chứng trực
  quan, đảo chiều với section dịch vụ để tránh đơn điệu
- Section quy trình làm việc (các bước triển khai)
- Section đồng hành dài hạn / testimonial (dùng placeholder rõ ràng nếu chưa có
  phản hồi khách hàng thật)
- Section giới thiệu công ty (Về chúng tôi) + số liệu (đánh dấu rõ nếu là placeholder)
- CTA banner cuối trang (nền accent đậm, liên hệ tư vấn)
- Footer: nhiều cột liên kết + dải tagline khép lại + copyright

Điều chỉnh cấu trúc này khi biết rõ hơn danh sách dịch vụ AI cụ thể của DNK House.

## Content Template (mẫu placeholder, dựa theo cấu trúc copy của weav.com)

Nhắc lại: viết lại hoàn toàn bằng lời văn của DNK House, KHÔNG copy nguyên văn nội
dung của weav (xem mục [Về nội dung: DNK House ≠ weav.com](#về-nội-dung-dnk-house-≠-weavcom)
ở trên). Thay các mục `[...]` bằng thông tin thật trước khi lên site.

**Hero**
- Headline (công thức: [Giải pháp AI] + [ngành/đối tượng]): `[Giải pháp AI chính] cho [đối tượng khách hàng]`
- Subheadline (công thức: nêu nỗi đau → giải pháp AI): `Bạn không lập ra công ty chỉ để [công việc lặp lại, tốn thời gian mà AI có thể làm thay].`
- Mô tả ngắn (công thức: cách hoạt động + kết quả đo được + thời gian setup): `DNK House giúp [đối tượng] [tự động hoá/giải quyết vấn đề cụ thể bằng AI], [con số/kết quả ấn tượng nếu có], sẵn sàng sử dụng chỉ trong [thời gian].`
- 2 CTA: nút primary hành động chính (`Liên hệ tư vấn` / `Bắt đầu`), nút secondary ít cam kết hơn (`Xem dịch vụ` / `Xem demo`)

**Feature grid (mỗi dịch vụ AI = icon + tên + 1 câu mô tả lợi ích)**
- `[Dịch vụ AI 1]` — [lợi ích chính trong 1 câu]
- `[Dịch vụ AI 2]` — [lợi ích chính trong 1 câu]
- `[Dịch vụ AI 3]` — [lợi ích chính trong 1 câu]
- (thêm/bớt theo số dịch vụ AI thật của DNK House — không cần cố định số lượng)

**Section theo công thức "vấn đề → cách giải quyết khác biệt"**
- Title: `[Giải quyết đúng vấn đề bằng AI], không chỉ [giải pháp tự động hời hợt]`
- Description: nêu cách tiếp cận AI của DNK House khác gì so với đối thủ/cách làm thủ công cũ
- Card bằng chứng trực quan đi kèm: progress/trạng thái triển khai, hoặc checklist năng lực

**Section quy trình làm việc**
- Title: `Quy trình triển khai AI rõ ràng, minh bạch`
- Các bước gợi ý: Tìm hiểu bài toán → Đề xuất giải pháp AI → Triển khai & tích hợp → Đồng hành & tối ưu

**Section đồng hành dài hạn**
- Title: `[Đối tác AI đồng hành] cùng [đối tượng khách hàng]`
- Nếu có testimonial thật, dùng trích dẫn thật; nếu chưa có, giữ nguyên placeholder `[Trích dẫn phản hồi thật...]` — không tự bịa lời khách hàng

**Value proposition ngắn (dùng làm câu nhấn giữa trang hoặc trong hero)**
- `Đối tác AI đáng tin cậy, chuẩn mực chuyên nghiệp`
- `[Điểm khác biệt cốt lõi của DNK House trong một câu]`

**Footer — nhóm liên kết**
- *Dịch vụ:* liệt kê từng dịch vụ AI chính của DNK House (link tới từng section tương ứng)
- *Công ty:* Về chúng tôi, Quy trình làm việc, Liên hệ
- *Pháp lý:* Chính sách bảo mật, Điều khoản dịch vụ
- Dải tagline khép lại phía trên copyright: `Bạn đã thấy cách chúng tôi làm việc. Giờ hãy để DNK House bắt tay vào việc.` + CTA liên hệ

**CTA banner cuối trang**
- Title: `Sẵn sàng bắt đầu cùng DNK House?`
- Mô tả: cam kết thời gian phản hồi cụ thể (vd: trong 24 giờ làm việc) + kênh liên hệ thật (email/điện thoại)

> Cần thông tin thật về DNK House (danh sách dịch vụ AI, đối tượng khách hàng, điểm
> khác biệt, thông tin liên hệ, số liệu thật nếu có) để thay thế toàn bộ placeholder
> `[...]` ở trên trước khi viết content thật cho site.

## Content Language

Nội dung site mặc định bằng **tiếng Việt** (theo ngôn ngữ trao đổi của user). Nếu
cần bản tiếng Anh song song, hỏi rõ trước khi build i18n thay vì tự ý thêm.

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


**Tổng kết toàn phiên: Giai đoạn 1 (client portal đăng nhập Google — 4 slice, 33 commit tính năng) đã hoàn tất, review sạch qua từng task lẫn tổng thể, và đã merge vào main cục bộ (37 commit vượt trước origin/main, chưa push). Trước khi deploy thật, còn 3 việc cần bạn tự làm: cấu hình Google OAuth thật trên Supabase hosted + biến môi trường Vercel, không bao giờ đặt E2E_TEST_LOGIN=1 ở production, và cấp role='admin' + nhập dữ liệu dự án đầu tiên qua Supabase Studio.


## Biến môi trường (client portal)

Xem `.env.local.example`. Ba biến Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — công khai, dùng cả client lẫn server.
- `SUPABASE_SERVICE_ROLE_KEY` — **chỉ server** (seed test, thao tác admin). Không import vào code chạy ở trình duyệt.
- `E2E_TEST_LOGIN` — đặt `1` **chỉ khi chạy Playwright**. Bật route `/auth/test-login?email=<email>`
  đăng nhập user seed bằng mật khẩu cố định (bỏ qua Google). Route trả 404 khi biến này khác `1`.
  `playwright.config.ts` tự set biến này cho webServer.

> **CẢNH BÁO BẢO MẬT — `E2E_TEST_LOGIN` chỉ có ĐÚNG MỘT lớp bảo vệ:** route
> `/auth/test-login` (`src/app/auth/test-login/route.ts`) chỉ kiểm tra
> `process.env.E2E_TEST_LOGIN === "1"`. Route này **KHÔNG** kiểm tra thêm
> `NODE_ENV` — và **không thể** dựa vào `NODE_ENV` để phân biệt "test E2E chạy
> local" với "production thật", vì `next start` (kể cả khi build để chạy E2E
> cục bộ, xem `webServer.command` trong `playwright.config.ts`) tự đặt
> `NODE_ENV=production` — đã kiểm chứng thực nghiệm, không phải giả định. Do
> đó **TUYỆT ĐỐI KHÔNG được đặt biến `E2E_TEST_LOGIN=1` trong Vercel Project
> Settings hay bất kỳ môi trường production/staging thật nào**. Nếu bị đặt
> nhầm: bất kỳ ai biết email của một khách hàng (email không phải bí mật) đều
> có thể tự đăng nhập giả làm khách hàng đó, vì mật khẩu dùng để bỏ qua Google
> là **cố định và công khai trong code** (`portal-dev-123`) — chiếm được toàn
> bộ phiên của khách hàng mà không cần mật khẩu Google thật của họ.

Dev local: `npx supabase start` rồi copy 3 giá trị (`npx supabase status`) vào `.env.local`.
Migrations + seed: `npx supabase db reset`.

## Trạng thái triển khai — Giai đoạn 1 (Client Portal)

**Cập nhật lần cuối: 2026-09-03.** Giai đoạn 1 (đăng nhập Google + dashboard khách
hàng, xem [Portal (client portal)](#portal-client-portal) ở trên) đã **hoàn tất cả
4 slice**, đã merge cục bộ vào `main` (37 commit), **chưa push lên `origin/main`**.
Thực thi qua skill `subagent-driven-development`: mỗi task một subagent riêng, review
tách biệt (tuân thủ spec + chất lượng) sau mỗi task, review tổng thể cuối mỗi slice.

### Trạng thái từng phần

| Phần | Trạng thái | Ghi chú |
|------|-----------|---------|
| Slice 1 — Hạ tầng Supabase (schema, RLS, seed, client Next) | ✅ Xong, đã merge | 8 task, 1 vòng vá lỗi (seed thiếu cột token) |
| Slice 2 — Đăng nhập/đăng xuất Google + bảo vệ route | ✅ Xong, đã merge | 8 task. **Luồng Google OAuth thật CHƯA từng chạy** — máy dev chỉ có Supabase local, không có Google provider thật |
| Slice 3 — Dashboard danh sách dự án | ✅ Xong, đã merge | 6 task. 1 regression liên-slice được phát hiện + vá (đổi UI làm vỡ test Slice 2) |
| Slice 4 — Chi tiết dự án (milestone + nhật ký) | ✅ Xong, đã merge | 7 task. Đã kiểm chứng độc lập qua curl thật: không rò rỉ dữ liệu chéo giữa khách hàng |
| Merge vào `main` | ✅ Xong (cục bộ) | Test xanh trên kết quả merge: 34/34 unit+integration, 15/15 E2E, `tsc`/`lint`/`build` sạch |
| Push lên `origin/main` | ⬜ Chưa làm | Quyết định của người dùng — chờ cấu hình Google OAuth thật trước |
| Giai đoạn 2 (`/portal/admin`) | ⬜ Chưa bắt đầu | Cần spec riêng — xem mục "Bước tiếp theo" |

### Bước tiếp theo

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

### Quyết định quan trọng đã đưa ra (và lý do)

- **`E2E_TEST_LOGIN` KHÔNG có lớp bảo vệ `NODE_ENV` đi kèm** — dù đây là cửa hậu
  đăng nhập bỏ qua Google. Lý do: `next start` (kể cả khi build để chạy E2E cục bộ
  qua `playwright.config.ts` `webServer`) tự đặt `NODE_ENV=production` khi biến này
  chưa được set từ trước — đã kiểm chứng thực nghiệm bằng cách đọc
  `node_modules/next/dist/bin/next`. Thêm điều kiện `NODE_ENV !== "production"` sẽ
  khiến route luôn 404 ngay cả khi chạy E2E hợp lệ, tự phá vỡ toàn bộ chiến lược
  test (test trên production build thật, không phải `next dev`). Biện pháp bảo vệ
  thực sự là kỷ luật vận hành — xem cảnh báo ở mục "Biến môi trường" phía trên —
  không phải code.
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

## Conventions

- Component nhỏ, đặt trong `src/components/`, đặt tên theo PascalCase.
- Mỗi section lớn của trang là 1 component riêng (`Hero.tsx`, `Services.tsx`,
  `Process.tsx`, `CtaBanner.tsx`, `Footer.tsx`...) để dễ sắp xếp lại thứ tự trên
  trang chính.
- Không tạo abstraction/config thừa cho một site tĩnh nhỏ — ưu tiên đơn giản, dễ sửa
  nội dung trực tiếp trong component hơn là hệ thống CMS phức tạp, trừ khi được yêu cầu.
- Ảnh đặt trong `public/`, đặt tên mô tả rõ nội dung (không giữ tên file gốc dạng
  `weav.com_...`).
- Responsive-first: kiểm tra mobile (375px), tablet (768px), desktop (1440px) cho
  mỗi section trước khi coi là hoàn thành.
- Số liệu/thống kê chưa xác nhận thật (vd: "50+ dự án", "98% hài lòng") phải đánh dấu
  `// TODO: placeholder` trong code — không được để ngầm hiểu là số liệu thật.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
