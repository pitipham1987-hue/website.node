---
name: systematic-debugging
description: Sử dụng khi gặp bất kỳ bug, lỗi test, hoặc hành vi không kỳ vọng nào, trước khi đề xuất bất kỳ giải pháp sửa chữa nào
---

# Gỡ Lỗi Có Hệ Thống (Systematic Debugging)

## Tổng Quan

**Nguyên tắc cốt lõi:** LUÔN LUÔN tìm nguyên nhân gốc rễ (root cause) trước khi cố gắng sửa chữa. Sửa triệu chứng là thất bại.

**Vi phạm từng chữ của quy trình này là vi phạm tinh thần gỡ lỗi.**

## Luật Thép (The Iron Law)

```
KHÔNG SỬA LỖI KHI CHƯA ĐIỀU TRA NGUYÊN NHÂN GỐC RỄ TRƯỚC
```

Nếu bạn chưa hoàn thành Giai đoạn 1, bạn không thể đề xuất phương án sửa chữa.

## Khi Nào Sử Dụng

Sử dụng cho BẤT KỲ vấn đề kỹ thuật nào:
- Test bị thất bại
- Bug trên sản phẩm (production)
- Hành vi không như kỳ vọng
- Vấn đề về hiệu năng
- Lỗi build
- Lỗi tích hợp (integration)

**Sử dụng ĐẶC BIỆT khi:**
- Đang bị áp lực thời gian (tình huống khẩn cấp dễ khiến đoán mò)
- "Chỉ một bản sửa nhanh" có vẻ rõ ràng
- Bạn đã thử nhiều cách sửa trước đó
- Bản sửa lỗi trước đó không hoạt động
- Bạn chưa hiểu đầy đủ về vấn đề

## 4 Giai Đoạn

Bạn BẮT BUỘC phải hoàn thành từng giai đoạn trước khi chuyển sang giai đoạn tiếp theo.

### Giai Đoạn 1: Điều Tra Nguyên Nhân Gốc Rễ

**TRƯỚC KHI thử BẤT KỲ bản sửa lỗi nào:**

1. **Đọc Kỹ Các Thông Báo Lỗi**
   - Đừng lướt qua các lỗi hoặc cảnh báo
   - Chúng thường chứa giải pháp chính xác
   - Đọc stack trace đầy đủ
   - Ghi nhận số dòng, đường dẫn file, mã lỗi

2. **Tái Hiện Một Cách Nhất Quán**
   - Bạn có thể kích hoạt lỗi một cách tin cậy không?
   - Các bước chính xác là gì?
   - Nó có xảy ra mọi lúc không?
   - Nếu không tái hiện được → thu thập thêm dữ liệu, đừng đoán mò

3. **Kiểm Tra Các Thay Đổi Gần Đây**
   - Điều gì đã thay đổi có thể gây ra lỗi này?
   - Git diff, các commit gần đây
   - Dependency mới, thay đổi cấu hình
   - Khác biệt về môi trường

4. **Thu Thập Bằng Chứng Trong Hệ Thống Nhiều Component**
   - Thêm log kiểm chứng tại các ranh giới component để xác định CHÍNH XÁC nơi bị hỏng.

5. **Truy Vết Luồng Dữ Liệu (Trace Data Flow)**
   - Xem `root-cause-tracing.md` trong thư mục này để biết kỹ thuật truy vết ngược đầy đủ.

### Giai Đoạn 2: Phân Tích Pattern

1. **Tìm Các Ví Dụ Hoạt Động (Working Examples)**
   - Tìm code tương tự đang chạy tốt trong cùng codebase.
2. **So Sánh Với Tài Liệu Tham Chiếu**
3. **Xác Định Điểm Khác Biệt**

### Giai Đoạn 3: Giả Thuyết Và Kiểm Thử

1. **Tạo Một Giả Thuyết Duy Nhất** ("Tôi nghĩ X là nguyên nhân gốc rễ vì Y")
2. **Kiểm Thử Tối Thiểu** (thay đổi NHỎ NHẤT có thể)
3. **Xác Minh Trước Khi Tiếp Tục**

### Giai Đoạn 4: Triển Khai Thực Thi

1. **Tạo Test Case Thất Bại** (Sử dụng skill `superpowers:test-driven-development`)
2. **Triển Khai Sửa Lỗi Duy Nhất**
3. **Xác Minh Bản Sửa Lỗi** (Sử dụng skill `superpowers:verification-before-completion`)
4. **Nếu Bản Sửa Lỗi Không Hoạt Động:**
   - DỪNG LẠI
   - Nếu đã thử ≥ 3 lần sửa thất bại: **DỪNG LẠI và đặt câu hỏi về mặt Kiến trúc**
