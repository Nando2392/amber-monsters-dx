import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/gates',
  timeout: 30000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1000, height: 720 },
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
  reporter: [['list']],
});
