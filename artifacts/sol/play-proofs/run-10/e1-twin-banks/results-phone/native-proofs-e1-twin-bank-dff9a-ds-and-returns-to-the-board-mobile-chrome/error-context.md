# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e1-twin-banks.spec.ts >> e1-twin-banks plays to its authored terminal, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:915:5

# Error details

```
Error: secures: runState=dead at wave 18 / 557.5s sim, 829 kills, 28 gold

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
        - generic: Wrecking crew sighted - south bank.
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 09:17
      - generic:
        - generic: Wave
        - strong: "18"
    - region "Gold pouch":
      - strong: "28"
    - region "Active weapon":
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 09:06 - Gathered 24 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "27"
        - strong: 148 / 220 XP
    - region "Build":
      - button "Build" [ref=e11]
    - button "Pause the claim" [ref=e12]: catch your breathⅡ
    - generic: Swipe to scroll
  - generic:
    - button [ref=e15]: Rotate
    - button [ref=e16]: Weapon
    - button [ref=e17]: OK
  - region "Run ledger" [ref=e18]:
    - generic [ref=e19]:
      - paragraph [ref=e20]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e21]
      - paragraph [ref=e22]: The claim was overrun. The gold remembers.
      - generic [ref=e23]:
        - generic [ref=e24]:
          - term [ref=e25]: Time Held
          - definition [ref=e26]: 09:17
        - generic [ref=e27]:
          - term [ref=e28]: Claim Jumpers Turned Back
          - definition [ref=e29]: "829"
        - generic [ref=e30]:
          - term [ref=e31]: Waves Survived
          - definition [ref=e32]: "18"
        - generic [ref=e33]:
          - term [ref=e34]: Gold Panned
          - definition [ref=e35]: "440"
        - generic [ref=e36]:
          - term [ref=e37]: Gold Sluiced
          - definition [ref=e38]: "0"
        - generic [ref=e39]:
          - term [ref=e40]: Stolen / Reclaimed
          - definition [ref=e41]: 0 / 0
        - generic [ref=e42]:
          - term [ref=e43]: Spent
          - definition [ref=e44]: "412"
        - generic [ref=e45]:
          - term [ref=e46]: Beacons Built
          - definition [ref=e47]: "2"
        - generic [ref=e48]:
          - term [ref=e49]: Buildings Built / Lost / Repaired
          - definition [ref=e50]: 7 / 1 / 3
        - generic [ref=e51]:
          - term [ref=e52]: Spark / Blast Damage
          - definition [ref=e53]: 38016 / 0
        - generic [ref=e54]:
          - term [ref=e55]: Blast Toggles
          - definition [ref=e56]: "0"
        - generic [ref=e57]:
          - term [ref=e58]: Blast Charge Time
          - definition [ref=e59]: 00:00
        - generic [ref=e60]:
          - term [ref=e61]: Upgrades Taken
          - definition [ref=e62]: blast 7 · damage 3 · firerate 3 · mobility 3 · plating 3 · range 2 · volley 2 · beacon 1 · panning 1 · prospecting 1
      - paragraph [ref=e63]: "Epoch science complete: the Steamworks awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +993 toward the Steamworks"
      - paragraph [ref=e64]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e65]:
        - paragraph [ref=e66]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e67]
        - generic [ref=e68]:
          - 'button "1 Advances arsenal Chain Spark Primer Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate. EVERY RUN" [active] [ref=e69]':
            - generic [ref=e70]: "1"
            - generic [ref=e71]: Advances arsenal
            - strong [ref=e72]: Chain Spark Primer
            - generic [ref=e73]: "Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate."
            - generic [ref=e75]: EVERY RUN
          - 'button "2 Advances economy Assay Grading Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight. EVERY RUN" [ref=e76]':
            - generic [ref=e77]: "2"
            - generic [ref=e78]: Advances economy
            - strong [ref=e79]: Assay Grading
            - generic [ref=e80]: "Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight."
            - generic [ref=e82]: EVERY RUN
        - paragraph [ref=e83]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e84]:
        - heading "Best Claims" [level=2] [ref=e85]
        - list [ref=e86]:
          - listitem [ref=e87]:
            - generic [ref=e88]: wave 30 · baseless
            - strong [ref=e89]: SECURED
            - generic [ref=e90]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e91]:
            - generic [ref=e92]: wave 30 · baseless
            - strong [ref=e93]: SECURED
            - generic [ref=e94]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e95]:
            - generic [ref=e96]: wave 30 · baseless
            - strong [ref=e97]: SECURED
            - generic [ref=e98]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e99]:
            - generic [ref=e100]: wave 30 · baseless
            - strong [ref=e101]: SECURED
            - generic [ref=e102]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e103]:
            - generic [ref=e104]: wave 30 · baseless
            - strong [ref=e105]: SECURED
            - generic [ref=e106]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
      - generic [ref=e107]:
        - button "Keep this tape" [ref=e108]
        - button "Return to Town" [ref=e109]
        - button "Try Again" [ref=e110]
```

