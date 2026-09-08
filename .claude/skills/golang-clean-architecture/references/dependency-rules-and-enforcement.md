# Dependency Rules & Enforcement (CI)

Kiến trúc không được chỉ nằm trong tài liệu — phải fail CI khi vi phạm. Dùng 2 lớp: `depguard` (đã có sẵn trong
golangci-lint, không cần cài thêm) làm lớp chính, và `go-arch-lint` cho rule phức tạp hơn (tuỳ chọn).

## 1. `.golangci.yml` — depguard rules

```yaml
linters:
  enable:
    - depguard

linters-settings:
  depguard:
    rules:
      # entity/usecase (business logic) không được đụng outer layer
      business-logic-purity:
        files:
          - "**/features/*/entity.go"
          - "**/features/*/usecase.go"
        deny:
          - pkg: "net/http"
            desc: "usecase/entity không được import net/http — vi phạm dependency inversion"
          - pkg: "google.golang.org/grpc"
            desc: "usecase/entity không được biết gRPC"
          - pkg: "github.com/gofiber/fiber"
            desc: "usecase/entity không được biết HTTP framework"
          - pkg: "$gostd/database/sql"
            desc: "usecase/entity không được import driver DB trực tiếp — dùng interface Repository"
          - pkg: "github.com/jackc/pgx"
            desc: "usecase/entity không được import driver Postgres trực tiếp"

      # platform (shared) không được biết business domain
      platform-no-business:
        files:
          - "**/internal/platform/**/*.go"
        deny:
          - pkg: "**/internal/features"
            desc: "platform (shared) không được import bất kỳ features/* nào"

      # feature khác chỉ được import qua api/ của nhau
      cross-feature-boundary:
        files:
          - "**/internal/features/billing/**/*.go"
        deny:
          - pkg: "**/internal/features/payment"
            desc: "billing chỉ được import features/payment/api, không import features/payment trực tiếp"
          - pkg: "**/internal/features/customer"
            desc: "billing chỉ được import features/customer/api, không import features/customer trực tiếp"
      # lặp lại 1 rule "cross-feature-boundary-<feature>" cho mỗi feature — script new_feature.sh
      # tự sinh block này khi scaffold feature mới.
```

> Ghi chú: `deny.pkg` của depguard hỗ trợ pattern nhưng để loại trừ chính xác `features/payment` mà vẫn cho phép
> `features/payment/api`, cần liệt kê rule riêng cho từng feature (không có wildcard phủ định gọn trong depguard) —
> `scripts/new_feature.sh` sinh sẵn block tương ứng khi tạo feature mới để tránh quên.

## 2. `go-arch-lint.yml` (tuỳ chọn, nếu cần rule mạnh hơn + visualize)

```yaml
version: 3
workdir: .
vendors: { mode: strict }
components:
  platform: { in: internal/platform/** }
  app:      { in: internal/app/** }
  billing:      { in: internal/features/billing/** }
  billing-api:  { in: internal/features/billing/api/** }
  payment:      { in: internal/features/payment/** }
  payment-api:  { in: internal/features/payment/api/** }
commonComponents: []
deps:
  billing:
    mayDependOn: [payment-api, platform]
  billing-api:
    mayDependOn: []          # api/ của chính mình chỉ dùng stdlib
  payment:
    mayDependOn: [platform]
  app:
    mayDependOn: [billing, payment, platform, billing-api, payment-api]
  platform:
    mayDependOn: []
```

Chạy: `go-arch-lint check` trong CI; `go-arch-lint graph` để xuất ảnh dependency graph review PR.

## 3. `scripts/check_boundaries.sh` — fallback không cần cài tool

Dùng khi chưa setup `depguard`/`go-arch-lint` (vd service mới, prototype). Dựa trên `go list -deps` + `grep`, phát
hiện 2 vi phạm phổ biến nhất:

1. `features/X` import trực tiếp package không phải `features/Y/api` của feature khác.
2. `internal/platform` import bất kỳ gì trong `internal/features`.

Xem chi tiết implementation ở `scripts/check_boundaries.sh`. Thêm vào CI:

```yaml
# .github/workflows/ci.yml (đoạn thêm)
- name: Check architecture boundaries
  run: ./scripts/check_boundaries.sh ./...
```

## 4. Circular dependency

Khi `go build` báo "import cycle not allowed" giữa 2 feature: **dừng lại**, không tự ý gộp package hay import
internal struct để qua lỗi compile. Nguyên nhân gần như luôn là 1 trong 2:

- Thiếu tầng orchestration: nghiệp vụ thật ra cần 1 usecase thứ 3 (ở `internal/app` hoặc 1 feature mới) gọi cả A và
  B, thay vì A gọi B và B gọi A.
- Boundary sai: 2 feature đang thực ra là 1 bounded context, nên gộp lại thay vì tách.

Ghi quyết định xử lý vào `DECISIONS.md`.

## 4b. Tie-in với `requesting-code-review` (superpowers)

Khi dùng skill `requesting-code-review`/`receiving-code-review` của superpowers, thêm 2 mục sau vào checklist review,
xếp cùng mức độ nghiêm trọng với 1 test fail (block merge nếu vi phạm):

- [ ] `scripts/check_boundaries.sh` (hoặc `depguard`/`go-arch-lint` trong CI) pass.
- [ ] Không entity/ORM model nào lộ ra `api/` của feature vừa đổi.

## 5. Definition of Done — mỗi feature

- [ ] Nằm trong `internal/features/<name>/` riêng, có boundary rõ.
- [ ] Có `api/` — public contract tách biệt implementation.
- [ ] Không entity/ORM model nào lộ ra `api/`.
- [ ] DTO nằm cạnh nơi dùng (`api/` nếu public, cạnh controller nếu chỉ nội bộ).
- [ ] Test (`*_test.go`) nằm cạnh code, không tách `tests/` riêng.
- [ ] Có `README.md` (≤10 dòng: làm gì / entry point / public API / dependency / constraint đặc biệt).
- [ ] Quyết định kiến trúc quan trọng đã ghi vào `DECISIONS.md`.
- [ ] Naming predictable (`<Feature>UseCase`, `<Feature>Module`, không dùng `Manager`/`Helper` vô nghĩa).
- [ ] Không dependency vòng với feature khác.
- [ ] Không global utility mới tạo ra chỉ để dùng cho 1 feature.
- [ ] `depguard`/`go-arch-lint`/`check_boundaries.sh` pass trong CI.
- [ ] Một AI agent có thể hiểu feature chỉ bằng: README + api/ + file cần sửa + test liên quan.
- [ ] Thay đổi thông thường trong feature không yêu cầu đọc toàn repo.
