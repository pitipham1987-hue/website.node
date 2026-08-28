#!/usr/bin/env bash
set -euo pipefail

# check-ha-checklist.sh — Kiem tra ban tu dong checklist HA (muc 5.4).
# Mot so muc danh dau [MANUAL] vi phu thuoc gia tri runtime (so partition
# Kafka thuc te, maxReplicas HPA thuc te) khong the grep chinh xac duoc.
#
# Usage: ./check-ha-checklist.sh [duong dan goc project, mac dinh .]

ROOT="${1:-.}"
WARN=0

check() {
  local desc="$1" pattern="$2" file="$3" expect_present="$4"
  if [ ! -f "$file" ]; then
    echo "[!] [MANUAL] $desc - khong tim thay file $file de kiem tra tu dong."
    WARN=$((WARN + 1))
    return
  fi
  if grep -qE "$pattern" "$file" 2>/dev/null; then
    if [ "$expect_present" = "yes" ]; then
      echo "[OK] $desc"
    else
      echo "[X] $desc - pattern cam '$pattern' van con trong $file"
      WARN=$((WARN + 1))
    fi
  else
    if [ "$expect_present" = "yes" ]; then
      echo "[X] $desc - khong thay '$pattern' trong $file"
      WARN=$((WARN + 1))
    else
      echo "[OK] $desc"
    fi
  fi
}

echo "==> Checklist HA truoc khi merge (Architecture Standard muc 5.4)"
echo ""

check "use_prefork_mode: false trong config.yml" \
  "use_prefork_mode: *false" "$ROOT/config/config.yml" "yes"

check "config.yml KHONG bat prefork (true)" \
  "use_prefork_mode: *true" "$ROOT/config/config.yml" "no"

check "postgres.go co goi SetMaxOpenConns" \
  "SetMaxOpenConns" "$ROOT/pkg/postgres/postgres.go" "yes"

check "postgres.go co goi SetConnMaxLifetime" \
  "SetConnMaxLifetime" "$ROOT/pkg/postgres/postgres.go" "yes"

check "main.go KHONG tu chay migration mac dinh" \
  "RunMigrations\(\)" "$ROOT/cmd/app/main.go" "no"

check "deployment.yaml co terminationGracePeriodSeconds" \
  "terminationGracePeriodSeconds" "$ROOT/deployments/k8s/deployment.yaml" "yes"

echo ""
echo "[!] [MANUAL] So partition Kafka topic >= maxReplicas trong hpa.yaml - can doi chieu gia tri thuc te."
echo "[!] [MANUAL] Moi Kafka handler co kiem tra idempotency + Dead Letter Topic - can doc code, khong grep chinh xac duoc."
echo "[!] [MANUAL] Readiness probe kiem tra Postgres + Kafka broker (khong chi tra 200 tinh) - can doc code handler."

echo ""
if [ "$WARN" -gt 0 ]; then
  echo "==> Co $WARN muc can xu ly hoac kiem tra thu cong truoc khi merge."
  exit 1
fi
echo "==> Cac muc tu dong-kiem-tra-duoc deu OK. Van con 3 muc MANUAL o tren can tu doi chieu."
exit 0
