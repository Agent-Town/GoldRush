# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: release-build.spec.ts >> dist has no later manifest ids or plate/GLB assets
- Location: e2e/release-build.spec.ts:244:1

# Error details

```
Error: expect(received).not.toThrow()

Error name:    "Error"
Error message: "Command failed: /opt/homebrew/Cellar/node/26.4.0/bin/node scripts/assert-release-build.mjs
file:///Users/robin/Claude/Projects/Gold%20Rush/worktrees/lane-b/scripts/assert-release-build.mjs:75
  throw new Error(`[release-build] ${message}`);
        ^·
Error: [release-build] later era assets emitted: char-jumper-e4-codex-v1-r0c0-CBWHXFMD-diet-c2bea0ac.png, char-jumper-e4-codex-v1-r0c1-mVdGaF7x-diet-c2bea0ac.png, char-jumper-e4-codex-v1-r1c0-_a9QDw9U-diet-c2bea0ac.png, char-jumper-e4-codex-v1-r1c1-Dz-4tC9U-diet-c2bea0ac.png
    at fail (file:///Users/robin/Claude/Projects/Gold%20Rush/worktrees/lane-b/scripts/assert-release-build.mjs:75:9)
    at file:///Users/robin/Claude/Projects/Gold%20Rush/worktrees/lane-b/scripts/assert-release-build.mjs:55:27·
Node.js v26.4.0
"

      at fail (file:/Users/robin/Claude/Projects/Gold%20Rush/worktrees/lane-b/scripts/assert-release-build.mjs:75:9)
      at file:/Users/robin/Claude/Projects/Gold%20Rush/worktrees/lane-b/scripts/assert-release-build.mjs:55:27
      Node.js v26.4.0
      at file:/Users/robin/Claude/Projects/Gold%20Rush/worktrees/lane-b/e2e/release-build.spec.ts:245:16
      at Object.<anonymous> (node_modules/playwright/lib/matchers/expect.js:11428:9)
      at invokeMatcher (node_modules/playwright/lib/matchers/expect.js:12925:20)
      at invoke (node_modules/playwright/lib/matchers/expect.js:12904:109)
      at _Zone.run (node_modules/playwright-core/lib/coreBundle.js:8572:40)
      at callMatcherAsStep (node_modules/playwright/lib/matchers/expect.js:12905:64)
      at Object.toThrow (node_modules/playwright/lib/matchers/expect.js:12867:23)
      at file:/Users/robin/Claude/Projects/Gold%20Rush/worktrees/lane-b/e2e/release-build.spec.ts:248:11
      at node_modules/playwright/lib/worker/workerProcessEntry.js:1662:15
      at node_modules/playwright/lib/worker/workerProcessEntry.js:1154:17
      at TimeoutManager.withRunnable (node_modules/playwright/lib/worker/workerProcessEntry.js:426:9)
      at TestInfoImpl._runWithTimeout (node_modules/playwright/lib/worker/workerProcessEntry.js:1152:34)
      at node_modules/playwright/lib/worker/workerProcessEntry.js:1660:22
      at WorkerMain._runTest (node_modules/playwright/lib/worker/workerProcessEntry.js:1633:5)
      at WorkerMain.runTestGroup (node_modules/playwright/lib/worker/workerProcessEntry.js:1528:9)
      at process.<anonymous> (node_modules/playwright/lib/common/index.js:1991:25)
```

# Test source

