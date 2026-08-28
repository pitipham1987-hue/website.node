---
name: using-git-worktrees
description: Sử dụng khi bắt đầu công việc phát triển tính năng cần sự cô lập khỏi workspace hiện tại hoặc trước khi thực thi kế hoạch triển khai — đảm bảo tồn tại một không gian làm việc cô lập thông qua các công cụ native của nền tảng hoặc giải pháp dự phòng git worktree
---

# Sử Dụng Git Worktrees

## Tổng Quan

Đảm bảo công việc được thực hiện trong một không gian làm việc cô lập (isolated workspace). Ưu tiên sử dụng các công cụ worktree native của nền tảng bạn đang chạy. Chỉ quay về giải pháp git worktree thủ công khi không có công cụ native nào.

**Nguyên tắc cốt lõi:** Phát hiện sự cô lập hiện có trước. Sau đó dùng công cụ native. Sau đó mới dùng git thủ công. Không bao giờ làm ngược lại cơ chế của môi trường.

**Thông báo khi bắt đầu:** "Tôi đang sử dụng skill using-git-worktrees để thiết lập một không gian làm việc cô lập."

## Bước 0: Phát Hiện Sự Cô Lập Hiện Có

**Trước khi tạo bất kỳ thứ gì, hãy kiểm tra xem bạn đã ở trong một không gian làm việc cô lập chưa.**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Phòng ngừa Submodule:** Trạng thái `GIT_DIR != GIT_COMMON` cũng đúng khi ở bên trong một git submodule. Trước khi kết luận "đã ở trong một worktree", hãy xác minh bạn không phải đang ở trong submodule:

```bash
# Nếu lệnh này trả về một đường dẫn, bạn đang ở trong submodule chứ không phải worktree — hãy xử lý như repo bình thường
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**Nếu `GIT_DIR != GIT_COMMON` (và không phải submodule):** Bạn đã ở trong một linked worktree. Bỏ qua sang Bước 2 (Thiết lập dự án). KHÔNG tạo thêm worktree nào khác.

Báo cáo trạng thái nhánh:
- Ở trên một nhánh: "Đã ở trong không gian làm việc cô lập tại `<path>` trên nhánh `<name>`."
- Trạng thái Detached HEAD: "Đã ở trong không gian làm việc cô lập tại `<path>` (detached HEAD, do bên ngoài quản lý). Cần tạo nhánh khi hoàn tất."

**Nếu `GIT_DIR == GIT_COMMON` (hoặc ở trong submodule):** Bạn đang ở trong một checkout repo bình thường.

Người dùng đã thể hiện ưu tiên worktree trong hướng dẫn của bạn chưa? Nếu chưa, hãy xin phép trước khi tạo worktree:

> "Bạn có muốn tôi thiết lập một worktree cô lập không? Điều này sẽ bảo vệ nhánh hiện tại của bạn khỏi các thay đổi."

Tôn trọng ưu tiên đã được khai báo trước đó mà không cần hỏi lại. Nếu người dùng từ chối, hãy làm việc trực tiếp tại chỗ và chuyển sang Bước 2.

## Bước 1: Tạo Không Gian Làm Việc Cô Lập

**Bạn có hai cơ chế. Hãy thử theo thứ tự này.**

### 1a. Công Cụ Worktree Native (Ưu tiên)

Người dùng đã đồng ý tạo không gian cô lập (đồng ý ở Bước 0). Môi trường của bạn có sẵn công cụ tạo worktree không? Đó có thể là công cụ tên `EnterWorktree`, `WorktreeCreate`, lệnh `/worktree`, hoặc cờ `--worktree`. Nếu có, hãy sử dụng nó và chuyển sang Bước 2.

Các công cụ native tự động xử lý vị trí thư mục, tạo nhánh và dọn dẹp. Việc tự dùng `git worktree add` khi đã có công cụ native sẽ tạo ra trạng thái ẩn mà môi trường không thể quản lý.

Chỉ chuyển sang Bước 1b khi bạn KHÔNG có công cụ worktree native nào.

### 1b. Dự Phòng Bằng Git Worktree Thủ Công

**Chỉ dùng nếu Bước 1a không áp dụng** — bạn không có công cụ native nào. Hãy tạo worktree thủ công bằng lệnh git.

#### Lựa Chọn Thư Mục

Tuân theo thứ tự ưu tiên này. Ưu tiên rõ ràng của người dùng luôn đè lên trạng thái hệ thống file quan sát được.

1. **Kiểm tra hướng dẫn để xem có khai báo ưu tiên thư mục worktree không.** Nếu người dùng đã chỉ định, hãy dùng trực tiếp không cần hỏi.

2. **Kiểm tra xem đã có thư mục worktree cục bộ của dự án chưa:**
   ```bash
   ls -d .worktrees 2>/dev/null     # Ưu tiên (thư mục ẩn)
   ls -d worktrees 2>/dev/null      # Phương án thay thế
   ```
   Nếu tìm thấy, hãy dùng nó. Nếu cả hai cùng tồn tại, `.worktrees` thắng.

3. **Nếu không có hướng dẫn nào khác**, mặc định dùng `.worktrees/` tại gốc dự án.

#### Xác Minh An Toàn (chỉ áp dụng cho thư mục cục bộ của dự án)

**BẮT BUỘC xác minh thư mục đã được ignore trước khi tạo worktree:**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**Nếu CHƯA được ignore:** Thêm vào file `.gitignore`, commit thay đổi đó, sau đó mới tiếp tục.

**Vì sao điều này cực kỳ quan trọng:** Tránh vô tình commit toàn bộ nội dung worktree vào kho chứa (repository).

#### Tạo Worktree

```bash
# Xác định đường dẫn dựa trên vị trí đã chọn
path="$LOCATION/$BRANCH_NAME"

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

