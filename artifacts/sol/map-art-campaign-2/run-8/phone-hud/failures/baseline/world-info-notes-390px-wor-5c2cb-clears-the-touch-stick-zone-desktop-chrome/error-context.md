# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: world-info-notes.spec.ts >> 390px world note clears the touch stick zone
- Location: e2e/world-info-notes.spec.ts:322:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 586
Received:    660
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
          - strong: 00:17
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
      - button "Pause the claim" [ref=e11]: catch your breath
      - generic [ref=e12]:
        - text: Swipe to scroll
        - group [ref=e13]:
          - generic "Claim Stake Swipe to scroll" [ref=e14] [cursor=pointer]
          - paragraph [ref=e15]: The heart of the claim. Lose it and the run is done.
    - generic:
      - button [ref=e18]: Rotate
      - button [ref=e19]: Weapon
      - button [ref=e20]: OK
    - region
    - text: None None None
  - generic [ref=e21]:
    - button "▸ Game tuning" [ref=e22] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e23]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
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
  301 |   await expect(page.getByTestId('town-approach-prompt')).toContainText('opens soon');
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
> 339 |   expect(boxes!.note.bottom).toBeLessThanOrEqual(boxes!.controls.top - 8);
      |                              ^ Error: expect(received).toBeLessThanOrEqual(expected)
  340 |   await shot(page, testInfo, 'mobile-390-stake-note');
  341 |   assertNoErrors(errors);
  342 | });
  343 | 
```