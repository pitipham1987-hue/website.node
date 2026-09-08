# Directory Layout — chi tiết

## §0. Vì sao đảo trục so với go-clean-template gốc

`evrone/go-clean-template` tổ chức theo **layer trước** (đúng bản chất Clean Architecture của Uncle Bob, vốn thiết kế
cho monolith lớn):

```text
internal/
├── entity/       # tất cả entity của mọi domain, gộp chung
├── usecase/      # tất cả business logic, gộp chung
├── controller/   # tất cả handler (rest/grpc/amqp_rpc/nats_rpc), gộp chung
└── repo/
    ├── persistent/
    └── webapi/
```

Đây **không sai** — dependency inversion vẫn đúng, business logic vẫn sạch. Nhưng khi số domain tăng (auth, task,
translation... hoặc billing, customer, payment...), một AI agent hay một dev mới muốn sửa "invoice" phải mở tối thiểu
4 thư mục khác nhau (`entity/invoice.go`, `usecase/billing/...`, `controller/restapi/v1/billing.go`,
`repo/persistent/billing.go`) → vi phạm **Locality** (nguyên tắc #1 của AI-First).

Giải pháp: **giữ nguyên hướng dependency (entity/usecase độc lập framework) nhưng gom theo feature trước**. Đây chính
là pattern "Vertical Slice Architecture" áp dụng lên khung Clean Architecture — vẫn tôn trọng dependency rule của Uncle
Bob (business logic không phụ thuộc outer layer), chỉ đổi cách sắp xếp thư mục.

Quy tắc chuyển đổi 1-1 giữa hai style:

| go-clean-template gốc | Feature-sliced (skill này) |
|---|---|
| `internal/entity/invoice.go` | `internal/features/billing/entity.go` |
| `internal/usecase/billing.go` | `internal/features/billing/usecase.go` |
| `internal/repo/persistent/billing.go` | `internal/features/billing/repository.go` |
| `internal/controller/restapi/v1/billing.go` | `internal/features/billing/controller_rest.go` |
| `internal/controller/grpc/v1/billing.go` | `internal/features/billing/controller_grpc.go` |
| interface `Repository` trong `usecase` package | interface trong `internal/features/billing/api/module.go` hoặc ngay trong `usecase.go` nếu chỉ dùng nội bộ |

Nếu team đã quen go-clean-template gốc và service **nhỏ / single-domain**, xem mục 9 của SKILL.md — có thể giữ layout
gốc, không bắt buộc feature-slice.

## §1. `cmd/` (app/)

```text
cmd/
└── app/
    └── main.go     # load config + logger, gọi internal/app.Run()
```

Không đặt business logic, không đặt route, không đặt DI container ở đây — chỉ gọi `internal/app.Run(cfg)`.

## §2. `internal/app/` (composition root)

- Nơi **duy nhất** được phép import tất cả `features/*` cùng lúc — đây là "cross-cutting" hợp lệ duy nhất.
- Dùng "New..." constructor injection thủ công (theo go-clean-template) hoặc `google/wire` nếu graph DI lớn.
- Khởi tạo transport server (Fiber/gRPC/AMQP RPC/NATS RPC), wire route → controller → usecase → repo.
- Xử lý graceful shutdown (`select` + signal), health check, metrics endpoint.

```go
// internal/app/app.go
func Run(cfg *config.Config) {
    l := logger.New(cfg.Log.Level)

    pg, err := postgres.New(cfg.PG.URL, postgres.MaxPoolSize(cfg.PG.PoolMax))
    // ...

    billingRepo := billing.NewRepository(pg)
    billingUC := billing.NewUseCase(billingRepo, paymentmodule.New(...)) // gọi qua api/ của payment
    restapi.NewBillingRoutes(apiV1Group, billingUC, l)

    // ... graceful shutdown
}
```

## §3. `internal/platform/` (shared/)

Chỉ chứa abstraction **không biết business domain**, tương đương `pkg/` của go-clean-template nhưng nằm trong
`internal` nếu không cần publish ra ngoài repo:

```text
internal/platform/
├── logging/      # zerolog wrapper
├── errors/       # error taxonomy chung (NotFound, Conflict, Invalid...), KHÔNG chứa business error cụ thể
├── tracing/      # OpenTelemetry setup (giống pkg/tracing của go-clean-template)
├── pagination/   # cursor/offset helper dùng chung
├── txmanager/    # transaction wrapper dùng chung cho mọi repository
└── httpserver/   # graceful http server wrapper
```

Business-specific helper (vd `InvoiceCalculator`) **không** được đặt ở đây — đặt trong
`internal/features/billing/` dù có vẻ "tiện dùng lại". Nếu thật sự 2 feature cần logic giống hệt nhau, trích xuất
thành interface ở `platform` nhưng **implementation cụ thể vẫn ở feature**, hoặc tạo bounded context thứ 3 nếu logic
đó thật sự là một domain riêng.

## §4. `internal/features/<name>/`

Cấu trúc chuẩn 1 feature (map trực tiếp từ thuật ngữ Clean Architecture của go-clean-template):

```text
features/billing/
├── api/                     # PUBLIC — nơi duy nhất feature khác được import
│   ├── module.go            # type BillingModule interface { CreateInvoice(...) }
│   ├── request.go           # CreateInvoiceRequest
│   ├── response.go          # InvoiceResult
│   └── errors.go            # ErrInvoiceNotFound (sentinel/typed error public)
├── entity.go                # Invoice struct + Invoice.Draft(...)/Finalize(...)/Cancel(...)
├── usecase.go                # BillingUseCase — business logic thuần Go stdlib + interface Repository
├── repository.go             # billingRepo implements usecase.Repository, dùng pgx/squirrel
├── controller_rest.go        # Fiber/gin handler, map HTTP <-> api/ DTO
├── controller_grpc.go        # (nếu có) gRPC handler, map proto <-> api/ DTO
├── usecase_test.go           # test business logic với mock Repository (go.uber.org/mock)
├── repository_test.go        # integration test (testcontainers) — tuỳ chọn
└── README.md
```

Quy tắc trong `entity.go`/`usecase.go` (tầng trong cùng, **giữ nguyên luật của go-clean-template gốc**):

- Không import package nào của outer layer (`net/http`, `database/sql` driver cụ thể, `github.com/gofiber/*`,
  `google.golang.org/grpc`...).
- Chỉ dùng standard library + interface tự khai báo.
- Gọi outer layer (DB, webapi, RPC) qua interface được định nghĩa **ngay trong package usecase** (không phải trong
  repo package) — đây là điểm mấu chốt của Dependency Inversion: interface thuộc về consumer (usecase), không thuộc
  về provider (repository).

```go
// features/billing/usecase.go
package billing

// Interface do usecase định nghĩa — repository.go sẽ implement interface này,
// không phải ngược lại. Đây là Dependency Inversion đúng tinh thần go-clean-template.
type Repository interface {
    Save(ctx context.Context, inv Invoice) error
    FindByID(ctx context.Context, id string) (Invoice, error)
}

type PaymentModule interface { // import từ features/payment/api, KHÔNG import features/payment trực tiếp
    Charge(ctx context.Context, req paymentapi.ChargeRequest) (paymentapi.ChargeResult, error)
}

type UseCase struct {
    repo    Repository
    payment PaymentModule
}

func NewUseCase(repo Repository, payment PaymentModule) *UseCase {
    return &UseCase{repo: repo, payment: payment}
}
```

## §5. `pkg/`

Giữ như go-clean-template gốc: thư viện đủ generic để **tách ra dùng ở repo khác** (rabbitmq RPC client, nats RPC
client, jwt helper...). Khác `internal/platform` ở chỗ: `pkg/` không phụ thuộc bất kỳ config/type nội bộ nào của
service, có thể `go get` độc lập.

## §6. Khi feature quá lớn

Nếu 1 feature (vd `billing`) phình to (>1 entity chính, nhiều state machine phức tạp), phân rã tiếp theo business
capability con — **không phân rã theo loại class**:

```text
billing/
├── invoice/
├── refund/
└── pricing/
```

Mỗi thư mục con lặp lại đúng cấu trúc `api/ + entity + usecase + repository + controller` như một feature độc lập.

## §2 (Refactor). Inventory checklist khi đánh giá codebase hiện có

Khi user yêu cầu review/refactor service hiện tại, thu thập trước khi đề xuất:

- [ ] Layer hiện tại là gì (flat go-clean-template gốc, layer-first tự chế, hay đã feature-based)?
- [ ] Có global `dto/`, `utils/`, `helpers/`, `common/` không — nếu có, chứa gì, có business-specific không?
- [ ] Có dependency vòng giữa package nào không (`go list -deps` hoặc `goimports-reviser` phát hiện)?
- [ ] Entity/ORM model có bị leak ra HTTP response trực tiếp không (`json:` tag ngay trên GORM struct)?
- [ ] Controller có gọi thẳng `*sql.DB`/repo không, bỏ qua usecase?
- [ ] Test nằm ở `tests/` riêng hay cạnh code?

Sau khi có inventory, map từng phần vào bounded context (feature), rồi migrate **từng feature một** theo
`scripts/new_feature.sh` + di chuyển code thủ công + chạy `scripts/check_boundaries.sh`.
