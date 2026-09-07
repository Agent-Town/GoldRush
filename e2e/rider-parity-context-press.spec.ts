import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

/**
 * ADR-005 STAGE 3 ITEM 8 — THE CONFIRM KEY'S LAST FOUR PLACES, IN A PLAIN BOOT.
 *
 * Owner ruling 2026-09-07, verbatim: "no, AI and human users have to have the same options and
 * tools, otherwise it is unfair. fairness is crucial."
 *
 * The controls table's last human-richer row was `CONTEXT_ACTION`: the same confirm key that
 * upgrades a work ALSO reached the drill yard's stations, the assay office's bench, the E10
 * Static's kept meanings and the Old Digger's deck, and no verb named any of them. Four
 * `CONTEXT_ACTION` actions do now (`drill`, `assay`, `preserve`, `digger`), each bound to the SAME
 * call `Game.confirmAction` makes and reaching from the acting body's own position.
 *
 * WHAT THIS FILE PROVES, and what it does not. It is a PLAIN BOOT — no `?debug`, so no
 * `__GR_TEST__` bridge (Mistake #10's question asked properly). It proves the HUMAN half end to
 * end: the player walks to the drill yard's faucet, presses the confirm key, and the yard's own
 * counter moves. It also proves the rider's MENU is fed by the same numbers the player's world is:
 * `now.contextPress` is derived in `src/agent/View.ts` from `drillYard`, `e10Static`,
 * `oldDiggerBoss` and `assayBenchInReach`, and this asserts those diagnostics carry what the
 * derivation reads. The rider's own press cannot be driven from a plain boot at all — it arrives
 * over the lockstep wire and needs a room and a relay — so the SEAM is held by
 * `scripts/rider-parity-context-press.test.mjs`, which pins that the rider's four branches call
 * the same four methods the key calls, from the rider's own body, and BITES when one is re-pointed.
 */

const SHOTS = 'reviews/shots-rider-parity-context-press';
const QUERY = '/?contract=e1-drill-yard&nowaves&nolevel&seed=rider-parity-context-press';

type Yard = {
  faucet: { x: number; z: number; grants: number; lastAmount: number };
  bell: { x: number; z: number; rings: number };
} | null;

const yard = (page: import('@playwright/test').Page) => page.evaluate(
  () => (window.__THREE_GAME_DIAGNOSTICS__?.drillYard ?? null) as Yard,
);

async function openDrillYard(page: import('@playwright/test').Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  await page.addInitScript(() => {
    sessionStorage.setItem('gr.contract.launch.v1', 'e1-drill-yard');
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-1-frontier');
  });
  await page.goto(QUERY);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24, null, { timeout: 30000 });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e1-drill-yard');
  // The whole point: no bridge. If this ever fails the test stops being about the human.
  expect(await page.evaluate(() => typeof (window as unknown as { __GR_TEST__?: unknown }).__GR_TEST__)).toBe('undefined');
  return errors;
}

test('a plain-boot human works the drill yard with the confirm key, and the rider reads the same yard', async ({ page }, testInfo) => {
  const errors = await openDrillYard(page);

  const before = await yard(page);
  expect(before, 'the practice contract must compose a drill yard').not.toBeNull();
  // THE MENU THE RIDER READS. `now.contextPress.drill` is derived from exactly these two rows
  // (`src/agent/View.ts`), so a rider is told where the faucet and the bell stand rather than
  // having to discover them by being refused.
  expect(Number.isFinite(before!.faucet.x) && Number.isFinite(before!.faucet.z)).toBe(true);
  expect(Number.isFinite(before!.bell.x) && Number.isFinite(before!.bell.z)).toBe(true);

  // THE HUMAN'S PRESS. Walk to the faucet with the movement keys the player has, then press the
  // same confirm key that upgrades a work. `grants` is the yard's own counter, not the test's.
  const target = { x: before!.faucet.x, z: before!.faucet.z };
  const heroAt = async () => page.evaluate(() => {
    const pos = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
    return pos ? { x: pos.x, z: pos.z } : { x: Number.NaN, z: Number.NaN };
  });
  const start = await heroAt();
  const holdKey = async (key: string, ms: number) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(ms);
    await page.keyboard.up(key);
  };
  // Two axes, walked one at a time so the approach is readable in the trace and needs no pathing.
  for (let attempt = 0; attempt < 14; attempt += 1) {
    const at = await heroAt();
    const dx = target.x - at.x;
    const dz = target.z - at.z;
    if (Math.hypot(dx, dz) <= 1.4) break;
    if (Math.abs(dx) > Math.abs(dz)) await holdKey(dx > 0 ? 'KeyD' : 'KeyA', Math.min(900, Math.abs(dx) * 130 + 90));
    else await holdKey(dz > 0 ? 'KeyS' : 'KeyW', Math.min(900, Math.abs(dz) * 130 + 90));
  }
  const arrived = await heroAt();
  expect(Math.hypot(arrived.x - target.x, arrived.z - target.z),
    `the player could not walk to the faucet from ${JSON.stringify(start)}`).toBeLessThanOrEqual(2.2);

  await page.keyboard.press('Space');
  await expect.poll(async () => (await yard(page))?.faucet.grants ?? 0, { timeout: 10000 })
    .toBeGreaterThan(before!.faucet.grants);

  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: `${SHOTS}/drill-yard-confirm-${testInfo.project.name}.png` });
  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
});
