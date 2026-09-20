#!/usr/bin/env node

/**
 * CROSS-ENGINE TICK-0 CENSUS (evidence only). Boots the browser door on the same
 * contract+seed the probe played and prints the harvest nodes the agent's runtime state
 * would see, so the browser's tick-0 world can be compared with gr-sim's first view.
 *
 * Usage: node artifacts/assay-e2e-20260822/probe-seams.mjs [contract] [seed]
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contract = process.argv[2] ?? 'the-claim';
const seed = process.argv[3] ?? 'e1-the-claim-01';
const port = Number(process.env.GR_ASSAY_REPLAY_PORT ?? 5273);

let vite;
let browser;
try {
  vite = await createServer({ root, logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true } });
  await vite.listen();
  browser = await chromium.launch({ headless: true, channel: 'chromium' });
  const page = await browser.newPage();
  const query = new URLSearchParams({ debug: '', contract, seed, difficulty: 'trail' });
  await page.goto(`http://127.0.0.1:${port}/?${query}`, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForFunction(() => Boolean(window.__GR_TEST__), undefined, { timeout: 60_000 });
  const census = await page.evaluate(() => {
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    return {
      timeAlive: diagnostics.timeAlive,
      harvest: diagnostics.harvest,
      enemyHp: diagnostics.balance?.enemyHp ?? null,
      pickSeconds: diagnostics.balance?.offerPickSeconds ?? null,
      difficultyPreset: diagnostics.difficultyPreset,
      heroPos: diagnostics.heroPos,
    };
  });
  process.stdout.write(`${JSON.stringify(census, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`probe failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await vite?.close();
}
