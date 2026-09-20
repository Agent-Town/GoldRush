# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e1-night-shift.spec.ts >> a lantern pool makes only its build island readable at true dark
- Location: e2e/e1-night-shift.spec.ts:435:1

# Error details

```
Error: {"inside":0.16630588235294116,"outside":0.07644470588235293}

expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 3
Received:    2.175505555726554
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
          - strong: 00:16
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
      - button "Pause the claim" [ref=e11]: P - catch your breath
      - generic:
        - status:
          - strong: Lantern Post
          - paragraph: A cheap light post for Night Shift. It keeps danger readable in the dark.
    - region
    - text: None None None
  - generic [ref=e12]:
    - button "▸ Game tuning" [ref=e13] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e14]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
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
> 450 |   expect(ratio, JSON.stringify({ inside, outside })).toBeGreaterThanOrEqual(3);
      |                                                      ^ Error: {"inside":0.16630588235294116,"outside":0.07644470588235293}
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
  506 |     '?debug&contract=e1-night-shift&timescale=1&nolevel&nowaves&seed=e1-night-suspend',
  507 |   );
  508 |   await restoredPage.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true);
  509 |   await expect(restoredPage.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave)).resolves.toBe(1);
  510 |   await expect(
  511 |     restoredPage.evaluate(() => (window.__THREE_GAME_DIAGNOSTICS__?.build as unknown as { lanternPostRotations: number[] }).lanternPostRotations),
  512 |   ).resolves.toEqual(COLD_LANTERNS.map(({ rotationSteps }) => rotationSteps));
  513 |   await shot(restoredPage, test.info(), 'authored-lantern-rotations-after-restore');
  514 |   await expect.poll(() => lanternHp(restoredPage).then((entries) => entries[0]?.repairCost)).toBe(RELIGHT_COST);
  515 |   expect(await relightLantern(restoredPage, 0)).toMatchObject({ id: 'lantern_post', index: 0, cost: RELIGHT_COST });
  516 |   await expectClean(restoredErrors);
  517 |   await restoredPage.close();
  518 | });
  519 | 
  520 | test('pre-placed lanterns leave the full player build cap available', async ({ page }, testInfo) => {
  521 |   const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=1&nolevel&nowaves&seed=e1-night-player-cap');
  522 |   const placed = await page.evaluate((maxCount) => {
  523 |     const game = window.__GR_TEST__!;
  524 |     let count = 0;
  525 |     for (let x = -28; x <= 28 && count < maxCount; x += 7) {
  526 |       if (game.placeFree('lantern_post', x, 28)) count += 1;
  527 |     }
  528 |     return count;
  529 |   }, Balance.lanternPost.maxCount);
  530 | 
  531 |   expect(placed).toBe(Balance.lanternPost.maxCount);
  532 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPosts)).toBe(
  533 |     COLD_LANTERNS.length + Balance.lanternPost.maxCount,
  534 |   );
  535 |   expect(
  536 |     await page.evaluate(() =>
  537 |       window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildables.find((entry) => entry.id === 'lantern_post')?.count,
  538 |     ),
  539 |   ).toBe(Balance.lanternPost.maxCount);
  540 |   const ownership = await page.evaluate(() => {
  541 |     const game = window.__GR_TEST__!;
  542 |     const snapshot = game.captureSuspend();
  543 |     const before = snapshot.buildings.filter((entry) => entry.id === 'lantern_post').map((entry) => entry.preplaced === true);
  544 |     const restored = game.restoreSuspend(snapshot);
  545 |     const after = game.captureSuspend().buildings.filter((entry) => entry.id === 'lantern_post').map((entry) => entry.preplaced === true);
  546 |     return { before, restored, after };
  547 |   });
  548 |   expect(ownership.restored).toBe(true);
  549 |   expect(ownership.before).toEqual([...Array(COLD_LANTERNS.length).fill(true), ...Array(Balance.lanternPost.maxCount).fill(false)]);
  550 |   expect(ownership.after).toEqual(ownership.before);
```