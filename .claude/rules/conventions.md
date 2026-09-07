---
paths:
  - "src/**"
---

# Conventions

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
