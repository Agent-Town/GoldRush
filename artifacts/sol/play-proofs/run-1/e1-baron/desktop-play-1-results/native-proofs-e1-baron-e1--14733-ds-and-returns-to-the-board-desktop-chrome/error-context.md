# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e1-baron.spec.ts >> e1-baron plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:506:5

# Error details

```
Error: secures: runState=dead at wave 16 / 421.7s sim, 589 kills, 26 gold

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
        - generic: Beacon coils hum eastward!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 07:01
      - generic:
        - generic: Wave
        - strong: "16"
    - region "Gold pouch":
      - generic: Gold
      - strong: "26"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 07:00 - Gathered 8 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "22"
        - strong: 172 / 180 XP
    - region "Build":
      - button "Build" [ref=e11]
    - button "Pause the claim" [ref=e12]: P - catch your breath
  - region "Run ledger" [ref=e13]:
    - generic [ref=e14]:
      - paragraph [ref=e15]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e16]
      - paragraph [ref=e17]: The claim was overrun. The gold remembers.
      - generic [ref=e18]:
        - generic [ref=e19]:
          - term [ref=e20]: Time Held
          - definition [ref=e21]: 07:01
        - generic [ref=e22]:
          - term [ref=e23]: Claim Jumpers Turned Back
          - definition [ref=e24]: "589"
        - generic [ref=e25]:
          - term [ref=e26]: Waves Survived
          - definition [ref=e27]: "16"
        - generic [ref=e28]:
          - term [ref=e29]: Gold Panned
          - definition [ref=e30]: "405"
        - generic [ref=e31]:
          - term [ref=e32]: Gold Sluiced
          - definition [ref=e33]: "0"
        - generic [ref=e34]:
          - term [ref=e35]: Stolen / Reclaimed
          - definition [ref=e36]: 0 / 0
        - generic [ref=e37]:
          - term [ref=e38]: Spent
          - definition [ref=e39]: "379"
        - generic [ref=e40]:
          - term [ref=e41]: Beacons Built
          - definition [ref=e42]: "4"
        - generic [ref=e43]:
          - term [ref=e44]: Buildings Built / Lost / Repaired
          - definition [ref=e45]: 7 / 1 / 1
        - generic [ref=e46]:
          - term [ref=e47]: Spark / Blast Damage
          - definition [ref=e48]: 22481 / 0
        - generic [ref=e49]:
          - term [ref=e50]: Blast Toggles
          - definition [ref=e51]: "0"
        - generic [ref=e52]:
          - term [ref=e53]: Blast Charge Time
          - definition [ref=e54]: 00:00
        - generic [ref=e55]:
          - term [ref=e56]: Upgrades Taken
          - definition [ref=e57]: blast 4 · damage 3 · firerate 3 · mobility 3 · plating 3 · range 2 · volley 2 · prospecting 1
      - paragraph [ref=e58]: "Epoch science complete: the Steamworks awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +993 toward the Steamworks"
      - paragraph [ref=e59]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e60]:
        - paragraph [ref=e61]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e62]
        - generic [ref=e63]:
          - 'button "1 Advances arsenal Chain Spark Primer Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate. EVERY RUN" [active] [ref=e64]':
            - generic [ref=e65]: "1"
            - generic [ref=e66]: Advances arsenal
            - strong [ref=e67]: Chain Spark Primer
            - generic [ref=e68]: "Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate."
            - generic [ref=e70]: EVERY RUN
          - 'button "2 Advances economy Assay Grading Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight. EVERY RUN" [ref=e71]':
            - generic [ref=e72]: "2"
            - generic [ref=e73]: Advances economy
            - strong [ref=e74]: Assay Grading
            - generic [ref=e75]: "Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight."
            - generic [ref=e77]: EVERY RUN
        - paragraph [ref=e78]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e79]:
        - heading "Best Claims" [level=2] [ref=e80]
        - list [ref=e81]:
          - listitem [ref=e82]:
            - generic [ref=e83]: wave 30 · baseless
            - strong [ref=e84]: SECURED
            - generic [ref=e85]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
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
      - generic [ref=e102]:
        - button "Keep this tape" [ref=e103]
        - button "Return to Town" [ref=e104]
        - button "Try Again" [ref=e105]
```

