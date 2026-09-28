# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e1-night-shift.spec.ts >> lantern post is Night Shift gated and relights a true-dark light ring
- Location: e2e/e1-night-shift.spec.ts:372:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForFunction: Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
```

# Test source

```ts
  1   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  2   | import { mkdir, writeFile } from 'node:fs/promises';
  3   | import path from 'node:path';
  4   | import { PNG } from 'pngjs';
  5   | import { Balance } from '../src/game/Balance';
  6   | import { RUN_SUSPEND_KEY } from '../src/game/ProfileStorage';
  7   | 
  8   | type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
  9   | type SavedNightSuspend = {
  10  |   wave: number;
  11  |   buildings: {
  12  |     id: string;
  13  |     index: number;
  14  |     wrecked: boolean;
  15  |     repairCostOverride?: number;
  16  |     position: { x: number; z: number };
  17  |     rotationSteps: number;
  18  |   }[];
  19  | };
  20  | 
  21  | const ARTIFACT_DIR = path.resolve('artifacts/night-bite');
  22  | const LANTERN_ARTIFACT_DIR = path.resolve('artifacts/night-lanterns');
  23  | const DUSK_ARTIFACT_DIR = path.resolve('artifacts/night-dusk');
  24  | const NIGHT_QUERY = '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&seed=e1-night-shift';
  25  | const RELIGHT_COST = Math.ceil(Balance.lanternPost.cost / 2);
  26  | const COLD_LANTERNS = [
  27  |   { id: 'lantern_post', x: 0, z: 16, rotationSteps: 0, wrecked: true, relightCost: RELIGHT_COST },
  28  |   { id: 'lantern_post', x: -16, z: 18, rotationSteps: 1, wrecked: true, relightCost: RELIGHT_COST },
  29  |   { id: 'lantern_post', x: 16, z: 18, rotationSteps: 3, wrecked: true, relightCost: RELIGHT_COST },
  30  |   { id: 'lantern_post', x: -22, z: -12, rotationSteps: 1, wrecked: true, relightCost: RELIGHT_COST },
  31  |   { id: 'lantern_post', x: 22, z: -12, rotationSteps: 3, wrecked: true, relightCost: RELIGHT_COST },
  32  |   { id: 'lantern_post', x: -10, z: -24, rotationSteps: 2, wrecked: true, relightCost: RELIGHT_COST },
  33  |   { id: 'lantern_post', x: 10, z: -24, rotationSteps: 2, wrecked: true, relightCost: RELIGHT_COST },
  34  | ] as const;
  35  | const COLD_LANTERN_POSITIONS = COLD_LANTERNS.map(({ x, z }) => ({ x, z }));
  36  | const VISIBLE_LIGHT = 0.35;
  37  | const DARK_LIGHT = 0.06;
  38  | 
  39  | test.beforeEach(async ({ page }) => {
  40  |   await page.addInitScript(() => localStorage.clear());
  41  | });
  42  | 
  43  | function collectErrors(page: Page): ErrorBucket {
  44  |   const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  45  |   page.on('console', (message) => {
  46  |     if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  47  |   });
  48  |   page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  49  |   return bucket;
  50  | }
  51  | 
  52  | async function openGame(page: Page, query = NIGHT_QUERY): Promise<ErrorBucket> {
  53  |   const errors = collectErrors(page);
  54  |   await gotoGame(page, query);
  55  |   return errors;
  56  | }
  57  | 
  58  | async function gotoGame(page: Page, query: string): Promise<void> {
  59  |   await page.goto(`/${query}`);
> 60  |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
      |              ^ Error: page.waitForFunction: Test timeout of 30000ms exceeded.
  61  |   await dismissBriefing(page);
  62  | }
  63  | 
  64  | async function dismissBriefing(page: Page): Promise<void> {
  65  |   const briefing = page.getByTestId('contract-briefing');
  66  |   if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  67  |   await expect(briefing).toBeHidden();
  68  | }
  69  | 
  70  | async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  71  |   await mkdir(ARTIFACT_DIR, { recursive: true });
  72  |   await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
  73  | }
  74  | 
  75  | async function captureDuskStrip(page: Page, testInfo: TestInfo): Promise<void> {
  76  |   await mkdir(DUSK_ARTIFACT_DIR, { recursive: true });
  77  |   const frames: PNG[] = [];
  78  |   for (const [name, wave] of [['day', 4], ['golden', 7], ['dusk', 8], ['dark', 10]] as const) {
  79  |     await setWave(page, wave);
  80  |     await page.waitForTimeout(80);
  81  |     const buffer = await page.locator('#game-canvas').screenshot();
  82  |     await writeFile(path.join(DUSK_ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), buffer);
  83  |     frames.push(PNG.sync.read(buffer));
  84  |   }
  85  |   const width = frames[0]!.width;
  86  |   const height = frames[0]!.height;
  87  |   const strip = new PNG({ width: width * frames.length, height });
  88  |   for (const [index, frame] of frames.entries()) {
  89  |     for (let y = 0; y < height; y += 1) {
  90  |       frame.data.copy(strip.data, (y * strip.width + index * width) * 4, y * width * 4, (y + 1) * width * 4);
  91  |     }
  92  |   }
  93  |   await writeFile(path.join(DUSK_ARTIFACT_DIR, `${testInfo.project.name}-day-golden-dusk-dark-strip.png`), PNG.sync.write(strip));
  94  | }
  95  | 
  96  | async function setBalance(page: Page, key: string, value: number | boolean): Promise<void> {
  97  |   await expect(
  98  |     page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const),
  99  |   ).resolves.toBe(true);
  100 | }
  101 | 
  102 | async function setWave(page: Page, wave: number): Promise<void> {
  103 |   await page.evaluate((next) => window.__GR_TEST__?.setWave(next), wave);
  104 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(wave);
  105 | }
  106 | 
  107 | async function grantGold(page: Page, amount: number): Promise<void> {
  108 |   await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  109 | }
  110 | 
  111 | async function teleport(page: Page, x: number, z: number): Promise<void> {
  112 |   await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
  113 | }
  114 | 
  115 | async function selectBuildable(page: Page, id: string): Promise<boolean> {
  116 |   return page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId) ?? false, id);
  117 | }
  118 | 
  119 | async function aimBuildAt(page: Page, point: { x: number; z: number }, tolerance = 1): Promise<void> {
  120 |   const screen = await page.evaluate((target) => window.__GR_TEST__?.screenPoint(target.x, target.z, 0.03) ?? null, point);
  121 |   expect(screen?.inView).toBe(true);
  122 |   await page.mouse.move(screen!.x, screen!.y);
  123 |   await expect.poll(() => page.evaluate((target) => {
  124 |     const ghost = window.__THREE_GAME_DIAGNOSTICS__?.build.ghostPos;
  125 |     return ghost ? Math.hypot(ghost.x - target.x, ghost.z - target.z) : Number.POSITIVE_INFINITY;
  126 |   }, point)).toBeLessThan(tolerance);
  127 | }
  128 | 
  129 | async function lanternHp(page: Page) {
  130 |   return page.evaluate(() =>
  131 |     window.__THREE_GAME_DIAGNOSTICS__?.build.hp
  132 |       .filter((entry) => entry.id === 'lantern_post')
  133 |       .map((entry) => ({
  134 |         index: entry.index,
  135 |         hp: entry.hp,
  136 |         maxHp: entry.maxHp,
  137 |         wrecked: entry.wrecked,
  138 |         repairCost: entry.repairCost,
  139 |         position: entry.position,
  140 |       })) ?? [],
  141 |   );
  142 | }
  143 | 
  144 | async function relightLantern(page: Page, index = 0): Promise<unknown> {
  145 |   const target = COLD_LANTERN_POSITIONS[index]!;
  146 |   await grantGold(page, 20);
  147 |   await teleport(page, target.x, target.z);
  148 |   const result = await page.evaluate((targetIndex) => window.__GR_TEST__?.repair('lantern_post', targetIndex), index);
  149 |   await expect.poll(() => lanternHp(page).then((entries) => entries[index]?.wrecked)).toBe(false);
  150 |   return result;
  151 | }
  152 | 
  153 | async function spawnAssault(page: Page): Promise<void> {
  154 |   const lantern = COLD_LANTERN_POSITIONS[0]!;
  155 |   for (const point of [
  156 |     { x: lantern.x - 2, z: lantern.z },
  157 |     { x: lantern.x, z: lantern.z + 2 },
  158 |     { x: lantern.x + 4, z: lantern.z },
  159 |     { x: lantern.x + 9, z: lantern.z },
  160 |   ]) {
```