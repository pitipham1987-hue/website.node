# Thực Hành Tốt Nhất Khi Viết Skill (Skill Authoring Best Practices)

> Học cách viết các Skill hiệu quả mà agent có thể dễ dàng khám phá và sử dụng thành công.

Các Skill tốt cần súc tích, cấu trúc tốt và được kiểm thử qua thực tế. Hướng dẫn này cung cấp các quyết định thực hành giúp bạn viết các Skill mà agent có thể tìm thấy và áp dụng hiệu quả.

## Các Nguyên Tắc Cốt Lõi

### Súc Tích Là Thẻ Bài Quyết Định (Concise is Key)

Cửa sổ ngữ cảnh (Context Window) là của chung. Skill của bạn chia sẻ cửa sổ ngữ cảnh với mọi thứ mà agent cần biết, bao gồm:
* System prompt
* Lịch sử hội thoại
* Metadata của các Skill khác
* Yêu cầu thực tế của bạn

**Giả định mặc định**: Các agent vốn đã rất thông minh.

Chỉ thêm ngữ cảnh mà agent chưa có. Hãy tự hỏi từng phần thông tin:
* "Agent có thực sự cần lời giải thích này không?"
* "Tôi có thể giả định rằng agent đã biết điều này không?"
* "Đoạn văn này có xứng đáng với chi phí token của nó không?"

### Đặt Độ Tự Do Phù Hợp (Set Appropriate Degrees of Freedom)

Khớp mức độ cụ thể với độ nhạy cảm và tính biến động của nhiệm vụ:
* **Tự do cao** (hướng dẫn bằng văn bản): Nhiều phương án tiếp cận đều hợp lý.
* **Tự do trung bình** (pseudocode hoặc script có tham số): Có pattern ưu tiên.
* **Tự do thấp** (script cụ thể, ít hoặc không có tham số): Thao tác nhạy cảm, dễ lỗi, tính nhất quán là tối quan trọng.

## Cấu Trúc Skill (Skill Structure)

* `name` - Tên Skill readable cho con người (tối đa 64 ký tự)
* `description` - Mô tả 1 dòng về những gì Skill làm và KHI NÀO SỬ DỤNG (tối đa 1024 ký tự)

### Mô Tả Hiệu Quả (Writing Effective Descriptions)

Luôn viết ở ngôi thứ ba. Trường description được chèn vào system prompt để agent phát hiện skill:
* **Tốt:** "Processes Excel files and generates reports"
* **Nên tránh:** "I can help you process Excel files"
* **Nên tránh:** "You can use this to process Excel files"
