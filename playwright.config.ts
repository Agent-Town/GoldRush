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

// F-1296-3 (s1296 measured it on itself; class fix s1301): three specs are claimed EXCLUSIVELY by
// another config's `testMatch`, and each needs a harness THIS config cannot provide. Nothing used to
// stop the default harness collecting them anyway — `testDir: './e2e'` swept them in, they failed for
// environmental reasons, and the reds looked exactly like ordinary tree reds (same reporter, same
// shape, no diagnostic saying "wrong harness"). s1296 followed the house adjacency recipe
// (`grep -rln` over e2e/), pulled in release-build.spec.ts, and manufactured 8 reds that were its
// instrument rather than the tree. Only reading the OTHER config revealed it.
//   release-build.spec.ts      → playwright.release.config.ts      (release build in dist/, preview @5190)
//   release-base-path.spec.ts  → playwright.release-base.config.ts (release under /goldrush/ @5191)
//   accounts-sync.spec.ts      → playwright.accounts.config.ts     (wrangler accounts worker + KV @8788)
// Each was verified s1301 to be collected by THIS config and to require a server this config never
// starts — coverage is not lost, it moves to the owning config (`npm run test:release`, etc.).
// ⚠️ Adding a spec here REMOVES it from the default gate: only ever list a spec whose owning config
// you have read and whose harness this one provably cannot satisfy.
const claimedByAnotherConfig = [
  '**/release-build.spec.ts',
  '**/release-base-path.spec.ts',
  '**/accounts-sync.spec.ts',
];

export default defineConfig({
  testDir: './e2e',
  testIgnore: captureRun ? [] : ['**/*.rig.ts', ...claimedByAnotherConfig],
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
  // F-1457-1 (stated s1457, mechanised s1463). The `undefined` branch below hands the whole
  // question of WHAT is listening to the caller, and nothing used to check the answer. s1457 gated
  // against a production `vite preview` on the scratch port: e2-pressure-garden went 2 failed in
  // 129s on 60s click timeouts, and 2 passed in 18s on `npm run dev`. The reds were the
  // instrument's. This globalSetup probes the external server and refuses early with a message
  // naming the fix, instead of letting the suite manufacture reds that read as ordinary tree reds.
  // Inert unless GR_CAPTURE_EXTERNAL_SERVER=1, so lanes and ordinary runs pay nothing.
  globalSetup: './scripts/external-server-guard.mjs',
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
