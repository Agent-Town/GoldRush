# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: _s2080-f1742-1-boot-probe.spec.ts >> s2080 boot probe: default plain boot is clean (no ?debug)
- Location: e2e/_s2080-f1742-1-boot-probe.spec.ts:28:1

# Error details

```
TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - button [ref=e5]: OK
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { mkdirSync } from 'node:fs';
  3  | 
  4  | // F-1742-1 boot probe. The finding was that an IDLE hero took zero damage for 360 sim-seconds on
  5  | // e4-long-road / e4-gusher-county and "secured" at wave 12 — the headless hero started embedded in
  6  | // a landmark blocker and nothing could reach it (cured by `22a0c62f5`, which wired the browser's
  7  | // own depenetration seam into HeadlessContractSim). Both contracts are bench-seeded now, so this
  8  | // pins the BROWSER half: the two newly seeded tiles actually build and run without errors.
  9  | //
  10 | // TWO MEASURED FACTS shape what this file can honestly assert, both recorded here so the next
  11 | // reader does not re-derive them:
  12 | //
  13 | //  1. A bare `?contract=<id>` is NOT a door. It resolves to `fallbackReason: 'debug-disabled'`
  14 | //     and silently opens The Claim (ContractFamilies.ts:1322). The first draft of this probe
  15 | //     passed exactly that way — green while exercising nothing — so every contract boot below
  16 | //     ASSERTS the resolved `contract.activeId` and cannot go vacuous again.
  17 | //  2. The board-launch path (`gr.contract.launch.v1`) does not open these tiles either: measured
  18 | //     s2080, ALL FOUR Motor contracts — including the long-shipped e4-dust-flats — fall back with
  19 | //     `stagedLaunchClear.reason: 'staged-contract-locked'`. That is a pre-existing property of E4
  20 | //     board reachability, identical for the two tiles added here and the two already on main, and
  21 | //     it is NOT in this change's scope. `?debug&epoch=…&contract=…` is therefore the vehicle, the
  22 | //     same one e4-dust-flats.spec.ts:5 and e4-landyacht-boss.spec.ts:6 already use for E4 tiles.
  23 | //
  24 | // The no-`?debug` half of Mistake #10 is covered by the default plain boot below; this change adds
  25 | // no new player-facing surface (bench seeds are an agent-bench artifact).
  26 | const NEW_SEEDED_CONTRACTS = ['e4-long-road', 'e4-gusher-county'] as const;
  27 | 
  28 | test('s2080 boot probe: default plain boot is clean (no ?debug)', async ({ page }, testInfo) => {
  29 |   const errors: string[] = [];
  30 |   page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  31 |   page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  32 | 
  33 |   await page.goto('/?nowaves&nolevel&seed=s2080-probe');
> 34 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24, null, { timeout: 15000 });
     |              ^ TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
  35 | 
  36 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('the-claim');
  37 |   mkdirSync('reviews/shots-f1742-1', { recursive: true });
  38 |   await page.screenshot({ path: `reviews/shots-f1742-1/${testInfo.project.name}-default.png` });
  39 |   expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
  40 | });
  41 | 
  42 | for (const contractId of NEW_SEEDED_CONTRACTS) {
  43 |   test(`s2080 boot probe: ${contractId} boots with zero console/page errors`, async ({ page }, testInfo) => {
  44 |     const errors: string[] = [];
  45 |     page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  46 |     page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  47 | 
  48 |     await page.goto(`/?debug&epoch=epoch-4-motor&contract=${contractId}&nowaves&nospawn&nokill&nolevel&nopause&seed=s2080-probe`);
  49 |     await page.waitForFunction(
  50 |       (id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 24,
  51 |       contractId,
  52 |       { timeout: 15000 },
  53 |     );
  54 | 
  55 |     // The tile the run actually got — not the silent Claim fallback that made draft 1 vacuous.
  56 |     expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe(contractId);
  57 |     mkdirSync('reviews/shots-f1742-1', { recursive: true });
  58 |     await page.screenshot({ path: `reviews/shots-f1742-1/${testInfo.project.name}-${contractId}.png` });
  59 |     expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([]);
  60 |   });
  61 | }
  62 | 
```