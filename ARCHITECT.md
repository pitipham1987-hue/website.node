# Architecture Standard: Go Microservice Template

> **Kế thừa từ**: `evrone/go-clean-template` (Clean Architecture core)
> **Điều chỉnh cho**: Distributed systems, Kafka-first async messaging, Kubernetes multi-replica (HA)
> **Phạm vi áp dụng**: Mọi microservice Go mới trong hệ thống AI Camera / Video Analytics / Smart City-IOC
> **Trạng thái**: Bắt buộc tuân thủ (mandatory), sai lệch phải có ADR giải trình

---

## 1. Tổng quan Kiến trúc

### 1.1 Nguyên lý lõi (không được vi phạm)

Kiến trúc dựa trên **Dependency Inversion Principle** (SOLID) làm trục xoay duy nhất. Toàn bộ codebase chia thành 2 vùng, hướng phụ thuộc chỉ đi một chiều — **từ ngoài vào trong**:

```
┌─────────────────────────────────────────────────┐
│  OUTER LAYER (Infrastructure / Tools)            │
│  HTTP · gRPC · Kafka · Postgres · Redis · Vault  │
│                                                   │
│   ┌───────────────────────────────────────────┐ │
│   │  INNER LAYER (Business Logic)              │ │
│   │  entity · usecase                          │ │
│   │  → chỉ dùng Go standard library             │ │
│   │  → không import bất kỳ package outer nào    │ │
│   └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
      hướng phụ thuộc: outer ──> inner (luôn luôn)
```

**Quy tắc bất biến**:

1. Package `internal/usecase` và `internal/entity` **không được** import bất kỳ package nào dưới `internal/controller`, `internal/repo`, hoặc `pkg/*` (trừ các thư viện chuẩn hóa lỗi/validate không mang tính hạ tầng).
2. Mọi giao tiếp giữa outer và inner đi qua **interface khai báo tại nơi tiêu thụ** (consumer-defined interface) — xem mục 3.2.
3. Toàn bộ wiring (dependency injection) tập trung **duy nhất** tại `internal/app/app.go`. Không có constructor nào ở nơi khác tự ý tạo dependency cụ thể (concrete type) rồi truyền xuống usecase.

### 1.2 Điều chỉnh so với go-clean-template gốc

| Hạng mục | go-clean-template gốc | Chuẩn nội bộ (template này) |
|---|---|---|
| Async transport | AMQP RPC (RabbitMQ, fanout + exclusive queue) | **Kafka Consumer Group** — competing consumer, partition-based load balancing |
| Sync transport | REST (Fiber) + gRPC | Giữ nguyên: REST (Fiber) + gRPC |
| Prefork (Fiber) | Tùy chọn, mặc định có thể bật | **Bắt buộc tắt** trên K8s/Docker (mục 5.1) |
| DB Migration | Chạy trong `cmd/app` qua build tag `migrate` | **Tách khỏi vòng đời app pod** — Init Container / K8s Job (mục 5.2) |
| DB Connection Pool | Không quy định tham số | Bắt buộc cấu hình 3 tham số + công thức tính theo `maxReplicas` (mục 5.3) |
| HA / Scale-out | Không đề cập | Là yêu cầu thiết kế bậc nhất (first-class concern), không phải bổ sung sau |

### 1.3 Mục tiêu thiết kế

- **Testability**: business logic test được bằng mock, không cần Kafka/Postgres thật.
- **Portability**: đổi Postgres → thứ khác, đổi Kafka → thứ khác, không sửa `usecase`.
- **Horizontal scalability an toàn**: mọi service sinh ra từ template này scale từ 1 → N replica trên K8s mà không cần sửa code, chỉ cần đúng cấu hình (Prefork off, pool đúng công thức, migration tách riêng, Kafka partition ≥ replica).

---

## 2. Cấu trúc thư mục (chuẩn hóa)

