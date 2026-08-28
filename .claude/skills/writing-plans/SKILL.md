---
name: writing-plans
description: Sử dụng khi bạn đã có spec hoặc yêu cầu cho một nhiệm vụ nhiều bước, trước khi chạm vào mã nguồn
---

# Viết Kế Hoạch Triển Khai (Writing Plans)

## Tổng Quan

Viết các kế hoạch thực thi toàn diện với giả định rằng kỹ sư thực thi chưa có chút ngữ cảnh nào về codebase của chúng ta và có gu kỹ thuật cần được định hướng kỹ. Hãy tài liệu hóa mọi thứ họ cần biết: những file nào cần chạm vào cho mỗi nhiệm vụ, code mẫu, kiểm thử, tài liệu họ có thể cần tra cứu, cách test tính năng. Cung cấp cho họ toàn bộ kế hoạch dưới dạng các nhiệm vụ vừa vặn (bite-sized tasks). Tuân thủ DRY. YAGNI. TDD. Commit thường xuyên.

Giả định họ là một lập trình viên có kỹ năng, nhưng hầu như chưa biết gì về bộ công cụ hoặc domain bài toán của chúng ta. Giả định họ chưa thạo việc thiết kế bài test tốt.

**Thông báo khi bắt đầu:** "Tôi đang sử dụng skill writing-plans để tạo kế hoạch triển khai."

**Ngữ cảnh:** Nếu đang làm việc trong một worktree cô lập, nó nên được tạo thông qua skill `superpowers:using-git-worktrees` tại thời điểm bắt đầu thực thi.

**Lưu kế hoạch tại:** `docs/superpowers/plans/YYYY-MM-DD-<tên-tính-năng>.md`
- (Cấu hình vị trí kế hoạch của người dùng sẽ ghi đè mặc định này)

## Kiểm Tra Phạm Vi (Scope Check)

Nếu bản spec bao phủ nhiều subsystem độc lập, nó đáng lẽ phải được chia nhỏ thành các spec dự án con trong quá trình brainstorming. Nếu chưa, hãy đề xuất chia kế hoạch này thành các kế hoạch riêng biệt — mỗi subsystem một kế hoạch. Mỗi kế hoạch phải tạo ra một phần mềm hoạt động và test được một cách độc lập.

## Cấu Trúc File

Trước khi định nghĩa các nhiệm vụ, hãy vạch ra những file nào sẽ được tạo mới hoặc chỉnh sửa và trách nhiệm của từng file là gì. Đây là nơi các quyết định chia nhỏ được chốt lại.

- Thiết kế các đơn vị có ranh giới rõ ràng và interface được định nghĩa tốt. Mỗi file nên có một trách nhiệm duy nhất.
- Bạn tư duy tốt nhất về mã nguồn khi có thể nắm trọn ngữ cảnh cùng lúc, và việc chỉnh sửa tin cậy hơn khi các file có trọng tâm. Ưu tiên các file nhỏ, tập trung thay vì các file lớn làm quá nhiều việc.
- Các file thay đổi cùng nhau nên nằm cùng nhau. Chia theo trách nhiệm, không chia theo tầng kỹ thuật (technical layer).
- Trong các codebase sẵn có, hãy tuân theo các pattern đã thiết lập. Nếu codebase dùng các file lớn, đừng đơn phương tái cấu trúc — nhưng nếu một file bạn đang sửa đã quá cồng kềnh, việc đưa yêu cầu chia file vào kế hoạch là hợp lý.

Cấu trúc này định hình việc chia nhỏ nhiệm vụ. Mỗi nhiệm vụ nên tạo ra các thay đổi tự đóng gói và có nghĩa một cách độc lập.

## Phân Định Kích Thước Nhiệm Vụ (Task Right-Sizing)

Một nhiệm vụ (task) là đơn vị nhỏ nhất tự mang chu kỳ test riêng và xứng đáng đi qua một cổng review độc lập. Khi vạch ranh giới nhiệm vụ: hãy gộp các bước cài đặt, cấu hình, dựng khung (scaffolding) và tài liệu vào nhiệm vụ mà sản phẩm của nó cần chúng; chỉ chia nhỏ khi một reviewer có thể từ chối một nhiệm vụ một cách có nghĩa trong khi vẫn duyệt nhiệm vụ bên cạnh. Mỗi nhiệm vụ kết thúc bằng một sản phẩm bàn giao có thể test độc lập.

## Độ Nhỏ Của Nhiệm Vụ Kích Thước Mẫu (Bite-Sized Task Granularity)

**Mỗi bước là một hành động (2-5 phút):**
- "Viết test thất bại" - 1 bước
- "Chạy test để đảm bảo nó thất bại" - 1 bước
- "Triển khai mã tối thiểu để test vượt qua" - 1 bước
- "Chạy các test và đảm bảo chúng vượt qua" - 1 bước
- "Commit" - 1 bước

## Header Của Tài Liệu Kế Hoạch

**Mọi kế hoạch BẮT BUỘC phải bắt đầu bằng header này:**