```ts
  148 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.megaproject.funded)).toBe(false);
  149 | 
  150 |   const artifactDir = path.resolve('artifacts/mill-horizon-copy');
  151 |   mkdirSync(artifactDir, { recursive: true });
  152 |   await page.screenshot({ path: path.join(artifactDir, `${testInfo.project.name}-in-run.png`) });
  153 |   expectNoConsoleErrors(watch);
  154 | });
  155 | 
  156 | test('debug and era query seams are inert', async ({ page }) => {
  157 |   const watch = watchErrors(page);
  158 |   await seedProfile(page, { unlocked: true });
  159 |   await page.goto('/?debug&era=5&contract=e1-baron');
  160 |   await waitForContract(page, 'the-claim');
  161 |   expect(await page.evaluate(() => ({
  162 |     epoch: localStorage.getItem('gr.activeEpoch.v1'),
  163 |     seam: typeof window.__GR_TEST__,
  164 |     gui: typeof window.__GR_GUI__,
  165 |     agent: typeof window.__GR_AGENT__,
  166 |     telemetry: typeof window.__GR_TELEMETRY__,
  167 |     seededEra: document.querySelector('canvas')?.dataset.seededEra,
  168 |   }))).toEqual({
  169 |     epoch: FRONTIER,
  170 |     seam: 'undefined',
  171 |     gui: 'undefined',
  172 |     agent: 'undefined',
  173 |     telemetry: 'undefined',
  174 |     seededEra: undefined,
  175 |   });
  176 |   expectNoConsoleErrors(watch);
  177 | });
  178 | 
  179 | test('an imported later ledger heals to the frontier and plays', async ({ page }) => {
  180 |   const watch = watchErrors(page);
  181 |   await seedProfile(page, { unlocked: true });
  182 |   await page.goto('/');
  183 |   await page.getByTestId('start-menu-profile').click();
  184 |   const futureResearchKey = 'gr.research.epoch-7-signal.v1';
  185 |   const envelope = {
  186 |     kind: 'goldrush.profile.ledger',
  187 |     version: 1,
  188 |     exportedAt: '2026-07-23T00:00:00.000Z',
  189 |     profile: { id: 'future', name: 'Future Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] },
  190 |     data: {
  191 |       [ACTIVE_EPOCH_KEY]: 'epoch-7-signal',
  192 |       [futureResearchKey]: { version: 1, epochId: 'epoch-7-signal', taken: ['signal-array'], proposalSalt: 0, pinnedTarget: null },
  193 |     },
  194 |   };
  195 |   await page.getByTestId('profile-import-file').setInputFiles({
  196 |     name: 'future-ledger.json',
  197 |     mimeType: 'application/json',
  198 |     buffer: Buffer.from(JSON.stringify(envelope)),
  199 |   });
  200 |   await page.getByTestId('profile-import-apply').click();
  201 |   const importedId = await page.evaluate((profileKey) => {
  202 |     const state = JSON.parse(localStorage.getItem(profileKey) ?? '{}') as ProfileState;
  203 |     return state.profiles.find((profile) => profile.name === 'Future Robin')?.id ?? '';
  204 |   }, PROFILE_KEY);
  205 |   expect(importedId).not.toBe('');
  206 |   expect(await page.evaluate((key) => localStorage.getItem(key), profileDataKey(importedId, futureResearchKey))).not.toBeNull();
  207 |   await page.goto('/?contract=the-claim');
  208 |   await waitForContract(page, 'the-claim');
  209 |   expect(await page.evaluate((key) => localStorage.getItem(key), profileDataKey(importedId, ACTIVE_EPOCH_KEY))).toBe(FRONTIER);
  210 |   expect(await page.evaluate((key) => localStorage.getItem(key), profileDataKey(importedId, futureResearchKey))).not.toBeNull();
  211 |   expectNoConsoleErrors(watch);
  212 | });
  213 | 
  214 | test('later contract URLs and modes decline to the Claim', async ({ page }) => {
  215 |   const watch = watchErrors(page);
  216 |   await seedProfile(page, { unlocked: true });
  217 |   for (const query of ['contract=e2-hill-mine&mode=escort', 'contract=e7-relay-valley', 'contract=e10-last-claim']) {
  218 |     await page.goto(`/?${query}`);
  219 |     await waitForContract(page, 'the-claim');
  220 |   }
  221 |   expectNoConsoleErrors(watch);
  222 | });
  223 | 
  224 | test('a forged locked launch declines to the Claim', async ({ page }) => {
  225 |   const watch = watchErrors(page);
  226 |   await seedProfile(page, { contractId: 'e1-baron', unlocked: false });
  227 |   await page.goto('/?contract=e1-baron');
  228 |   await waitForContract(page, 'the-claim');
  229 |   expect(await page.evaluate((key) => sessionStorage.getItem(key), LAUNCH_KEY)).toBeNull();
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
> 248 |   })).not.toThrow();
      |           ^ Error: expect(received).not.toThrow()
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
  330 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.harvest.channeling)).toBe(true);
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
```