```
.
├── cmd/
│   └── app/
│       └── main.go                 # Chỉ khởi tạo config + logger, gọi app.Run()
│
├── config/
│   ├── config.go                   # Struct config, đọc từ env (12-factor)
│   └── config.yml                  # Default value cho local dev (không chứa secret)
│
├── internal/
│   ├── app/
│   │   └── app.go                  # DUY NHẤT nơi wiring DI toàn bộ hệ thống
│   │
│   ├── entity/                     # Model nghiệp vụ thuần, không phụ thuộc gì
│   │   ├── camera.go
│   │   └── alert.go
│   │
│   ├── usecase/                    # ==== LÕI KIẾN TRÚC — xem mục 3.2 ====
│   │   ├── camera_health/
│   │   │   ├── usecase.go          # struct UseCase + interface phụ thuộc
│   │   │   └── usecase_test.go     # unit test bằng mock, không cần hạ tầng thật
│   │   └── alerting/
│   │       ├── usecase.go
│   │       └── usecase_test.go
│   │
│   ├── controller/                 # Outer layer — vỏ giao thức, mỏng, không chứa logic
│   │   ├── http/
│   │   │   ├── router.go
│   │   │   └── v1/
│   │   │       └── camera_handler.go
│   │   ├── grpc/
│   │   │   ├── router.go
│   │   │   └── v1/
│   │   │       └── camera_service.go
│   │   └── kafka/                  # ==== THAY THẾ AMQP RPC — xem mục 4.2 ====
│   │       ├── router.go           # đăng ký topic → handler
│   │       ├── consumer_group.go   # wrap sarama/kgo consumer group lifecycle
│   │       └── v1/
│   │           ├── camera_event_handler.go
│   │           └── alert_command_handler.go
│   │
│   └── repo/                       # Outer layer — implementation cụ thể
│       ├── persistent/
│       │   └── camera_repo.go      # implement interface khai báo trong usecase
│       ├── webapi/
│       │   └── notification_client.go
│       └── kafka_producer/
│           └── event_publisher.go  # implement interface Publisher khai báo trong usecase
│
├── pkg/                             # Thư viện hạ tầng dùng chung, KHÔNG chứa business logic
│   ├── httpserver/
│   ├── grpcserver/
│   ├── kafka/
│   │   ├── producer.go
│   │   └── consumer.go
│   ├── postgres/
│   │   └── postgres.go             # bọc *sql.DB, áp cấu hình pool chuẩn (mục 5.3)
│   ├── logger/
│   └── jwt/
│
├── migrations/                      # SQL migration files (golang-migrate format)
│   └── 000001_init.up.sql
│
├── deployments/
│   └── k8s/
│       ├── deployment.yaml
│       ├── migration-job.yaml       # xem mục 5.2
│       └── hpa.yaml
│
├── docs/
│   └── proto/                       # .proto cho gRPC
│
├── Dockerfile
├── Makefile
└── architect.md                     # tài liệu này
```

**Quy tắc đặt tên bắt buộc**:
- Mỗi domain nghiệp vụ trong `usecase/` là **một package con riêng** (không gộp nhiều domain vào 1 file `usecase.go` chung).
- Controller `kafka/v1/*_handler.go` đặt tên theo **event/command xử lý**, không đặt tên theo topic vật lý (topic có thể đổi, tên nghiệp vụ thì không).

---

## 3. Tiêu chuẩn các Layer

### 3.1 Entity Layer (`internal/entity`)

- Struct thuần Go, có thể có method validate nội bộ (`func (c Camera) Validate() error`).
- **Cấm tuyệt đối**: struct tag của ORM/ODM cụ thể (`gorm:"..."`, `bson:"..."`), tag của framework HTTP (`json:"..."` được phép vì đây là format trung lập, nhưng không được có logic serialize gắn với 1 giao thức cụ thể).

### 3.2 Usecase Layer — LÕI KIẾN TRÚC (`internal/usecase`)

