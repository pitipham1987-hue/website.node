import { Check } from "lucide-react";
import { formatVnDate } from "@/lib/portal/format";
import type { Milestone } from "@/lib/portal/queries";

export function MilestoneList({ items }: { items: Milestone[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        Chưa có mốc triển khai nào cho dự án này.
      </p>
    );
  }

  return (
    <ol aria-label="Các mốc triển khai" className="space-y-4">
      {items.map((milestone) => (
        <li key={milestone.id} className="flex items-start gap-3">
          <span
            aria-hidden
            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
              milestone.done
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background"
            }`}
          >
            {milestone.done && <Check className="size-3" />}
          </span>
          <div className="min-w-0">
            <p
              className={`text-sm ${
                milestone.done ? "text-foreground" : "text-muted"
              }`}
            >
              {milestone.title}
              <span className="sr-only">
                {" — "}
                {milestone.done ? "đã hoàn thành" : "chưa hoàn thành"}
              </span>
            </p>
            {milestone.done && milestone.doneAt && (
              <p className="mt-0.5 text-xs text-muted">
                Hoàn thành ngày {formatVnDate(milestone.doneAt)}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
