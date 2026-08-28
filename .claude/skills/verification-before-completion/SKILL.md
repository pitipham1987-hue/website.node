---
name: verification-before-completion
description: Sử dụng khi chuẩn bị tuyên bố công việc đã hoàn thành, đã được sửa, hoặc đã pass, trước khi commit hoặc tạo PR — yêu cầu chạy lệnh xác minh và xác nhận output trước khi đưa ra bất kỳ tuyên bố thành công nào; bằng chứng luôn đi trước lời khẳng định
---

# Xác Minh Trước Khi Hoàn Thành (Verification Before Completion)

## Tổng Quan

**Nguyên tắc cốt lõi:** Bằng chứng luôn đi trước lời khẳng định.

**Vi phạm từng chữ của quy tắc này là vi phạm tinh thần của quy tắc.**

## Luật Thép (The Iron Law)

```
KHÔNG TUYÊN BỐ HOÀN THÀNH KHI CHƯA CÓ BẰNG CHỨNG XÁC MINH MỚI NHẤT
```

Nếu bạn chưa chạy lệnh xác minh ngay trong tin nhắn này, bạn không thể tuyên bố nó đã vượt qua.

## Hàm Cổng Kiểm Soát (The Gate Function)

```
TRƯỚC KHI tuyên bố bất kỳ trạng thái nào hoặc thể hiện sự hài lòng:

1. XÁC ĐỊNH: Lệnh nào chứng minh cho tuyên bố này?
2. CHẠY LỆNH: Thực thi ĐẦY ĐỦ lệnh đó (mới hoàn toàn, đầy đủ)
3. ĐỌC: Đọc toàn bộ output, kiểm tra exit code, đếm số lỗi thất bại
4. XÁC MINH: Output có xác nhận cho tuyên bố không?
   - Nếu KHÔNG: Tuyên bố trạng thái thực tế kèm theo bằng chứng
   - Nếu CÓ: Tuyên bố khẳng định KÈM THEO bằng chứng
5. CHỈ KHI ĐÓ: Mới đưa ra lời tuyên bố
```

## Các Thất Bại Phổ Biến

| Tuyên bố | Yêu cầu bắt buộc | Không đủ điều kiện |
|-------|----------|----------------|
| Các test đã vượt qua | Output lệnh test: 0 failures | Lần chạy trước đó, "chắc sẽ đỗ" |
| Linter sạch | Output Linter: 0 errors | Kiểm tra một phần, suy đoán |
| Build thành công | Lệnh build: exit 0 | Linter đỗ, log trông có vẻ ổn |
| Bug đã được sửa | Test triệu chứng ban đầu: đỗ | Code đã đổi, giả định đã sửa xong |
| Test thoái lùi (regression test) hoạt động | Chu kỳ Red-green được xác minh | Test đỗ 1 lần |
| Agent hoàn thành | VCS diff cho thấy các thay đổi | Agent báo cáo "thành công" |
| Đạt yêu cầu | Checklist kiểm tra từng dòng | Các bài test đỗ |

## Tín Hiệu Cảnh Báo (Red Flags) - DỪNG LẠI

- Dùng các từ "chắc là", "có lẽ", "có vẻ như"
- Thể hiện sự hài lòng trước khi xác minh ("Tuyệt quá!", "Hoàn hảo!", "Xong rồi!", v.v.)
- Chuẩn bị commit/push/PR mà chưa xác minh
- Tin tưởng các báo cáo thành công của agent
- Dựa vào xác minh một phần
- Nghĩ rằng "chỉ một lần này thôi"
- Mệt mỏi và muốn kết thúc công việc nhanh

## Ngăn Chặn Ngụy Biện

| Lời bào chữa | Thực tế |
|--------|---------|
| "Bây giờ chắc hoạt động rồi" | hãy CHẠY lệnh xác minh |
| "Tôi tự tin" | Sự tự tin ≠ bằng chứng |
| "Chỉ một lần này thôi" | Không có ngoại lệ |
| "Linter đã đỗ rồi" | Linter ≠ trình biên dịch (compiler) |
| "Agent nói thành công" | Hãy tự xác minh độc lập |
| "Tôi mệt rồi" | Mệt mỏi ≠ lý do bào chữa |
