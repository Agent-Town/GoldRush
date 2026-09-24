# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bt-01-tiers.spec.ts >> insufficient gold leaves tier and gold unchanged
- Location: e2e/bt-01-tiers.spec.ts:430:1

# Error details

```
Error: expect(received).toBeNull()

Received: {"effectiveDamage": undefined, "effectiveFireRate": undefined, "hp": 60, "id": "palisade", "index": 0, "maxHp": 60, "panRateMult": undefined, "position": {"x": 0, "z": 9}, "repairCost": 0, "repairProgress": 0, "tier": 1, "worn": false, "wrecked": false, "yieldPerCycle": undefined}

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
          - strong: 01:14
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
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build - Close" [pressed] [ref=e10]
      - button "Pause the claim" [ref=e11]: catch your breathⅡ
      - status [ref=e13]:
        - generic "Palisade · Tier 1 Swipe to scroll" [ref=e14] [cursor=pointer]:
          - generic [ref=e15]: P
          - text: Palisade · Tier 1 Swipe to scroll
        - generic [ref=e16]:
          - button "need 90g" [disabled] [ref=e17]
          - button "Tear down (+5g)" [ref=e18]
          - generic [ref=e19]: invested 10g → returns 5g. The timber comes back, the labor doesn't.
    - generic:
      - button [ref=e22]: Rotate
      - button [ref=e23]: Weapon
      - button [ref=e24]: OK
    - region
    - generic:
      - status:
        - generic:
          - paragraph: Tavernkeeper
          - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
          - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
    - text: None None None
  - generic [ref=e25]:
    - button "▸ Game tuning" [ref=e26] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e27]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  343 |   const snapshot = await page.evaluate(() => structuredClone(window.__GR_TEST__!.captureSuspend()));
  344 |   expect(snapshot.buildings.find((building) => building.id === 'stockpile' && building.index === stockpile.index)?.tier).toBe(3);
  345 |   await expect(page.evaluate((saved) => window.__GR_TEST__!.restoreSuspend(saved), snapshot)).resolves.toBe(true);
  346 |   await expect.poll(() => hpEntry(page, 'stockpile', stockpile.index).then((entry) => entry?.tier ?? 0)).toBe(3);
  347 |   await expect.poll(() => bankCap(page)).toBe(beforeBuildCap + Math.round(Balance.stockpile.capBonus * Balance.tiers.stockpile[2].capMult));
  348 | 
  349 |   await page.evaluate(() => window.__GR_TEST__?.setBuildMode(true));
  350 |   await teleport(page, stockpile.position.x, stockpile.position.z);
  351 |   await expect(page.getByTestId('building-context-prompt')).toContainText('Stockpile Yard · Tier 3');
  352 |   if (await page.getByTestId('contract-briefing-dismiss').isVisible()) {
  353 |     await page.getByTestId('contract-briefing-dismiss').click();
  354 |     await expect(page.getByTestId('contract-briefing')).toBeHidden();
  355 |   }
  356 |   mkdirSync('artifacts/bt-02b-stockpile-tiers', { recursive: true });
  357 |   await page.screenshot({ path: `artifacts/bt-02b-stockpile-tiers/${testInfo.project.name}-tier-3.png`, fullPage: true });
  358 | 
  359 |   await expect(
  360 |     page.evaluate(([id, index]) => window.__GR_TEST__?.demolish(id, index) ?? false, [stockpile.id, stockpile.index] as const),
  361 |   ).resolves.toBe(true);
  362 |   await expect.poll(() => bankCap(page)).toBe(beforeBuildCap);
  363 |   expect(errors.consoleErrors).toEqual([]);
  364 |   expect(errors.pageErrors).toEqual([]);
  365 | });
  366 | 
  367 | test('stockpile upgrade names the yard and shows its tier capacity in the build menu', async ({ page }, testInfo) => {
  368 |   const errors = collectErrors(page);
  369 |   await page.goto('/?debug&timescale=1&nowaves&nolevel&nopause&nokill&nosteal&seed=bt-01-stockpile-voice');
  370 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  371 |   if (await page.getByTestId('contract-briefing-dismiss').isVisible()) {
  372 |     await page.getByTestId('contract-briefing-dismiss').click();
  373 |     await expect(page.getByTestId('contract-briefing')).toBeHidden();
  374 |   }
  375 |   await grantGold(page, 1_000);
  376 |   const stockpile = await placeBuildableAt(page, 'stockpile', 0, 9);
  377 |   await teleport(page, stockpile.position.x, stockpile.position.z);
  378 |   const snapshot = await page.evaluate(() => structuredClone(window.__GR_TEST__!.captureSuspend()));
  379 |   await page.evaluate((saved) => localStorage.setItem('gr.run.v1', JSON.stringify(saved)), snapshot);
  380 | 
  381 |   await page.goto('/');
  382 |   await expect(page.getByTestId('start-menu-continue')).toBeVisible();
  383 |   await page.getByTestId('start-menu-continue').click();
  384 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  385 |   expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
  386 |   if (await page.getByTestId('contract-briefing-dismiss').isVisible()) {
  387 |     await page.getByTestId('contract-briefing-dismiss').click();
  388 |     await expect(page.getByTestId('contract-briefing')).toBeHidden();
  389 |   }
  390 |   await page.getByTestId('hud-build').click();
  391 |   await expect(page.getByTestId('hud-build-menu')).toBeVisible();
  392 |   await page.locator('#game-canvas').dispatchEvent('pointerdown', { clientX: 1, clientY: 1, pointerType: 'mouse', button: 0 });
  393 |   await expect(page.getByTestId('hud-build-menu')).toBeHidden();
  394 |   await expect(page.getByTestId('building-context-prompt')).toContainText('Stockpile Yard · Tier 1');
  395 | 
  396 |   await page.getByTestId('upgrade-confirm').click();
  397 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.vfx.lastFloatText?.text)).toBe(
  398 |     'Stockpile Yard II - the yard holds more gold',
  399 |   );
  400 |   mkdirSync('artifacts/f1314-3-stockpile-tier-voice', { recursive: true });
  401 |   await page.screenshot({ path: `artifacts/f1314-3-stockpile-tier-voice/${testInfo.project.name}-float.png`, fullPage: true });
  402 | 
  403 |   await page.getByTestId('hud-build').click();
  404 |   await page.getByTestId('hud-build').click();
  405 |   await expect(page.getByTestId('hud-build-menu')).toBeVisible();
  406 |   await page.getByTestId('hud-build-tile-stockpile').hover();
  407 |   await expect(page.getByTestId('hud-build-blurb')).toContainText(
  408 |     `T2: +${Math.round(Balance.stockpile.capBonus * Balance.tiers.stockpile[1].capMult)} gold capacity`,
  409 |   );
  410 |   await page.screenshot({ path: `artifacts/f1314-3-stockpile-tier-voice/${testInfo.project.name}-menu.png`, fullPage: true });
  411 |   expect(errors.consoleErrors).toEqual([]);
  412 |   expect(errors.pageErrors).toEqual([]);
  413 | });
  414 | 
  415 | test('demolish refund ignores tier investment', async ({ page }) => {
  416 |   const errors = await openGame(page, 'bt-01-refund');
  417 |   await grantGold(page, Balance.turret.costBase + Balance.tiers.turret[1].cost);
  418 |   const turret = await placeBuildableAt(page, 'turret', 0, 12);
  419 |   await expect(upgrade(page, turret)).resolves.toBe(true);
  420 | 
  421 |   await teleport(page, turret.position.x, turret.position.z);
  422 |   await expect(page.evaluate(([id, index]) => window.__GR_TEST__?.demolish(id, index) ?? false, [turret.id, turret.index] as const)).resolves.toBe(true);
  423 | 
  424 |   expect(await gold(page)).toBe(Math.floor(Balance.demolish.refundPctOfCost * Balance.turret.costBase));
  425 |   await expect.poll(() => hpEntry(page, 'turret', turret.index)).toBeNull();
  426 |   expect(errors.consoleErrors).toEqual([]);
  427 |   expect(errors.pageErrors).toEqual([]);
  428 | });
  429 | 
  430 | test('insufficient gold leaves tier and gold unchanged', async ({ page }) => {
  431 |   const errors = await openGame(page, 'bt-01-insufficient');
  432 |   await grantGold(page, Balance.palisade.cost);
  433 |   const palisade = await placeBuildableAt(page, 'palisade', 0, 9);
  434 |   expect(await gold(page)).toBe(0);
  435 |   await teleport(page, palisade.position.x, palisade.position.z);
  436 |   await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  437 |   await expect(page.getByTestId('building-context-prompt')).toContainText(`need ${Balance.tiers.palisade[1].cost}g`);
  438 |   await expect(upgrade(page, palisade)).resolves.toBe(false);
  439 |   expect(await gold(page)).toBe(0);
  440 |   expect((await hpEntry(page, 'palisade', palisade.index))?.tier).toBe(1);
  441 |   await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  442 |   await page.keyboard.press('Enter');
> 443 |   await expect.poll(() => hpEntry(page, 'palisade', palisade.index)).toBeNull();
      |                                                                      ^ Error: expect(received).toBeNull()
  444 |   expect(await gold(page)).toBe(Math.floor(Balance.demolish.refundPctOfCost * Balance.palisade.cost));
  445 |   expect(errors.consoleErrors).toEqual([]);
  446 |   expect(errors.pageErrors).toEqual([]);
  447 | });
  448 | 
```