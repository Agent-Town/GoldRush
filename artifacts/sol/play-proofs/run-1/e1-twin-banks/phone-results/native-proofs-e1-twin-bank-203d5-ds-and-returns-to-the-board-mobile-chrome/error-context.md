# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e1-twin-banks.spec.ts >> e1-twin-banks plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:509:5

# Error details

```
Error: secures: runState=dead at wave 18 / 554.1s sim, 825 kills, 115 gold

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
        - strong: 09:14
      - generic:
        - generic: Wave
        - strong: "18"
    - region "Gold pouch":
      - strong: "115"
    - region "Build":
      - generic [ref=e4]:
        - generic [ref=e5]:
          - status [ref=e6]:
            - strong [ref=e7]: Sentry Beacon
            - generic [ref=e8]: Lights the dark and slows what it touches; radius 8wu.
          - menuitem "1 Sentry Beacon 4/6 - 75g" [ref=e9]:
            - generic [ref=e11]:
              - text: "1"
              - generic [ref=e12]: Sentry Beacon
              - text: 4/6 - 75g
          - 'menuitem "2 Palisade 0/48 - 0g Palisade kit: 8 free" [ref=e13]':
            - generic [ref=e15]:
              - text: "2"
              - generic [ref=e16]: Palisade
              - generic [ref=e17]:
                - text: 0/48 - 0g
                - text: "Palisade kit: 8 free"
          - menuitem "3 Sluice Works 0/3 - 40g" [ref=e18]:
            - generic [ref=e20]:
              - text: "3"
              - generic [ref=e21]: Sluice Works
              - text: 0/3 - 40g
          - menuitem "4 Stockpile Yard 0/2 - 60g" [ref=e22]:
            - generic [ref=e24]:
              - text: "4"
              - generic [ref=e25]: Stockpile Yard
              - text: 0/2 - 60g
          - menuitem "5 Signal Turret 3/4 - 125g" [disabled] [ref=e26]:
            - generic [ref=e28]:
              - text: "5"
              - generic [ref=e29]: Signal Turret
              - text: 3/4 - 125g
          - menuitem "6 Assay Office 0/1 - 80g" [ref=e30]:
            - generic [ref=e32]:
              - text: "6"
              - generic [ref=e33]: Assay Office
              - text: 0/1 - 80g
        - button "Build - Close" [expanded] [pressed] [ref=e34]
    - text: Ⅱ Swipe to scroll
  - generic:
    - button [ref=e37]: Rotate
    - button [ref=e38]: Weapon
    - button [ref=e39]: OK
  - region "Run ledger" [ref=e40]:
    - generic [ref=e41]:
      - paragraph [ref=e42]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e43]
      - paragraph [ref=e44]: The claim was overrun. The gold remembers.
      - generic [ref=e45]:
        - generic [ref=e46]:
          - term [ref=e47]: Time Held
          - definition [ref=e48]: 09:14
        - generic [ref=e49]:
          - term [ref=e50]: Claim Jumpers Turned Back
          - definition [ref=e51]: "825"
        - generic [ref=e52]:
          - term [ref=e53]: Waves Survived
          - definition [ref=e54]: "18"
        - generic [ref=e55]:
          - term [ref=e56]: Gold Panned
          - definition [ref=e57]: "500"
        - generic [ref=e58]:
          - term [ref=e59]: Gold Sluiced
          - definition [ref=e60]: "0"
        - generic [ref=e61]:
          - term [ref=e62]: Stolen / Reclaimed
          - definition [ref=e63]: 0 / 0
        - generic [ref=e64]:
          - term [ref=e65]: Spent
          - definition [ref=e66]: "385"
        - generic [ref=e67]:
          - term [ref=e68]: Beacons Built
          - definition [ref=e69]: "4"
        - generic [ref=e70]:
          - term [ref=e71]: Buildings Built / Lost / Repaired
          - definition [ref=e72]: 7 / 1 / 1
        - generic [ref=e73]:
          - term [ref=e74]: Spark / Blast Damage
          - definition [ref=e75]: 40194 / 0
        - generic [ref=e76]:
          - term [ref=e77]: Blast Toggles
          - definition [ref=e78]: "0"
        - generic [ref=e79]:
          - term [ref=e80]: Blast Charge Time
          - definition [ref=e81]: 00:00
        - generic [ref=e82]:
          - term [ref=e83]: Upgrades Taken
          - definition [ref=e84]: blast 6 · damage 3 · firerate 3 · mobility 3 · plating 3 · beacon 2 · range 2 · volley 2 · panning 1 · prospecting 1
      - paragraph [ref=e85]: "Epoch science complete: the Steamworks awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +993 toward the Steamworks"
      - paragraph [ref=e86]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e87]:
        - paragraph [ref=e88]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e89]
        - generic [ref=e90]:
          - 'button "1 Advances arsenal Chain Spark Primer Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate. EVERY RUN" [active] [ref=e91]':
            - generic [ref=e92]: "1"
            - generic [ref=e93]: Advances arsenal
            - strong [ref=e94]: Chain Spark Primer
            - generic [ref=e95]: "Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate."
            - generic [ref=e97]: EVERY RUN
          - 'button "2 Advances economy Assay Grading Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight. EVERY RUN" [ref=e98]':
            - generic [ref=e99]: "2"
            - generic [ref=e100]: Advances economy
            - strong [ref=e101]: Assay Grading
            - generic [ref=e102]: "Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight."
            - generic [ref=e104]: EVERY RUN
        - paragraph [ref=e105]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e106]:
        - heading "Best Claims" [level=2] [ref=e107]
        - list [ref=e108]:
          - listitem [ref=e109]:
            - generic [ref=e110]: wave 30 · baseless
            - strong [ref=e111]: SECURED
            - generic [ref=e112]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e113]:
            - generic [ref=e114]: wave 30 · baseless
            - strong [ref=e115]: SECURED
            - generic [ref=e116]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e117]:
            - generic [ref=e118]: wave 30 · baseless
            - strong [ref=e119]: SECURED
            - generic [ref=e120]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e121]:
            - generic [ref=e122]: wave 30 · baseless
            - strong [ref=e123]: SECURED
            - generic [ref=e124]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e125]:
            - generic [ref=e126]: wave 30 · baseless
            - strong [ref=e127]: SECURED
            - generic [ref=e128]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
      - generic [ref=e129]:
        - button "Keep this tape" [ref=e130]
        - button "Return to Town" [ref=e131]
        - button "Try Again" [ref=e132]
```

