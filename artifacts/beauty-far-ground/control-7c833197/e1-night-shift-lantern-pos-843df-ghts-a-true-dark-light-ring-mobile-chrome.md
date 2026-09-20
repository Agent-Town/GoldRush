# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e1-night-shift.spec.ts >> lantern post is Night Shift gated and relights a true-dark light ring
- Location: e2e/e1-night-shift.spec.ts:372:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 0.06
Received:    0.1235035294117647
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
          - strong: 00:55
        - generic:
          - generic: Wave
          - strong: "10"
      - region "Gold pouch":
        - generic: Gold
        - strong: "12"
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
      - button "Pause the claim" [ref=e11]: catch your breath
    - generic:
      - button [ref=e14]: R
      - button [ref=e15]: Q
      - button [ref=e16]: OK
    - status [ref=e17] [cursor=pointer]:
      - generic [ref=e18]:
        - paragraph [ref=e19]: Assay Clerk
        - paragraph [ref=e20]: "The ledger gains a page: Claim Jumper."
        - paragraph [ref=e21]: Open it before the next trail.
    - region
    - text: None None None
  - generic [ref=e22]:
    - button "▸ Game tuning" [ref=e23] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e24]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
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
  339 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting)).toMatchObject({
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
> 405 |   expect(await spriteLuminance(page, outOfRadius)).toBeLessThanOrEqual(DARK_LIGHT);
      |                                                    ^ Error: expect(received).toBeLessThanOrEqual(expected)
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
  440 |   await teleport(page, lantern.x + 1, lantern.z + 1);
  441 |   await page.waitForTimeout(180);
  442 | 
  443 |   const [inside, outside] = await groundLuminances(page, [
  444 |     { x: lantern.x + 2, z: lantern.z },
  445 |     testInfo.project.name === 'mobile-chrome'
  446 |       ? { x: lantern.x, z: lantern.z + 8 }
  447 |       : { x: lantern.x + 11, z: lantern.z },
  448 |   ]);
  449 |   const ratio = inside / Math.max(outside, 0.001);
  450 |   expect(ratio, JSON.stringify({ inside, outside })).toBeGreaterThanOrEqual(3);
  451 |   expect(outside).toBeLessThanOrEqual(0.06);
  452 | 
  453 |   await teleport(page, lantern.x, lantern.z - 5);
  454 |   await grantGold(page, 100);
  455 |   await expect(selectBuildable(page, 'palisade')).resolves.toBe(true);
  456 |   await page.waitForTimeout(180);
  457 |   await aimBuildAt(page, { x: lantern.x, z: lantern.z + 1 });
  458 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostLight ?? 0)).toBeGreaterThan(0.2);
  459 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.lighting?.nightPools ?? 0)).toBeGreaterThanOrEqual(2);
  460 | 
  461 |   await mkdir(LANTERN_ARTIFACT_DIR, { recursive: true });
  462 |   await page.screenshot({ path: path.join(LANTERN_ARTIFACT_DIR, `${testInfo.project.name}-lit-build-island.png`) });
  463 |   await writeFile(
  464 |     path.join(LANTERN_ARTIFACT_DIR, `${testInfo.project.name}-brightness.json`),
  465 |     JSON.stringify({ inside, outside, ratio }, null, 2),
  466 |   );
  467 |   await testInfo.attach('lantern-brightness', {
  468 |     body: JSON.stringify({ inside, outside, ratio }, null, 2),
  469 |     contentType: 'application/json',
  470 |   });
  471 |   await teleport(page, 20, -20);
  472 |   await page.waitForTimeout(180);
  473 |   await aimBuildAt(page, { x: 20, z: -14 }, 3);
  474 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostLight ?? 1)).toBeLessThan(0.05);
  475 |   await expectClean(errors);
  476 | });
  477 | 
  478 | test('cold lantern relight costs survive run suspend and continue', async ({ page, context }) => {
  479 |   const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=40&nokill&nolevel&nosteal&nowreck&seed=e1-night-suspend');
  480 |   const saved = await waitForSavedNightWave(page, 1);
  481 |   expect(
  482 |     saved.buildings
  483 |       .filter((entry) => entry.id === 'lantern_post')
  484 |       .map((entry) => ({
  485 |         index: entry.index,
  486 |         wrecked: entry.wrecked,
  487 |         repairCostOverride: entry.repairCostOverride,
  488 |         position: entry.position,
  489 |         rotationSteps: entry.rotationSteps,
  490 |       })),
  491 |   ).toEqual(
  492 |     COLD_LANTERNS.map(({ x, z, rotationSteps }, index) => ({
  493 |       index,
  494 |       wrecked: true,
  495 |       repairCostOverride: RELIGHT_COST,
  496 |       position: { x, z },
  497 |       rotationSteps,
  498 |     })),
  499 |   );
  500 |   await expectClean(errors);
  501 |   await page.close();
  502 | 
  503 |   const restoredPage = await context.newPage();
  504 |   const restoredErrors = await openGame(
  505 |     restoredPage,
```