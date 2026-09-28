# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e4-long-road.spec.ts >> e4-long-road plays to its authored terminal, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:1039:5

# Error details

```
Error: secures: runState=dead at wave 3 / 107.7s sim, 12 kills, 0 gold

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
        - generic: South bank dust is moving!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 100
      - generic:
        - generic: Time
        - strong: 01:47
      - generic:
        - generic: Wave
        - strong: "3"
    - region "Gold pouch":
      - generic: Gold
      - strong: "0"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "1"
        - strong: 8 / 12 XP
    - region "Build":
      - button "Build" [ref=e10]
    - button "Pause the claim" [ref=e11]: P - catch your breath
  - region "Run ledger" [ref=e12]:
    - generic [ref=e13]:
      - paragraph [ref=e14]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e15]
      - paragraph [ref=e16]: The claim was overrun. The gold remembers.
      - generic [ref=e17]:
        - generic [ref=e18]:
          - term [ref=e19]: Time Held
          - definition [ref=e20]: 01:47
        - generic [ref=e21]:
          - term [ref=e22]: Claim Jumpers Turned Back
          - definition [ref=e23]: "12"
        - generic [ref=e24]:
          - term [ref=e25]: Waves Survived
          - definition [ref=e26]: "3"
        - generic [ref=e27]:
          - term [ref=e28]: Gold Panned
          - definition [ref=e29]: "0"
        - generic [ref=e30]:
          - term [ref=e31]: Gold Sluiced
          - definition [ref=e32]: "0"
        - generic [ref=e33]:
          - term [ref=e34]: Stolen / Reclaimed
          - definition [ref=e35]: 0 / 0
        - generic [ref=e36]:
          - term [ref=e37]: Spent
          - definition [ref=e38]: "0"
        - generic [ref=e39]:
          - term [ref=e40]: Beacons Built
          - definition [ref=e41]: "0"
        - generic [ref=e42]:
          - term [ref=e43]: Buildings Built / Lost / Repaired
          - definition [ref=e44]: 0 / 0 / 0
        - generic [ref=e45]:
          - term [ref=e46]: Spark / Blast Damage
          - definition [ref=e47]: 521 / 0
        - generic [ref=e48]:
          - term [ref=e49]: Blast Toggles
          - definition [ref=e50]: "0"
        - generic [ref=e51]:
          - term [ref=e52]: Blast Charge Time
          - definition [ref=e53]: 00:00
        - generic [ref=e54]:
          - term [ref=e55]: Upgrades Taken
          - definition [ref=e56]: none
      - paragraph [ref=e57]: "Epoch science complete: the Deepwater Claim awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +987 toward the Deepwater Claim"
      - paragraph [ref=e58]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e59]:
        - paragraph [ref=e60]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e61]
        - generic [ref=e62]:
          - 'button "1 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [active] [ref=e63]':
            - generic [ref=e64]: "1"
            - generic [ref=e65]: Advances crafting-agent
            - strong [ref=e66]: "Continued Study: Seam Yield"
            - generic [ref=e67]: "Effect: +1% seam panning yield."
            - generic [ref=e69]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Turret Damage Effect: +1% turret damage. EVERY RUN" [ref=e70]':
            - generic [ref=e71]: "2"
            - generic [ref=e72]: Advances crafting-agent
            - strong [ref=e73]: "Continued Study: Turret Damage"
            - generic [ref=e74]: "Effect: +1% turret damage."
            - generic [ref=e76]: EVERY RUN
        - paragraph [ref=e77]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e78]:
        - heading "Best Claims" [level=2] [ref=e79]
        - list [ref=e80]:
          - listitem [ref=e81]:
            - generic [ref=e82]: wave 30 · baseless
            - strong [ref=e83]: SECURED
            - generic [ref=e84]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e85]:
            - generic [ref=e86]: wave 30 · baseless
            - strong [ref=e87]: SECURED
            - generic [ref=e88]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e89]:
            - generic [ref=e90]: wave 30 · baseless
            - strong [ref=e91]: SECURED
            - generic [ref=e92]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e93]:
            - generic [ref=e94]: wave 30 · baseless
            - strong [ref=e95]: SECURED
            - generic [ref=e96]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e97]:
            - generic [ref=e98]: wave 30 · baseless
            - strong [ref=e99]: SECURED
            - generic [ref=e100]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
      - generic [ref=e101]:
        - button "Keep this tape" [ref=e102]
        - button "Return to Town" [ref=e103]
        - button "Try Again" [ref=e104]
```

# Test source

