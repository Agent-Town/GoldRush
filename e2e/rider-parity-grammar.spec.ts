import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// rider-parity-grammar (ADR-005, owner 2026-09-07) — the BROWSER half of the slice.
//
// Stages 1 and 2 are GR-SIM changes: the nine action reach tests move onto the hero, and
// `REPAIR_UNDER` gains the human sweep's radius. Neither adds a player-facing surface, so the duty
// this file discharges for them is Mistake #10's other half — proving the browser still boots
// clean in ORDINARY PLAY, with no `?debug`, on both viewports, after a slice that touched the
// shared `StandingOrders` executor the browser's own singleton door installs.
//
// The browser rules stage 1 copied FROM are pinned in source by `scripts/rider-parity-reach.test.mjs`
// and behaviourally by `scripts/hero-move-verb.test.mjs` (the solo door's HERO_NOT_YOURS refusal),
// so this file does not restate them through a bridge a plain boot cannot reach.
const SHOTS = 'reviews/shots-rider-parity-grammar';

test('plain boot is clean on both viewports (no ?debug)', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/?nowaves&nolevel&seed=rider-parity-grammar');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24, null, { timeout: 20000 });

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('the-claim');
  // The debug bridge must NOT be installed in a plain boot — the whole human-surface measurement
  // in `docs/bench/rider-parity-audit.md` §1 rests on that gate being real.
  expect(await page.evaluate(() => typeof (window as unknown as { __GR_TEST__?: unknown }).__GR_TEST__)).toBe('undefined');

  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/plain-boot-${testInfo.project.name}.png` });
  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

// ADR-005 STAGE 4 — the E5 deck and anchor, in a PLAIN BOOT.
//
// `BOAT_BUILD` and `REANCHOR` were `agent-only` for the plainest possible reason: their only browser
// levers were `__GR_TEST__.placeBoatBuilding` and `__GR_TEST__.reanchorClaimBoat`, and that bridge
// is installed only under `?debug`. A human could not build on the deck or move the anchor at all.
// ADR-005 clause 2's remedy for a thin human surface is to thicken it, so the player gained the
// controls; these tests are Mistake #10's question asked properly — "where does the PLAYER see this,
// in a plain boot?" — and answered with no `?debug` anywhere in the URL.
//
// The route in is the PLAYER'S OWN, staged the way the board stages it (the recipe
// `e2e/e7-relay-rush-front.spec.ts:232-243` documents): a launch key, the active epoch, and a
// profile that clears the lock. Epoch 5 is `locked: true` behind `scienceThreshold: 14`, so a bare
// `?contract=` would fall back to The Claim and the test would be vacuous.
const E5_QUERY = '/?contract=e5-deepwater-claim&nowaves&nolevel&seed=rider-parity-deck';

async function openDeepwaterClaim(page: import('@playwright/test').Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.addInitScript(() => {
    sessionStorage.setItem('gr.contract.launch.v1', 'e5-deepwater-claim');
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-5-deepwater');
    localStorage.setItem('gr.scores.v2', JSON.stringify([
      { waves: 20, kills: 1, gold: 1, timeAlive: 1, at: 1, secured: true, contractId: 'e4-dust-flats' },
      { waves: 20, kills: 1, gold: 1, timeAlive: 1, at: 1, secured: true, contractId: 'e4-long-road' },
    ]));
    localStorage.setItem('gr.profile.v2.default.tracks',
      JSON.stringify({ version: 1, tracks: { territory: 40, science: 40, hero: 40, agent: 3 } }));
  });
  await page.goto(E5_QUERY);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24, null, { timeout: 30000 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e5-deepwater-claim');
  // The whole point: no bridge. If this ever fails the tests below stop being about the human.
  expect(await page.evaluate(() => typeof (window as unknown as { __GR_TEST__?: unknown }).__GR_TEST__)).toBe('undefined');
  return errors;
}

const boat = (page: import('@playwright/test').Page) => page.evaluate(() => {
  const claim = window.__THREE_GAME_DIAGNOSTICS__?.deepwaterClaim ?? null;
  return claim ? { anchor: claim.boat.anchor.id, buildings: claim.boat.buildings.map((b) => `${b.padId}:${b.buildingId}`) } : null;
});

test('a plain-boot human can build on the Claim-Boat deck (BOAT_BUILD parity)', async ({ page }, testInfo) => {
  const errors = await openDeepwaterClaim(page);

  // The hero spawns ON the boat, at the lagoon anchor, 3.0 wu from the bow pad — inside the
  // decision reach — so the prompt is offered in ordinary play from the first frame, with no build
  // mode and nothing to open.
  const prompt = page.getByTestId('building-context-prompt');
  await expect(prompt).toBeVisible({ timeout: 15000 });
  const buildButton = page.getByTestId('deck-build');
  await expect(buildButton).toBeVisible();

  const before = await boat(page);
  expect(before?.buildings).toEqual([]);

  // THE BUTTON, which is what a touch player presses.
  await buildButton.click();
  await expect.poll(async () => (await boat(page))?.buildings.length ?? 0, { timeout: 10000 }).toBeGreaterThan(0);
  const afterClick = await boat(page);

  // THE KEY, which is what a keyboard player presses — the same confirm key every other world
  // interaction uses. A second pad is still in reach, so this lands a second work.
  await page.keyboard.press('Space');
  await expect.poll(async () => (await boat(page))?.buildings.length ?? 0, { timeout: 10000 })
    .toBeGreaterThan(afterClick!.buildings.length);

  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/deck-build-${testInfo.project.name}.png` });
  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

test('a plain-boot human can weigh anchor from the same prompt (REANCHOR parity)', async ({ page }, testInfo) => {
  const errors = await openDeepwaterClaim(page);
  await expect(page.getByTestId('building-context-prompt')).toBeVisible({ timeout: 15000 });

  const before = await boat(page);
  expect(before?.anchor).toBe('lagoon');

  // The anchor LIST: one button per anchor the boat is not at, each naming its own id.
  const anchorButton = page.getByTestId('deck-anchor-open-water');
  await expect(anchorButton).toBeVisible();
  await anchorButton.click();
  await expect.poll(async () => (await boat(page))?.anchor, { timeout: 10000 }).toBe('open-water');

  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/deck-anchor-${testInfo.project.name}.png` });
  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
