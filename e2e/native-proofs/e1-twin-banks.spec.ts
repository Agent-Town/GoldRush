import { test, type Page } from '@playwright/test';
import { nativeProof } from './driver';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
// Opt-in read-only excursion diagnosis; no game state or input changes.
if (process.env.GR_NATIVE_RUN === '10' && process.env.GR_NATIVE_PROOF && process.env.GR_NATIVE_DIAG === '1') {
  const terminals = new WeakMap<Page, unknown>();
  test.beforeEach(async ({ page }) => {
    await page.exposeFunction('__nativeDiagnosticTerminal', (capture: unknown) => terminals.set(page, capture));
    await page.addInitScript(() => {
      let terminalSaved = false;
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
        capture.samples.push(structuredClone({ t: d.timeAlive, wave: d.wave, hp: d.hp, gold: d.economy.gold,
          hero: d.heroPos, alive: d.enemiesAlive, defences: d.build.hp, repairs: d.wreck.repairs,
          progression: d.progression, runState: d.runState, nodes: d.harvest.activeNodes, channeling: d.harvest.channeling, kills: d.kills,
          enemies: window.__GR_TEST__?.enemyPositions?.() ?? null }));
        if (!terminalSaved && (d.runState === 'dead' || d.run?.secured)) {
          terminalSaved = true;
          void (window as unknown as { __nativeDiagnosticTerminal: (value: unknown) => Promise<void> }).__nativeDiagnosticTerminal(capture);
        }
      }, 200);
    });
  });
  test.afterEach(async ({ page }, info) => {
    const root = path.resolve(`artifacts/sol/play-proofs/run-${process.env.GR_NATIVE_RUN ?? 8}/e1-twin-banks`);
    await mkdir(root, { recursive: true });
    const capture = terminals.get(page) ?? await page.evaluate(() => (window as unknown as { __NATIVE_DIAG__?: unknown }).__NATIVE_DIAG__);
    await writeFile(path.join(root, `diagnostic-${info.project.name}.json`), JSON.stringify(capture, null, 2) + '\n');
  });
}
test.skip(!process.env.GR_NATIVE_PROOF, 'full native objective run — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off' });
nativeProof('e1-twin-banks');

if (['9', '10'].includes(process.env.GR_NATIVE_RUN ?? '') && process.env.GR_NATIVE_PROOF) {
  test.afterEach(async ({ page }, info) => {
    if (info.status !== 'passed') return;
    const root = path.resolve(`artifacts/sol/play-proofs/run-${process.env.GR_NATIVE_RUN}/e1-twin-banks`);
    await mkdir(root, { recursive: true });
    const tab = page.locator('[data-testid^="contract-chapter-tab-epoch-1-"]');
    await tab.click();
    const cell = page.getByTestId('contract-best-e1-twin-banks');
    await cell.scrollIntoViewIfNeeded();
    await cell.screenshot({ path: path.join(root, `bank-cell-${info.project.name}.png`) });
    await page.screenshot({ path: path.join(root, `bank-book-${info.project.name}.png`) });
    await writeFile(path.join(root, `bank-cell-${info.project.name}.json`), JSON.stringify({ text: await cell.innerText(), url: page.url(), originalContext: true }, null, 2) + '\n');
  });
}
