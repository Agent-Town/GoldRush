# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e1-twin-banks.spec.ts >> loads Twin Banks contract with two fords, two build zones, and one loss stake
- Location: e2e/e1-twin-banks.spec.ts:64:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "river"
Received: "bank"
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
          - heading "Twin Banks" [level=2] [ref=e9]
          - paragraph [ref=e10]: A braided river claim with twin fords, gravel bars, and damp reeds.
          - generic [ref=e11]:
            - generic [ref=e12]:
              - paragraph [ref=e13]: Goals
              - list [ref=e14]:
                - listitem [ref=e15]: Survive through wave 20.
                - listitem [ref=e16]: Build on either bank and watch both fords.
            - generic [ref=e17]:
              - paragraph [ref=e18]: Rules
              - list [ref=e19]:
                - listitem [ref=e20]: Both banks can hold buildings.
                - listitem [ref=e21]: Two fords carry pressure across the river.
                - listitem [ref=e22]: The south stake marks your starting ground; the north marker stands across the braid.
      - generic "Wave status":
        - generic:
          - generic: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 00:11
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - strong: "0"
      - region "Active weapon":
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e23] [cursor=pointer]:
          - generic [ref=e24]:
            - generic [ref=e25]: the Prospector
            - strong [ref=e26]: L0
            - generic [ref=e27]: suggest-only
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build" [ref=e29]
      - button "Pause the claim" [ref=e30]: catch your breathⅡ
      - status: the claim is raising… 21/30
      - generic: Swipe to scroll
    - generic:
      - button [ref=e33]: Rotate
      - button [ref=e34]: Weapon
      - button [ref=e35]: OK
    - region
    - text: None None None
  - generic [ref=e36]:
    - button "▸ Game tuning" [ref=e37] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e38]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
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
  48  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
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
> 96  |   expect(snapshot.samples.center?.zone).toBe('river');
      |                                         ^ Error: expect(received).toBe(expected) // Object.is equality
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
  149 |     ['waves.pulseBase', 4],
  150 |     ['waves.pulsePerWave', 0],
  151 |     ['waves.pulsesPerWave', 1],
  152 |     ['waves.edgesPerPulse', 4],
  153 |     ['waves.aliveCap', 8],
  154 |   ] as const) {
  155 |     await setBalance(page, key, value);
  156 |   }
  157 |   await page.evaluate(() => window.__GR_TEST__?.resetRun());
  158 |   await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0), { timeout: 10_000 }).toBeGreaterThanOrEqual(4);
  159 |   const edges = await page.evaluate(() => [...new Set(window.__GR_TEST__?.enemyPositions().map((enemy) => enemy.edge).filter(Boolean))].sort());
  160 |   // RE-POINTED 2026-09-19 (`tasks/rulings-play-2026-09-19.md`, F-OMA-4). Owner ruling of the same
  161 |   // day, verbatim: "I agree with all your recommendations on the decisions - good work" — the desk
  162 |   // register's F-OMA-4 row reads "Yes. Small and reversible; one word."
  163 |   //
  164 |   // WAS `['east', 'north', 'south', 'west']`. The claim's own briefing rule 2 says "Two fords carry
  165 |   // pressure across the river", and the data had never made that sentence true: no E1 contract
  166 |   // authors `spawnGates`, so `WaveSystem.spawnAt` places every body on the HERO-CENTRED ring at
  167 |   // `Balance.waves.spawnRingRadius` = 26 from EACH listed edge, and with all four listed the ring
  168 |   // closed from every quarter at once — nothing ever had to find a ford. With east and west gone,
  169 |   // the north half of every wave has to reach a ford at x = ±16 and cross it
  170 |   // (`Balance.pathing.riverBlocksEnemies`), and the wave BUDGET does not move at all because
  171 |   // `WaveSystem.planWave` sizes a wave from `waveBudget(wave)` rather than from the edge count.
  172 |   //
  173 |   // The cure was made, measured and reverted once already, on 2026-09-18, for exactly this
  174 |   // assertion: `artifacts/open-maps-acceptance-e1-e4/report.md` §5c landed it as `196c811d1` and
  175 |   // pulled it as `742a53898` because re-pointing this line was outside that task's firewall, and
  176 |   // filed the two-edit commit a drainer would need. This is that commit's second edit.
  177 |   expect(edges).toEqual(['north', 'south']);
  178 |   expectClean(errors);
  179 |
  180 |   const overrunErrors = await openGame(
  181 |     page,
  182 |     '?debug&contract=e1-twin-banks&timescale=12&nolevel&nowaves&nopause&nosteal&nowreck&seed=e1-twin-overrun',
  183 |   );
  184 |   await setBalance(page, 'enemy.contactDamage', 200);
  185 |   await setBalance(page, 'enemy.speed', 4);
  186 |   await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, -10))).resolves.toBe(true);
  187 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 8_000 }).toBe('dead');
  188 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.lastRunEndedReason)).toBe('death');
  189 |   expectClean(overrunErrors);
  190 | });
  191 |
  192 | test('seeded Twin Banks diagnostics are stable', async ({ page }) => {
  193 |   const errors = await openGame(page, '?debug&contract=e1-twin-banks&timescale=3&nolevel&nowaves&seed=e1-twin-stable');
  194 |   const first = await determinismSnapshot(page);
  195 |   await openGame(page, '?debug&contract=e1-twin-banks&timescale=3&nolevel&nowaves&seed=e1-twin-stable');
  196 |   const second = await determinismSnapshot(page);
```
