---
name: finishing-a-development-branch
description: Sử dụng khi hoàn thành việc triển khai, tất cả các bài test đã vượt qua, và bạn cần quyết định cách tích hợp công việc
---

# Hoàn Tất Nhánh Phát Triển (Finishing a Development Branch)

## Tổng Quan

**Nguyên tắc cốt lõi:** Xác minh test → Phát hiện môi trường → Trình bày các tùy chọn → Thực thi lựa chọn → Dọn dẹp.

**Thông báo khi bắt đầu:** "Tôi đang sử dụng skill finishing-a-development-branch để hoàn tất công việc này."

## Bước 1: Xác Minh Test (Verify Tests)

Chạy toàn bộ bộ test suite của dự án (`npm test` / `cargo test` / `pytest` / `go test ./...`).

**Nếu test thất bại**, hãy báo cáo các lỗi thất bại và dừng lại — menu lựa chọn chỉ xuất hiện sau khi bộ test đạt màu xanh (green):

```
Các bài test bị thất bại (<N> lỗi). Bắt buộc phải sửa trước khi hoàn thành:

[Hiển thị các lỗi thất bại]
```

**Nếu các test vượt qua:** chuyển sang Bước 2.

## Bước 2: Phát Hiện Môi Trường (Detect Environment)

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

Điều này xác định menu nào sẽ hiển thị và cách thức dọn dẹp hoạt động:

| Trạng thái | Menu | Dọn dẹp |
|-------|------|---------|
| `GIT_DIR == GIT_COMMON` (repo bình thường) | 3 tùy chọn tiêu chuẩn | Không có worktree để dọn dẹp |
| `GIT_DIR != GIT_COMMON`, nhánh có tên | 3 tùy chọn tiêu chuẩn | Dựa vào nguồn gốc (xem Bước 6) |
| `GIT_DIR != GIT_COMMON`, detached HEAD | 2 tùy chọn rút gọn (không merge) | Do bên ngoài quản lý — giữ nguyên tại chỗ |

## Bước 3: Xác Định Nhánh Gốc (Determine Base Branch)

Nhánh gốc (base branch) là nhánh mà công việc này được tách ra từ đó — thường được đặt tên trong kế hoạch, cuộc hội thoại, hoặc upstream của nhánh. Nếu chưa biết, hãy hỏi: "Nhánh này tách ra từ <dự đoán tốt nhất của bạn> - có đúng không?"
Xác nhận trước khi merge: merge nhầm vào nhánh gốc sai rất tốn công để hoàn tác.

## Bước 4: Trình Bày Các Lựa Chọn (Present Options)

**Repo bình thường và worktree của nhánh có tên — trình bày ĐÚNG 3 tùy chọn này:**

```
Công việc triển khai đã hoàn tất. Bạn muốn làm gì tiếp theo?

1. Merge về nhánh <base-branch> tại máy cục bộ (locally)
2. Push lên remote và tạo một Pull Request
3. Giữ nguyên nhánh như hiện tại (tôi sẽ xử lý sau)

Bạn chọn phương án nào?
```

**Detached HEAD — trình bày ĐÚNG 2 tùy chọn này:**

```
Công việc triển khai đã hoàn tất. Bạn đang ở trạng thái detached HEAD (không gian làm việc do bên ngoài quản lý).

1. Push dưới dạng nhánh mới và tạo Pull Request
2. Giữ nguyên như hiện tại (tôi sẽ xử lý sau)

Bạn chọn phương án nào?
```

Trình bày menu chính xác như văn bản trên — ngắn gọn. Chờ phản hồi từ họ; quyết định tích hợp thuộc về họ.

## Bước 5: Thực Thi Lựa Chọn (Execute Choice)

### Tùy Chọn 1: Merge Cục Bộ (Merge Locally)

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# Merge trước — xác minh thành công trước khi xóa bất kỳ thứ gì
git checkout <base-branch>
git pull
git merge <feature-branch>

# Xác minh các bài test trên kết quả sau khi merge
<test command>
```

Nếu test thất bại trên kết quả đã merge: dừng lại, giữ nguyên worktree và nhánh tại chỗ, và điều tra — chưa có gì được push, nên việc merge là cục bộ và có thể khôi phục được.

Khi kết quả merge đã xanh: dọn dẹp worktree (Bước 6), sau đó xóa nhánh:

```bash
git branch -d <feature-branch>
```

### Tùy Chọn 2: Push Và Tạo PR

```bash
git push -u origin <feature-branch>
# Nếu từ detached HEAD, đặt tên nhánh mới trên remote:
# git push origin HEAD:refs/heads/<new-branch>
```

Tạo pull/merge request đối chiếu với <base-branch> bằng công cụ của kho chứa và báo cáo URL cho người dùng.
Giữ lại worktree — người dùng có thể tái lặp dựa trên phản hồi PR tại đó.

### Tùy Chọn 3: Giữ Nguyên Như Hiện Tại

Báo cáo: "Đang giữ nguyên nhánh <name>. Worktree được lưu giữ tại <path>."

## Bước 6: Dọn Dẹp Không Gian Làm Việc (Cleanup Workspace)

**Chạy cho Tùy chọn 1 và các trường hợp xác nhận hủy bỏ công việc.** Tùy chọn 2 và 3 luôn giữ lại worktree.

**Nếu `GIT_DIR == GIT_COMMON`:** Repo bình thường, không có worktree để dọn dẹp. Xong.

**Nếu `WORKTREE_PATH` nằm dưới `.worktrees/` hoặc `worktrees/`:** Superpowers đã tạo worktree này — chúng ta sở hữu việc dọn dẹp:

```bash
git worktree remove "$WORKTREE_PATH"
git worktree prune
```