```ts
  1456 |         }
  1457 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1458 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1459 |         }
  1460 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1461 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1462 |         }
  1463 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1464 | 
  1465 |         if (sawOverlay) {
  1466 |           try {
  1467 | 
  1468 |             const before = initialScores;
  1469 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1470 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1471 |             const scores = await readScores(page);
  1472 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1473 |             // This branch already observed Claim Secured. Authored boss endings can
  1474 |             // finish before secureWave; require a fresh secured score, not a later wave.
  1475 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true);
  1476 |             row.banks = banked
  1477 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1478 |               : fail(
  1479 |                   `no new secured row since pre-play for ${contract.id} after Claim Secured (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1480 |                 );
  1481 |           } catch (error) {
  1482 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1483 |           }
  1484 |         } else {
  1485 |           row.banks = fail('skipped: never secured');
  1486 |         }
  1487 | 
  1488 |         if (id === 'e10-river' && sawOverlay) {
  1489 |           await riverEnding(page, row, ARTIFACT_ROOT);
  1490 |         } else if (row.banks.ok) {
  1491 |           try {
  1492 |             if (contract.id === 'e10-last-claim') {
  1493 |               await page.getByTestId('e10-return-town').click({ timeout: 20_000 });
  1494 |             }
  1495 |             for (let card = 0; card < 2; card += 1) {
  1496 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1497 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1498 |                 await page.waitForTimeout(250);
  1499 |               }
  1500 |             }
  1501 |             if (contract.id !== 'e10-last-claim') await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1502 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1503 |             row.board = pass(contract.id === 'e10-last-claim' ? 'the Book is on screen after the finale Return to the Ark button' : 'the Book is on screen straight off the run ledger');
  1504 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1505 |           } catch (error) {
  1506 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1507 |           }
  1508 |         } else {
  1509 |           row.board = fail('skipped: never banked');
  1510 |         }
  1511 | 
  1512 |         if (id !== 'e10-river' && row.banks.ok) {
  1513 |           try {
  1514 |             const before = await rawScores(page);
  1515 |             await page.goto('/');
  1516 |             await page.waitForLoadState('domcontentloaded');
  1517 |             const after = await rawScores(page);
  1518 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1519 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1520 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1521 |             const reachedTavern = await walkToTavern(page, row);
  1522 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1523 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1524 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1525 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1526 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1527 |           } catch (error) {
  1528 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1529 |           }
  1530 |         } else if (id !== 'e10-river') {
  1531 |           row.reload = fail('skipped: never banked');
  1532 |         }
  1533 | 
  1534 |         row.clean =
  1535 |           consoleErrors.length === 0 && pageErrors.length === 0
  1536 |             ? pass('0 console, 0 page')
  1537 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1538 |       } finally {
  1539 |         // Preserve the terminal captured before Return to Town, even if banking fails.
  1540 |         if (!row.finalSnapshot) row.finalSnapshot = (await read(page)) ?? undefined;
  1541 |         if (row.finalSnapshot) {
  1542 |           if (id !== 'e10-river') row.objective = row.finalSnapshot.objective;
  1543 |           if (!row.banks.ok) {
  1544 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1545 |             row.simAtEnd = row.finalSnapshot.sim;
  1546 |             row.hpAtEnd = row.finalSnapshot.hp;
  1547 |             row.goldAtEnd = row.finalSnapshot.gold;
  1548 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1549 |           }
  1550 |         }
  1551 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1552 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1553 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1554 |       }
  1555 | 
