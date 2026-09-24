# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: run-suspend.spec.ts >> legacy no-controls restore at Territory I keeps the removed ring and its hints absent
- Location: e2e/run-suspend.spec.ts:282:1

# Error details

```
Error: expect(received).toMatchObject(expected)

- Expected  - 1
+ Received  + 1

  Object {
-   "fallbackRingPresent": false,
+   "fallbackRingPresent": null,
    "finalRingPresent": false,
    "restored": true,
  }
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - status [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - paragraph [ref=e7]: The Contract
            - button "Begin" [ref=e8] [cursor=pointer]
          - heading "The Claim" [level=2] [ref=e9]
          - paragraph [ref=e10]: The classic river claim.
          - generic [ref=e11]:
            - generic [ref=e12]:
              - paragraph [ref=e13]: Goals
              - list [ref=e14]:
                - listitem [ref=e15]: Survive through wave 10.
            - generic [ref=e16]:
              - paragraph [ref=e17]: Rules
              - list [ref=e18]:
                - listitem [ref=e19]: The river splits the claim around one center ford.
                - listitem [ref=e20]: Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.
      - generic "Wave status":
        - generic:
          - generic: The claim resumes at wave 0. The ledger kept your place; trail work after that boundary is replayed.
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 00:03
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - strong: "0"
      - region "Active weapon":
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e21] [cursor=pointer]:
          - generic [ref=e22]:
            - generic [ref=e23]: the Prospector
            - strong [ref=e24]: L0
            - generic [ref=e25]: suggest-only
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build" [ref=e27]
      - button "Pause the claim" [ref=e28]: catch your breathⅡ
      - generic: Swipe to scroll
    - generic:
      - button [ref=e31]: Rotate
      - button [ref=e32]: Weapon
      - button [ref=e33]: OK
    - region
    - text: None None None
  - generic [ref=e34]:
    - button "▸ Game tuning" [ref=e35] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e36]: "Meta territory: 1 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  216 |   await page.keyboard.press('KeyP');
  217 |   const savedPalisade = saved.buildings.find((entry) => entry.id === 'palisade');
  218 |   expect(saved.economy.gold).toBeGreaterThan(0);
  219 |   expect(saved.buildings).toHaveLength(3);
  220 |   expect(savedPalisade?.tier).toBe(2);
  221 |   expect(savedPalisade?.maxHp).toBeGreaterThan(Balance.wreck.hp.palisade);
  222 |   expect(saved.hero.hp).toBe(Balance.hero.maxHp);
  223 | 
  224 |   const targetWave = saved.wave + 2;
  225 |   const resavedTargetWave = targetWave + 1;
  226 |   const uninterrupted = comparableSuspend(await waitForSavedWave(page, targetWave));
  227 |   const uninterruptedAfterResave = comparableSuspend(await waitForSavedWave(page, resavedTargetWave));
  228 | 
  229 |   await page.goto('/');
  230 |   await writeSuspend(page, savedRaw);
  231 |   await page.goto(`/${QUERY}&contract=e1-dry-gulch&nowaves`);
  232 |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  233 |   await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).resolves.toBe('e1-dry-gulch');
  234 |   await page.keyboard.press('KeyP');
  235 |   await expect(page.getByTestId('pause-meta-save')).toHaveText("The ledger saves at each wave's end.");
  236 |   await page.keyboard.press('KeyP');
  237 | 
  238 |   await page.goto('/');
  239 |   await writeSuspend(page, savedRaw);
  240 |   await page.goto(`/${QUERY}`);
  241 |   await page.waitForFunction(
  242 |     (wave) =>
  243 |       window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true &&
  244 |       window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave === wave,
  245 |     saved.wave,
  246 |   );
  247 |   await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).resolves.toBe(saved.economy.gold);
  248 |   await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.length)).resolves.toBe(3);
  249 |   const restoredPalisade = await page.evaluate(() =>
  250 |     window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === 'palisade' && entry.index === 0),
  251 |   );
  252 |   expect(restoredPalisade?.maxHp).toBe(savedPalisade?.maxHp);
  253 |   await shot(page, testInfo, 'restore-moment');
  254 | 
  255 |   const restoredBoundary = await waitForSavedWave(page, targetWave);
  256 |   expect(comparableSuspend(restoredBoundary)).toEqual(uninterrupted);
  257 |   const restoredBoundaryRaw = await savedSuspendRaw(page);
  258 | 
  259 |   await page.goto('/');
  260 |   await writeSuspend(page, restoredBoundaryRaw);
  261 |   await page.goto(`/${QUERY}`);
  262 |   await page.waitForFunction((wave) => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave === wave, targetWave);
  263 |   const restoredAfterResave = await waitForSavedWave(page, resavedTargetWave);
  264 |   expect(comparableSuspend(restoredAfterResave)).toEqual(uninterruptedAfterResave);
  265 | 
  266 |   await page.goto('/');
  267 |   await writeSuspend(page, savedRaw);
  268 |   await page.evaluate(([key, value]) => localStorage.setItem(key, value), [profileDataKey('robin', TOWN_NAME_KEY), 'Copper Hill'] as const);
  269 |   await page.reload();
  270 |   await expect(page.getByTestId('start-menu-continue')).toHaveText(`Continue: wave ${saved.wave} · The Claim · Copper Hill`);
  271 |   await expect(page.getByTestId('start-menu-saved-claim')).toContainText(`wave ${saved.wave}`);
  272 |   await expect(page.getByTestId('start-menu-saved-claim')).toContainText('The Claim');
  273 |   await saveVisibilityShot(page, testInfo, 'menu-continue');
  274 |   await page.getByTestId('start-menu-continue').click();
  275 |   await page.waitForFunction((wave) => window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave === wave, saved.wave);
  276 |   await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold)).resolves.toBe(saved.economy.gold);
  277 | 
  278 |   expect(errors.consoleErrors).toEqual([]);
  279 |   expect(errors.pageErrors).toEqual([]);
  280 | });
  281 | 
  282 | test('legacy no-controls restore at Territory I keeps the removed ring and its hints absent', async ({ page }) => {
  283 |   await clearStorage(page);
  284 |   const errors = await openGame(page, '?debug&nowaves&nolevel&seed=run-suspend-legacy-ring');
  285 |   const legacy = await page.evaluate(
  286 |     async ({ territoryTier1 }) => {
  287 |       const snapshot = window.__GR_TEST__!.captureSuspend() as any;
  288 |       snapshot.v = 1;
  289 |       delete snapshot.controls;
  290 |       snapshot.meta.tracks.territory = territoryTier1;
  291 |       snapshot.research.progress.tracks.territory = territoryTier1;
  292 |       const { RunManager } = (await Function('return import("/src/game/RunManager.ts")')()) as typeof import('../src/game/RunManager');
  293 |       const prototype = RunManager.prototype as any;
  294 |       const restoreSuspend = prototype.restoreSuspend;
  295 |       let fallbackRingPresent: boolean | null = null;
  296 |       prototype.restoreSuspend = function restoreSuspendWithProbe(...args: unknown[]) {
  297 |         fallbackRingPresent = this.game.territoryRingPresent;
  298 |         return restoreSuspend.apply(this, args);
  299 |       };
  300 |       try {
  301 |         const restored = window.__GR_TEST__!.restoreSuspend(snapshot);
  302 |         return {
  303 |           raw: JSON.stringify(snapshot),
  304 |           wave: snapshot.wave as number,
  305 |           meta: JSON.stringify(snapshot.meta),
  306 |           restored,
  307 |           fallbackRingPresent,
  308 |           finalRingPresent: window.__GR_TEST__!.captureSuspend().controls?.territoryRingPresent,
  309 |         };
  310 |       } finally {
  311 |         prototype.restoreSuspend = restoreSuspend;
  312 |       }
  313 |     },
  314 |     { territoryTier1: Balance.meta.territoryTier1 },
  315 |   );
> 316 |   expect(legacy).toMatchObject({ restored: true, fallbackRingPresent: false, finalRingPresent: false });
      |                  ^ Error: expect(received).toMatchObject(expected)
  317 | 
  318 |   await page.goto('/');
  319 |   await writeSuspend(page, legacy.raw);
  320 |   await page.evaluate(([key, meta]) => localStorage.setItem(key, meta), [profileDataKey('robin', META_PROGRESS_KEY), legacy.meta] as const);
  321 |   await page.goto('/?debug&nowaves&nolevel&seed=run-suspend-legacy-ring');
  322 |   await page.waitForFunction(
  323 |     (restoredWave) =>
  324 |       window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restored === true &&
  325 |       window.__THREE_GAME_DIAGNOSTICS__?.run.suspend.restoredWave === restoredWave,
  326 |     legacy.wave,
  327 |   );
  328 |   const restored = await page.evaluate(() => window.__GR_TEST__!.captureSuspend());
  329 |   expect(restored.meta.tracks.territory).toBe(Balance.meta.territoryTier1);
  330 |   expect(restored.controls?.territoryRingPresent).toBe(false);
  331 | 
  332 |   const gap = await page.evaluate(
  333 |     ({ gapHalf, depth, width }) => {
  334 |       const contract = window.__THREE_GAME_DIAGNOSTICS__!.contract.tileParams;
  335 |       const stake = contract.stakeMarkers?.find((marker) => marker.heroStart) ?? { x: 0, z: 12 };
  336 |       const edge = contract.lanes.spawnEdges[0] ?? 'north';
  337 |       const capOffset = gapHalf + depth - width / 2;
  338 |       const sideOffset = gapHalf + depth + width / 2;
  339 |       if (edge === 'north' || edge === 'south') return { x: stake.x, z: stake.z + (edge === 'north' ? capOffset : -capOffset) };
  340 |       return { x: stake.x + (edge === 'east' ? sideOffset : -sideOffset), z: stake.z };
  341 |     },
  342 |     { gapHalf: Balance.meta.territoryRingGapHalfWidth, depth: Balance.palisade.depth, width: Balance.palisade.width },
  343 |   );
  344 |   await page.evaluate((point) => window.__GR_TEST__!.teleport(point.x, point.z), gap);
  345 |   await page.waitForTimeout(80);
  346 |   await expect(page.locator('[data-testid="world-info-note"][data-object-class="territory_ring_gap"]')).toHaveCount(0);
  347 |   expect(errors.consoleErrors).toEqual([]);
  348 |   expect(errors.pageErrors).toEqual([]);
  349 | });
  350 | 
  351 | test('ended runs clear suspend and town board launch confirms abandoning a saved claim', async ({ page }) => {
  352 |   await clearStorage(page);
  353 |   const errors = await openGame(page);
  354 |   await grantGold(page, 80);
  355 |   await waitForSavedWave(page, 1);
  356 |   await page.evaluate(() => {
  357 |     window.__GR_TEST__?.setBalance('enemy.contactDamage', 0);
  358 |     window.__GR_TEST__?.setBalance('waves.waveInterval', 0.35);
  359 |     window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
  360 |     window.__GR_TEST__?.setBalance('waves.pulseBase', 1);
  361 |     window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
  362 |     window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
  363 |     window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
  364 |     window.__GR_TEST__?.setBalance('run.secureWave', 2);
  365 |     window.__GR_TEST__?.resetRun();
  366 |   });
  367 |   await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 8_000 });
  368 |   await page.getByTestId('bank-secured-claim').click();
  369 |   await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY)).toBe(null);
  370 | 
  371 |   await openGame(page);
  372 |   await grantGold(page, 80);
  373 |   await waitForSavedWave(page, 1);
  374 |   const savedRaw = await savedSuspendRaw(page);
  375 |   await page.goto('/');
  376 |   await expect(page.getByTestId('start-menu-continue')).toBeVisible();
  377 |   page.once('dialog', async (dialog) => {
  378 |     expect(dialog.message()).toContain('Abandon wave 1 · The Claim');
  379 |     await dialog.accept();
  380 |   });
  381 |   await launchClaimFromTownBoard(page);
  382 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  383 |   expect(await page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY)).toBe(null);
  384 |   expect(savedRaw.length).toBeGreaterThan(200);
  385 |   expect(errors.consoleErrors).toEqual([]);
  386 |   expect(errors.pageErrors).toEqual([]);
  387 | });
  388 | 
```