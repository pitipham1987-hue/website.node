---
name: executing-plans
description: Sử dụng khi bạn đã có một kế hoạch triển khai viết sẵn để thực thi trong một session riêng biệt kèm theo các điểm kiểm tra review
---

# Thực Thi Kế Hoạch (Executing Plans)

## Tổng Quan

Nạp kế hoạch, đánh giá phản biện, thực thi tất cả các nhiệm vụ, báo cáo khi hoàn tất.

**Thông báo khi bắt đầu:** "Tôi đang sử dụng skill executing-plans để thực thi kế hoạch này."

**Lưu ý:** Hãy thông báo với đối tác con người của bạn rằng Superpowers hoạt động tốt hơn nhiều khi có quyền truy cập vào subagent (Claude Code, Codex CLI, Codex App, Copilot CLI, và Gemini CLI đều đủ điều kiện; xem tham chiếu công cụ theo từng nền tảng trong `../using-superpowers/references/`). Nếu có sẵn subagent, hãy sử dụng superpowers:subagent-driven-development thay vì skill này.

## Quy Trình Thực Hiện

### Bước 1: Nạp Và Phản Biện Kế Hoạch
1. Đảm bảo một không gian làm việc cô lập: sử dụng superpowers:using-git-worktrees để tạo mới hoặc xác minh cái sẵn có
2. Đọc file kế hoạch
3. Phản biện kỹ lưỡng - xác định bất kỳ câu hỏi hoặc mối bận tâm nào về kế hoạch
4. Nếu có bận tâm: Nêu ra với đối tác con người trước khi bắt đầu
5. Nếu không có bận tâm: Tạo các todo cho các mục trong kế hoạch và tiến hành

### Bước 2: Thực Thi Các Nhiệm Vụ

Đối với mỗi nhiệm vụ (task):
1. Đánh dấu trạng thái in_progress
2. Tuân thủ chính xác từng bước (kế hoạch đã có các bước nhỏ bite-sized)
3. Chạy các bước xác minh như chỉ định
4. Đánh dấu hoàn thành (completed)

### Bước 3: Hoàn Tất Phát Triển

Sau khi tất cả các nhiệm vụ hoàn thành và được xác minh:
- Thông báo: "Tôi đang sử dụng skill finishing-a-development-branch để hoàn tất công việc này."
- **SUB-SKILL BẮT BUỘC:** Sử dụng superpowers:finishing-a-development-branch
- Tuân theo skill đó để xác minh các test, trình bày các lựa chọn và thực thi lựa chọn của người dùng

## Khi Nào Cần Dừng Lại Và Hỏi Ý Kiến

**DỪNG thực thi ngay lập tức khi:**
- Gặp điểm tắc nghẽn / vật cản (bị thiếu dependency, test thất bại, hướng dẫn không rõ ràng)
- Kế hoạch có lỗ hổng nghiêm trọng ngăn cản việc bắt đầu
- Bạn không hiểu một hướng dẫn
- Việc xác minh thất bại liên tục

**Hãy hỏi để làm rõ thay vì tự đoán.**

## Khi Nào Cần Đọc Lại Các Bước Trước

**Quay lại bước Review (Bước 1) khi:**
- Đối tác cập nhật kế hoạch dựa trên phản hồi của bạn
- Phương án tiếp cận cốt lõi cần được suy nghĩ lại

**Đừng cố đấm ăn xôi vượt qua điểm tắc nghẽn** - hãy dừng lại và hỏi.

## Ghi Nhớ
- Phản biện kế hoạch trước tiên
- Tuân thủ chính xác các bước trong kế hoạch
- Không bỏ qua bước xác minh
- Tham chiếu các skill khi kế hoạch yêu cầu
- Dừng lại khi bị tắc, không tự đoán
- Không bao giờ bắt đầu triển khai trên nhánh main/master nếu không có sự đồng ý rõ ràng của người dùng
