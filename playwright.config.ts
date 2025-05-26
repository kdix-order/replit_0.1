import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true
  },
  testDir: 'e2e',
  timeout: 60_000,
  use: { headless: true, viewport: { width: 1280, height: 720 } },
  projects: [{ name: 'chromium', use: devices['Desktop Chrome'] }]
});
