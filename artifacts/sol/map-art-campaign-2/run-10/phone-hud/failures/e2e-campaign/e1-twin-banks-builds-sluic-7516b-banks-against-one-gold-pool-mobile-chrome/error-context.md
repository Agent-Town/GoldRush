# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e1-twin-banks.spec.ts >> builds sluices and stockpiles on both banks against one gold pool
- Location: e2e/e1-twin-banks.spec.ts:103:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - generic: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 01:37
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - strong: 198/200
      - region "Active weapon":
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
          - generic [ref=e5]:
            - generic [ref=e6]: the Prospector
            - strong [ref=e7]: L0
            - generic [ref=e8]: suggest-only
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build - Close" [pressed] [ref=e10]
      - button "Pause the claim" [ref=e11]: catch your breathⅡ
      - generic: Swipe to scroll
    - generic:
      - button [ref=e14]: Rotate
      - button [ref=e15]: Weapon
      - button [ref=e16]: OK
    - region
    - text: None None None
  - generic [ref=e17]:
    - button "▸ Game tuning" [ref=e18] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e19]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  1   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  2   | import { mkdir } from 'node:fs/promises';
  3   | import path from 'node:path';
  4   | 
  5   | type ErrorBucket = { consoleErrors: string[]; consoleWarnings: string[]; pageErrors: string[] };
  6   | type BuildableId = 'sluice' | 'stockpile';
  7   | 
  8   | const ARTIFACT_DIR = path.resolve('artifacts/e1-twin-banks');
  9   | const TWIN_QUERY = '?debug&contract=e1-twin-banks&timescale=8&nolevel&nowaves&nokill&seed=e1-twin-banks';
  10  | 
  11  | test.beforeEach(async ({ page }) => {
  12  |   await page.addInitScript(() => localStorage.clear());
  13  | });
  14  | 
  15  | function collectErrors(page: Page): ErrorBucket {
  16  |   const bucket: ErrorBucket = { consoleErrors: [], consoleWarnings: [], pageErrors: [] };
  17  |   page.on('console', (message) => {
  18  |     if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  19  |     if (message.type() === 'warning') bucket.consoleWarnings.push(message.text());
  20  |   });
  21  |   page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  22  |   return bucket;
  23  | }
  24  | 
  25  | async function openGame(page: Page, query = TWIN_QUERY): Promise<ErrorBucket> {
  26  |   const errors = collectErrors(page);
  27  |   await page.goto(`/${query}`);
  28  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  29  |   return errors;
  30  | }
  31  | 
  32  | async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  33  |   await mkdir(ARTIFACT_DIR, { recursive: true });
  34  |   await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
  35  | }
  36  | 
  37  | async function grantGold(page: Page, amount: number): Promise<void> {
  38  |   await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  39  | }
  40  | 
  41  | async function teleport(page: Page, x: number, z: number): Promise<void> {
  42  |   await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
  43  | }
  44  | 
  45  | async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  46  |   await teleport(page, x, z + 2);
  47  |   await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
