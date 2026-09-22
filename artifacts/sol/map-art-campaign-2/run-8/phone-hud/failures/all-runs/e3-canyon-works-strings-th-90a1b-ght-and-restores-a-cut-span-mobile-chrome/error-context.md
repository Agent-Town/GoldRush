# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e3-canyon-works.spec.ts >> strings the gorge, holds the night, and restores a cut span
- Location: e2e/e3-canyon-works.spec.ts:34:1

# Error details

```
Error: locator.screenshot: Element is not attached to the DOM
Call log:
  - taking element screenshot
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for navigation to finish...
    - navigated to "http://127.0.0.1:5312/?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nowaves&nospawn&nolevel&nopause&seed=canyon-1"
    - waiting for element to be stable

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - status [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - paragraph [ref=e7]: The Contract
            - button "Begin" [ref=e8] [cursor=pointer]
          - heading "The Canyon Works" [level=2] [ref=e9]
          - paragraph [ref=e10]: "A 96 by 112 gorge: sub-hall south, one dam channel, split switchbacks, and paired galleries above."
          - generic [ref=e11]:
            - generic [ref=e12]:
              - paragraph [ref=e13]: Goals
              - list [ref=e14]:
                - listitem [ref=e15]: Survive through wave 12 from the Dynamo Sub-Hall yard.
                - listitem [ref=e16]: CONNECT both cliff galleries by wave 8.
            - generic [ref=e17]:
              - paragraph [ref=e18]: Rules
              - list [ref=e19]:
                - listitem [ref=e20]: Sentry Beacons raised on marked PYLON SITES carry current up the switchbacks.
                - listitem [ref=e21]: "The Works keeps a strongbox and sells its beacons cheap: the purse holds 360 gold, not the usual 200, and the six beacons cost 25+30+35+45+50+55 = 240 gold, so the whole chain is affordable well before the galleries must be lit by wave 8."
                - listitem [ref=e22]: Every gallery, lamp, turret, and tram draws watts; the ledger sheds higher-priority numbers first.
                - listitem [ref=e23]: Fevered saboteurs are drawn to the grid and cut a span when they wreck a pylon.
      - generic "Wave status":
        - generic:
          - generic: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 00:01
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - strong: "0"
      - 'region "Power ledger: 26 of 28 watts, 1 lit, 0 brown, 3 dark"':
        - generic: Grid
        - strong: 26/28W · 1L 0B 3D · CONNECT 0/2 W8
      - region "Active weapon":
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e24] [cursor=pointer]:
          - generic [ref=e25]:
            - generic [ref=e26]: the Prospector
            - strong [ref=e27]: L0
            - generic [ref=e28]: suggest-only
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build" [ref=e30]
      - button "Pause the claim" [ref=e31]: catch your breathⅡ
      - status: the claim is raising… 25/30
      - generic: Swipe to scroll
    - generic:
      - button [ref=e34]: Rotate
      - button [ref=e35]: Weapon
      - button [ref=e36]: OK
    - region
    - text: None None None
  - generic [ref=e37]:
    - button "▸ Game tuning" [ref=e38] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e39]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  1   | import { mkdir } from 'node:fs/promises';
  2   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  3   | import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
  4   | import { expectNoConsoleErrors, watchErrors, type ErrorWatch } from './support/console-watch';
  5   | 
  6   | const QUERY = '?debug&epoch=epoch-3-voltage&contract=e3-canyon-works&nowaves&nospawn&nolevel&nopause&seed=canyon-1';
  7   | const ARTIFACT_DIR = 'artifacts/canyon-works';
  8   | const PYLONS = [
  9   |   [-12, -36], [-24, -20], [-28, 8],
  10  |   [12, -36], [24, -20], [28, 8],
  11  | ] as const;
  12  | 
  13  | test.setTimeout(90_000);
  14  | test.beforeEach(async ({ page }) => page.addInitScript(({ key }) => {
  15  |   localStorage.clear();
  16  |   localStorage.setItem(key, 'epoch-3-voltage');
  17  | }, { key: ACTIVE_EPOCH_KEY }));
  18  | 
  19  | async function open(page: Page): Promise<ErrorWatch> {
  20  |   const watch = watchErrors(page);
  21  |   await page.goto(`/${QUERY}`);
  22  |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  23  |   const briefing = page.getByTestId('contract-briefing');
  24  |   if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  25  |   await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  26  |   return watch;
  27  | }
  28  | 
  29  | async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  30  |   await mkdir(ARTIFACT_DIR, { recursive: true });
> 31  |   await page.locator('#game-canvas').screenshot({ path: `${ARTIFACT_DIR}/${testInfo.project.name}-${name}.png` });
      |                                      ^ Error: locator.screenshot: Element is not attached to the DOM
  32  | }
  33  | 
  34  | test('strings the gorge, holds the night, and restores a cut span', async ({ page }, testInfo) => {
  35  |   const watch = await open(page);
  36  |   const contract = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract);
  37  |   expect(contract).toMatchObject({
  38  |     activeId: 'e3-canyon-works',
  39  |     epochId: 'epoch-3-voltage',
  40  |     secureWave: 12,
  41  |     tileParams: {
  42  |       dimensions: { width: 96, height: 112 },
  43  |     },
  44  |     dayNightCycle: { waveSchedule: { duskWave: 4, darkWave: 8 } },
  45  |   });
  46  | 
  47  |   expect(await page.evaluate((sites) => {
  48  |     window.__GR_TEST__!.grantGold(1_000);
  49  |     return sites.map(([x, z]) => window.__GR_TEST__!.placeFree('sentry_beacon', x, z));
  50  |   }, PYLONS)).toEqual([true, true, true, true, true, true]);
  51  |   await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  52  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.canyonWorks)).toEqual({
  53  |     // byWave MIRRORS the authored `twist.powerGrid.connect.byWave`, widened 6 -> 8 by the owner's
  54  |     // 2026-09-06 ruling ("lets adjust the policy so the hard levels can be won"). Measured on the
  55  |     // shipped contract: the latch now fails with wave 9 at t = 270.03
  56  |     // (`artifacts/canyon-works-second-lever/deadline-probe.json`).
  57  |     powered: 2, required: 2, byWave: 8, complete: true, failed: false,
  58  |   });
  59  |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power)).toMatchObject({
  60  |     totalSupplyWatts: 26,
  61  |     totalDemandWatts: 28,
  62  |     cutWireCount: 0,
  63  |     components: [{ state: 'brown', supplyWatts: 26, demandWatts: 28 }],
  64  |   });
  65  |   await expect(page.getByTestId('hud-power')).toContainText('CONNECT COMPLETE');
  66  | 
  67  |   const dayHud = await page.locator('#hud').evaluate((element) => getComputedStyle(element).filter);
  68  |   await page.evaluate(() => window.__GR_TEST__!.setWave(6));
  69  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.lighting?.nightShift)).toMatchObject({ phase: 'dusk', darkness: 0.5 });
  70  |   expect(await page.locator('#hud').evaluate((element) => getComputedStyle(element).filter)).toBe(dayHud);
  71  |   await shot(page, testInfo, 'dusk-lit-chain');
  72  | 
  73  |   await page.evaluate(() => window.__GR_TEST__!.setWave(8));
  74  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.lighting?.nightShift)).toMatchObject({ phase: 'dark', darkness: 1 });
  75  |   const lamp = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.nodes.find((node) => node.id === 'lamp-east'));
  76  |   expect(lamp?.state).toBe('powered');
  77  |   const full = await page.evaluate(() => window.__GR_TEST__!.lightCoverage(37.5, 32));
  78  |   expect(full).toBeGreaterThan(0.95);
  79  |   expect(await page.evaluate(() => window.__GR_TEST__!.spawnMoths(1, 30, 32))).toBe(1);
  80  |   await page.evaluate(() => window.__GR_TEST__!.advanceSim(2));
  81  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm)).toMatchObject({ alive: 1, attached: 1, sourceId: 'lantern:1' });
  82  |   expect(await page.evaluate(() => window.__GR_TEST__!.lightCoverage(37.5, 32))).toBeLessThan(full * 0.6);
  83  |   await shot(page, testInfo, 'moth-cloud-lamp');
  84  |   await page.evaluate(() => {
  85  |     window.__GR_TEST__!.setBalance('sparkRig.damage', 100);
  86  |     window.__GR_TEST__!.setBalance('sparkRig.fireRate', 20);
  87  |     window.__GR_TEST__!.teleport(32, 32);
  88  |     window.__GR_TEST__!.advanceSim(2);
  89  |   });
  90  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.mothSwarm.alive)).toBe(0);
  91  |   expect(await page.evaluate(() => window.__GR_TEST__!.lightCoverage(37.5, 32))).toBeGreaterThan(0.95);
  92  | 
  93  |   expect(await page.evaluate(() => window.__GR_TEST__!.wreck('sentry_beacon', 4))).toBe(true);
  94  |   await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  95  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.canyonWorks?.powered)).toBe(1);
  96  |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power)).toMatchObject({ cutWireCount: 1 });
  97  |   await expect(page.getByTestId('hud-power')).toContainText('CONNECT COMPLETE');
  98  |   await shot(page, testInfo, 'brown-out-cut-span');
  99  | 
  100 |   await page.evaluate(() => {
  101 |     window.__GR_TEST__!.teleport(24, -20);
  102 |     window.__GR_TEST__!.grantGold(100);
  103 |     window.__GR_TEST__!.repair('sentry_beacon', 4);
  104 |     window.__GR_TEST__!.advanceSim(0.2);
  105 |   });
  106 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.canyonWorks?.complete)).toBe(true);
  107 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.power.cutWireCount)).toBe(0);
  108 | 
  109 |   await page.evaluate(() => {
  110 |     window.__GR_TEST__!.startWaveForTest(12);
  111 |   });
  112 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.run.secured)).toBe(true);
  113 |   expectNoConsoleErrors(watch);
  114 | });
  115 | 
  116 | test('keeps the Voltage era gate and saboteur ledger explicit', async ({ page }) => {
  117 |   const watch = await open(page);
  118 |   const proof = await page.evaluate(async () => {
  119 |     const registry = (await import('../src/meta/ContractFamilies'));
  120 |     const contract = registry.loadContract('e3-canyon-works');
  121 |     return {
  122 |       active: registry.epochIsActive('epoch-3-voltage'),
  123 |       unlock: contract.boardRow.unlock,
  124 |       saboteur: contract.twist.enemyRoster?.find((enemy) => enemy.id === 'fevered_saboteur'),
  125 |       masks: {
  126 |         build: contract.tileParams.buildZones?.map((zone) => zone.id),
  127 |         pylon: contract.tileParams.pylonSites?.map((site) => site.id),
  128 |         spawn: contract.twist.enemyRoster?.find((enemy) => enemy.id === 'fevered_saboteur')?.spawnGates,
  129 |       },
  130 |     };
  131 |   });
```