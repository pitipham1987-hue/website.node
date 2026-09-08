# Cài đặt cùng superpowers (obra/superpowers)

Skill này là một **skill bổ sung, độc lập** — không nằm trong core repo `obra/superpowers`, không được `writing-skills`
của họ merge (README của superpowers nói rõ: "we don't generally accept contributions of new skills"). Cách tích hợp
đúng là cài nó như một **skill riêng cùng cấp** với các skill của superpowers, trong cùng thư mục skills mà agent của
bạn quét — agent sẽ tự cân nhắc dùng skill nào dựa trên `description`, không cần khai báo phụ thuộc thủ công.

## Claude Code

Personal skill (áp dụng mọi project):

```bash
mkdir -p ~/.claude/skills
cp -r golang-clean-architecture ~/.claude/skills/
```

Project-only skill (chỉ áp dụng repo hiện tại, khuyến nghị cho service Go cụ thể):

```bash
mkdir -p .claude/skills
cp -r golang-clean-architecture .claude/skills/
```

Superpowers (dù cài qua plugin marketplace `/plugin install superpowers@claude-plugins-official` hay qua
`obra/superpowers-marketplace`) tự đăng ký các skill cốt lõi của nó (`brainstorming`, `writing-plans`,
`subagent-driven-development`, `test-driven-development`, `requesting-code-review`, `finishing-a-development-branch`,
...) vào cùng cơ chế skill-lookup. Đặt `golang-clean-architecture` cùng cấp (`~/.claude/skills/` hoặc
`.claude/skills/`) là đủ để Claude Code liệt kê và cân nhắc cả hai cùng lúc — không cần cấu hình gì thêm.

## Codex / Copilot CLI / Gemini CLI (và các runtime dùng alias chung)

Các runtime này công nhận `~/.agents/skills/` như một alias chung — copy vào đây để dùng được ở nhiều runtime cùng
lúc mà không phải lặp lại:

```bash
mkdir -p ~/.agents/skills
cp -r golang-clean-architecture ~/.agents/skills/
```

## Xác minh đã nhận diện

Sau khi copy, hỏi trực tiếp agent (không cần lệnh đặc biệt):

> "Skill nào đang có sẵn cho Go/kiến trúc?"

hoặc bắt đầu một task chạm tới `internal/features/` — nếu skill trigger đúng, agent sẽ tự đọc `SKILL.md` trước khi
viết code/plan, đúng như cách nó đọc `writing-plans`/`test-driven-development`.

## Không cần sửa gì trong superpowers

Không cần fork `obra/superpowers`, không cần sửa `AGENTS.md`/`CLAUDE.md` của họ. `§1` trong `SKILL.md` của skill này
đã tự mô tả nó nên chen vào bước nào trong 7-step workflow của superpowers — agent đọc và tự phối hợp hai skill dựa
trên nội dung, không cần wiring thủ công.
