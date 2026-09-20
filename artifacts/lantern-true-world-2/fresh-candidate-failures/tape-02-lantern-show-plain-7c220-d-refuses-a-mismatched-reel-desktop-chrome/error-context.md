# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tape-02-lantern-show.spec.ts >> plain town WATCH replays a fresh tape read-only and refuses a mismatched reel
- Location: e2e/tape-02-lantern-show.spec.ts:10:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

  Object {
-   "console": Array [],
+   "console": Array [
+     "THREE.GLTFLoader: Couldn't load texture blob:http://127.0.0.1:5189/04073b9f-1f15-443c-8325-46eb3e757e20",
+   ],
    "page": Array [],
  }
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - region "Town square":
    - generic:
      - generic:
        - strong: Quartz Hill
        - generic: Town Square
      - generic [ref=e4]:
        - group [ref=e5]:
          - generic "Settings" [ref=e6] [cursor=pointer]
        - button "Read Issue No. 1 of The Claim Herald" [ref=e7] [cursor=pointer]:
          - generic [ref=e8]: Issue No. 1
          - text: Claim Herald
        - button "Exit" [ref=e9] [cursor=pointer]
    - region "Schoolhouse research chart":
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]:
            - paragraph [ref=e13]: Schoolhouse
            - heading "Elder's Survey Chart" [level=2] [ref=e14]
          - button "Back" [ref=e15] [cursor=pointer]
          - button "Claim Ledger" [ref=e16] [cursor=pointer]
          - button "Tape Shelf" [ref=e17] [cursor=pointer]
        - generic [ref=e19]:
          - generic [ref=e20]:
            - generic [ref=e21]:
              - paragraph [ref=e22]: The Elder's Survey Chart
              - heading "Research Ledger" [level=2] [ref=e23]
            - paragraph [ref=e24]: "Science: 0 steps - 6 to the Steamworks"
          - generic [ref=e25]:
            - generic [ref=e26]:
              - generic [ref=e27]:
                - heading "sluice works mining economy" [level=3] [ref=e28]:
                  - img "sluice works" [ref=e29]
                  - generic [ref=e30]: mining economy
                - generic [ref=e31]:
                  - button "prospecting glass available Assay Grading Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight." [ref=e32] [cursor=pointer]:
                    - generic [ref=e33]:
                      - img "prospecting glass" [ref=e34]
                      - generic [ref=e35]: available
                    - strong [ref=e36]: Assay Grading
                    - generic [ref=e37]: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight.
                  - button "gold seam locked Mother Lode Survey The Assay Office has not certified this technique yet. Requires Assay Grading" [ref=e39] [cursor=pointer]:
                    - generic [ref=e40]:
                      - img "gold seam" [ref=e41]
                      - generic [ref=e42]: locked
                    - strong [ref=e43]: Mother Lode Survey
                    - generic [ref=e44]: The Assay Office has not certified this technique yet.
                    - emphasis [ref=e45]: Requires Assay Grading
                  - button "sluice works locked Sluice Accounting The Assay Office has not certified this technique yet. Requires Mother Lode Survey" [ref=e47] [cursor=pointer]:
                    - generic [ref=e48]:
                      - img "sluice works" [ref=e49]
                      - generic [ref=e50]: locked
                    - strong [ref=e51]: Sluice Accounting
                    - generic [ref=e52]: The Assay Office has not certified this technique yet.
                    - emphasis [ref=e53]: Requires Mother Lode Survey
                  - button "gold pan locked Claim Map Table The Assay Office has not certified this technique yet. Requires Sluice Accounting" [ref=e55] [cursor=pointer]:
                    - generic [ref=e56]:
                      - img "gold pan" [ref=e57]
                      - generic [ref=e58]: locked
                    - strong [ref=e59]: Claim Map Table
                    - generic [ref=e60]: The Assay Office has not certified this technique yet.
                    - emphasis [ref=e61]: Requires Sluice Accounting
                  - 'button "prospecting glass locked Pact Ledger Adds Rich Seam Pact to run offers: 10% slower panning, +18 gold per seam. Requires Assay Grading" [ref=e63] [cursor=pointer]':
                    - generic [ref=e64]:
                      - img "prospecting glass" [ref=e65]
                      - generic [ref=e66]: locked
                    - strong [ref=e67]: Pact Ledger
                    - generic [ref=e68]: "Adds Rich Seam Pact to run offers: 10% slower panning, +18 gold per seam."
                    - emphasis [ref=e69]: Requires Assay Grading
              - generic [ref=e70]:
                - heading "sentry beacon arsenal" [level=3] [ref=e71]:
                  - img "sentry beacon" [ref=e72]
                  - generic [ref=e73]: arsenal
                - generic [ref=e74]:
                  - 'button "volley rig available Chain Spark Primer Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate." [ref=e75] [cursor=pointer]':
                    - generic [ref=e76]:
                      - img "volley rig" [ref=e77]
                      - generic [ref=e78]: available
                    - strong [ref=e79]: Chain Spark Primer
                    - generic [ref=e80]: "Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate."
                  - 'button "beacon locked Beacon Cadence Adds Beacon Handoff to run offers: +6% fire rate, +18% beacon fire rate. Requires Chain Spark Primer" [ref=e82] [cursor=pointer]':
                    - generic [ref=e83]:
                      - img "beacon" [ref=e84]
                      - generic [ref=e85]: locked
                    - strong [ref=e86]: Beacon Cadence
                    - generic [ref=e87]: "Adds Beacon Handoff to run offers: +6% fire rate, +18% beacon fire rate."
                    - emphasis [ref=e88]: Requires Chain Spark Primer
                  - button "sentry beacon locked Brass Coil Standards The Assay Office has not certified this technique yet. Requires Beacon Cadence" [ref=e90] [cursor=pointer]:
                    - generic [ref=e91]:
                      - img "sentry beacon" [ref=e92]
                      - generic [ref=e93]: locked
                    - strong [ref=e94]: Brass Coil Standards
                    - generic [ref=e95]: The Assay Office has not certified this technique yet.
                    - emphasis [ref=e96]: Requires Beacon Cadence
                  - button "rocket burst locked Powder Math The Assay Office has not certified this technique yet. Requires Brass Coil Standards" [ref=e98] [cursor=pointer]:
                    - generic [ref=e99]:
                      - img "rocket burst" [ref=e100]
                      - generic [ref=e101]: locked
                    - strong [ref=e102]: Powder Math
                    - generic [ref=e103]: The Assay Office has not certified this technique yet.
                    - emphasis [ref=e104]: Requires Brass Coil Standards
                  - 'button "volley rig locked Sky-Rocket Battery Unlocks the Steamworks Sky-Rocket Battery after the Baron medal: 3 rockets, 18 damage each, 2.25m burst radius. The Baron still holds this science. Requires Beacon Cadence" [ref=e106] [cursor=pointer]':
                    - generic [ref=e107]:
                      - img "volley rig" [ref=e108]
                      - generic [ref=e109]: locked
                    - strong [ref=e110]: Sky-Rocket Battery
                    - generic [ref=e111]: "Unlocks the Steamworks Sky-Rocket Battery after the Baron medal: 3 rockets, 18 damage each, 2.25m burst radius."
                    - emphasis [ref=e112]: The Baron still holds this science.
                    - emphasis [ref=e113]: Requires Beacon Cadence
                  - button "rush route locked Rush Pattern The Assay Office has not certified this technique yet. Requires Powder Math" [ref=e115] [cursor=pointer]:
                    - generic [ref=e116]:
                      - img "rush route" [ref=e117]
                      - generic [ref=e118]: locked
                    - strong [ref=e119]: Rush Pattern
                    - generic [ref=e120]: The Assay Office has not certified this technique yet.
                    - emphasis [ref=e121]: Requires Powder Math
              - generic [ref=e122]:
                - heading "the Prospector crafting & agent" [level=3] [ref=e123]:
                  - img "the Prospector" [ref=e124]
                  - generic [ref=e125]: crafting & agent
                - generic [ref=e126]:
                  - button "bench work available Second Order Slot Pending Assay orders rise from 1 to 2." [ref=e127] [cursor=pointer]:
                    - generic [ref=e128]:
                      - img "bench work" [ref=e129]
                      - generic [ref=e130]: available
                    - strong [ref=e131]: Second Order Slot
                    - generic [ref=e132]: Pending Assay orders rise from 1 to 2.
                  - 'button "prospecting glass locked Refined Assay Assay orders reach tier 2: 3.6/6/9.6 stat budgets. Requires Second Order Slot" [ref=e134] [cursor=pointer]':
                    - generic [ref=e135]:
                      - img "prospecting glass" [ref=e136]
                      - generic [ref=e137]: locked
                    - strong [ref=e138]: Refined Assay
                    - generic [ref=e139]: "Assay orders reach tier 2: 3.6/6/9.6 stat budgets."
                    - emphasis [ref=e140]: Requires Second Order Slot
                  - button "survey range locked Pattern Library Assay orders reach tier 3; up to 2 crafted cards can appear in each run offer. Requires Refined Assay" [ref=e142] [cursor=pointer]:
                    - generic [ref=e143]:
                      - img "survey range" [ref=e144]
                      - generic [ref=e145]: locked
                    - strong [ref=e146]: Pattern Library
                    - generic [ref=e147]: Assay orders reach tier 3; up to 2 crafted cards can appear in each run offer.
                    - emphasis [ref=e148]: Requires Refined Assay
                  - 'button "beacon locked Agent Schooling Adds Agent Schooling to run offers after wave 15: +1 Prospector policy slot this run. Requires Pattern Library" [ref=e150] [cursor=pointer]':
                    - generic [ref=e151]:
                      - img "beacon" [ref=e152]
                      - generic [ref=e153]: locked
                    - strong [ref=e154]: Agent Schooling
                    - generic [ref=e155]: "Adds Agent Schooling to run offers after wave 15: +1 Prospector policy slot this run."
                    - emphasis [ref=e156]: Requires Pattern Library
                  - button "the Prospector locked Prospector Lessons The Assay Office has not certified this technique yet. Requires Agent Schooling" [ref=e158] [cursor=pointer]:
                    - generic [ref=e159]:
                      - img "the Prospector" [ref=e160]
                      - generic [ref=e161]: locked
                    - strong [ref=e162]: Prospector Lessons
                    - generic [ref=e163]: The Assay Office has not certified this technique yet.
                    - emphasis [ref=e164]: Requires Agent Schooling
              - region "Steamworks awaits the town" [ref=e165]:
                - generic [ref=e166]: Steamworks
                - strong [ref=e167]: awaits the town
            - complementary [ref=e168]:
              - paragraph [ref=e169]: Pinned route
              - heading "Survey Route" [level=3] [ref=e170]
              - paragraph [ref=e171]: No route pinned.
  - dialog "Run tape shelf" [ref=e172]:
    - generic [ref=e173]:
      - generic [ref=e174]:
        - generic [ref=e175]:
          - paragraph [ref=e176]: Schoolhouse Lantern Room
          - heading "Run Tape Shelf" [level=2] [ref=e177]
        - button "Back" [ref=e178]
      - paragraph [ref=e179]: This projectionist cannot thread a reel cut for another machine. The show stays dark, but the reel remains on the shelf.
      - list [ref=e180]:
        - listitem [ref=e181]:
          - paragraph [ref=e182]: Sep 5, 2026
          - heading "the-claim" [level=3] [ref=e183]
          - generic [ref=e184]: OVERRUN · wave 0 · 0:20 · KEPT
          - button "WATCH" [active] [ref=e185]
