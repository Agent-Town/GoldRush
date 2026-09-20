#!/usr/bin/env node
// s1450 drain instrument — the plain-boot probe (Mistake #10: "where does the PLAYER see this,
// in a plain boot?"). No ?debug. Boots the merged tree at desktop and 390px, and on Twin Banks
// (the map this slice actually changes), asserting zero console and zero page errors at each.
//
// Usage: node artifacts/f1448-1/plain-boot-probe.mjs [baseURL]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:5188';
const OUT = 'reviews/shots-f1448-1';
mkdirSync(OUT, { recursive: true });

const VIEWS = [
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
];
// A plain boot AND the map the slice edits — a green on the menu alone would prove nothing
// about Enemy.ts, whose module init is the thing f1448-1 cured.
const ROUTES = [
  { name: 'plain', url: '/' },
  { name: 'twin-banks', url: '/?contract=e1-twin-banks' },
];

const browser = await chromium.launch();
let bad = 0;
for (const v of VIEWS) {
  for (const r of ROUTES) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height } });
    const page = await ctx.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    await page.goto(BASE + r.url, { waitUntil: 'load' });
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `${OUT}/s1450-${v.name}-${r.name}.png` });
    const n = consoleErrors.length + pageErrors.length;
    bad += n;
    console.log(`${v.name.padEnd(12)} ${r.name.padEnd(11)} consoleErrors=${consoleErrors.length} pageErrors=${pageErrors.length}`);
    for (const e of [...consoleErrors, ...pageErrors]) console.log('    ! ' + e.slice(0, 200));
    await ctx.close();
  }
}
await browser.close();
console.log(bad === 0 ? 'PLAIN BOOT CLEAN — 0 errors across 4 boots' : `PLAIN BOOT DIRTY — ${bad} errors`);
process.exit(bad === 0 ? 0 : 1);
