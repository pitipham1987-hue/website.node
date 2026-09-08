# Biến môi trường (client portal) — Bảo mật

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
> đó **TUYỆT ĐỐI KHÔNG được đặt biến `E2E_TEST_LOGIN=1` ở bất kỳ môi trường
> production/staging thật nào** (dashboard biến môi trường của nền tảng deploy,
> `.env` trên server, v.v.). Hiện site chỉ chạy local nên rủi ro thấp, nhưng giữ
> nguyên tắc này để sau này deploy không vấp. Nếu bị đặt
> nhầm: bất kỳ ai biết email của một khách hàng (email không phải bí mật) đều
> có thể tự đăng nhập giả làm khách hàng đó, vì mật khẩu dùng để bỏ qua Google
> là **cố định và công khai trong code** (`portal-dev-123`) — chiếm được toàn
> bộ phiên của khách hàng mà không cần mật khẩu Google thật của họ.

Dev local (test integration/E2E): `npx supabase start` rồi copy 3 giá trị (`npx supabase status`) vào `.env.local`.
Migrations + seed: `npx supabase db reset`.

Supabase hosted (chạy Google OAuth thật khi dev): project `obcfgqkaokghxgauomxo`
(`ap-northeast-1`). Lấy URL + anon key + service key ở Studio → Project Settings →
API, điền vào `.env.local`. Schema đẩy bằng `npx supabase db push --db-url "<session
pooler URI>"` (không cần `supabase login`); **không** đẩy `seed.sql` lên hosted.
`.env.local` chỉ trỏ được 1 nơi — đổi qua lại giữa local/hosted tuỳ việc đang làm.

Kiến trúc portal liên quan: xem [[portal-architecture]]. Lý do đầy đủ vì sao route
này không thêm điều kiện `NODE_ENV !== "production"` (đã kiểm chứng thực nghiệm,
không phải giả định) nằm trong mục "Quyết định quan trọng đã đưa ra" ở
[[project-status]].
