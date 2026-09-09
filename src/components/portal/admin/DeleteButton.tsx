"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  confirmText,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmText: string;
  label: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-full border border-danger px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger hover:text-danger-foreground"
      >
        <Trash2 className="size-3.5" aria-hidden />
        {label}
      </button>
    </form>
  );
}
