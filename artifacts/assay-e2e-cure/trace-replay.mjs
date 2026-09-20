#!/usr/bin/env node

/**
 * F-ASSAY-E2E-3 INSTRUMENT — the same boot `scripts/assay-replay.mjs` performs, but stepped a
 * second at a time with the run, the agent and the standing-order log sampled after each second.
 * Evidence only: it never writes a verdict and never touches src/.
 *
 * Usage: node artifacts/assay-e2e-20260822/trace-replay.mjs <tape.json> [seconds]
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const inputPath = process.argv[2];
const seconds = Number(process.argv[3] ?? 40);
const port = Number(process.env.GR_ASSAY_REPLAY_PORT ?? 5272);

let vite;
let browser;
try {
  const tape = JSON.parse(await readFile(path.resolve(inputPath), 'utf8'));
  vite = await createServer({ root, logLevel: 'silent', server: { host: '127.0.0.1', port, strictPort: true } });
  await vite.listen();
  browser = await chromium.launch({ headless: true, channel: 'chromium' });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  await page.addInitScript((reel) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(reel)), tape);

  const query = new URLSearchParams({
    debug: '', assayReplay: '', replay: tape.id, contract: tape.contract, seed: tape.seed, difficulty: tape.difficulty,
  });
  await page.goto(`http://127.0.0.1:${port}/?${query}`, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForFunction(() => Boolean(window.__GR_TEST__), undefined, { timeout: 60_000 });

  const boot = await page.evaluate(async () => {
    const orders = await import('/src/agent/StandingOrders.ts');
    window.__TRACE_ORDERS__ = orders;
    const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
    return {
      diagnosticsKeys: Object.keys(diagnostics ?? {}),
      agentUi: diagnostics?.ui?.agent ?? null,
      snapshot: orders.snapshotStandingOrders(),
      run: diagnostics?.run ?? null,
      hp: diagnostics?.hp ?? null,
    };
  });
  process.stdout.write(`${JSON.stringify({ event: 'boot', ...boot }, null, 2)}\n`);

  await page.evaluate(() => window.__GR_TEST__.setManualSim(true));
  for (let second = 1; second <= seconds; second += 1) {
    const sample = await page.evaluate(() => {
      window.__GR_TEST__.advanceSim(1);
      const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
      const view = window.__TRACE_ORDERS__.snapshotStandingOrders();
      const show = document.querySelector('[data-testid="lantern-show"]');
      return {
        timeAlive: Math.round((diagnostics?.timeAlive ?? 0) * 100) / 100,
        state: diagnostics?.state ?? diagnostics?.run?.state ?? null,
        hp: diagnostics?.hp ?? null,
        wave: diagnostics?.wave ?? null,
        gold: diagnostics?.economy?.summary?.panned ?? null,
        secured: diagnostics?.run?.secured ?? null,
        orders: view.orders.map((record) => `${record.order.verb}:${record.status}${record.reason ? `(${record.reason})` : ''}`),
        logTypes: view.log.reduce((counts, event) => ({ ...counts, [event.type]: (counts[event.type] ?? 0) + 1 }), {}),
        replaced: view.log.filter((event) => event.type === 'orders_replaced').length,
        tick: show ? Number(show.getAttribute('data-tick')) : null,
        playback: show?.getAttribute('data-playback') ?? null,
        agentLevel: diagnostics?.ui?.agent?.permissionLevel ?? null,
      };
    });
    process.stdout.write(`${JSON.stringify({ second, ...sample })}\n`);
  }
  if (errors.length) process.stderr.write(`${errors.join('\n')}\n`);
} catch (error) {
  process.stderr.write(`trace failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await vite?.close();
}
