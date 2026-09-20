# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m1-01-claim-jumpers-death.spec.ts >> double restart recycles enemies without geometry growth
- Location: e2e/m1-01-claim-jumpers-death.spec.ts:83:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "dead"
Received: "playing"

Call Log:
- Test timeout of 30000ms exceeded
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
          - strong: 01:27
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
      - generic:
        - status:
          - strong: Claim Stake
          - paragraph: The heart of the claim. Lose it and the run is done.
    - region
    - text: None None None
  - generic [ref=e12]:
    - button "▸ Game tuning" [ref=e13] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e14]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | 
  3   | async function waitForGame(page: Page, url: string): Promise<void> {
  4   |   await page.goto(url);
  5   |   await expect(page.locator('#game-canvas')).toBeVisible();
  6   |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  7   | }
  8   | 
  9   | function collectPageErrors(page: Page): { consoleErrors: string[]; pageErrors: string[] } {
  10  |   const consoleErrors: string[] = [];
  11  |   const pageErrors: string[] = [];
  12  |   page.on('console', (message) => {
  13  |     if (message.type() === 'error') consoleErrors.push(message.text());
  14  |   });
  15  |   page.on('pageerror', (error) => pageErrors.push(error.message));
  16  |   return { consoleErrors, pageErrors };
  17  | }
  18  | 
  19  | async function spawnDebugPack(page: Page): Promise<void> {
  20  |   await page.keyboard.press('KeyT');
  21  | }
  22  | 
  23  | async function waitForDeath(page: Page): Promise<void> {
  24  |   await expect
  25  |     .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state), { timeout: 25_000 })
> 26  |     .toBe('dead');
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  27  | }
  28  | 
  29  | test('T spawns Claim Jumpers, contact kills hero, R restarts in place', async ({ page }) => {
  30  |   const errors = collectPageErrors(page);
  31  |   await waitForGame(page, '/?debug&nowaves&nolevel');
  32  | 
  33  |   // Since m1/02 the Spark Rig fights back: overwhelm immediately so contact
  34  |   // damage outpaces the rig (iframes cap intake at ~16 dmg/s -> death ~6.5s).
  35  |   await spawnDebugPack(page);
  36  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBeGreaterThan(0);
  37  |   for (let i = 0; i < 5; i += 1) {
  38  |     await spawnDebugPack(page);
  39  |   }
  40  | 
  41  |   await expect
  42  |     .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 100), { timeout: 10_000 })
  43  |     .toBeLessThan(100);
  44  | 
  45  |   await waitForDeath(page);
  46  |   await expect(page.getByTestId('death-overlay')).toBeVisible();
  47  |   await expect(page.getByTestId('stake-again')).toContainText('Return to Town');
  48  |   await expect(page.getByTestId('run-secondary-action')).toContainText('Try Again');
  49  | 
  50  |   await page.keyboard.press('KeyR');
  51  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
  52  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
  53  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp)).toBe(100);
  54  | 
  55  |   expect(errors.consoleErrors).toEqual([]);
  56  |   expect(errors.pageErrors).toEqual([]);
  57  | });
  58  | 
  59  | test('T does not spawn Claim Jumpers without debug consent', async ({ page }) => {
  60  |   const errors = collectPageErrors(page);
  61  |   await waitForGame(page, '/?nowaves&nolevel');
  62  | 
  63  |   const frame = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  64  |   await spawnDebugPack(page);
  65  |   await page.waitForFunction((before) => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > before, frame);
  66  | 
  67  |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
  68  |   expect(errors.consoleErrors).toEqual([]);
  69  |   expect(errors.pageErrors).toEqual([]);
  70  | });
  71  | 
  72  | test('nospawn blocks debug packs', async ({ page }) => {
  73  |   await page.goto('/?nospawn&nowaves');
  74  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  75  | 
  76  |   await spawnDebugPack(page);
  77  |   await page.waitForTimeout(250);
  78  | 
  79  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spawnDisabled)).toBe(true);
  80  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
  81  | });
  82  | 
  83  | test('double restart recycles enemies without geometry growth', async ({ page }) => {
  84  |   await page.goto('/?debug&timescale=4&nowaves&nolevel');
  85  |   await expect(page.locator('#game-canvas')).toBeVisible();
  86  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  87  |   // Warm the float-text pool first: kills during the swarm drop xp motes whose
  88  |   // pickup floats would otherwise lazily upload sprite geometry mid-test.
  89  |   await page.evaluate(() => window.__GR_TEST__?.warmVfx());
  90  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  91  |   const baseline = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer.geometries ?? 0);
  92  | 
  93  |   for (let cycle = 0; cycle < 3; cycle += 1) {
  94  |     // Keyboard KeyT spam collapses at headless fps (edge-triggered intents) and
  95  |     // since m1/02 the rig can out-kill a thin spawn; use the harness instead.
  96  |     await page.evaluate(() => {
  97  |       for (let pack = 0; pack < 5; pack += 1) window.__GR_TEST__?.spawnPack(5);
  98  |     });
  99  |     await waitForDeath(page);
  100 |     await page.keyboard.press('KeyR');
  101 |     await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
  102 |     await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
  103 |   }
  104 | 
  105 |   const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer.geometries ?? 0);
  106 |   expect(after).toBe(baseline);
  107 | });
  108 | 
  109 | test('stress=120 stays within pool and draw-call budget', async ({ page }) => {
  110 |   // F-028-1 (s49): &nokill added — 024-era damage tuning made the rig kill stress
  111 |   // enemies inside the settle window (96 -> 95 -> 94 decay, probed on pure HEAD),
  112 |   // so the exact pool-cap identity below was racing live combat. This test's intent
  113 |   // is pool cap + spawn integrity + draw calls + fps, NOT kill rate; nokill freezes
  114 |   // combat damage (proven harness flag, task-025/m2-05b precedent) and restores the
  115 |   // deterministic ===96. This red also fired lane-d's r2 "equivalence broken" verdict
  116 |   // on Mac — that evidence is retracted (see reviews/m6-actors-foundation-r2.md addendum).
  117 |   await page.goto('/?stress=120&nowaves&nokill');
  118 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  119 | 
  120 |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  121 |   await page.waitForTimeout(1_000);
  122 |   const snapshot = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  123 |   const frames = (snapshot?.frame ?? 0) - before;
  124 | 
  125 |   expect(snapshot?.stressCount).toBe(120);
  126 |   expect(snapshot?.enemiesAlive).toBe(96);
```