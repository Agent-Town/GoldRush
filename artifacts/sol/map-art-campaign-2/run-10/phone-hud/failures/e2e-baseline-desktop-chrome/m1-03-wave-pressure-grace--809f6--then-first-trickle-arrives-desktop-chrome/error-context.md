# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m1-03-wave-pressure.spec.ts >> grace holds pressure until sim-t 5, then first trickle arrives
- Location: e2e/m1-03-wave-pressure.spec.ts:31:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
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
          - heading "The Claim" [level=2] [ref=e9]
          - paragraph [ref=e10]: The classic river claim.
          - generic [ref=e11]:
            - generic [ref=e12]:
              - paragraph [ref=e13]: Goals
              - list [ref=e14]:
                - listitem [ref=e15]: Survive through wave 10.
            - generic [ref=e16]:
              - paragraph [ref=e17]: Rules
              - list [ref=e18]:
                - listitem [ref=e19]: The river splits the claim around one center ford.
                - listitem [ref=e20]: Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.
      - generic "Wave status":
        - generic:
          - generic: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 00:26
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - generic: Gold
        - strong: "0"
      - region "Active weapon":
        - generic: Weapon
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e21] [cursor=pointer]:
          - generic [ref=e22]:
            - generic [ref=e23]: the Prospector
            - strong [ref=e24]: L0
            - generic [ref=e25]: suggest-only
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build" [ref=e27]
      - button "Pause the claim" [ref=e28]: P - catch your breath
    - region
    - text: None None None
  - generic [ref=e29]:
    - button "▸ Game tuning" [ref=e30] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e31]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | 
  3   | type ErrorBucket = {
  4   |   consoleErrors: string[];
  5   |   pageErrors: string[];
  6   | };
  7   | 
  8   | function collectErrors(page: Page): ErrorBucket {
  9   |   const bucket: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  10  |   page.on('console', (message) => {
  11  |     if (message.type() === 'error') bucket.consoleErrors.push(message.text());
  12  |   });
  13  |   page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  14  |   return bucket;
  15  | }
  16  | 
  17  | async function openGame(page: Page, query: string): Promise<ErrorBucket> {
  18  |   const errors = collectErrors(page);
  19  |   await page.goto(`/${query}`);
  20  |   await expect(page.locator('#game-canvas')).toBeVisible();
  21  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  22  |   return errors;
  23  | }
  24  | 
  25  | async function waitForSim(page: Page, seconds: number): Promise<void> {
  26  |   await page.waitForFunction((target) => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) >= target, seconds, {
  27  |     timeout: 15_000,
  28  |   });
  29  | }
  30  | 
  31  | test('grace holds pressure until sim-t 5, then first trickle arrives', async ({ page }) => {
  32  |   const errors = await openGame(page, '?timescale=8&debug&seed=m1-03-grace&nokill');
  33  | 
  34  |   await waitForSim(page, 4.8);
> 35  |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? -1)).toBe(0);
      |                                                                                            ^ Error: expect(received).toBe(expected) // Object.is equality
  36  | 
  37  |   await waitForSim(page, 8);
  38  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0)).toBeGreaterThan(0);
  39  | 
  40  |   expect(errors.consoleErrors).toEqual([]);
  41  |   expect(errors.pageErrors).toEqual([]);
  42  | });
  43  | 
  44  | test('wave banner and diagnostics advance on the 30s cadence', async ({ page }) => {
  45  |   const errors = await openGame(page, '?timescale=8&debug&seed=m1-03-banner&nokill');
  46  |   const banner = page.getByTestId('hud-wave');
  47  | 
  48  |   await waitForSim(page, 30);
  49  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(1);
  50  |   await expect(banner).not.toContainText('Stake your claim.');
  51  | 
  52  |   await waitForSim(page, 60);
  53  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(2);
  54  | 
  55  |   expect(errors.consoleErrors).toEqual([]);
  56  |   expect(errors.pageErrors).toEqual([]);
  57  | });
  58  | 
  59  | test('spawn accounting reaches trickle plus first two wave pulses by sim-t 60', async ({ page }) => {
  60  |   const errors = await openGame(page, '?timescale=8&debug&seed=m1-03-accounting&nokill');
  61  | 
  62  |   await waitForSim(page, 60);
  63  |   const total = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0);
  64  | 
  65  |   // Implemented math at sim-t 60: roughly 20-24 trickles plus wave pulses 6 + 9.
  66  |   expect(total).toBeGreaterThanOrEqual(28);
  67  |   expect(total).toBeLessThanOrEqual(47);
  68  | 
  69  |   expect(errors.consoleErrors).toEqual([]);
  70  |   expect(errors.pageErrors).toEqual([]);
  71  | });
  72  | 
  73  | test('alive cap holds under no-kill pressure', async ({ page }) => {
  74  |   const errors = await openGame(page, '?timescale=8&debug&seed=m1-03-cap&nokill');
  75  |   let maxAlive = 0;
  76  | 
  77  |   while ((await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0)) < 92) {
  78  |     await page.waitForTimeout(300);
  79  |     const alive = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? 0);
  80  |     maxAlive = Math.max(maxAlive, alive);
  81  |     expect(alive).toBeLessThanOrEqual(60);
  82  |   }
  83  | 
  84  |   expect(maxAlive).toBeGreaterThan(50);
  85  |   expect(errors.consoleErrors).toEqual([]);
  86  |   expect(errors.pageErrors).toEqual([]);
  87  | });
  88  | 
  89  | test('resetRun mid-wave clears wave pressure and opens with the claim banner', async ({ page }) => {
  90  |   const errors = await openGame(page, '?timescale=8&debug&seed=m1-03-reset&nokill');
  91  | 
  92  |   await waitForSim(page, 40);
  93  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(1);
  94  | 
  95  |   await page.evaluate(() => window.__GR_TEST__?.resetRun());
  96  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? -1)).toBe(0);
  97  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive ?? -1)).toBe(0);
  98  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? -1)).toBe(0);
  99  |   await expect(page.getByTestId('hud-wave')).toContainText('Stake your claim.');
  100 | 
  101 |   expect(errors.consoleErrors).toEqual([]);
  102 |   expect(errors.pageErrors).toEqual([]);
  103 | });
  104 | 
```