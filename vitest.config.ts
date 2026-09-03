import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Mock "server-only" — package này ném lỗi khi import ngoài runtime RSC
    // của Next.js; DAL như src/lib/portal/session.ts cần import được trong test.
    setupFiles: ["tests/setup.ts"],
    // Integration test dùng chung 1 DB local -> chạy tuần tự, timeout rộng.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
