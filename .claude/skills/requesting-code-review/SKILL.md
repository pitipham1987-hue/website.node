---
name: requesting-code-review
description: Sử dụng khi hoàn thành nhiệm vụ, triển khai các tính năng lớn, hoặc trước khi merge để xác minh công việc đáp ứng đủ yêu cầu
---

# Yêu Cầu Code Review (Requesting Code Review)

Điều phối một subagent code reviewer để bắt các lỗi phát sinh trước khi chúng lan rộng. Reviewer nhận được ngữ cảnh được thiết kế chính xác để đánh giá — không bao giờ thừa hưởng lịch sử session của bạn.

**Nguyên tắc cốt lõi:** Review sớm, review thường xuyên.

## Khi Nào Cần Yêu Cầu Review

**Bắt buộc:**
- Sau mỗi nhiệm vụ (task) trong subagent-driven development
- Sau khi hoàn thành tính năng lớn
- Trước khi merge vào nhánh main/master

**Tùy chọn nhưng rất có giá trị:**
- Khi bị kẹt (cần góc nhìn mới)
- Trước khi tái cấu trúc (kiểm tra baseline)
- Sau khi sửa lỗi phức tạp

## Cách Thức Yêu Cầu

**1. Lấy SHA git:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # hoặc origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Điều phối subagent code reviewer:**

Điều phối một subagent `general-purpose`, điền thông tin vào mẫu tại [code-reviewer.md](code-reviewer.md)

**Placeholders:**
- `{DESCRIPTION}` - Tóm tắt ngắn gọn những gì bạn đã xây dựng
- `{PLAN_OR_REQUIREMENTS}` - Những gì nó nên làm
- `{BASE_SHA}` - Commit bắt đầu
- `{HEAD_SHA}` - Commit kết thúc

**3. Hành động dựa trên phản hồi:**
- Sửa các vấn đề Critical ngay lập tức
- Sửa các vấn đề Important trước khi tiếp tục
- Ghi nhận các vấn đề Minor cho sau này
- Phản biện nếu reviewer sai (kèm theo lập luận)
