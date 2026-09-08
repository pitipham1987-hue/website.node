# Commands & Tech Stack

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

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Deploy:** chưa deploy — site chỉ chạy local (`npm run dev`, hoặc `npm run build` + `npm run start`). Khi nào cần đưa lên internet thì chọn nền tảng sau; toàn bộ cấu hình hiện nằm trong `.env.local`, không phụ thuộc nền tảng host nào
- **Fonts:** load qua `next/font` (không dùng CDN ngoài để tránh layout shift)
- **Icons:** lucide-react (nhẹ, style outline nhất quán với thẩm mỹ tối giản)
- **Animation:** framer-motion (`whileInView`) cho mọi scroll-reveal, dùng chung 1
  component wrapper (`ScrollReveal`) để nhất quán toàn site