> 48  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
      |                                                                                                              ^ Error: expect(received).toBe(expected) // Object.is equality
  49  |   await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  50  | }
  51  | 
  52  | async function setBalance(page: Page, pathName: string, value: number | boolean): Promise<void> {
  53  |   await expect(page.evaluate(([key, next]) => window.__GR_TEST__?.setBalance(key, next), [pathName, value] as const)).resolves.toBe(
  54  |     true,
  55  |   );
  56  | }
  57  | 
  58  | function expectClean(errors: ErrorBucket): void {
  59  |   expect(errors.consoleErrors).toEqual([]);
  60  |   expect(errors.pageErrors).toEqual([]);
  61  |   expect(errors.consoleWarnings.filter((message) => /contract|twin banks/i.test(message))).toEqual([]);
  62  | }
  63  | 
  64  | test('loads Twin Banks contract with two fords, two build zones, and one loss stake', async ({ page }, testInfo) => {
  65  |   const errors = await openGame(page);
  66  |   const snapshot = await page.evaluate(() => {
  67  |     const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
  68  |     return {
  69  |       contract: diagnostics.contract,
  70  |       hero: diagnostics.heroPos,
  71  |       water: diagnostics.terrain.water,
  72  |       samples: {
  73  |         center: window.__GR_TEST__?.terrainSample(0, 0),
  74  |         westFord: window.__GR_TEST__?.terrainSample(-16, 0),
  75  |         eastFord: window.__GR_TEST__?.terrainSample(16, 0),
  76  |       },
  77  |     };
  78  |   });
  79  | 
  80  |   expect(snapshot.contract.activeId).toBe('e1-twin-banks');
  81  |   expect(snapshot.contract.boardRow).toMatchObject({
  82  |     name: 'Twin Banks',
  83  |     tags: ['vein-hunter'],
  84  |     unlock: 'firstSecuredClaim',
  85  |   });
  86  |   expect(snapshot.contract.tileParams.fords?.map((ford) => ford.id)).toEqual(['west-ford', 'east-ford']);
  87  |   expect(snapshot.contract.tileParams.buildZones?.map((zone) => zone.id)).toEqual(['south-bank', 'north-bank']);
  88  |   expect(snapshot.contract.tileParams.stakeMarkers).toEqual([
  89  |     { id: 'south-claim-stake', x: 0, z: -12, heroStart: true },
  90  |     { id: 'north-expansion-marker', x: 0, z: 12, heroStart: false },
  91  |   ]);
  92  |   expect(snapshot.hero).toMatchObject({ x: 0, z: -12 });
  93  |   expect(snapshot.water?.riverPresent).toBe(true);
  94  |   expect(snapshot.water?.fordPresent).toBe(true);
  95  |   expect(snapshot.water?.fordStones).toBe(14);
  96  |   expect(snapshot.samples.center?.zone).toBe('river');
  97  |   expect(snapshot.samples.westFord?.zone).toBe('ford');
  98  |   expect(snapshot.samples.eastFord?.zone).toBe('ford');
  99  |   await shot(page, testInfo, 'both-bank-base');
  100 |   expectClean(errors);
  101 | });
  102 | 
  103 | test('builds sluices and stockpiles on both banks against one gold pool', async ({ page }) => {
  104 |   const errors = await openGame(page);
  105 |   await grantGold(page, 260);
  106 |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.bankCap ?? 0);
  107 | 
  108 |   await placeBuildableAt(page, 'sluice', -16, 7);
  109 |   await placeBuildableAt(page, 'sluice', 16, -7);
  110 |   await placeBuildableAt(page, 'stockpile', -16, 10);
  111 |   await placeBuildableAt(page, 'stockpile', 16, -10);
  112 | 
  113 |   const build = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build);
  114 |   expect(build.sluices).toBe(2);
  115 |   expect(build.stockpiles).toBe(2);
  116 |   expect(build.sluicePositions.map((pos) => Math.sign(pos.z)).sort()).toEqual([-1, 1]);
  117 |   expect(build.stockpilePositions.map((pos) => Math.sign(pos.z)).sort()).toEqual([-1, 1]);
  118 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.bankCap ?? 0)).toBeGreaterThan(before);
  119 |   expectClean(errors);
  120 | });
  121 | 
  122 | test('routes enemies through both west and east fords', async ({ page }, testInfo) => {
  123 |   test.setTimeout(45_000);
  124 |   const errors = await openGame(page, '?debug&contract=e1-twin-banks&timescale=12&nowaves&nokill&nolevel&nopause&seed=e1-twin-route');
  125 |   await setBalance(page, 'enemy.speed', 3.8);
  126 |   await assertFordRoute(page, -16);
  127 |   await assertFordRoute(page, 16);
  128 |   await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-16, 14));
  129 |   await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(16, 14));
  130 |   await page.waitForTimeout(450);
  131 |   await shot(page, testInfo, 'north-plot-skirmish');
  132 |   expectClean(errors);
  133 | });
  134 | 
  135 | test('north marker is not the run loss stake, south overrun still ends the run, and waves use the two ford-forcing edges', async ({ page }) => {
  136 |   const errors = await openGame(
  137 |     page,
  138 |     '?debug&contract=e1-twin-banks&timescale=20&nolevel&nokill&nopause&nosteal&nowreck&seed=e1-twin-spawns',
  139 |   );
  140 |   const markers = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.stakeMarkers ?? []);
  141 |   expect(markers.find((marker) => marker.id === 'north-expansion-marker')?.heroStart).toBe(false);
  142 |   expect(markers.find((marker) => marker.id === 'south-claim-stake')?.heroStart).toBe(true);
  143 | 
  144 |   for (const [key, value] of [
  145 |     ['enemy.speed', 0],
  146 |     ['waves.graceSeconds', 0.1],
  147 |     ['waves.waveInterval', 2],
  148 |     ['waves.trickleInterval', 999],
```