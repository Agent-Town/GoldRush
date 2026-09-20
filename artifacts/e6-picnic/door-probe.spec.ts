import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * THE PICNIC DOOR PROBE — where the PLAYER sees this, in a plain boot (Mistake #10).
 *
 * ⚠️ THIS FILE ONCE ASSERTED THE OPPOSITE, AND THAT IS THE POINT. Before the owner's "flip the
 * stakes" ruling of 2026-08-22 the slice STOPPED on Law 2, the anchors were reverted, and this
 * probe pinned the refusal: `?contract=e6-picnic` fell back to The Claim with
 * `fallbackReason: 'unavailable-contract'` (`ContractFamilies.ts:1336`, empty `harvestAnchors`).
 * The ruling landed the anchors, so the same probe now pins the admission. Both versions are in
 * this file's git history; neither was a guess.
 *
 * It asserts the RESOLVED contract id rather than merely booting, because a bare `?contract=<id>`
 * falls back silently and a probe that does not read `contract.activeId` passes while exercising
 * nothing — the exact trap `_s2080-f1742-1-boot-probe.spec.ts:13` records.
 */

test('plain boot is clean and opens The Claim (no ?debug)', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/?nowaves&nolevel&seed=e6-picnic-door-probe');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24, null, { timeout: 15000 });

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('the-claim');
  mkdirSync('artifacts/e6-picnic/shots', { recursive: true });
  await page.screenshot({ path: `artifacts/e6-picnic/shots/${testInfo.project.name}-plain.png` });
  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('the picnic is ADMITTED: a direct claim resolves and the meadow builds clean', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/?debug&contract=e6-picnic&nowaves&nolevel&seed=e6-picnic-door-probe');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24, null, { timeout: 15000 });

  const contract = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  expect(contract?.activeId).toBe('e6-picnic');
  expect(contract?.fallbackReason ?? null).toBeNull();
  mkdirSync('artifacts/e6-picnic/shots', { recursive: true });
  await page.screenshot({ path: `artifacts/e6-picnic/shots/${testInfo.project.name}-picnic-admitted.png` });
  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
