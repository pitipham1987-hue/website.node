"use client";

import { useActionState } from "react";
import { approveAndAssign } from "@/lib/portal/admin-actions";
import { initialActionState } from "@/lib/portal/admin-action-state";
import type { AssignableProject } from "@/lib/portal/admin-queries";

export function ApproveAssignForm({
  profileId,
  projects,
}: {
  profileId: string;
  projects: AssignableProject[];
}) {
  const [state, formAction, pending] = useActionState(
    approveAndAssign,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="profileId" value={profileId} />

      <fieldset>
        <legend className="text-sm font-medium text-foreground">
          Gán vào dự án <span className="text-muted">(có thể để trống)</span>
        </legend>
        {projects.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Chưa có dự án nào.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {projects.map((p) => (
              <li key={p.id}>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name="projectIds"
                    value={p.id}
                    className="size-4 rounded border-border"
                  />
                  {p.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Đang duyệt…" : "Duyệt khách"}
      </button>
    </form>
  );
}
