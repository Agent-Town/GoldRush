# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: trail-guide.spec.ts >> first build-menu open teaches once, survives reload, and stays off for veterans
- Location: e2e/trail-guide.spec.ts:128:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByTestId('story-beat-card')
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for getByTestId('story-beat-card')
    14 × locator resolved to 1 element
       - unexpected value "1"

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
          - strong: 00:05
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - generic: Gold
        - strong: "10"
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
        - generic [ref=e9]:
          - generic [ref=e10]:
            - status [ref=e11]:
              - strong [ref=e12]: Sentry Beacon
              - generic [ref=e13]: Lights the dark and slows what it touches; radius 8wu.
            - menuitem "1 Sentry Beacon 0/6 - 25g" [disabled] [ref=e14]:
              - generic [ref=e16]:
                - text: "1"
                - generic [ref=e17]: Sentry Beacon
                - text: 0/6 - 25g
            - menuitem "2 Palisade 0/48 - 10g" [ref=e18]:
              - generic [ref=e20]:
                - text: "2"
                - generic [ref=e21]: Palisade
                - text: 0/48 - 10g
            - menuitem "3 Sluice Works 0/3 - 40g" [disabled] [ref=e22]:
              - generic [ref=e24]:
                - text: "3"
                - generic [ref=e25]: Sluice Works
                - text: 0/3 - 40g
            - menuitem "4 Stockpile Yard 0/2 - 60g" [disabled] [ref=e26]:
              - generic [ref=e28]:
                - text: "4"
                - generic [ref=e29]: Stockpile Yard
                - text: 0/2 - 60g
            - menuitem "5 Signal Turret 0/4 - 50g" [disabled] [ref=e30]:
              - generic [ref=e32]:
                - text: "5"
                - generic [ref=e33]: Signal Turret
                - text: 0/4 - 50g
            - menuitem "6 Assay Office 0/1 - 80g" [disabled] [ref=e34]:
              - generic [ref=e36]:
                - text: "6"
                - generic [ref=e37]: Assay Office
                - text: 0/1 - 80g
          - button "Build - Close" [expanded] [pressed] [ref=e38]
      - button "Pause the claim" [ref=e39]: P - catch your breath
    - region
    - text: None None None
  - generic [ref=e40]:
    - button "▸ Game tuning" [ref=e41] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e42]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import { PROFILE_KEY, type ProfileState } from '../src/game/ProfileStorage';
  3   | 
  4   | type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
  5   | 
  6   | function collectErrors(page: Page): ErrorBucket {
  7   |   const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  8   |   page.on('console', (message) => {
  9   |     if (message.type() === 'error') errors.consoleErrors.push(message.text());
  10  |   });
  11  |   page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  12  |   return errors;
  13  | }
  14  | 
  15  | async function seedRunProfile(page: Page, trailGuide: boolean): Promise<void> {
  16  |   await page.addInitScript(
  17  |     ({ profileKey, enrolled }) => {
  18  |       Date.now = () => (window as unknown as { __TRAIL_NOW__?: number }).__TRAIL_NOW__ ?? 1_000_000;
  19  |       if (localStorage.getItem(profileKey)) return;
  20  |       const state: ProfileState = {
  21  |         version: 2,
  22  |         activeId: 'robin',
  23  |         profiles: [
  24  |           {
  25  |             id: 'robin',
  26  |             name: 'Robin',
  27  |             createdAt: 1,
  28  |             updatedAt: 1,
  29  |             difficultyPreset: 'trail',
  30  |             hintsSeen: [],
  31  |             ...(enrolled ? { trailGuide: true as const } : {}),
  32  |           },
  33  |         ],
  34  |       };
  35  |       localStorage.setItem(profileKey, JSON.stringify(state));
  36  |     },
  37  |     { profileKey: PROFILE_KEY, enrolled: trailGuide },
  38  |   );
  39  | }
  40  | 
  41  | async function openRun(
  42  |   page: Page,
  43  |   path = '/?debug&contract=the-claim&nospawn&nolevel',
  44  |   manualSim = true,
  45  | ): Promise<void> {
  46  |   await page.goto(path);
  47  |   await page.waitForFunction(() => window.__GR_STORY__ && window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  48  |   if (manualSim) await page.evaluate(() => window.__GR_TEST__?.setManualSim(true));
  49  | }
  50  | 
  51  | async function expectBark(page: Page, text: string): Promise<void> {
  52  |   await expect(page.getByTestId('hud-agent-feed')).toContainText(text);
> 53  |   await expect(page.getByTestId('story-beat-card')).toHaveCount(0);
      |                                                     ^ Error: expect(locator).toHaveCount(expected) failed
  54  | }
  55  | 
  56  | async function approachFirstSeam(page: Page, seconds: number): Promise<void> {
  57  |   await page.evaluate((duration) => {
  58  |     const node = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes[0]?.position;
  59  |     if (!node || !window.__GR_TEST__) throw new Error('No first seam available.');
  60  |     window.__GR_TEST__.teleport(node.x, node.z);
  61  |     window.__GR_TEST__.advanceSim(duration);
  62  |   }, seconds);
  63  | }
  64  | 
  65  | async function guideHints(page: Page): Promise<string[]> {
  66  |   return page.evaluate((key) => {
  67  |     const state = JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState;
  68  |     return state.profiles[0]?.hintsSeen.filter((hint) => hint.startsWith('story:trail-guide-')) ?? [];
  69  |   }, PROFILE_KEY);
  70  | }
  71  | 
  72  | async function makeVeteranProfile(page: Page): Promise<void> {
  73  |   await page.evaluate((key) => {
  74  |     const state = JSON.parse(localStorage.getItem(key) ?? '{}') as ProfileState;
  75  |     const profile = state.profiles.find((entry) => entry.id === state.activeId);
  76  |     if (!profile) throw new Error('No active profile.');
  77  |     delete profile.trailGuide;
  78  |     profile.hintsSeen = [];
  79  |     localStorage.setItem(key, JSON.stringify(state));
  80  |   }, PROFILE_KEY);
  81  | }
  82  | 
  83  | async function triggerTheft(page: Page): Promise<void> {
  84  |   await expect(page.evaluate(() => window.__GR_TEST__?.setBalance('stockpile.cost', 0))).resolves.toBe(true);
  85  |   await page.evaluate(() => window.__GR_TEST__?.teleport(3, 14));
  86  |   await page.evaluate(() => window.__GR_TEST__?.selectBuildable('stockpile'));
  87  |   await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  88  |   await expect.poll(() =>
  89  |     page.evaluate(() => window.__GR_TEST__?.state().buildables.find((entry) => entry.id === 'stockpile')?.count ?? 0),
  90  |   ).toBe(1);
  91  |   await page.evaluate(() => window.__GR_TEST__?.grantGold(100));
  92  |   await page.evaluate(() => window.__GR_TEST__?.teleport(3, -5));
  93  |   await expect(page.evaluate(() => window.__GR_TEST__?.spawnThief('north'))).resolves.toBe(true);
  94  |   await expect.poll(() =>
  95  |     page.evaluate(() => window.__GR_TEST__?.economyLog().filter((event) => (event as { type?: string }).type === 'gold_stolen').length ?? 0),
  96  |     { timeout: 10_000 },
  97  |   ).toBeGreaterThan(0);
  98  | }
  99  | 
  100 | test('fresh profile sees the first three trail beats once, in order, and reload stays quiet', async ({ page }) => {
  101 |   test.setTimeout(60_000);
  102 |   await seedRunProfile(page, true);
  103 |   const errors = collectErrors(page);
  104 |   await openRun(page);
  105 | 
  106 |   await expectBark(page, 'Move with the trail');
  107 |   await page.keyboard.press('ArrowRight');
  108 |   await expect(page.getByTestId('hud-agent-feed')).toBeEmpty();
  109 |   await approachFirstSeam(page, 0.2);
  110 |   await expectBark(page, 'Raise a sluice beside water');
  111 |   await approachFirstSeam(page, 4);
  112 |   await expectBark(page, 'Open Build');
  113 | 
  114 |   expect(await guideHints(page)).toEqual([
  115 |     'story:trail-guide-first-run',
  116 |     'story:trail-guide-first-nugget',
  117 |     'story:trail-guide-first-gold',
  118 |   ]);
  119 | 
  120 |   await page.reload();
  121 |   await page.waitForFunction(() => window.__GR_STORY__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  122 |   await page.waitForTimeout(300);
  123 |   await expect(page.getByTestId('hud-agent-feed')).not.toContainText(/Move with the trail|Raise a sluice|Open Build/);
  124 |   expect(await guideHints(page)).toHaveLength(3);
  125 |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  126 | });
  127 | 
  128 | test('first build-menu open teaches once, survives reload, and stays off for veterans', async ({ page }) => {
  129 |   test.setTimeout(60_000);
  130 |   await seedRunProfile(page, true);
  131 |   const errors = collectErrors(page);
  132 |   await openRun(page);
  133 | 
  134 |   await page.keyboard.press('ArrowRight');
  135 |   await approachFirstSeam(page, 0.2);
  136 |   await page.keyboard.press('ArrowRight');
  137 |   await approachFirstSeam(page, 4);
  138 |   await expectBark(page, 'Open Build');
  139 |   await page.getByTestId('hud-build').click();
  140 |   await expectBark(page, 'Every line here names its price');
  141 |   await expect(page.getByTestId('hud-agent-feed')).not.toContainText('Open Build');
  142 |   expect(await guideHints(page)).toContain('story:trail-guide-first-build-menu');
  143 | 
  144 |   await page.getByTestId('hud-build').click();
  145 |   await page.getByTestId('hud-build').click();
  146 |   await expect(page.getByTestId('hud-agent-feed')).not.toContainText('Every line here names its price');
  147 | 
  148 |   await openRun(page);
  149 |   await page.getByTestId('hud-build').click();
  150 |   await expect(page.getByTestId('hud-agent-feed')).not.toContainText('Every line here names its price');
  151 | 
  152 |   await makeVeteranProfile(page);
  153 |   await openRun(page);
```