/**
 * hero-move-verb: the plain-boot evidence. No `?debug`, no query flags beyond the contract and
 * seed, both viewports, and every console/page error captured. This slice's player-visible surface
 * is a NEGATIVE one (the browser refuses MOVE_HERO), so what has to be shown is that the ordinary
 * game boots and plays exactly as before.
 */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.GR_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5304';
const VIEWPORTS = [
  { name: 'desktop-chrome', width: 1280, height: 800 },
  { name: 'mobile-chrome', width: 390, height: 844 },
];
mkdirSync('artifacts/hero-move-verb/shots', { recursive: true });

const report = [];
const browser = await chromium.launch();
for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  await page.goto(`${BASE}/?contract=the-claim&seed=hero-move-verb`, { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `artifacts/hero-move-verb/shots/${viewport.name}-plain-boot.png`, scale: 'css' });
  const known = errors.filter((line) => line.includes("GLTFLoader: Couldn't load texture blob:"));
  report.push({ viewport: viewport.name, errors: errors.filter((line) => !known.includes(line)), knownSuppressed: known.length });
  await context.close();
}
await browser.close();
writeFileSync('artifacts/hero-move-verb/shots/boot-report.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
