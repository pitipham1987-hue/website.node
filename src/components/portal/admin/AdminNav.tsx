import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

export function AdminNav() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
        <ShieldCheck className="size-4 text-accent" aria-hidden />
        Khu quản trị
      </span>
      <Link
        href="/portal"
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
      >
        Xem giao diện khách
        <ArrowUpRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
