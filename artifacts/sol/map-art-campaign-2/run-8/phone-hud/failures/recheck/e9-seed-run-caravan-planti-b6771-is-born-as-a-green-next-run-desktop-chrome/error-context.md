# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e9-seed-run-caravan.spec.ts >> planting at the stake spends the guard, lands at run end, and is born as a green next run
- Location: e2e/e9-seed-run-caravan.spec.ts:180:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "paused"
Received: "moving"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - generic: Beacon coils hum eastward!
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 01:32
        - generic:
          - generic: Wave
          - strong: "3"
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
        - button "Tape Reel" [ref=e9]: ● Tape Reel
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build" [ref=e11]
      - button "Pause the claim" [ref=e12]: P - catch your breath
      - group [ref=e13]:
        - generic "Claim Stake" [ref=e14] [cursor=pointer]
        - paragraph [ref=e15]: The heart of the claim. Lose it and the run is done.
    - generic:
      - status:
        - generic:
          - paragraph: Tavernkeeper
          - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
          - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
    - region
    - text: None None None
  - generic [ref=e16]:
    - button "▸ Game tuning" [ref=e17] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e18]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  88  |  * The owner's complaint of 2026-08-20 is about what a player sees, so the proof has to run where a
  89  |  * player runs. `activeContractSelection` (`ContractFamilies.ts:1322`) honours `?contract=` with no
  90  |  * debug flag whenever the id is a STAGED PLAYER LAUNCH, and `reverifyStagedContractLaunch` keeps
  91  |  * that launch only while the row is unlocked — so the honest way in is to be a player who has
  92  |  * already secured Dome Basin. That is one scoreboard row, written through the app's own
  93  |  * profile-scoped storage (`ProfileStorage.installProfileStorageScope` patches `setItem`), and
  94  |  * nothing else: no harness, no flag, no private handle.
  95  |  */
  96  | async function bootPlainAsUnlockedPlayer(page: Page): Promise<void> {
  97  |   await page.goto('/?nolevel&nopause');
  98  |   await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId));
  99  |   await page.evaluate(() => {
  100 |     // The two things a player who reached this row actually has: he is IN the Red Fields era
  101 |     // (`epochIsActive`, `ContractFamilies.ts:1111`) and he has SECURED Dome Basin
  102 |     // (`contractUnlockStatus`'s `secured:` branch, `ContractUnlock.ts:57`). Both are ordinary
  103 |     // profile data, written through the app's own patched storage.
  104 |     localStorage.setItem('gr.activeEpoch.v1', 'epoch-9-redfields');
  105 |     localStorage.setItem('gr.scores.v2', JSON.stringify([{
  106 |       waves: 20, kills: 400, gold: 500, timeAlive: 600, at: 1, secured: true, contractId: 'e9-dome-basin',
  107 |     }]));
  108 |     sessionStorage.setItem('gr.contract.launch.v1', 'e9-seed-run');
  109 |   });
  110 |   await page.goto('/?contract=e9-seed-run&nolevel&nopause&seed=sr01');
  111 |   await page.waitForFunction((id) => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, CONTRACT_ID);
  112 | }
  113 | 
  114 | /**
  115 |  * Advance in chunks until the predicate holds. `advanceSim` is SYNCHRONOUS, so polling a
  116 |  * diagnostic after a single call can only ever see one instant — the clock does not move on its
  117 |  * own under manual sim, and a poll that waits for it would hang until the timeout.
  118 |  */
  119 | async function advanceUntil(page: Page, predicate: (state: NonNullable<Awaited<ReturnType<typeof caravan>>>) => boolean, budgetSeconds = 320): Promise<void> {
  120 |   for (let elapsed = 0; elapsed < budgetSeconds; elapsed += 5) {
  121 |     const state = await caravan(page);
  122 |     if (state && predicate(state)) return;
  123 |     await page.evaluate(() => window.__GR_TEST__!.advanceSim(5));
  124 |   }
  125 |   throw new Error(`caravan never reached the expected state within ${budgetSeconds}s of sim time`);
  126 | }
  127 | 
  128 | async function tileStateSnapshot(page: Page): Promise<string | null> {
  129 |   return page.evaluate(async (contractId) => {
  130 |     const profiles = (await Function('return import("/src/game/ProfileStorage.ts")')()) as typeof import('../src/game/ProfileStorage');
  131 |     return localStorage.getItem(profiles.tileStateKey(profiles.activeProfile(localStorage).id, contractId));
  132 |   }, CONTRACT_ID);
  133 | }
  134 | 
  135 | /**
  136 |  * Evidence that survives the run (Convention 1): the shot lands in `artifacts/e9-seed-run/shots/`
  137 |  * under its project name AND is attached to the report, so a reviewer who never opens the trace
  138 |  * can still see exactly what a stranger saw at 1280x800 and at 390px.
  139 |  */
  140 | async function shoot(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  141 |   const body = await page.screenshot({
  142 |     path: `artifacts/e9-seed-run/shots/${testInfo.project.name}-${name}.png`,
  143 |   });
  144 |   await testInfo.attach(name, { body, contentType: 'image/png' });
  145 | }
  146 | 
  147 | /** The ordinary context action — Space, the same key that funds a megaproject or frees a machine. */
  148 | async function pressConfirm(page: Page): Promise<void> {
  149 |   await page.evaluate(() => {
  150 |     window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
  151 |     window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true }));
  152 |   });
  153 |   // One frame, so the intent edge is consumed before the next assertion reads diagnostics.
  154 |   await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.2));
  155 | }
  156 | 
  157 | test('the board refuses the Seed Run until Dome Basin is secured — the reach, measured', async ({ page }) => {
  158 |   const errors = collectErrors(page);
  159 |   // NO `?debug` ANYWHERE HERE, which is the point: this is what a real player gets today.
  160 |   //
  161 |   // `reverifyStagedContractLaunch` (`ContractUnlock.ts:77`) clears a staged launch whose contract
  162 |   // is locked, and the Seed Run's row is `unlock: "secured:e9-dome-basin"`. So the honest answer
  163 |   // to "where does the PLAYER see this in a plain boot?" (Mistake #10) has two halves, and this is
  164 |   // the half that is true right now: the row is BEHIND Dome Basin, and a launch aimed at it lands
  165 |   // back on The Claim. Dome Basin is itself admitted and playable, so the gate is a progression
  166 |   // step rather than a dead end — filed as F-A8-5 with its own measurement rather than asserted.
  167 |   await page.addInitScript(() => sessionStorage.setItem('gr.contract.launch.v1', 'e9-seed-run'));
  168 |   await page.goto('/?contract=e9-seed-run&nolevel&nopause&seed=sr01');
  169 |   await page.waitForFunction(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId));
  170 | 
  171 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId)).toBe('the-claim');
  172 |   await expect(page.getByTestId('contract-briefing-name')).toHaveText('The Claim');
  173 |   // The consumer is correctly ABSENT where the contract is: no twist, no caravan, no leaked field.
  174 |   expect(await caravan(page)).toBeNull();
  175 |   // And nothing was written to a profile by trying (Mistake #7).
  176 |   expect(await tileStateSnapshot(page)).toBeNull();
  177 |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  178 | });
  179 | 
  180 | test('planting at the stake spends the guard, lands at run end, and is born as a green next run', async ({ page }, testInfo) => {
  181 |   const errors = collectErrors(page);
  182 |   await page.goto(DEBUG_QUERY);
  183 |   await waitForBoot(page, true);
  184 |   await takeManualControl(page);
  185 | 
  186 |   // Walk the train to the centre ground on its own fixed schedule and stop inside the window.
  187 |   await advanceUntil(page, (state) => state.atGround === CENTER_GROUND);
> 188 |   expect((await caravan(page))!.state).toBe('paused');
      |                                        ^ Error: expect(received).toBe(expected) // Object.is equality
  189 |   // A8-LEGIBILITY: this is the frame the owner never got — the train standing nine wu from the
  190 |   // claim, named, guard-barred, on its drawn road, with the county's halt line on the banner. The
  191 |   // shot is kept because "the box was grey and nobody knew what it was" is a VISUAL complaint and
  192 |   // a visual claim needs a visual receipt.
  193 |   await shoot(page, testInfo, 'at-center-ground');
  194 |   expect(await presentation(page)).toMatchObject({ tagVisible: true, guardBarVisible: true, guardRatio: 1 });
  195 | 
  196 |   // OUT OF REACH IS REFUSED, and the refusal is counted rather than swallowed. The hero starts at
  197 |   // (0,12), nine wu from the stake — close enough to see it, too far to plant it.
  198 |   await pressConfirm(page);
  199 |   expect((await caravan(page))!.refusals.outOfReach).toBeGreaterThan(0);
  200 |   expect((await caravan(page))!.plantedThisRun).toEqual([]);
  201 | 
  202 |   await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), CENTER_STAKE);
  203 |   await pressConfirm(page);
  204 |   expect((await caravan(page))!.plantedThisRun).toEqual([CENTER_GROUND]);
  205 | 
  206 |   // THE COST: the ratified quarter, off both the pool and the ceiling.
  207 |   const spent = await caravan(page);
  208 |   expect(spent!.maxHp).toBe(CARAVAN_MAX_HP - PLANT_COST_HP);
  209 |   expect(spent!.hp).toBe(CARAVAN_MAX_HP - PLANT_COST_HP);
  210 | 
  211 |   // A8-LEGIBILITY: the county names the vault, and the guard bar reads FULL again at the new,
  212 |   // lower ceiling — the trade is "a smaller train", not "a wounded one".
  213 |   expect((await presentation(page))!.beatsSaid).toContain('plant:plant-center-waypoint');
  214 |   expect((await presentation(page))!.guardRatio).toBe(1);
  215 | 
  216 |   // ONE PER GROUND, for the life of the profile.
  217 |   await pressConfirm(page);
  218 |   expect((await caravan(page))!.refusals.alreadyHeld).toBeGreaterThan(0);
  219 |   expect((await caravan(page))!.plantedThisRun).toEqual([CENTER_GROUND]);
  220 | 
  221 |   // WRITE-AT-END: staged only. Nothing on disk, and this run's spawn rules are untouched.
  222 |   expect(await tileStateSnapshot(page)).toBeNull();
  223 |   expect((await persistence(page)).noSpawnZones).toEqual([]);
  224 | 
  225 |   await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  226 |   const written = await tileStateSnapshot(page);
  227 |   expect(written).not.toBeNull();
  228 |   expect(JSON.parse(written!)).toEqual({
  229 |     schemaVersion: 1,
  230 |     entries: [{
  231 |       kind: 'sim',
  232 |       id: CENTER_ENTRY_ID,
  233 |       payload: { x: CENTER_STAKE.x, z: CENTER_STAKE.z, r: GREEN_RADIUS },
  234 |       schemaVersion: 1,
  235 |     }],
  236 |   });
  237 | 
  238 |   // NEXT BIRTH: the green is in the tile's own parameters and mounted as a swatch.
  239 |   await page.reload();
  240 |   await waitForBoot(page, true);
  241 |   expect(await persistence(page)).toMatchObject({
  242 |     entries: 1,
  243 |     greenWaypoint: { x: CENTER_STAKE.x, z: CENTER_STAKE.z, r: GREEN_RADIUS },
  244 |     greenWaypoints: [{ x: CENTER_STAKE.x, z: CENTER_STAKE.z, r: GREEN_RADIUS }],
  245 |     noSpawnZones: [{ x: CENTER_STAKE.x, z: CENTER_STAKE.z, radius: GREEN_RADIUS }],
  246 |   });
  247 |   expect((await caravan(page))!.plantedBefore).toEqual([CENTER_GROUND]);
  248 | 
  249 |   // And the ground it holds refuses a second vault forever.
  250 |   await takeManualControl(page);
  251 |   await advanceUntil(page, (state) => state.atGround === CENTER_GROUND);
  252 |   await page.evaluate(({ x, z }) => window.__GR_TEST__!.teleport(x, z), CENTER_STAKE);
  253 |   await pressConfirm(page);
  254 |   expect((await caravan(page))!.refusals.alreadyHeld).toBeGreaterThan(0);
  255 |   expect((await caravan(page))!.plantedThisRun).toEqual([]);
  256 | 
  257 |   expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  258 | });
  259 | 
  260 | test('the caravan reaching the basin is what latches the objective', async ({ page }) => {
  261 |   const errors = collectErrors(page);
  262 |   await page.goto(DEBUG_QUERY);
  263 |   await waitForBoot(page, true);
  264 |   await takeManualControl(page);
  265 | 
  266 |   // The whole crossing: four legs at 1.6 wu/s plus three 40-second dwells, ~224s of sim.
  267 |   await advanceUntil(page, (state) => state.arrived);
  268 |   const landed = await caravan(page);
  269 |   expect(landed).toMatchObject({ state: 'arrived', arrived: true, progress: 1, atGround: null });
  270 |   // THE SHAPE OF THE THING, asserted where the map actually boots. The route is the five authored
  271 |   // buildZone centres in authored order - the same five points the mask table publishes as
  272 |   // `caravanRoute` and `scripts/e3-mask-tables.test.mjs:352` already pins - and the grounds are the
  273 |   // three authored stakes matched to the zones that contain them. Nothing here is a constant in
  274 |   // the consumer; all of it is contract data read back out.
  275 |   expect(landed!.route).toEqual([
  276 |     { x: 0, z: -48 }, { x: -34, z: -21 }, { x: 0, z: 3 }, { x: 34, z: 27 }, { x: 0, z: 48 },
  277 |   ]);
  278 |   expect(landed!.grounds.map(({ id, zoneId }) => `${id}/${zoneId}`)).toEqual([
  279 |     'plant-west-waypoint/west-green-waypoint',
  280 |     'plant-center-waypoint/center-green-waypoint',
  281 |     'plant-east-waypoint/east-green-waypoint',
  282 |   ]);
  283 |   expect(landed!.position).toEqual({ x: 0, z: 48 });
  284 |   // Arriving with no plant costs nothing: an empty road takes nothing off the guard.
  285 |   expect(landed!.maxHp).toBe(CARAVAN_MAX_HP);
  286 |   expect(landed!.plantedThisRun).toEqual([]);
  287 | 
  288 |   // A landed train persists nothing by landing — only planting writes.
```