Đây là phần **bắt buộc bảo toàn nguyên vẹn** từ go-clean-template gốc. Mọi service mới đều phải tuân thủ đúng khuôn dưới đây.

**Nguyên tắc**: Interface mà usecase phụ thuộc được **khai báo bên trong chính package usecase** (consumer-defined interface), không khai báo trong package implement nó (`repo`, `kafka_producer`...).

```go
// internal/usecase/camera_health/usecase.go
package camera_health

import "context"

// ==== Interface khai báo TẠI ĐÂY — nơi usecase tiêu thụ ====
// Package repo/persistent, repo/kafka_producer sẽ implement các interface này,
// nhưng KHÔNG được import ngược lại package camera_health.

type CameraRepository interface {
    GetByID(ctx context.Context, id string) (Camera, error)
    UpdateStatus(ctx context.Context, id string, status Status) error
}

type AlertPublisher interface {
    // Publish đẩy sự kiện async — implementation thật là Kafka producer,
    // nhưng usecase chỉ biết "tôi cần publish một alert", không biết Kafka là gì.
    Publish(ctx context.Context, alert Alert) error
}

type CredentialStore interface {
    GetRTSPCredential(ctx context.Context, cameraID string) (Credential, error)
}

// ==== Struct nghiệp vụ ====

type UseCase struct {
    repo       CameraRepository
    publisher  AlertPublisher
    credential CredentialStore
}

// New — constructor duy nhất, nhận toàn bộ dependency qua interface.
// Không có logic khởi tạo Kafka/Postgres nào ở đây.
func New(repo CameraRepository, publisher AlertPublisher, cred CredentialStore) *UseCase {
    return &UseCase{repo: repo, publisher: publisher, credential: cred}
}

func (uc *UseCase) CheckHealth(ctx context.Context, cameraID string) error {
    cred, err := uc.credential.GetRTSPCredential(ctx, cameraID)
    if err != nil {
        return err
    }
    // ... logic goroutine per-camera, exponential backoff nằm ở đây ...
    if unhealthy {
        return uc.publisher.Publish(ctx, Alert{CameraID: cameraID, Reason: "rtsp_timeout"})
    }
    return nil
}
```

**Checklist review bắt buộc cho mọi PR chạm vào `usecase/`**:

- [ ] File có dòng `import` nào trỏ tới `internal/controller`, `internal/repo`, hoặc `pkg/kafka`, `pkg/postgres` không? → Nếu có, **reject PR**.
- [ ] Interface có được khai báo trong chính package usecase, không phải trong package implement không?
- [ ] Unit test của usecase có chạy được **không cần** Docker Compose (Postgres/Kafka thật) không? Nếu cần → vi phạm decoupling.

### 3.3 Controller Layer (`internal/controller`)

Nguyên tắc: **mỏng, câm (dumb), không chứa business rule**.

```go
// internal/controller/http/v1/camera_handler.go
func (h *Handler) checkHealth(c *fiber.Ctx) error {
    cameraID := c.Params("id")
    if err := h.uc.CheckHealth(c.Context(), cameraID); err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(errResponse(err))
    }
    return c.SendStatus(fiber.StatusOK)
}
```

Controller chỉ làm 3 việc: (1) parse request theo format giao thức, (2) gọi đúng 1 method usecase, (3) format response theo giao thức. Không có `if/else` nghiệp vụ, không gọi trực tiếp `repo`.

### 3.4 Repo Layer (`internal/repo`)

Implement đúng interface đã khai báo ở usecase. Một package repo có thể implement interface của **nhiều** usecase khác nhau nếu hợp lý (ví dụ `CameraRepository` dùng chung cho cả `camera_health` và `camera_management`).

### 3.5 Wiring (`internal/app/app.go`)

