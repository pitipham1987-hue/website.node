import { formatVnDate } from "@/lib/portal/format";
import type { ProjectUpdate } from "@/lib/portal/queries";

export function UpdatesFeed({ items }: { items: ProjectUpdate[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Chưa có cập nhật nào.</p>;
  }

  return (
    <ol aria-label="Nhật ký cập nhật" className="space-y-4">
      {items.map((update) => (
        <li
          key={update.id}
          className="rounded-2xl border border-border bg-surface p-5"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <time dateTime={update.createdAt}>
              {formatVnDate(update.createdAt)}
            </time>
            <span aria-hidden>·</span>
            <span>{update.authorName}</span>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
            {update.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