```markdown
# Kế Hoạch Triển Khai [Tên Tính Năng]

> **Dành cho agent thực thi:** SUB-SKILL BẮT BUỘC: Sử dụng superpowers:subagent-driven-development (khuyến nghị) hoặc superpowers:executing-plans để triển khai kế hoạch này theo từng nhiệm vụ. Các bước sử dụng cú pháp ô tích (`- [ ]`) để theo dõi.

**Mục tiêu:** [Một câu mô tả những gì kế hoạch này xây dựng]

**Kiến trúc:** [2-3 câu về phương án tiếp cận]

**Công nghệ sử dụng (Tech Stack):** [Các công nghệ/thư viện chính]

## Hạn Chế Toàn Cục (Global Constraints)

[Các yêu cầu trên toàn bộ dự án từ bản spec — phiên bản tối thiểu, giới hạn dependency, quy tắc đặt tên và văn bản — mỗi dòng một yêu cầu, giữ nguyên giá trị chính xác từ spec. Mọi nhiệm vụ đều mặc định bao gồm phần này.]

---
```

## Cấu Trúc Một Nhiệm Vụ (Task Structure)

````markdown
### Task N: [Tên Component]

**Files:**
- Tạo mới: `exact/path/to/file.py`
- Chỉnh sửa: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Interfaces:**
- Sử dụng (Consumes): [những gì nhiệm vụ này dùng từ các nhiệm vụ trước — đúng chữ ký hàm/type]
- Cung cấp (Produces): [những gì các nhiệm vụ sau sẽ dựa vào — đúng tên hàm, kiểu tham số và trả về. Người thực thi nhiệm vụ chỉ thấy nhiệm vụ của họ; phần này giúp họ biết tên và type mà các nhiệm vụ lân cận sử dụng.]

- [ ] **Bước 1: Viết test thất bại**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Bước 2: Chạy test để xác minh nó thất bại**

Chạy: `pytest tests/path/test.py::test_name -v`
Kỳ vọng: THẤT BẠI với lỗi "function not defined"

- [ ] **Bước 3: Viết mã triển khai tối thiểu**

```python
def function(input):
    return expected
```

- [ ] **Bước 4: Chạy test để xác minh nó vượt qua**

Chạy: `pytest tests/path/test.py::test_name -v`
Kỳ vọng: VƯỢT QUA (PASS)

- [ ] **Bước 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## Tuyệt Đối Không Dùng Placeholder

Mỗi bước phải chứa nội dung thực tế mà lập trình viên cần. Đây là những **lỗi hỏng kế hoạch** — không bao giờ được viết:
- "TBD", "TODO", "triển khai sau", "điền chi tiết"
- "Thêm xử lý lỗi phù hợp" / "thêm validation" / "xử lý các trường hợp biên"
- "Viết test cho phần trên" (mà không có code test thực tế)
- "Tương tự như Task N" (lặp lại đoạn code — lập trình viên có thể đọc các task không theo thứ tự)
- Các bước mô tả những gì cần làm nhưng không chỉ ra cách làm (bắt buộc có block code cho các bước viết code)
- Tham chiếu đến các type, function, hoặc method không được định nghĩa trong bất kỳ nhiệm vụ nào

## Tự Kiểm Tra Kế Hoạch (Self-Review)

Sau khi viết xong kế hoạch hoàn chỉnh, hãy đọc lại bản spec bằng góc nhìn mới và đối chiếu kế hoạch với spec. Đây là checklist bạn tự chạy — không phải điều phối subagent.

**1. Bao phủ Spec:** Lướt qua từng phần/yêu cầu trong spec. Bạn có thể chỉ ra nhiệm vụ nào triển khai nó không? Liệt kê các lỗ hổng nếu có.

**2. Rà soát Placeholder:** Tìm kiếm các tín hiệu cảnh báo trong kế hoạch — bất kỳ pattern nào thuộc mục "Tuyệt Đối Không Dùng Placeholder" ở trên. Hãy sửa chúng.

**3. Nhất quán về Type:** Các type, method signature, và tên thuộc tính bạn dùng ở các nhiệm vụ sau có khớp với những gì bạn đã định nghĩa ở các nhiệm vụ trước không? Một hàm tên `clearLayers()` ở Task 3 nhưng lại gọi là `clearFullLayers()` ở Task 7 là một bug.

Nếu phát hiện vấn đề, hãy sửa trực tiếp. Không cần review lại từ đầu — chỉ cần sửa và tiếp tục. Nếu tìm thấy yêu cầu spec nào chưa có nhiệm vụ, hãy thêm nhiệm vụ đó.

## Bàn Giao Thực Thi (Execution Handoff)

Sau khi lưu kế hoạch, hãy đưa ra lựa chọn phương thức thực thi cho người dùng:

**"Kế hoạch đã hoàn tất và được lưu tại `docs/superpowers/plans/<filename>.md`. Có hai lựa chọn thực thi:**

**1. Điều phối Subagent (Khuyên dùng)** - Tôi điều phối một subagent mới cho mỗi task, review giữa các task, tái lặp nhanh

**2. Thực thi Trực tiếp (Inline Execution)** - Thực thi các task ngay trong session này bằng executing-plans, chạy theo đợt kèm các điểm kiểm tra review

**Bạn chọn phương án nào?"**

**Nếu chọn Điều phối Subagent:**
- **SUB-SKILL BẮT BUỘC:** Sử dụng superpowers:subagent-driven-development
- Subagent mới cho mỗi task + review 2 giai đoạn

**Nếu chọn Thực thi Trực tiếp:**
- **SUB-SKILL BẮT BUỘC:** Sử dụng superpowers:executing-plans
- Chạy theo đợt kèm các điểm kiểm tra để review