# Test source

```ts
  649 |           row.runStateAtEnd = atSecure.runState;
  650 |           row.hpAtEnd = atSecure.hp;
  651 |           row.goldAtEnd = atSecure.gold;
  652 |           row.killsAtEnd = atSecure.kills;
  653 |           row.objective = atSecure.objective;
  654 |         }
  655 |         row.finalSnapshot = atSecure ?? undefined;
  656 |         row.secures = sawOverlay
  657 |           ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
  658 |           : fail(
  659 |               died ||
  660 |                 `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
  661 |             );
  662 | 
  663 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  664 | 
  665 |         if (sawOverlay) {
  666 |           try {
  667 | 
  668 |             const before = initialScores;
  669 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  670 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  671 |             const scores = await readScores(page);
  672 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  673 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  674 |             row.banks = banked
  675 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} row(s) written by the click)`)
  676 |               : fail(
  677 |                   `the click wrote no new secured row for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  678 |                 );
  679 |           } catch (error) {
  680 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  681 |           }
  682 |         } else {
  683 |           row.banks = fail('skipped: never secured');
  684 |         }
  685 | 
  686 |         if (row.banks.ok) {
  687 |           try {
  688 |             for (let card = 0; card < 2; card += 1) {
  689 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  690 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  691 |                 await page.waitForTimeout(250);
  692 |               }
  693 |             }
  694 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  695 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  696 |             row.board = pass('the Book is on screen straight off the run ledger');
  697 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  698 |           } catch (error) {
  699 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  700 |           }
  701 |         } else {
  702 |           row.board = fail('skipped: never banked');
  703 |         }
  704 | 
  705 |         if (row.banks.ok) {
  706 |           try {
  707 |             const before = await rawScores(page);
  708 |             await page.goto('/');
  709 |             await page.waitForLoadState('domcontentloaded');
  710 |             const after = await rawScores(page);
  711 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  712 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  713 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  714 |             const reachedTavern = await walkToTavern(page, row);
  715 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  716 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  717 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  718 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  719 |           } catch (error) {
  720 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  721 |           }
  722 |         } else {
  723 |           row.reload = fail('skipped: never banked');
  724 |         }
  725 | 
  726 |         row.clean =
  727 |           consoleErrors.length === 0 && pageErrors.length === 0
  728 |             ? pass('0 console, 0 page')
  729 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  730 |       } finally {
  731 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  732 |         if (row.finalSnapshot) {
  733 |           row.objective = row.finalSnapshot.objective;
  734 |           if (!row.banks.ok) {
  735 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  736 |             row.simAtEnd = row.finalSnapshot.sim;
  737 |             row.hpAtEnd = row.finalSnapshot.hp;
  738 |             row.goldAtEnd = row.finalSnapshot.gold;
  739 |             row.runStateAtEnd = row.finalSnapshot.runState;
  740 |           }
  741 |         }
  742 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  743 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  744 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  745 |       }
  746 | 
  747 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
  748 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
> 749 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
      |                                                                ^ Error: secures: runState=dead at wave 16 / 421.7s sim, 589 kills, 26 gold
  750 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  751 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  752 |     });
  753 | }
  754 | 
  755 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  756 | 
  757 | async function rawScores(page: Page): Promise<string | null> {
  758 |   return page.evaluate(
  759 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  760 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  761 |   );
  762 | }
  763 | 
  764 | async function readScores(page: Page): Promise<Score[]> {
  765 |   const raw = await rawScores(page);
  766 |   try {
  767 |     const parsed = JSON.parse(raw ?? '[]');
  768 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  769 |   } catch {
  770 |     return [];
  771 |   }
  772 | }
  773 | 
  774 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  775 |   for (let step = 0; step < 70; step += 1) {
  776 |     const town = await page
  777 |       .evaluate(() => {
  778 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  779 |         if (!d) return null;
  780 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  781 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  782 |       })
  783 |       .catch(() => null);
  784 |     if (!town) return false;
  785 |     if (town.prompt === 'tavern') return true;
  786 |     if (!town.approach) return false;
  787 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  788 |   }
  789 |   row.notes.push('could not reach the tavern in 70 steps');
  790 |   return false;
  791 | }
  792 | 
```