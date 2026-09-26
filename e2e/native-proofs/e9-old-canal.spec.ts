import { test } from '@playwright/test';
import { nativeProof } from './driver';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Read-only run-8 diagnosis: retain state and actual inputs without changing play.
if (process.env.GR_NATIVE_DIAG === '1') {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const capture = { samples: [] as unknown[], orders: [] as unknown[] };
      Object.assign(window, { __NATIVE_DIAG__: capture });
      const order = (event: Event) => {
        const d = window.__THREE_GAME_DIAGNOSTICS__;
        if (!d) return;
        capture.orders.push({ t: d.timeAlive, type: event.type,
          key: event instanceof KeyboardEvent ? event.code : undefined,
          target: event.target instanceof Element ? event.target.closest('[data-testid]')?.getAttribute('data-testid') : undefined });
      };
      for (const name of ['keydown', 'keyup', 'click']) document.addEventListener(name, order, true);
      setInterval(() => {
        const d = window.__THREE_GAME_DIAGNOSTICS__;
        if (!d) return;
        capture.samples.push({ t: d.timeAlive, wave: d.wave, hp: d.hp, gold: d.economy.gold,
          hero: d.heroPos, alive: d.enemiesAlive, defences: d.build.hp, repairs: d.wreck.repairs,
          progression: d.progression, runState: d.runState,
          enemies: window.__GR_TEST__?.enemyPositions?.() ?? null });
      }, 200);
    });
  });
  test.afterEach(async ({ page }, info) => {
    const root = path.resolve(`artifacts/sol/play-proofs/run-${process.env.GR_NATIVE_RUN ?? 8}/e9-old-canal`);
    await mkdir(root, { recursive: true });
    const capture = await page.evaluate(() => (window as unknown as { __NATIVE_DIAG__?: unknown }).__NATIVE_DIAG__);
    await writeFile(path.join(root, `diagnostic-${info.project.name}.json`), JSON.stringify(capture, null, 2) + '\n');
  });
}
test.skip(!process.env.GR_NATIVE_PROOF, 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off' });
nativeProof('e9-old-canal', 6);
