---
name: receiving-code-review
description: Sử dụng khi nhận được phản hồi code review, trước khi triển khai các gợi ý, đặc biệt nếu phản hồi có vẻ chưa rõ ràng hoặc đáng nghi ngại về mặt kỹ thuật — đòi hỏi sự nghiêm túc kỹ thuật và sự xác minh, không đồng ý hình thức hay triển khai mù quáng
---

# Tiếp Nhận Phản Hồi Code Review (Code Review Reception)

## Tổng Quan

Code review đòi hỏi việc đánh giá kỹ thuật, không phải là một màn trình diễn cảm xúc.

**Nguyên tắc cốt lõi:** Xác minh trước khi triển khai. Hỏi trước khi giả định. Tính đúng đắn kỹ thuật trên hết.

## Mẫu Phản Hồi (Response Pattern)

```
KHI nhận được phản hồi code review:

1. ĐỌC: Đọc toàn bộ phản hồi mà không phản ứng vội
2. THẤU HIỂU: Diễn đạt lại yêu cầu theo cách hiểu của mình (hoặc hỏi lại)
3. XÁC MINH: Kiểm tra lại với thực tế codebase
4. ĐÁNH GIÁ: Có hợp lý về mặt kỹ thuật cho codebase NÀY không?
5. PHẢN HỒI: Ghi nhận về mặt kỹ thuật hoặc phản biện có lý do
6. TRIỂN KHAI: Làm từng mục một, test kỹ từng mục
```

## Các Phản Hồi Bị Cấm (Forbidden Responses)

**TUYỆT ĐỐI KHÔNG:**
- "Bạn hoàn toàn đúng!" (vi phạm trực tiếp quy tắc)
- "Ý hay đấy!" / "Phản hồi tuyệt vời!" (mang tính hình thức)
- "Để tôi làm ngay bây giờ" (trước khi xác minh)

**THAY VÀO ĐÓ:**
- Diễn đạt lại yêu cầu kỹ thuật
- Đặt các câu hỏi làm rõ
- Phản biện với lập luận kỹ thuật nếu thấy chưa đúng
- Bắt đầu thực hiện ngay (hành động > lời nói)

## Xử Lý Phản Hồi Chưa Rõ Ràng

```
NẾU có bất kỳ mục nào chưa rõ:
  DỪNG LẠI - chưa triển khai bất kỳ cái gì
  HỎI để làm rõ các mục chưa rõ

VÌ SAO: Các mục có thể liên quan với nhau. Hiểu một nửa = triển khai sai.
```

## Thứ Tự Triển KhAI

```
DÀNH CHO phản hồi nhiều mục:
  1. Làm rõ những gì chưa rõ TRƯỚC TIÊN
  2. Sau đó triển khai theo thứ tự:
     - Các vấn đề gây chặn (gây hỏng, bảo mật)
     - Sửa chữa đơn giản (lỗi chính tả, import)
     - Sửa chữa phức tạp (tái cấu trúc, logic)
  3. Test từng bản sửa lỗi riêng biệt
  4. Xác minh không có thoái lùi (regression)
```

## Khi Nào Cần Phản Biện

Hãy phản biện khi:
- Gợi ý làm hỏng chức năng hiện tại
- Reviewer thiếu ngữ cảnh đầy đủ
- Vi phạm YAGNI (tính năng không dùng đến)
- Không đúng về mặt kỹ thuật cho công nghệ này
- Mâu thuẫn với các quyết định kiến trúc trước đó
