#!/usr/bin/env node
// s1150 — measures the confirmBuild placement flake rate for the m2-04 five-palisade line,
// as a function of the boot `timescale`. Written because the F-1148-1 trajectory probe
// (scripts/probe-f1148-1-trajectory.mjs) was blocked twice by `confirmBuild failed: palisade@…`
// while e2e/m2-04-gold-stealing.spec.ts places the SAME five palisades reliably. The two differ
// in exactly one boot parameter: the spec uses timescale=10, the probe hardcodes timescale=1.
//
// This measures PLACEMENT ONLY — it never spawns a thief and reports no trajectory. A run is a
// PASS only if all six placements (5 palisades + stockpile) return true; the first false is
// recorded with its coordinate, which is the discriminating datum.
//
// Usage: node scripts/probe-s1150-confirmbuild-rate.mjs <base-url> <runs-per-arm> [timescales csv]

import { chromium, devices } from '@playwright/test';

const baseURL = process.argv[2] ?? 'http://127.0.0.1:5241';
const perArm = Number(process.argv[3] ?? 5);
const timescales = (process.argv[4] ?? '1,10').split(',').map(Number);
// 4th arg 'device' spreads devices['Desktop Chrome'] into the context the way playwright.config.ts
// does for the desktop-chrome project (deviceScaleFactor / userAgent / hasTouch / isMobile), which
// a bare browser.newContext({viewport}) does NOT set. This is the discriminating arm for F-1150-1.
const useDevice = (process.argv[5] ?? '') === 'device';

if (!Number.isInteger(perArm) || perArm < 1) throw new Error('runs-per-arm must be a positive integer');

const browser = await chromium.launch({ channel: 'chromium' });
const results = [];

try {
  for (const timescale of timescales) {
    for (let run = 1; run <= perArm; run += 1) {
      const context = await browser.newContext(
        useDevice
          ? { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }
          : { viewport: { width: 1280, height: 800 } },
      );
      const page = await context.newPage();
      await page.addInitScript(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.goto(`${baseURL}/?debug&timescale=${timescale}&nowaves&nokill&nolevel&seed=m2-04-walls`);
      await page.waitForSelector('#game-canvas');
      await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

      // Byte-for-byte the same three steps as m2-04's placeBuildableAt helper and the
      // F-1148-1 probe's place(): teleport to (x, z+2), select, confirm.
      const place = async (id, x, z) => {
        await page.evaluate(([nx, nz]) => window.__GR_TEST__?.teleport(nx, nz + 2), [x, z]);
        await page.evaluate((nid) => window.__GR_TEST__?.selectBuildable(nid), id);
        return Boolean(await page.evaluate(() => window.__GR_TEST__?.confirmBuild()));
      };

      await page.evaluate(() => window.__GR_TEST__?.setBalance('palisade.cost', 0));
      await page.evaluate(() => window.__GR_TEST__?.setBalance('stockpile.cost', 0));

      let failedAt = null;
      let placed = 0;
      for (const x of [-2, -1, 0, 1, 2]) {
        if (await place('palisade', x, 9)) placed += 1;
        else {
          failedAt = `palisade@${x},9`;
          break;
        }
      }
      if (!failedAt) {
        if (await place('stockpile', 0, 13)) placed += 1;
        else failedAt = 'stockpile@0,13';
      }

      results.push({ timescale, run, placed, failedAt, ok: failedAt === null });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

// Positive control: if NO arm ever placed a single buildable, the rig itself is broken and the
// zeros mean nothing. A probe that executes nothing reports a clean-looking zero.
const anyPlacement = results.some((r) => r.placed > 0);

const byArm = timescales.map((timescale) => {
  const arm = results.filter((r) => r.timescale === timescale);
  return {
    timescale,
    runs: arm.length,
    passed: arm.filter((r) => r.ok).length,
    failed: arm.filter((r) => !r.ok).length,
    failures: arm.filter((r) => !r.ok).map((r) => `run${r.run}:${r.failedAt}(placed ${r.placed}/6)`),
  };
});

console.log(JSON.stringify({ baseURL, perArm, useDevice, positiveControl: { anyPlacement }, byArm }, null, 2));
if (!anyPlacement) process.exitCode = 2;
