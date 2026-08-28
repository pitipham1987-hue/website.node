#!/usr/bin/env bash
set -euo pipefail

# scaffold.sh — Dựng khung thư mục "Go Microservice Template" theo
# Architecture Standard nội bộ (xem references/layer-standards.md mục 2).
#
# Usage: ./scaffold.sh <service-name> <go-module-path>
# Vi du: ./scaffold.sh cam-health github.com/vnpt-ioc/cam-health

SERVICE_NAME="${1:?Thieu ten service. Usage: scaffold.sh <service-name> <go-module-path>}"
MODULE_PATH="${2:?Thieu Go module path. Usage: scaffold.sh <service-name> <go-module-path>}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Dung khung cho service: $SERVICE_NAME (module: $MODULE_PATH)"

mkdir -p "$SERVICE_NAME"
cd "$SERVICE_NAME"

if command -v go >/dev/null 2>&1; then
  go mod init "$MODULE_PATH" 2>/dev/null || echo "   (go.mod da ton tai hoac go chua cai, bo qua go mod init)"
else
  echo "   (khong tim thay lenh 'go' trong PATH, bo qua go mod init - tu chay tay sau)"
fi

DIRS=(
  "cmd/app"
  "config"
  "internal/app"
  "internal/entity"
  "internal/usecase"
  "internal/controller/http/v1"
  "internal/controller/grpc/v1"
  "internal/controller/kafka/v1"
  "internal/repo/persistent"
  "internal/repo/webapi"
  "internal/repo/kafka_producer"
  "pkg/httpserver"
  "pkg/grpcserver"
  "pkg/kafka"
  "pkg/postgres"
  "pkg/logger"
  "pkg/jwt"
  "migrations"
  "deployments/k8s"
  "docs/proto"
  "scripts"
)

for d in "${DIRS[@]}"; do
  mkdir -p "$d"
done

cat > cmd/app/main.go <<'EOF'
package main

// main.go — CHI khoi tao config + logger, goi app.Run().
// KHONG dat business logic hay wiring dependency o day.
// Xem internal/app/app.go — noi DUY NHAT duoc phep wiring DI.

func main() {
	// cfg := config.MustLoad()
	// app.Run(cfg)
}
EOF

cat > internal/app/app.go <<'EOF'
package app

// app.go — DUY NHAT noi wiring dependency injection toan he thong.
// Khong co constructor nao o noi khac duoc tu y tao dependency cu the
// (concrete type: *sql.DB, kafka.Producer...) roi truyen xuong usecase.
// Moi wiring tap trung tai day (xem Architecture Standard muc 3.5).

// func Run(cfg *config.Config) {
//     l := logger.New(cfg.Log.Level)
//     pg := postgres.New(cfg.PG.URL, postgres.WithPoolSettings(cfg.PG)) // muc 5.3
//     defer pg.Close()
//     ...
// }
EOF

cat > internal/entity/.gitkeep <<'EOF'
# Struct nghiep vu thuan Go tai day.
# CAM: struct tag ORM/ODM cu the (gorm:"...", bson:"...").
# Xem Architecture Standard muc 3.1.
EOF

cat > internal/usecase/.gitkeep <<'EOF'
# LOI KIEN TRUC. Moi domain nghiep vu la MOT package con rieng
# (vi du: internal/usecase/camera_health/usecase.go).
# Interface ma usecase phu thuoc PHAI khai bao TAI DAY (consumer-defined
# interface), khong khai bao trong package implement (repo, kafka_producer...).
# Package nay KHONG duoc import internal/controller, internal/repo, hoac
# bat ky pkg/* mang tinh ha tang nao (pkg/kafka, pkg/postgres...).
# Chay `bash scripts/check-usecase-boundary.sh` truoc moi commit de tu kiem tra.
# Xem Architecture Standard muc 3.2.
EOF

cat > config/config.go <<'EOF'
package config

// config.go — struct Config doc tu env (12-factor).
// KHONG hardcode secret o day va KHONG commit secret trong config.yml.
EOF

cat > config/config.yml <<'EOF'
http:
  use_prefork_mode: false   # BAT BUOC false tren K8s/Docker — muc 5.1
EOF

touch migrations/000001_init.up.sql
touch docs/proto/.gitkeep

cat > Makefile <<'EOF'
.PHONY: lint test test-integration build run check-boundary check-ha

lint:
	golangci-lint run ./...

test:
	go test -race -cover ./internal/... ./pkg/...

test-integration:
	go test -race -tags=integration ./test/integration/...

build:
	go build -o bin/app ./cmd/app

run: build
	./bin/app

check-boundary:
	bash scripts/check-usecase-boundary.sh .

check-ha:
	bash scripts/check-ha-checklist.sh .
EOF

# Copy 2 script kiem tra vao project moi de `make check-boundary` / `make check-ha` chay duoc doc lap
cp "$SCRIPT_DIR/check-usecase-boundary.sh" scripts/check-usecase-boundary.sh
cp "$SCRIPT_DIR/check-ha-checklist.sh" scripts/check-ha-checklist.sh
chmod +x scripts/check-usecase-boundary.sh scripts/check-ha-checklist.sh

echo "==> Xong. Cau truc thu muc da tao theo dung chuan (xem references/layer-standards.md muc 2)."
echo "==> Buoc tiep theo: dien entity/usecase THAT theo muc 3.1-3.2 truoc khi viet bat ky controller/repo nao."
echo "==> Chay 'make check-boundary' bat ky luc nao de tu kiem tra vi pham ranh gioi usecase."