```go
func Run(cfg *config.Config) {
    l := logger.New(cfg.Log.Level)

    pg := postgres.New(cfg.PG.URL, postgres.WithPoolSettings(cfg.PG)) // xem mục 5.3
    defer pg.Close()

    kafkaProducer := kafkaproducer.New(cfg.Kafka.Brokers)
    vaultClient   := vault.New(cfg.Vault.Addr)

    cameraRepo := persistent.NewCameraRepo(pg)
    alertPub   := kafka_producer.NewAlertPublisher(kafkaProducer)

    healthUC := camera_health.New(cameraRepo, alertPub, vaultClient)

    // Sync transport
    httpSrv := httpserver.New(l, httpserver.Port(cfg.HTTP.Port)) // Prefork: false — mục 5.1
    restapi.NewRouter(httpSrv.App, healthUC, l)

    grpcSrv := grpcserver.New(l, grpcserver.Port(cfg.GRPC.Port))
    grpcctl.NewRouter(grpcSrv.App, healthUC, l)

    // Async transport — Kafka Consumer Group thay thế AMQP RPC
    kafkaRouter := kafkactl.NewRouter(healthUC, l)
    consumerGroup := kafkaconsumer.New(cfg.Kafka.Brokers, cfg.Kafka.GroupID, kafkaRouter, l)

    // start + graceful shutdown giữ nguyên pattern gốc (SIGTERM handling)
}
```

---

## 4. Data Flow & Giao tiếp

### 4.1 Sync — HTTP / gRPC

Không đổi so với go-clean-template gốc:

```
Client ──HTTP/gRPC──> Controller ──> UseCase ──> Repository (Postgres)
Client <──HTTP/gRPC── Controller <── UseCase <── Repository (Postgres)
```

Đặc tính bắt buộc: **stateless hoàn toàn** ở tầng controller. Auth qua JWT (không session server-side) để mọi replica xử lý request độc lập, không cần sticky session.

### 4.2 Async — Kafka Consumer Group (thay thế AMQP RPC)

**Lý do loại bỏ AMQP RPC**: pattern `fanout exchange + exclusive queue per instance` là **broadcast**, không phải **load-balance**. Khi scale N replica, cả N replica cùng xử lý một message → trùng lặp side-effect, không đạt mục tiêu HA. Kafka Consumer Group giải quyết đúng bài toán này bằng cơ chế **competing consumer dựa trên partition**.

#### 4.2.1 Nguyên tắc thiết kế

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

#### 4.2.2 Cấu trúc thư mục Kafka handler (bắt buộc)

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

#### 4.2.3 Chiến lược partitioning để đảm bảo ordering

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

#### 4.2.4 Số lượng partition vs. số replica

**Quy định bắt buộc**: `số partition của topic ≥ maxReplicas dự kiến của consumer service`.

Lý do: số consumer đang active tối đa trong một group bị giới hạn bởi số partition (1 partition chỉ được 1 consumer trong group đọc tại một thời điểm). Nếu đặt `maxReplicas: 10` trong HPA nhưng topic chỉ có 3 partition, tối đa 3 pod có việc để làm — 7 pod còn lại idle, không đạt mục tiêu scale.

```
partitions >= maxReplicas (HPA spec)
```

Số partition **không giảm được** sau khi tạo topic ở hầu hết broker config — phải ước lượng dư ngay từ đầu (ví dụ đặt gấp 1.5–2 lần `maxReplicas` dự kiến dài hạn).

#### 4.2.5 Idempotency & DLQ (bắt buộc)

Kafka theo mặc định là **at-least-once delivery** — consumer group rebalance hoặc consumer crash giữa chừng có thể khiến message được xử lý lại. Do đó:

- Mọi Kafka handler trong `internal/controller/kafka/v1/` **bắt buộc idempotent** — dùng `event_id`/`message_id` unique kiểm tra đã xử lý chưa trước khi ghi side-effect (bảng `processed_events` trong Postgres, hoặc dùng Redis SETNX nếu cần latency thấp).
- Message xử lý lỗi liên tục (sau N lần retry) phải đẩy sang **Dead Letter Topic** (`<topic>.dlq`), không được `commit offset` rồi bỏ qua âm thầm, và không được block toàn bộ partition chờ retry vô hạn.

