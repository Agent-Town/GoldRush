#!/usr/bin/env node

/**
 * WHY THIS PROBE EXISTS. The first both-projects run of `e2e/e6-picnic-opening.spec.ts` was green on
 * desktop and red on mobile-chrome with "element is not visible" on the palisade tile, and the
 * cheapest wrong conclusion available was "the build menu does not fit 390px". It does: measured
 * here, the menu opens to 346x316 at (22,278) in an 390x844 viewport and the palisade tile is a real
 * 169x76 button. The tile was invisible for a different reason - a level-up hides the whole HUD until
 * a card is taken - and the spec now clears level-ups while it waits (see `fence()`). Kept because the
 * measurement is what ruled the layout out.
 *
 * Usage: start a dev server on 5307, then `node artifacts/e6-picnic/probe-mobile-menu.mjs`.
 */
import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
const context = await browser.newContext({ ...devices['Pixel 5'], viewport: { width: 390, height: 844 } });
const page = await context.newPage();
await page.goto('http://127.0.0.1:5307/?contract=e6-picnic&seed=probe');
await page.waitForTimeout(3000);
const dump = async (label) => {
  const info = await page.evaluate(() => {
    const trigger = document.querySelector('[data-testid="hud-build"]');
    const menu = document.querySelector('[data-testid="hud-build-menu"]');
    const tile = document.querySelector('[data-testid="hud-build-tile-palisade"]');
    const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    return {
      trigger: rect(trigger), triggerDisabled: trigger?.disabled ?? null,
      menuHidden: menu?.hidden ?? null, menu: rect(menu),
      tiles: [...document.querySelectorAll('[data-testid^="hud-build-tile-"]')].map((el) => ({ id: el.getAttribute('data-testid'), disabled: el.disabled, rect: rect(el) })),
      gold: window.__THREE_GAME_DIAGNOSTICS__?.economy?.gold,
      viewport: { w: innerWidth, h: innerHeight },
    };
  });
  console.log(label, JSON.stringify(info, null, 1));
};
await page.getByTestId('contract-briefing-dismiss').click({ timeout: 8000 }).catch(() => {});
await dump('BEFORE-BUILD-CLICK');
await page.getByTestId('hud-build').click({ timeout: 5000 }).catch((e) => console.log('trigger click failed', e.message));
await page.waitForTimeout(500);
await dump('AFTER-BUILD-CLICK');
await browser.close();
