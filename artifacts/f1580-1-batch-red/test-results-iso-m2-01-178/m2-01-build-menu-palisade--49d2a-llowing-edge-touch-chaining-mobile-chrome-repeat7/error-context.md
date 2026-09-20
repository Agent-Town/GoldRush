# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m2-01-build-menu.spec.ts >> palisade footprint rejects overlap while allowing edge-touch chaining
- Location: e2e/m2-01-build-menu.spec.ts:178:1

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
          - strong: 00:54
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - generic: Gold
        - strong: "30"
      - region "Active weapon":
        - generic: Weapon
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
      - button "Pause the claim" [ref=e11]: catch your breath
    - generic:
      - button [ref=e14]: R
      - button [ref=e15]: Q
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
  2   | import fs from 'node:fs';
  3   | import path from 'node:path';
  4   | import { Balance } from '../src/game/Balance';
  5   | 
  6   | type BuildableId = 'sentry_beacon' | 'palisade' | 'sluice' | 'stockpile' | 'turret' | 'assay_office';
  7   | type ErrorBucket = {
  8   |   consoleErrors: string[];
  9   |   pageErrors: string[];
  10  | };
  11  | 
  12  | type Rect = { x: number; y: number; width: number; height: number };
  13  | type WallTracker = {
  14  |   crossedThrough: boolean;
  15  |   reached: boolean;
  16  |   done: boolean;
  17  |   samples: number;
  18  |   last: { x: number; z: number } | null;
  19  | };
  20  | 
  21  | declare global {
  22  |   interface Window {
  23  |     __M2_01_TRACKER__?: WallTracker;
  24  |   }
  25  | }
  26  | 
  27  | const shotDir = path.resolve('artifacts/056');
  28  | const menuBuildables = ['sentry_beacon', 'palisade', 'sluice', 'stockpile', 'turret', 'assay_office'] as const;
  29  | 
  30  | function collectErrors(page: Page): ErrorBucket {
  31  |   const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  32  |   page.on('console', (message) => {
  33  |     if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  34  |   });
  35  |   page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  36  |   return bucket;
  37  | }
  38  | 
  39  | async function openGame(page: Page, query = '?debug&timescale=3&nowaves'): Promise<ErrorBucket> {
  40  |   const errors = collectErrors(page);
  41  |   await page.goto(`/${query}`);
  42  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  43  |   return errors;
  44  | }
  45  | 
  46  | async function grantGold(page: Page, amount: number): Promise<void> {
  47  |   const before = await gold(page);
  48  |   await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  49  |   await expect.poll(() => gold(page)).toBe(before + amount);
  50  | }
  51  | 
  52  | async function gold(page: Page): Promise<number> {
  53  |   return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
  54  | }
  55  | 
  56  | async function teleport(page: Page, x: number, z: number): Promise<void> {
  57  |   await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
  58  | }
  59  | 
  60  | async function openBuildMenu(page: Page): Promise<void> {
  61  |   await page.keyboard.press('KeyB');
  62  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildMenuOpen ?? false)).toBe(true);
  63  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.mode ?? false)).toBe(true);
  64  | }
  65  | 
  66  | async function selectFromMenu(page: Page, id: BuildableId): Promise<void> {
  67  |   await page.keyboard.press(`Digit${menuBuildables.indexOf(id) + 1}`);
  68  |   await expect.poll(() => selectedBuildable(page)).toBe(id);
  69  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildMenuOpen ?? false)).toBe(true);
  70  | }
  71  | 
  72  | async function selectedBuildable(page: Page): Promise<string | undefined> {
  73  |   return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.selectedBuildable);
  74  | }
  75  | 
  76  | async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  77  |   await teleport(page, x, z + 2);
  78  |   await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  79  |   await expect.poll(() => selectedBuildable(page)).toBe(id);
  80  |   await placeSelected(page, id);
  81  | }
  82  | 
  83  | async function placeSelected(page: Page, id: BuildableId): Promise<void> {
> 84  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
      |                                                                                                              ^ Error: expect(received).toBe(expected) // Object.is equality
  85  |   const before = await buildableCount(page, id);
  86  |   await page.keyboard.press('Enter');
  87  |   await expect.poll(() => buildableCount(page, id)).toBe(before + 1);
  88  | }
  89  | 
  90  | async function buildableCount(page: Page, id: BuildableId): Promise<number> {
  91  |   return page.evaluate(
  92  |     (buildableId) => window.__THREE_GAME_DIAGNOSTICS__?.build.buildables.find((entry) => entry.id === buildableId)?.count ?? 0,
  93  |     id,
  94  |   );
  95  | }
  96  | 
  97  | async function closeBuild(page: Page): Promise<void> {
  98  |   await page.keyboard.press('Escape');
  99  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.mode ?? true)).toBe(false);
  100 | }
  101 | 
  102 | function intersects(a: Rect, b: Rect): boolean {
  103 |   return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  104 | }
  105 | 
  106 | async function saveShot(page: Page, name: string): Promise<void> {
  107 |   fs.mkdirSync(shotDir, { recursive: true });
  108 |   await page.screenshot({ path: path.join(shotDir, `${name}.png`), fullPage: false });
  109 | }
  110 | 
  111 | test('menu places a palisade and logs build_palisade spend', async ({ page }, testInfo: TestInfo) => {
  112 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-palisade');
  113 |   await grantGold(page, 20);
  114 | 
  115 |   await openBuildMenu(page);
  116 |   if (testInfo.project.name === 'desktop-chrome') await saveShot(page, 'desktop-build-menu-palisade');
  117 |   await testInfo.attach('m2-01-desktop-menu-open', {
  118 |     body: await page.screenshot({ fullPage: true }),
  119 |     contentType: 'image/png',
  120 |   });
  121 |   await selectFromMenu(page, 'palisade');
  122 |   await placeSelected(page, 'palisade');
  123 | 
  124 |   expect(await gold(page)).toBe(10);
  125 |   const spent = await page.evaluate(() =>
  126 |     (window.__GR_TEST__?.economyLog() ?? []).filter((event) => {
  127 |       const entry = event as { type?: string };
  128 |       return entry.type === 'gold_spent';
  129 |     }),
  130 |   );
  131 |   expect(spent.at(-1)).toMatchObject({ type: 'gold_spent', sink: 'build_palisade', amount: 10 });
  132 |   expect(errors.consoleErrors).toEqual([]);
  133 |   expect(errors.pageErrors).toEqual([]);
  134 | });
  135 | 
  136 | test('build menu shows six ready icons and Balance-backed blurbs', async ({ page }, testInfo: TestInfo) => {
  137 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-icons-blurbs');
  138 |   await grantGold(page, 1000);
  139 | 
  140 |   await openBuildMenu(page);
  141 |   const blurb = page.getByTestId('hud-build-blurb');
  142 |   await expect(blurb).toContainText(`radius ${Balance.beacon.range}wu`);
  143 | 
  144 |   const expectedSlugs: Record<(typeof menuBuildables)[number], string> = {
  145 |     sentry_beacon: 'sentry-beacon',
  146 |     palisade: 'palisade',
  147 |     sluice: 'sluice-works',
  148 |     stockpile: 'stockpile-yard',
  149 |     turret: 'signal-turret',
  150 |     assay_office: 'claim-office',
  151 |   };
  152 |   for (const id of menuBuildables) {
  153 |     const tile = page.getByTestId(`hud-build-tile-${id}`);
  154 |     await expect(tile).toHaveAttribute('data-icon-slug', expectedSlugs[id]);
  155 |     await expect(tile).toHaveAttribute('data-asset-state', 'ready');
  156 |     await expect(tile.locator('.hud-build-tile__icon')).toHaveCSS('display', 'block');
  157 |   }
  158 | 
  159 |   await page.getByTestId('hud-build-tile-sluice').hover();
  160 |   await expect(blurb).toContainText(`${Balance.sluice.goldPerCycle}g per cycle`);
  161 |   await expect(blurb).toContainText(`T1: ${Balance.sluice.goldPerCycle}g every ${Balance.sluice.cycleSeconds}s`);
  162 | 
  163 |   await page.mouse.move(4, 4);
  164 |   await page.keyboard.press('Digit5');
  165 |   await expect.poll(() => selectedBuildable(page)).toBe('turret');
  166 |   await expect(blurb).toContainText(`${Balance.turret.range}wu range`);
  167 |   await expect(blurb).toContainText(`T1: ${Math.round(Balance.turret.damage)} damage`);
  168 | 
  169 |   await page.keyboard.press('Digit6');
  170 |   await expect.poll(() => selectedBuildable(page)).toBe('assay_office');
  171 |   await expect(blurb).toContainText('One per claim');
  172 |   if (testInfo.project.name === 'desktop-chrome') await saveShot(page, 'desktop-build-menu-icons-blurb');
  173 | 
  174 |   expect(errors.consoleErrors).toEqual([]);
  175 |   expect(errors.pageErrors).toEqual([]);
  176 | });
  177 | 
  178 | test('palisade footprint rejects overlap while allowing edge-touch chaining', async ({ page }) => {
  179 |   const errors = await openGame(page, '?debug&timescale=3&nowaves&seed=m2-01-palisade-footprint');
  180 |   await grantGold(page, 50);
  181 | 
  182 |   await placeBuildableAt(page, 'palisade', 0, 9);
  183 | 
  184 |   await teleport(page, 0, 12);
```