# Test source

```ts
  665 |           row.peakWave = Math.max(row.peakWave, atSecure.wave, atSecure.hudWave);
  666 |           row.simAtEnd = atSecure.sim;
  667 |           row.runStateAtEnd = atSecure.runState;
  668 |           row.hpAtEnd = atSecure.hp;
  669 |           row.goldAtEnd = atSecure.gold;
  670 |           row.killsAtEnd = atSecure.kills;
  671 |           row.objective = atSecure.objective;
  672 |         }
  673 |         row.finalSnapshot = atSecure ?? undefined;
  674 |         row.secures = sawOverlay
  675 |           ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
  676 |           : fail(
  677 |               died ||
  678 |                 `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
  679 |             );
  680 | 
  681 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  682 | 
  683 |         if (sawOverlay) {
  684 |           try {
  685 | 
  686 |             const before = initialScores;
  687 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  688 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  689 |             const scores = await readScores(page);
  690 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  691 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  692 |             row.banks = banked
  693 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} row(s) written by the click)`)
  694 |               : fail(
  695 |                   `the click wrote no new secured row for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  696 |                 );
  697 |           } catch (error) {
  698 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  699 |           }
  700 |         } else {
  701 |           row.banks = fail('skipped: never secured');
  702 |         }
  703 | 
  704 |         if (row.banks.ok) {
  705 |           try {
  706 |             for (let card = 0; card < 2; card += 1) {
  707 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  708 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  709 |                 await page.waitForTimeout(250);
  710 |               }
  711 |             }
  712 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  713 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  714 |             row.board = pass('the Book is on screen straight off the run ledger');
  715 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  716 |           } catch (error) {
  717 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  718 |           }
  719 |         } else {
  720 |           row.board = fail('skipped: never banked');
  721 |         }
  722 | 
  723 |         if (row.banks.ok) {
  724 |           try {
  725 |             const before = await rawScores(page);
  726 |             await page.goto('/');
  727 |             await page.waitForLoadState('domcontentloaded');
  728 |             const after = await rawScores(page);
  729 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  730 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  731 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  732 |             const reachedTavern = await walkToTavern(page, row);
  733 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  734 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  735 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  736 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  737 |           } catch (error) {
  738 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  739 |           }
  740 |         } else {
  741 |           row.reload = fail('skipped: never banked');
  742 |         }
  743 | 
  744 |         row.clean =
  745 |           consoleErrors.length === 0 && pageErrors.length === 0
  746 |             ? pass('0 console, 0 page')
  747 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  748 |       } finally {
  749 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  750 |         if (row.finalSnapshot) {
  751 |           row.objective = row.finalSnapshot.objective;
  752 |           if (!row.banks.ok) {
  753 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  754 |             row.simAtEnd = row.finalSnapshot.sim;
  755 |             row.hpAtEnd = row.finalSnapshot.hp;
  756 |             row.goldAtEnd = row.finalSnapshot.gold;
  757 |             row.runStateAtEnd = row.finalSnapshot.runState;
  758 |           }
  759 |         }
  760 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  761 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  762 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  763 |       }
  764 | 
> 765 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: runState=dead at wave 18 / 554.1s sim, 825 kills, 115 gold
  766 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  767 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  768 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  769 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  770 |     });
  771 | }
  772 | 
  773 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  774 | 
  775 | async function rawScores(page: Page): Promise<string | null> {
  776 |   return page.evaluate(
  777 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  778 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  779 |   );
  780 | }
  781 | 
  782 | async function readScores(page: Page): Promise<Score[]> {
  783 |   const raw = await rawScores(page);
  784 |   try {
  785 |     const parsed = JSON.parse(raw ?? '[]');
  786 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  787 |   } catch {
  788 |     return [];
  789 |   }
  790 | }
  791 | 
  792 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  793 |   for (let step = 0; step < 70; step += 1) {
  794 |     const town = await page
  795 |       .evaluate(() => {
  796 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  797 |         if (!d) return null;
  798 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  799 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  800 |       })
  801 |       .catch(() => null);
  802 |     if (!town) return false;
  803 |     if (town.prompt === 'tavern') return true;
  804 |     if (!town.approach) return false;
  805 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  806 |   }
  807 |   row.notes.push('could not reach the tavern in 70 steps');
  808 |   return false;
  809 | }
  810 | 
```