# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e4-long-road.spec.ts >> e4-long-road plays to its authored terminal, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:1039:5

# Error details

```
Error: secures: runState=dead at wave 3 / 103.5s sim, 10 kills, 0 gold

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
        - strong: 01:43
      - generic:
        - generic: Wave
        - strong: "3"
    - region "Gold pouch":
      - strong: "0"
    - region "Active weapon":
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
          - strong: "2"
        - strong: 4 / 20 XP
    - region "Build":
      - button "Build" [ref=e10]
    - button "Pause the claim" [ref=e11]: catch your breathⅡ
    - generic: Swipe to scroll
  - generic:
    - button [ref=e14]: Rotate
    - button [ref=e15]: Weapon
    - button [ref=e16]: OK
  - region "Run ledger" [ref=e17]:
    - generic [ref=e18]:
      - paragraph [ref=e19]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e20]
      - paragraph [ref=e21]: The claim was overrun. The gold remembers.
      - generic [ref=e22]:
        - generic [ref=e23]:
          - term [ref=e24]: Time Held
          - definition [ref=e25]: 01:43
        - generic [ref=e26]:
          - term [ref=e27]: Claim Jumpers Turned Back
          - definition [ref=e28]: "10"
        - generic [ref=e29]:
          - term [ref=e30]: Waves Survived
          - definition [ref=e31]: "3"
        - generic [ref=e32]:
          - term [ref=e33]: Gold Panned
          - definition [ref=e34]: "0"
        - generic [ref=e35]:
          - term [ref=e36]: Gold Sluiced
          - definition [ref=e37]: "0"
        - generic [ref=e38]:
          - term [ref=e39]: Stolen / Reclaimed
          - definition [ref=e40]: 0 / 0
        - generic [ref=e41]:
          - term [ref=e42]: Spent
          - definition [ref=e43]: "0"
        - generic [ref=e44]:
          - term [ref=e45]: Beacons Built
          - definition [ref=e46]: "0"
        - generic [ref=e47]:
          - term [ref=e48]: Buildings Built / Lost / Repaired
          - definition [ref=e49]: 0 / 0 / 0
        - generic [ref=e50]:
          - term [ref=e51]: Spark / Blast Damage
          - definition [ref=e52]: 472 / 0
        - generic [ref=e53]:
          - term [ref=e54]: Blast Toggles
          - definition [ref=e55]: "0"
        - generic [ref=e56]:
          - term [ref=e57]: Blast Charge Time
          - definition [ref=e58]: 00:00
        - generic [ref=e59]:
          - term [ref=e60]: Upgrades Taken
          - definition [ref=e61]: firerate 1
      - paragraph [ref=e62]: "Epoch science complete: the Deepwater Claim awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +987 toward the Deepwater Claim"
      - paragraph [ref=e63]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e64]:
        - paragraph [ref=e65]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e66]
        - generic [ref=e67]:
          - 'button "1 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [active] [ref=e68]':
            - generic [ref=e69]: "1"
            - generic [ref=e70]: Advances crafting-agent
            - strong [ref=e71]: "Continued Study: Seam Yield"
            - generic [ref=e72]: "Effect: +1% seam panning yield."
            - generic [ref=e74]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Turret Damage Effect: +1% turret damage. EVERY RUN" [ref=e75]':
            - generic [ref=e76]: "2"
            - generic [ref=e77]: Advances crafting-agent
            - strong [ref=e78]: "Continued Study: Turret Damage"
            - generic [ref=e79]: "Effect: +1% turret damage."
            - generic [ref=e81]: EVERY RUN
        - paragraph [ref=e82]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e83]:
        - heading "Best Claims" [level=2] [ref=e84]
        - list [ref=e85]:
          - listitem [ref=e86]:
            - generic [ref=e87]: wave 30 · baseless
            - strong [ref=e88]: SECURED
            - generic [ref=e89]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e90]:
            - generic [ref=e91]: wave 30 · baseless
            - strong [ref=e92]: SECURED
            - generic [ref=e93]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e94]:
            - generic [ref=e95]: wave 30 · baseless
            - strong [ref=e96]: SECURED
            - generic [ref=e97]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e98]:
            - generic [ref=e99]: wave 30 · baseless
            - strong [ref=e100]: SECURED
            - generic [ref=e101]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e102]:
            - generic [ref=e103]: wave 30 · baseless
            - strong [ref=e104]: SECURED
            - generic [ref=e105]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
      - generic [ref=e106]:
        - button "Keep this tape" [ref=e107]
        - button "Return to Town" [ref=e108]
        - button "Try Again" [ref=e109]
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
       |                                                                ^ Error: secures: runState=dead at wave 3 / 103.5s sim, 10 kills, 0 gold
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