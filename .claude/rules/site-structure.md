---
paths:
  - "src/app/page.tsx"
  - "src/components/**"
---

# Site Structure (dự kiến)

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

> **Lưu ý:** đây là cấu trúc dự kiến ban đầu, cấu trúc thực tế trong
> `src/app/page.tsx` đã lệch khỏi danh sách trên — xem [[architecture]], `page.tsx`
> là nguồn sự thật cho thứ tự section hiện tại.
