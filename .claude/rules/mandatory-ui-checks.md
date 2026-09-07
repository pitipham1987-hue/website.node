---
paths:
  - "src/app/**"
  - "src/components/**"
---

# Quy tắc bắt buộc (UI)

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
  nhau trong cùng một site. Xem cơ chế cụ thể ở [[architecture]] (`ScrollReveal.tsx`).
