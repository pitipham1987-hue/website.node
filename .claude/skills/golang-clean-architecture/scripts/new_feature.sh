#!/usr/bin/env bash
# Scaffold một feature mới theo layout của skill golang-clean-architecture.
#
# Usage:
#   ./new_feature.sh <feature-name> [module-path]
#
# Ví dụ:
#   ./new_feature.sh billing github.com/vnpt/ioc-platform
#
# Sinh ra:
#   internal/features/<feature>/{api/, entity.go, usecase.go, repository.go,
#                                 controller_rest.go, usecase_test.go, README.md}
#
# Script này chỉ tạo BỘ KHUNG (skeleton biên dịch được, panic ở TODO) — không sinh business logic thật.
# Chạy từ thư mục gốc của Go service (nơi có go.mod).

set -euo pipefail

FEATURE="${1:-}"
MODULE_PATH="${2:-$(head -n1 go.mod 2>/dev/null | awk '{print $2}')}"

if [[ -z "$FEATURE" ]]; then
  echo "Usage: $0 <feature-name> [module-path]" >&2
  exit 1
fi
if [[ -z "$MODULE_PATH" ]]; then
  echo "Không tìm thấy go.mod và không có module-path truyền vào. Chạy từ root service hoặc truyền module-path." >&2
  exit 1
fi

FEATURE_LOWER=$(echo "$FEATURE" | tr '[:upper:]' '[:lower:]')
FEATURE_PASCAL="$(tr '[:lower:]' '[:upper:]' <<< ${FEATURE_LOWER:0:1})${FEATURE_LOWER:1}"
DIR="internal/features/${FEATURE_LOWER}"
API_DIR="${DIR}/api"

if [[ -d "$DIR" ]]; then
  echo "Feature '$FEATURE_LOWER' đã tồn tại ở $DIR — dừng lại, không ghi đè." >&2
  exit 1
fi

mkdir -p "$API_DIR"

cat > "${API_DIR}/module.go" <<EOF
package ${FEATURE_LOWER}api

import "context"

// Module là public contract của feature ${FEATURE_LOWER}.
// Feature khác CHỈ được import package này, không import "${MODULE_PATH}/internal/features/${FEATURE_LOWER}" trực tiếp.
type Module interface {
	// TODO: định nghĩa use case public, vd:
	// Create(ctx context.Context, req CreateRequest) (Result, error)
}
EOF

cat > "${API_DIR}/dto.go" <<EOF
package ${FEATURE_LOWER}api

// TODO: DTO public (immutable). Không expose entity/ORM model ở đây.
//
// type CreateRequest struct { ... }
// type Result struct { ... }
EOF

cat > "${API_DIR}/errors.go" <<EOF
package ${FEATURE_LOWER}api

import "errors"

var (
	// TODO: sentinel error public, vd:
	// ErrNotFound = errors.New("${FEATURE_LOWER}: not found")
	_ = errors.New // xoá dòng này khi thêm error thật
)
EOF

cat > "${DIR}/entity.go" <<EOF
package ${FEATURE_LOWER}

// ${FEATURE_PASCAL} là domain entity. Chỉ dùng standard library — KHÔNG import driver DB, HTTP framework, gRPC.
type ${FEATURE_PASCAL} struct {
	ID string
	// TODO: field domain
}

// Draft${FEATURE_PASCAL} là domain factory — thể hiện business intent, không dùng constructor trần.
func Draft${FEATURE_PASCAL}(id string) (${FEATURE_PASCAL}, error) {
	// TODO: validate + khởi tạo
	return ${FEATURE_PASCAL}{ID: id}, nil
}
EOF

cat > "${DIR}/usecase.go" <<EOF
package ${FEATURE_LOWER}

import "context"

// Repository do UseCase định nghĩa (Dependency Inversion) — repository.go sẽ implement interface này.
type Repository interface {
	Save(ctx context.Context, e ${FEATURE_PASCAL}) error
	FindByID(ctx context.Context, id string) (${FEATURE_PASCAL}, error)
}

type UseCase struct {
	repo Repository
	// TODO: interface của feature khác nếu cần, vd:
	// payment paymentapi.Module
}

func NewUseCase(repo Repository) *UseCase {
	return &UseCase{repo: repo}
}

// TODO: implement các method của ${FEATURE_LOWER}api.Module ở đây,
// UseCase phải satisfy interface ${FEATURE_LOWER}api.Module — thêm compile-time check ở internal/app:
//   var _ ${FEATURE_LOWER}api.Module = (*${FEATURE_LOWER}.UseCase)(nil)
EOF

cat > "${DIR}/repository.go" <<EOF
package ${FEATURE_LOWER}

import "context"

// ${FEATURE_LOWER}Repo implement interface Repository khai báo trong usecase.go.
type ${FEATURE_LOWER}Repo struct {
	// TODO: db *pgxpool.Pool hoặc tương đương
}

func NewRepository() *${FEATURE_LOWER}Repo {
	return &${FEATURE_LOWER}Repo{}
}

func (r *${FEATURE_LOWER}Repo) Save(ctx context.Context, e ${FEATURE_PASCAL}) error {
	// TODO
	return nil
}

func (r *${FEATURE_LOWER}Repo) FindByID(ctx context.Context, id string) (${FEATURE_PASCAL}, error) {
	// TODO
	return ${FEATURE_PASCAL}{}, nil
}
EOF

cat > "${DIR}/controller_rest.go" <<EOF
package ${FEATURE_LOWER}

// TODO: REST handler mỏng — chỉ map HTTP request/response <-> ${FEATURE_LOWER}api DTO,
// gọi UseCase (hoặc interface ${FEATURE_LOWER}api.Module), KHÔNG gọi thẳng Repository.
//
// func NewRoutes(router fiber.Router, uc *UseCase) { ... }
EOF

cat > "${DIR}/usecase_test.go" <<EOF
package ${FEATURE_LOWER}

import "testing"

// TODO: test business logic với mock Repository (go.uber.org/mock hoặc hand-written fake).
func TestPlaceholder(t *testing.T) {
	t.Skip("TODO: implement usecase tests")
}
EOF

cat > "${DIR}/README.md" <<EOF
# ${FEATURE_PASCAL}

TODO: một câu mô tả feature này làm gì.

Entry point: controller_rest.go (NewRoutes)
Public API: \`api/\` (${FEATURE_LOWER}api.Module)
Storage: ${FEATURE_LOWER}Repo
Depends on: TODO
EOF

echo "Đã scaffold feature '$FEATURE_LOWER' tại $DIR"
echo ""
echo "Nhớ làm thêm (không tự động):"
echo "  1. Thêm depguard rule 'cross-feature-boundary' cho feature này vào .golangci.yml"
echo "     (xem references/dependency-rules-and-enforcement.md)"
echo "  2. Wire UseCase + Routes trong internal/app/app.go"
echo "  3. Điền README.md, xoá các TODO"
