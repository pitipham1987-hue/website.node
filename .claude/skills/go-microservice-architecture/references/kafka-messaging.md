# Async — Kafka Consumer Group (thay thế AMQP RPC)

> Trích từ Architecture Standard nội bộ (`ARCHITECT.md` mục 4.2). Đọc file này khi thiết kế bất kỳ luồng async nào (event, command) giữa các service.

**Lý do loại bỏ AMQP RPC**: pattern `fanout exchange + exclusive queue per instance` là **broadcast**, không phải **load-balance**. Khi scale N replica, cả N replica cùng xử lý một message → trùng lặp side-effect, không đạt mục tiêu HA. Kafka Consumer Group giải quyết đúng bài toán này bằng cơ chế **competing consumer dựa trên partition**.

## Nguyên tắc thiết kế

```
Producer (UseCase, qua interface Publisher)
        │
        ▼
   Kafka Topic (N partitions)
        │
   ┌────┴────┬────────┬────────┐
   ▼         ▼        ▼        ▼
 Pod 1     Pod 2    Pod 3    Pod 4      ← cùng Consumer Group ID
 (partition 0,1)  (partition 2)  (partition 3)  (idle nếu N pod > N partition)
```

Kafka tự động **rebalance** partition giữa các consumer đang sống trong cùng group khi pod scale lên/xuống — không cần code nào tự quản lý việc chia tải.

## Cấu trúc thư mục Kafka handler (bắt buộc)

```
internal/controller/kafka/
├── router.go            # map[topic]Handler, đăng ký handler theo domain
├── consumer_group.go    # lifecycle: Setup/ConsumeClaim/Cleanup, retry, DLQ
└── v1/
    ├── camera_event_handler.go   # xử lý topic "camera.health.events"
    └── alert_command_handler.go  # xử lý topic "alert.commands"
```

`router.go` chỉ làm việc route theo topic → handler, không chứa logic:

```go
func NewRouter(healthUC *camera_health.UseCase, alertUC *alerting.UseCase, l logger.Interface) map[string]Handler {
    return map[string]Handler{
        "camera.health.events": v1.NewCameraEventHandler(healthUC, l),
        "alert.commands":       v1.NewAlertCommandHandler(alertUC, l),
    }
}
```

## Chiến lược partitioning để đảm bảo ordering

**Quy tắc bắt buộc**: message key = **aggregate ID** của entity nghiệp vụ (không phải random key, không phải timestamp).

| Domain | Partition key | Lý do |
|---|---|---|
| Camera health event | `camera_id` | Mọi event của cùng 1 camera phải xử lý theo đúng thứ tự thời gian (online → offline → online không được đảo) |
| Alert command | `camera_id` hoặc `zone_id` | Alert cùng nguồn phải dedupe/order đúng trình tự |
| IOC/FalkorDB ingest | `entity_id` trong graph | Update cạnh (edge) của cùng 1 node không được chạy song song lệch thứ tự |

Kafka đảm bảo ordering **trong cùng một partition**, không đảm bảo ordering giữa các partition khác nhau. Vì vậy: chọn key sao cho **mọi message cần giữ thứ tự với nhau đều rơi vào cùng 1 partition** — dùng đúng aggregate ID làm key, tuyệt đối không dùng key ngẫu nhiên chỉ để "chia đều tải" (sẽ phá vỡ ordering).

```go
// pkg/kafka/producer.go — implement interface Publisher khai báo trong usecase
func (p *Producer) Publish(ctx context.Context, alert entity.Alert) error {
    return p.writer.WriteMessages(ctx, kafka.Message{
        Key:   []byte(alert.CameraID), // partition key = aggregate ID
        Value: mustMarshal(alert),
        Topic: "alert.commands",
    })
}
```

## Số lượng partition vs. số replica

**Quy định bắt buộc**: `số partition của topic ≥ maxReplicas dự kiến của consumer service`.

Lý do: số consumer đang active tối đa trong một group bị giới hạn bởi số partition (1 partition chỉ được 1 consumer trong group đọc tại một thời điểm). Nếu đặt `maxReplicas: 10` trong HPA nhưng topic chỉ có 3 partition, tối đa 3 pod có việc để làm — 7 pod còn lại idle, không đạt mục tiêu scale.

```
partitions >= maxReplicas (HPA spec)
```

Số partition **không giảm được** sau khi tạo topic ở hầu hết broker config — phải ước lượng dư ngay từ đầu (ví dụ đặt gấp 1.5–2 lần `maxReplicas` dự kiến dài hạn).

## Idempotency & DLQ (bắt buộc)

Kafka theo mặc định là **at-least-once delivery** — consumer group rebalance hoặc consumer crash giữa chừng có thể khiến message được xử lý lại. Do đó:

- Mọi Kafka handler trong `internal/controller/kafka/v1/` **bắt buộc idempotent** — dùng `event_id`/`message_id` unique kiểm tra đã xử lý chưa trước khi ghi side-effect (bảng `processed_events` trong Postgres, hoặc dùng Redis SETNX nếu cần latency thấp).
- Message xử lý lỗi liên tục (sau N lần retry) phải đẩy sang **Dead Letter Topic** (`<topic>.dlq`), không được `commit offset` rồi bỏ qua âm thầm, và không được block toàn bộ partition chờ retry vô hạn.
