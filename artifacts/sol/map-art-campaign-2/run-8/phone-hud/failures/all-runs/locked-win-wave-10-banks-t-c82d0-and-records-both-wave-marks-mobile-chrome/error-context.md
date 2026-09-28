# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: locked-win.spec.ts >> wave 10 banks the win; a wave 12 Rush death keeps it and records both wave marks
- Location: e2e/locked-win.spec.ts:65:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('hud-pause')
    - locator resolved to <button type="button" class="hud-pause" data-hud-pause="" data-testid="hud-pause" aria-keyshortcuts="P Escape" aria-label="Pause the claim">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="lil-title" aria-expanded="false">Game tuning</button> from <div class="lil-gui lil-root lil-allow-touch-styles lil-auto-place autoPlace lil-closed">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button class="lil-title" aria-expanded="false">Game tuning</button> from <div class="lil-gui lil-root lil-allow-touch-styles lil-auto-place autoPlace lil-closed">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    59 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button class="lil-title" aria-expanded="false">Game tuning</button> from <div class="lil-gui lil-root lil-allow-touch-styles lil-auto-place autoPlace lil-closed">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

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
          - strong: 00:32
        - generic:
          - generic: Wave
          - strong: "10"
      - region "Gold pouch":
        - strong: "0"
      - region "Active weapon":
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
          - generic [ref=e5]:
            - generic [ref=e6]: the Prospector
            - strong [ref=e7]: L1
            - generic [ref=e8]: approval-required
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build" [ref=e10]
      - button "Pause the claim" [ref=e11]: catch your breathⅡ
      - generic [ref=e12]:
        - text: Swipe to scroll
        - group [ref=e13]:
          - generic "Claim Stake" [ref=e14] [cursor=pointer]
          - paragraph [ref=e15]: The heart of the claim. Lose it and the run is done.
      - status:
        - strong: CLAIM SECURED ✓
        - generic: The win is banked.
    - generic:
      - button [ref=e18]: Rotate
      - button [ref=e19]: Weapon
      - button [ref=e20]: OK
    - generic:
      - status:
        - generic:
          - paragraph: Prospector
          - paragraph: First rung logged.
          - paragraph: I can ask before I spend a chore.
    - region
    - text: None None None
  - generic [ref=e21]:
    - button "▸ Game tuning" [ref=e22] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e23]: "Meta territory: 1 | science: 1 | hero: 1 | agent: 1 | agent autonomy: 1"
