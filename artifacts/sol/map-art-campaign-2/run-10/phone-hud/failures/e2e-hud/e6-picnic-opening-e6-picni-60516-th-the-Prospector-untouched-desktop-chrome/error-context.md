# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e6-picnic-opening.spec.ts >> e6-picnic: the opening the card describes >> an unbuilt Picnic ends on the sandwiches, with the Prospector untouched
- Location: e2e/e6-picnic-opening.spec.ts:386:3

# Error details

```
Error: an unbuilt run does end — this is a hold map, not a stroll

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - generic:
    - generic "Wave status":
      - generic:
        - generic: Brass warning on the west ridge!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 100 / 100
      - generic:
        - generic: Time
        - strong: 00:29
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
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 00:24 - Gathered 4 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "1"
        - strong: 8 / 12 XP
    - region "Build":
      - button "Build" [ref=e11]
    - button "Pause the claim" [ref=e12]: P - catch your breath
    - group [ref=e13]:
      - generic "Claim Stake" [ref=e14] [cursor=pointer]
  - region
```

# Test source

```ts
  345 |         } catch {}
  346 |         try {
  347 |           sessionStorage.clear();
  348 |           sessionStorage.setItem(launchKey, launchValue);
  349 |         } catch {}
  350 |       },
  351 |       { entries: seedEntries(), launchKey: 'gr.contract.launch.v1', launchValue: CONTRACT_ID },
  352 |     );
  353 |     await page.goto(`/?contract=${CONTRACT_ID}&seed=${SEED}-card`);
  354 |     await expect(page.getByTestId('contract-briefing')).toBeVisible({ timeout: 60_000 });
  355 |     await expect(page.getByTestId('contract-briefing-name')).toHaveText('The Picnic');
  356 | 
  357 |     const goals = await page.getByTestId('contract-briefing-goals').locator('li').allTextContents();
  358 |     const rules = await page.getByTestId('contract-briefing-rules').locator('li').allTextContents();
  359 |     const card = [...goals, ...rules].join(' ');
  360 | 
  361 |     // The four facts an unbuilt player needed and the old card never gave. Each is asserted as the
  362 |     // FACT, not as one sentence, so the copy can be re-voiced without silently dropping a warning.
  363 |     expect(card, 'the loss condition is stated').toMatch(/lose all three/i);
  364 |     expect(card, 'and that health is not the clock').toMatch(/whatever your health says/i);
  365 |     expect(card, 'the six-second stake clock is stated').toMatch(/six seconds/i);
  366 |     expect(card, 'the defender rule is stated').toMatch(/standing work within three units/i);
  367 |     expect(card, 'the first threat is timed').toMatch(/inside ten seconds/i);
  368 |     expect(card, 'and the opening is priced').toMatch(/palisade costs 10 gold/i);
  369 | 
  370 |     // The card is a card, not an essay: this stays inside the shape the board already ships
  371 |     // (max across all 42 contracts before this change: 3 goals, 5 rules).
  372 |     expect(goals.length, 'goal rows stay within the board-wide maximum').toBeLessThanOrEqual(3);
  373 |     expect(rules.length, 'rule rows stay within the board-wide maximum').toBeLessThanOrEqual(5);
  374 | 
  375 |     // On a 390px screen an over-long card is a card the player never finishes reading.
  376 |     const box = await page.getByTestId('contract-briefing').boundingBox();
  377 |     const viewport = page.viewportSize();
  378 |     expect(box, 'the run card is laid out').not.toBeNull();
  379 |     expect(box!.height, 'the run card still fits the viewport').toBeLessThanOrEqual(viewport!.height);
  380 | 
  381 |     await page.screenshot({ path: `artifacts/e6-picnic/shots/card-${testInfo.project.name}.png`, scale: 'css' });
  382 |     expect(errors.console, 'zero console errors').toEqual([]);
  383 |     expect(errors.page, 'zero page errors').toEqual([]);
  384 |   });
  385 | 
  386 |   test('an unbuilt Picnic ends on the sandwiches, with the Prospector untouched', async ({ page }, testInfo: TestInfo) => {
  387 |     test.setTimeout(180_000);
  388 |     const errors = watchErrors(page);
  389 |     await bootPicnic(page);
  390 |     await installTimeline(page);
  391 | 
  392 |     const opening = await snapshot(page);
  393 |     expect(opening.stakes.map((entry) => entry.id), 'the three sandwiches are live').toEqual([
  394 |       'sandwich-west',
  395 |       'sandwich-center',
  396 |       'sandwich-east',
  397 |     ]);
  398 |     expect(opening.stakes.every((entry) => !entry.claimed), 'nothing is claimed at the whistle').toBe(true);
  399 | 
  400 |     // F-PICNIC-2: the same rows read through the DECLARED type with no cast anywhere, so the
  401 |     // declaration is checked against the running engine rather than merely existing. `position`
  402 |     // and `held` are the two fields the old local widening did not know about, which is the whole
  403 |     // shape of the finding: the spec had been asserting a type it invented.
  404 |     const declared = await page.evaluate(() =>
  405 |       (window.__THREE_GAME_DIAGNOSTICS__?.picnicHold ?? []).map((stake) => ({
  406 |         id: stake.id,
  407 |         position: stake.position,
  408 |         held: stake.held,
  409 |         claimed: stake.claimed,
  410 |       })),
  411 |     );
  412 |     expect(declared.map(({ id }) => id), 'the declared key carries the same three stakes').toEqual([
  413 |       'sandwich-west',
  414 |       'sandwich-center',
  415 |       'sandwich-east',
  416 |     ]);
  417 |     expect(
  418 |       declared.every(({ held, claimed }) => held === !claimed),
  419 |       "`held` is the system's own invariant, not a field this spec invented",
  420 |     ).toBe(true);
  421 |     expect(
  422 |       declared.every(({ position }) => Number.isFinite(position?.x) && Number.isFinite(position?.z)),
  423 |       'every stake publishes the world point it is held at',
  424 |     ).toBe(true);
  425 | 
  426 |     // No input at all: this is the null floor, played in the browser. `levelup` is a run STATE
  427 |     // (`src/game/GameState.ts:1`), not an ending — an unbuilt hero still earns cards off the
  428 |     // machines the meadow sends, so the wait takes the offered card and keeps waiting for 'dead'.
  429 |     const ended = await page
  430 |       .waitForFunction(
  431 |         () => {
  432 |           const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
  433 |           if (!diagnostics) return false;
  434 |           if (diagnostics.runState === 'levelup') {
  435 |             (document.querySelector('[data-testid="upgrade-card-0"]') as HTMLElement | null)?.click();
  436 |             return false;
  437 |           }
  438 |           return diagnostics.runState === 'dead';
  439 |         },
  440 |         undefined,
  441 |         { timeout: 150_000 },
  442 |       )
  443 |       .then(() => true)
  444 |       .catch(() => false);
> 445 |     expect(ended, 'an unbuilt run does end — this is a hold map, not a stroll').toBe(true);
      |                                                                                 ^ Error: an unbuilt run does end — this is a hold map, not a stroll
  446 | 
  447 |     const final = await snapshot(page);
  448 |     expect(final.stakes.every((entry) => entry.claimed), 'the loss is all-stakes-claimed').toBe(true);
  449 |     // THE CORRECTION TO F-SMOKE-2: the Prospector is not what died.
  450 |     expect(final.hp, 'the hero is alive and unhurt when the run ends').toBeGreaterThan(0);
  451 | 
  452 |     const timeline = await readTimeline(page);
  453 |     testInfo.annotations.push({ type: 'unbuilt-timeline', description: JSON.stringify({ ...timeline, endWave: final.wave, endHp: final.hp, maxHp: final.maxHp }) });
  454 |     await page.screenshot({ path: `artifacts/e6-picnic/shots/unbuilt-${testInfo.project.name}.png`, scale: 'css' });
  455 |     expect(errors.console, 'zero console errors').toEqual([]);
  456 |     expect(errors.page, 'zero page errors').toEqual([]);
  457 |   });
  458 | 
  459 |   test('one panned palisade on a sandwich holds the meadow past sixty seconds and into wave 2', async ({ page }, testInfo: TestInfo) => {
  460 |     test.setTimeout(300_000);
  461 |     const errors = watchErrors(page);
  462 |     await bootPicnic(page);
  463 |     await installTimeline(page);
  464 | 
  465 |     // BEAT 1 — pan the meadow seam. The card names it: the machines come before the gold does.
  466 |     await panTo(page, PALISADE_COST, 60_000);
  467 |     const panned = await snapshot(page);
  468 |     expect(panned.gold, 'the seam paid for a palisade').toBeGreaterThanOrEqual(PALISADE_COST);
  469 | 
  470 |     // BEAT 2 — fence a sandwich. Any standing structure inside the 3wu disc contests it.
  471 |     let fenced: string | null = null;
  472 |     for (const sandwich of SANDWICHES) {
  473 |       const shot = await snapshot(page);
  474 |       if (stakeOf(shot, sandwich.id)?.claimed) continue;
  475 |       if (shot.gold < PALISADE_COST) await panTo(page, PALISADE_COST, 45_000).catch(() => undefined);
  476 |       if (await fence(page, sandwich)) {
  477 |         fenced = sandwich.id;
  478 |         break;
  479 |       }
  480 |     }
  481 |     expect(fenced, 'a 10-gold palisade went up on a live sandwich').not.toBeNull();
  482 | 
  483 |     const afterFence = await snapshot(page);
  484 |     const guarded = SANDWICHES.find((entry) => entry.id === fenced)!;
  485 |     // `build.palisadePositions` is the ACTIVE list (`BuildSystem.activePositions`), so a wrecked
  486 |     // fence drops out of it — which is the read that makes 'the sandwich is guarded' checkable.
  487 |     const palisades: Array<{ x: number; z: number }> = await page.evaluate(
  488 |       () => (window.__THREE_GAME_DIAGNOSTICS__?.build?.palisadePositions ?? []) as Array<{ x: number; z: number }>,
  489 |     );
  490 |     expect(palisades.length, 'the palisade is standing').toBeGreaterThan(0);
  491 |     expect(
  492 |       Math.min(...palisades.map((entry) => Math.hypot(entry.x - guarded.x, entry.z - guarded.z))),
  493 |       'the palisade sits inside the sandwich hold disc',
  494 |     ).toBeLessThanOrEqual(HOLD_RADIUS);
  495 |     // 'levelup' is a live state, not an ending — the sim is frozen holding a card out to the
  496 |     // player (`src/game/GameState.ts:1`). The claim here is that the run has NOT ended, so that is
  497 |     // what is asserted; a `toBe('playing')` reds on a level-up that arrives one frame after the
  498 |     // fence, which is what it did on desktop-chrome the first time both projects ran.
  499 |     expect(afterFence.runState, 'the run has not ended when the fence goes up').not.toBe('dead');
  500 | 
  501 |     // BEAT 3 — hold. The hero walks back to the seam and keeps panning, as a player would.
  502 |     await moveHeroTo(page, MEADOW_SEAM.x, MEADOW_SEAM.z).catch(() => undefined);
  503 |     const reached = await page
  504 |       .waitForFunction(
  505 |         () => {
  506 |           const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
  507 |           if (!diagnostics) return false;
  508 |           // `levelup` freezes the sim until a card is taken — take one and keep holding. Only
  509 |           // 'dead' ends the wait early, and the assertions below then read the real failure.
  510 |           if (diagnostics.runState === 'levelup') {
  511 |             (document.querySelector('[data-testid="upgrade-card-0"]') as HTMLElement | null)?.click();
  512 |             return false;
  513 |           }
  514 |           if (diagnostics.runState === 'dead') return true;
  515 |           return Number(diagnostics.timeAlive) > 60 && Number(diagnostics.wave) >= 2;
  516 |         },
  517 |         undefined,
  518 |         { timeout: 200_000 },
  519 |       )
  520 |       .then(() => true)
  521 |       .catch(() => false);
  522 |     expect(reached, 'the run reached the sixty-second / wave-2 mark').toBe(true);
  523 | 
  524 |     const held = await snapshot(page);
  525 |     expect(held.runState, 'the fenced run has not ended at the mark').not.toBe('dead');
  526 |     expect(held.timeAlive, 'past sixty simulated seconds').toBeGreaterThan(60);
  527 |     expect(held.wave, 'and into wave 2').toBeGreaterThanOrEqual(2);
  528 |     expect(stakeOf(held, guarded.id)?.claimed, `${guarded.id} is still the town's`).toBe(false);
  529 |     expect(held.stakes.filter((entry) => !entry.claimed).length, 'at least one sandwich survives').toBeGreaterThan(0);
  530 |     // The unbuilt run above is gone by now on the same seed; this one is still being played.
  531 |     const stillFenced: Array<{ x: number; z: number }> = await page.evaluate(
  532 |       () => (window.__THREE_GAME_DIAGNOSTICS__?.build?.palisadePositions ?? []) as Array<{ x: number; z: number }>,
  533 |     );
  534 |     expect(
  535 |       stillFenced.some((entry) => Math.hypot(entry.x - guarded.x, entry.z - guarded.z) <= HOLD_RADIUS),
  536 |       'the fence is still standing on the sandwich at the mark',
  537 |     ).toBe(true);
  538 | 
  539 |     const timeline = await readTimeline(page);
  540 |     testInfo.annotations.push({ type: 'opening-timeline', description: JSON.stringify({ ...timeline, fenced, atMarkWave: held.wave, atMarkSeconds: Number(held.timeAlive.toFixed(2)), hp: held.hp, stakesHeld: held.stakes.filter((entry) => !entry.claimed).map((entry) => entry.id) }) });
  541 |     await page.screenshot({ path: `artifacts/e6-picnic/shots/opening-${testInfo.project.name}.png`, scale: 'css' });
  542 |     expect(errors.console, 'zero console errors').toEqual([]);
  543 |     expect(errors.page, 'zero page errors').toEqual([]);
  544 |   });
  545 | });
```