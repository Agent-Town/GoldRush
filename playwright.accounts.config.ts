import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:5188';
const accountsURL = 'http://127.0.0.1:8788';

export default defineConfig({
  testDir: './e2e',
  testMatch: ['accounts-sync.spec.ts'],
  timeout: 45_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel: 'chromium',
  },
  webServer: [
    {
      command:
        'rm -rf test-results/accounts-sync-worker && wrangler pages dev public --kv ACCOUNTS --binding DEV_AUTH=1 --port 8788 --ip 127.0.0.1 --persist-to test-results/accounts-sync-worker --log-level error --show-interactive-dev-session=false',
      url: `${accountsURL}/favicon-16.png`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: `VITE_ACCOUNTS_API_URL=${accountsURL} npm run dev -- --port 5188 --strictPort`,
      url: baseURL,
      reuseExistingServer: false,
      timeout: 20_000,
    },
  ],
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
