import { vi } from "vitest";

// "server-only" ném lỗi khi bị import từ môi trường không phải React Server
// Component (đúng như thiết kế — chặn nhầm import trong Client Component).
// Vitest chạy trong Node thuần, không phải runtime RSC của Next.js, nên cần
// mock rỗng để các module DAL (vd. src/lib/portal/session.ts) import được.
vi.mock("server-only", () => ({}));
