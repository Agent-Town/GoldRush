import { defineConfig, devices } from '@playwright/test';

const captureBaseURL = process.env.GR_CAPTURE_BASE_URL;
const baseURL = captureBaseURL ?? 'http://127.0.0.1:5188';
const captureRun = process.env.GR_CAPTURE_RUN === '1';

// THE FIRE SHELL RUNS SERIALLY — F-1270-1, measured s1270. `scripts/fire.md` §3.1 makes
// `--workers=1` a correctness requirement of every fire-side playwright command, because the
// fire's launchd process context carries a per-job CPU ceiling (F-1269-1): at the default 6
// obtained workers each chromium is starved and timing-sensitive assertions go red. Interleaved,
// same shell, same hour: w=1 -> 3/3 runs rc=0, 0 drift reds / 18; default -> 3/3 runs rc=1,
// 17 drift reds / 18 — and w=1 was FASTER (55.94s vs 60.74s), so serialising costs the fire
// nothing. A law with no mechanism decays, so this is the mechanism.
//
// The predicate tests PRESENCE, not value: launchd sets CLAUDE_CONFIG_DIR=~/.claude-fires while
// scripts/fire-runner.sh:81 sets ~/.claude-alt, and a value match would miss the second launch
// path. Lanes and attended sessions use the default config dir and never set it (verified absent
// from ~/.zshrc and ~/.zprofile), so they keep full parallelism — the lane shell runs 6 workers
// ~3.5x FASTER (F-1267-1) and must not pay for a fire-only defect.
//
// ⚠️ MEASURING WORKER COUNT? Pass the flag EXPLICITLY on both arms. A CLI `--workers=N` overrides
// this, but an arm that passes NO flag no longer means "6" in a fire — it means 1.
const isFireShell = process.env.CLAUDE_CONFIG_DIR !== undefined;

export default defineConfig({
  testDir: './e2e',
  testIgnore: captureRun ? [] : ['**/*.rig.ts'],
  testMatch: captureRun ? ['**/*.rig.ts'] : undefined,
  timeout: 30_000,
  workers: isFireShell ? 1 : undefined,
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
