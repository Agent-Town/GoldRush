# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: en-02-e1-coverage.spec.ts >> EN-02 enemy stats reveal once, persist, and hero facts live-read abilities
- Location: e2e/en-02-e1-coverage.spec.ts:407:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0

Call Log:
- Timeout 12000ms exceeded while waiting on the predicate
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
          - strong: "0"
      - region "Gold pouch":
        - strong: "0"
      - region "Active weapon":
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
          - strong: 4 / 12 XP
      - region "Build":
        - button "Build" [ref=e10]
      - button "Pause the claim" [ref=e11]: catch your breathⅡ
      - generic [ref=e12]:
        - text: Swipe to scroll
        - group [ref=e13]:
          - generic "Claim Stake" [ref=e14] [cursor=pointer]
          - paragraph [ref=e15]: The heart of the claim. Lose it and the run is done.
    - generic:
      - button [ref=e18]: Rotate
      - button [ref=e19]: Weapon
      - button [ref=e20]: OK
    - region
    - status [ref=e21] [cursor=pointer]:
      - generic [ref=e22]:
        - paragraph [ref=e23]: Assay Clerk
        - paragraph [ref=e24]: "The ledger gains a page: Claim Jumper measurements."
        - paragraph [ref=e25]: Open it before the next trail.
    - text: None None None
  - generic [ref=e26]:
    - button "▸ Game tuning" [ref=e27] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e28]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  335 |   for (const id of [...BUILDING_ENTRY_IDS, ...ENEMY_ENTRY_IDS, ...CHARACTER_ENTRY_IDS, ...CONTRACT_ENTRY_IDS]) {
  336 |     await expect(page.getByTestId(`claim-ledger-card-${id}`)).toHaveCount(1);
  337 |   }
  338 |   await expectFactCap(page);
  339 |   await expectNoInternalLedgerText(page);
  340 |   await expectCharacterQuotes(page);
  341 |   await shot(page, testInfo, 'full-shelves-populated');
  342 |   await page.getByTestId('claim-ledger-card-hero').scrollIntoViewIfNeeded();
  343 |   await taskShot(page, testInfo, 'character-quote-hero');
  344 | 
  345 |   expectNoErrors(errors);
  346 | });
  347 | 
  348 | test('EN-02 town board and bark discover contracts and townsfolk', async ({ page }) => {
  349 |   await seedProfile(page);
  350 |   const errors = collectErrors(page);
  351 | 
  352 |   await page.goto('/');
  353 |   await page.getByTestId('start-menu-enter-town').click();
  354 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  355 |   await approachTavern(page);
  356 |   await standAtTownActor(page, 'tavernkeeper');
  357 |   await expect(page.getByTestId('town-bark-card')).toHaveAttribute('data-actor-id', 'tavernkeeper');
  358 |   await expect.poll(() => ledgerStorage(page)).toContain(townActorLedgerEntryById.tavernkeeper);
  359 | 
  360 |   await page.getByTestId('town-open-board').click();
  361 |   await expect(page.getByTestId('contract-board')).toBeVisible();
  362 |   for (const id of CONTRACT_ENTRY_IDS) {
  363 |     await expect.poll(() => ledgerStorage(page)).toContain(id);
  364 |   }
  365 | 
  366 |   expectNoErrors(errors);
  367 | });
  368 | 
  369 | test('EN-02 locked contract ledger pages keep terms hidden until unlock', async ({ page }, testInfo) => {
  370 |   await seedProfile(page);
  371 |   const errors = collectErrors(page);
  372 |   const contract = loadContract('e1-dry-gulch');
  373 |   const entryId = contractLedgerEntryById[contract.id]!;
  374 | 
  375 |   await page.goto('/');
  376 |   await page.getByTestId('start-menu-enter-town').click();
  377 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  378 |   await approachTavern(page);
  379 |   await page.getByTestId('town-open-board').click();
  380 |   await expect(page.getByTestId('contract-board')).toBeVisible();
  381 |   await expect.poll(() => ledgerStorage(page)).toContain(entryId);
  382 | 
  383 |   await openLedgerDirect(page, entryId);
  384 |   const lockedCard = page.getByTestId(`claim-ledger-card-${entryId}`);
  385 |   await expect(lockedCard).toHaveAttribute('data-ledger-discovered', 'true');
  386 |   await expect(lockedCard).toContainText(contract.boardRow.name);
  387 |   await expect(lockedCard).toContainText(contract.boardRow.ledgerBlurb);
  388 |   await expect(lockedCard).toContainText('Reach wave 10 on The Claim');
  389 |   await expect(lockedCard).toContainText("The clerk draws up the terms when you're ready.");
  390 |   for (const line of [...contract.briefing.goals, ...contract.briefing.rules]) await expect(lockedCard).not.toContainText(line);
  391 |   await lockedCard.scrollIntoViewIfNeeded();
  392 |   await mysteryLeakShot(page, testInfo, 'locked-contract-teaser');
  393 |   await closeLedger(page);
  394 | 
  395 |   await seedScoreboard(page, [{ waves: 10, contractId: DEFAULT_CONTRACT_ID }]);
  396 |   await openLedgerDirect(page, entryId);
  397 |   const unlockedCard = page.getByTestId(`claim-ledger-card-${entryId}`);
  398 |   await expect(unlockedCard).toContainText(contract.briefing.goals[0]!);
  399 |   await expect(unlockedCard).toContainText(contract.briefing.rules[0]!);
  400 |   await expect(unlockedCard).not.toContainText("The clerk draws up the terms when you're ready.");
  401 |   await unlockedCard.scrollIntoViewIfNeeded();
  402 |   await mysteryLeakShot(page, testInfo, 'unlocked-contract-terms');
  403 | 
  404 |   expectNoErrors(errors);
  405 | });
  406 | 
  407 | test('EN-02 enemy stats reveal once, persist, and hero facts live-read abilities', async ({ page }, testInfo) => {
  408 |   test.setTimeout(75_000);
  409 |   await seedProfile(page, ['claim_jumper']);
  410 |   const errors = collectErrors(page);
  411 | 
  412 |   await page.goto('/?debug&nowaves&nolevel&seed=en-02-enemy-stats');
  413 |   await waitForGame(page);
  414 |   await openLedgerDirect(page, 'claim_jumper');
  415 |   const claimJumper = page.getByTestId('claim-ledger-card-claim_jumper');
  416 |   await expect(claimJumper).toHaveAttribute('data-ledger-discovered', 'true');
  417 |   await expect(claimJumper).toContainText('Claim Jumper');
  418 |   await expect(page.getByTestId('claim-ledger-facts-claim_jumper')).toContainText('Not yet measured');
  419 |   await expect(claimJumper.getByTestId('claim-ledger-locked-silhouette')).toHaveCount(1);
  420 |   await shot(page, testInfo, 'enemy-pre-kill-not-measured');
  421 |   await closeLedger(page);
  422 | 
  423 |   await page.evaluate(() => {
  424 |     window.__GR_TEST__?.setBalance('enemy.hp', 1);
  425 |     window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
  426 |     window.__GR_TEST__?.setBalance('sparkRig.damage', 999);
  427 |     window.__GR_TEST__?.setBalance('sparkRig.fireRate', 30);
  428 |     window.__GR_TEST__?.clearEnemies();
  429 |     window.__GR_TEST__?.spawnPack(1, 4, { speedScale: 0 });
  430 |   });
  431 |   await expect.poll(() => ledgerStorage(page), { timeout: 12_000 }).toContain('claim_jumper_stats');
  432 |   // The hint is written only when the story card is SHOWN (StoryRuntime.show -> markStoryBeatSeen),
  433 |   // so this wait is gated behind the card queue: residual CARD_MS (6000) + GAP_MS (3000) = 9s worst
  434 |   // case. The 5000ms poll default sits BELOW that floor, which made this a ~50% flake (F-1337-1).
> 435 |   await expect.poll(() => storyHintCount(page, 'story:ledger-page:claim_jumper_stats'), { timeout: 12_000 }).toBe(1);
      |                                                                                                              ^ Error: expect(received).toBe(expected) // Object.is equality
  436 | 
  437 |   await openLedgerDirect(page, 'claim_jumper');
  438 |   await expect(page.getByTestId('claim-ledger-facts-claim_jumper')).not.toContainText('Not yet measured');
  439 |   await expect(page.getByTestId('claim-ledger-facts-claim_jumper')).toContainText('HP: 1');
  440 |   await expect(claimJumper.getByTestId('claim-ledger-locked-silhouette')).toHaveCount(0);
  441 |   await shot(page, testInfo, 'enemy-post-kill-stats');
  442 |   await closeLedger(page);
  443 | 
  444 |   const kills = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.kills ?? 0);
  445 |   await page.evaluate(() => {
  446 |     window.__GR_TEST__?.clearEnemies();
  447 |     window.__GR_TEST__?.spawnPack(1, 4, { speedScale: 0 });
  448 |   });
  449 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.kills ?? 0), { timeout: 12_000 }).toBeGreaterThan(kills);
  450 |   // Same card-queue floor as above; the dupe guard proper is the toHaveLength(1) on the next line.
  451 |   await expect.poll(() => storyHintCount(page, 'story:ledger-page:claim_jumper_stats'), { timeout: 12_000 }).toBe(1);
  452 |   expect((await ledgerStorage(page)).filter((id) => id === 'claim_jumper_stats')).toHaveLength(1);
  453 | 
  454 |   await page.reload();
  455 |   await waitForGame(page);
  456 |   await page.evaluate(() => window.__GR_TEST__?.setUpgradeStacks({ powder_charge: 1, wide_ring: 1 }));
  457 |   await expect
  458 |     .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.arsenal.blastDamage ?? 0), { timeout: 8_000 })
  459 |     .toBeGreaterThan(20);
  460 |   await openLedgerDirect(page, 'hero');
  461 |   await expect(page.getByTestId('claim-ledger-facts-claim_jumper')).not.toContainText('Not yet measured');
  462 |   await expect(page.getByTestId('claim-ledger-facts-claim_jumper')).toContainText('HP:');
  463 |   await expect(page.getByTestId('claim-ledger-facts-hero')).toContainText(/blast 25 dmg\/2\.5wu/);
  464 |   await expect(page.getByTestId('claim-ledger-card-hero').getByTestId('claim-ledger-character-quote')).toHaveCount(1);
  465 |   await shot(page, testInfo, 'hero-live-ability-and-persisted-stats');
  466 |   await expectFactCap(page);
  467 | 
  468 |   expectNoErrors(errors);
  469 | });
  470 | 
```