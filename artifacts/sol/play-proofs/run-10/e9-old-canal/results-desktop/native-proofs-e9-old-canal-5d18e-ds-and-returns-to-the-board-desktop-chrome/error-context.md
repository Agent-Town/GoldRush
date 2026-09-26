# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e9-old-canal.spec.ts >> e9-old-canal plays to its authored terminal, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:902:5

# Error details

```
Error: secures: runState=dead at wave 18 / 556.9s sim, 806 kills, 67 gold

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
        - generic: Wrecking crew sighted - north bank.
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 09:16
      - generic:
        - generic: Wave
        - strong: "18"
    - region "Gold pouch":
      - generic: Gold
      - strong: "67"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 09:08 - Gathered 32 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "27"
        - strong: 96 / 220 XP
    - region "Build":
      - button "Build" [ref=e12]
    - button "Pause the claim" [ref=e13]: P - catch your breath
  - region "Run ledger" [ref=e14]:
    - generic [ref=e15]:
      - paragraph [ref=e16]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e17]
      - paragraph [ref=e18]: The claim was overrun. The gold remembers.
      - generic [ref=e19]:
        - generic [ref=e20]:
          - term [ref=e21]: Time Held
          - definition [ref=e22]: 09:16
        - generic [ref=e23]:
          - term [ref=e24]: Claim Jumpers Turned Back
          - definition [ref=e25]: "806"
        - generic [ref=e26]:
          - term [ref=e27]: Waves Survived
          - definition [ref=e28]: "18"
        - generic [ref=e29]:
          - term [ref=e30]: Gold Panned
          - definition [ref=e31]: "670"
        - generic [ref=e32]:
          - term [ref=e33]: Gold Sluiced
          - definition [ref=e34]: "0"
        - generic [ref=e35]:
          - term [ref=e36]: Stolen / Reclaimed
          - definition [ref=e37]: 0 / 0
        - generic [ref=e38]:
          - term [ref=e39]: Spent
          - definition [ref=e40]: "603"
        - generic [ref=e41]:
          - term [ref=e42]: Beacons Built
          - definition [ref=e43]: "4"
        - generic [ref=e44]:
          - term [ref=e45]: Buildings Built / Lost / Repaired
          - definition [ref=e46]: 8 / 11 / 6
        - generic [ref=e47]:
          - term [ref=e48]: Spark / Blast Damage
          - definition [ref=e49]: 30715 / 0
        - generic [ref=e50]:
          - term [ref=e51]: Blast Toggles
          - definition [ref=e52]: "0"
        - generic [ref=e53]:
          - term [ref=e54]: Blast Charge Time
          - definition [ref=e55]: 00:00
        - generic [ref=e56]:
          - term [ref=e57]: Upgrades Taken
          - definition [ref=e58]: blast 6 · damage 3 · firerate 3 · mobility 3 · plating 3 · beacon 2 · range 2 · volley 2 · panning 1 · prospecting 1
      - paragraph [ref=e59]: "Epoch science complete: the Deep Sky awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +977 toward the Deep Sky"
      - paragraph [ref=e60]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e61]:
        - paragraph [ref=e62]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e63]
        - generic [ref=e64]:
          - 'button "1 Advances crafting-agent Storm-Draw Effect: Unlocks Storm-Draw: 28 damage across 14m every 0.62s. EVERY RUN" [active] [ref=e65]':
            - generic [ref=e66]: "1"
            - generic [ref=e67]: Advances crafting-agent
            - strong [ref=e68]: Storm-Draw
            - generic [ref=e69]: "Effect: Unlocks Storm-Draw: 28 damage across 14m every 0.62s."
            - generic [ref=e71]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [ref=e72]':
            - generic [ref=e73]: "2"
            - generic [ref=e74]: Advances crafting-agent
            - strong [ref=e75]: "Continued Study: Seam Yield"
            - generic [ref=e76]: "Effect: +1% seam panning yield."
            - generic [ref=e78]: EVERY RUN
        - paragraph [ref=e79]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e80]:
        - heading "Best Claims" [level=2] [ref=e81]
        - list [ref=e82]:
          - listitem [ref=e83]:
            - generic [ref=e84]: wave 30 · baseless
            - strong [ref=e85]: SECURED
            - generic [ref=e86]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
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
      - generic [ref=e103]:
        - button "Keep this tape" [ref=e104]
        - button "Return to Town" [ref=e105]
        - button "Try Again" [ref=e106]
```

