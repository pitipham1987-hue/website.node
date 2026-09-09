/**
 * Validation thuần cho Server Actions admin — không I/O, không "server-only"
 * (test chạy trong Node thuần). Mỗi hàm nhận FormData (hoặc giá trị đã rút) và
 * trả kết quả phân biệt rõ hợp lệ / không hợp lệ kèm lỗi theo field.
 */

export type Validated<T> =
  | { ok: true; value: T }
  | { ok: false; error?: string; fieldErrors: Record<string, string> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Rút 1 field text, trim. Không có -> "". */
function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export interface ProjectInput {
  name: string;
  statusLabel: string;
  summary: string | null;
}

export function validateProjectInput(formData: FormData): Validated<ProjectInput> {
  const name = str(formData, "name");
  const statusLabel = str(formData, "status_label");
  const summaryRaw = str(formData, "summary");
  const fieldErrors: Record<string, string> = {};

  if (name.length === 0) fieldErrors.name = "Vui lòng nhập tên dự án.";
  else if (name.length > 200)
    fieldErrors.name = "Tên dự án tối đa 200 ký tự.";

  if (statusLabel.length === 0)
    fieldErrors.status_label = "Vui lòng nhập trạng thái dự án.";
  else if (statusLabel.length > 100)
    fieldErrors.status_label = "Trạng thái tối đa 100 ký tự.";

  if (summaryRaw.length > 2000)
    fieldErrors.summary = "Tóm tắt tối đa 2000 ký tự.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return {
    ok: true,
    value: { name, statusLabel, summary: summaryRaw.length > 0 ? summaryRaw : null },
  };
}

export function validateMilestoneTitle(
  formData: FormData,
): Validated<{ title: string }> {
  const title = str(formData, "title");
  const fieldErrors: Record<string, string> = {};
  if (title.length === 0) fieldErrors.title = "Vui lòng nhập tên mốc.";
  else if (title.length > 200) fieldErrors.title = "Tên mốc tối đa 200 ký tự.";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, value: { title } };
}

export interface UpdateInput {
  body: string;
  authorName: string;
}

export function validateUpdateInput(formData: FormData): Validated<UpdateInput> {
  const body = str(formData, "body");
  const authorName = str(formData, "author_name");
  const fieldErrors: Record<string, string> = {};

  if (body.length === 0) fieldErrors.body = "Vui lòng nhập nội dung cập nhật.";
  else if (body.length > 5000)
    fieldErrors.body = "Nội dung tối đa 5000 ký tự.";

  if (authorName.length === 0)
    fieldErrors.author_name = "Vui lòng nhập tên người đăng.";
  else if (authorName.length > 120)
    fieldErrors.author_name = "Tên người đăng tối đa 120 ký tự.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return { ok: true, value: { body, authorName } };
}

export function validateProjectIds(values: string[]): Validated<string[]> {
  for (const v of values) {
    if (!UUID_RE.test(v))
      return {
        ok: false,
        error: "Danh sách dự án không hợp lệ.",
        fieldErrors: {},
      };
  }
  return { ok: true, value: values };
}

export function validateDirection(
  value: FormDataEntryValue | null,
): Validated<"up" | "down"> {
  if (value === "up" || value === "down") return { ok: true, value };
  return { ok: false, error: "Hướng di chuyển không hợp lệ.", fieldErrors: {} };
}
