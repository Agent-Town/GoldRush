# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e7-signal-systems.spec.ts >> S3 silences wait for midpoint, darken in canon order, and arm the last beat exactly once
- Location: e2e/e7-signal-systems.spec.ts:104:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - strong: THE EXCHANGE
          - generic: "The last voice is static now. The jack stays patched. If anybody is listening: HERE."
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 00:03
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
        - group "Exchange rescue jack-board" [ref=e9]:
          - generic "The Exchange Searching" [ref=e10] [cursor=pointer]:
            - text: The Exchange
            - generic [ref=e11]: Searching
        - button "Tape Reel" [ref=e12]: ● Tape Reel
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build" [ref=e14]
      - button "Pause the claim" [ref=e15]: catch your breath
      - generic [ref=e16]:
        - text: Swipe to scroll
        - group [ref=e17]:
          - generic "Claim Stake Swipe to scroll" [ref=e18] [cursor=pointer]
          - paragraph [ref=e19]: The heart of the claim. Lose it and the run is done.
    - generic:
      - button [ref=e22]: Rotate
      - button [ref=e23]: Weapon
      - button [ref=e24]: OK
    - region
    - text: None None None
  - generic [ref=e25]:
    - button "▸ Game tuning" [ref=e26] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e27]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  38  |   expect(first.links).toEqual([{ from: 'turret-0', to: 'turret-1' }]);
  39  |   expect(first.linkedCoverage).toBe(true);
  40  |   expect(first.threatVisibilityBonus).toBe(true);
  41  |   expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.droneCanOperate(0, 8))).toBe(true);
  42  |   expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.droneCanOperate(40, 40))).toBe(false);
  43  |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.droneDropped)).toBe(true);
  44  | 
  45  |   const gap = await page.evaluate(() => window.__GR_TEST__!.e7Signal.graphFor([
  46  |     { id: 'west', x: -15, z: 30 },
  47  |     { id: 'east', x: 15, z: 30 },
  48  |   ]));
  49  |   expect(gap.links).toEqual([]);
  50  |   const bridged = await page.evaluate(() => window.__GR_TEST__!.e7Signal.graphFor([
  51  |     { id: 'west', x: -15, z: 30 },
  52  |     { id: 'bridge', x: 0, z: 30 },
  53  |     { id: 'east', x: 15, z: 30 },
  54  |   ]));
  55  |   expect(bridged.links).toEqual([
  56  |     { from: 'bridge', to: 'east' },
  57  |     { from: 'bridge', to: 'west' },
  58  |   ]);
  59  | 
  60  |   await page.reload();
  61  |   await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.e7Signal.enabled === true);
  62  |   const secondHash = await placeRidgeChain(page);
  63  |   expect(secondHash).toBe(firstHash);
  64  |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  65  | });
  66  | 
  67  | test('S2 jack-board milestones remain inert before the Signal Era', async ({ page }) => {
  68  |   const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  69  |   page.on('console', (message) => message.type() === 'error' && errors.consoleErrors.push(message.text()));
  70  |   page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  71  |   await page.goto('/?debug&epoch=epoch-6-atomic&contract=the-claim&nowaves&nolevel&nopause&seed=e7-signal-early');
  72  |   await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.e7Signal));
  73  |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.enabled)).toBe(false);
  74  |   expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.milestone('first-relay-linked'))).toBe(false);
  75  |   await expect(page.getByTestId('e7-jack-board')).toBeHidden();
  76  |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  77  | });
  78  | 
  79  | test('S2 seeded progress lights each jack once, persists, and keeps player copy frontier-clean', async ({ page }) => {
  80  |   const errors = await open(page);
  81  |   const results = await page.evaluate((milestones) => milestones.map((milestone) => window.__GR_TEST__!.e7Signal.milestone(milestone)), ANSWERS);
  82  |   expect(results).toEqual([true, true, true]);
  83  |   expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.milestone('first-relay-linked'))).toBe(false);
  84  | 
  85  |   const board = page.getByTestId('e7-jack-board');
  86  |   await expect(board).toBeVisible();
  87  |   await expect(board.locator('[data-jack-state="lit"]')).toHaveCount(3);
  88  |   await expect(board).toContainText('The ford table');
  89  |   await expect(page.getByTestId('hud-wave').locator('[data-hud-wave-title]')).toHaveText('THE EXCHANGE');
  90  |   await expect(page.getByTestId('hud-wave').locator('[data-hud-wave]')).toContainText('bright season');
  91  |   expect((await board.textContent()) ?? '').not.toMatch(/\b(API|backend|server|debug)\b/i);
  92  | 
  93  |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal);
  94  |   expect(before.jacks.map((jack) => jack.state)).toEqual(['lit', 'lit', 'lit']);
  95  |   expect(before.fragmentEvents).toBe(3);
  96  |   await page.reload();
  97  |   await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.e7Signal.enabled === true);
  98  |   const after = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal);
  99  |   expect(after.jacks).toEqual(before.jacks);
  100 |   expect(after.fragmentEvents).toBe(3);
  101 |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  102 | });
  103 | 
  104 | test('S3 silences wait for midpoint, darken in canon order, and arm the last beat exactly once', async ({ page }) => {
  105 |   const errors = await open(page);
  106 |   expect(await page.evaluate(() => window.__GR_TEST__!.e7Signal.milestone('contract:e7-echo-canyon'))).toBe(false);
  107 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Signal.jacks)).toEqual([]);
  108 | 
  109 |   await page.evaluate((milestones) => milestones.forEach((milestone) => window.__GR_TEST__!.e7Signal.milestone(milestone)), ANSWERS);
  110 |   const beforeLast = await page.evaluate((silences) => {
  111 |     const signal = window.__GR_TEST__!.e7Signal;
  112 |     signal.milestone(silences[0]);
  113 |     signal.milestone(silences[1]);
  114 |     return signal.diagnostics();
  115 |   }, SILENCES);
  116 |   expect(beforeLast.jacks.map((jack) => jack.state)).toEqual(['lit', 'dark', 'dark']);
  117 |   expect(beforeLast.lastBeatCount).toBe(0);
  118 | 
  119 |   const activationBefore = await page.evaluate(async () => {
  120 |     const contracts = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
  121 |     const megaproject = (await Function('return import("/src/meta/Megaproject.ts")')()) as typeof import('../src/meta/Megaproject');
  122 |     localStorage.setItem(megaproject.MEGAPROJECT_STATE_KEY, JSON.stringify({ version: 1, projects: { [contracts.loadEpoch('epoch-7-signal').megaproject.id]: { complete: true } } }));
  123 |     return contracts.activateEpoch('epoch-8-orbital');
  124 |   });
  125 |   expect(activationBefore).toBe(false);
  126 | 
  127 |   expect(await page.evaluate((milestone) => window.__GR_TEST__!.e7Signal.milestone(milestone), SILENCES[2])).toBe(true);
  128 |   expect(await page.evaluate((milestone) => window.__GR_TEST__!.e7Signal.milestone(milestone), SILENCES[2])).toBe(false);
  129 |   const final = await page.evaluate(() => window.__GR_TEST__!.e7Signal.diagnostics());
  130 |   expect(final.jacks.map((jack) => jack.state)).toEqual(['dark', 'dark', 'dark']);
  131 |   expect(final.jacks[0]).toMatchObject({ id: 'lighthouse-keeper', patched: true });
  132 |   expect(final.lastBeatCount).toBe(1);
  133 |   expect(final.e8ExitBeatReady).toBe(true);
  134 | 
  135 |   expect(await page.evaluate(async () => {
  136 |     const contracts = (await Function('return import("/src/meta/ContractFamilies.ts")')()) as typeof import('../src/meta/ContractFamilies');
  137 |     return contracts.activateEpoch('epoch-8-orbital');
> 138 |   })).toBe(true);
      |       ^ Error: expect(received).toBe(expected) // Object.is equality
  139 |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  140 | });
  141 | 
```