# Test source

```ts
  1308 |         }
  1309 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1310 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1311 |         }
  1312 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1313 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1314 |         }
  1315 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1316 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1317 |         }
  1318 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1319 | 
  1320 |         if (sawOverlay) {
  1321 |           try {
  1322 | 
  1323 |             const before = initialScores;
  1324 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1325 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1326 |             const scores = await readScores(page);
  1327 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1328 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1329 |             row.banks = banked
  1330 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1331 |               : fail(
  1332 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1333 |                 );
  1334 |           } catch (error) {
  1335 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1336 |           }
  1337 |         } else {
  1338 |           row.banks = fail('skipped: never secured');
  1339 |         }
  1340 | 
  1341 |         if (id === 'e10-river' && sawOverlay) {
  1342 |           await riverEnding(page, row, ARTIFACT_ROOT);
  1343 |         } else if (row.banks.ok) {
  1344 |           try {
  1345 |             if (contract.id === 'e10-last-claim') {
  1346 |               await page.getByTestId('e10-return-town').click({ timeout: 20_000 });
  1347 |             }
  1348 |             for (let card = 0; card < 2; card += 1) {
  1349 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1350 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1351 |                 await page.waitForTimeout(250);
  1352 |               }
  1353 |             }
  1354 |             if (contract.id !== 'e10-last-claim') await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1355 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1356 |             row.board = pass(contract.id === 'e10-last-claim' ? 'the Book is on screen after the finale Return to the Ark button' : 'the Book is on screen straight off the run ledger');
  1357 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1358 |           } catch (error) {
  1359 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1360 |           }
  1361 |         } else {
  1362 |           row.board = fail('skipped: never banked');
  1363 |         }
  1364 | 
  1365 |         if (id !== 'e10-river' && row.banks.ok) {
  1366 |           try {
  1367 |             const before = await rawScores(page);
  1368 |             await page.goto('/');
  1369 |             await page.waitForLoadState('domcontentloaded');
  1370 |             const after = await rawScores(page);
  1371 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1372 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1373 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1374 |             const reachedTavern = await walkToTavern(page, row);
  1375 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1376 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1377 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1378 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1379 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1380 |           } catch (error) {
  1381 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1382 |           }
  1383 |         } else if (id !== 'e10-river') {
  1384 |           row.reload = fail('skipped: never banked');
  1385 |         }
  1386 | 
  1387 |         row.clean =
  1388 |           consoleErrors.length === 0 && pageErrors.length === 0
  1389 |             ? pass('0 console, 0 page')
  1390 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1391 |       } finally {
  1392 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1393 |         if (row.finalSnapshot) {
  1394 |           if (id !== 'e10-river') row.objective = row.finalSnapshot.objective;
  1395 |           if (!row.banks.ok) {
  1396 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1397 |             row.simAtEnd = row.finalSnapshot.sim;
  1398 |             row.hpAtEnd = row.finalSnapshot.hp;
  1399 |             row.goldAtEnd = row.finalSnapshot.gold;
  1400 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1401 |           }
  1402 |         }
  1403 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1404 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1405 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1406 |       }
  1407 | 
> 1408 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 18 / 556.9s sim, 806 kills, 67 gold
  1409 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1410 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1411 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1412 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1413 |     });
  1414 | }
  1415 | 
  1416 | type Score = { contractId?: string; secured?: boolean; completed?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1417 | 
  1418 | async function rawScores(page: Page): Promise<string | null> {
  1419 |   return page.evaluate(
  1420 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1421 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1422 |   );
  1423 | }
  1424 | 
  1425 | async function readScores(page: Page): Promise<Score[]> {
  1426 |   const raw = await rawScores(page);
  1427 |   try {
  1428 |     const parsed = JSON.parse(raw ?? '[]');
  1429 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1430 |   } catch {
  1431 |     return [];
  1432 |   }
  1433 | }
  1434 | 
  1435 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1436 |   for (let step = 0; step < 70; step += 1) {
  1437 |     const town = await page
  1438 |       .evaluate(() => {
  1439 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1440 |         if (!d) return null;
  1441 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1442 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1443 |       })
  1444 |       .catch(() => null);
  1445 |     if (!town) return false;
  1446 |     if (town.prompt === 'tavern') return true;
  1447 |     if (!town.approach) return false;
  1448 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1449 |   }
  1450 |   row.notes.push('could not reach the tavern in 70 steps');
  1451 |   return false;
  1452 | }
  1453 | 
  1454 | /** The no-wave River ending starts at the real lever, after a native wave-8 prelude. */
  1455 | async function riverEnding(page: Page, row: Row, root: string): Promise<void> {
  1456 |   const prelude = { secures: row.secures, banks: row.banks, finalSnapshot: row.finalSnapshot, builds: [...row.builds], samples: [...row.samples], upgrades: [...row.upgrades] };
  1457 |   row.notes.push('Last Claim prelude retained in objective.prelude; River fields below measure the lever-launched ending.');
  1458 |   const beforeScores = await readScores(page);
  1459 |   const beforeAts = new Set(beforeScores.map(s => s.at));
  1460 |   await page.screenshot({ path: path.join(root, `prelude-${row.project}.png`) });
  1461 |   await page.getByTestId('e10-river-lever').click({ timeout: 20_000 });
  1462 |   await page.waitForURL(url => url.searchParams.get('contract') === 'the-claim', { timeout: BOOT_TIMEOUT_MS });
  1463 |   // The application itself writes nowaves. We do not construct or modify this URL.
  1464 |   const launchUrl = page.url();
  1465 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: BOOT_TIMEOUT_MS });
  1466 |   const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  1467 |   const briefing = await page.getByTestId('contract-briefing-name').textContent();
  1468 |   row.boots = active?.activeId === 'the-claim' && active.fallbackReason === null && briefing?.trim() === 'The River'
  1469 |     ? pass(`earned finale lever launched The River, activeId=${active.activeId}; application URL=${launchUrl}`)
  1470 |     : fail(`lever launch mismatch: ${JSON.stringify(active)}, briefing=${briefing}`);
  1471 |   await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 });
  1472 |   await unpause(page, row);
  1473 |   row.samples = [];
  1474 |   row.builds = [];
  1475 |   row.upgrades = [];
  1476 |   row.peakWave = 0;
  1477 |   row.secureWave = 0;
  1478 |   const opened = await read(page);
  1479 |   const startGold = opened?.gold ?? 0;
  1480 |   const started = Date.now();
  1481 |   const panned = await fund(page, row, startGold + 5, started + 60_000, [{ x: 0 }], new Set());
  1482 |   // Observe beyond the ordinary first-wave interval; the ending must remain quiet.
  1483 |   while (Date.now() < started + 75_000) {
  1484 |     await takeUpgrades(page, row);
  1485 |     const state = await read(page);
  1486 |     if (!state || state.wave > 0 || state.enemiesAlive > 0 || state.sim >= 35) break;
  1487 |     await page.waitForTimeout(250);
  1488 |   }
  1489 |   const end = await read(page);
  1490 |   row.finalSnapshot = end ?? undefined;
  1491 |   row.peakWave = end?.wave ?? 0;
  1492 |   row.simAtEnd = end?.sim ?? 0;
  1493 |   row.runStateAtEnd = end?.runState ?? '';
  1494 |   row.hpAtEnd = end?.hp ?? 0;
  1495 |   row.goldAtEnd = end?.gold ?? 0;
  1496 |   row.killsAtEnd = end?.kills ?? 0;
  1497 |   const quiet = end && end.sim >= 35 && end.wave === 0 && end.enemiesAlive === 0 && row.samples.every(s => s.wave === 0 && s.alive === 0);
  1498 |   row.secures = panned && quiet
  1499 |     ? pass(`authored no-wave pan: gold ${startGold} -> ${end.gold}, wave 0, zero enemies through ${end.sim.toFixed(1)}s; no Claim Secured overlay`)
  1500 |     : fail(`River pan=${panned}, gold=${end?.gold}, wave=${end?.wave}, enemies=${end?.enemiesAlive}, sim=${end?.sim}`);
  1501 |   row.objective = { prelude, river: { launchUrl, briefing, startGold, panned, quiet, end } };
  1502 |   await page.screenshot({ path: path.join(root, `terminal-${row.project}.png`) });
  1503 |   const atPan = await readScores(page);
  1504 |   const bankButton = page.getByTestId('bank-secured-claim');
  1505 |   if (await bankButton.isVisible().catch(() => false)) await bankButton.click();
  1506 |   const completed = (await readScores(page)).find(s => s.contractId === 'e10-river' && !beforeAts.has(s.at) && (s.secured || s.completed));
  1507 |   row.banks = completed
  1508 |     ? pass(`new completed River score: ${JSON.stringify(completed)}`)
```