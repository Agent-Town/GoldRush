import { defineConfig, devices } from '@playwright/test';

const captureBaseURL = process.env.GR_CAPTURE_BASE_URL;
const baseURL = captureBaseURL ?? 'http://127.0.0.1:5188';
const captureRun = process.env.GR_CAPTURE_RUN === '1';

export default defineConfig({
  testDir: './e2e',
  testIgnore: captureRun ? [] : ['**/*.rig.ts'],
  testMatch: captureRun ? ['**/*.rig.ts'] : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.GR_CAPTURE_EXTERNAL_SERVER === '1' ? undefined : {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 20_000,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        // channel 'chromium' = full-binary new headless. The default
        // chromium_headless_shell-1228 SIGSEGVs on the 2026-07-03 sandbox image
        // (repro: headless_shell --dump-dom about:blank → rc 139); full chrome
        // + libXdamage from ~/locallibs works. See STATUS.md environment notes.
        channel: 'chromium',
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        channel: 'chromium',
      },
    },
    {
      name: 'desktop-webkit',
      testMatch: /058-device-tiers\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
