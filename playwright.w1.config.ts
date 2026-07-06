import { defineConfig, devices } from '@playwright/test';

// s59 scratch config: 5188 (and 5219) held by stale vites we cannot kill
// (kill not allow-listed). Spawn our OWN fresh vite on 5231 (strictPort)
// serving the current working tree so the w1-01 terrain-relief gate is
// deterministic and never touches lane-c's fixed 5188. Delete after the fire.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://127.0.0.1:5231',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel: 'chromium',
  },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 5231 --strictPort',
    url: 'http://127.0.0.1:5231',
    reuseExistingServer: false,
    timeout: 20_000,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], browserName: 'chromium', viewport: { width: 390, height: 844 } },
    },
  ],
});
