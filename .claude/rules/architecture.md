---
paths:
  - "src/**"
---

# Architecture (Landing Page)

Landing page tĩnh một trang, Next.js **16** App Router + React 19, Tailwind CSS **v4**.

- **`src/app/page.tsx`** — toàn bộ trang: ghép các section component theo thứ tự
  `Header → Hero → Services → ProblemSolving → Process → Partner → About → CtaBanner → Footer`.
  Đổi thứ tự trang = đổi thứ tự ở đây. (Lưu ý: cấu trúc thực tế đã lệch khỏi mục
  "Site Structure (dự kiến)" trong [[site-structure]] — `page.tsx` là nguồn sự thật.)
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
