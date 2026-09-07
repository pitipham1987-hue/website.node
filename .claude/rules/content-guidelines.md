---
paths:
  - "src/components/**"
---

# Content Guidelines

## Về nội dung: DNK House ≠ weav.com

weav.com là công ty AI customer service **thật, không liên quan đến DNK House**.
Các ảnh `weav.com_*.png` chỉ được dùng làm **tham khảo thiết kế/cấu trúc**
(xem [[design-reference]]). Vì DNK House cũng làm dịch vụ AI (cùng lĩnh vực với
weav), rủi ro "vô tình" viết lại gần giống nội dung thật của weav là cao hơn bình
thường — cần đặc biệt chú ý:

- Không copy nguyên văn câu chữ, tên tính năng, hay value proposition cụ thể của weav
  (vd: không dùng lại các tên như "Ask Weav", "Inbox", câu "Master of your tone,
  partner to your team"...).
- Chỉ mượn **công thức cấu trúc câu** (headline nêu nỗi đau → giải pháp, feature grid
  ngắn gọn, section "vấn đề → cách giải quyết khác biệt"...), viết lại hoàn toàn bằng
  nội dung và ngôn từ của DNK House.
- Danh sách dịch vụ AI cụ thể, số liệu, tên tính năng phải lấy từ thông tin thật của
  DNK House — hiện tại là placeholder, xem mục Content Template bên dưới.

## Content Language

Nội dung site mặc định bằng **tiếng Việt** (theo ngôn ngữ trao đổi của user). Nếu
cần bản tiếng Anh song song, hỏi rõ trước khi build i18n thay vì tự ý thêm.

## Content Template (mẫu placeholder, dựa theo cấu trúc copy của weav.com)

Nhắc lại: viết lại hoàn toàn bằng lời văn của DNK House, KHÔNG copy nguyên văn nội
dung của weav (xem mục "Về nội dung: DNK House ≠ weav.com" ở trên). Thay các mục
`[...]` bằng thông tin thật trước khi lên site.

**Hero**
- Headline (công thức: [Giải pháp AI] + [ngành/đối tượng]): `[Giải pháp AI chính] cho [đối tượng khách hàng]`
- Subheadline (công thức: nêu nỗi đau → giải pháp AI): `Bạn không lập ra công ty chỉ để [công việc lặp lại, tốn thời gian mà AI có thể làm thay].`
- Mô tả ngắn (công thức: cách hoạt động + kết quả đo được + thời gian setup): `DNK House giúp [đối tượng] [tự động hoá/giải quyết vấn đề cụ thể bằng AI], [con số/kết quả ấn tượng nếu có], sẵn sàng sử dụng chỉ trong [thời gian].`
- 2 CTA: nút primary hành động chính (`Liên hệ tư vấn` / `Bắt đầu`), nút secondary ít cam kết hơn (`Xem dịch vụ` / `Xem demo`)

**Feature grid (mỗi dịch vụ AI = icon + tên + 1 câu mô tả lợi ích)**
- `[Dịch vụ AI 1]` — [lợi ích chính trong 1 câu]
- `[Dịch vụ AI 2]` — [lợi ích chính trong 1 câu]
- `[Dịch vụ AI 3]` — [lợi ích chính trong 1 câu]
- (thêm/bớt theo số dịch vụ AI thật của DNK House — không cần cố định số lượng)

**Section theo công thức "vấn đề → cách giải quyết khác biệt"**
- Title: `[Giải quyết đúng vấn đề bằng AI], không chỉ [giải pháp tự động hời hợt]`
- Description: nêu cách tiếp cận AI của DNK House khác gì so với đối thủ/cách làm thủ công cũ
- Card bằng chứng trực quan đi kèm: progress/trạng thái triển khai, hoặc checklist năng lực

**Section quy trình làm việc**
- Title: `Quy trình triển khai AI rõ ràng, minh bạch`
- Các bước gợi ý: Tìm hiểu bài toán → Đề xuất giải pháp AI → Triển khai & tích hợp → Đồng hành & tối ưu

**Section đồng hành dài hạn**
- Title: `[Đối tác AI đồng hành] cùng [đối tượng khách hàng]`
- Nếu có testimonial thật, dùng trích dẫn thật; nếu chưa có, giữ nguyên placeholder `[Trích dẫn phản hồi thật...]` — không tự bịa lời khách hàng

**Value proposition ngắn (dùng làm câu nhấn giữa trang hoặc trong hero)**
- `Đối tác AI đáng tin cậy, chuẩn mực chuyên nghiệp`
- `[Điểm khác biệt cốt lõi của DNK House trong một câu]`

**Footer — nhóm liên kết**
- *Dịch vụ:* liệt kê từng dịch vụ AI chính của DNK House (link tới từng section tương ứng)
- *Công ty:* Về chúng tôi, Quy trình làm việc, Liên hệ
- *Pháp lý:* Chính sách bảo mật, Điều khoản dịch vụ
- Dải tagline khép lại phía trên copyright: `Bạn đã thấy cách chúng tôi làm việc. Giờ hãy để DNK House bắt tay vào việc.` + CTA liên hệ

**CTA banner cuối trang**
- Title: `Sẵn sàng bắt đầu cùng DNK House?`
- Mô tả: cam kết thời gian phản hồi cụ thể (vd: trong 24 giờ làm việc) + kênh liên hệ thật (email/điện thoại)

> Cần thông tin thật về DNK House (danh sách dịch vụ AI, đối tượng khách hàng, điểm
> khác biệt, thông tin liên hệ, số liệu thật nếu có) để thay thế toàn bộ placeholder
> `[...]` ở trên trước khi viết content thật cho site.
