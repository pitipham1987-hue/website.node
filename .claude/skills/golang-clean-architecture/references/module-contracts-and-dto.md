# Module Contracts, DTO, Naming, Result Type

## 1. Naming convention (predictable, domain-first)

```text
<Feature>UseCase          BillingUseCase
<Feature>Repository       (interface, khai báo trong usecase.go)
<feature>Repo              (struct implement, trong repository.go)  — lowercase vì không export ra ngoài feature
<Feature>Module            BillingModule (interface public, trong api/module.go)
<Feature>Controller        BillingController (nếu tách struct riêng, thường không cần — handler method đủ)
```

Tránh tên generic (`Manager`, `Helper`, `CommonService`, `Util`, `Processor`, `Handler`, `Data`, `BaseService`) trừ
khi abstraction có ý nghĩa rõ ràng và lặp lại thật (vd `RetryHandler` cho 1 cơ chế cụ thể thì OK — `DataHandler` thì
không).

Domain type phải dùng tên nghiệp vụ: `Invoice`, `Payment`, `Refund`, `Customer`, `Subscription` — không `Item`,
`Record`, `Entity1`.

## 2. `api/` — public contract của feature

`api/` là **package con** của feature, chỉ chứa:

- `module.go` — interface mà feature khác được phép gọi.
- `request.go` / `response.go` — DTO immutable (struct value, không con trỏ tới entity nội bộ).
- `errors.go` — sentinel error hoặc typed error public (`var ErrInvoiceNotFound = errors.New(...)`).

**Không** đặt trong `api/`: entity, ORM model, repository, internal usecase struct, DB row struct.

```go
// features/billing/api/module.go
package billingapi

type Module interface {
    CreateInvoice(ctx context.Context, req CreateInvoiceRequest) (InvoiceResult, error)
    GetInvoice(ctx context.Context, id string) (InvoiceResult, error)
}

// features/billing/api/request.go
type CreateInvoiceRequest struct {
    CustomerID string
    Items      []LineItem
}

// features/billing/api/response.go
type InvoiceResult struct {
    ID     string
    Total  int64  // cents — KHÔNG expose float cho tiền
    Status string
}
```

Feature khác (vd `notification`) import `billing "features/billing/api"`, **không** import `features/billing` gốc.

Ở gốc feature (`usecase.go`), struct `UseCase` implement interface `billingapi.Module` — wiring thực hiện ở
`internal/app`:

```go
// internal/app/app.go
var _ billingapi.Module = (*billing.UseCase)(nil) // compile-time check
```

## 3. DTO placement — cạnh nơi dùng

DTO chỉ phục vụ 1 endpoint có thể khai báo ngay trong file controller, không bắt buộc vào `api/` nếu **không có
feature nào khác cần dùng nó**. Chỉ những DTO thật sự là **contract public** (được feature khác hoặc client ngoài
dùng) mới lên `api/`.

Không tạo `dto/billing/`, `dto/customer/` global — tăng context switching, vi phạm Locality.

## 4. Result type — tránh return null / lỗi ngầm

Go không có sealed class, nhưng vẫn áp dụng nguyên lý "AI phải biết hết outcome có thể xảy ra":

- Trả `(T, error)` chuẩn Go — không trả `nil` cho pointer khi không rõ nghĩa (`(*Invoice)(nil), nil`) — dùng
  `error` để báo "not found" thay vì con trỏ nil im lặng.
- Với domain error, dùng **typed sentinel error** khai báo trong `api/errors.go`, kiểm tra bằng `errors.Is`:

```go
// features/billing/api/errors.go
var (
    ErrInvoiceNotFound   = errors.New("billing: invoice not found")
    ErrInvoiceFinalized  = errors.New("billing: invoice already finalized, cannot modify")
)
```

- Nếu cần nhiều outcome hơn `error` đơn giản (vd validation nhiều field), dùng struct kết quả tường minh thay vì
  panic hoặc map[string]interface{}:

```go
type ValidationResult struct {
    Valid  bool
    Errors []FieldError
}
```

## 5. Domain factory — không expose constructor phức tạp vô nghĩa

```go
// entity.go — ƯU TIÊN
func DraftInvoice(customerID string, items []LineItem) (Invoice, error) { ... }
func (i Invoice) Finalize() (Invoice, error) { ... } // trả instance mới nếu entity immutable, hoặc mutate + validate
func (i Invoice) Cancel(reason string) (Invoice, error) { ... }

// TRÁNH nếu che giấu business rule quan trọng
func NewInvoice(id, customerID string, items []LineItem, status string, total int64) Invoice { ... }
```

Method name phải thể hiện use case (`Finalize`, `Cancel`) chứ không phải setter chung chung (`SetStatus`).

## 6. Annotation / struct tag

Giảm tag lặp lại trên từng field nếu convention đã rõ (vd dùng `json` tag nhất quán snake_case toàn bộ `api/`, khai
báo 1 lần ở comment package thay vì lặp lại giải thích mỗi field). Với Fiber/gin, đặt validate tag ở tầng `api/`
request struct — không đặt validate tag trên entity nội bộ (entity không nên biết về HTTP).

## 7. WHY comment, không WHAT comment

```go
// SAI — giải thích cái code đã nói rồi
// Lấy invoice theo id
inv, err := repo.FindByID(ctx, id)

// ĐÚNG — giải thích business rule/constraint không nhìn thấy được từ code
// Invoice không được sửa sau khi kỳ kế toán đã đóng (xem DECISIONS.md #3).
if inv.FiscalPeriodClosed {
    return ErrInvoiceFinalized
}
```
