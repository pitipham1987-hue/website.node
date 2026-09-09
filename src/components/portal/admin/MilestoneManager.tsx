"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Check, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import {
  addMilestone,
  deleteMilestone,
  renameMilestone,
  reorderMilestone,
  toggleMilestone,
} from "@/lib/portal/admin-actions";
import { initialActionState } from "@/lib/portal/admin-action-state";
import { formatVnDate } from "@/lib/portal/format";
import type { AdminMilestone } from "@/lib/portal/admin-queries";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

export function MilestoneManager({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: AdminMilestone[];
}) {
  const [addState, addAction, adding] = useActionState(
    addMilestone,
    initialActionState,
  );
  const addFormRef = useRef<HTMLFormElement>(null);

  // Reset ô nhập sau khi thêm thành công.
  useEffect(() => {
    if (addState.ok) addFormRef.current?.reset();
  }, [addState]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {milestones.length === 0 ? (
        <p className="text-sm text-muted">Chưa có mốc nào.</p>
      ) : (
        <ol className="space-y-2">
          {milestones.map((m, i) => (
            <MilestoneRow
              key={m.id}
              projectId={projectId}
              milestone={m}
              isFirst={i === 0}
              isLast={i === milestones.length - 1}
            />
          ))}
        </ol>
      )}

      <form
        ref={addFormRef}
        action={addAction}
        className="mt-4 flex flex-wrap items-start gap-2"
      >
        <input type="hidden" name="projectId" value={projectId} />
        <div className="min-w-[12rem] flex-1">
          <input
            name="title"
            placeholder="Tên mốc mới"
            maxLength={200}
            required
            className={fieldClass}
          />
          {addState.fieldErrors?.title && (
            <p className="mt-1 text-xs text-danger">
              {addState.fieldErrors.title}
            </p>
          )}
          {addState.error && (
            <p className="mt-1 text-xs text-danger">{addState.error}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={adding}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:opacity-60"
        >
          {adding ? "Đang thêm…" : "Thêm mốc"}
        </button>
      </form>
    </div>
  );
}

function MilestoneRow({
  projectId,
  milestone,
  isFirst,
  isLast,
}: {
  projectId: string;
  milestone: AdminMilestone;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [renameState, renameAction] = useActionState(
    renameMilestone,
    initialActionState,
  );

  // Đóng ô sửa khi lưu thành công.
  if (renameState.ok && editing) setEditing(false);

  return (
    <li className="flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <button
        type="button"
        aria-label={
          milestone.done ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"
        }
        aria-pressed={milestone.done}
        disabled={pending}
        onClick={() =>
          startTransition(() =>
            toggleMilestone(projectId, milestone.id, !milestone.done),
          )
        }
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
          milestone.done
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border bg-background"
        }`}
      >
        {milestone.done && <Check className="size-3" aria-hidden />}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <form action={renameAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="milestoneId" value={milestone.id} />
            <input
              name="title"
              defaultValue={milestone.title}
              maxLength={200}
              required
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditing(false);
              }}
              className={`${fieldClass} flex-1`}
            />
            <button
              type="submit"
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted"
            >
              Huỷ
            </button>
            {renameState.fieldErrors?.title && (
              <p className="w-full text-xs text-danger">
                {renameState.fieldErrors.title}
              </p>
            )}
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="group inline-flex items-center gap-1.5 text-left text-sm text-foreground"
          >
            {milestone.title}
            <Pencil
              className="size-3 text-muted opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </button>
        )}
        {milestone.done && milestone.doneAt && !editing && (
          <p className="mt-0.5 text-xs text-muted">
            Hoàn thành ngày {formatVnDate(milestone.doneAt)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Đưa lên trên"
          disabled={isFirst || pending}
          onClick={() =>
            startTransition(() =>
              reorderMilestone(projectId, milestone.id, "up"),
            )
          }
          className="rounded-md border border-border p-1 text-muted disabled:opacity-30"
        >
          <ChevronUp className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Đưa xuống dưới"
          disabled={isLast || pending}
          onClick={() =>
            startTransition(() =>
              reorderMilestone(projectId, milestone.id, "down"),
            )
          }
          className="rounded-md border border-border p-1 text-muted disabled:opacity-30"
        >
          <ChevronDown className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Xoá mốc"
          disabled={pending}
          onClick={() => {
            if (window.confirm(`Xoá mốc "${milestone.title}"?`)) {
              startTransition(() => deleteMilestone(projectId, milestone.id));
            }
          }}
          className="rounded-md border border-border p-1 text-danger disabled:opacity-30"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}
