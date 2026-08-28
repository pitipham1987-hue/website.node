# Kiểm Thử Skill Bằng Subagent (Testing Skills With Subagents)

**Nạp tài liệu tham chiếu này khi:** tạo mới hoặc chỉnh sửa các skill, trước khi triển khai, để xác minh chúng hoạt động tốt dưới áp lực và chống lại sự ngụy biện.

## Tổng Quan

**Kiểm thử skill chính là TDD áp dụng vào tài liệu quy trình.**

Bạn chạy các kịch bản không có skill (RED - quan sát agent thất bại), viết skill giải quyết các thất bại đó (GREEN - quan sát agent tuân thủ), sau đó bịt các lỗ hổng (REFACTOR - giữ vững sự tuân thủ).

**Nguyên tắc cốt lõi:** Nếu bạn không tận mắt chứng kiến agent thất bại khi chưa có skill, bạn không thể biết liệu skill đó có ngăn chặn đúng các thất bại hay không.

**BACKGROUND BẮT BUỘC:** Bạn BẮT BUỘC phải hiểu `superpowers:test-driven-development` trước khi dùng skill này.

## Khi Nào Sử Dụng

Kiểm thử các skill có tính chất:
- Bắt buộc thực thi kỷ luật (TDD, yêu cầu kiểm thử)
- Đỏi hỏi công sức tuân thủ (thời gian, nỗ lực, làm lại)
- Có thể bị viện lý do để bỏ qua ("chỉ một lần này thôi")
- Xung đột với các mục tiêu ngắn hạn (tốc độ trên chất lượng)

## Ánh Xạ TDD Cho Việc Kiểm Thử Skill

| Giai đoạn TDD | Kiểm thử Skill | Những gì bạn làm |
|-----------|---------------|-------------|
| **RED** | Test Baseline | Chạy kịch bản KHÔNG CÓ skill, quan sát agent thất bại |
| **Xác minh RED** | Thu thập các viện lý do | Ghi lại chính xác các thất bại nguyên văn |
| **GREEN** | Viết Skill | Giải quyết các thất bại cụ thể ở bước baseline |
| **Xác minh GREEN** | Test dưới áp lực | Chạy kịch bản CÓ skill, xác minh sự tuân thủ |
| **REFACTOR** | Bịt lỗ hổng | Tìm các viện lý do mới, thêm các quy tắc chống đỡ |
| **Giữ GREEN** | Re-verify | Test lại lần nữa, đảm bảo vẫn tuân thủ |
