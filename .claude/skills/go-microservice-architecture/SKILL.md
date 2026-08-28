---
name: go-microservice-architecture
description: Chuẩn kiến trúc BẮT BUỘC (mandatory) cho mọi Go microservice trong hệ thống Architecture (kế thừa evrone/go-clean-template), điều chỉnh cho Kafka Consumer Group, Kubernetes multi-replica HA. Dùng skill này bất cứ khi nào người dùng tạo mới, scaffold, thiết kế, viết code, hoặc review một Go service/microservice — kể cả khi họ không nói rõ "kiến trúc" hay "chuẩn". Kích hoạt khi thấy các từ khóa: "Go service mới", "microservice Go", "clean architecture", "usecase layer", "internal/usecase", "Kafka consumer group", "scale K8s", "HPA", "connection pool Postgres", "migration job", "prefork", hoặc khi review PR chạm bất kỳ file nào dưới internal/usecase, internal/entity, internal/controller, internal/repo, pkg/postgres, pkg/kafka, deployments/k8s. Cũng kích hoạt khi người dùng viết ADR về quyết định kiến trúc Go, hoặc khi writing-plans tạo task cho một Go service mới.
---

# Go Microservice Architecture Standard

Kiến trúc dựa trên **Dependency Inversion Principle** làm trục xoay duy nhất: outer layer (HTTP/gRPC/Kafka/Postgres/Redis/Vault) luôn phụ thuộc vào inner layer (entity/usecase), không bao giờ ngược lại. Sai lệch so với chuẩn này **phải có ADR giải trình** — không phải tùy chọn phong cách cá nhân.

```
┌─────────────────────────────────────────────────┐
│  OUTER LAYER (Infrastructure / Tools)            │
│  HTTP · gRPC · Kafka · Postgres · Redis · Vault  │
│   ┌───────────────────────────────────────────┐ │
│   │  INNER LAYER (Business Logic)              │ │
│   │  entity · usecase                          │ │
│   │  → chỉ dùng Go standard library             │ │
│   │  → không import bất kỳ package outer nào    │ │
│   └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
      hướng phụ thuộc: outer ──> inner (luôn luôn)
```

## 3 quy tắc bất biến (luôn giữ trong đầu, không cần đọc reference mới nhớ)

1. `internal/usecase` và `internal/entity` **không được** import bất kỳ package nào dưới `internal/controller`, `internal/repo`, hoặc `pkg/*` mang tính hạ tầng (trừ thư viện chuẩn hóa lỗi/validate không mang tính hạ tầng).
2. Mọi giao tiếp giữa outer và inner đi qua **interface khai báo tại nơi tiêu thụ** (consumer-defined interface — khai báo trong `usecase`, không khai báo trong `repo`/`kafka_producer`).
3. Toàn bộ wiring (dependency injection) tập trung **duy nhất** tại `internal/app/app.go`. Không constructor nào ở nơi khác tự ý tạo dependency cụ thể rồi truyền xuống usecase.

## Hai chế độ vận hành của skill này

### Chế độ A — Scaffold (dựng service Go mới)

1. Xác nhận tên service + Go module path với người dùng.
2. Chạy `scripts/scaffold.sh <service-name> <module-path>` để dựng khung thư mục chuẩn (xem `references/layer-standards.md` mục "Cấu trúc thư mục" để hiểu đầy đủ lý do từng thư mục tồn tại).
3. Điền `internal/entity` → khai báo interface trong `internal/usecase` → viết use case (test bằng mock, chưa cần Postgres/Kafka thật) → **sau cùng mới** viết `internal/repo`/`internal/controller` implement đúng interface đã có.
4. Trước khi coi 1 task hoàn thành: chạy `bash scripts/check-usecase-boundary.sh .` — phải exit 0.
5. Trước khi merge vào `main`: chạy `bash scripts/check-ha-checklist.sh .` và tự đối chiếu 4 mục MANUAL còn lại (partition Kafka, idempotency, DLQ, readiness probe logic) — xem `references/ha-deployment.md`.

