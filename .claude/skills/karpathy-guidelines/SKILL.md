---
name: karpathy-guidelines
description: Các nguyên tắc hành vi giúp giảm những lỗi phổ biến khi LLM viết code. Dùng khi viết, review, hoặc refactor code để tránh làm phức tạp hoá vấn đề, thực hiện các thay đổi có chủ đích (surgical), phơi bày các giả định, và định nghĩa tiêu chí thành công có thể kiểm chứng.
license: MIT
---

# Nguyên tắc Karpathy

Các nguyên tắc hành vi giúp giảm những lỗi phổ biến khi LLM viết code, đúc kết từ [quan sát của Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876) về các cạm bẫy khi LLM viết code.

**Đánh đổi:** Các nguyên tắc này thiên về sự thận trọng hơn là tốc độ. Với các tác vụ đơn giản, hãy tự cân nhắc.

## 1. Suy nghĩ trước khi viết code

**Đừng giả định. Đừng giấu sự mơ hồ. Phơi bày các đánh đổi.**

Trước khi triển khai:
- Nêu rõ các giả định của bạn. Nếu không chắc chắn, hãy hỏi.
- Nếu tồn tại nhiều cách hiểu, hãy trình bày chúng ra — đừng tự ý chọn một cách trong im lặng.
- Nếu có một cách tiếp cận đơn giản hơn, hãy nói ra. Phản biện khi cần thiết.
- Nếu có điều gì đó chưa rõ ràng, hãy dừng lại. Chỉ rõ điều gây khó hiểu. Hỏi lại.

## 2. Ưu tiên sự đơn giản

**Lượng code tối thiểu để giải quyết vấn đề. Không có gì mang tính suy đoán.**

- Không thêm tính năng nào ngoài những gì được yêu cầu.
- Không tạo abstraction cho code chỉ dùng một lần.
- Không thêm "tính linh hoạt" hay "khả năng cấu hình" nếu không được yêu cầu.
- Không xử lý lỗi cho các tình huống không thể xảy ra.
- Nếu bạn viết 200 dòng mà có thể rút gọn còn 50 dòng, hãy viết lại.

Tự hỏi bản thân: "Một kỹ sư senior liệu có nói đây là làm phức tạp hoá vấn đề không?" Nếu có, hãy đơn giản hoá.

## 3. Thay đổi có chủ đích (Surgical Changes)

**Chỉ chạm vào những gì bắt buộc phải chạm. Chỉ dọn dẹp những gì do chính mình gây ra.**

Khi sửa code hiện có:
- Đừng "cải thiện" code, comment, hay định dạng ở những phần lân cận không liên quan.
- Đừng refactor những thứ chưa hỏng.
- Bám theo phong cách hiện có, dù bạn có thể muốn làm khác đi.
- Nếu phát hiện dead code không liên quan, hãy nêu ra — đừng tự ý xoá nó.

Khi thay đổi của bạn tạo ra phần thừa (orphan):
- Xoá các import/biến/hàm mà CHÍNH thay đổi của bạn khiến chúng không còn được dùng.
- Đừng xoá dead code có từ trước nếu không được yêu cầu.

Phép thử: Mỗi dòng bị thay đổi phải truy ngược trực tiếp về yêu cầu của người dùng.

## 4. Thực thi theo mục tiêu (Goal-Driven Execution)

**Định nghĩa tiêu chí thành công. Lặp lại đến khi được xác minh.**

Chuyển hoá các tác vụ thành mục tiêu có thể kiểm chứng:
- "Thêm validation" → "Viết test cho các input không hợp lệ, rồi làm cho chúng pass"
- "Sửa bug" → "Viết một test tái hiện được lỗi, rồi làm cho nó pass"
- "Refactor X" → "Đảm bảo test pass cả trước và sau khi refactor"

Với các tác vụ nhiều bước, hãy nêu một kế hoạch ngắn gọn:
```
1. [Bước] → xác minh: [cách kiểm tra]
2. [Bước] → xác minh: [cách kiểm tra]
3. [Bước] → xác minh: [cách kiểm tra]
```

Tiêu chí thành công rõ ràng cho phép bạn tự lặp lại một cách độc lập. Tiêu chí mơ hồ ("làm cho nó chạy được") đòi hỏi phải liên tục hỏi lại để làm rõ.
