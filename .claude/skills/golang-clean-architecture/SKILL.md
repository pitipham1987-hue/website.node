---
name: golang-clean-architecture
description: Use when planning, scaffolding, implementing, or reviewing any task inside a Go service/microservice repo — when writing-plans is decomposing work that touches internal/, cmd/, or a new domain; when subagent-driven-development or executing-plans is dispatching a task into a Go feature; when requesting-code-review or receiving-code-review is checking a Go diff for layering/boundary violations; when the user asks to design, evaluate, or refactor Go codebase structure; when adding a new feature/domain to a Go service; or when setting up architecture enforcement (depguard/go-arch-lint/CI boundary checks). Trigger even if the user doesn't say "clean architecture" or "kiến trúc" — any mention of Go package/folder placement, feature boundaries, or "chỗ này nên đặt ở đâu" qualifies.
---

# Golang Clean Architecture (AI-Friendly / Feature-Sliced)

Complements **superpowers** (obra/superpowers) — does not replace `writing-plans`, `subagent-driven-development`,
`test-driven-development`, `requesting-code-review`, or `finishing-a-development-branch`. This skill supplies the
Go-specific structural rules those skills need at four exact points in the workflow (§1 below). Load it alongside
superpowers, not instead of it.

## Overview

Two sources merged:

1. **Clean Architecture** (Robert C. Martin, reference implementation `evrone/go-clean-template`) — dependency
   always points inward; business logic (`entity`/`usecase`) never imports framework/DB/transport code.
2. **AI-First codebase design** — a feature must be understandable by reading one folder, not by scanning the repo.

`go-clean-template` groups code by **layer first** (`internal/entity`, `internal/usecase`, `internal/controller`,
`internal/repo`, every domain mixed together). This skill keeps the same dependency-inversion rule but groups by
**feature first** (vertical slice) — see `references/directory-layout.md` §0 for the full rationale and the 1:1
mapping table between both styles.

Core principle: **Read less. Understand faster. Change locally. Break fewer boundaries.**

## §1. Superpowers workflow integration — where this skill fires

| Superpowers step | What this skill adds |
|---|---|
| `brainstorming` | If the design introduces a new bounded context, name it as a candidate `internal/features/<name>/` here — don't let it surface only at implementation time. |
| `writing-plans` | Each task's file list must respect feature boundaries (§3 layout). A task that touches 2+ features' internals simultaneously is a signal the plan needs to be re-cut — flag it instead of writing the task. Tasks that add a new feature should include a `scripts/new_feature.sh <name>` step plus the matching `depguard`/`go-arch-lint` boundary rule (see `references/dependency-rules-and-enforcement.md`). |
| `subagent-driven-development` / `executing-plans` | Bundle each dispatched task's context per §7 AI Context Reading Order: feature `README.md` → `api/` → target file → related tests → dependency's `api/` → `ARCHITECTURE.md`/`DECISIONS.md`. Do **not** hand a subagent the whole repo when the task is scoped to one feature — this is where the context-size win actually happens. |
| `test-driven-development` | No conflict — reinforces it: tests live beside the code (`usecase_test.go` next to `usecase.go`), never in a separate `tests/` tree. Mock `Repository`/other-feature `api.Module` interfaces per §4 of `references/module-contracts-and-dto.md`. |
| `requesting-code-review` / `receiving-code-review` | Add to the review checklist: run `scripts/check_boundaries.sh` (or `depguard`/`go-arch-lint` in CI) and confirm no entity/ORM type leaked into `api/`. Treat a boundary violation as a **blocking** issue, same severity class as a failing test. |
| `finishing-a-development-branch` | If the branch added/changed a feature boundary or a cross-cutting infra decision, update `ARCHITECTURE.md` / `DECISIONS.md` before merge — not after. |

Skill name for cross-referencing from other skills/plans: `golang-clean-architecture`.

## §1b. Khi xung đột với `karpathy-guidelines`

Nếu cả hai skill cùng active, 2 điểm sau cần quy tắc ưu tiên tường minh thay vì để agent tự suy luận:

- **`api/` không phải abstraction đầu cơ.** Nguyên tắc "không tạo abstraction cho code dùng một lần" của
  karpathy-guidelines nhắm vào *tính năng/field/config không ai yêu cầu* — không nhắm vào convention tổ chức file đã
  được quyết định ở tầng kiến trúc của service. Nếu service đã theo layout feature-sliced (§2), mọi feature tạo `api/`
  kể cả chỉ 1 method — đừng bỏ qua vì "feature này nhỏ". Ngược lại, nếu cảm thấy `api/` là overkill cho *cả service*,
  đó là tín hiệu nên áp dụng §2 dòng cuối (giữ layout phẳng go-clean-template gốc cho service <3 use case), không
  phải tín hiệu để 1 feature lẻ thiếu `api/` giữa các feature khác đã có.
