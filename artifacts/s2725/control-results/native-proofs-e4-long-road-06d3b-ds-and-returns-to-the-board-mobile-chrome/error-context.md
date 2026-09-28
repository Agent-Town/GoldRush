# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e4-long-road.spec.ts >> e4-long-road plays to its authored terminal, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:949:5

# Error details

```
Error: secures: runState=dead at wave 7 / 226.4s sim, 151 kills, 0 gold

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
        - generic: Wrecking crew sighted - west ridge.
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 150
      - generic:
        - generic: Time
        - strong: 03:46
      - generic:
        - generic: Wave
        - strong: "7"
    - region "Gold pouch":
      - strong: "0"
    - region "Active weapon":
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 03:40 - Gathered 4 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "9"
        - strong: 28 / 76 XP
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
          - definition [ref=e26]: 03:46
        - generic [ref=e27]:
          - term [ref=e28]: Claim Jumpers Turned Back
          - definition [ref=e29]: "151"
        - generic [ref=e30]:
          - term [ref=e31]: Waves Survived
          - definition [ref=e32]: "7"
        - generic [ref=e33]:
          - term [ref=e34]: Gold Panned
          - definition [ref=e35]: "145"
        - generic [ref=e36]:
          - term [ref=e37]: Gold Sluiced
          - definition [ref=e38]: "0"
        - generic [ref=e39]:
          - term [ref=e40]: Stolen / Reclaimed
          - definition [ref=e41]: 0 / 0
        - generic [ref=e42]:
          - term [ref=e43]: Spent
          - definition [ref=e44]: "145"
        - generic [ref=e45]:
          - term [ref=e46]: Beacons Built
          - definition [ref=e47]: "1"
        - generic [ref=e48]:
          - term [ref=e49]: Buildings Built / Lost / Repaired
          - definition [ref=e50]: 3 / 0 / 0
        - generic [ref=e51]:
          - term [ref=e52]: Spark / Blast Damage
          - definition [ref=e53]: 5388 / 0
        - generic [ref=e54]:
          - term [ref=e55]: Blast Toggles
          - definition [ref=e56]: "0"
        - generic [ref=e57]:
          - term [ref=e58]: Blast Charge Time
          - definition [ref=e59]: 00:00
        - generic [ref=e60]:
          - term [ref=e61]: Upgrades Taken
          - definition [ref=e62]: firerate 2 · plating 2 · volley 2 · damage 1 · mobility 1
      - paragraph [ref=e63]: "Epoch science complete: the Deepwater Claim awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +987 toward the Deepwater Claim"
      - paragraph [ref=e64]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e65]:
        - paragraph [ref=e66]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e67]
        - generic [ref=e68]:
          - 'button "1 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [active] [ref=e69]':
            - generic [ref=e70]: "1"
            - generic [ref=e71]: Advances crafting-agent
            - strong [ref=e72]: "Continued Study: Seam Yield"
            - generic [ref=e73]: "Effect: +1% seam panning yield."
            - generic [ref=e75]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Turret Damage Effect: +1% turret damage. EVERY RUN" [ref=e76]':
            - generic [ref=e77]: "2"
            - generic [ref=e78]: Advances crafting-agent
            - strong [ref=e79]: "Continued Study: Turret Damage"
            - generic [ref=e80]: "Effect: +1% turret damage."
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
  1356 |         }
  1357 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1358 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1359 |         }
  1360 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1361 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1362 |         }
  1363 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1364 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1365 |         }
  1366 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1367 | 
  1368 |         if (sawOverlay) {
  1369 |           try {
  1370 | 
  1371 |             const before = initialScores;
  1372 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1373 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1374 |             const scores = await readScores(page);
  1375 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1376 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1377 |             row.banks = banked
  1378 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1379 |               : fail(
  1380 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1381 |                 );
  1382 |           } catch (error) {
  1383 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1384 |           }
  1385 |         } else {
  1386 |           row.banks = fail('skipped: never secured');
  1387 |         }
  1388 | 
  1389 |         if (id === 'e10-river' && sawOverlay) {
  1390 |           await riverEnding(page, row, ARTIFACT_ROOT);
  1391 |         } else if (row.banks.ok) {
  1392 |           try {
  1393 |             if (contract.id === 'e10-last-claim') {
  1394 |               await page.getByTestId('e10-return-town').click({ timeout: 20_000 });
  1395 |             }
  1396 |             for (let card = 0; card < 2; card += 1) {
  1397 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1398 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1399 |                 await page.waitForTimeout(250);
  1400 |               }
  1401 |             }
  1402 |             if (contract.id !== 'e10-last-claim') await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1403 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1404 |             row.board = pass(contract.id === 'e10-last-claim' ? 'the Book is on screen after the finale Return to the Ark button' : 'the Book is on screen straight off the run ledger');
  1405 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1406 |           } catch (error) {
  1407 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1408 |           }
  1409 |         } else {
  1410 |           row.board = fail('skipped: never banked');
  1411 |         }
  1412 | 
  1413 |         if (id !== 'e10-river' && row.banks.ok) {
  1414 |           try {
  1415 |             const before = await rawScores(page);
  1416 |             await page.goto('/');
  1417 |             await page.waitForLoadState('domcontentloaded');
  1418 |             const after = await rawScores(page);
  1419 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1420 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1421 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1422 |             const reachedTavern = await walkToTavern(page, row);
  1423 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1424 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1425 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1426 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1427 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1428 |           } catch (error) {
  1429 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1430 |           }
  1431 |         } else if (id !== 'e10-river') {
  1432 |           row.reload = fail('skipped: never banked');
  1433 |         }
  1434 | 
  1435 |         row.clean =
  1436 |           consoleErrors.length === 0 && pageErrors.length === 0
  1437 |             ? pass('0 console, 0 page')
  1438 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1439 |       } finally {
  1440 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1441 |         if (row.finalSnapshot) {
  1442 |           if (id !== 'e10-river') row.objective = row.finalSnapshot.objective;
  1443 |           if (!row.banks.ok) {
  1444 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1445 |             row.simAtEnd = row.finalSnapshot.sim;
  1446 |             row.hpAtEnd = row.finalSnapshot.hp;
  1447 |             row.goldAtEnd = row.finalSnapshot.gold;
  1448 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1449 |           }
  1450 |         }
  1451 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1452 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1453 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1454 |       }
  1455 | 
> 1456 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 7 / 226.4s sim, 151 kills, 0 gold
  1457 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1458 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1459 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1460 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1461 |     });
  1462 | }
  1463 | 
  1464 | type Score = { contractId?: string; secured?: boolean; completed?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1465 | 
  1466 | async function rawScores(page: Page): Promise<string | null> {
  1467 |   return page.evaluate(
  1468 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1469 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1470 |   );
  1471 | }
  1472 | 
  1473 | async function readScores(page: Page): Promise<Score[]> {
  1474 |   const raw = await rawScores(page);
  1475 |   try {
  1476 |     const parsed = JSON.parse(raw ?? '[]');
  1477 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1478 |   } catch {
  1479 |     return [];
  1480 |   }
  1481 | }
  1482 | 
  1483 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1484 |   for (let step = 0; step < 70; step += 1) {
  1485 |     const town = await page
  1486 |       .evaluate(() => {
  1487 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1488 |         if (!d) return null;
  1489 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1490 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1491 |       })
  1492 |       .catch(() => null);
  1493 |     if (!town) return false;
  1494 |     if (town.prompt === 'tavern') return true;
  1495 |     if (!town.approach) return false;
  1496 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1497 |   }
  1498 |   row.notes.push('could not reach the tavern in 70 steps');
  1499 |   return false;
  1500 | }
  1501 | 
  1502 | /** The no-wave River ending starts at the real lever, after a native wave-8 prelude. */
  1503 | async function riverEnding(page: Page, row: Row, root: string): Promise<void> {
  1504 |   const prelude = { secures: row.secures, banks: row.banks, finalSnapshot: row.finalSnapshot, builds: [...row.builds], samples: [...row.samples], upgrades: [...row.upgrades] };
  1505 |   row.notes.push('Last Claim prelude retained in objective.prelude; River fields below measure the lever-launched ending.');
  1506 |   const beforeScores = await readScores(page);
  1507 |   const beforeAts = new Set(beforeScores.map(s => s.at));
  1508 |   await page.screenshot({ path: path.join(root, `prelude-${row.project}.png`) });
  1509 |   await page.getByTestId('e10-river-lever').click({ timeout: 20_000 });
  1510 |   await page.waitForURL(url => url.searchParams.get('contract') === 'the-claim', { timeout: BOOT_TIMEOUT_MS });
  1511 |   // The application itself writes nowaves. We do not construct or modify this URL.
  1512 |   const launchUrl = page.url();
  1513 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: BOOT_TIMEOUT_MS });
  1514 |   const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  1515 |   const briefing = await page.getByTestId('contract-briefing-name').textContent();
  1516 |   row.boots = active?.activeId === 'the-claim' && active.fallbackReason === null && briefing?.trim() === 'The River'
  1517 |     ? pass(`earned finale lever launched The River, activeId=${active.activeId}; application URL=${launchUrl}`)
  1518 |     : fail(`lever launch mismatch: ${JSON.stringify(active)}, briefing=${briefing}`);
  1519 |   await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 });
  1520 |   await unpause(page, row);
  1521 |   row.samples = [];
  1522 |   row.builds = [];
  1523 |   row.upgrades = [];
  1524 |   row.peakWave = 0;
  1525 |   row.secureWave = 0;
  1526 |   const opened = await read(page);
  1527 |   const startGold = opened?.gold ?? 0;
  1528 |   const started = Date.now();
  1529 |   const panned = await fund(page, row, startGold + 5, started + 60_000, [{ x: 0 }], new Set());
  1530 |   // Observe beyond the ordinary first-wave interval; the ending must remain quiet.
  1531 |   while (Date.now() < started + 75_000) {
  1532 |     await takeUpgrades(page, row);
  1533 |     const state = await read(page);
  1534 |     if (!state || state.wave > 0 || state.enemiesAlive > 0 || state.sim >= 35) break;
  1535 |     await page.waitForTimeout(250);
  1536 |   }
  1537 |   const end = await read(page);
  1538 |   row.finalSnapshot = end ?? undefined;
  1539 |   row.peakWave = end?.wave ?? 0;
  1540 |   row.simAtEnd = end?.sim ?? 0;
  1541 |   row.runStateAtEnd = end?.runState ?? '';
  1542 |   row.hpAtEnd = end?.hp ?? 0;
  1543 |   row.goldAtEnd = end?.gold ?? 0;
  1544 |   row.killsAtEnd = end?.kills ?? 0;
  1545 |   const quiet = end && end.sim >= 35 && end.wave === 0 && end.enemiesAlive === 0 && row.samples.every(s => s.wave === 0 && s.alive === 0);
  1546 |   row.secures = panned && quiet
  1547 |     ? pass(`authored no-wave pan: gold ${startGold} -> ${end.gold}, wave 0, zero enemies through ${end.sim.toFixed(1)}s; no Claim Secured overlay`)
  1548 |     : fail(`River pan=${panned}, gold=${end?.gold}, wave=${end?.wave}, enemies=${end?.enemiesAlive}, sim=${end?.sim}`);
  1549 |   row.objective = { prelude, river: { launchUrl, briefing, startGold, panned, quiet, end } };
  1550 |   await page.screenshot({ path: path.join(root, `terminal-${row.project}.png`) });
  1551 |   const atPan = await readScores(page);
  1552 |   const bankButton = page.getByTestId('bank-secured-claim');
  1553 |   if (await bankButton.isVisible().catch(() => false)) await bankButton.click();
  1554 |   const completed = (await readScores(page)).find(s => s.contractId === 'e10-river' && !beforeAts.has(s.at) && (s.secured || s.completed));
  1555 |   row.banks = completed
  1556 |     ? pass(`new completed River score: ${JSON.stringify(completed)}`)
```