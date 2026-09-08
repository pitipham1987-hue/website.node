#!/usr/bin/env bash
# Kiểm tra nhanh 2 vi phạm boundary phổ biến nhất, không cần cài depguard/go-arch-lint.
# Dùng làm CI gate tối thiểu (bổ sung, không thay thế depguard — xem
# references/dependency-rules-and-enforcement.md để setup depguard đầy đủ).
#
# Vi phạm phát hiện được:
#   1. features/<X> import trực tiếp package con của features/<Y> KHÁC "features/<Y>/api"
#      (import cả "features/<Y>" gốc hoặc "features/<Y>/internal" đều bị coi là leak)
#   2. internal/platform import bất kỳ gì trong internal/features
#
# Usage: ./check_boundaries.sh [module-path]
#   module-path: tự dò từ go.mod nếu không truyền

set -euo pipefail

MODULE_PATH="${1:-$(head -n1 go.mod 2>/dev/null | awk '{print $2}')}"
if [[ -z "$MODULE_PATH" ]]; then
  echo "Không tìm thấy go.mod. Chạy từ root service hoặc truyền module-path." >&2
  exit 1
fi

FEATURES_ROOT="internal/features"
VIOLATIONS=0

if [[ ! -d "$FEATURES_ROOT" ]]; then
  echo "Không tìm thấy $FEATURES_ROOT — bỏ qua kiểm tra (service có thể chưa dùng feature-sliced layout)."
  exit 0
fi

echo "== Kiểm tra 1: cross-feature import phải qua api/ =="
for feature_dir in "$FEATURES_ROOT"/*/; do
  feature=$(basename "$feature_dir")
  # Quét mọi import path bắt đầu bằng module/internal/features/<other>, loại trừ chính nó và .../api
  while IFS= read -r line; do
    file="${line%%:*}"
    imp="${line#*: }"
    other_feature=$(echo "$imp" | sed -E "s#.*internal/features/([a-zA-Z0-9_-]+)(/.*)?#\1#")
    suffix=$(echo "$imp" | sed -E "s#.*internal/features/[a-zA-Z0-9_-]+(/.*)?#\1#")
    if [[ "$other_feature" != "$feature" && "$suffix" != "/api"* ]]; then
      echo "  VI PHẠM: $file import '$imp' — feature '$feature' phải import '.../features/${other_feature}/api', không phải nội bộ."
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  done < <(grep -rnE "\"${MODULE_PATH}/internal/features/[a-zA-Z0-9_-]+" "$feature_dir" --include="*.go" \
           | sed -E "s#^([^:]+:[0-9]+):.*(\"${MODULE_PATH}/internal/features/[a-zA-Z0-9_/.-]+\").*#\1: \2#" \
           | sed -E 's/"//g' || true)
done

echo "== Kiểm tra 2: internal/platform không được import internal/features =="
if [[ -d "internal/platform" ]]; then
  hits=$(grep -rln "${MODULE_PATH}/internal/features" internal/platform --include="*.go" || true)
  if [[ -n "$hits" ]]; then
    echo "  VI PHẠM: internal/platform import internal/features (không được phép — shared không biết business domain):"
    echo "$hits" | sed 's/^/    /'
    VIOLATIONS=$((VIOLATIONS + $(echo "$hits" | wc -l)))
  fi
fi

echo ""
if [[ $VIOLATIONS -gt 0 ]]; then
  echo "❌ Tìm thấy $VIOLATIONS vi phạm boundary."
  exit 1
else
  echo "✅ Không phát hiện vi phạm boundary (kiểm tra cơ bản — vẫn nên bật depguard cho coverage đầy đủ)."
fi
