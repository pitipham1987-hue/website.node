---
paths:
  - "src/components/**"
  - "src/app/**"
---

# Visual Style — DNK House

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
- **Chuyển động:** mọi section đều có animation khi scroll vào view (xem
  [[mandatory-ui-checks]]), nhưng giữ subtle — fade/slide nhẹ (translate 16–24px,
  duration 400–600ms), không dùng hiệu ứng phô trương, bounce, hay parallax mạnh.

Nguồn màu/typography thực tế trong code là `src/app/globals.css` (CSS var) — xem
[[architecture]]. File này mô tả chủ đích thiết kế, không phải nguồn giá trị.
