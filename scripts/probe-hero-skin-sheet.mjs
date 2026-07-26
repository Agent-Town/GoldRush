#!/usr/bin/env node
/**
 * probe-hero-skin-sheet.mjs — s1082 (art-batch-tailor-extras drain evidence)
 *
 * WHY THIS EXISTS: `e2e/tailor-wagon.spec.ts:36` asserts
 *   data-hero-skin-sheet  toMatch(/^(claim-day|stock)$/)
 * i.e. it accepts EITHER value, because the wagon shipped before its art did.
 * That is correct for the wagon slice but means the suite is structurally blind
 * to whether the claim-day cells actually resolve — a green there proves nothing
 * about an art extraction (F-1080-B: a test that would pass either way is not a
 * control). This probe asks the one question the suite cannot:
 *
 *   with claim-day equipped on a YOUNG heroine, does the runtime resolve the
 *   SKIN sheet, or silently fall back to stock?
 *
 * Usage: node scripts/probe-hero-skin-sheet.mjs [baseURL]
 * Exits 0 and prints the resolved value; the CALLER decides what is expected,
 * so the same probe serves both the live run and the reverted mutation control.
 */
import { chromium } from '@playwright/test';

const baseURL = process.argv[2] ?? 'http://127.0.0.1:5241';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => pageErrors.push(String(e)));

// Seed a young heroine with claim-day owned AND equipped, before any app code runs.
await page.addInitScript(() => {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem('gr.profile.v2', JSON.stringify({
    version: 2,
    activeId: 'robin',
    profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  }));
  // The wagon made wardrobe choices PROFILE-SCOPED (HERO_SKIN_STORAGE_KEY is in
  // PROFILE_DATA_KEYS), so the live key is `gr.profile.v2.<id>.<logicalKey>`.
  // Seed both the bare and the namespaced form so the probe does not depend on
  // which layer resolves it.
  const seed = (k, v) => {
    localStorage.setItem(k, v);
    localStorage.setItem(`gr.profile.v2.robin.${k}`, v);
  };
  seed('gr.hero.skins-owned.v1', JSON.stringify(['claim-day']));
  seed('gr.hero.skin.v1', 'claim-day');
});

// era=1 keeps the heroine YOUNG, which is the only age the claim-day art covers.
await page.goto(`${baseURL}/?debug&era=1&contract=the-claim&nowaves&nolevel&nopause&seed=s1082-skin-probe`);
await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10, null, { timeout: 30_000 });

// Sheet resolution is ASYNC (walkSheetLoads awaits an image decode), so the
// attributes appear well after the first frames — reading them eagerly returns
// null and looks like "no skin". The wagon spec polls for exactly this reason.
await page
  .waitForFunction(
    () => document.querySelector('#game-canvas')?.getAttribute('data-hero-skin-sheet') !== null,
    null,
    { timeout: 20_000 },
  )
  .catch(() => {});

const canvas = page.locator('#game-canvas');
const result = {
  heroAgeSheet: await canvas.getAttribute('data-hero-sheet'),
  heroSkin: await canvas.getAttribute('data-hero-skin'),
  heroSkinSheet: await canvas.getAttribute('data-hero-skin-sheet'),
  consoleErrors,
  pageErrors,
};

console.log(JSON.stringify(result, null, 2));
await browser.close();
