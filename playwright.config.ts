import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:5188',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // channel 'chromium' = full-binary new headless. The default
    // chromium_headless_shell-1228 SIGSEGVs on the 2026-07-03 sandbox image
    // (repro: headless_shell --dump-dom about:blank → rc 139); full chrome
    // + libXdamage from ~/locallibs works. See STATUS.md environment notes.
    channel: 'chromium',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5188',
    reuseExistingServer: false,
    timeout: 20_000,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});
