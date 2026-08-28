# Ánh xạ công cụ Antigravity CLI (`agy`)

Các Skill diễn đạt bằng hành động ("điều phối subagent", "tạo todo", "đọc file"). Trên Antigravity CLI (`agy`), các hành động này tương ứng với các công cụ bên dưới.

| Hành động Skill yêu cầu | Công cụ tương đương trên Antigravity CLI |
|----------------------|----------------------|
| Điều phối subagent (dùng mẫu `Subagent (general-purpose):`) | `invoke_subagent` với `TypeName` có sẵn — `self` cho công việc đầy đủ năng lực, `research` cho chỉ đọc |
| Theo dõi nhiệm vụ ("tạo todo", "đánh dấu hoàn thành") | một **task artifact** — `write_to_file` với `IsArtifact: true` và `ArtifactType: "task"` (xem mục [Theo dõi nhiệm vụ](#theo-dõi-nhiệm-vụ)). **Không phải** `manage_task`, vì công cụ đó dùng quản lý tiến trình chạy ngầm. |

## Theo dõi nhiệm vụ

Antigravity **không có công cụ todo riêng** (`manage_task` quản lý các tiến trình chạy nền — `list`/`kill`/`status`/`send_input` — đó *không phải* là bảng checklist). Khi một skill yêu cầu tạo danh sách todo hoặc theo dõi nhiệm vụ, hãy duy trì một **task artifact**: một danh sách dạng markdown checklist được lưu bằng `write_to_file` (`IsArtifact: true`, `ArtifactMetadata.ArtifactType: "task"`), và cập nhật bằng `replace_file_content` / `multi_replace_file_content` trong quá trình thực hiện.

Khi bắt đầu một nhiệm vụ nhiều bước, hãy tạo task artifact liệt kê từng bước trong kế hoạch. Mỗi khi hoàn thành một bước, hãy chỉnh sửa artifact để đánh dấu xong (`- [x]`). Nếu kế hoạch thay đổi, hãy cập nhật lại checklist. Luôn giữ danh sách này cập nhật — đó là nguồn sự thật duy nhất cho những gì còn lại; khi cuộc hội thoại trở nên dài, hãy đọc lại nó trước khi bắt đầu từng bước.