> 1556 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 3 / 107.7s sim, 12 kills, 0 gold
  1557 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1558 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1559 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1560 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1561 |     });
  1562 | }
  1563 | 
  1564 | type Score = { contractId?: string; secured?: boolean; completed?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1565 | 
  1566 | async function rawScores(page: Page): Promise<string | null> {
  1567 |   return page.evaluate(
  1568 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1569 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1570 |   );
  1571 | }
  1572 | 
  1573 | async function readScores(page: Page): Promise<Score[]> {
  1574 |   const raw = await rawScores(page);
  1575 |   try {
  1576 |     const parsed = JSON.parse(raw ?? '[]');
  1577 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1578 |   } catch {
  1579 |     return [];
  1580 |   }
  1581 | }
  1582 | 
  1583 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1584 |   for (let step = 0; step < 70; step += 1) {
  1585 |     const town = await page
  1586 |       .evaluate(() => {
  1587 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1588 |         if (!d) return null;
  1589 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1590 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1591 |       })
  1592 |       .catch(() => null);
  1593 |     if (!town) return false;
  1594 |     if (town.prompt === 'tavern') return true;
  1595 |     if (!town.approach) return false;
  1596 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1597 |   }
  1598 |   row.notes.push('could not reach the tavern in 70 steps');
  1599 |   return false;
  1600 | }
  1601 | 
  1602 | /** The no-wave River ending starts at the real lever, after a native wave-8 prelude. */
  1603 | async function riverEnding(page: Page, row: Row, root: string): Promise<void> {
  1604 |   const prelude = { secures: row.secures, banks: row.banks, finalSnapshot: row.finalSnapshot, builds: [...row.builds], samples: [...row.samples], upgrades: [...row.upgrades] };
  1605 |   row.notes.push('Last Claim prelude retained in objective.prelude; River fields below measure the lever-launched ending.');
  1606 |   const beforeScores = await readScores(page);
  1607 |   const beforeAts = new Set(beforeScores.map(s => s.at));
  1608 |   await page.screenshot({ path: path.join(root, `prelude-${row.project}.png`) });
  1609 |   await page.getByTestId('e10-river-lever').click({ timeout: 20_000 });
  1610 |   await page.waitForURL(url => url.searchParams.get('contract') === 'the-claim', { timeout: BOOT_TIMEOUT_MS });
  1611 |   // The application itself writes nowaves. We do not construct or modify this URL.
  1612 |   const launchUrl = page.url();
  1613 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: BOOT_TIMEOUT_MS });
  1614 |   const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  1615 |   const briefing = await page.getByTestId('contract-briefing-name').textContent();
  1616 |   row.boots = active?.activeId === 'the-claim' && active.fallbackReason === null && briefing?.trim() === 'The River'
  1617 |     ? pass(`earned finale lever launched The River, activeId=${active.activeId}; application URL=${launchUrl}`)
  1618 |     : fail(`lever launch mismatch: ${JSON.stringify(active)}, briefing=${briefing}`);
  1619 |   await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 });
  1620 |   await unpause(page, row);
  1621 |   row.samples = [];
  1622 |   row.builds = [];
  1623 |   row.upgrades = [];
  1624 |   row.peakWave = 0;
  1625 |   row.secureWave = 0;
  1626 |   const opened = await read(page);
  1627 |   const startGold = opened?.gold ?? 0;
  1628 |   const started = Date.now();
  1629 |   const panned = await fund(page, row, startGold + 5, started + 60_000, [{ x: 0 }], new Set());
  1630 |   // Observe beyond the ordinary first-wave interval; the ending must remain quiet.
  1631 |   while (Date.now() < started + 75_000) {
  1632 |     await takeUpgrades(page, row);
  1633 |     const state = await read(page);
  1634 |     if (!state || state.wave > 0 || state.enemiesAlive > 0 || state.sim >= 35) break;
  1635 |     await page.waitForTimeout(250);
  1636 |   }
  1637 |   const end = await read(page);
  1638 |   row.finalSnapshot = end ?? undefined;
  1639 |   row.peakWave = end?.wave ?? 0;
  1640 |   row.simAtEnd = end?.sim ?? 0;
  1641 |   row.runStateAtEnd = end?.runState ?? '';
  1642 |   row.hpAtEnd = end?.hp ?? 0;
  1643 |   row.goldAtEnd = end?.gold ?? 0;
  1644 |   row.killsAtEnd = end?.kills ?? 0;
  1645 |   const quiet = end && end.sim >= 35 && end.wave === 0 && end.enemiesAlive === 0 && row.samples.every(s => s.wave === 0 && s.alive === 0);
  1646 |   row.secures = panned && quiet
  1647 |     ? pass(`authored no-wave pan: gold ${startGold} -> ${end.gold}, wave 0, zero enemies through ${end.sim.toFixed(1)}s; no Claim Secured overlay`)
  1648 |     : fail(`River pan=${panned}, gold=${end?.gold}, wave=${end?.wave}, enemies=${end?.enemiesAlive}, sim=${end?.sim}`);
  1649 |   row.objective = { prelude, river: { launchUrl, briefing, startGold, panned, quiet, end } };
  1650 |   await page.screenshot({ path: path.join(root, `terminal-${row.project}.png`) });
  1651 |   const atPan = await readScores(page);
  1652 |   const bankButton = page.getByTestId('bank-secured-claim');
  1653 |   if (await bankButton.isVisible().catch(() => false)) await bankButton.click();
  1654 |   const completed = (await readScores(page)).find(s => s.contractId === 'e10-river' && !beforeAts.has(s.at) && (s.secured || s.completed));
  1655 |   row.banks = completed
  1656 |     ? pass(`new completed River score: ${JSON.stringify(completed)}`)
```