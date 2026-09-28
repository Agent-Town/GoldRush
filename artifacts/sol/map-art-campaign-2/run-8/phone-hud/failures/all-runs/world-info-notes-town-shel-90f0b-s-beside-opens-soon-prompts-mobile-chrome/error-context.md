# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: world-info-notes.spec.ts >> town shells use info notes beside opens-soon prompts
- Location: e2e/world-info-notes.spec.ts:293:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('town-approach-prompt')
Timeout: 5000ms
- Expected substring  - 1
+ Received string     + 4

- opens soon
+
+         Tavern ... the board is warm
+         Board
+       

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByTestId('town-approach-prompt')
    6 × locator resolved to <div hidden="" role="status" aria-live="polite" class="town-ui__prompt" data-testid="town-approach-prompt">…</div>
      - unexpected value "
        Tavern ... the board is warm
        Board
      "
    8 × locator resolved to <div role="status" aria-live="polite" class="town-ui__prompt" data-testid="town-approach-prompt">…</div>
      - unexpected value "
        Tavern ... the board is warm
        Board
      "

```

```yaml
- status:
  - text: Tavern ... the board is warm
  - button "Board"
```

# Test source

```ts
  201 |   for (const item of BUILD_NOTE_CASES) entries[item.id] = await placeBuildableAt(page, item.id, item.x, item.z);
  202 | 
  203 |   for (const item of BUILD_NOTE_CASES) {
  204 |     const entry = entries[item.id]!;
  205 |     await teleport(page, entry.position.x, entry.position.z);
  206 |     await expectNote(page, item.objectClass, item.text);
  207 |   }
  208 | 
  209 |   const assay = entries.assay_office!;
  210 |   await teleport(page, assay.position.x, assay.position.z);
  211 |   await expect(page.getByTestId('assay-office-prompt')).toBeVisible();
  212 |   await expectNote(page, 'assay_office', 'Write an order');
  213 |   await page.keyboard.press('Enter');
  214 |   await expect(page.getByTestId('assay-bench')).toBeVisible();
  215 | 
  216 |   await page.keyboard.press('Escape');
  217 |   await expect(page.getByTestId('assay-bench')).toBeHidden();
  218 |   const palisade = entries.palisade!;
  219 |   await page.evaluate(() => window.__GR_TEST__?.setBuildMode(true));
  220 |   await teleport(page, palisade.position.x, palisade.position.z);
  221 |   await expect(page.getByTestId('building-context-prompt')).toBeVisible();
  222 |   await expectNote(page, 'palisade', 'Higher tier means more hit points');
  223 |   await page.getByTestId('upgrade-confirm').click();
  224 |   await expect
  225 |     .poll(() =>
  226 |       page.evaluate(([id, index]) => window.__THREE_GAME_DIAGNOSTICS__?.build.hp.find((entry) => entry.id === id && entry.index === index)?.tier, [
  227 |         palisade.id,
  228 |         palisade.index,
  229 |       ] as const),
  230 |     )
  231 |     .toBe(2);
  232 | 
  233 |   assertNoErrors(errors);
  234 | });
  235 | 
  236 | test('contract-specific world notes cover Dry Gulch water without a phantom territory ring', async ({ page }) => {
  237 |   const errors = await openGame(
  238 |     page,
  239 |     '?debug&contract=e1-dry-gulch&timescale=4&nowaves&nolevel&nokill&seed=world-info-dry-gulch',
  240 |     metaEntry({ territory: Balance.meta.territoryTier1, science: 0, hero: 0, agent: 0 }),
  241 |   );
  242 | 
  243 |   const spring = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.waterSources[0] ?? null);
  244 |   expect(spring).toBeTruthy();
  245 |   await teleport(page, spring!.x, spring!.z);
  246 |   await expectNote(page, 'spring_pond', 'Dry Gulch water');
  247 | 
  248 |   const gap = await page.evaluate(
  249 |     ({ gapHalf, depth, width }) => {
  250 |       const contract = window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams;
  251 |       const stake = contract?.stakeMarkers?.find((marker) => marker.heroStart) ?? { x: 0, z: 12 };
  252 |       const edge = contract?.lanes.spawnEdges[0] ?? 'north';
  253 |       const capOffset = gapHalf + depth - width / 2;
  254 |       const sideOffset = gapHalf + depth + width / 2;
  255 |       if (edge === 'north' || edge === 'south') return { x: stake.x, z: stake.z + (edge === 'north' ? capOffset : -capOffset) };
  256 |       return { x: stake.x + (edge === 'east' ? sideOffset : -sideOffset), z: stake.z };
  257 |     },
  258 |     { gapHalf: Balance.meta.territoryRingGapHalfWidth, depth: Balance.palisade.depth, width: Balance.palisade.width },
  259 |   );
  260 |   await teleport(page, gap.x, gap.z);
  261 |   await expect(page.getByTestId('world-info-note')).not.toHaveAttribute('data-object-class', 'territory_ring_gap');
  262 |   await expect(page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisadeKitCredits)).resolves.toBe(
  263 |     Balance.meta.territoryRing.length,
  264 |   );
  265 | 
  266 |   assertNoErrors(errors);
  267 | });
  268 | 
  269 | test('Night Shift lantern post note uses the same registry', async ({ page }) => {
  270 |   const errors = await openGame(page, '?debug&contract=e1-night-shift&timescale=4&nowaves&nolevel&nokill&seed=world-info-lantern');
  271 |   const lantern = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.lanternPostPositions[0] ?? null);
  272 |   expect(lantern).toBeTruthy();
  273 |   await teleport(page, lantern!.x, lantern!.z);
  274 |   await expectNote(page, 'lantern_post', 'Night Shift');
  275 |   assertNoErrors(errors);
  276 | });
  277 | 
  278 | test('megaproject site registers a note without replacing the signboard readout', async ({ page }) => {
  279 |   const entries = [
  280 |     ...metaEntry({ territory: 0, science: STEAMWORKS_THRESHOLD, hero: 0, agent: 0 }),
  281 |     ...researchEntry(STEAMWORKS_THRESHOLD),
  282 |     ...megaprojectResetEntry(),
  283 |   ];
  284 |   const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&nokill&seed=world-info-megaproject', entries);
  285 |   const footprint = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.megaproject.siteFootprint ?? null);
  286 |   expect(footprint).toBeTruthy();
  287 |   await teleport(page, footprint!.x, footprint!.z);
  288 |   await expectNote(page, 'megaproject_site', 'Steamworks door');
  289 |   await expect(page.getByTestId('world-info-note-hint')).toContainText('site signboard');
  290 |   assertNoErrors(errors);
  291 | });
  292 | 
  293 | test('town shells use info notes beside opens-soon prompts', async ({ page }, testInfo) => {
  294 |   await seedProfile(page, scopedEntry(TOWN_NAME_KEY, 'Quartz Hill'));
  295 |   const errors = collectErrors(page);
  296 |   await page.goto('/');
  297 |   await page.getByTestId('start-menu-enter-town').click();
  298 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  299 | 
  300 |   await approachTownBuilding(page, 'tavern');
> 301 |   await expect(page.getByTestId('town-approach-prompt')).toContainText('opens soon');
      |                                                          ^ Error: expect(locator).toContainText(expected) failed
  302 |   await expect(page.getByTestId('town-open-board')).toBeVisible();
  303 |   await expectNote(page, 'town_tavern', 'contract board');
  304 | 
  305 |   await approachTownBuilding(page, 'claim_office');
  306 |   await expect(page.getByTestId('town-approach-prompt')).toContainText('Claim Office');
  307 |   await expect(page.getByTestId('town-rename')).toBeVisible();
  308 |   await expectNote(page, 'town_claim_office', 'civic ledger');
  309 |   await shot(page, testInfo, 'town-claim-office-note');
  310 | 
  311 |   await approachTownBuilding(page, 'schoolhouse');
  312 |   await expect(page.getByTestId('town-approach-prompt')).toContainText('Schoolhouse');
  313 |   await expectNote(page, 'town_schoolhouse', 'Future lessons');
  314 | 
  315 |   await approachTownBuilding(page, 'assay_office');
  316 |   await expect(page.getByTestId('town-approach-prompt')).toContainText('Assay Office');
  317 |   await expectNote(page, 'town_assay_office', 'town side of orders');
  318 | 
  319 |   assertNoErrors(errors);
  320 | });
  321 | 
  322 | test('390px world note clears the touch stick zone', async ({ page }, testInfo) => {
  323 |   await page.setViewportSize({ width: 390, height: 844 });
  324 |   const errors = await openGame(page, '?debug&timescale=4&nowaves&nolevel&nokill&seed=world-info-mobile');
  325 |   await teleport(page, 0, 12);
  326 |   await expectNote(page, 'claim_stake', 'Lose it and the run is done');
  327 |   await expect(page.locator('#touch-controls')).toBeVisible();
  328 |   const boxes = await page.evaluate(() => {
  329 |     const note = document.querySelector<HTMLElement>('[data-testid="world-info-note"]')?.getBoundingClientRect();
  330 |     const controls = document.querySelector<HTMLElement>('#touch-controls')?.getBoundingClientRect();
  331 |     return note && controls
  332 |       ? {
  333 |           note: { top: note.top, bottom: note.bottom, left: note.left, right: note.right },
  334 |           controls: { top: controls.top, bottom: controls.bottom, left: controls.left, right: controls.right },
  335 |         }
  336 |       : null;
  337 |   });
  338 |   expect(boxes).toBeTruthy();
  339 |   expect(boxes!.note.bottom).toBeLessThanOrEqual(boxes!.controls.top - 8);
  340 |   await shot(page, testInfo, 'mobile-390-stake-note');
  341 |   assertNoErrors(errors);
  342 | });
  343 | 
```