# Test source

```ts
  1321 |         }
  1322 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1323 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1324 |         }
  1325 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1326 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1327 |         }
  1328 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1329 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1330 |         }
  1331 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1332 | 
  1333 |         if (sawOverlay) {
  1334 |           try {
  1335 | 
  1336 |             const before = initialScores;
  1337 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1338 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1339 |             const scores = await readScores(page);
  1340 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1341 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1342 |             row.banks = banked
  1343 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1344 |               : fail(
  1345 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1346 |                 );
  1347 |           } catch (error) {
  1348 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1349 |           }
  1350 |         } else {
  1351 |           row.banks = fail('skipped: never secured');
  1352 |         }
  1353 | 
  1354 |         if (id === 'e10-river' && sawOverlay) {
  1355 |           await riverEnding(page, row, ARTIFACT_ROOT);
  1356 |         } else if (row.banks.ok) {
  1357 |           try {
  1358 |             if (contract.id === 'e10-last-claim') {
  1359 |               await page.getByTestId('e10-return-town').click({ timeout: 20_000 });
  1360 |             }
  1361 |             for (let card = 0; card < 2; card += 1) {
  1362 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1363 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1364 |                 await page.waitForTimeout(250);
  1365 |               }
  1366 |             }
  1367 |             if (contract.id !== 'e10-last-claim') await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1368 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1369 |             row.board = pass(contract.id === 'e10-last-claim' ? 'the Book is on screen after the finale Return to the Ark button' : 'the Book is on screen straight off the run ledger');
  1370 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1371 |           } catch (error) {
  1372 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1373 |           }
  1374 |         } else {
  1375 |           row.board = fail('skipped: never banked');
  1376 |         }
  1377 | 
  1378 |         if (id !== 'e10-river' && row.banks.ok) {
  1379 |           try {
  1380 |             const before = await rawScores(page);
  1381 |             await page.goto('/');
  1382 |             await page.waitForLoadState('domcontentloaded');
  1383 |             const after = await rawScores(page);
  1384 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1385 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1386 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1387 |             const reachedTavern = await walkToTavern(page, row);
  1388 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1389 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1390 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1391 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1392 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1393 |           } catch (error) {
  1394 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1395 |           }
  1396 |         } else if (id !== 'e10-river') {
  1397 |           row.reload = fail('skipped: never banked');
  1398 |         }
  1399 | 
  1400 |         row.clean =
  1401 |           consoleErrors.length === 0 && pageErrors.length === 0
  1402 |             ? pass('0 console, 0 page')
  1403 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1404 |       } finally {
  1405 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1406 |         if (row.finalSnapshot) {
  1407 |           if (id !== 'e10-river') row.objective = row.finalSnapshot.objective;
  1408 |           if (!row.banks.ok) {
  1409 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1410 |             row.simAtEnd = row.finalSnapshot.sim;
  1411 |             row.hpAtEnd = row.finalSnapshot.hp;
  1412 |             row.goldAtEnd = row.finalSnapshot.gold;
  1413 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1414 |           }
  1415 |         }
  1416 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1417 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1418 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1419 |       }
  1420 | 
> 1421 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 18 / 557.5s sim, 829 kills, 28 gold
  1422 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1423 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1424 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1425 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1426 |     });
  1427 | }
  1428 | 
  1429 | type Score = { contractId?: string; secured?: boolean; completed?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1430 | 
  1431 | async function rawScores(page: Page): Promise<string | null> {
  1432 |   return page.evaluate(
  1433 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1434 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1435 |   );
  1436 | }
  1437 | 
  1438 | async function readScores(page: Page): Promise<Score[]> {
  1439 |   const raw = await rawScores(page);
  1440 |   try {
  1441 |     const parsed = JSON.parse(raw ?? '[]');
  1442 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1443 |   } catch {
  1444 |     return [];
  1445 |   }
  1446 | }
  1447 | 
  1448 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1449 |   for (let step = 0; step < 70; step += 1) {
  1450 |     const town = await page
  1451 |       .evaluate(() => {
  1452 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1453 |         if (!d) return null;
  1454 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1455 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1456 |       })
  1457 |       .catch(() => null);
  1458 |     if (!town) return false;
  1459 |     if (town.prompt === 'tavern') return true;
  1460 |     if (!town.approach) return false;
  1461 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1462 |   }
  1463 |   row.notes.push('could not reach the tavern in 70 steps');
  1464 |   return false;
  1465 | }
  1466 | 
  1467 | /** The no-wave River ending starts at the real lever, after a native wave-8 prelude. */
  1468 | async function riverEnding(page: Page, row: Row, root: string): Promise<void> {
  1469 |   const prelude = { secures: row.secures, banks: row.banks, finalSnapshot: row.finalSnapshot, builds: [...row.builds], samples: [...row.samples], upgrades: [...row.upgrades] };
  1470 |   row.notes.push('Last Claim prelude retained in objective.prelude; River fields below measure the lever-launched ending.');
  1471 |   const beforeScores = await readScores(page);
  1472 |   const beforeAts = new Set(beforeScores.map(s => s.at));
  1473 |   await page.screenshot({ path: path.join(root, `prelude-${row.project}.png`) });
  1474 |   await page.getByTestId('e10-river-lever').click({ timeout: 20_000 });
  1475 |   await page.waitForURL(url => url.searchParams.get('contract') === 'the-claim', { timeout: BOOT_TIMEOUT_MS });
  1476 |   // The application itself writes nowaves. We do not construct or modify this URL.
  1477 |   const launchUrl = page.url();
  1478 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: BOOT_TIMEOUT_MS });
  1479 |   const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  1480 |   const briefing = await page.getByTestId('contract-briefing-name').textContent();
  1481 |   row.boots = active?.activeId === 'the-claim' && active.fallbackReason === null && briefing?.trim() === 'The River'
  1482 |     ? pass(`earned finale lever launched The River, activeId=${active.activeId}; application URL=${launchUrl}`)
  1483 |     : fail(`lever launch mismatch: ${JSON.stringify(active)}, briefing=${briefing}`);
  1484 |   await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 });
  1485 |   await unpause(page, row);
  1486 |   row.samples = [];
  1487 |   row.builds = [];
  1488 |   row.upgrades = [];
  1489 |   row.peakWave = 0;
  1490 |   row.secureWave = 0;
  1491 |   const opened = await read(page);
  1492 |   const startGold = opened?.gold ?? 0;
  1493 |   const started = Date.now();
  1494 |   const panned = await fund(page, row, startGold + 5, started + 60_000, [{ x: 0 }], new Set());
  1495 |   // Observe beyond the ordinary first-wave interval; the ending must remain quiet.
  1496 |   while (Date.now() < started + 75_000) {
  1497 |     await takeUpgrades(page, row);
  1498 |     const state = await read(page);
  1499 |     if (!state || state.wave > 0 || state.enemiesAlive > 0 || state.sim >= 35) break;
  1500 |     await page.waitForTimeout(250);
  1501 |   }
  1502 |   const end = await read(page);
  1503 |   row.finalSnapshot = end ?? undefined;
  1504 |   row.peakWave = end?.wave ?? 0;
  1505 |   row.simAtEnd = end?.sim ?? 0;
  1506 |   row.runStateAtEnd = end?.runState ?? '';
  1507 |   row.hpAtEnd = end?.hp ?? 0;
  1508 |   row.goldAtEnd = end?.gold ?? 0;
  1509 |   row.killsAtEnd = end?.kills ?? 0;
  1510 |   const quiet = end && end.sim >= 35 && end.wave === 0 && end.enemiesAlive === 0 && row.samples.every(s => s.wave === 0 && s.alive === 0);
  1511 |   row.secures = panned && quiet
  1512 |     ? pass(`authored no-wave pan: gold ${startGold} -> ${end.gold}, wave 0, zero enemies through ${end.sim.toFixed(1)}s; no Claim Secured overlay`)
  1513 |     : fail(`River pan=${panned}, gold=${end?.gold}, wave=${end?.wave}, enemies=${end?.enemiesAlive}, sim=${end?.sim}`);
  1514 |   row.objective = { prelude, river: { launchUrl, briefing, startGold, panned, quiet, end } };
  1515 |   await page.screenshot({ path: path.join(root, `terminal-${row.project}.png`) });
  1516 |   const atPan = await readScores(page);
  1517 |   const bankButton = page.getByTestId('bank-secured-claim');
  1518 |   if (await bankButton.isVisible().catch(() => false)) await bankButton.click();
  1519 |   const completed = (await readScores(page)).find(s => s.contractId === 'e10-river' && !beforeAts.has(s.at) && (s.secured || s.completed));
  1520 |   row.banks = completed
  1521 |     ? pass(`new completed River score: ${JSON.stringify(completed)}`)
```