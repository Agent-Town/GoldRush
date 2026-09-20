# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m1-01-claim-jumpers-death.spec.ts >> T spawns Claim Jumpers, contact kills hero, R restarts in place
- Location: e2e/m1-01-claim-jumpers-death.spec.ts:29:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
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
        - strong: 00:13
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
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | 
  3   | async function waitForGame(page: Page): Promise<void> {
  4   |   await page.goto('/?nowaves&nolevel');
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
  26  |     .toBe('dead');
  27  | }
  28  | 
  29  | test('T spawns Claim Jumpers, contact kills hero, R restarts in place', async ({ page }) => {
  30  |   const errors = collectPageErrors(page);
  31  |   await waitForGame(page);
  32  | 
  33  |   // Since m1/02 the Spark Rig fights back: overwhelm immediately so contact
  34  |   // damage outpaces the rig (iframes cap intake at ~16 dmg/s -> death ~6.5s).
  35  |   await spawnDebugPack(page);
> 36  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBeGreaterThan(0);
      |                                                                                                       ^ Error: expect(received).toBeGreaterThan(expected)
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
  59  | test('nospawn blocks debug packs', async ({ page }) => {
  60  |   await page.goto('/?nospawn&nowaves');
  61  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  62  | 
  63  |   await spawnDebugPack(page);
  64  |   await page.waitForTimeout(250);
  65  | 
  66  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.spawnDisabled)).toBe(true);
  67  |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
  68  | });
  69  | 
  70  | test('double restart recycles enemies without geometry growth', async ({ page }) => {
  71  |   await page.goto('/?debug&timescale=4&nowaves&nolevel');
  72  |   await expect(page.locator('#game-canvas')).toBeVisible();
  73  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  74  |   // Warm the float-text pool first: kills during the swarm drop xp motes whose
  75  |   // pickup floats would otherwise lazily upload sprite geometry mid-test.
  76  |   await page.evaluate(() => window.__GR_TEST__?.warmVfx());
  77  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  78  |   const baseline = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer.geometries ?? 0);
  79  | 
  80  |   for (let cycle = 0; cycle < 3; cycle += 1) {
  81  |     // Keyboard KeyT spam collapses at headless fps (edge-triggered intents) and
  82  |     // since m1/02 the rig can out-kill a thin spawn; use the harness instead.
  83  |     await page.evaluate(() => {
  84  |       for (let pack = 0; pack < 5; pack += 1) window.__GR_TEST__?.spawnPack(5);
  85  |     });
  86  |     await waitForDeath(page);
  87  |     await page.keyboard.press('KeyR');
  88  |     await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
  89  |     await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemiesAlive)).toBe(0);
  90  |   }
  91  | 
  92  |   const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.renderer.geometries ?? 0);
  93  |   expect(after).toBe(baseline);
  94  | });
  95  | 
  96  | test('stress=120 stays within pool and draw-call budget', async ({ page }) => {
  97  |   // F-028-1 (s49): &nokill added — 024-era damage tuning made the rig kill stress
  98  |   // enemies inside the settle window (96 -> 95 -> 94 decay, probed on pure HEAD),
  99  |   // so the exact pool-cap identity below was racing live combat. This test's intent
  100 |   // is pool cap + spawn integrity + draw calls + fps, NOT kill rate; nokill freezes
  101 |   // combat damage (proven harness flag, task-025/m2-05b precedent) and restores the
  102 |   // deterministic ===96. This red also fired lane-d's r2 "equivalence broken" verdict
  103 |   // on Mac — that evidence is retracted (see reviews/m6-actors-foundation-r2.md addendum).
  104 |   await page.goto('/?stress=120&nowaves&nokill');
  105 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 20);
  106 | 
  107 |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0);
  108 |   await page.waitForTimeout(1_000);
  109 |   const snapshot = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  110 |   const frames = (snapshot?.frame ?? 0) - before;
  111 | 
  112 |   expect(snapshot?.stressCount).toBe(120);
  113 |   expect(snapshot?.enemiesAlive).toBe(96);
  114 |   expect(snapshot?.renderer.calls ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(200);
  115 |   // Headless SwiftShader renders this scene at ~17-22 fps regardless of entity count
  116 |   // (pre-M1 empty-scene baseline: 22). This floor catches sim-cost explosions only;
  117 |   // the real 60 fps gate runs on hardware at milestone playtests (CLAUDE.md §9).
  118 |   expect(frames).toBeGreaterThanOrEqual(12);
  119 | });
  120 | 
```