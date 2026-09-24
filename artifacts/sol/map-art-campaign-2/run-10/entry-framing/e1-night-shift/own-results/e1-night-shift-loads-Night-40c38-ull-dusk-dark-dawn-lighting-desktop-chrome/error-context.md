# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e1-night-shift.spec.ts >> loads Night Shift contract data and ramps full, dusk, dark, dawn lighting
- Location: e2e/e1-night-shift.spec.ts:271:1

# Error details

```
Error: expect(received).toMatchObject(expected)

- Expected  - 2
+ Received  + 2

  Object {
-   "fogFar": 42,
-   "fogNear": 18,
+   "fogFar": 58,
+   "fogNear": 34,
  }

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
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
          - strong: 00:57
        - generic:
          - generic: Wave
          - strong: "10"
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
      - group [ref=e12]:
        - generic "Claim Stake" [ref=e13] [cursor=pointer]
        - paragraph [ref=e14]: The heart of the claim. Lose it and the run is done.
    - region
    - generic:
      - status:
        - generic:
          - paragraph: Tavernkeeper
          - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
          - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
    - text: None None None
  - generic [ref=e15]:
    - button "▸ Game tuning" [ref=e16] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e17]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  239 | async function groundLuminances(page: Page, points: readonly { x: number; z: number }[]): Promise<number[]> {
  240 |   const screen = await page.evaluate((worldPoints) => worldPoints.map((point) => window.__GR_TEST__?.screenPoint(point.x, point.z, 0.03) ?? null), points);
  241 |   expect(screen.every((point) => point?.inView)).toBe(true);
  242 |   const canvas = page.locator('#game-canvas');
  243 |   const [box, buffer] = await Promise.all([canvas.boundingBox(), canvas.screenshot()]);
  244 |   expect(box).toBeTruthy();
  245 |   const png = PNG.sync.read(buffer);
  246 | 
  247 |   return screen.map((point) => {
  248 |     const centerX = Math.round(point!.x * png.width / box!.width);
  249 |     const centerY = Math.round(point!.y * png.height / box!.height);
  250 |     const samples: number[] = [];
  251 |     for (let y = centerY - 4; y <= centerY + 4; y += 1) {
  252 |       for (let x = centerX - 4; x <= centerX + 4; x += 1) {
  253 |         const offset = (y * png.width + x) * 4;
  254 |         samples.push((0.2126 * png.data[offset]! + 0.7152 * png.data[offset + 1]! + 0.0722 * png.data[offset + 2]!) / 255);
  255 |       }
  256 |     }
  257 |     samples.sort((a, b) => a - b);
  258 |     return samples[Math.floor(samples.length / 2)] ?? 0;
  259 |   });
  260 | }
  261 | 
  262 | function visibleThreats(lights: readonly number[]): number {
  263 |   return lights.filter((light) => light >= VISIBLE_LIGHT).length;
  264 | }
  265 | 
  266 | async function expectClean(errors: ErrorBucket): Promise<void> {
  267 |   expect(errors.consoleErrors).toEqual([]);
  268 |   expect(errors.pageErrors).toEqual([]);
  269 | }
  270 | 
  271 | test('loads Night Shift contract data and ramps full, dusk, dark, dawn lighting', async ({ page }, testInfo) => {
  272 |   const errors = await openGame(page);
  273 |   const snapshot = await page.evaluate(() => ({
  274 |     diagnostics: window.__THREE_GAME_DIAGNOSTICS__?.contract,
  275 |     registry: window.__GR_CONTRACT_REGISTRY__?.loadContract('e1-night-shift'),
  276 |     active: window.__GR_TEST__?.activeContract(),
  277 |     simTile: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim.tile,
  278 |     menuIds: window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables.map((entry) => entry.id),
  279 |     lighting: window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift,
  280 |   }));
  281 | 
  282 |   expect(snapshot.diagnostics?.activeId).toBe('e1-night-shift');
  283 |   expect(snapshot.active?.id).toBe('e1-night-shift');
  284 |   expect(snapshot.simTile).toBe('frontier-river-claim');
  285 |   expect(snapshot.menuIds).toContain('lantern_post');
  286 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPosts)).toBe(COLD_LANTERNS.length);
  287 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPostPositions)).toEqual(COLD_LANTERN_POSITIONS);
  288 |   expect(await lanternHp(page)).toEqual(
  289 |     COLD_LANTERNS.map(({ x, z }, index) => ({
  290 |       index,
  291 |       hp: 0,
  292 |       maxHp: 35,
  293 |       wrecked: true,
  294 |       repairCost: RELIGHT_COST,
  295 |       position: { x, z },
  296 |     })),
  297 |   );
  298 |   expect(snapshot.registry).toMatchObject({
  299 |     name: 'Night Shift',
  300 |     tileParams: {
  301 |       tileId: 'frontier-river-claim',
  302 |       river: true,
  303 |       ford: true,
  304 |       prePlacedBuildables: COLD_LANTERNS,
  305 |     },
  306 |     twist: {
  307 |       secureWave: 25,
  308 |       lightRamp: { duskWave: 5, darkWave: 10, dawnWave: 25 },
  309 |     },
  310 |     boardRow: {
  311 |       name: 'Night Shift',
  312 |       tags: ['vein-hunter'],
  313 |       unlock: 'science≥3',
  314 |     },
  315 |   });
  316 |   expect(snapshot.registry?.twist.lightRamp?.keyframes?.map((keyframe) => keyframe.phase)).toEqual([
  317 |     'full',
  318 |     'golden',
  319 |     'dusk',
  320 |     'dark',
  321 |   ]);
  322 |   expect(snapshot.diagnostics?.secureWave).toBe(25);
  323 |   expect(snapshot.lighting).toMatchObject({ enabled: true, phase: 'full', darkness: 0 });
  324 | 
  325 |   await setWave(page, 5);
  326 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.darkness ?? 1)).toBeLessThan(0.03);
  327 | 
  328 |   await setWave(page, 7);
  329 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.darkness ?? 0)).toBeGreaterThan(0.25);
  330 | 
  331 |   await setWave(page, 8);
  332 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.darkness ?? 0)).toBeGreaterThan(0.6);
  333 | 
  334 |   await setWave(page, 10);
  335 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift)).toMatchObject({
  336 |     phase: 'dark',
  337 |     darkness: 1,
  338 |   });
> 339 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting)).toMatchObject({
      |                                                                                             ^ Error: expect(received).toMatchObject(expected)
  340 |     fogNear: 18,
  341 |     fogFar: 42,
  342 |   });
  343 | 
  344 |   await setWave(page, 4);
  345 |   await page.waitForTimeout(80);
  346 |   const dayHero = await spriteLuminance(page, { x: 0, z: 0 });
  347 |   await setWave(page, 10);
  348 |   await page.waitForTimeout(80);
  349 |   const darkHero = await spriteLuminance(page, { x: 0, z: 0 });
  350 |   const heroRatio = darkHero / Math.max(dayHero, 0.001);
  351 |   const darkTint = snapshot.registry?.twist.lightRamp?.keyframes?.find((keyframe) => keyframe.phase === 'dark')?.spriteTint;
  352 |   expect(darkTint).toBe('#34405a');
  353 |   const linear = (channel: number): number => {
  354 |     const srgb = channel / 255;
  355 |     return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  356 |   };
  357 |   const tintLuminance = 0.2126 * linear(0x34) + 0.7152 * linear(0x40) + 0.0722 * linear(0x5a);
  358 |   expect(heroRatio, JSON.stringify({ dayHero, darkHero, heroRatio, tintLuminance })).toBeGreaterThan(tintLuminance - 0.04);
  359 |   expect(heroRatio, JSON.stringify({ dayHero, darkHero, heroRatio, tintLuminance })).toBeLessThan(tintLuminance + 0.04);
  360 |   await captureDuskStrip(page, testInfo);
  361 |   await writeFile(
  362 |     path.join(DUSK_ARTIFACT_DIR, `${testInfo.project.name}-hero-brightness.json`),
  363 |     JSON.stringify({ dayHero, darkHero, heroRatio, tintLuminance }, null, 2),
  364 |   );
  365 | 
  366 |   await setWave(page, 25);
  367 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightShift.phase)).toBe('dawn');
  368 |   await shot(page, testInfo, 'dawn-wave-25');
  369 |   await expectClean(errors);
  370 | });
  371 | 
  372 | test('lantern post is Night Shift gated and relights a true-dark light ring', async ({ page }, testInfo) => {
  373 |   const defaultErrors = await openGame(page, '?debug&timescale=3&nolevel&nowaves&seed=e1-night-default');
  374 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables.map((entry) => entry.id))).not.toContain(
  375 |     'lantern_post',
  376 |   );
  377 |   await expect(selectBuildable(page, 'lantern_post')).resolves.toBe(false);
  378 |   await expectClean(defaultErrors);
  379 | 
  380 |   const errors = await openGame(page);
  381 |   await setBalance(page, 'enemy.hp', 500);
  382 |   await setBalance(page, 'enemy.speed', 0);
  383 |   await setWave(page, 10);
  384 |   await expect(selectBuildable(page, 'lantern_post')).resolves.toBe(true);
  385 |   await page.evaluate(() => window.__GR_TEST__?.setBuildMode(false));
  386 |   const repair = await relightLantern(page, 0);
  387 |   expect(repair).toMatchObject({ id: 'lantern_post', index: 0, cost: RELIGHT_COST });
  388 | 
  389 |   const lantern = COLD_LANTERN_POSITIONS[0]!;
  390 |   const inRadius = { x: lantern.x + 4, z: lantern.z };
  391 |   const outOfRadius = { x: lantern.x + 12, z: lantern.z };
  392 |   await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), inRadius)).resolves.toBe(true);
  393 |   await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), outOfRadius)).resolves.toBe(true);
  394 |   await expect
  395 |     .poll(() => enemyLights(page))
  396 |     .toEqual(expect.arrayContaining([expect.any(Number), expect.any(Number)]));
  397 |   const light = await enemyLights(page);
  398 |   expect(light[0]).toBeLessThanOrEqual(DARK_LIGHT);
  399 |   expect(light.at(-1)).toBeGreaterThanOrEqual(VISIBLE_LIGHT);
  400 | 
  401 |   await teleport(page, (inRadius.x + outOfRadius.x) / 2, lantern.z + 8);
  402 |   await page.waitForTimeout(180);
  403 |   expect(await enemyLightNear(page, outOfRadius)).toBeLessThanOrEqual(DARK_LIGHT);
  404 |   expect(await enemyLightNear(page, inRadius)).toBeGreaterThanOrEqual(VISIBLE_LIGHT);
  405 |   expect(await spriteLuminance(page, outOfRadius)).toBeLessThanOrEqual(DARK_LIGHT);
  406 |   expect(await spriteLuminance(page, inRadius)).toBeGreaterThanOrEqual(VISIBLE_LIGHT);
  407 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.enemyDimming.sources)).toBeGreaterThanOrEqual(2);
  408 |   await shot(page, testInfo, 'true-dark-lantern-ring');
  409 | 
  410 |   await expectClean(errors);
  411 | });
  412 | 
  413 | test('lantern coverage is necessary for threat visibility', async ({ page }) => {
  414 |   const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=8&nolevel&nowaves&seed=e1-night-necessity');
  415 |   await setBalance(page, 'enemy.hp', 500);
  416 |   await setBalance(page, 'enemy.speed', 0);
  417 |   await setWave(page, 10);
  418 |   await teleport(page, 28, -28);
  419 |   await spawnAssault(page);
  420 |   const coldLights = await enemyLights(page);
  421 |   const coldVisible = visibleThreats(coldLights);
  422 |   expect(Math.max(...coldLights)).toBeLessThanOrEqual(DARK_LIGHT);
  423 | 
  424 |   await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  425 |   await relightLantern(page, 0);
  426 |   await teleport(page, 28, -28);
  427 |   await spawnAssault(page);
  428 |   const litLights = await enemyLights(page);
  429 |   const litVisible = visibleThreats(litLights);
  430 |   expect(litVisible - coldVisible).toBeGreaterThanOrEqual(3);
  431 |   expect(litVisible).toBeGreaterThanOrEqual(3);
  432 |   await expectClean(errors);
  433 | });
  434 | 
  435 | test('a lantern pool makes only its build island readable at true dark', async ({ page }, testInfo) => {
  436 |   const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=3&nolevel&nowaves&seed=e1-night-pool');
  437 |   await setWave(page, 10);
  438 |   await relightLantern(page, 0);
  439 |   const lantern = COLD_LANTERN_POSITIONS[0]!;
```