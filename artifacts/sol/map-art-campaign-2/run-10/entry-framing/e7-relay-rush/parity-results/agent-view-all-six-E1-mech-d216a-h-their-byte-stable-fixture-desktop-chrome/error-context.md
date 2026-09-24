# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: agent-view.spec.ts >> all six E1 mechanics manifests match their byte-stable fixture
- Location: e2e/agent-view.spec.ts:439:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 0
+ Received  + 3

@@ -668,10 +668,11 @@
        Object {
          "data": Object {
            "darkWave": 10,
            "dawnWave": 25,
            "duskWave": 5,
+           "entryLandmark": "This map leads with the lampworks_yard landmark.",
          },
          "id": "darkness_cycle",
          "source": "twist.lightRamp",
        },
        Object {
@@ -875,10 +876,11 @@
          "source": "tileParams.river",
        },
        Object {
          "data": Object {
            "count": 2,
+           "entryLandmark": "This map leads with the south_bank_homestead landmark.",
            "ids": Array [
              "east-ford",
              "west-ford",
            ],
          },
@@ -1000,10 +1002,11 @@
        ],
      },
      "rules": Array [
        Object {
          "data": Object {
+           "entryLandmark": "This map leads with the seized_headframe landmark.",
            "escortCount": 8,
            "hpScale": 240,
          },
          "id": "baron",
          "source": "twist.baron",
```

# Test source

```ts
  345 |         "id": "gold-seam-1",
  346 |         "active": true,
  347 |         "remaining": 30,
  348 |         "x": -9,
  349 |         "z": 6.7,
  350 |         "anchorIndex": 1
  351 |       },
  352 |       {
  353 |         "id": "gold-seam-2",
  354 |         "active": true,
  355 |         "remaining": 30,
  356 |         "x": -1.5,
  357 |         "z": -6.4,
  358 |         "anchorIndex": 2
  359 |       },
  360 |       {
  361 |         "id": "gold-seam-3",
  362 |         "active": false,
  363 |         "remaining": 30,
  364 |         "x": null,
  365 |         "z": null,
  366 |         "anchorIndex": null
  367 |       },
  368 |       {
  369 |         "id": "gold-seam-4",
  370 |         "active": false,
  371 |         "remaining": 30,
  372 |         "x": null,
  373 |         "z": null,
  374 |         "anchorIndex": null
  375 |       },
  376 |       {
  377 |         "id": "gold-seam-5",
  378 |         "active": false,
  379 |         "remaining": 30,
  380 |         "x": null,
  381 |         "z": null,
  382 |         "anchorIndex": null
  383 |       },
  384 |       {
  385 |         "id": "gold-seam-6",
  386 |         "active": false,
  387 |         "remaining": 30,
  388 |         "x": null,
  389 |         "z": null,
  390 |         "anchorIndex": null
  391 |       }
  392 |     ],
  393 |     "score": {
  394 |       "wavesSurvived": 3,
  395 |       "goldPanned": 0,
  396 |       "goldPannedByProspector": 0,
  397 |       "goldStolen": 0,
  398 |       "goldReclaimed": 0,
  399 |       "goldReclaimedByProspector": 0,
  400 |       "buildingsBuilt": 0
  401 |     }
  402 |   },
  403 |   "almanac": {
  404 |     "label": "the Almanac reckons",
  405 |     "estimate": true,
  406 |     "nextWave": {
  407 |       "wave": 4,
  408 |       "arrivalInSeconds": 30,
  409 |       "basis": "estimated-from-wave-schedule",
  410 |       "composition": [
  411 |         {
  412 |           "id": "claim_jumper",
  413 |           "label": "Claim Jumpers",
  414 |           "count": 15
  415 |         }
  416 |       ]
  417 |     },
  418 |     "projection": {
  419 |       "expectedLeaks": 0,
  420 |       "expectedWorksDamage": 0,
  421 |       "expectedGold": 55.83,
  422 |       "currentWorks": 1,
  423 |       "harnessHash": "fnv1a32:b7eecc61"
  424 |     }
  425 |   }
  426 | }`;
  427 | 
  428 | test('the zero-error rider suppresses only the known transient', async ({ page }) => {
  429 |   const watch = watchErrors(page);
  430 |   await page.evaluate(() => {
  431 |     console.error("THREE.GLTFLoader: Couldn't load texture blob:mutation-control");
  432 |     console.error('foreign console error mutation control');
  433 |   });
  434 |   expect(watch.suppressed).toEqual(["THREE.GLTFLoader: Couldn't load texture blob:mutation-control"]);
  435 |   expect(watch.errors).toEqual(['foreign console error mutation control']);
  436 |   expect(() => expectNoConsoleErrors(watch, 'mutation control')).toThrow();
  437 | });
  438 | 
  439 | test('all six E1 mechanics manifests match their byte-stable fixture', async () => {
  440 |   const fixtures = JSON.parse(await readFile(path.resolve('e2e/fixtures/e1-mechanics-manifests.json'), 'utf8')) as MechanicsManifest[];
  441 |   const ids = listContracts().map(({ id }) => id);
  442 |   const manifests = ids.map(deriveMechanicsManifest);
  443 | 
  444 |   expect(ids).toEqual(['the-claim', 'e1-drill-yard', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron']);
> 445 |   expect(manifests).toEqual(fixtures);
      |                     ^ Error: expect(received).toEqual(expected) // deep equality
  446 |   expect(JSON.stringify(manifests)).toBe(JSON.stringify(fixtures));
  447 |   for (const id of ids) expect(JSON.stringify(deriveMechanicsManifest(id))).toBe(JSON.stringify(deriveMechanicsManifest(id)));
  448 | 
  449 |   const night = deriveMechanicsManifest('e1-night-shift');
  450 |   expect(night.interactables).toContainEqual(expect.objectContaining({ id: 'lantern_post', operations: ['relight'] }));
  451 |   expect(night.rules.map(({ id }) => id)).toContain('darkness_cycle');
  452 |   expect(deriveMechanicsManifest('e1-dry-gulch').rules.map(({ id }) => id)).toContain('spring_cells');
  453 |   expect(deriveMechanicsManifest('e1-twin-banks').rules).toContainEqual(
  454 |     expect.objectContaining({ id: 'water_crossings', data: expect.objectContaining({ count: 2 }) }),
  455 |   );
  456 |   expect(deriveMechanicsManifest('e2-hill-mine').modes).toEqual([
  457 |     expect.objectContaining({ id: 'escort', cartsRequired: 1, payout: 40, railRouteIndex: 0 }),
  458 |   ]);
  459 |   for (const id of ['the-claim', 'e1-night-shift', 'e1-baron']) {
  460 |     expect(deriveMechanicsManifest(id).rules).toContainEqual(
  461 |       expect.objectContaining({ id: 'water_crossings', data: { count: 1, ids: ['center-ford'] } }),
  462 |     );
  463 |   }
  464 | 
  465 |   const pressed = structuredClone(listContracts().find(({ id }) => id === 'e1-night-shift')!);
  466 |   pressed.twist.secureWave = 24;
  467 |   expect(deriveMechanicsManifest(pressed).posting.waves).toContainEqual(
  468 |     expect.objectContaining({ event: 'secure', wave: 24 }),
  469 |   );
  470 | });
  471 | 
  472 | test('the derived manifest rides THE VIEW and every E1 briefing speaks it', async ({ page }) => {
  473 |   const watch = watchErrors(page);
  474 |   await page.goto('/?debug&contract=e1-night-shift&nowaves&nolevel&terrain2d&seed=mechanics-view');
  475 |   await page.waitForFunction(() => Boolean(window.__GR_AGENT__ && 'view' in window.__GR_AGENT__));
  476 |   expect(await page.evaluate(() => window.__GR_AGENT__!.view.stablePrefix.mechanics)).toEqual(
  477 |     deriveMechanicsManifest('e1-night-shift'),
  478 |   );
  479 | 
  480 |   await page.evaluate(
  481 |     ({ profileKey, scoreKey, townKey, metaKey, storyKey }) => {
  482 |       localStorage.clear();
  483 |       localStorage.setItem(profileKey, JSON.stringify({
  484 |         version: 2,
  485 |         activeId: 'manifest',
  486 |         profiles: [{
  487 |           id: 'manifest',
  488 |           name: 'Manifest',
  489 |           createdAt: 1,
  490 |           updatedAt: 1,
  491 |           difficultyPreset: 'trail',
  492 |           hintsSeen: [],
  493 |         }],
  494 |       }));
  495 |       localStorage.setItem(scoreKey, JSON.stringify([
  496 |         { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 1, secured: true, contractId: 'the-claim', profileName: 'Manifest' },
  497 |         { waves: 20, kills: 0, gold: 0, timeAlive: 60, at: 2, secured: true, contractId: 'e1-dry-gulch', profileName: 'Manifest' },
  498 |       ]));
  499 |       localStorage.setItem(townKey, 'Manifest Hill');
  500 |       localStorage.setItem(metaKey, JSON.stringify({ version: 1, tracks: { territory: 0, science: 6, hero: 0, agent: 0 } }));
  501 |       localStorage.setItem(storyKey, '0');
  502 |     },
  503 |     {
  504 |       profileKey: PROFILE_KEY,
  505 |       scoreKey: profileDataKey('manifest', SCOREBOARD_KEY),
  506 |       townKey: profileDataKey('manifest', TOWN_NAME_KEY),
  507 |       metaKey: profileDataKey('manifest', META_PROGRESS_KEY),
  508 |       storyKey: STORY_TALES_STORAGE_KEY,
  509 |     },
  510 |   );
  511 |   await page.goto('/?tier=lite');
  512 |   await page.getByTestId('start-menu-enter-town').click();
  513 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  514 |   await page.evaluate(() => {
  515 |     const town = window.__GR_TOWN_DIAGNOSTICS__!;
  516 |     const tavern = town.buildings.find(({ id }) => id === 'tavern');
  517 |     if (!tavern) throw new Error('Missing tavern');
  518 |     town.teleport(tavern.approach.x, tavern.approach.z);
  519 |   });
  520 |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  521 |   await page.getByTestId('town-open-board').click();
  522 | 
  523 |   for (const id of listContracts().map(({ id }) => id)) {
  524 |     await expect(page.getByTestId(`contract-board-mechanics-${id}`)).toHaveText(
  525 |       mechanicsManifestLine(deriveMechanicsManifest(id)),
  526 |     );
  527 |   }
  528 |   const drillYardLine = page.getByTestId('contract-board-mechanics-e1-drill-yard');
  529 |   await expect(drillYardLine).toContainText('straw men');
  530 |   await expect(drillYardLine).not.toContainText('straw mans');
  531 |   await expect(drillYardLine).toContainText('rolling logs');
  532 |   await expect(page.getByTestId('contract-board-mechanics-e1-night-shift')).toContainText('lantern posts');
  533 |   expectNoConsoleErrors(watch, 'manifest view');
  534 | });
  535 | 
  536 | test('THE VIEW publishes the Prospector and hero as different bodies', async ({ page }) => {
  537 |   const watch = watchErrors(page);
  538 |   await page.goto('/?debug&nowaves&nolevel&terrain2d&seed=prospector-view');
  539 |   await page.waitForFunction(() => Boolean(window.__GR_AGENT__ && 'view' in window.__GR_AGENT__));
  540 | 
  541 |   const bodies = await page.evaluate(async () => {
  542 |     const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
  543 |     const position = diagnostics.agent!.embodiment!.position;
  544 |     const view = window.__GR_AGENT__!.view;
  545 |     const { buildView } = await import('../src/agent/View');
```