### Chế độ B — Review (kiểm tra service/PR đã có)

1. Chạy `bash scripts/check-usecase-boundary.sh <đường dẫn project>` — nếu exit 1, đây là **Critical finding**, phải reject PR theo đúng quy định gốc (không phải "nice to have").
2. Chạy `bash scripts/check-ha-checklist.sh <đường dẫn project>` — mỗi dòng `[X]` là finding cần liệt kê, phân loại severity theo `requesting-code-review`.
3. Đọc `references/kafka-messaging.md` nếu PR chạm bất kỳ Kafka handler nào — verify: message key = aggregate ID (không phải random/timestamp), có idempotency check, có DLQ.
4. Nếu vi phạm nguyên tắc 1-2 (usecase import hạ tầng, interface khai báo sai chỗ) → luôn là Critical, không hạ xuống Major/Minor.

## Checklist cô đọng (bản đầy đủ ở references/)

- [ ] `internal/usecase`, `internal/entity` sạch import hạ tầng — verify bằng script, không đoán bằng mắt.
- [ ] Interface khai báo ở usecase, không ở repo/kafka_producer.
- [ ] Unit test usecase chạy được **không cần** Docker Compose (Postgres/Kafka thật).
- [ ] Controller mỏng — chỉ parse request → gọi 1 method usecase → format response, không `if/else` nghiệp vụ.
- [ ] Kafka: partition key = aggregate ID; handler idempotent; có DLQ; số partition ≥ maxReplicas.
- [ ] `use_prefork_mode: false` trên K8s/Docker.
- [ ] Migration tách khỏi `cmd/app/main.go` (K8s Job riêng hoặc advisory lock).
- [ ] Postgres pool: `SetMaxOpenConns/SetMaxIdleConns/SetConnMaxLifetime` set tường minh, tính đúng công thức `PoolMax × maxReplicas < max_connections − buffer`.

## Các lý lẽ hay gặp để lách chuẩn — và vì sao không được chấp nhận

| Lời biện minh thường gặp | Vì sao vẫn phải tuân thủ |
|---|---|
| "Chỉ là POC, sau này refactor sau" | POC chạy tốt thường lên production nguyên trạng — sửa ranh giới layer sau khi đã có nhiều consumer phụ thuộc tốn kém hơn nhiều so với làm đúng từ đầu. |
| "Service này 1 replica thôi, không cần lo HA" | HPA có thể scale bất cứ lúc nào mà không cần sửa code nếu thiết kế đúng ngay từ đầu (đó chính là mục tiêu `references/ha-deployment.md`) — nhưng nếu thiết kế sai (prefork bật, pool không giới hạn, migration chạy trong main), scale-up sẽ crash ngay, không có đường lùi êm. |
| "Tạm import `pkg/kafka` thẳng vào usecase cho nhanh, dọn sau" | Đây chính là lý do usecase test không chạy được nếu thiếu Kafka thật — vi phạm mục tiêu Testability, và "dọn sau" hiếm khi xảy ra trong thực tế. |
| "Interface đặt ở package `repo` cho gọn, đỡ phải định nghĩa 2 lần" | Đặt interface ở nơi implement (không phải nơi tiêu thụ) đảo ngược hướng phụ thuộc — usecase lúc đó phải biết `repo` tồn tại, phá vỡ đúng nguyên lý DIP làm trục xoay của toàn bộ chuẩn này. |

## Bundled resources

