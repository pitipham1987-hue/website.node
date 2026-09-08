import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

// E2E chạy trên Supabase LOCAL (seed cố định), không phải hosted. Nạp .env.test
// vào process.env để webServer (next build + start) dùng đúng URL/key local — kể cả
// khi .env.local đang trỏ Supabase hosted. Playwright merge process.env vào lệnh
// webServer, và @next/env không ghi đè biến đã có sẵn trong process.env.
if (existsSync(".env.test")) process.loadEnvFile(".env.test");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      E2E_TEST_LOGIN: "1",
    },
  },
});
