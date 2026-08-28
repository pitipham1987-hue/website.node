---
name: writing-skills
description: Sử dụng khi tạo mới các skill, chỉnh sửa skill hiện có, hoặc xác minh các skill hoạt động tốt trước khi triển khai
---

# Viết Skill (Writing Skills)

## Tổng Quan

**Viết skill CHÍNH LÀ Phát triển hướng kiểm thử (TDD) áp dụng vào tài liệu quy trình.**

Các skill cá nhân nằm trong thư mục skills của runtime (`~/.claude/skills/`, `~/.gemini/skills/` hoặc `~/.agents/skills/`).

Bạn viết các test case (tình huống áp lực với subagent), quan sát chúng thất bại (hành vi baseline), viết skill (tài liệu), quan sát test đỗ (agent tuân thủ), và tái cấu trúc (bịt các lỗ hổng).

**Nguyên tắc cốt lõi:** Nếu bạn không tận mắt chứng kiến agent thất bại khi chưa có skill, bạn không thể biết liệu skill có đang dạy đúng thứ hay không.

**BACKGROUND BẮT BUỘC:** Bạn BẮT BUỘC phải hiểu `superpowers:test-driven-development` trước khi dùng skill này. Skill đó định nghĩa chu kỳ Red-Green-Refactor cốt lõi. Skill này áp dụng TDD cho tài liệu.

## Skill Là Gì?

Một **skill** là tài liệu tham chiếu cho các kỹ thuật, pattern, hoặc công cụ đã được chứng minh. Skill giúp các agent trong tương lai tìm thấy và áp dụng các phương pháp hiệu quả.

**Skill LÀ:** Các kỹ thuật tái sử dụng được, pattern, công cụ, tài liệu hướng dẫn tham chiếu
**Skill KHÔNG PHẢI LÀ:** Lời kể chuyện về việc bạn đã giải quyết một vấn đề như thế nào một lần

## Bảng Ánh Xạ TDD Cho Skill

| Khái niệm TDD | Tạo Tạo Skill |
|-------------|----------------|
| **Test case** | Tình huống áp lực với subagent |
| **Production code** | Tài liệu skill (SKILL.md) |
| **Test trượt (RED)** | Agent vi phạm quy tắc khi chưa có skill (baseline) |
| **Test đỗ (GREEN)** | Agent tuân thủ khi có skill |
| **Refactor** | Bịt các lỗ hổng ngụy biện trong khi vẫn giữ sự tuân thủ |
| **Viết test trước** | Chạy kịch bản baseline TRƯỚC KHI viết skill |
| **Quan sát nó trượt** | Tài liệu hóa chính xác các lý lẽ ngụy biện agent sử dụng |
| **Mã tối thiểu** | Viết skill giải quyết đúng các vi phạm cụ thể đó |
| **Quan sát nó đỗ** | Xác minh agent bây giờ đã tuân thủ |

## Tối Ưu Hóa Khám Phá Skill (SDO)

Cực kỳ quan trọng: Agent trong tương lai cần TÌM THẤY skill của bạn.

### Trường Description Đầy Đủ
- Bắt đầu với "Sử dụng khi..." để tập trung vào các điều kiện kích hoạt.
- **CRITICAL: Description = Khi nào sử dụng, KHÔNG PHẢI Skill làm gì.** Chỉ mô tả điều kiện kích hoạt, KHÔNG tóm tắt quy trình của skill trong description.

## Luật Thép (The Iron Law)

```
KHÔNG CÓ SKILL NÀO ĐƯỢC TẠO/SỬA KHI CHƯA CÓ BÀI TEST THẤT BẠI TRƯỚC ĐÓ
```

Viết skill trước khi test? Xóa nó đi. Bắt đầu lại từ đầu.
Chỉnh sửa skill mà không test? Cùng một lỗi vi phạm.
