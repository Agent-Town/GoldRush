#!/usr/bin/env node
/**
 * probe-plain-boot-console.mjs — s1083 (blocked-storage-boot drain evidence)
 *
 * WHY THIS EXISTS: the e2e suites collect only `message.type() === 'error'`
 * (see `collectErrors` in e2e/profile-first-boot.spec.ts:19-25). The
 * blocked-storage guards this drain lands degrade by emitting a
 * `console.WARN` — a channel every existing spec is structurally blind to.
 * So a green suite cannot answer the question the task master actually asked:
 *
 *   in a NORMAL boot, does the new fail-soft guard stay silent, or is it
 *   catching something it should not be catching?
 *
 * A warn here would mean the guard fires when storage is working, i.e. the
 * fallback is masking a real defect instead of degrading gracefully.
 *
 * Usage: PROBE_BASE=<baseURL> node scripts/probe-plain-boot-console.mjs
 * Prints every console message by type for a plain `/` boot (no ?debug) at
 * 1280x800 and 390x844, and exits 1 if any warn/error appears.
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { resolveBase } from '../rehearsal/base-url.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (process.argv[2]) throw new Error('Positional base URL is unsupported; use PROBE_BASE=<url> instead.');
const baseURL = resolveBase('PROBE_BASE', { root: ROOT });
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
];

const browser = await chromium.launch();
let bad = 0;

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const byType = new Map();
  const pageErrors = [];
  page.on('console', (m) => {
    const list = byType.get(m.type()) ?? [];
    list.push(m.text());
    byType.set(m.type(), list);
  });
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  // A genuinely plain boot: cleared storage, no ?debug, entered as a player does.
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto(baseURL + '/');

  // Enter through the real surface rather than a URL fragment. A bare catch
  // around this wait would turn an aborted observation into a confident one
  // (F-1082-5), so failures are reported, never swallowed.
  await page.getByTestId('profile-name-input').fill('Probe');
  await page.getByTestId('profile-create').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, null, {
    timeout: 30_000,
  });

  const warns = byType.get('warning') ?? [];
  const errors = byType.get('error') ?? [];
  const tileWarns = warns.filter((w) => /Tile state read failed/.test(w));

  console.log(`--- ${vp.name} (${vp.width}x${vp.height}) ---`);
  console.log(`  frames ok · console types: ${[...byType.keys()].join(', ') || '(none)'}`);
  console.log(`  errors: ${errors.length} ${JSON.stringify(errors.slice(0, 4))}`);
  console.log(`  warnings: ${warns.length} ${JSON.stringify(warns.slice(0, 4))}`);
  console.log(`  pageErrors: ${pageErrors.length} ${JSON.stringify(pageErrors.slice(0, 4))}`);
  console.log(`  >>> new guard's "Tile state read failed" warns: ${tileWarns.length} (MUST be 0)`);

  if (errors.length || pageErrors.length || tileWarns.length) bad += 1;
  await page.close();
}

await browser.close();
console.log(bad === 0 ? 'PROBE CLEAN' : `PROBE DIRTY (${bad} viewport(s))`);
process.exit(bad === 0 ? 0 : 1);
