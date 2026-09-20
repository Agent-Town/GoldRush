# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landmark-brightness.spec.ts >> The Claim keeps daylight landmarks opaque, lit, and under the frame budget
- Location: e2e/landmark-brightness.spec.ts:57:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 33.4
Received:    34.5
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - generic: Dimming the lanterns for smoothness.
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 00:07
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
      - button "Pause the claim" [ref=e11]: P - catch your breath
    - region
    - text: None None None
  - generic [ref=e12]:
    - button "▸ Game tuning" [ref=e13] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e14]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  1   | import { mkdir, readFile } from 'node:fs/promises';
  2   | import path from 'node:path';
  3   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  4   | import { PNG } from 'pngjs';
  5   | import { Balance } from '../src/game/Balance';
  6   | 
  7   | const ARTIFACT_DIR = path.resolve('artifacts/landmark-brightness');
  8   | const ATLAS = path.resolve('assets/pilots/map-rebuild-spike/landmarks/the-claim/the-claim-landmarks-atlas.png');
  9   | type Errors = { console: string[]; page: string[] };
  10  | 
  11  | function collectErrors(page: Page): Errors {
  12  |   const errors: Errors = { console: [], page: [] };
  13  |   page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  14  |   page.on('pageerror', (error) => errors.page.push(error.message));
  15  |   return errors;
  16  | }
  17  | 
  18  | async function boot(page: Page, contract: string): Promise<void> {
  19  |   await page.goto(`/?debug&autotier&contract=${contract}&nowaves&nolevel&nokill&nopause&seed=landmark-brightness-${contract}&tier=full`);
  20  |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  21  |   const begin = page.getByRole('button', { name: 'Begin' });
  22  |   if (await begin.isVisible()) await begin.click();
  23  |   const briefing = page.getByTestId('contract-briefing');
  24  |   if (await briefing.isVisible().catch(() => false)) await page.getByTestId('contract-briefing-dismiss').click();
  25  |   await page.waitForFunction(() => document.querySelector<HTMLCanvasElement>('#game-canvas')?.dataset.terrain3dPilotState === 'ready');
  26  | }
  27  | 
  28  | async function p95(page: Page, frames = 180): Promise<number> {
  29  |   return page.evaluate(async (count) => {
  30  |     const samples: number[] = [];
  31  |     let previous = performance.now();
  32  |     for (let index = 0; index < count; index += 1) {
  33  |       await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  34  |       const now = performance.now();
  35  |       samples.push(now - previous);
  36  |       previous = now;
  37  |     }
  38  |     samples.sort((a, b) => a - b);
  39  |     return samples[Math.floor(samples.length * 0.95)] ?? 0;
  40  |   }, frames);
  41  | }
  42  | 
  43  | function medianLuminance(png: PNG, centerX?: number, centerY?: number): number {
  44  |   const values: number[] = [];
  45  |   const minX = centerX === undefined ? 0 : centerX - 8;
  46  |   const maxX = centerX === undefined ? png.width - 1 : centerX + 8;
  47  |   const minY = centerY === undefined ? 0 : centerY - 8;
  48  |   const maxY = centerY === undefined ? png.height - 1 : centerY + 8;
  49  |   for (let y = minY; y <= maxY; y += 1) for (let x = minX; x <= maxX; x += 1) {
  50  |     const offset = (y * png.width + x) * 4;
  51  |     values.push((0.2126 * png.data[offset]! + 0.7152 * png.data[offset + 1]! + 0.0722 * png.data[offset + 2]!) / 255);
  52  |   }
  53  |   values.sort((a, b) => a - b);
  54  |   return values[Math.floor(values.length / 2)] ?? 0;
  55  | }
  56  | 
  57  | test('The Claim keeps daylight landmarks opaque, lit, and under the frame budget', async ({ page }, testInfo: TestInfo) => {
  58  |   test.setTimeout(90_000);
  59  |   const errors = collectErrors(page);
  60  |   await boot(page, 'the-claim');
  61  |   await page.evaluate(() => window.__GR_TEST__!.teleport(8, 12));
  62  |   await page.waitForTimeout(300);
  63  | 
  64  |   const canvas = page.locator('#game-canvas');
  65  |   await expect(canvas).toHaveAttribute('data-terrain3d-pilot-night-pools', 'off');
  66  |   const materials = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-materials')) ?? '[]') as Array<{
  67  |     id: string; total: number; transparent: number; depthWriteDisabled: number;
  68  |   }>;
  69  |   expect(materials.find((material) => material.id === 'maintained_claim_house')).toMatchObject({
  70  |     total: 1,
  71  |     transparent: 0,
  72  |     depthWriteDisabled: 0,
  73  |   });
  74  | 
  75  |   const point = await page.evaluate(() => window.__GR_TEST__!.screenPoint(10.5, 14.5, 4.5));
  76  |   expect(point.inView).toBe(true);
  77  |   const box = await canvas.boundingBox();
  78  |   expect(box).toBeTruthy();
  79  |   await mkdir(ARTIFACT_DIR, { recursive: true });
  80  |   const shot = await canvas.screenshot({ path: path.join(ARTIFACT_DIR, `after-${testInfo.project.name}.png`) });
  81  |   const rendered = PNG.sync.read(shot);
  82  |   const renderedLuminance = medianLuminance(
  83  |     rendered,
  84  |     Math.round(point.x * rendered.width / box!.width),
  85  |     Math.round(point.y * rendered.height / box!.height),
  86  |   );
  87  |   const atlasLuminance = medianLuminance(PNG.sync.read(await readFile(ATLAS)));
  88  |   expect(renderedLuminance).toBeGreaterThan(0.06);
  89  |   expect(renderedLuminance / atlasLuminance).toBeGreaterThan(0.25);
  90  | 
> 91  |   expect(await p95(page)).toBeLessThanOrEqual(Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio);
      |                           ^ Error: expect(received).toBeLessThanOrEqual(expected)
  92  |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.performance.runtimeVerdict)).toBe(0);
  93  |   expect(errors).toEqual({ console: [], page: [] });
  94  | });
  95  | 
  96  | test('Night Shift keeps ground light pools without mutating landmark materials', async ({ page }) => {
  97  |   const errors = collectErrors(page);
  98  |   await boot(page, 'e1-night-shift');
  99  |   await page.evaluate(() => window.__GR_TEST__!.setWave(10));
  100 |   await page.waitForFunction(() => {
  101 |     const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
  102 |     return canvas?.dataset.terrain3dPilotNightPools === 'world-shader'
  103 |       && Number(canvas.dataset.terrain3dPilotNightPoolSources) > 0;
  104 |   });
  105 |   const canvas = page.locator('#game-canvas');
  106 |   const materials = JSON.parse((await canvas.getAttribute('data-terrain3d-pilot-landmark-materials')) ?? '[]') as Array<{
  107 |     transparent: number; depthWriteDisabled: number;
  108 |   }>;
  109 |   expect(materials.length).toBeGreaterThan(0);
  110 |   expect(materials.every((material) => material.transparent === 0 && material.depthWriteDisabled === 0)).toBe(true);
  111 |   expect(errors).toEqual({ console: [], page: [] });
  112 | });
  113 | 
```