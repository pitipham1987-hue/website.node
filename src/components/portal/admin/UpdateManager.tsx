"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  addUpdate,
  deleteUpdate,
  updateUpdate,
} from "@/lib/portal/admin-actions";
import { initialActionState } from "@/lib/portal/admin-action-state";
import { formatVnDate } from "@/lib/portal/format";
import type { AdminUpdate } from "@/lib/portal/admin-queries";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

export function UpdateManager({
  projectId,
  updates,
  defaultAuthorName,
}: {
  projectId: string;
  updates: AdminUpdate[];
  defaultAuthorName: string;
}) {
  const [addState, addAction, adding] = useActionState(
    addUpdate,
    initialActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Reset ô nhập sau khi đăng thành công.
  useEffect(() => {
    if (addState.ok) formRef.current?.reset();
  }, [addState]);

  return (
    <div>
      <form
        ref={formRef}
        action={addAction}
        className="space-y-3 rounded-2xl border border-border bg-surface p-5"
      >
        <input type="hidden" name="projectId" value={projectId} />
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-foreground">
            Nội dung cập nhật
          </label>
          <textarea
            id="body"
            name="body"
            rows={3}
            maxLength={5000}
            required
            className={`${fieldClass} mt-1`}
          />
          {addState.fieldErrors?.body && (
            <p className="mt-1 text-xs text-danger">{addState.fieldErrors.body}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="author_name"
            className="block text-sm font-medium text-foreground"
          >
            Người đăng
          </label>
          <input
            id="author_name"
            name="author_name"
            defaultValue={defaultAuthorName}
            maxLength={120}
            required
            className={`${fieldClass} mt-1`}
          />
          {addState.fieldErrors?.author_name && (
            <p className="mt-1 text-xs text-danger">
              {addState.fieldErrors.author_name}
            </p>
          )}
        </div>
        {addState.error && (
          <p className="text-sm text-danger">{addState.error}</p>
        )}
        <button
          type="submit"
          disabled={adding}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {adding ? "Đang đăng…" : "Đăng"}
        </button>
      </form>

      {updates.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Chưa có cập nhật nào.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {updates.map((u) => (
            <UpdateRow key={u.id} projectId={projectId} update={u} />
          ))}
        </ol>
      )}
    </div>
  );
}

function UpdateRow({
  projectId,
  update,
}: {
  projectId: string;
  update: AdminUpdate;
}) {
  const [editing, setEditing] = useState(false);
  const [editState, editAction, saving] = useActionState(
    updateUpdate,
    initialActionState,
  );

  // Đóng ô sửa khi lưu thành công — so sánh với state trước để chỉ chạy đúng
  // lần editState đổi (editState giữ { ok: true } tới lần dispatch kế).
  const [prevEditState, setPrevEditState] = useState(editState);
  if (editState !== prevEditState) {
    setPrevEditState(editState);
    if (editState.ok) setEditing(false);
  }

  return (
    <li className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>
          <time dateTime={update.createdAt}>
            {formatVnDate(update.createdAt)}
          </time>
          {" · "}
          {update.authorName}
        </span>
        {!editing && (
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 text-muted transition-colors hover:text-foreground"
            >
              <Pencil className="size-3.5" aria-hidden />
              Sửa
            </button>
            <form
              action={deleteUpdate.bind(null, projectId, update.id)}
              onSubmit={(e) => {
                if (!window.confirm("Xoá nhật ký này?")) e.preventDefault();
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-1 text-danger transition-opacity hover:opacity-80"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Xoá
              </button>
            </form>
          </span>
        )}
      </div>

      {editing ? (
        <form action={editAction} className="mt-3 space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="updateId" value={update.id} />
          <textarea
            name="body"
            defaultValue={update.body}
            rows={3}
            maxLength={5000}
            required
            className={fieldClass}
          />
          {editState.fieldErrors?.body && (
            <p className="text-xs text-danger">{editState.fieldErrors.body}</p>
          )}
          <input
            name="author_name"
            defaultValue={update.authorName}
            maxLength={120}
            required
            className={fieldClass}
          />
          {editState.fieldErrors?.author_name && (
            <p className="text-xs text-danger">
              {editState.fieldErrors.author_name}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-accent-foreground disabled:opacity-60"
            >
              {saving ? "Đang lưu…" : "Lưu"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-border px-4 py-1.5 text-xs text-muted"
            >
              Huỷ
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
          {update.body}
        </p>
      )}
    </li>
  );
}