```

# Test source

```ts
  1   | import { mkdir } from 'node:fs/promises';
  2   | import path from 'node:path';
  3   | import { expect, test, type Page, type TestInfo } from '@playwright/test';
  4   | import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, TOWN_WELCOME_SEEN_KEY, profileDataKey, type ProfileState } from '../src/game/ProfileStorage';
  5   | import { RUN_TAPES_KEY, RUN_TAPE_SIM_VERSION, type RunTape } from '../src/game/RunTape';
  6   | import { LANTERN_VERSION_REFUSAL } from '../src/ui/LanternShow';
  7   | 
  8   | const SHOT_DIR = path.resolve('reviews/shots-tape-02');
  9   | 
  10  | test('plain town WATCH replays a fresh tape read-only and refuses a mismatched reel', async ({ page }, testInfo) => {
  11  |   test.setTimeout(120_000);
  12  |   await seedProfile(page);
  13  |   const errors = collectErrors(page);
  14  |   const tape = await recordTape(page);
  15  | 
  16  |   await page.goto('/');
  17  |   await page.getByTestId('start-menu-enter-town').click();
  18  |   await openTapeShelf(page);
  19  |   await expect(page.getByTestId('watch-run-tape')).toHaveCount(1);
  20  |   await expect(page.getByTestId('tape-shelf')).toContainText('KEPT');
  21  |   expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
  22  |   const storageBefore = await storageBytes(page);
  23  | 
  24  |   await page.getByTestId('watch-run-tape').click();
  25  |   const show = page.getByTestId('lantern-show');
  26  |   await expect(show).toBeVisible();
  27  |   await expect(page.getByTestId('lantern-agent-honesty')).toBeHidden();
  28  |   expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
  29  |   await expect(page.getByTestId('lantern-intertitle')).toHaveText('Hold the east bank.');
  30  |   await expect(page.locator('[data-lantern-scrub]')).toHaveCount(0);
  31  |   await shot(page, testInfo, 'lantern-show');
  32  | 
  33  |   await page.getByTestId('lantern-speed-4').click();
  34  |   await expect(show).toHaveAttribute('data-playback', 'complete', { timeout: 15_000 });
  35  |   await expect(page.getByTestId('lantern-intertitle')).toContainText('RECORDED OUTCOME');
  36  |   const status = page.getByTestId('lantern-playback-status');
  37  |   await expect(status).toHaveAttribute('data-hash', tape.eventLogHash);
  38  |   await expect(status).toHaveAttribute('data-expected-hash', tape.eventLogHash);
  39  |   await page.getByTestId('lantern-restart').click();
  40  | 
  41  |   await page.getByTestId('lantern-pause').click();
  42  |   await expect(show).toHaveAttribute('data-playback', 'paused');
  43  |   const pausedTick = Number(await show.getAttribute('data-tick'));
  44  |   await page.waitForTimeout(250);
  45  |   expect(Number(await show.getAttribute('data-tick'))).toBe(pausedTick);
  46  |   await page.getByTestId('lantern-pause').click();
  47  |   await page.getByTestId('lantern-speed-2').click();
  48  |   await expect(show).toHaveAttribute('data-speed', '2');
  49  |   await page.waitForTimeout(250);
  50  |   const beforeRestart = Number(await show.getAttribute('data-tick'));
  51  |   expect(beforeRestart).toBeGreaterThan(0);
  52  |   await page.getByTestId('lantern-restart').click();
  53  |   await expect.poll(async () => Number(await show.getAttribute('data-tick'))).toBeLessThan(beforeRestart);
  54  |   await page.getByTestId('lantern-speed-4').click();
  55  |   await expect(show).toHaveAttribute('data-speed', '4');
  56  |   await page.keyboard.press('ArrowRight');
  57  |   await page.getByTestId('lantern-wave-skip').click();
  58  |   await expect(show).toHaveAttribute('data-playback', 'skipping');
  59  |   await expect(show).toHaveAttribute('data-playback', 'complete', { timeout: 15_000 });
  60  |   expect(await storageBytes(page)).toBe(storageBefore);
  61  |   await page.getByTestId('lantern-close').click();
  62  |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  63  | 
  64  |   await page.evaluate(({ key, simVersion }) => {
  65  |     const shelf = JSON.parse(localStorage.getItem(key) ?? '{}') as { tapes?: RunTape[] };
  66  |     if (!shelf.tapes?.[0]) throw new Error('Recorded tape missing');
  67  |     shelf.tapes[0].simVersion = simVersion + 1;
  68  |     localStorage.setItem(key, JSON.stringify(shelf));
  69  |   }, { key: RUN_TAPES_KEY, simVersion: RUN_TAPE_SIM_VERSION });
  70  |   await openTapeShelf(page);
  71  |   await page.getByTestId('watch-run-tape').click();
  72  |   await expect(page.getByTestId('tape-version-refusal')).toHaveText(LANTERN_VERSION_REFUSAL);
  73  |   await expect(page.getByTestId('lantern-show')).toHaveCount(0);
  74  |   await expect(page.getByTestId('tape-shelf')).toContainText(/wave 0.*KEPT/s);
  75  |   await shot(page, testInfo, 'version-refusal');
> 76  |   expect(errors).toEqual({ console: [], page: [] });
      |                  ^ Error: expect(received).toEqual(expected) // deep equality
  77  | });
  78  | 
  79  | async function seedProfile(page: Page): Promise<void> {
  80  |   await page.addInitScript(({ profileKey, townKey, firstClaimKey, welcomeKey }) => {
  81  |     if (localStorage.getItem(profileKey)) return;
  82  |     localStorage.clear();
  83  |     sessionStorage.clear();
  84  |     const state: ProfileState = {
  85  |       version: 2,
  86  |       activeId: 'robin',
  87  |       profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [], trailGuide: true }],
  88  |     };
  89  |     localStorage.setItem(profileKey, JSON.stringify(state));
  90  |     localStorage.setItem(townKey, 'Quartz Hill');
  91  |     localStorage.setItem(firstClaimKey, '1');
  92  |     localStorage.setItem(welcomeKey, '1');
  93  |   }, {
  94  |     profileKey: PROFILE_KEY,
  95  |     townKey: profileDataKey('robin', TOWN_NAME_KEY),
  96  |     firstClaimKey: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  97  |     welcomeKey: profileDataKey('robin', TOWN_WELCOME_SEEN_KEY),
  98  |   });
  99  | }
  100 | 
  101 | async function recordTape(page: Page): Promise<RunTape> {
  102 |   await page.goto('/?debug&seed=tape-02-proof');
  103 |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  104 |   await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  105 |   const script = [
  106 |     { t: 0, mx: 0.2, my: 0, a: [] },
  107 |     { t: 30, mx: 0, my: 0, a: [] },
  108 |     { t: 180, mx: 0, my: 0.2, a: [] },
  109 |     { t: 210, mx: 0, my: 0, a: [] },
  110 |     { t: 360, mx: -0.2, my: 0, a: [] },
  111 |     { t: 390, mx: 0, my: 0, a: [] },
  112 |   ];
  113 |   expect(await page.evaluate((entries) => window.__GR_TEST__!.playbook.startRecording({ script: entries }), script)).toMatchObject({ ok: true });
  114 |   await page.evaluate(() => window.__GR_TEST__!.advanceSim(20));
  115 |   await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  116 |   await page.getByTestId('keep-run-tape').click();
  117 |   return page.evaluate((key) => {
  118 |     const shelf = JSON.parse(localStorage.getItem(key) ?? '{}') as { tapes?: RunTape[] };
  119 |     const tape = shelf.tapes?.[0];
  120 |     if (!tape) throw new Error('Recorded tape missing');
  121 |     tape.annotations = [{ atMs: 0, text: 'Hold the east bank.' }];
  122 |     localStorage.setItem(key, JSON.stringify(shelf));
  123 |     return tape;
  124 |   }, RUN_TAPES_KEY);
  125 | }
  126 | 
  127 | async function openTapeShelf(page: Page): Promise<void> {
  128 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  129 |   await page.evaluate(() => {
  130 |     const town = window.__GR_TOWN_DIAGNOSTICS__!;
  131 |     const approach = town.buildings.find((building) => building.id === 'schoolhouse')!.approach;
  132 |     town.teleport(approach.x, approach.z);
  133 |   });
  134 |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
  135 |   await page.getByTestId('town-open-schoolhouse').click();
  136 |   await page.getByTestId('schoolhouse-open-tapes').click();
  137 |   await expect(page.getByTestId('tape-shelf')).toBeVisible();
  138 | }
  139 | 
  140 | async function storageBytes(page: Page): Promise<string> {
  141 |   return page.evaluate(() => JSON.stringify(Object.entries(localStorage).sort(([left], [right]) => left.localeCompare(right))));
  142 | }
  143 | 
  144 | async function shot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  145 |   await mkdir(SHOT_DIR, { recursive: true });
  146 |   await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: true });
  147 | }
  148 | 
  149 | function collectErrors(page: Page): { console: string[]; page: string[] } {
  150 |   const errors = { console: [] as string[], page: [] as string[] };
  151 |   page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  152 |   page.on('pageerror', (error) => errors.page.push(error.message));
  153 |   return errors;
  154 | }
  155 | 
```