**Dự phòng khi dính Sandbox:** Nếu `git worktree add` thất bại do lỗi phân quyền (bị sandbox chặn), hãy báo với người dùng rằng sandbox đã ngăn việc tạo worktree và bạn sẽ làm việc trực tiếp tại thư mục hiện tại. Sau đó tiến hành cài đặt và chạy test baseline tại chỗ.

## Bước 2: Thiết Lập Dự Án (Project Setup)

Tự động phát hiện và chạy lệnh thiết lập phù hợp:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## Bước 3: Xác Minh Trạng Thái Baseline Sạch

Chạy bộ kiểm thử để đảm bảo workspace bắt đầu ở trạng thái xanh sạch:

```bash
# Dùng lệnh phù hợp với dự án
npm test / cargo test / pytest / go test ./...
```

**Nếu test thất bại:** Báo cáo các lỗi thất bại, hỏi xem nên tiếp tục hay điều tra trước.

**Nếu test vượt qua:** Báo cáo sẵn sàng.

### Mẫu Báo Cáo

```
Worktree đã sẵn sàng tại <full-path>
Bộ test đã vượt qua (<N> tests, 0 lỗi)
Sẵn sàng triển khai tính năng <feature-name>
```

## Tra Cứu Nhanh

| Tình huống | Hành động |
|-----------|--------|
| Đã ở trong linked worktree | Bỏ qua bước tạo (Bước 0) |
| Đang ở trong a submodule | Xử lý như repo bình thường (Bước 0 guard) |
| Có sẵn công cụ native worktree | Sử dụng công cụ đó (Bước 1a) |
| Không có công cụ native | Dùng git worktree thủ công (Bước 1b) |
| Đã có sẵn thư mục `.worktrees/` | Sử dụng nó (xác minh đã ignore) |
| Đã có sẵn thư mục `worktrees/` | Sử dụng nó (xác minh đã ignore) |
| Cả hai thư mục cùng tồn tại | Dùng `.worktrees/` |
| Không có thư mục nào tồn tại | Kiểm tra file hướng dẫn, mặc định dùng `.worktrees/` |
| Thư mục chưa được ignore | Thêm vào .gitignore + commit |
| Lỗi phân quyền khi tạo | Dự phòng sandbox, làm việc tại chỗ |
| Test thất bại khi kiểm tra baseline | Báo cáo lỗi + hỏi ý kiến |
| Không có package.json/Cargo.toml | Bỏ qua bước cài dependencies |

## Ngụy Biện Phổ Biến

| Lời bào chữa | Thực tế |
|--------|---------|
| "Rõ ràng là tôi không ở trong worktree — khỏi cần kiểm tra" | Hãy chạy Bước 0. Sự cô lập do môi trường tạo ra và submodule đều có thể đánh lừa mắt thường; các lệnh phát hiện mới cho kết quả chuẩn xác. |
| "`git worktree add` nhanh hơn việc đi tìm công cụ native" | Công cụ native quản lý việc đặt vị trí, tạo nhánh và dọn dẹp. Bỏ qua nó là sai lầm số 1 — tạo ra trạng thái ẩn mà môi trường không thể nhìn thấy hay quản lý. |
| "Thư mục worktree chắc chắn đã được ignore rồi" | Hãy chạy `git check-ignore`. Một thư mục worktree chưa được ignore sẽ commit cả cây thư mục vào repo. |
| "Đặt tên thư mục nào cũng được" | Hướng dẫn rõ ràng đè lên thư mục cục bộ sẵn có, và thư mục cục bộ đè lên mặc định `.worktrees/`. |
| "Workspace còn mới nguyên — test baseline để sau cũng được" | Một baseline bị bẩn làm cho mọi lỗi phát sinh sau này đều trở nên mơ hồ. Hãy chạy test ngay bây giờ; việc tiếp tục khi có lỗi là quyết định của người dùng. |
