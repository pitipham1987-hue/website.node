# Hướng Dẫn Visual Companion

Công cụ trợ lý trực quan trên trình duyệt phục vụ cho việc brainstorming bằng mockup, sơ đồ và các tùy chọn trực quan.

## Khi Nào Sử Dụng

Quyết định theo từng câu hỏi, không theo từng session. Bài kiểm tra: **người dùng có hiểu tốt hơn bằng cách NHÌN thay vì ĐỌC không?**

**Dùng trình duyệt** khi bản thân nội dung mang tính trực quan (visual):

- **Mockup UI** — wireframe, bố cục (layout), cấu trúc điều hướng, thiết kế component
- **Sơ đồ kiến trúc** — các thành phần hệ thống, luồng dữ liệu, bản đồ mối quan hệ
- **So sánh trực quan song song** — so sánh 2 bố cục, 2 phối màu, 2 hướng thiết kế
- **Tinh chỉnh giao diện (polish)** — khi câu hỏi liên quan đến vẻ ngoài, khoảng cách, thứ tự thị giác (visual hierarchy)
- **Mối quan hệ không gian** — state machine, flowchart, sơ đồ thực thể mối quan hệ (ERD)

**Dùng terminal** khi nội dung là văn bản hoặc bảng biểu:

- **Câu hỏi về yêu cầu và phạm vi** — "X nghĩa là gì?", "Những tính năng nào thuộc phạm vi?"
- **Lựa chọn khái niệm A/B/C** — chọn lựa giữa các phương án được diễn giải bằng lời
- **Danh sách đánh đổi (tradeoffs)** — ưu/nhược điểm, bảng so sánh
- **Quyết định kỹ thuật** — thiết kế API, mô hình hóa dữ liệu, chọn phương án kiến trúc
- **Câu hỏi làm rõ** — bất kỳ điều gì mà câu trả lời là chữ chứ không phải sở thích thị giác

Một câu hỏi *về* chủ đề UI không tự động là một câu hỏi hình ảnh. "Bạn muốn dạng wizard nào?" là câu hỏi khái niệm — dùng terminal. "Bố cục wizard nào trong các mẫu này cho cảm giác tốt hơn?" là câu hỏi hình ảnh — dùng trình duyệt.

## Cơ Chế Hoạt Động

Server sẽ theo dõi một thư mục chứa các file HTML và phục vụ file mới nhất ra trình duyệt. Bạn ghi nội dung HTML vào `screen_dir`, người dùng sẽ thấy trên trình duyệt của họ và có thể click để chọn tùy chọn. Lựa chọn được ghi lại vào `state_dir/events` để bạn đọc ở lượt tiếp theo.

**Nội dung dạng đoạn (fragments) vs Tài liệu đầy đủ (full documents):** Nếu file HTML của bạn bắt đầu bằng `<!DOCTYPE` hoặc `<html`, server sẽ giữ nguyên cấu trúc đó (chỉ chèn script hỗ trợ). Ngược lại, server sẽ tự động bọc nội dung của bạn trong khung template — thêm header, CSS theme, trạng thái kết nối và hạ tầng tương tác. **Mặc định hãy viết nội dung dạng fragment.** Chỉ viết tài liệu đầy đủ khi bạn cần kiểm soát hoàn toàn trang web.

## Bắt Đầu Một Session

```bash
# Khởi chạy SAU KHI người dùng đồng ý dùng companion. --open tự động mở trình duyệt
# trên màn hình đầu tiên; --project-dir giúp lưu trữ mockup và tái sử dụng cùng port khi restart.
scripts/start-server.sh --project-dir /path/to/project --open

# Trả về: {"type":"server-started","port":52341,
#           "url":"http://localhost:52341/?key=ab12…",
#           "screen_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/content",
#           "state_dir":"/path/to/project/.superpowers/brainstorm/12345-1706000000/state"}
```

Lưu `screen_dir` và `state_dir` từ kết quả trả về. Với `--open`, trình duyệt tự mở khi bạn đẩy màn hình đầu tiên — bạn không cần bảo người dùng mở thủ công, nhưng vẫn nên cung cấp URL phòng trường hợp môi trường headless/remote không tự mở được.

**URL chứa session key (`?key=…`).** Server sẽ từ chối bất kỳ yêu cầu nào thiếu key này, vì vậy luôn đưa người dùng URL **hoàn chỉnh** từ trường `url` — không bỏ query string, và không bao giờ gửi URL trần kiểu `http://host:port`. Key này bảo vệ HTTP và WebSocket để trình duyệt lạ khác không thể xem màn hình hoặc can thiệp sự kiện.

## Vòng Lặp Làm Việc (The Loop)

1. **Kiểm tra server đang chạy**, sau đó **ghi HTML** vào file mới trong `screen_dir`:
   - Kiểm tra `$STATE_DIR/server-info` tồn tại và `$STATE_DIR/server-stopped` không tồn tại.
   - Đặt tên file mang ý nghĩa: `platform.html`, `visual-style.html`, `layout.html`
   - **Không bao giờ dùng lại tên file cũ** — mỗi màn hình là một file mới.
   - Server tự động phục vụ file có thời gian chỉnh sửa mới nhất.

2. **Thông báo cho người dùng điều cần chờ đợi và kết thúc lượt:**
   - Nhắc họ về URL
   - Tóm tắt ngắn gọn những gì đang hiển thị trên màn hình
   - Yêu cầu họ phản hồi trong terminal: "Hãy xem qua và cho tôi biết ý kiến của bạn. Click để chọn phương án nếu muốn."

3. **Ở lượt tiếp theo của bạn** — sau khi người dùng phản hồi ở terminal:
   - Đọc `$STATE_DIR/events` nếu tồn tại — chứa dữ liệu tương tác từ trình duyệt (click, chọn)
   - Kết hợp với văn bản phản hồi từ terminal của người dùng.

4. **Tái lặp hoặc tiến tiếp** — nếu phản hồi làm thay đổi màn hình hiện tại, ghi file mới (ví dụ: `layout-v2.html`).

5. **Giải phóng màn hình khi quay lại terminal** — khi bước tiếp theo không cần trình duyệt, đẩy màn hình chờ:
   ```html
   <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
     <p class="subtitle">Đang tiếp tục trao đổi trong terminal...</p>
   </div>
   ```

## Các Class CSS Có Sẵn

- `options` / `option` / `data-choice` / `letter` / `content` — dành cho trắc nghiệm A/B/C
- `cards` / `card` — dành cho thiết kế dạng thẻ
- `mockup` / `mockup-header` / `mockup-body` — khung preview mockup
- `split` — chế độ xem song song
- `pros-cons` — bảng so sánh ưu nhược điểm
