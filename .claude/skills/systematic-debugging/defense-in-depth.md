# Phân Tích & Bảo Vệ Chuyên Sâu (Defense-in-Depth Validation)

## Tổng Quan

Khi bạn sửa một bug gây ra bởi dữ liệu không hợp lệ, việc thêm bước validation tại một nơi có cảm giác là đủ. Nhưng bước kiểm tra duy nhất đó có thể bị bỏ qua bởi các luồng code khác, các đợt tái cấu trúc, hoặc các hàm mock.

**Nguyên tắc cốt lõi:** Validate tại MỌI tầng mà dữ liệu đi qua. Làm cho bug trở nên không thể xảy ra về mặt cấu trúc.

## 4 Tầng Bảo Vệ

1. **Tầng 1: Validation tại điểm đầu vào (Entry Point Validation)** — Từ chối input không hợp lệ ngay tại ranh giới API.
2. **Tầng 2: Validation tại logic nghiệp vụ (Business Logic Validation)** — Đảm bảo dữ liệu có ý nghĩa cho thao tác này.
3. **Tầng 3: Bảo vệ môi trường (Environment Guards)** — Ngăn chặn các thao tác nguy hiểm trong các ngữ cảnh cụ thể (ví dụ: cấm `git init` ngoài thư mục tạm khi chạy test).
4. **Tầng 4: Log gỡ lỗi (Debug Instrumentation)** — Ghi lại ngữ cảnh để phục vụ điều tra vết.
