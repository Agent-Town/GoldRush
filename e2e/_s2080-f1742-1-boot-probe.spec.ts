import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// F-1742-1 boot probe. The finding was that an IDLE hero took zero damage for 360 sim-seconds on
// e4-long-road / e4-gusher-county and "secured" at wave 12 — the headless hero started embedded in
// a landmark blocker and nothing could reach it (cured by `22a0c62f5`, which wired the browser's
// own depenetration seam into HeadlessContractSim). Both contracts are bench-seeded now, so this
// pins the BROWSER half: the two newly seeded tiles actually build and run without errors.
//
// TWO MEASURED FACTS shape what this file can honestly assert, both recorded here so the next
// reader does not re-derive them:
//
//  1. A bare `?contract=<id>` is NOT a door. It resolves to `fallbackReason: 'debug-disabled'`
//     and silently opens The Claim (ContractFamilies.ts:1322). The first draft of this probe
//     passed exactly that way — green while exercising nothing — so every contract boot below
//     ASSERTS the resolved `contract.activeId` and cannot go vacuous again.
//  2. The board-launch path (`gr.contract.launch.v1`) does not open these tiles either: measured
//     s2080, ALL FOUR Motor contracts — including the long-shipped e4-dust-flats — fall back with
//     `stagedLaunchClear.reason: 'staged-contract-locked'`. That is a pre-existing property of E4
//     board reachability, identical for the two tiles added here and the two already on main, and
//     it is NOT in this change's scope. `?debug&epoch=…&contract=…` is therefore the vehicle, the
//     same one e4-dust-flats.spec.ts:5 and e4-landyacht-boss.spec.ts:6 already use for E4 tiles.
//
// The no-`?debug` half of Mistake #10 is covered by the default plain boot below; this change adds
// no new player-facing surface (bench seeds are an agent-bench artifact).
const NEW_SEEDED_CONTRACTS = ['e4-long-road', 'e4-gusher-county'] as const;

test('s2080 boot probe: default plain boot is clean (no ?debug)', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

  await page.goto('/?nowaves&nolevel&seed=s2080-probe');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24, null, { timeout: 15000 });

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('the-claim');
  mkdirSync('reviews/shots-f1742-1', { recursive: true });
  await page.screenshot({ path: `reviews/shots-f1742-1/${testInfo.project.name}-default.png` });
  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
});

for (const contractId of NEW_SEEDED_CONTRACTS) {
  test(`s2080 boot probe: ${contractId} boots with zero console/page errors`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

    await page.goto(`/?debug&epoch=epoch-4-motor&contract=${contractId}&nowaves&nospawn&nokill&nolevel&nopause&seed=s2080-probe`);
    await page.waitForFunction(
      (id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24,
      contractId,
      { timeout: 15000 },
    );

    // The tile the run actually got — not the silent Claim fallback that made draft 1 vacuous.
    expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe(contractId);
    mkdirSync('reviews/shots-f1742-1', { recursive: true });
    await page.screenshot({ path: `reviews/shots-f1742-1/${testInfo.project.name}-${contractId}.png` });
    expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
  });
}
