# Viết Các Bài Test Chất Lượng

**Nạp tài liệu này khi:** viết hoặc thay đổi bài test, thêm mock, hoặc thêm các phương thức dọn dẹp/hỗ trợ cho test.

## Tổng Quan

Một bài test tồn tại là để bắt một lỗi hỏng (break) cụ thể. Hai nguyên tắc chi phối mọi thứ ở đây:

```
1. Mỗi bài test phải đặt tên được lỗi hỏng mà nó sẽ bắt
2. Mỗi bài test phải thực thi đối tượng thực sự (the real thing)
```

Quy trình TDD nghiêm ngặt tạo ra cả hai điều trên một cách tự nhiên: bài test được viết trước và tận mắt thấy thất bại trên code thực tế đã chứng minh nó có thể thất bại, và chỉ dùng mock khi dependency thực tế tỏ ra quá chậm hoặc thuộc hệ thống bên ngoài.

## Nguyên Tắc 1: Đặt Tên Lỗi Hỏng (Name the Break)

Trước khi viết thân bài test, hãy trả lời: **thay đổi mã production nào sẽ làm cho bài test này thất bại — và thay đổi đó là một bug hay một quyết định thiết kế?** Bài test khẳng định giá trị bằng cách bắt một nhánh sai, tác dụng phụ bị thiếu, tham số sai, trường hợp biên, hoặc một contract bị hỏng.

**Rút ra giá trị kỳ vọng một cách độc lập.** Dùng các giá trị literal và các dữ liệu mẫu (fixtures) được kiểm tra thủ công; các bài test dạng bảng (table-driven tests) với giá trị `want` cụ thể là dạng được ưu tiên.

```typescript
// ❌ Test soi gương (Mirror assertion): cùng một builder tính toán cả 2 vế — luôn luôn đúng
const expected = buildSearchQuery({ tag: 'urgent' });
expect(buildSearchQuery({ tag: 'urgent' })).toBe(expected);

// ✅ Giá trị literal tính bằng tay
expect(buildSearchQuery({ tag: 'urgent' })).toBe('tag:"urgent"');
```

**Không viết test phát hiện thay đổi (Change detectors).** Nếu bài test chỉ thất bại khi có thay đổi cố ý — giá trị của một hằng số, văn bản chính xác của một thông báo, cấu trúc private — thì nó sẽ báo lỗi khi bạn làm mới thiết kế và ngủ quên khi có bug thực sự. Hãy test hành vi phụ thuộc vào quyết định đó: không phải `expect(MAX_RETRIES).toBe(5)` mà là "một cuộc gọi thất bại được thử lại 5 lần và lần thứ 6 không bao giờ xảy ra."

**Hành vi, không phải văn bản.** Khẳng định rằng một script, skill, hoặc config chứa một dòng chính xác chỉ chứng minh nguồn là nguồn. Hãy chạy script với input được kiểm soát và assert output, tác dụng phụ, hoặc mã thoát (exit code).

## Nguyên Tắc 2: Thực Thi Đối Tượng Thực Sự (Exercise the Real Thing)

**Mock không mang lại khẳng định nào.** Một khẳng định trên mock sẽ đỗ khi có mock và trượt khi thiếu mock — nó không nói lên điều gì về component. Hãy assert hành vi của component thực sự; nếu mock là thứ bạn đang kiểm tra, hãy unmock hoặc xóa khẳng định đó.

```typescript
// ✅ Hành vi thực tế
expect(screen.getByRole('navigation')).toBeInTheDocument();

// ❌ Sự tồn tại của Mock
expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
```

**Mock ở đúng cấp độ.** Tìm hiểu mọi tác dụng phụ (side effect) của phương thức thực tế trước khi thay thế nó; mock thao tác chậm hoặc hệ thống bên ngoài và giữ lại những gì bài test phụ thuộc vào ở dạng thực tế.

**Ưu tiên các component thực sự hơn là các mock phức tạp.** Khi việc thiết lập mock phình to vượt quá logic của test, các mock thiếu các method mà component thực tế có, hoặc test bị hỏng khi mock thay đổi, hãy chuyển sang một bài test tích hợp (integration test) với các component thực tế.

## Kiểm Tra Đột Biến (The Mutation Check)

Trước khi hoàn thành, hãy nhẩm biến đổi (mutate) mã production; ít nhất một bài test phải thất bại cho mỗi biến đổi thực tế:

- Hằng số hoặc tham số bị sai
- Nhánh xử lý bị sai
- Thay đổi trạng thái hoặc tác dụng phụ bị thiếu
- Trả về rỗng hoặc mặc định
- Thiếu validation cho giá trị zero, rỗng, nil, chưa ủy quyền, hoặc input sai định dạng

Một biến đổi mà không bài test nào bắt được chứng tỏ hành vi đó chưa được bảo vệ — hoặc bài test mang tính hiển nhiên lặp từ (tautological).
