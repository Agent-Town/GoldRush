# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e1-baron.spec.ts >> Baron manifest loads and taunts fire at waves 5, 12, and 18
- Location: e2e/e1-baron.spec.ts:411:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Object {
    "bannerAsset": "loaded",
    "bannerSprites": 0,
-   "baronAnimationLoaded": true,
+   "baronAnimationLoaded": false,
    "baronAsset": "loaded",
    "baronSprites": 0,
    "portraitSrc": null,
  }

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
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
          - strong: 00:15
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
      - group [ref=e12]:
        - generic "Claim Stake" [ref=e13] [cursor=pointer]
        - paragraph [ref=e14]: The heart of the claim. Lose it and the run is done.
    - region
    - text: None None None
  - generic [ref=e15]:
    - button "▸ Game tuning" [ref=e16] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e17]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  202 |     .not.toBeNull();
  203 |   return page.evaluate(() => {
  204 |     const baron = window.__GR_TEST__?.enemyPositions().find((enemy) => enemy.eliteKind === 'baron');
  205 |     if (!baron) throw new Error('missing Baron');
  206 |     return {
  207 |       hp: baron.hp,
  208 |       maxHp: baron.maxHp,
  209 |       speed: baron.speed,
  210 |       contactDamage: baron.contactDamage,
  211 |       buildingDamage: baron.buildingDamage,
  212 |       supportBuildingDamage: baron.supportBuildingDamage,
  213 |       heroPursuitRange: baron.heroPursuitRange,
  214 |       scale: baron.scale,
  215 |       hasBanner: baron.hasBanner,
  216 |       wrecker: baron.wrecker,
  217 |       edge: baron.edge,
  218 |     };
  219 |   });
  220 | }
  221 | 
  222 | async function baronBannerState(page: Page): Promise<{
  223 |   wave: number | undefined;
  224 |   announcement: string | null | undefined;
  225 |   kind: string | null | undefined;
  226 |   title: string | null | undefined;
  227 |   edge: string | null | undefined;
  228 |   hudKind: string | null;
  229 |   hudVisible: boolean;
  230 |   portraitHidden: boolean;
  231 | }> {
  232 |   return page.evaluate(() => {
  233 |     const diagnostics = window.__THREE_GAME_DIAGNOSTICS__?.ui;
  234 |     const root = document.querySelector<HTMLElement>('#hud');
  235 |     const portrait = document.querySelector<HTMLImageElement>('[data-hud-wave-portrait]');
  236 |     return {
  237 |       wave: diagnostics?.wave,
  238 |       announcement: diagnostics?.announcement,
  239 |       kind: diagnostics?.announcementKind,
  240 |       title: diagnostics?.announcementTitle,
  241 |       edge: diagnostics?.announcementEdge,
  242 |       hudKind: root?.dataset.announcementKind ?? null,
  243 |       hudVisible: root?.classList.contains('hud--announcement-visible') === true,
  244 |       portraitHidden: portrait ? portrait.hidden === true : true,
  245 |     };
  246 |   });
  247 | }
  248 | 
  249 | async function expectBaronBanner(page: Page, title: string, wave?: number, edge: string | null = null): Promise<void> {
  250 |   await expect
  251 |     .poll(() => baronBannerState(page), { timeout: 7_000 })
  252 |     .toMatchObject({
  253 |       ...(wave === undefined ? {} : { wave }),
  254 |       announcement: BARON_TAUNT,
  255 |       kind: 'baron',
  256 |       title,
  257 |       edge,
  258 |       hudKind: 'baron',
  259 |       hudVisible: true,
  260 |       portraitHidden: false,
  261 |     });
  262 | }
  263 | 
  264 | async function expectBaronArtLoaded(page: Page): Promise<void> {
  265 |   await expect
  266 |     .poll(
  267 |       () =>
  268 |         page.evaluate(() => ({
  269 |           baronAsset: window.__THREE_GAME_DIAGNOSTICS__?.assets['char.baron'],
  270 |           bannerAsset: window.__THREE_GAME_DIAGNOSTICS__?.assets['prop.baron_banner'],
  271 |           baronSprites: window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['char.baron'] ?? 0,
  272 |           bannerSprites: window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['prop.baron_banner'] ?? 0,
  273 |           baronAnimationLoaded: window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.baron']?.loaded ?? false,
  274 |           baronSpritesReady: (window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['char.baron'] ?? 0) >= 1,
  275 |           bannerSpritesReady: (window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['prop.baron_banner'] ?? 0) >= 1,
  276 |         })),
  277 |       { timeout: 10_000 },
  278 |     )
  279 |     .toMatchObject({
  280 |       baronAsset: 'loaded',
  281 |       bannerAsset: 'loaded',
  282 |       baronAnimationLoaded: true,
  283 |       baronSpritesReady: true,
  284 |       bannerSpritesReady: true,
  285 |     });
  286 | }
  287 | 
  288 | async function expectBaronPresentationPrefetched(page: Page): Promise<void> {
  289 |   await expect
  290 |     .poll(
  291 |       () =>
  292 |         page.evaluate(() => ({
  293 |           baronAsset: window.__THREE_GAME_DIAGNOSTICS__?.assets['char.baron'],
  294 |           bannerAsset: window.__THREE_GAME_DIAGNOSTICS__?.assets['prop.baron_banner'],
  295 |           baronAnimationLoaded: window.__THREE_GAME_DIAGNOSTICS__?.spriteAnimations['char.baron']?.loaded ?? false,
  296 |           baronSprites: window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['char.baron'] ?? 0,
  297 |           bannerSprites: window.__THREE_GAME_DIAGNOSTICS__?.assetSprites['prop.baron_banner'] ?? 0,
  298 |           portraitSrc: document.querySelector<HTMLImageElement>('[data-hud-wave-portrait]')?.getAttribute('src') ?? null,
  299 |         })),
  300 |       { timeout: 10_000 },
  301 |     )
> 302 |     .toEqual({
      |      ^ Error: expect(received).toEqual(expected) // deep equality
  303 |       baronAsset: 'loaded',
  304 |       bannerAsset: 'loaded',
  305 |       baronAnimationLoaded: true,
  306 |       baronSprites: 0,
  307 |       bannerSprites: 0,
  308 |       portraitSrc: null,
  309 |     });
  310 | }
  311 | 
  312 | function expectClean(errors: ErrorBucket): void {
  313 |   expect(errors.consoleErrors).toEqual([]);
  314 |   expect(errors.pageErrors).toEqual([]);
  315 | }
  316 | 
  317 | test('default contract does not preload Baron art', async ({ page }) => {
  318 |   const errors = await openGame(page, '?debug&timescale=1&nolevel&nowaves&nokill&nosteal&nowreck&seed=e1-baron-no-preload');
  319 |   await page.waitForTimeout(500);
  320 |   await expect(
  321 |     page.evaluate(() => {
  322 |       const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
  323 |       return {
  324 |         baronAsset: diagnostics?.assets['char.baron'] ?? null,
  325 |         bannerAsset: diagnostics?.assets['prop.baron_banner'] ?? null,
  326 |         baronSprites: diagnostics?.assetSprites['char.baron'] ?? 0,
  327 |         bannerSprites: diagnostics?.assetSprites['prop.baron_banner'] ?? 0,
  328 |         baronAnimation: diagnostics?.spriteAnimations['char.baron']?.loaded ?? false,
  329 |         portraitSrc: document.querySelector<HTMLImageElement>('[data-hud-wave-portrait]')?.getAttribute('src') ?? null,
  330 |       };
  331 |     }),
  332 |   ).resolves.toEqual({
  333 |     baronAsset: null,
  334 |     bannerAsset: null,
  335 |     baronSprites: 0,
  336 |     bannerSprites: 0,
  337 |     baronAnimation: false,
  338 |     portraitSrc: null,
  339 |   });
  340 |   expectClean(errors);
  341 | });
  342 | 
  343 | test('contract board requires science plus two secured claims and always shows an earned medal', async ({ page }, testInfo) => {
  344 |   test.setTimeout(60_000);
  345 |   const errors = collectErrors(page);
  346 | 
  347 |   await seedStorage(page);
  348 |   await openBoard(page);
  349 |   // 209c1a51: the Frontier chapter renders all five E1 cards together.
  350 |   await expect(page.getByTestId('contract-card-list').locator('[data-contract-id]')).toHaveCount(5);
  351 |   await openBaronBoardPage(page);
  352 |   await expect(page.getByTestId('contract-card-e1-baron')).toHaveAttribute('data-contract-locked', 'true');
  353 |   await expect(page.getByTestId('contract-stakes-e1-baron')).toHaveCount(0);
  354 |   await expect(page.getByTestId('contract-launch-e1-baron')).toHaveText("Secure two claims; bank the science, then he'll come out");
  355 | 
  356 |   // fd420471: Baron graduation requires completed science and two distinct secured claims.
  357 |   await seedStorage(page, { science: 6, securedContracts: ['the-claim', 'e1-dry-gulch'] });
  358 |   await openBoard(page);
  359 |   await openBaronBoardPage(page);
  360 |   await expect(page.getByTestId('contract-card-e1-baron')).toHaveAttribute('data-contract-locked', 'false');
  361 |   await expect(page.getByTestId('contract-stakes-e1-baron')).toHaveText(BARON_STAKES);
  362 |   await expect(page.getByTestId('contract-medal-e1-baron')).toHaveCount(0);
  363 |   await frameForShot(page, 'contract-card-e1-baron');
  364 |   await shot(page, testInfo, 'baron-card-pre-launch');
  365 | 
  366 |   await seedStorage(page, { medal: true });
  367 |   await openBoard(page);
  368 |   await openBaronBoardPage(page);
  369 |   await expect(page.getByTestId('contract-card-e1-baron')).toHaveAttribute('data-contract-locked', 'true');
  370 |   await expect(page.getByTestId('contract-stakes-e1-baron')).toHaveText(BARON_STAKES);
  371 |   await expect(page.getByTestId('contract-medal-e1-baron')).toHaveText(`Baron beaten. ${BARON_MEDAL_BLURB}`);
  372 |   await frameForShot(page, 'contract-card-e1-baron');
  373 |   await shot(page, testInfo, 'baron-card-post-victory');
  374 | 
  375 |   await seedStorage(page, {
  376 |     science: 6,
  377 |     securedContracts: ['the-claim', 'e1-dry-gulch'],
  378 |     medal: true,
  379 |     activeId: 'casey',
  380 |     medalProfileId: 'robin',
  381 |   });
  382 |   await openBoard(page);
  383 |   await openBaronBoardPage(page);
  384 |   await expect(page.getByTestId('contract-card-e1-baron')).toHaveAttribute('data-contract-locked', 'false');
  385 |   await expect(page.getByTestId('contract-medal-e1-baron')).toHaveCount(0);
  386 |   expectClean(errors);
  387 | });
  388 | 
  389 | test('board launch uses the live Baron contract for cadence and wave 20 spawn', async ({ page }) => {
  390 |   test.setTimeout(60_000);
  391 |   const errors = collectErrors(page);
  392 | 
  393 |   await seedStorage(page, { science: 6, securedContracts: ['the-claim', 'e1-dry-gulch'] });
  394 |   await page.evaluate(() => history.replaceState(null, '', '/?debug'));
  395 |   await openBoard(page);
  396 |   await openBaronBoardPage(page);
  397 |   await page.getByTestId('contract-launch-e1-baron').click();
  398 |   await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  399 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e1-baron');
  400 |   await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.waveCadenceMult)).resolves.toBe(1.15);
  401 | 
  402 |   await tuneFastBaronWave(page);
```