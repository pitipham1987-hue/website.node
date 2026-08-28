# Ánh xạ công cụ Gemini CLI

Các Skill diễn đạt bằng hành động ("điều phối subagent", "tạo todo", "đọc file"). Trên Gemini CLI, các hành động này tương ứng với các công cụ bên dưới.

| Hành động Skill yêu cầu | Công cụ tương đương trên Gemini CLI |
|----------------------|----------------------|
| Đọc một file | `read_file` |
| Đọc nhiều file cùng lúc | `read_many_files` |
| Tạo file mới | `write_file` |
| Chỉnh sửa file | `replace` |
| Chạy lệnh shell | `run_shell_command` |
| Tìm kiếm nội dung file | `grep_search` |
| Tìm file theo tên | `glob` |
| Liệt kê file và thư mục con | `list_directory` |
| Lấy nội dung URL | `web_fetch` |
| Tìm kiếm trên web | `google_web_search` |
| Kích hoạt một skill | `activate_skill` |
| Điều phối subagent (dùng mẫu `Subagent (general-purpose):`) | `invoke_agent` với `agent_name: "generalist"` (có thể gọi qua cú pháp `@generalist` trong chat) |
| Điều phối song song nhiều subagent | Nhiều lệnh gọi `invoke_agent` trong cùng một phản hồi |
| Theo dõi nhiệm vụ ("tạo todo", "đánh dấu hoàn thành") | `write_todos` (trạng thái: pending, in_progress, completed, cancelled, blocked) |

## File hướng dẫn

Khi một skill đề cập đến "file hướng dẫn của bạn", trên Gemini CLI đó chính là **`GEMINI.md`**. Gemini CLI nạp `GEMINI.md` theo phân cấp: cấp toàn cục tại `~/.gemini/GEMINI.md`, cấp dự án trong thư mục làm việc và các thư mục cha, và file `GEMINI.md` trong thư mục con khi một công cụ truy cập file trong thư mục đó.

## Thư mục skill cá nhân

Các skill ở cấp người dùng nằm tại **`~/.gemini/skills/`**, với **`~/.agents/skills/`** là đường dẫn alias dùng chung (chia sẻ với Codex và Copilot CLI). Khi cả hai thư mục cùng tồn tại ở một phạm vi, `.agents/skills/` sẽ được ưu tiên. Mỗi skill là một thư mục con chứa file `SKILL.md` (có frontmatter `name` và `description`).

## Hỗ trợ Subagent

Gemini CLI điều phối subagent thông qua công cụ `invoke_agent`, công cụ này nhận các tham số `agent_name` và `prompt`. Cùng việc điều phối đó cũng có thể dùng cú pháp phím tắt trong chat: gõ `@generalist <prompt>` tương đương với việc gọi `invoke_agent` với `agent_name: "generalist"`. Tên các agent có sẵn bao gồm `generalist`, `cli_help`, `codebase_investigator`, và (khi bật công cụ trình duyệt) `browser_agent`.

Các skill điều phối với `Subagent (general-purpose):` sẽ tham chiếu đến một file template prompt (ví dụ: `./implementer-prompt.md` của `superpowers:subagent-driven-development`) hoặc cung cấp prompt trực tiếp (inline). Trên Gemini CLI:

| Dạng điều phối trong Skill | Công cụ tương đương trên Gemini CLI |
|---------------------|----------------------|
| Tham chiếu file template `*-prompt.md` (implementer, task-reviewer, code-reviewer, v.v.) | Điền thông tin vào template, sau đó `invoke_agent` với `agent_name: "generalist"` và prompt đã điền |
| Tham chiếu `./code-reviewer.md` của `superpowers:requesting-code-review` | `invoke_agent` với `agent_name: "generalist"` và template review đã điền |
| Prompt trực tiếp (không tham chiếu template) | `invoke_agent` với `agent_name: "generalist"` và prompt trực tiếp của bạn |

### Điền thông tin vào Prompt (Prompt filling)

Các skill cung cấp các mẫu prompt có sẵn các giữ chỗ (placeholder) như `{WHAT_WAS_IMPLEMENTED}` hoặc `[FULL TEXT of task]`. Hãy điền đầy đủ tất cả các placeholder trước khi truyền prompt hoàn chỉnh cho `invoke_agent`. Bản thân mẫu prompt đã chứa vai trò của agent, tiêu chí review và định dạng output mong đợi — subagent sẽ tuân thủ theo đó.

### Điều phối song song (Parallel dispatch)

Gemini CLI hỗ trợ điều phối subagent song song. Hãy đưa ra nhiều lời gọi `invoke_agent` trong cùng một phản hồi (hoặc nhiều cú pháp `@generalist` trong một prompt) để chạy các công việc subagent độc lập một cách song song. Giữ các nhiệm vụ phụ thuộc lẫn nhau theo thứ tự tuần tự, nhưng không tuần tự hóa các nhiệm vụ subagent độc lập chỉ để giữ lịch sử đơn giản.
