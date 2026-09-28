# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: task-046-territory-ring-pacing.spec.ts >> T1 banks the old ring as a run-scoped palisade kit and spends it before gold
- Location: e2e/task-046-territory-ring-pacing.spec.ts:76:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByTestId('pause-meta-territory')
Expected: "Territory I: palisade kit ready (7 free placements)"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByTestId('pause-meta-territory')

```

```yaml
- main:
  - text: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
  - region "Run vitals":
    - text: HP
    - strong: 100 / 100
    - text: Time
    - strong: 00:06
    - text: Wave
    - strong: "0"
  - region "Gold pouch":
    - text: Gold
    - strong: "10"
  - region "Active weapon":
    - text: Weapon
    - strong: Spark Rig
    - button "Prospector permission chip":
      - text: the Prospector
      - strong: L0
      - text: suggest-only
  - region "Experience":
    - text: Level
    - strong: "1"
    - strong: 0 / 12 XP
  - region "Build":
    - button "Build"
  - button "Pause the claim": catch your breath
  - group:
    - text: Palisade Swipe to scroll
    - paragraph: A timber lane wall. Higher tier means more hit points.
  - status:
    - paragraph: Tavernkeeper
    - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
    - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
- button "▸ Game tuning"
- status: "Meta territory: 1 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  1   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  2   | import { mkdir } from 'node:fs/promises';
  3   | import path from 'node:path';
  4   | import { Balance } from '../src/game/Balance';
  5   | import type { EconomyEvent } from '../src/game/Economy';
  6   | import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
  7   | import { RUN_SUSPEND_KEY } from '../src/game/ProfileStorage';
  8   | 
  9   | type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
  10  | 
  11  | const ARTIFACT_DIR = path.resolve('artifacts/territory-kit');
  12  | const KIT_SIZE = Balance.meta.territoryRing.length;
  13  | const PALISADE_SITES = [
  14  |   ...[-6, -3, 0, 3, 6].map((x) => ({ x, z: 12 })),
  15  |   ...[-6, -3, 0, 3].map((x) => ({ x, z: 8 })),
  16  | ];
  17  | 
  18  | function collectErrors(page: Page): ErrorBucket {
  19  |   const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  20  |   page.on('console', (message) => {
  21  |     if (message.type() === 'error') errors.consoleErrors.push(message.text());
  22  |   });
  23  |   page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  24  |   return errors;
  25  | }
  26  | 
  27  | async function dismissBriefing(page: Page): Promise<void> {
  28  |   const briefing = page.getByTestId('contract-briefing');
  29  |   if (await briefing.isVisible()) await page.getByTestId('contract-briefing-dismiss').click();
  30  |   await expect(briefing).toBeHidden();
  31  | }
  32  | 
  33  | async function openGame(page: Page, territory: number, seed: string): Promise<ErrorBucket> {
  34  |   const errors = collectErrors(page);
  35  |   await page.addInitScript(
  36  |     ({ key, steps, sessionKey }) => {
  37  |       if (sessionStorage.getItem(sessionKey)) return;
  38  |       localStorage.clear();
  39  |       localStorage.setItem(key, JSON.stringify({ version: 1, tracks: { territory: steps, science: 0, hero: 0, agent: 0 } }));
  40  |       sessionStorage.setItem(sessionKey, '1');
  41  |     },
  42  |     { key: META_PROGRESS_KEY, steps: territory, sessionKey: `territory-kit:${seed}` },
  43  |   );
  44  |   await page.goto(`/?debug&nowaves&nolevel&nopause&seed=${seed}`);
  45  |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 4);
  46  |   await dismissBriefing(page);
  47  |   return errors;
  48  | }
  49  | 
  50  | async function placePalisade(page: Page, position: { x: number; z: number }): Promise<void> {
  51  |   const placed = await page.evaluate(({ x, z }) => {
  52  |     window.__GR_TEST__?.teleport(x, z + 2);
  53  |     window.__GR_TEST__?.selectBuildable('palisade');
  54  |     return window.__GR_TEST__?.confirmBuild(x, z);
  55  |   }, position);
  56  |   const diagnostics = await page.evaluate(() => window.__GR_TEST__?.confirmBuildDiagnostics());
  57  |   expect(placed, JSON.stringify({ position, diagnostics })).toBe(true);
  58  | }
  59  | 
  60  | async function kitCredits(page: Page): Promise<number> {
  61  |   return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisadeKitCredits ?? -1);
  62  | }
  63  | 
  64  | async function palisades(page: Page): Promise<number> {
  65  |   return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? -1);
  66  | }
  67  | 
  68  | async function kitGrantAmounts(page: Page): Promise<number[]> {
  69  |   return page.evaluate(() =>
  70  |     ((window.__GR_TEST__?.economyLog() ?? []) as EconomyEvent[])
  71  |       .filter((event) => event.type === 'palisade_kit_granted')
  72  |       .map((event) => event.amount),
  73  |   );
  74  | }
  75  | 
  76  | test('T1 banks the old ring as a run-scoped palisade kit and spends it before gold', async ({ page }, testInfo: TestInfo) => {
  77  |   test.setTimeout(45_000);
  78  |   const errors = await openGame(page, 1, `territory-kit-${testInfo.project.name}`);
  79  | 
  80  |   await expect.poll(() => palisades(page)).toBe(0);
  81  |   await expect.poll(() => kitCredits(page)).toBe(KIT_SIZE);
  82  |   expect(await kitGrantAmounts(page)).toEqual([KIT_SIZE]);
  83  | 
  84  |   await page.keyboard.press('KeyB');
  85  |   await expect(page.getByTestId('hud-build-tile-palisade')).toContainText(`Palisade kit: ${KIT_SIZE} free`);
  86  |   await mkdir(ARTIFACT_DIR, { recursive: true });
  87  |   await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-menu-badge.png`), fullPage: true });
  88  |   await page.keyboard.press('Escape');
  89  | 
  90  |   await page.evaluate((amount) => window.__GR_TEST__?.grantGold(amount), Balance.palisade.cost);
  91  |   await placePalisade(page, PALISADE_SITES[0]!);
  92  |   await page.keyboard.press('KeyP');
> 93  |   await expect(page.getByTestId('pause-meta-territory')).toHaveText('Territory I: palisade kit ready (7 free placements)');
      |                                                          ^ Error: expect(locator).toHaveText(expected) failed
  94  |   await page.waitForTimeout(100);
  95  |   await page.keyboard.press('KeyP');
  96  |   await expect(page.getByTestId('pause-meta-panel')).toBeHidden();
  97  |   await page.evaluate(() => window.__GR_TEST__?.startWaveForTest(2));
  98  |   await expect.poll(() => page.evaluate((key) => localStorage.getItem(key) !== null, RUN_SUSPEND_KEY)).toBe(true);
  99  |   await page.reload();
  100 |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 4);
  101 |   await dismissBriefing(page);
  102 |   await expect.poll(() => palisades(page)).toBe(1);
  103 |   await expect.poll(() => kitCredits(page)).toBe(KIT_SIZE - 1);
  104 |   expect(await kitGrantAmounts(page)).toEqual([KIT_SIZE]);
  105 |   for (let index = 1; index < KIT_SIZE; index += 1) await placePalisade(page, PALISADE_SITES[index]!);
  106 | 
  107 |   await expect.poll(() => kitCredits(page)).toBe(0);
  108 |   await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).resolves.toBe(Balance.palisade.cost);
  109 |   const kitEvents = await page.evaluate(() =>
  110 |     ((window.__GR_TEST__?.economyLog() ?? []) as EconomyEvent[]).filter(
  111 |       (event) => event.type === 'gold_spent' && event.sink === 'build_palisade' && event.kit,
  112 |     ),
  113 |   );
  114 |   expect(kitEvents).toHaveLength(KIT_SIZE);
  115 |   expect(kitEvents.every((event) => 'amount' in event && event.amount === 0)).toBe(true);
  116 |   await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-kit-placement.png`), fullPage: true });
  117 | 
  118 |   await placePalisade(page, PALISADE_SITES[KIT_SIZE]!);
  119 |   await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).resolves.toBe(0);
  120 |   const paidEvent = await page.evaluate(() =>
  121 |     ((window.__GR_TEST__?.economyLog() ?? []) as EconomyEvent[]).filter(
  122 |       (event) => event.type === 'gold_spent' && event.sink === 'build_palisade',
  123 |     ).at(-1),
  124 |   );
  125 |   expect(paidEvent).toMatchObject({ type: 'gold_spent', sink: 'build_palisade', amount: Balance.palisade.cost });
  126 |   expect(paidEvent).not.toHaveProperty('kit');
  127 | 
  128 |   await page.evaluate(() => window.__GR_TEST__?.resetRun());
  129 |   await expect.poll(() => palisades(page)).toBe(0);
  130 |   await expect.poll(() => kitCredits(page)).toBe(KIT_SIZE);
  131 |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  132 | });
  133 | 
  134 | test('T0 keeps ordinary paid palisade placement unchanged', async ({ page }) => {
  135 |   const errors = await openGame(page, 0, 'territory-kit-t0');
  136 |   await expect.poll(() => palisades(page)).toBe(0);
  137 |   await expect.poll(() => kitCredits(page)).toBe(0);
  138 |   await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.logLength)).resolves.toBe(0);
  139 |   expect(await kitGrantAmounts(page)).toEqual([]);
  140 | 
  141 |   await page.keyboard.press('KeyB');
  142 |   await expect(page.getByTestId('hud-build-tile-palisade')).not.toContainText('Palisade kit:');
  143 |   await page.keyboard.press('Escape');
  144 |   await page.evaluate((amount) => window.__GR_TEST__?.grantGold(amount), Balance.palisade.cost);
  145 |   await placePalisade(page, PALISADE_SITES[0]!);
  146 | 
  147 |   const spent = await page.evaluate(() =>
  148 |     ((window.__GR_TEST__?.economyLog() ?? []) as EconomyEvent[]).filter(
  149 |       (event) => event.type === 'gold_spent' && event.sink === 'build_palisade',
  150 |     ).at(-1),
  151 |   );
  152 |   expect(spent).toMatchObject({ amount: Balance.palisade.cost });
  153 |   expect(spent).not.toHaveProperty('kit');
  154 |   await page.evaluate((wave) => window.__GR_TEST__?.startWaveForTest(wave), Balance.run.secureWave);
  155 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.meta?.tracks.territory)).toBe(1);
  156 |   await expect.poll(() => page.evaluate((key) => localStorage.getItem(key) !== null, RUN_SUSPEND_KEY)).toBe(true);
  157 |   await page.reload();
  158 |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 4);
  159 |   await expect.poll(() => kitCredits(page)).toBe(0);
  160 |   await expect.poll(() => palisades(page)).toBe(1);
  161 |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  162 | });
  163 | 
```