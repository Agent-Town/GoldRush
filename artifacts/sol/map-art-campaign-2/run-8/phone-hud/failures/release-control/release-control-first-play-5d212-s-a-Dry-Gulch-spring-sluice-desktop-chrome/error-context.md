# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: release-control.spec.ts >> first player reaches textured town actors and places a Dry Gulch spring sluice
- Location: e2e/release-build.spec.ts:24:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

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
        - strong: 00:16
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
```

# Test source

```ts
  230 |   expectNoConsoleErrors(watch);
  231 | });
  232 | 
  233 | test('a legitimate suspend resumes its unlocked contract', async ({ page }) => {
  234 |   const watch = watchErrors(page);
  235 |   await seedProfile(page, { unlocked: true });
  236 |   await page.goto('/');
  237 |   // continueSavedRun stages the saved contract through this exact launch seam.
  238 |   await page.evaluate(([key, id]) => sessionStorage.setItem(key, id), [LAUNCH_KEY, 'e1-dry-gulch']);
  239 |   await page.goto('/?contract=e1-dry-gulch');
  240 |   await waitForContract(page, 'e1-dry-gulch');
  241 |   expectNoConsoleErrors(watch);
  242 | });
  243 | 
  244 | test('dist has no later manifest ids or plate/GLB assets', () => {
  245 |   expect(() => execFileSync(process.execPath, ['scripts/assert-release-build.mjs'], {
  246 |     cwd: process.cwd(),
  247 |     env: { ...process.env, GR_RELEASE: 'e1' },
  248 |   })).not.toThrow();
  249 | });
  250 | 
  251 | async function seedProfile(
  252 |   page: Page,
  253 |   options: { contractId?: string; unlocked: boolean; activeEpoch?: string },
  254 | ): Promise<void> {
  255 |   await page.addInitScript(({ keys, launchKey, seededKey, contractId, unlocked, frontier, activeEpoch, threshold, taken }) => {
  256 |     if (sessionStorage.getItem(seededKey)) return;
  257 |     localStorage.clear();
  258 |     sessionStorage.clear();
  259 |     const profile: ProfileState = {
  260 |       version: 2,
  261 |       activeId: 'robin',
  262 |       profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
  263 |     };
  264 |     localStorage.setItem(keys.profile, JSON.stringify(profile));
  265 |     localStorage.setItem(keys.town, 'Quartz Hill');
  266 |     localStorage.setItem(keys.firstClaim, '1');
  267 |     localStorage.setItem(keys.activeEpoch, activeEpoch ?? frontier);
  268 |     localStorage.setItem(keys.meta, JSON.stringify({ version: 1, tracks: { territory: 3, science: unlocked ? threshold : 0, hero: 0, agent: 0 } }));
  269 |     localStorage.setItem(keys.research, JSON.stringify({ version: 1, taken: unlocked ? taken : [], proposalSalt: 0, pinnedTarget: null }));
  270 |     if (unlocked) {
  271 |       localStorage.setItem(keys.scores, JSON.stringify([
  272 |         { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: 'the-claim', profileName: 'Robin' },
  273 |         { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 2, secured: true, contractId: 'e1-dry-gulch', profileName: 'Robin' },
  274 |       ]));
  275 |     }
  276 |     if (contractId) sessionStorage.setItem(launchKey, contractId);
  277 |     sessionStorage.setItem(seededKey, '1');
  278 |   }, {
  279 |     keys: {
  280 |       profile: PROFILE_KEY,
  281 |       town: profileDataKey('robin', TOWN_NAME_KEY),
  282 |       firstClaim: profileDataKey('robin', FIRST_CLAIM_DONE_KEY),
  283 |       activeEpoch: profileDataKey('robin', ACTIVE_EPOCH_KEY),
  284 |       meta: profileDataKey('robin', META_PROGRESS_KEY),
  285 |       research: profileDataKey('robin', RESEARCH_STATE_KEY),
  286 |       scores: profileDataKey('robin', SCOREBOARD_KEY),
  287 |     },
  288 |     launchKey: LAUNCH_KEY,
  289 |     seededKey: SEEDED_KEY,
  290 |     contractId: options.contractId,
  291 |     unlocked: options.unlocked,
  292 |     frontier: FRONTIER,
  293 |     activeEpoch: options.activeEpoch,
  294 |     threshold: STEAMWORKS_THRESHOLD,
  295 |     taken: RESEARCH_NODES.map((node) => node.id),
  296 |   });
  297 | }
  298 | 
  299 | async function waitForContract(page: Page, contractId: string): Promise<void> {
  300 |   await page.waitForFunction((id) =>
  301 |     window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10,
  302 |   contractId);
  303 | }
  304 | 
  305 | async function waitForTown(page: Page): Promise<void> {
  306 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  307 | }
  308 | 
  309 | async function teleportToActor(page: Page, actorId: string): Promise<void> {
  310 |   await page.evaluate((id) => {
  311 |     const town = window.__GR_TOWN_DIAGNOSTICS__!;
  312 |     const actor = town.actors.find((entry) => entry.id === id)!;
  313 |     town.teleport(actor.position.x, actor.position.z);
  314 |   }, actorId);
  315 | }
  316 | 
  317 | async function teleportToBuilding(page: Page, buildingId: string): Promise<void> {
  318 |   await page.evaluate((id) => {
  319 |     const town = window.__GR_TOWN_DIAGNOSTICS__!;
  320 |     const building = town.buildings.find((entry) => entry.id === id)!;
  321 |     town.teleport(building.approach.x, building.approach.z);
  322 |   }, buildingId);
  323 |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe(buildingId);
  324 | }
  325 | 
  326 | async function harvestSluiceBudget(page: Page): Promise<void> {
  327 |   await moveHeroTo(page, -4.5, 12);
  328 |   await moveHeroTo(page, -4.5, -6.4);
  329 |   await moveHeroTo(page, -2.5, -6.4);
> 330 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling)).toBe(true);
      |                                                                                                       ^ Error: expect(received).toBe(expected) // Object.is equality
  331 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold), { timeout: 20_000 }).toBeGreaterThanOrEqual(30);
  332 |   await moveHeroTo(page, -4.5, -6.4);
  333 |   await moveHeroTo(page, -4.5, 6.7);
  334 |   await moveHeroTo(page, -9, 6.7);
  335 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling), { timeout: 10_000 }).toBe(true);
  336 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold), { timeout: 20_000 }).toBeGreaterThanOrEqual(40);
  337 | }
  338 | 
  339 | async function aimBuildGhost(page: Page, target: { x: number; z: number }): Promise<{ x: number; y: number }> {
  340 |   const box = await page.locator('#game-canvas').boundingBox();
  341 |   expect(box).not.toBeNull();
  342 |   let x = box!.x + box!.width / 2;
  343 |   let y = box!.y + box!.height / 2;
  344 |   const sample = async (clientX: number, clientY: number) => {
  345 |     await page.mouse.move(clientX, clientY);
  346 |     await page.waitForTimeout(80);
  347 |     return page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.build.ghostPos);
  348 |   };
  349 |   for (let attempt = 0; attempt < 5; attempt += 1) {
  350 |     const origin = await sample(x, y);
  351 |     const across = await sample(x + 40, y);
  352 |     const down = await sample(x, y + 40);
  353 |     const j00 = (across.x - origin.x) / 40;
  354 |     const j10 = (across.z - origin.z) / 40;
  355 |     const j01 = (down.x - origin.x) / 40;
  356 |     const j11 = (down.z - origin.z) / 40;
  357 |     const determinant = j00 * j11 - j01 * j10;
  358 |     if (Math.abs(determinant) < 0.00001) break;
  359 |     const dx = target.x - origin.x;
  360 |     const dz = target.z - origin.z;
  361 |     x += Math.max(-180, Math.min(180, (dx * j11 - dz * j01) / determinant));
  362 |     y += Math.max(-180, Math.min(180, (dz * j00 - dx * j10) / determinant));
  363 |     x = Math.max(box!.x + 2, Math.min(box!.x + box!.width - 2, x));
  364 |     y = Math.max(box!.y + 2, Math.min(box!.y + box!.height - 2, y));
  365 |   }
  366 |   await sample(x, y);
  367 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostPos)).toEqual(target);
  368 |   return { x, y };
  369 | }
  370 | 
```