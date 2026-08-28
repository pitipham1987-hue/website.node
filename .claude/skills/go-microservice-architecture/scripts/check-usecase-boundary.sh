#!/usr/bin/env bash
set -euo pipefail

# check-usecase-boundary.sh — Kiem tra bat bien kien truc muc 3.2:
# internal/usecase va internal/entity KHONG duoc import bat ky package
# thuoc internal/controller, internal/repo, hoac pkg/* mang tinh ha tang
# cu the (pkg/kafka, pkg/postgres, pkg/httpserver, pkg/grpcserver) hay
# driver/framework cu the (fiber, grpc, kafka client, database/sql, pgx).
#
# Usage: ./check-usecase-boundary.sh [duong dan goc project, mac dinh .]
# Exit code: 0 = sach, 1 = co vi pham (PR phai bi reject theo muc 3.2)

ROOT="${1:-.}"
VIOLATIONS=0

FORBIDDEN_PATTERNS=(
  "internal/controller"
  "internal/repo"
  "pkg/kafka"
  "pkg/postgres"
  "pkg/httpserver"
  "pkg/grpcserver"
  "segmentio/kafka-go"
  "twmb/franz-go"
  "gofiber/fiber"
  "google.golang.org/grpc"
  "database/sql"
  "jackc/pgx"
)

echo "==> Kiem tra ranh gioi usecase/entity (Architecture Standard muc 3.2)..."
echo ""

for LAYER in "internal/usecase" "internal/entity"; do
  DIR="$ROOT/$LAYER"
  [ -d "$DIR" ] || continue
  for PATTERN in "${FORBIDDEN_PATTERNS[@]}"; do
    # Chi quet trong dong import (chua dau ngoac kep) de tranh nham voi comment/string thuong,
    # nhung khong doi hoi PATTERN nam ngay sau dau ngoac (import noi bo co the co module-path prefix).
    HITS=$(grep -rn --include="*.go" -E "\"[^\"]*${PATTERN}[^\"]*\"" "$DIR" 2>/dev/null || true)
    if [ -n "$HITS" ]; then
      echo "[X] VI PHAM trong $LAYER - import chua '$PATTERN' bi cam:"
      echo "$HITS" | sed 's/^/      /'
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done
done

echo ""
if [ "$VIOLATIONS" -gt 0 ]; then
  echo "==> TONG: $VIOLATIONS vi pham. Theo muc 3.2, PR cham internal/usecase co vi pham nay PHAI BI REJECT."
  exit 1
else
  echo "==> Sach. Khong co import ha tang nao trong internal/usecase hoac internal/entity."
  exit 0
fi
