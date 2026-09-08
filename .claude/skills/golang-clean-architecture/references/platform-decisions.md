# Platform-Level Decisions (đã chốt — không đề xuất lại)

Đây là bản rút gọn các quyết định hạ tầng đã được chốt trong `architect.md`/nghiên cứu `evrone/go-clean-template`
trước đó. Mục đích giống `DECISIONS.md` ở mục 19 của AI-First spec: ngăn AI đề xuất lại phương án đã đánh giá và loại
bỏ. Khi thiết kế/refactor một microservice mới, áp dụng thẳng các mục dưới đây trừ khi user nói rõ muốn xem lại.

> Nếu file `DECISIONS.md`/`architect.md` gốc (đầy đủ hơn, có phần "Context"/"Rejected alternatives") đã tồn tại
> trong repo hiện tại, ưu tiên đọc file đó — đây chỉ là bản tóm tắt mang theo skill để không mất context giữa các
> session.

## Decision: Kafka partition key = aggregate ID

**Quyết định:** Partition key luôn là aggregate ID (vd `invoiceID`, `cameraID`), không dùng random hay round-robin.
**Vì sao:** Đảm bảo ordering trong phạm vi 1 aggregate — mọi event của cùng 1 entity đi vào cùng 1 partition, consumer
xử lý tuần tự đúng thứ tự mà không cần lock phân tán.

## Decision: partition count ≥ maxReplicas

**Quyết định:** Số partition của mỗi topic phải ≥ `maxReplicas` (HPA max) của consumer group tương ứng.
**Vì sao:** Nếu partition < số pod tối đa, một số pod sẽ idle khi scale lên — lãng phí và che giấu vấn đề
throughput thật.

## Decision: migration như K8s Job riêng, có advisory lock

**Quyết định:** Database migration không chạy inline trong `main.go` lúc pod start (khác với ví dụ `-tags migrate`
mặc định của go-clean-template). Chạy như một K8s `Job` riêng, trước khi rollout Deployment, dùng Postgres advisory
lock (`pg_advisory_lock`) để tránh nhiều pod/migration job chạy song song đụng nhau khi rolling update hoặc nhiều
replica cùng khởi động.
**Vì sao:** Inline migration trong nhiều pod khởi động đồng thời (rolling update, HPA scale-up) gây race condition
trên schema.

## Decision: tắt prefork trong container

**Quyết định:** Với Fiber (hoặc framework có chế độ prefork), tắt `Prefork: true` khi chạy trong container/K8s.
**Vì sao:** Prefork tạo nhiều OS process con để tận dụng multi-core trên 1 host — mâu thuẫn với mô hình K8s vốn đã
scale bằng nhiều pod (mỗi pod nên là 1 process đơn, để `resources.requests/limits` và HPA đo đúng). Prefork trong
container còn phá health check/graceful shutdown signal handling mặc định.

## Decision: connection pool sizing

**Nguyên tắc chung (điều chỉnh theo số đo thực tế của service, không copy máy móc):**

```text
pool_size ≈ (số CPU core khả dụng cho pod × 2) + effective_disk_spindle_count
```

Với DB cloud-managed (RDS/CloudSQL/hầu hết Postgres managed), `effective_disk_spindle_count` xấp xỉ 1 (SSD network
storage) → công thức rút gọn còn `core × 2 + 1`. Sau đó **nhân với số replica pod tối đa (maxReplicas)** để tính
tổng connection tối đa DB phải chịu, và đối chiếu với `max_connections` của Postgres — nếu vượt, hạ pool per-pod hoặc
dùng PgBouncer ở giữa.

> Đây là công thức mặc định (dạng Little's Law áp dụng cho connection pool, tương tự khuyến nghị HikariCP). Nếu
> `architect.md` gốc của bạn có số liệu benchmark cụ thể khác cho từng loại service (IOC platform, AI camera,
> notification), dùng số đã benchmark thay vì công thức mặc định này.

## Ghi thêm quyết định mới

Khi có quyết định hạ tầng mới áp dụng cho nhiều service, thêm vào file này (hoặc `DECISIONS.md` gốc của repo) theo
mẫu:

```markdown
## Decision: <tên ngắn>

**Quyết định:** ...
**Vì sao:** ...
**Phương án đã loại:** ... (nếu có, để AI không đề xuất lại)
```
