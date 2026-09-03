import { requireClient } from "@/lib/portal/session";
import { PendingNotice } from "@/components/portal/PendingNotice";

export default async function PortalPage() {
  const access = await requireClient();

  if (access.status === "pending") {
    return <PendingNotice />;
  }

  const name = access.profile.fullName ?? access.profile.email;
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">
        Xin chào, {name}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Danh sách dự án của bạn sẽ hiển thị ở đây. Tính năng đang được hoàn thiện.
      </p>
    </div>
  );
}
