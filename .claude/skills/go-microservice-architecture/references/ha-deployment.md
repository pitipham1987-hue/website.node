# HA & Deployment Guidelines

> Trích từ Architecture Standard nội bộ (`ARCHITECT.md` mục 5). Đọc file này khi cấu hình deployment K8s, connection pool, hoặc migration cho service scale-out nhiều replica. Có thể kiểm bán tự động bằng `scripts/check-ha-checklist.sh`.

## Prefork — BẮT BUỘC TẮT trên Kubernetes/Docker

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

## Database Migration — Tách khỏi vòng đời App Pod

**Cấm tuyệt đối**: chạy migration tự động bên trong `cmd/app/main.go` khi service khởi động trong môi trường multi-replica. Nếu N pod cùng khởi động song song (rolling update, hoặc HPA scale-up đột ngột), N pod cùng chạy migration → race condition trên schema.

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

## Database Connection Pool — Tham số bắt buộc

Mọi service khởi tạo `*sql.DB` (qua `pkg/postgres`) **bắt buộc** cấu hình đủ 3 tham số sau — không được dùng giá trị mặc định của driver.

```go
// pkg/postgres/postgres.go
func New(dsn string, opts ...Option) (*Postgres, error) {
    db, err := sql.Open("pgx", dsn)
    if err != nil {
        return nil, err
    }

    db.SetMaxOpenConns(cfg.PoolMax)
    db.SetMaxIdleConns(cfg.PoolMax / 2)
    db.SetConnMaxLifetime(30 * time.Minute)
    db.SetConnMaxIdleTime(5 * time.Minute)

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

**Khi `maxReplicas` lớn (>15–20) hoặc nhiều service cùng chia sẻ 1 Postgres instance**: bắt buộc đặt **PgBouncer** (transaction pooling mode) giữa app và Postgres, không để mỗi service tự mở pool trực tiếp.

## Checklist HA trước khi merge vào `main`

- [ ] `use_prefork_mode: false` trong mọi config file dùng cho K8s/Docker.
- [ ] Migration không nằm trong `cmd/app/main.go` chạy mặc định — có Job hoặc advisory lock riêng.
- [ ] `SetMaxOpenConns/SetMaxIdleConns/SetConnMaxLifetime` được set tường minh, giá trị đã tính theo công thức ở trên.
- [ ] Số partition Kafka topic ≥ `maxReplicas` khai báo trong `hpa.yaml`.
- [ ] Mọi Kafka handler có kiểm tra idempotency và có Dead Letter Topic.
- [ ] `waitForShutdown` xử lý đúng `SIGTERM`, có `terminationGracePeriodSeconds` phù hợp trong `deployment.yaml`.
- [ ] Readiness probe kiểm tra được kết nối Postgres + Kafka broker, không chỉ trả `200 OK` tĩnh.
- [ ] Không có state (session, cache) lưu trong RAM của process — nếu cần cache, dùng Redis qua interface khai báo ở usecase.

`scripts/check-ha-checklist.sh` tự động verify được 4/8 mục trên (prefork, pool params, migration tách rời, terminationGracePeriodSeconds); 4 mục còn lại (partition count, idempotency, DLQ, readiness probe logic) cần review thủ công vì phụ thuộc giá trị runtime hoặc logic không grep chính xác được.
