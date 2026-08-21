# DNK House — Company Website

Website giới thiệu các **dịch vụ AI** của DNK House. Mục tiêu: trang landing/marketing
tối giản, hiện đại, chuyên nghiệp, truyền tải rõ ràng năng lực AI và giá trị công ty
mang lại cho khách hàng doanh nghiệp.

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
