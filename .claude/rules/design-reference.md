---
paths:
  - "src/components/**"
---

# Design Reference

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
