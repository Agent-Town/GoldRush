# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mp-02-lockstep.spec.ts >> two clients advance 500 ticks with identical lockstep hashes
- Location: e2e/mp-02-lockstep.spec.ts:183:1

# Error details

```
TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
```

# Test source

```ts
  808  |   return { pages, errors, close: async () => Promise.all(contexts.map((context) => context.close())).then(() => undefined) };
  809  | }
  810  | 
  811  | async function seedQuadSharedCredit(pages: readonly Page[], amount: number): Promise<void> {
  812  |   await Promise.all(pages.map((page) => page.evaluate(() => window.__GR_TEST__!.setManualSim(true))));
  813  |   const snapshot = await pages[0]!.evaluate((gold) => {
  814  |     const saved = window.__GR_TEST__!.captureSuspend();
  815  |     saved.economy.gold += gold;
  816  |     saved.economy.resources!.gold!.amount += gold;
  817  |     saved.economy.log.push({
  818  |       id: '00000000-0000-4000-8000-000000000004',
  819  |       at: saved.timeAlive,
  820  |       type: 'gold_panned',
  821  |       nodeId: 'four-rider-proof',
  822  |       amount: gold,
  823  |     });
  824  |     saved.economy.summary.panned += gold;
  825  |     return saved;
  826  |   }, amount);
  827  |   const restored = await Promise.all(pages.map((page) => page.evaluate(async (saved) => {
  828  |     const ok = window.__GR_TEST__!.restoreSuspend(saved);
  829  |     const suspend = (await import('../src/game/RunSuspend')) as typeof import('../src/game/RunSuspend');
  830  |     return { ok, failure: suspend.runSuspendRestoreFailure() };
  831  |   }, snapshot)));
  832  |   expect(restored).toEqual(Array(4).fill({ ok: true, failure: null }));
  833  |   const resumeAt = Math.max(...(await Promise.all(pages.map(mpState))).map(({ tick }) => tick)) + 15;
  834  |   await Promise.all(pages.map((page) => page.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt)));
  835  |   await Promise.all(pages.map((page) => waitForTick(page, resumeAt + 1, 60_000)));
  836  | }
  837  | 
  838  | async function openClient(page: Page, code: string, player: MpPlayerSeed, extra = '', query = MP_QUERY): Promise<void> {
  839  |   await seedProfile(page, player);
  840  |   const fullQuery = `${query}&mpRelay=${encodeURIComponent(relay.url)}&mpCode=${code}&mpName=${encodeURIComponent(player.name)}&mpTown=${encodeURIComponent(player.town)}${extra}`;
  841  |   await page.goto(`/?${fullQuery}`);
  842  |   await expect.poll(() => page.evaluate(() => {
  843  |     const state = window.__GR_MP__?.state();
  844  |     return { connected: state?.connected ?? false, error: state?.error ?? null };
  845  |   }), { message: `${player.name} joins the ride`, timeout: 30_000 }).toEqual({ connected: true, error: null });
  846  | }
  847  | 
  848  | async function seedProfile(page: Page, player: MpPlayerSeed): Promise<void> {
  849  |   await page.addInitScript(
  850  |     ({ profileKey, townKey, scoreKey, relayKey, relayUrl, player: seeded }) => {
  851  |       localStorage.clear();
  852  |       sessionStorage.clear();
  853  |       localStorage.setItem(relayKey, relayUrl);
  854  |       localStorage.setItem(
  855  |         profileKey,
  856  |         JSON.stringify({
  857  |           version: 2,
  858  |           activeId: seeded.id,
  859  |           profiles: [
  860  |             {
  861  |               id: seeded.id,
  862  |               name: seeded.name,
  863  |               createdAt: 1,
  864  |               updatedAt: 1,
  865  |               difficultyPreset: 'trail',
  866  |               hintsSeen: [],
  867  |             },
  868  |           ],
  869  |         }),
  870  |       );
  871  |       localStorage.setItem(townKey, seeded.town);
  872  |       localStorage.setItem(scoreKey, '[]');
  873  |     },
  874  |     {
  875  |       profileKey: PROFILE_KEY,
  876  |       townKey: profileDataKey(player.id, TOWN_NAME_KEY),
  877  |       scoreKey: profileDataKey(player.id, SCOREBOARD_KEY),
  878  |       relayKey: 'gr.mp.relayBase.v1',
  879  |       relayUrl: relay.url,
  880  |       player,
  881  |     },
  882  |   );
  883  | }
  884  | 
  885  | async function openTownBoard(page: Page, player: MpPlayerSeed): Promise<void> {
  886  |   await seedProfile(page, player);
  887  |   await page.goto('/');
  888  |   await page.getByTestId('start-menu-enter-town').click();
  889  |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 15_000 });
  890  |   await hold(page, 'KeyA', 850);
  891  |   await hold(page, 'KeyW', 850);
  892  |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  893  |   await page.getByTestId('town-open-board').click();
  894  |   await expect(page.getByTestId('contract-board')).toBeVisible();
  895  | }
  896  | 
  897  | async function hold(page: Page, key: string, ms: number): Promise<void> {
  898  |   await page.keyboard.down(key);
  899  |   await page.waitForTimeout(ms);
  900  |   await page.keyboard.up(key);
  901  | }
  902  | 
  903  | async function waitRoster(page: Page, count = 2): Promise<void> {
  904  |   await page.waitForFunction((expected) => (window.__GR_MP__?.state()?.roster.length ?? 0) === expected, count, { timeout: 15_000 });
  905  | }
  906  | 
  907  | async function waitForTick(page: Page, tick: number, timeout = 30_000): Promise<void> {
> 908  |   await page.waitForFunction((target) => (window.__GR_MP__?.state()?.tick ?? 0) >= target, tick, { timeout });
       |              ^ TimeoutError: page.waitForFunction: Timeout 30000ms exceeded.
  909  | }
  910  | 
  911  | async function waitForActors(page: Page, count = 2): Promise<void> {
  912  |   await page.waitForFunction((expected) => {
  913  |     const actors = window.__THREE_GAME_DIAGNOSTICS__?.actors?.filter((actor) => actor.visible) ?? [];
  914  |     return actors.length === expected && actors.some((actor) => actor.local) && actors.filter((actor) => !actor.local).length === expected - 1;
  915  |   }, count, { timeout: 20_000 });
  916  | }
  917  | 
  918  | async function seedConvergenceScenario(source: Page, peer: Page): Promise<number> {
  919  |   await Promise.all([
  920  |     source.evaluate(() => window.__GR_TEST__!.setManualSim(true)),
  921  |     peer.evaluate(() => window.__GR_TEST__!.setManualSim(true)),
  922  |   ]);
  923  |   await source.evaluate(() => {
  924  |     const test = window.__GR_TEST__!;
  925  |     test.clearEnemies();
  926  |     test.setWave(7);
  927  |     test.spawnPack(1, 4, {
  928  |       speedScale: 0,
  929  |       hpScale: 25,
  930  |       eliteKind: 'baron',
  931  |       visualScale: 2.6,
  932  |       banner: true,
  933  |       contactDamageScale: 1.7,
  934  |       buildingDamageScale: 2.1,
  935  |       supportBuildingDamageScale: 1.4,
  936  |       heroPursuitRange: 34,
  937  |       variantId: 'baron-convergence',
  938  |       variantLabel: 'Ledger Baron',
  939  |       tint: '#a0522d',
  940  |       boltDamageMult: 0.7,
  941  |     });
  942  |     for (let component = 0; component < 3; component += 1) {
  943  |       test.spawnPack(1, 6 + component, {
  944  |         speedScale: 0,
  945  |         hpScale: 25 + component,
  946  |         eliteKind: 'railcar',
  947  |         visualScale: 1.5 + component * 0.1,
  948  |         contactDamageScale: 1.2,
  949  |         buildingDamageScale: 1.6,
  950  |         supportBuildingDamageScale: 1.3,
  951  |         heroPursuitRange: 26,
  952  |         variantId: `railcar-${component + 1}`,
  953  |         variantLabel: `Railcar ${component + 1}`,
  954  |         tint: '#5b8a8a',
  955  |         boltDamageMult: 0.85,
  956  |         bossGroupId: 'railcar-alpha',
  957  |         bossGroupSize: 3,
  958  |         bossGroupTotalHp: 420,
  959  |         bossComponentId: `component-${component + 1}`,
  960  |         bossComponentLabel: `Car ${component + 1}`,
  961  |         bossDegradeSpeedMult: 0.82,
  962  |       });
  963  |     }
  964  |   });
  965  |   const snapshot = await source.evaluate(() => window.__GR_TEST__!.captureSuspend());
  966  |   const restored = await Promise.all([
  967  |     source.evaluate(async (saved) => {
  968  |       const ok = window.__GR_TEST__!.restoreSuspend(saved);
  969  |       const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
  970  |       return { ok, failure: suspend.runSuspendRestoreFailure() };
  971  |     }, snapshot),
  972  |     peer.evaluate(async (saved) => {
  973  |       const ok = window.__GR_TEST__!.restoreSuspend(saved);
  974  |       const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
  975  |       return { ok, failure: suspend.runSuspendRestoreFailure() };
  976  |     }, snapshot),
  977  |   ]);
  978  |   expect(restored).toEqual([{ ok: true, failure: null }, { ok: true, failure: null }]);
  979  |   const currentTick = Math.max((await mpState(source)).tick, (await mpState(peer)).tick);
  980  |   const resumeAt = currentTick + 15;
  981  |   await Promise.all([
  982  |     source.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt),
  983  |     peer.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt),
  984  |   ]);
  985  |   return resumeAt;
  986  | }
  987  | 
  988  | async function seedActionScenario(source: Page, peer: Page): Promise<void> {
  989  |   await Promise.all([
  990  |     source.evaluate(() => window.__GR_TEST__!.setManualSim(true)),
  991  |     peer.evaluate(() => window.__GR_TEST__!.setManualSim(true)),
  992  |   ]);
  993  |   await source.evaluate(() => {
  994  |     window.__GR_TEST__!.grantGold(500);
  995  |     window.__GR_TEST__!.grantXp(40);
  996  |   });
  997  |   const snapshot = await source.evaluate(() => window.__GR_TEST__!.captureSuspend());
  998  |   const restored = await Promise.all([
  999  |     source.evaluate((saved) => window.__GR_TEST__!.restoreSuspend(saved), snapshot),
  1000 |     peer.evaluate((saved) => window.__GR_TEST__!.restoreSuspend(saved), snapshot),
  1001 |   ]);
  1002 |   expect(restored).toEqual([true, true]);
  1003 |   const resumeAt = Math.max((await mpState(source)).tick, (await mpState(peer)).tick) + 15;
  1004 |   await Promise.all([
  1005 |     source.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt),
  1006 |     peer.evaluate((tick) => window.__GR_TEST__!.resumeManualSimAtMpTick(tick), resumeAt),
  1007 |   ]);
  1008 |   await Promise.all([waitForTick(source, resumeAt + 1), waitForTick(peer, resumeAt + 1)]);
```