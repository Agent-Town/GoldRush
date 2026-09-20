# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: night3d-perf.spec.ts >> daylight matrix and Night Shift pressure stay within the painted 115% p95 gate
- Location: e2e/night3d-perf.spec.ts:67:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 1.15
Received:    1.833333300219643
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
          - strong: 00:10
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - generic: Gold
        - strong: "0"
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
        - button "Build" [ref=e10]
      - button "Pause the claim" [ref=e11]: catch your breath
      - generic:
        - status:
          - strong: Claim Stake
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
  1   | import { mkdir, writeFile } from 'node:fs/promises';
  2   | import path from 'node:path';
  3   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  4   | import { Balance } from '../src/game/Balance';
  5   | import { RUNTIME_PERFORMANCE_VERDICTS_STORAGE_KEY } from '../src/game/PerformanceTier';
  6   | 
  7   | const ARTIFACT_DIR = path.resolve('artifacts/night3d-perf');
  8   | const PERF_CONTRACTS = ['the-claim', 'e5-deepwater-claim', 'e9-dome-basin', 'e1-night-shift'] as const;
  9   | 
  10  | type Errors = { console: string[]; page: string[] };
  11  | 
  12  | function collectErrors(page: Page): Errors {
  13  |   const errors: Errors = { console: [], page: [] };
  14  |   page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  15  |   page.on('pageerror', (error) => errors.page.push(error.message));
  16  |   return errors;
  17  | }
  18  | 
  19  | async function bootPressure(page: Page, contract: string, terrain2d: boolean, lightCap = 8, autoTier = false): Promise<void> {
  20  |   await page.goto(`/?debug&contract=${contract}&nowaves&nolevel&nopause&nokill&seed=night3d-perf-${contract}&tier=full${terrain2d ? '&terrain2d' : ''}${autoTier ? '&autotier' : ''}`);
  21  |   await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  22  |   const begin = page.getByRole('button', { name: 'Begin' });
  23  |   if (await begin.isVisible()) await begin.click();
  24  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  25  |   await page.evaluate(({ cap, night }) => {
  26  |     const api = window.__GR_TEST__!;
  27  |     api.setBalance('render.night.maxDynamicLights', cap);
  28  |     api.setBalance('render.night.collapseSeconds', 9999);
  29  |     api.setBalance('enemy.contactDamage', 0);
  30  |     api.setBalance('waves.aliveCap', 80);
  31  |     if (night) {
  32  |       api.setWave(10);
  33  |       for (let index = 0; index < 7; index += 1) api.repair('lantern_post', index);
  34  |     }
  35  |     for (const count of [12, 24, 24]) api.spawnPack(count, 22, { speedScale: 0.05, hpScale: 999 });
  36  |   }, { cap: lightCap, night: contract === 'e1-night-shift' });
  37  |   await page.waitForFunction(() => (window.__GR_TEST__?.enemyPositions().length ?? 0) >= 55);
  38  |   if (!terrain2d) {
  39  |     await page.waitForFunction(() =>
  40  |       document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotState === 'ready' &&
  41  |       document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotRenderSource === 'glb');
  42  |   }
  43  |   if (contract === 'e1-night-shift') {
  44  |     await page.waitForFunction((cap) =>
  45  |       window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase === 'dark' &&
  46  |       window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPools === cap,
  47  |     lightCap);
  48  |   }
  49  |   await page.waitForTimeout(350);
  50  | }
  51  | 
  52  | async function p95(page: Page, frames = 180): Promise<number> {
  53  |   return page.evaluate(async (count) => {
  54  |     const samples: number[] = [];
  55  |     let previous = performance.now();
  56  |     for (let index = 0; index < count; index += 1) {
  57  |       await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  58  |       const now = performance.now();
  59  |       samples.push(now - previous);
  60  |       previous = now;
  61  |     }
  62  |     samples.sort((a, b) => a - b);
  63  |     return samples[Math.floor(samples.length * 0.95)] ?? 0;
  64  |   }, frames);
  65  | }
  66  | 
  67  | test('daylight matrix and Night Shift pressure stay within the painted 115% p95 gate', async ({ page }, testInfo: TestInfo) => {
  68  |   test.setTimeout(240_000);
  69  |   const errors = collectErrors(page);
  70  |   const report: Array<{ contract: string; paintedP95Ms: number; terrain3dP95Ms: number; ratio: number; uncappedP95Ms?: number }> = [];
  71  | 
  72  |   for (const contract of PERF_CONTRACTS) {
  73  |     await bootPressure(page, contract, true);
  74  |     await p95(page, 60);
  75  |     await bootPressure(page, contract, false);
  76  |     await p95(page, 60);
  77  | 
  78  |     await bootPressure(page, contract, true);
  79  |     const paintedP95Ms = await p95(page);
  80  |     await bootPressure(page, contract, false);
  81  |     const terrain3dP95Ms = await p95(page);
  82  |     let uncappedP95Ms: number | undefined;
  83  |     if (contract === 'e1-night-shift') {
  84  |       await bootPressure(page, contract, false, 32);
  85  |       uncappedP95Ms = await p95(page);
  86  |     }
  87  |     const ratio = terrain3dP95Ms / paintedP95Ms;
> 88  |     expect(ratio).toBeLessThanOrEqual(1.15);
      |                   ^ Error: expect(received).toBeLessThanOrEqual(expected)
  89  |     expect(terrain3dP95Ms).toBeLessThanOrEqual(Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio);
  90  |     report.push({ contract, paintedP95Ms, terrain3dP95Ms, ratio, ...(uncappedP95Ms === undefined ? {} : { uncappedP95Ms }) });
  91  |   }
  92  | 
  93  |   await mkdir(ARTIFACT_DIR, { recursive: true });
  94  |   await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  95  |   expect(errors).toEqual({ console: [], page: [] });
  96  | });
  97  | 
  98  | test('Night Shift keeps its lantern read and auto-tiers one sticky step at a time', async ({ page }, testInfo) => {
  99  |   test.setTimeout(90_000);
  100 |   const errors = collectErrors(page);
  101 |   await bootPressure(page, 'e1-night-shift', false, 8);
  102 | 
  103 |   const lighting = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting);
  104 |   expect(lighting).toMatchObject({ nightPools: 8, nightPoolCap: 8, nightShift: { phase: 'dark', darkness: 1 } });
  105 |   expect(lighting?.nightPoolSources ?? 0).toBeGreaterThan(8);
  106 |   expect(lighting?.enemyLanterns ?? 0).toBeGreaterThan(0);
  107 |   await mkdir(ARTIFACT_DIR, { recursive: true });
  108 |   const shot = await page.locator('#game-canvas').screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-night-lanterns.png`) });
  109 |   await testInfo.attach('night-lanterns', { body: shot, contentType: 'image/png' });
  110 |   expect(shot.byteLength).toBeGreaterThan(10_000);
  111 | 
  112 |   await page.goto('/?debug&autotier&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=night3d-autotier&tier=full');
  113 |   await page.waitForFunction(() => Boolean(window.__GR_TEST__));
  114 |   await page.evaluate(() => window.__GR_TEST__!.setBalance('render.night.collapseSeconds', 9999));
  115 |   const begin = page.getByRole('button', { name: 'Begin' });
  116 |   if (await begin.isVisible()) await begin.click();
  117 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  118 |   await page.waitForFunction(() => {
  119 |     const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  120 |     return canvas?.dataset.terrain3dPilotState === 'ready' && canvas.dataset.run3dPilotState === 'ready';
  121 |   });
  122 | 
  123 |   await page.evaluate(() => {
  124 |     const api = window.__GR_TEST__!;
  125 |     api.setBalance('render.night.windowFrames', 600);
  126 |     api.setBalance('render.night.frameBudgetMs', 0.1);
  127 |     api.setBalance('render.night.collapseRatio', 1);
  128 |     api.setBalance('render.night.collapseSeconds', 1.5);
  129 |   });
  130 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(1);
  131 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frameMs.sampleCount ?? 600)).toBeLessThan(600);
  132 |   await page.evaluate(() => window.__GR_TEST__!.setBalance('render.night.collapseSeconds', 9999));
  133 |   await expect(page.getByText('Dimming the lanterns for smoothness.')).toBeVisible();
  134 |   await page.evaluate(() => window.__GR_TEST__!.setBalance('render.night.collapseSeconds', 1.5));
  135 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(2);
  136 |   await expect(page.getByText('Trimming the night lights for smoothness.')).toBeVisible();
  137 |   await page.evaluate(() => window.__GR_TEST__!.setBalance('render.night.collapseSeconds', 9999));
  138 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPoolCap)).toBe(4);
  139 |   await page.evaluate(() => window.__GR_TEST__!.setBalance('render.night.collapseSeconds', 1.5));
  140 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(3);
  141 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.tier)).toBe('lite');
  142 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.postEnabled)).toBe(false);
  143 |   await expect(page.getByText('Switching to the painted map for smoothness.')).toBeVisible();
  144 |   await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
  145 |   await expect(page.locator('#game-canvas')).toHaveAttribute('data-run3d-pilot-state', 'lite');
  146 | 
  147 |   expect(await page.evaluate((key) => JSON.parse(sessionStorage.getItem(key) ?? '{}')['e1-night-shift'], RUNTIME_PERFORMANCE_VERDICTS_STORAGE_KEY)).toBe(3);
  148 |   expect(await page.evaluate((key) => localStorage.getItem(key), RUNTIME_PERFORMANCE_VERDICTS_STORAGE_KEY)).toBeNull();
  149 |   await page.goto('/?debug&autotier&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=night3d-sticky&tier=full');
  150 |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  151 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(3);
  152 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.tier)).toBe('lite');
  153 |   await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
  154 | 
  155 |   await page.goto('/?tier=full');
  156 |   await expect(page.getByTestId('start-menu')).toBeVisible();
  157 |   expect(await page.evaluate(async () => {
  158 |     const tier = await Function('return import("/src/game/PerformanceTier.ts")')() as typeof import('../src/game/PerformanceTier');
  159 |     return tier.performanceTierDiagnostics();
  160 |   })).toMatchObject({ tier: 'full', runtimeVerdict: 0 });
  161 | 
  162 |   await page.goto('/?debug&contract=the-claim&nowaves&nolevel&nopause&nokill&seed=night3d-map-scope&tier=full');
  163 |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  164 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(0);
  165 |   await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');
  166 | 
  167 |   const freshBoot = await page.context().newPage();
  168 |   freshBoot.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  169 |   freshBoot.on('pageerror', (error) => errors.page.push(error.message));
  170 |   await freshBoot.goto('/?debug&contract=e1-night-shift&nowaves&nolevel&nopause&nokill&seed=night3d-next-session&tier=full');
  171 |   await freshBoot.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  172 |   expect(await freshBoot.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(0);
  173 |   await expect(freshBoot.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');
  174 |   await freshBoot.close();
  175 |   expect(errors).toEqual({ console: [], page: [] });
  176 | });
  177 | 
```