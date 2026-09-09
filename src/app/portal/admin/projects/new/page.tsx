import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/portal/session";
import { AdminNav } from "@/components/portal/admin/AdminNav";
import { ProjectForm } from "@/components/portal/admin/ProjectForm";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div>
      <AdminNav />
      <Link
        href="/portal/admin"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Trang quản trị
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Tạo dự án mới
      </h1>
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <ProjectForm mode="create" />
      </div>
    </div>
  );
}