- **Chỉ sửa boundary violation do chính task hiện tại gây ra.** Vi phạm **do thay đổi trong task tạo ra** → sửa ngay
  trong cùng task (khớp phép thử "mỗi dòng thay đổi phải truy về yêu cầu" của karpathy-guidelines §3, vì đây là hệ
  quả trực tiếp). Vi phạm **có sẵn từ trước, không liên quan task** → chỉ nêu ra + ghi vào `DECISIONS.md`, **không tự
  sửa** — nhánh này karpathy-guidelines §3 ("đừng refactor những thứ chưa hỏng", "dead code không liên quan → nêu ra,
  đừng tự ý xoá") thắng.
- Script `scripts/new_feature.sh` chỉ sinh skeleton rỗng, không tự điền method/field ngoài task yêu cầu — giữ đúng
  tinh thần "minimal" của karpathy-guidelines §2 ngay cả khi đang tạo cấu trúc thư mục bắt buộc theo kiến trúc.

## §2. Core patterns

```text
service-name/
├── cmd/app/main.go                 # bootstrap only — no business logic
├── internal/
│   ├── app/                        # composition root: DI wiring, graceful shutdown
│   ├── platform/                   # shared, business-domain-agnostic (logging, errors, tracing...)
│   └── features/
│       └── billing/
│           ├── api/                # PUBLIC CONTRACT — other features import ONLY this
│           │   ├── module.go       # interface Module
│           │   ├── dto.go          # immutable Request/Response
│           │   └── errors.go       # sentinel/typed public errors
│           ├── entity.go           # domain model + factory methods (Invoice.Draft(...))
│           ├── usecase.go          # business logic; declares Repository interface; stdlib-only imports
│           ├── repository.go       # implements usecase.Repository (Postgres/etc.)
│           ├── controller_rest.go  # thin handler: HTTP <-> api/ DTO, calls usecase only
│           ├── usecase_test.go
│           └── README.md
├── pkg/                             # generic libs, publishable outside this repo
├── ARCHITECTURE.md
└── DECISIONS.md
```

**Dependency rule (non-negotiable):** `app → features → platform`. `platform` never imports `features`.
`features/A` calls `features/B` only through `features/B/api`, never `features/B`'s internals. `entity.go`/`usecase.go`
import stdlib + self-declared interfaces only — no HTTP framework, no gRPC, no DB driver. Circular import between two
features → stop, don't force it through; either they're really one bounded context, or a third orchestrating usecase
is missing. Full detail: `references/directory-layout.md`, `references/dependency-rules-and-enforcement.md`.

Small service (<3 use cases, 1 entity)? Keep the flat `go-clean-template` layout — don't force feature-slicing on a
service that doesn't need it (§9 of the full layout reference).

## §3. Quick reference

| Need to... | Do this |
|---|---|
| Add a new feature | `scripts/new_feature.sh <name>` from repo root, then wire in `internal/app/app.go`, then add its `depguard` rule |
| Call another feature | Import `internal/features/<other>/api`, never `internal/features/<other>` directly |
| Check boundaries locally / in CI | `scripts/check_boundaries.sh` (no extra tooling) or `depguard`/`go-arch-lint` (`references/dependency-rules-and-enforcement.md`) |
| Decide feature vs. platform for a helper | Business-specific → feature. Domain-agnostic and reused ≥2–3× → `internal/platform` |
| Document a feature | `assets/README.md.template` (≤10 lines: what / entry point / public API / deps / constraints) |
| Record an architecture decision | `assets/DECISIONS.md.template` — prevents re-litigating later |
| Infra decisions already settled (Kafka key, migrations, pool sizing, prefork) | `references/platform-decisions.md` — read before proposing infra changes |

## §4. Common mistakes (and the rationalization behind them)

| Rationalization | Why it's wrong | Do instead |
|---|---|---|
| "Feature này nhỏ, khỏi cần `api/`, import thẳng cho nhanh" | Today's small feature is tomorrow's coupling nobody can safely change | Create `api/` even with 1 method — cost is near-zero, removal cost later is not |
| "Sẽ dọn boundary sau khi ship" | "Sau" gần như không tới; mỗi feature mới import chéo lại làm baseline tệ hơn | Fix the boundary in the same task, or explicitly flag it as tech debt in `DECISIONS.md` with an owner |
| "Entity với DTO giống hệt nhau, dùng chung luôn" | Leaks persistence/domain shape into the public contract; a DB column rename now breaks every caller of `api/` | Keep `entity.go` and `api/dto.go` separate even when fields currently match |
| "Dependency vòng nhỏ thôi, comment tạm import 1 chỗ là xong" | Hides a real design problem; compiles today, unmaintainable in a month | Stop, re-derive the boundary or add a 3rd orchestrating usecase — see §2 |
| "Subagent cứ đọc cả repo cho chắc" | Defeats the entire point of feature-sliced context; slower, noisier, more likely to touch the wrong file | Scope subagent context to §1's `subagent-driven-development` row |

## §5. Full references

- `references/directory-layout.md` — full rationale, go-clean-template↔feature-sliced mapping table, refactor inventory checklist
- `references/module-contracts-and-dto.md` — naming, `api/` contract rules, result type, domain factory pattern
- `references/dependency-rules-and-enforcement.md` — `.golangci.yml` depguard config, `go-arch-lint.yml`, Definition of Done checklist
- `references/platform-decisions.md` — pre-decided infra standards (Kafka partition key, migration jobs, prefork, connection pool sizing)

## §6. Bundled tools

- `scripts/new_feature.sh <feature-name> [module-path]` — scaffolds a compiling skeleton feature (`api/`, `entity.go`, `usecase.go`, `repository.go`, `controller_rest.go`, `usecase_test.go`, `README.md`)
- `scripts/check_boundaries.sh [module-path]` — zero-dependency boundary check (cross-feature leaks, platform→features leaks), exits non-zero on violation — wire into CI or into `requesting-code-review`
