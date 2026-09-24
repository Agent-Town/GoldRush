# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feedback-fx.spec.ts >> announcement banner fades after the opening claim notice
- Location: e2e/feedback-fx.spec.ts:28:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('hud-wave')
Timeout: 5000ms
- Expected substring  - 1
+ Received string     + 8

- Stake your claim.
+
+         
+         
+         
+           
+           the Prospector: follows and observes. Chip by weapon; claim wins grow it.
+         
+       

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByTestId('hud-wave')
    13 × locator resolved to <div class="hud__wave" data-testid="hud-wave" aria-label="Wave status">…</div>
       - unexpected value "
        
        
        
          
          the Prospector: follows and observes. Chip by weapon; claim wins grow it.
        
      "

```

```yaml
- text: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test';
  2  | 
  3  | type HarvestNode = {
  4  |   active: boolean;
  5  |   position: { x: number; z: number };
  6  | };
  7  | 
  8  | async function waitForGame(page: Page, frames = 10): Promise<void> {
  9  |   await page.waitForFunction((targetFrames) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > targetFrames, frames);
  10 | }
  11 | 
  12 | async function nearestActiveNode(page: Page): Promise<HarvestNode> {
  13 |   return page.evaluate(() => {
  14 |     const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
  15 |     const hero = diagnostics?.heroPos ?? { x: 0, z: 0 };
  16 |     const nodes = diagnostics?.harvest.activeNodes.filter((node) => node.active) ?? [];
  17 |     nodes.sort((a, b) => {
  18 |       const adx = a.position.x - hero.x;
  19 |       const adz = a.position.z - hero.z;
  20 |       const bdx = b.position.x - hero.x;
  21 |       const bdz = b.position.z - hero.z;
  22 |       return adx * adx + adz * adz - (bdx * bdx + bdz * bdz);
  23 |     });
  24 |     return nodes[0];
  25 |   });
  26 | }
  27 | 
  28 | test('announcement banner fades after the opening claim notice', async ({ page }) => {
  29 |   await page.goto('/?timescale=2');
  30 |   await waitForGame(page, 1);
  31 | 
  32 |   const banner = page.getByTestId('hud-wave');
> 33 |   await expect(banner).toContainText('Stake your claim.');
     |                        ^ Error: expect(locator).toContainText(expected) failed
  34 |   await expect
  35 |     .poll(async () => Number(await banner.evaluate((element) => getComputedStyle(element).opacity)))
  36 |     .toBeGreaterThan(0.5);
  37 | 
  38 |   await expect
  39 |     .poll(async () => Number(await banner.evaluate((element) => getComputedStyle(element).opacity)), {
  40 |       timeout: 5_000,
  41 |     })
  42 |     .toBeLessThan(0.05);
  43 | });
  44 | 
  45 | test('gold panning spawns pooled world-space float text', async ({ page }) => {
  46 |   await page.goto('/?debug&timescale=8&seed=feedback-fx&nowaves');
  47 |   await waitForGame(page);
  48 | 
  49 |   const target = await nearestActiveNode(page);
  50 |   expect(target).toBeTruthy();
  51 |   const startingGold = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0);
  52 | 
  53 |   await page.evaluate((position) => window.__GR_TEST__?.teleport(position.x, position.z), target.position);
  54 |   await expect
  55 |     .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? 0), {
  56 |       timeout: 8_000,
  57 |     })
  58 |     .toBeGreaterThan(startingGold);
  59 |   await expect
  60 |     .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0), {
  61 |       timeout: 2_000,
  62 |     })
  63 |     .toBeGreaterThan(0);
  64 | 
  65 |   const frameMs = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frameMs);
  66 |   console.log(`frameMs avg=${frameMs?.avg.toFixed(2)} p95=${frameMs?.p95.toFixed(2)}`);
  67 | });
  68 | 
  69 | test('xp mote pickup spawns teal world-space float text', async ({ page }) => {
  70 |   await page.goto('/?debug&timescale=3&nowaves');
  71 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  72 | 
  73 |   await page.evaluate(() => window.__GR_TEST__?.spawnPack(5, 3));
  74 |   await expect
  75 |     .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.xp ?? 0), { timeout: 15_000 })
  76 |     .toBeGreaterThan(0);
  77 |   await expect
  78 |     .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.activeFloatTexts ?? 0), {
  79 |       timeout: 2_000,
  80 |     })
  81 |     .toBeGreaterThan(0);
  82 | });
  83 | 
```