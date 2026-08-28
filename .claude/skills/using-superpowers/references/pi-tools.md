# Ánh xạ công cụ Pi

Các Skill diễn đạt bằng hành động ("điều phối subagent", "tạo todo", "đọc file"). Trên Pi, các hành động này tương ứng với các công cụ bên dưới.

| Hành động Skill yêu cầu | Công cụ tương đương trên Pi |
| --- | --- |
| Điều phối subagent (dùng mẫu `Subagent (general-purpose):`) | Sử dụng công cụ subagent đã cài đặt như `subagent` từ gói `pi-subagents` nếu có |
| Theo dõi nhiệm vụ ("tạo todo", "đánh dấu hoàn thành") | Sử dụng công cụ todo/task đã cài đặt nếu có, nếu không thì theo dõi nhiệm vụ trong kế hoạch hoặc file `TODO.md` |

## Subagent

Pi core không đi kèm công cụ subagent tiêu chuẩn. Gói `pi-subagents` là một công cụ mở rộng tùy chọn mạnh mẽ và cung cấp công cụ `subagent` hỗ trợ các quy trình đơn-agent, chuỗi (chain), song song (parallel), bất đồng bộ (async), tách ngữ cảnh (forked-context), và khôi phục/trạng thái (resume/status). Nếu không có công cụ subagent nào, không tự tạo các lời gọi `Task`; hãy thực thi tuần tự trong session hiện tại hoặc giải thích rằng tính năng subagent tùy chọn chưa được cài đặt.

## Danh sách nhiệm vụ (Task lists)

Pi core không đi kèm công cụ quản lý task-list tiêu chuẩn. Nếu có extension todo/task được cài đặt, hãy sử dụng công cụ được hướng dẫn của nó. Nếu không, hãy dùng các file plan của Superpowers, danh sách checklist trong Markdown, hoặc file `TODO.md` tại dự án để theo dõi nhiệm vụ. Tài liệu Superpowers cũ hơn có thể đề cập đến `TodoWrite`; hãy coi đó là hành động theo dõi nhiệm vụ ở trên.
