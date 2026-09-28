# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e2-pressure-garden.spec.ts >> e2-pressure-garden plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:524:5

# Error details

```
Error: secures: runState=dead at wave 11 / 345.6s sim, 370 kills, 85 gold; wave 11, overlay=false, but only 2/3 authored boiler beds operated hot

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
        - strong: 05:45
      - generic:
        - generic: Wave
        - strong: "11"
    - region "Gold pouch":
      - strong: "85"
    - region "Pressure gauge":
      - generic: Pressure
      - generic: ×2
      - strong: 62/100
    - region "Active weapon":
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 05:23 - Gathered 4 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "17"
        - strong: 72 / 140 XP
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
          - definition [ref=e26]: 05:45
        - generic [ref=e27]:
          - term [ref=e28]: Claim Jumpers Turned Back
          - definition [ref=e29]: "370"
        - generic [ref=e30]:
          - term [ref=e31]: Waves Survived
          - definition [ref=e32]: "11"
        - generic [ref=e33]:
          - term [ref=e34]: Gold Panned
          - definition [ref=e35]: "420"
        - generic [ref=e36]:
          - term [ref=e37]: Gold Sluiced
          - definition [ref=e38]: "0"
        - generic [ref=e39]:
          - term [ref=e40]: Stolen / Reclaimed
          - definition [ref=e41]: 0 / 0
        - generic [ref=e42]:
          - term [ref=e43]: Spent
          - definition [ref=e44]: "335"
        - generic [ref=e45]:
          - term [ref=e46]: Beacons Built
          - definition [ref=e47]: "0"
        - generic [ref=e48]:
          - term [ref=e49]: Buildings Built / Lost / Repaired
          - definition [ref=e50]: 5 / 5 / 1
        - generic [ref=e51]:
          - term [ref=e52]: Spark / Blast Damage
          - definition [ref=e53]: 15131 / 0
        - generic [ref=e54]:
          - term [ref=e55]: Blast Toggles
          - definition [ref=e56]: "0"
        - generic [ref=e57]:
          - term [ref=e58]: Blast Charge Time
          - definition [ref=e59]: 00:00
        - generic [ref=e60]:
          - term [ref=e61]: Upgrades Taken
          - definition [ref=e62]: damage 3 · firerate 3 · mobility 3 · plating 3 · volley 2 · blast 1 · range 1
      - paragraph [ref=e63]: "Epoch science complete: the Voltage Age awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +991 toward the Voltage Age"
      - paragraph [ref=e64]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e65]:
        - paragraph [ref=e66]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e67]
        - generic [ref=e68]:
          - 'button "1 Advances crafting-agent Pressure Assay Effect: Steamworks gauges show the 25–80 safe pressure band. EVERY RUN" [active] [ref=e69]':
            - generic [ref=e70]: "1"
            - generic [ref=e71]: Advances crafting-agent
            - strong [ref=e72]: Pressure Assay
            - generic [ref=e73]: "Effect: Steamworks gauges show the 25–80 safe pressure band."
            - generic [ref=e75]: EVERY RUN
          - 'button "2 Advances crafting-agent Boiler Lance Effect: Unlocks the Boiler Lance: 5 damage at 5 bursts/s across 7m. EVERY RUN" [ref=e76]':
            - generic [ref=e77]: "2"
            - generic [ref=e78]: Advances crafting-agent
            - strong [ref=e79]: Boiler Lance
            - generic [ref=e80]: "Effect: Unlocks the Boiler Lance: 5 damage at 5 bursts/s across 7m."
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
  716 |           row.goldAtEnd = atSecure.gold;
  717 |           row.killsAtEnd = atSecure.kills;
  718 |           row.objective = atSecure.objective;
  719 |         }
  720 |         row.finalSnapshot = atSecure ?? undefined;
  721 |         row.secures = sawOverlay
  722 |           ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
  723 |           : fail(
  724 |               died ||
  725 |                 `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
  726 |             );
  727 | 
  728 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  729 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  730 |         }
  731 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  732 | 
  733 |         if (sawOverlay) {
  734 |           try {
  735 | 
  736 |             const before = initialScores;
  737 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  738 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  739 |             const scores = await readScores(page);
  740 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  741 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  742 |             row.banks = banked
  743 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  744 |               : fail(
  745 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  746 |                 );
  747 |           } catch (error) {
  748 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  749 |           }
  750 |         } else {
  751 |           row.banks = fail('skipped: never secured');
  752 |         }
  753 | 
  754 |         if (row.banks.ok) {
  755 |           try {
  756 |             for (let card = 0; card < 2; card += 1) {
  757 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  758 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  759 |                 await page.waitForTimeout(250);
  760 |               }
  761 |             }
  762 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  763 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  764 |             row.board = pass('the Book is on screen straight off the run ledger');
  765 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  766 |           } catch (error) {
  767 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  768 |           }
  769 |         } else {
  770 |           row.board = fail('skipped: never banked');
  771 |         }
  772 | 
  773 |         if (row.banks.ok) {
  774 |           try {
  775 |             const before = await rawScores(page);
  776 |             await page.goto('/');
  777 |             await page.waitForLoadState('domcontentloaded');
  778 |             const after = await rawScores(page);
  779 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  780 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  781 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  782 |             const reachedTavern = await walkToTavern(page, row);
  783 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  784 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  785 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  786 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  787 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  788 |           } catch (error) {
  789 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  790 |           }
  791 |         } else {
  792 |           row.reload = fail('skipped: never banked');
  793 |         }
  794 | 
  795 |         row.clean =
  796 |           consoleErrors.length === 0 && pageErrors.length === 0
  797 |             ? pass('0 console, 0 page')
  798 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  799 |       } finally {
  800 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  801 |         if (row.finalSnapshot) {
  802 |           row.objective = row.finalSnapshot.objective;
  803 |           if (!row.banks.ok) {
  804 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  805 |             row.simAtEnd = row.finalSnapshot.sim;
  806 |             row.hpAtEnd = row.finalSnapshot.hp;
  807 |             row.goldAtEnd = row.finalSnapshot.gold;
  808 |             row.runStateAtEnd = row.finalSnapshot.runState;
  809 |           }
  810 |         }
  811 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  812 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  813 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  814 |       }
  815 | 
> 816 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: runState=dead at wave 11 / 345.6s sim, 370 kills, 85 gold; wave 11, overlay=false, but only 2/3 authored boiler beds operated hot
  817 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  818 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  819 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  820 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  821 |     });
  822 | }
  823 | 
  824 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  825 | 
  826 | async function rawScores(page: Page): Promise<string | null> {
  827 |   return page.evaluate(
  828 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  829 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  830 |   );
  831 | }
  832 | 
  833 | async function readScores(page: Page): Promise<Score[]> {
  834 |   const raw = await rawScores(page);
  835 |   try {
  836 |     const parsed = JSON.parse(raw ?? '[]');
  837 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  838 |   } catch {
  839 |     return [];
  840 |   }
  841 | }
  842 | 
  843 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  844 |   for (let step = 0; step < 70; step += 1) {
  845 |     const town = await page
  846 |       .evaluate(() => {
  847 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  848 |         if (!d) return null;
  849 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  850 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  851 |       })
  852 |       .catch(() => null);
  853 |     if (!town) return false;
  854 |     if (town.prompt === 'tavern') return true;
  855 |     if (!town.approach) return false;
  856 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  857 |   }
  858 |   row.notes.push('could not reach the tavern in 70 steps');
  859 |   return false;
  860 | }
  861 | 
```