```
go-microservice-architecture/
├── SKILL.md                          (file này)
├── references/
│   ├── layer-standards.md            (mục 2-3 gốc: cấu trúc thư mục, entity/usecase/controller/repo/wiring, code mẫu đầy đủ)
│   ├── kafka-messaging.md            (mục 4 gốc: partitioning, ordering, idempotency, DLQ)
│   └── ha-deployment.md              (mục 5 gốc: prefork, migration, connection pool, checklist HA đầy đủ)
└── scripts/
    ├── scaffold.sh                   (dựng khung thư mục + Makefile + file khung có comment luật)
    ├── check-usecase-boundary.sh     (grep tự động phát hiện import hạ tầng trong usecase/entity — đã test)
    └── check-ha-checklist.sh         (bán tự động verify 4/8 mục checklist HA — đã test)
```

Đọc `references/*.md` khi cần chi tiết đầy đủ (code mẫu, giải thích lý do) thay vì chỉ dựa vào bản tóm tắt ở trên — SKILL.md này cố tình giữ ngắn để không chiếm quá nhiều context mỗi lần trigger.

## Vị trí trong bộ skill Superpowers — ghép nối với các skill khác

Skill này **không thay thế** các skill quy trình của `obra/superpowers` — nó bổ sung ràng buộc kỹ thuật cụ thể cho ngôn ngữ Go vào đúng những điểm sau trong quy trình chung:

| Skill Superpowers | Cách `go-microservice-architecture` ghép vào |
|---|---|
| `brainstorming` | Khi thiết kế được brainstorm là "Go service mới", skill này cung cấp khung tham chiếu bắt buộc — design doc nên trỏ thẳng tới `references/layer-standards.md` thay vì tự nghĩ cấu trúc mới. |
| `writing-plans` | Mỗi task Go trong plan nên đi đúng thứ tự: entity → interface (usecase) → usecase (test mock) → repo/controller (implement). Đây chính là thứ tự Chế độ A ở trên — dùng làm khuôn bẻ task. |
| `subagent-driven-development` / `executing-plans` | Trước khi coi 1 task "Done", subagent (hoặc agent chính) chạy `check-usecase-boundary.sh` như một verification step bắt buộc trong report — không chỉ dựa vào việc code compile được. |
| `test-driven-development` | Bổ sung 1 điều kiện RED-GREEN cụ thể cho Go: usecase test phải luôn chạy được bằng mock, không cần hạ tầng thật — nếu RED chỉ pass được khi có Docker Compose, đó là dấu hiệu vi phạm layer, không phải vấn đề test. |
| `requesting-code-review` | Cung cấp checklist domain-specific (usecase boundary + HA) để bổ sung vào review chung — chạy 2 script trước khi review thủ công, tiết kiệm thời gian đọc code cho phần có thể tự động hoá. |
| `finishing-a-development-branch` | Checklist HA (mục "trước khi merge vào main") là điều kiện bổ sung trước khi cho phép các lựa chọn merge/PR — nếu còn Critical/Major từ 2 script trên, không nên đưa ra lựa chọn merge. |

Nếu dự án đã có các agent domain-specific khác (ví dụ `compliance-reviewer` cho PDPD, `video-pipeline-reviewer` cho RTSP/ONVIF), skill này chạy **song song, không chồng lấn** — nó chỉ quan tâm ranh giới kiến trúc Go, không đánh giá compliance dữ liệu hay logic pipeline video.

## Cách cài vào bộ skill Superpowers

Đặt nguyên thư mục `go-microservice-architecture/` vào:
- Claude Code + plugin superpowers: `~/.claude/skills/go-microservice-architecture/` (personal skill, tự động được `using-superpowers` liệt kê cùng các skill khác), hoặc vào `skills/` của một plugin/marketplace riêng nếu muốn chia sẻ cho cả team qua `.claude-plugin`.
- Codex/Gemini CLI/các harness khác dùng alias `~/.agents/skills/`: copy tương tự vào đó.

Không cần sửa gì trong `hooks/session-start` của superpowers — cơ chế `using-superpowers` tự động liệt kê mọi skill có trong thư mục skills, agent sẽ tự quyết định gọi `go-microservice-architecture` dựa trên `description` ở đầu file này.
