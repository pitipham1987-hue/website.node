import { afterAll, describe, expect, it } from "vitest";
import { IDS, serviceClient, signInAs } from "../helpers/supabase";

describe("RLS Giai đoạn 2 — chỉ admin ghi được bảng nghiệp vụ", () => {
  const createdProjectIds: string[] = [];

  afterAll(async () => {
    const svc = serviceClient();
    for (const id of createdProjectIds) {
      await svc.from("projects").delete().eq("id", id);
    }
    // Khôi phục role user pending nếu test đổi nhầm.
    await svc.from("profiles").update({ role: "pending" }).eq("id", IDS.pending);
  });

  it("token client: INSERT/UPDATE/DELETE projects đều bị từ chối", async () => {
    const a = await signInAs("clientA");
    const ins = await a
      .from("projects")
      .insert({ name: "x", status_label: "y" })
      .select("id");
    expect(ins.error).not.toBeNull();

    await a.from("projects").update({ name: "đổi" }).eq("id", IDS.projectA);
    const svc = serviceClient();
    const check = await svc
      .from("projects")
      .select("name")
      .eq("id", IDS.projectA)
      .single();
    expect(check.data?.name).not.toBe("đổi");
  });

  it("token client: INSERT milestones / updates bị từ chối", async () => {
    const a = await signInAs("clientA");
    const m = await a
      .from("milestones")
      .insert({ project_id: IDS.projectA, title: "hack", position: 99 });
    expect(m.error).not.toBeNull();
    const u = await a
      .from("updates")
      .insert({ project_id: IDS.projectA, body: "hack", author_name: "h" });
    expect(u.error).not.toBeNull();
  });

  it("token client: INSERT/DELETE project_members bị từ chối", async () => {
    const a = await signInAs("clientA");
    const ins = await a
      .from("project_members")
      .insert({ project_id: IDS.projectB, profile_id: IDS.clientA });
    expect(ins.error).not.toBeNull();
  });

  it("token client: nâng role người khác pending -> client bị từ chối", async () => {
    const a = await signInAs("clientA");
    await a.from("profiles").update({ role: "client" }).eq("id", IDS.pending);
    const svc = serviceClient();
    const { data } = await svc
      .from("profiles")
      .select("role")
      .eq("id", IDS.pending)
      .single();
    expect(data?.role).toBe("pending");
  });

  it("token admin: INSERT project + milestone + update + member, và đổi role pending->client", async () => {
    const admin = await signInAs("admin");

    const proj = await admin
      .from("projects")
      .insert({ name: "GĐ2 admin test", status_label: "Nháp" })
      .select("id")
      .single();
    expect(proj.error).toBeNull();
    createdProjectIds.push(proj.data!.id);
    const pid = proj.data!.id;

    const ms = await admin
      .from("milestones")
      .insert({ project_id: pid, title: "Mốc 1", position: 0 });
    expect(ms.error).toBeNull();

    const up = await admin
      .from("updates")
      .insert({ project_id: pid, body: "Khởi động", author_name: "DNK House" });
    expect(up.error).toBeNull();

    const role = await admin
      .from("profiles")
      .update({ role: "client" })
      .eq("id", IDS.pending)
      .eq("role", "pending");
    expect(role.error).toBeNull();

    const mem = await admin
      .from("project_members")
      .insert({ project_id: pid, profile_id: IDS.pending });
    expect(mem.error).toBeNull();

    const del = await admin
      .from("project_members")
      .delete()
      .eq("project_id", pid)
      .eq("profile_id", IDS.pending);
    expect(del.error).toBeNull();
  });
});
