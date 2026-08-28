## Điều phối Subagent yêu cầu hỗ trợ đa-agent (multi-agent)

Thêm vào cấu hình Codex của bạn (`~/.codex/config.toml`):

```toml
[features]
multi_agent = true
```

Cấu hình này kích hoạt các công cụ `spawn_agent`, `wait_agent`, và `close_agent` cho các skill như `dispatching-parallel-agents` và `subagent-driven-development`. Khi sử dụng `subagent-driven-development`, hãy đóng subagent reviewer khi công việc review trả về kết quả. Giữ từng subagent implementer mở cho đến khi bài review của task đó vượt qua — vòng lặp sửa lỗi (fix loop) sẽ tiếp tục làm việc với implementer đó — sau đó mới đóng. Nếu môi trường của bạn không thể gửi tin nhắn tiếp theo tới agent đã mở, hãy điều phối mỗi vòng sửa lỗi dưới dạng một implementer mới mang theo file brief, file report và danh sách các phát hiện (findings).

## Phát hiện Môi trường

Các skill tạo worktree hoặc hoàn tất nhánh nên phát hiện môi trường của chúng bằng các lệnh git chỉ đọc trước khi tiến hành:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

- `GIT_DIR != GIT_COMMON` → Đã ở trong một linked worktree (bỏ qua bước tạo)
- `BRANCH` trống → Detached HEAD (không thể tạo nhánh/push/tạo PR từ sandbox)

Xem `using-git-worktrees` Bước 0 và `finishing-a-development-branch` Bước 1 để biết cách mỗi skill sử dụng các tín hiệu này.

## Hoàn tất trên Codex App

Khi sandbox chặn các thao tác tạo nhánh/push (trạng thái detached HEAD trong worktree do bên ngoài quản lý), agent sẽ commit toàn bộ công việc và thông báo cho người dùng sử dụng các nút điều khiển có sẵn của App:

- **"Tạo nhánh"** — đặt tên cho nhánh, sau đó commit/push/tạo PR thông qua UI ứng dụng
- **"Bàn giao về máy cục bộ"** — chuyển giao công việc về bản checkout cục bộ của người dùng

Agent vẫn có thể chạy test, stage file và đưa ra gợi ý tên nhánh, tin nhắn commit và mô tả PR để người dùng sao chép.