---

## 5. HA & Deployment Guidelines

### 5.1 Prefork — BẮT BUỘC TẮT trên Kubernetes/Docker

**Quy định**: `cfg.HTTP.UsePreforkMode = false` cho mọi môi trường chạy trong container orchestrator (K8s, Docker Swarm). Prefork chỉ được phép bật trong benchmark local trên bare-metal.

**Lý do**: Prefork của Fiber spawn nhiều OS process **trong cùng một container**, dùng `SO_REUSEPORT` để tận dụng multi-core. Đây là cơ chế scale-out ở **tầng process trong 1 host** — xung đột trực tiếp với mô hình K8s, nơi đơn vị scale là **Pod** (1 process = 1 container là chuẩn):

- CPU request/limit của container tính trên tổng nhiều process con → HPA đọc metric CPU sai lệch, autoscale quyết định nhầm.
- Liveness/readiness probe chỉ theo dõi được 1 entrypoint process, không phản ánh đúng trạng thái các process con.
- Log của từng process con không có `pod_name` phân biệt rõ ràng trong log aggregation (Loki/ELK).

Để tận dụng multi-core CPU trên K8s: **tăng số replica** (đúng đơn vị scale của orchestrator), không dùng prefork.

```yaml
# config/config.yml — giá trị bắt buộc cho môi trường K8s
http:
  use_prefork_mode: false
```

### 5.2 Database Migration — Tách khỏi vòng đời App Pod

**Cấm tuyệt đối**: chạy migration tự động bên trong `cmd/app/main.go` khi service khởi động trong môi trường multi-replica. Nếu N pod cùng khởi động song song (rolling update, hoặc HPA scale-up đột ngột), N pod cùng chạy migration → race condition trên schema (duplicate index, lock timeout, hoặc migration chạy 2 lần gây lỗi không idempotent).

**Kiến trúc chuẩn — chọn 1 trong 2 phương án theo mức độ rủi ro của migration:**

**Phương án A (mặc định, khuyến nghị): K8s Job chạy riêng, tách khỏi Deployment**

```yaml
# deployments/k8s/migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate-{{ .Release.Revision }}
spec:
  backoffLimit: 2
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: myservice:{{ .Values.image.tag }}
          command: ["./app", "-tags", "migrate"]
          envFrom:
            - secretRef: { name: db-credentials }
```

Pipeline CI/CD **bắt buộc** đợi Job hoàn tất (`kubectl wait --for=condition=complete job/db-migrate`) trước khi apply Deployment mới. Đây là bước gate, không được chạy song song với rollout.

**Phương án B (khi không kiểm soát được thứ tự CI/CD): Distributed Lock qua Postgres Advisory Lock**

Nếu bắt buộc phải giữ migration trong `initContainer` của từng pod (ví dụ hệ thống chưa có pipeline riêng cho Job), dùng `pg_advisory_lock` để đảm bảo chỉ 1 pod thực thi migration, các pod còn lại chờ:

```go
// pkg/postgres/migrate_lock.go
const migrationLockID = 918273645 // ID cố định, duy nhất cho service này

func RunMigrationWithLock(db *sql.DB, migrateFn func() error) error {
    _, err := db.Exec("SELECT pg_advisory_lock($1)", migrationLockID)
    if err != nil {
        return err
    }
    defer db.Exec("SELECT pg_advisory_unlock($1)", migrationLockID)
    return migrateFn()
}
```

Phương án A luôn được ưu tiên — tách rõ ràng vòng đời "chuẩn bị schema" khỏi vòng đời "phục vụ traffic" giúp rollback và audit dễ hơn nhiều so với lock ngầm trong initContainer.

### 5.3 Database Connection Pool — Tham số bắt buộc

