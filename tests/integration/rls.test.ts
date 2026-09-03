import { beforeAll, describe, expect, it } from "vitest";
import { IDS, serviceClient, signInAs } from "../helpers/supabase";

describe("RLS — cô lập dữ liệu dự án", () => {
  beforeAll(async () => {
    const svc = serviceClient();
    const { data } = await svc.from("projects").select("id");
    if (!data || data.length < 2) {
      throw new Error("Chưa seed dữ liệu. Chạy `npx supabase db reset` trước.");
    }
  });

  it("Khách A không đọc được dự án B", async () => {
    const a = await signInAs("clientA");
    const { data } = await a.from("projects").select("id").eq("id", IDS.projectB);
    expect(data).toEqual([]);
  });

  it("Khách A không đọc được milestones/updates của dự án B", async () => {
    const a = await signInAs("clientA");
    const ms = await a.from("milestones").select("id").eq("project_id", IDS.projectB);
    const up = await a.from("updates").select("id").eq("project_id", IDS.projectB);
    expect(ms.data).toEqual([]);
    expect(up.data).toEqual([]);
  });

  it("Khách A đọc được đúng dự án của mình", async () => {
    const a = await signInAs("clientA");
    const { data } = await a.from("projects").select("id").eq("id", IDS.projectA);
    expect(data).toEqual([{ id: IDS.projectA }]);
  });

  it("Khách A không ghi được vào bảng nghiệp vụ", async () => {
    const a = await signInAs("clientA");
    const ins = await a
      .from("updates")
      .insert({ project_id: IDS.projectA, body: "hack", author_name: "hacker" });
    expect(ins.error).not.toBeNull();

    await a.from("projects").update({ name: "đổi tên" }).eq("id", IDS.projectA);
    const svc = serviceClient();
    const check = await svc
      .from("projects")
      .select("name")
      .eq("id", IDS.projectA)
      .single();
    expect(check.data?.name).not.toBe("đổi tên");

    await a.from("milestones").delete().eq("project_id", IDS.projectA);
    const left = await svc.from("milestones").select("id").eq("project_id", IDS.projectA);
    expect((left.data ?? []).length).toBeGreaterThan(0);
  });

  it("Khách A không ghi được vào project_members (không tự gán/xoá được thành viên)", async () => {
    const a = await signInAs("clientA");
    const svc = serviceClient();

    // Cố tự gán mình vào dự án B để leo quyền truy cập dự án của khách khác.
    const ins = await a
      .from("project_members")
      .insert({ project_id: IDS.projectB, profile_id: IDS.clientA });
    expect(ins.error).not.toBeNull();
    const checkIns = await svc
      .from("project_members")
      .select("project_id")
      .eq("project_id", IDS.projectB)
      .eq("profile_id", IDS.clientA);
    expect(checkIns.data).toEqual([]);

    // Cố xoá chính dòng thành viên của mình ở dự án A (chỉ admin được sửa).
    await a
      .from("project_members")
      .delete()
      .eq("project_id", IDS.projectA)
      .eq("profile_id", IDS.clientA);
    const checkDel = await svc
      .from("project_members")
      .select("project_id")
      .eq("project_id", IDS.projectA)
      .eq("profile_id", IDS.clientA);
    expect(checkDel.data).toEqual([{ project_id: IDS.projectA }]);
  });

  it("User pending không đọc được bảng nghiệp vụ nào", async () => {
    const p = await signInAs("pending");
    for (const table of ["projects", "milestones", "updates", "project_members"] as const) {
      const { data } = await p.from(table).select("*");
      expect(data).toEqual([]);
    }
  });

  it("Client tự nâng role thành admin -> bị trigger từ chối", async () => {
    const a = await signInAs("clientA");
    const { error } = await a
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", IDS.clientA);
    expect(error).not.toBeNull();
    const svc = serviceClient();
    const { data } = await svc
      .from("profiles")
      .select("role")
      .eq("id", IDS.clientA)
      .single();
    expect(data?.role).toBe("client");
  });

  it("Admin đọc được mọi dự án và insert được project", async () => {
    const admin = await signInAs("admin");
    const all = await admin.from("projects").select("id");
    expect((all.data ?? []).length).toBeGreaterThanOrEqual(2);
    const ins = await admin
      .from("projects")
      .insert({ name: "Dự án test admin", status_label: "Nháp" })
      .select("id")
      .single();
    expect(ins.error).toBeNull();
    if (ins.data?.id) {
      await serviceClient().from("projects").delete().eq("id", ins.data.id);
    }
  });

  it("Trigger set_milestone_done_at: bật done điền done_at, tắt done xoá done_at", async () => {
    const svc = serviceClient();
    const { data: m } = await svc
      .from("milestones")
      .select("id")
      .eq("project_id", IDS.projectA)
      .eq("done", false)
      .limit(1)
      .single();
    const id = m!.id;
    const on = await svc
      .from("milestones")
      .update({ done: true })
      .eq("id", id)
      .select("done_at")
      .single();
    expect(on.data?.done_at).not.toBeNull();
    const off = await svc
      .from("milestones")
      .update({ done: false })
      .eq("id", id)
      .select("done_at")
      .single();
    expect(off.data?.done_at).toBeNull();
  });
});
