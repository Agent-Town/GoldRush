# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mp-02-lockstep.spec.ts >> town Ride Together card creates a claim word and joins two named riders
- Location: e2e/mp-02-lockstep.spec.ts:687:1

# Error details

```
TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
```

# Test source

```ts
  605 |       run.pages[1].keyboard.down('KeyD'),
  606 |       run.pages[2].keyboard.down('KeyS'),
  607 |       run.pages[3].keyboard.down('KeyA'),
  608 |     ]);
  609 |     try {
  610 |       await run.pages[0].waitForTimeout(400);
  611 |     } finally {
  612 |       await Promise.all([
  613 |         run.pages[0].keyboard.up('KeyW'),
  614 |         run.pages[1].keyboard.up('KeyD'),
  615 |         run.pages[2].keyboard.up('KeyS'),
  616 |         run.pages[3].keyboard.up('KeyA'),
  617 |       ]);
  618 |     }
  619 |     await Promise.all(run.pages.map((page) => waitForTick(page, moveStart + 240, 90_000)));
  620 | 
  621 |     const states = await Promise.all(run.pages.map(mpState));
  622 |     const games = await Promise.all(run.pages.map(gameDiagnostics));
  623 |     const hashedActorPairs = await Promise.all(run.pages.slice(1).map((page) =>
  624 |       syncedHashedActorDiagnostics(run.pages[0], page, moveStart + 60),
  625 |     ));
  626 |     const sharedTicks = commonHashTicks(states, moveStart);
  627 |     expect(sharedTicks.length).toBeGreaterThanOrEqual(7);
  628 |     expect(sharedTicks.at(-1)).toBeGreaterThanOrEqual(moveStart + 200);
  629 |     for (let index = 1; index < 4; index += 1) {
  630 |       for (const tick of sharedTicks) expect(hashAt(states[index], tick)).toBe(hashAt(states[0], tick));
  631 |       assertSameRosterSlots(hashedActorPairs[index - 1]![0], hashedActorPairs[index - 1]![1]);
  632 |       expect(games[index].economy.state).toEqual(games[0].economy.state);
  633 |       expect(games[index].progression.stacks).toEqual(games[0].progression.stacks);
  634 |     }
  635 |     for (const actor of hashedActorPairs[0]![0]) {
  636 |       expect(distance2d(actor.position, beforeMove[actor.name]!), `${actor.name} moved`).toBeGreaterThan(0.1);
  637 |     }
  638 |     for (const state of states) expect(state).toMatchObject({ paused: false, desyncs: 0, resyncs: 0, error: null });
  639 |     await shotQuadGrid(run.pages, testInfo, 'four-riders');
  640 | 
  641 |     await Promise.all(run.pages.map((page) => page.evaluate(() => window.__GR_TEST__?.endRunForTest())));
  642 |     for (const page of run.pages) {
  643 |       for (const player of QUAD_PLAYERS) await expect(page.getByTestId('mp-run-riders')).toContainText(`${player.name} of ${player.town}`);
  644 |     }
  645 |     const scores = await Promise.all(run.pages.map((page, index) => scoresFor(page, QUAD_PLAYERS[index]!.id)));
  646 |     expect(scores[0][0]?.gold).toBe(25);
  647 |     expect(scores.map((score) => sharedScoreShape(score[0]))).toEqual(Array(4).fill(sharedScoreShape(scores[0][0])));
  648 |     expect(run.errors).toEqual(Array(4).fill({ consoleErrors: [], pageErrors: [] }));
  649 |   } finally {
  650 |     await run.close();
  651 |   }
  652 | });
  653 | 
  654 | test('@slow one of four riders desyncs and all four converge again', async ({ browser }, testInfo) => {
  655 |   test.skip(testInfo.project.name !== 'desktop-chrome', 'one four-browser recovery proof is enough');
  656 |   test.setTimeout(180_000);
  657 |   const run = await openQuad(browser, await createRoom(), MP_QUERY, ['', '', '', '&mpDesyncAt=60']);
  658 |   try {
  659 |     await Promise.all(run.pages.flatMap((page) => [waitRoster(page, 4), waitForActors(page, 4)]));
  660 |     await Promise.all(run.pages.map((page) => page.waitForFunction(() => {
  661 |       const state = window.__GR_MP__?.state();
  662 |       return state && state.tick >= 140 && state.desyncs >= 1 && state.resyncs >= 1 && !state.paused;
  663 |     }, undefined, { timeout: 60_000 })));
  664 | 
  665 |     const recovered = await Promise.all(run.pages.map(mpState));
  666 |     const recoveredAt = Math.max(...recovered.map(({ lastResyncTick }) => lastResyncTick ?? 0));
  667 |     await Promise.all(run.pages.map((page) => waitForTick(page, recoveredAt + 120, 90_000)));
  668 |     const states = await Promise.all(run.pages.map(mpState));
  669 |     const sharedTicks = commonHashTicks(states, recoveredAt + 30);
  670 |     expect(sharedTicks.length).toBeGreaterThanOrEqual(3);
  671 |     expect(sharedTicks.at(-1)).toBeGreaterThanOrEqual(recoveredAt + 90);
  672 |     for (const tick of sharedTicks) {
  673 |       const hash = hashAt(states[0], tick);
  674 |       for (const state of states.slice(1)) expect(hashAt(state, tick)).toBe(hash);
  675 |     }
  676 |     for (const state of states) {
  677 |       expect(state).toMatchObject({ started: true, partySize: 4, paused: false, error: null });
  678 |       expect(state.desyncs).toBeGreaterThanOrEqual(1);
  679 |       expect(state.resyncs).toBeGreaterThanOrEqual(1);
  680 |     }
  681 |     expect(run.errors).toEqual(Array(4).fill({ consoleErrors: [], pageErrors: [] }));
  682 |   } finally {
  683 |     await run.close();
  684 |   }
  685 | });
  686 | 
  687 | test('town Ride Together card creates a claim word and joins two named riders', async ({ browser }, testInfo) => {
  688 |   test.skip(testInfo.project.name !== 'desktop-chrome', 'one two-tab town flow proof is enough');
  689 |   test.setTimeout(70_000);
  690 |   const aliceContext = await browser.newContext();
  691 |   const bobContext = await browser.newContext();
  692 |   const alice = await aliceContext.newPage();
  693 |   const bob = await bobContext.newPage();
  694 |   const aliceErrors = collectErrors(alice);
  695 |   const bobErrors = collectErrors(bob);
  696 |   try {
  697 |     await openTownBoard(alice, ALICE);
  698 |     await ensureRideOpen(alice);
  699 |     await shotMp04(alice, testInfo, 'card');
  700 |     await alice.getByTestId('ride-open-claim').click();
  701 |     await expect(alice.getByTestId('ride-code-word')).not.toHaveText('No claim open', { timeout: 15_000 });
  702 |     const phrase = ((await alice.getByTestId('ride-code-word').textContent()) ?? '').trim();
  703 |     expect(phrase).toMatch(/^[A-Z]+-[A-Z]+-[0-9A-V]{20}$/);
  704 |     await alice.getByTestId('ride-start').click();
> 705 |     await alice.waitForFunction(() => window.__GR_MP__?.state()?.connected === true, undefined, { timeout: 15_000 });
      |                 ^ TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
  706 | 
  707 |     await openTownBoard(bob, BOB);
  708 |     await ensureRideOpen(bob);
  709 |     await bob.getByTestId('ride-join-input').fill(phrase);
  710 |     await shotMp04(bob, testInfo, 'join');
  711 |     await bob.getByTestId('ride-join-submit').click();
  712 |     await waitRoster(alice);
  713 |     await waitRoster(bob);
  714 |     await waitForActors(alice);
  715 |     await waitForActors(bob);
  716 | 
  717 |     await expect(alice.getByTestId('mp-rider-chip')).toContainText(BOB.name);
  718 |     await expect(alice.getByTestId('mp-rider-chip')).toContainText(BOB.town);
  719 |     await expect(bob.getByTestId('mp-rider-chip')).toContainText(ALICE.name);
  720 |     await expect(bob.getByTestId('mp-rider-chip')).toContainText(ALICE.town);
  721 |     await shotMp04(alice, testInfo, 'two-named-riders');
  722 | 
  723 |     const [aliceDiagnostics, bobDiagnostics] = await syncedGameDiagnostics(alice, bob, 120, 3);
  724 |     assertSameRosterSlots(aliceDiagnostics.actors, bobDiagnostics.actors);
  725 |     assertLocalHero(aliceDiagnostics, ALICE.name);
  726 |     assertLocalHero(bobDiagnostics, BOB.name);
  727 |     expect(aliceErrors.consoleErrors).toEqual([]);
  728 |     expect(aliceErrors.pageErrors).toEqual([]);
  729 |     expect(bobErrors.consoleErrors).toEqual([]);
  730 |     expect(bobErrors.pageErrors).toEqual([]);
  731 |   } finally {
  732 |     await aliceContext.close();
  733 |     await bobContext.close();
  734 |   }
  735 | });
  736 | 
  737 | test('town Ride Together invalid word stays friendly at 390px', async ({ page }, testInfo) => {
  738 |   await page.setViewportSize({ width: 390, height: 740 });
  739 |   const errors = collectErrors(page);
  740 |   await openTownBoard(page, ALICE);
  741 |   await ensureRideOpen(page);
  742 |   await page.getByTestId('ride-join-input').fill('QUIET-CLAIM');
  743 |   await page.getByTestId('ride-join-submit').click();
  744 |   await expect(page.getByTestId('ride-status')).toContainText("That claim's gone quiet.");
  745 |   await expect(page.getByTestId('contract-board')).toBeVisible();
  746 |   await shotMp04(page, testInfo, 'mobile-390-invalid-word');
  747 |   expect(errors.consoleErrors).toEqual([]);
  748 |   expect(errors.pageErrors).toEqual([]);
  749 | });
  750 | 
  751 | async function ensureRideOpen(page: Page): Promise<void> {
  752 |   const card = page.getByTestId('ride-together-card');
  753 |   await expect(card).toBeVisible();
  754 |   if ((await card.getAttribute('open')) === null) await page.getByTestId('ride-together-toggle').click();
  755 |   await expect(page.getByTestId('ride-together-controls')).toBeVisible();
  756 | }
  757 | 
  758 | async function openPair(browser: Browser, code: string, bobExtra = '', query = MP_QUERY): Promise<{
  759 |   alice: Page;
  760 |   bob: Page;
  761 |   aliceErrors: ErrorBucket;
  762 |   bobErrors: ErrorBucket;
  763 |   close: () => Promise<void>;
  764 | }> {
  765 |   const aliceContext = await browser.newContext();
  766 |   const bobContext = await browser.newContext();
  767 |   const alice = await aliceContext.newPage();
  768 |   const bob = await bobContext.newPage();
  769 |   const aliceErrors = collectErrors(alice);
  770 |   const bobErrors = collectErrors(bob);
  771 |   await Promise.all([
  772 |     openClient(alice, code, ALICE, '', query),
  773 |     openClient(bob, code, BOB, bobExtra, query),
  774 |   ]);
  775 |   return {
  776 |     alice,
  777 |     bob,
  778 |     aliceErrors,
  779 |     bobErrors,
  780 |     close: async () => {
  781 |       await aliceContext.close();
  782 |       await bobContext.close();
  783 |     },
  784 |   };
  785 | }
  786 | 
  787 | async function openQuad(
  788 |   browser: Browser,
  789 |   code: string,
  790 |   query = MP_QUERY,
  791 |   extras: readonly string[] = [],
  792 | ): Promise<{
  793 |   pages: [Page, Page, Page, Page];
  794 |   errors: [ErrorBucket, ErrorBucket, ErrorBucket, ErrorBucket];
  795 |   close: () => Promise<void>;
  796 | }> {
  797 |   const contexts = await Promise.all(QUAD_PLAYERS.map(() => browser.newContext({ viewport: { width: 640, height: 400 } })));
  798 |   const pages = await Promise.all(contexts.map((context) => context.newPage())) as [Page, Page, Page, Page];
  799 |   const errors = pages.map(collectErrors) as [ErrorBucket, ErrorBucket, ErrorBucket, ErrorBucket];
  800 |   for (let index = 0; index < pages.length; index += 1) {
  801 |     if (index === 3) {
  802 |       await Promise.all(pages.slice(0, 3).map((page) => waitRoster(page, 3)));
  803 |       const waiting = await Promise.all(pages.slice(0, 3).map(mpState));
  804 |       for (const state of waiting) expect(state).toMatchObject({ tick: 0, started: false, partySize: 4, error: null });
  805 |     }
```