Mọi service khởi tạo `*sql.DB` (qua `pkg/postgres`) **bắt buộc** cấu hình đủ 3 tham số sau — không được dùng giá trị mặc định của driver (`SetMaxOpenConns` mặc định là unlimited, rất nguy hiểm khi scale ngang).

```go
// pkg/postgres/postgres.go
func New(dsn string, opts ...Option) (*Postgres, error) {
    db, err := sql.Open("pgx", dsn)
    if err != nil {
        return nil, err
    }

    db.SetMaxOpenConns(cfg.PoolMax)          // bắt buộc — xem công thức bên dưới
    db.SetMaxIdleConns(cfg.PoolMax / 2)       // bắt buộc — tránh giữ idle conn quá nhiều
    db.SetConnMaxLifetime(30 * time.Minute)   // bắt buộc — tránh connection "chết" do LB/firewall timeout
    db.SetConnMaxIdleTime(5 * time.Minute)    // khuyến nghị — giải phóng idle conn không dùng tới

    return &Postgres{db: db}, nil
}
```

**Công thức bắt buộc tính `PoolMax` trước khi deploy**:

```
PoolMax (mỗi replica) × maxReplicas (HPA)  <  max_connections (Postgres) − reserved_connections − buffer
```

Ví dụ cụ thể: Postgres `max_connections = 200`, dành `20` connection cho superuser/admin tool, buffer an toàn `20` → ngân sách khả dụng `160`. Nếu HPA cho phép scale tới `maxReplicas = 16` → `PoolMax` mỗi replica **tối đa 10**.

| Tham số | Giá trị khuyến nghị | Ghi chú |
|---|---|---|
| `SetMaxOpenConns` | Tính theo công thức trên, **không** để mặc định (unlimited) | Vượt quá → Postgres từ chối kết nối, cascading failure toàn hệ thống |
| `SetMaxIdleConns` | `≈ PoolMax / 2`, tối thiểu 2 | Idle conn quá cao lãng phí tài nguyên Postgres khi traffic thấp |
| `SetConnMaxLifetime` | 15–30 phút | Tránh connection bị LB/firewall/pgbouncer âm thầm cắt mà driver không biết |
| `SetConnMaxIdleTime` | 5 phút | Dọn connection idle lâu, đặc biệt quan trọng khi traffic dao động mạnh |

**Khi `maxReplicas` lớn (>15–20) hoặc nhiều service cùng chia sẻ 1 Postgres instance**: bắt buộc đặt **PgBouncer** (transaction pooling mode) giữa app và Postgres, không để mỗi service tự mở pool trực tiếp — tránh cạn kiệt `max_connections` toàn cluster khi nhiều service cùng scale đồng thời.

### 5.4 Checklist HA trước khi merge vào `main`

- [ ] `use_prefork_mode: false` trong mọi config file dùng cho K8s/Docker.
- [ ] Migration không nằm trong `cmd/app/main.go` chạy mặc định — có Job hoặc advisory lock riêng.
- [ ] `SetMaxOpenConns/SetMaxIdleConns/SetConnMaxLifetime` được set tường minh, giá trị đã tính theo công thức ở 5.3.
- [ ] Số partition Kafka topic ≥ `maxReplicas` khai báo trong `hpa.yaml`.
- [ ] Mọi Kafka handler có kiểm tra idempotency và có Dead Letter Topic.
- [ ] `waitForShutdown` xử lý đúng `SIGTERM`, có `terminationGracePeriodSeconds` phù hợp trong `deployment.yaml` (đủ thời gian để in-flight request/message hoàn tất).
- [ ] Readiness probe kiểm tra được kết nối Postgres + Kafka broker, không chỉ trả `200 OK` tĩnh.
- [ ] Không có state (session, cache) lưu trong RAM của process — nếu cần cache, dùng Redis qua interface khai báo ở usecase (mục 3.2).
