import { UserMinus, UserPlus } from "lucide-react";
import { addMember, removeMember } from "@/lib/portal/admin-actions";
import { getAssignableClients } from "@/lib/portal/admin-queries";
import type { AdminMember } from "@/lib/portal/admin-queries";

export async function MemberList({
  projectId,
  members,
}: {
  projectId: string;
  members: AdminMember[];
}) {
  const assignable = await getAssignableClients(projectId);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {members.length === 0 ? (
        <p className="text-sm text-muted">Chưa có thành viên nào.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.profileId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="text-foreground">
                {m.fullName ? `${m.fullName} · ` : ""}
                <span className="text-muted">{m.email}</span>
              </span>
              <form action={removeMember.bind(null, projectId, m.profileId)}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-xs text-danger transition-opacity hover:opacity-80"
                >
                  <UserMinus className="size-3.5" aria-hidden />
                  Gỡ
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {assignable.length > 0 && (
        <form
          action={async (formData: FormData) => {
            "use server";
            const profileId = String(formData.get("profileId") ?? "");
            if (profileId) await addMember(projectId, profileId);
          }}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <select
            name="profileId"
            required
            defaultValue=""
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="" disabled>
              Chọn khách để thêm…
            </option>
            {assignable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName ? `${c.fullName} — ${c.email}` : c.email}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            <UserPlus className="size-4" aria-hidden />
            Thêm
          </button>
        </form>
      )}
    </div>
  );
}
