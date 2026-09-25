# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e1-twin-banks.spec.ts >> e1-twin-banks plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:508:5

# Error details

```
Error: secures: runState=dead at wave 19 / 582.9s sim, 888 kills, 1 gold

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
        - strong: 09:42
      - generic:
        - generic: Wave
        - strong: "19"
    - region "Gold pouch":
      - generic: Gold
      - strong: "1"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 09:37 - Gathered 24 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "28"
        - strong: 208 / 228 XP
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
          - definition [ref=e21]: 09:42
        - generic [ref=e22]:
          - term [ref=e23]: Claim Jumpers Turned Back
          - definition [ref=e24]: "888"
        - generic [ref=e25]:
          - term [ref=e26]: Waves Survived
          - definition [ref=e27]: "19"
        - generic [ref=e28]:
          - term [ref=e29]: Gold Panned
          - definition [ref=e30]: "525"
        - generic [ref=e31]:
          - term [ref=e32]: Gold Sluiced
          - definition [ref=e33]: "0"
        - generic [ref=e34]:
          - term [ref=e35]: Stolen / Reclaimed
          - definition [ref=e36]: 0 / 0
        - generic [ref=e37]:
          - term [ref=e38]: Spent
          - definition [ref=e39]: "524"
        - generic [ref=e40]:
          - term [ref=e41]: Beacons Built
          - definition [ref=e42]: "4"
        - generic [ref=e43]:
          - term [ref=e44]: Buildings Built / Lost / Repaired
          - definition [ref=e45]: 8 / 1 / 1
        - generic [ref=e46]:
          - term [ref=e47]: Spark / Blast Damage
          - definition [ref=e48]: 39579 / 0
        - generic [ref=e49]:
          - term [ref=e50]: Blast Toggles
          - definition [ref=e51]: "0"
        - generic [ref=e52]:
          - term [ref=e53]: Blast Charge Time
          - definition [ref=e54]: 00:00
        - generic [ref=e55]:
          - term [ref=e56]: Upgrades Taken
          - definition [ref=e57]: blast 7 · damage 3 · firerate 3 · mobility 3 · plating 3 · beacon 2 · range 2 · volley 2 · panning 1 · prospecting 1
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
  658 |           row.peakWave = Math.max(row.peakWave, atSecure.wave, atSecure.hudWave);
  659 |           row.simAtEnd = atSecure.sim;
  660 |           row.runStateAtEnd = atSecure.runState;
  661 |           row.hpAtEnd = atSecure.hp;
  662 |           row.goldAtEnd = atSecure.gold;
  663 |           row.killsAtEnd = atSecure.kills;
  664 |           row.objective = atSecure.objective;
  665 |         }
  666 |         row.finalSnapshot = atSecure ?? undefined;
  667 |         row.secures = sawOverlay
  668 |           ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
  669 |           : fail(
  670 |               died ||
  671 |                 `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
  672 |             );
  673 | 
  674 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  675 | 
  676 |         if (sawOverlay) {
  677 |           try {
  678 | 
  679 |             const before = initialScores;
  680 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  681 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  682 |             const scores = await readScores(page);
  683 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  684 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  685 |             row.banks = banked
  686 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} row(s) written by the click)`)
  687 |               : fail(
  688 |                   `the click wrote no new secured row for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  689 |                 );
  690 |           } catch (error) {
  691 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  692 |           }
  693 |         } else {
  694 |           row.banks = fail('skipped: never secured');
  695 |         }
  696 | 
  697 |         if (row.banks.ok) {
  698 |           try {
  699 |             for (let card = 0; card < 2; card += 1) {
  700 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  701 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  702 |                 await page.waitForTimeout(250);
  703 |               }
  704 |             }
  705 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  706 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  707 |             row.board = pass('the Book is on screen straight off the run ledger');
  708 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  709 |           } catch (error) {
  710 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  711 |           }
  712 |         } else {
  713 |           row.board = fail('skipped: never banked');
  714 |         }
  715 | 
  716 |         if (row.banks.ok) {
  717 |           try {
  718 |             const before = await rawScores(page);
  719 |             await page.goto('/');
  720 |             await page.waitForLoadState('domcontentloaded');
  721 |             const after = await rawScores(page);
  722 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  723 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  724 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  725 |             const reachedTavern = await walkToTavern(page, row);
  726 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  727 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  728 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  729 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  730 |           } catch (error) {
  731 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  732 |           }
  733 |         } else {
  734 |           row.reload = fail('skipped: never banked');
  735 |         }
  736 | 
  737 |         row.clean =
  738 |           consoleErrors.length === 0 && pageErrors.length === 0
  739 |             ? pass('0 console, 0 page')
  740 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  741 |       } finally {
  742 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  743 |         if (row.finalSnapshot) {
  744 |           row.objective = row.finalSnapshot.objective;
  745 |           if (!row.banks.ok) {
  746 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  747 |             row.simAtEnd = row.finalSnapshot.sim;
  748 |             row.hpAtEnd = row.finalSnapshot.hp;
  749 |             row.goldAtEnd = row.finalSnapshot.gold;
  750 |             row.runStateAtEnd = row.finalSnapshot.runState;
  751 |           }
  752 |         }
  753 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  754 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  755 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  756 |       }
  757 | 
> 758 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: runState=dead at wave 19 / 582.9s sim, 888 kills, 1 gold
  759 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  760 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  761 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  762 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  763 |     });
  764 | }
  765 | 
  766 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  767 | 
  768 | async function rawScores(page: Page): Promise<string | null> {
  769 |   return page.evaluate(
  770 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  771 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  772 |   );
  773 | }
  774 | 
  775 | async function readScores(page: Page): Promise<Score[]> {
  776 |   const raw = await rawScores(page);
  777 |   try {
  778 |     const parsed = JSON.parse(raw ?? '[]');
  779 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  780 |   } catch {
  781 |     return [];
  782 |   }
  783 | }
  784 | 
  785 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  786 |   for (let step = 0; step < 70; step += 1) {
  787 |     const town = await page
  788 |       .evaluate(() => {
  789 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  790 |         if (!d) return null;
  791 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  792 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  793 |       })
  794 |       .catch(() => null);
  795 |     if (!town) return false;
  796 |     if (town.prompt === 'tavern') return true;
  797 |     if (!town.approach) return false;
  798 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  799 |   }
  800 |   row.notes.push('could not reach the tavern in 70 steps');
  801 |   return false;
  802 | }
  803 | 
```