# Cấu trúc thư mục & Tiêu chuẩn Layer

> Trích từ Architecture Standard nội bộ (`ARCHITECT.md` mục 2-3). Đọc file này khi cần chi tiết đầy đủ về từng layer, code mẫu, hoặc checklist review cho `internal/usecase`.

## Cấu trúc thư mục chuẩn hóa

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
│   ├── usecase/                    # ==== LÕI KIẾN TRÚC ====
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
│   │   └── kafka/                  # Thay thế AMQP RPC — xem kafka-messaging.md
│   │       ├── router.go
│   │       ├── consumer_group.go
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
│           └── event_publisher.go
│
├── pkg/                             # Thư viện hạ tầng dùng chung, KHÔNG chứa business logic
│   ├── httpserver/
│   ├── grpcserver/
│   ├── kafka/
│   │   ├── producer.go
│   │   └── consumer.go
│   ├── postgres/
│   │   └── postgres.go
│   ├── logger/
│   └── jwt/
│
├── migrations/
│   └── 000001_init.up.sql
│
├── deployments/
│   └── k8s/
│       ├── deployment.yaml
│       ├── migration-job.yaml       # xem ha-deployment.md
│       └── hpa.yaml
│
├── docs/
│   └── proto/
│
├── Dockerfile
├── Makefile
└── architect.md
```

**Quy tắc đặt tên bắt buộc:**
- Mỗi domain nghiệp vụ trong `usecase/` là **một package con riêng** — không gộp nhiều domain vào 1 file `usecase.go` chung.
- Controller `kafka/v1/*_handler.go` đặt tên theo **event/command xử lý**, không đặt tên theo topic vật lý (topic có thể đổi, tên nghiệp vụ thì không).

---

## Entity Layer (`internal/entity`)

- Struct thuần Go, có thể có method validate nội bộ (`func (c Camera) Validate() error`).
- **Cấm tuyệt đối**: struct tag của ORM/ODM cụ thể (`gorm:"..."`, `bson:"..."`), tag của framework HTTP (`json:"..."` được phép vì đây là format trung lập, nhưng không được có logic serialize gắn với 1 giao thức cụ thể).

---

## Usecase Layer — LÕI KIẾN TRÚC (`internal/usecase`)

Đây là phần **bắt buộc bảo toàn nguyên vẹn**. Mọi service mới phải tuân thủ đúng khuôn dưới đây.

**Nguyên tắc**: Interface mà usecase phụ thuộc được **khai báo bên trong chính package usecase** (consumer-defined interface), không khai báo trong package implement nó (`repo`, `kafka_producer`...).

```go
// internal/usecase/camera_health/usecase.go
package camera_health

import "context"

// ==== Interface khai báo TẠI ĐÂY — nơi usecase tiêu thụ ====
type CameraRepository interface {
    GetByID(ctx context.Context, id string) (Camera, error)
    UpdateStatus(ctx context.Context, id string, status Status) error
}

type AlertPublisher interface {
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

**Checklist review bắt buộc cho mọi PR chạm vào `usecase/`** (tự động hoá 1 phần bằng `scripts/check-usecase-boundary.sh`):
- [ ] File có dòng `import` nào trỏ tới `internal/controller`, `internal/repo`, hoặc `pkg/kafka`, `pkg/postgres` không? → Nếu có, **reject PR**.
- [ ] Interface có được khai báo trong chính package usecase, không phải trong package implement không?
- [ ] Unit test của usecase có chạy được **không cần** Docker Compose (Postgres/Kafka thật) không? Nếu cần → vi phạm decoupling.

---

## Controller Layer (`internal/controller`)

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

---

## Repo Layer (`internal/repo`)

Implement đúng interface đã khai báo ở usecase. Một package repo có thể implement interface của **nhiều** usecase khác nhau nếu hợp lý (ví dụ `CameraRepository` dùng chung cho cả `camera_health` và `camera_management`).

---

## Wiring (`internal/app/app.go`)

```go
func Run(cfg *config.Config) {
    l := logger.New(cfg.Log.Level)

    pg := postgres.New(cfg.PG.URL, postgres.WithPoolSettings(cfg.PG)) // xem ha-deployment.md
    defer pg.Close()

    kafkaProducer := kafkaproducer.New(cfg.Kafka.Brokers)
    vaultClient   := vault.New(cfg.Vault.Addr)

    cameraRepo := persistent.NewCameraRepo(pg)
    alertPub   := kafka_producer.NewAlertPublisher(kafkaProducer)

    healthUC := camera_health.New(cameraRepo, alertPub, vaultClient)

    httpSrv := httpserver.New(l, httpserver.Port(cfg.HTTP.Port)) // Prefork: false — ha-deployment.md
    restapi.NewRouter(httpSrv.App, healthUC, l)

    grpcSrv := grpcserver.New(l, grpcserver.Port(cfg.GRPC.Port))
    grpcctl.NewRouter(grpcSrv.App, healthUC, l)

    kafkaRouter := kafkactl.NewRouter(healthUC, l)
    consumerGroup := kafkaconsumer.New(cfg.Kafka.Brokers, cfg.Kafka.GroupID, kafkaRouter, l)

    // start + graceful shutdown giữ nguyên pattern gốc (SIGTERM handling)
}
```

## Sync Data Flow — HTTP / gRPC

```
Client ──HTTP/gRPC──> Controller ──> UseCase ──> Repository (Postgres)
Client <──HTTP/gRPC── Controller <── UseCase <── Repository (Postgres)
```

Đặc tính bắt buộc: **stateless hoàn toàn** ở tầng controller. Auth qua JWT (không session server-side) để mọi replica xử lý request độc lập, không cần sticky session.
