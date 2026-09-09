"use client";

import { useActionState } from "react";
import { createProject, updateProject } from "@/lib/portal/admin-actions";
import { initialActionState } from "@/lib/portal/admin-action-state";

interface ProjectFormProps {
  mode: "create" | "edit";
  project?: { id: string; name: string; statusLabel: string; summary: string | null };
}

const fieldClass =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent";

export function ProjectForm({ mode, project }: ProjectFormProps) {
  const action = mode === "create" ? createProject : updateProject;
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      {mode === "edit" && (
        <input type="hidden" name="projectId" value={project!.id} />
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground">
          Tên dự án
        </label>
        <input
          id="name"
          name="name"
          defaultValue={project?.name ?? ""}
          maxLength={200}
          required
          className={fieldClass}
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="status_label"
          className="block text-sm font-medium text-foreground"
        >
          Trạng thái (vd: Đang triển khai)
        </label>
        <input
          id="status_label"
          name="status_label"
          defaultValue={project?.statusLabel ?? ""}
          maxLength={100}
          required
          className={fieldClass}
        />
        {state.fieldErrors?.status_label && (
          <p className="mt-1 text-xs text-danger">
            {state.fieldErrors.status_label}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-foreground"
        >
          Tóm tắt <span className="text-muted">(tùy chọn)</span>
        </label>
        <textarea
          id="summary"
          name="summary"
          defaultValue={project?.summary ?? ""}
          maxLength={2000}
          rows={3}
          className={fieldClass}
        />
        {state.fieldErrors?.summary && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.summary}</p>
        )}
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending
            ? "Đang lưu…"
            : mode === "create"
              ? "Tạo dự án"
              : "Lưu thay đổi"}
        </button>
        {mode === "edit" && state.ok && (
          <span className="text-sm text-success">Đã lưu.</span>
        )}
      </div>
    </form>
  );
}