```

# Test source

```ts
  1   | import { mkdir } from 'node:fs/promises';
  2   | import path from 'node:path';
  3   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  4   | import { SCOREBOARD_KEY, profileDataKey } from '../src/game/ProfileStorage';
  5   | import { TELEMETRY_DEV_SEND_STORAGE_KEY, type RunTelemetryPayload } from '../src/telemetry/payload';
  6   | 
  7   | type Errors = { console: string[]; page: string[] };
  8   | type ScoreRow = { waves: number; secured?: boolean; secureWave?: number; deepestWave?: number };
  9   | 
  10  | const SCORE_KEY = profileDataKey('robin', SCOREBOARD_KEY);
  11  | const SHOT_DIR = path.resolve('artifacts/locked-win');
  12  | 
  13  | function collectErrors(page: Page): Errors {
  14  |   const errors: Errors = { console: [], page: [] };
  15  |   page.on('console', (message) => {
  16  |     if (message.type() === 'error') errors.console.push(message.text());
  17  |   });
  18  |   page.on('pageerror', (error) => errors.page.push(error.message));
  19  |   return errors;
  20  | }
  21  | 
  22  | async function openClaim(page: Page, seed: string, telemetry = false, dismissBriefing = true): Promise<Errors> {
  23  |   const errors = collectErrors(page);
  24  |   await page.addInitScript(
  25  |     ({ telemetryKey, telemetry }) => {
  26  |       if (sessionStorage.getItem('gr.lockedWin.initialized') !== '1') {
  27  |         localStorage.clear();
  28  |         sessionStorage.clear();
  29  |         sessionStorage.setItem('gr.lockedWin.initialized', '1');
  30  |         if (telemetry) localStorage.setItem(telemetryKey, '1');
  31  |       }
  32  |     },
  33  |     { telemetryKey: TELEMETRY_DEV_SEND_STORAGE_KEY, telemetry },
  34  |   );
  35  |   await page.goto(`/?debug&contract=the-claim&terrain2d&nowaves&nolevel&nosteal&nowreck&seed=${seed}`);
  36  |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2);
  37  |   if (dismissBriefing) await page.getByTestId('contract-briefing-dismiss').click();
  38  |   return errors;
  39  | }
  40  | 
  41  | async function secureAtTen(page: Page): Promise<void> {
  42  |   await page.evaluate(() => window.__GR_TEST__?.startWaveForTest(10));
  43  |   await expect(page.getByTestId('claim-secured')).toBeVisible();
  44  |   await expect(page.getByTestId('claim-secured')).toContainText('The win is banked');
  45  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.secured)).toBe(true);
  46  |   const scores = await readScores(page);
  47  |   expect(scores).toHaveLength(1);
  48  |   expect(scores[0]).toMatchObject({ waves: 10, secured: true, secureWave: 10, deepestWave: 10 });
  49  | }
  50  | 
  51  | async function readScores(page: Page): Promise<ScoreRow[]> {
  52  |   return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]') as ScoreRow[], SCORE_KEY);
  53  | }
  54  | 
  55  | async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  56  |   await mkdir(SHOT_DIR, { recursive: true });
  57  |   await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
  58  | }
  59  | 
  60  | function expectClean(errors: Errors): void {
  61  |   expect(errors.console).toEqual([]);
  62  |   expect(errors.page).toEqual([]);
  63  | }
  64  | 
  65  | test('wave 10 banks the win; a wave 12 Rush death keeps it and records both wave marks', async ({ page }, testInfo) => {
  66  |   const posts: RunTelemetryPayload[] = [];
  67  |   await page.route('**/api/telemetry', async (route) => {
  68  |     posts.push(JSON.parse(route.request().postData() ?? '{}') as RunTelemetryPayload);
  69  |     await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  70  |   });
  71  |   const errors = await openClaim(page, `locked-win-rush-${testInfo.project.name}`, true);
  72  |   await secureAtTen(page);
  73  |   await expect.poll(() => posts.length).toBe(1);
  74  |   expect(posts[0]).toMatchObject({ stage: 'secure', waves: 10, secureWave: 10, deepestWave: 10 });
  75  | 
  76  |   await page.getByTestId('stay-for-rush').click();
  77  |   await expect(page.getByTestId('claim-secured-chip')).toBeVisible();
  78  |   await expect(page.getByTestId('claim-secured-chip')).toContainText('CLAIM SECURED ✓');
  79  |   await expect(page.getByTestId('claim-secured-chip')).toContainText('The win is banked');
> 80  |   await page.getByTestId('hud-pause').click();
      |                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  81  |   await expect(page.getByTestId('claim-secured-chip')).toBeVisible();
  82  |   await page.getByTestId('hud-pause').click();
  83  |   await page.evaluate(() => window.__GR_TEST__?.startWaveForTest(11));
  84  |   await shot(page, testInfo, 'secured-chip-mid-rush');
  85  | 
  86  |   await page.reload();
  87  |   await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true);
  88  |   await expect(page.getByTestId('claim-secured-chip')).toBeVisible();
  89  |   expect(await readScores(page)).toHaveLength(1);
  90  |   await page.evaluate(() => window.__GR_TEST__?.startWaveForTest(12));
  91  | 
  92  |   await page.evaluate(() => window.__GR_TEST__?.endRunForTest());
  93  |   await expect(page.getByTestId('death-overlay')).toBeVisible();
  94  |   await expect(page.getByTestId('run-outcome-copy')).toContainText('The claim held. The Rush took the rest');
  95  |   await expect(page.getByTestId('best-claim-row').first()).toContainText('SECURED');
  96  |   await expect(page.getByTestId('best-claim-row').first()).toContainText('secured wave 10 · deepest wave 12');
  97  |   await expect(page.getByTestId('claim-secured-chip')).toHaveCount(0);
  98  |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.lastRunEndedReason)).toBe('rush');
  99  |   await expect.poll(() => posts.length).toBe(2);
  100 |   expect(posts[1]).toMatchObject({ stage: 'end', waves: 12, secureWave: 10, deepestWave: 12 });
  101 |   expect(await readScores(page)).toEqual([
  102 |     expect.objectContaining({ waves: 12, secured: true, secureWave: 10, deepestWave: 12 }),
  103 |   ]);
  104 |   await shot(page, testInfo, 'summary-after-rush-death');
  105 |   expectClean(errors);
  106 | });
  107 | 
  108 | test('leaving at secure follows the full victory ledger flow', async ({ page }, testInfo) => {
  109 |   const errors = await openClaim(page, `locked-win-leave-${testInfo.project.name}`);
  110 |   await secureAtTen(page);
  111 |   await page.getByTestId('bank-secured-claim').click();
  112 | 
  113 |   await expect(page.getByTestId('death-overlay')).toBeVisible();
  114 |   await expect(page.getByTestId('run-outcome-copy')).toContainText('The assay is sealed');
  115 |   await expect(page.getByTestId('best-claim-row').first()).toContainText('secured wave 10 · deepest wave 10');
  116 |   await expect(page.getByTestId('stake-again')).toHaveText('Return to Town');
  117 |   await expect(page.getByTestId('run-secondary-action')).toHaveText('New Claim');
  118 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.lastRunEndedReason)).toBe('secured');
  119 |   expectClean(errors);
  120 | });
  121 | 
  122 | test('The Claim card names wave 10 while Night Shift and Baron keep their tuned secure waves', async ({ page, context }) => {
  123 |   const errors = await openClaim(page, 'locked-win-contracts', false, false);
  124 |   const claim = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  125 |   expect(claim?.secureWave).toBe(10);
  126 |   expect(claim?.briefing.goals).toEqual(['Survive through wave 10.']);
  127 |   expect(claim?.briefing.rules).toContain(
  128 |     'Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.',
  129 |   );
  130 |   await expect(page.getByTestId('contract-briefing-goals')).toContainText('Survive through wave 10.');
  131 |   await expect(page.getByTestId('contract-briefing-rules')).toContainText('wave 10 seals the claim');
  132 | 
  133 |   const nightPage = await context.newPage();
  134 |   const nightErrors = collectErrors(nightPage);
  135 |   await nightPage.goto('/?debug&contract=e1-night-shift&terrain2d&nowaves&nolevel&seed=locked-win-night');
  136 |   await nightPage.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2);
  137 |   expect(await nightPage.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.secureWave)).toBe(25);
  138 | 
  139 |   const baronPage = await context.newPage();
  140 |   const baronErrors = collectErrors(baronPage);
  141 |   await baronPage.goto('/?debug&contract=e1-baron&terrain2d&nowaves&nolevel&seed=locked-win-baron');
  142 |   await baronPage.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 2);
  143 |   expect(await baronPage.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.secureWave)).toBe(20);
  144 |   expectClean(errors);
  145 |   expectClean(nightErrors);
  146 |   expectClean(baronErrors);
  147 | });
  148 | 
```