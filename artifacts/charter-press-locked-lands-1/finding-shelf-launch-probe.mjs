#!/usr/bin/env node
// charter-press-locked-lands-1, FINDING probe (outside the slice's scope, measured and NOT fixed): does the FULL
// PRESS shelf's "Launch" honour a stamped charter whose contract is locked? The editor opens any board contract
// under `?editor`, the stamp checks the charter and not the unlock, and the shelf's Launch stages the same launch
// the Lever does; the boot's `reverifyStagedContractLaunch` then decides. One fresh profile, desktop viewport.
//
// Usage: node artifacts/charter-press-locked-lands-1/finding-shelf-launch-probe.mjs <baseURL> <label>
// Writes artifacts/charter-press-locked-lands-1/<label>/finding-shelf-launch.json
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from '@playwright/test';

const [baseURL, label] = process.argv.slice(2);
if (!baseURL || !label) {
  process.stderr.write('usage: finding-shelf-launch-probe.mjs <baseURL> <label>\n');
  process.exit(2);
}
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), label);
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const context = await browser.newContext({ ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, baseURL });
const page = await context.newPage();
const errors = { console: [], page: [] };
page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text().slice(0, 300)));
page.on('pageerror', (error) => errors.page.push(String(error.message).slice(0, 300)));
const row = { label, baseURL, startedAt: new Date().toISOString(), loadavg: os.loadavg() };
try {
  await page.goto('/?editor&debug&contract=e1-twin-banks&nowaves&nolevel&nokill&nopause&seed=cpl1-shelf');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 60_000 });
  await page.getByTestId('press-full-mode').waitFor({ state: 'visible', timeout: 30_000 });
  row.editorContract = (await page.getByTestId('editor-contract-name').textContent())?.trim() ?? null;
  await page.getByTestId('press-stamp').click();
  row.stampStatus = (await page.getByTestId('press-status').textContent())?.trim() ?? null;
  await page.getByTestId('press-launch-0').click();
  await page.waitForURL((url) => !url.searchParams.has('editor'), { timeout: 60_000 });
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 60_000 });
  await page.getByTestId('contract-briefing-name').waitFor({ state: 'visible', timeout: 30_000 });
  row.opened = {
    urlContract: new URL(page.url()).searchParams.get('contract'),
    activeId: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId ?? null),
    fallbackReason: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.fallbackReason ?? null),
    stagedLaunchClear: await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.stagedLaunchClear ?? null),
    briefingName: (await page.getByTestId('contract-briefing-name').textContent())?.trim() ?? null,
  };
} catch (error) {
  row.probeError = String(error instanceof Error ? error.message : error).split('\n')[0].slice(0, 300);
}
row.errors = errors;
row.finishedAt = new Date().toISOString();
await browser.close();
await writeFile(path.join(OUT, 'finding-shelf-launch.json'), `${JSON.stringify(row, null, 2)}\n`);
process.stdout.write(`${label} shelf launch of a stamped e1-twin-banks charter on a fresh profile: ${JSON.stringify(row.opened ?? row.probeError)} errors ${errors.console.length}/${errors.page.length}\n`);
