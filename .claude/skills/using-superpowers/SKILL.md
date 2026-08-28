---
name: using-superpowers
description: Sử dụng khi bắt đầu bất kỳ cuộc hội thoại nào — thiết lập cách tìm kiếm và sử dụng skill, bắt buộc kích hoạt skill trước BẤT KỲ phản hồi nào kể cả câu hỏi làm rõ
---

<SUBAGENT-STOP>
Nếu bạn được điều phối dưới dạng subagent để thực thi một nhiệm vụ cụ thể, hãy bỏ qua skill này.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
Nếu bạn nghĩ có dù chỉ 1% khả năng một skill áp dụng cho công việc bạn đang làm, bạn BẮT BUỘC PHẢI kích hoạt skill đó.

NẾU MỘT SKILL ÁP DỤNG CHO NHIỆM VỤ CỦA BẠN, BẠN KHÔNG CÓ LỰA CHỌN NÀO KHÁC. BẠN BẮT BUỘC PHẢI SỬ DỤNG NÓ.

Điều này là không thể thương lượng. Bạn không thể tự hợp lý hóa để né tránh điều này.
</EXTREMELY-IMPORTANT>

## Quy tắc

**Kích hoạt các skill liên quan hoặc được yêu cầu TRƯỚC bất kỳ phản hồi hay hành động nào** — bao gồm việc đặt câu hỏi làm rõ, khám phá codebase, hoặc kiểm tra các file. Nếu sau đó nhận ra skill không phù hợp với tình huống, bạn không bắt buộc phải tiếp tục dùng nó.

**Trước khi vào chế độ lập kế hoạch (plan mode):** nếu bạn chưa brainstorm, hãy kích hoạt skill brainstorming trước.

Sau đó thông báo "Đang sử dụng [skill] để [mục đích]" và tuân thủ chính xác skill đó. Nếu skill có checklist, hãy tạo todo cho từng hạng mục.

## Độ ưu tiên của Skill

Khi có nhiều skill cùng áp dụng, các quy trình (process skills) được ưu tiên trước — chúng định hình phương pháp tiếp cận, sau đó các skill thực thi (frontend-design, v.v.) sẽ thực hiện. Brainstorming và systematic-debugging là các process skill phổ biến nhất trong Superpowers, nhưng quy tắc này đúng cho tất cả các skill.

- "Hãy xây dựng X" → dùng superpowers:brainstorming trước, sau đó mới tới các skill thực thi.
- "Sửa lỗi này" → dùng superpowers:systematic-debugging trước, sau đó mới tới các skill domain.

## Tín hiệu cảnh báo (Red Flags)

Những suy nghĩ sau có nghĩa là DỪNG LẠI — bạn đang tự hợp lý hóa để né tránh:

| Suy nghĩ | Thực tế |
|---------|---------|
| "Đây chỉ là câu hỏi đơn giản" | Câu hỏi cũng là nhiệm vụ. Hãy kiểm tra skill. |
| "Tôi cần thêm ngữ cảnh trước" | Kiểm tra skill phải diễn ra TRƯỚC khi đặt câu hỏi làm rõ. |
| "Để tôi khám phá codebase trước" | Skill chỉ cho bạn CÁCH khám phá. Kiểm tra trước. |
| "Tôi có thể kiểm tra git/file nhanh" | Các file thiếu ngữ cảnh cuộc hội thoại. Hãy kiểm tra skill. |
| "Để tôi thu thập thông tin trước" | Skill chỉ cho bạn CÁCH thu thập thông tin. |
| "Cái này không cần skill chính thức" | Nếu skill tồn tại, hãy sử dụng nó. |
| "Tôi nhớ skill này rồi" | Skill luôn tiến hóa. Hãy đọc phiên bản hiện tại. |
| "Cái này không tính là nhiệm vụ" | Hành động = nhiệm vụ. Hãy kiểm tra skill. |
| "Dùng skill thì hơi quá đà" | Việc đơn giản có thể trở nên phức tạp. Hãy sử dụng nó. |
| "Tôi chỉ làm đúng một việc này trước" | Kiểm tra TRƯỚC khi làm bất kỳ điều gì. |
| "Cảm giác này thật năng suất" | Hành động thiếu kỷ luật gây lãng phí thời gian. Skill ngăn chặn điều này. |
| "Tôi hiểu ý nghĩa của nó rồi" | Hiểu khái niệm ≠ sử dụng skill. Hãy kích hoạt nó. |

## Thích ứng theo nền tảng

Nếu môi trường chạy của bạn có ở dưới đây, hãy đọc file tham chiếu tương ứng để biết hướng dẫn đặc thù:

- Codex: `references/codex-tools.md`
- Pi: `references/pi-tools.md`
- Antigravity: `references/antigravity-tools.md`
- Gemini CLI: `references/gemini-tools.md`

## Hướng dẫn từ người dùng

Hướng dẫn trực tiếp từ người dùng (file CLAUDE.md, AGENTS.md, GEMINI.md, v.v. hoặc yêu cầu trực tiếp) có độ ưu tiên cao nhất so với skill, và skill có ưu tiên cao hơn hành vi mặc định. Chỉ bỏ qua quy trình skill hoặc hướng dẫn khi đối tác con người của bạn bảo bạn làm như vậy một cách rõ ràng.
