# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e2-pressure-garden.spec.ts >> e2-pressure-garden plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:520:5

# Error details

```
Error: secures: wave 3, overlay=false, but only 0/3 authored boiler beds operated hot

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
        - generic: East ridge dust is moving!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 100
      - generic:
        - generic: Time
        - strong: 01:39
      - generic:
        - generic: Wave
        - strong: "3"
    - region "Gold pouch":
      - generic: Gold
      - strong: "120"
    - region "Pressure gauge":
      - generic: Pressure
      - generic: ×2
      - strong: 0/100
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 01:14 - Gathered 8 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "4"
        - strong: 12 / 36 XP
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
          - definition [ref=e21]: 01:39
        - generic [ref=e22]:
          - term [ref=e23]: Claim Jumpers Turned Back
          - definition [ref=e24]: "36"
        - generic [ref=e25]:
          - term [ref=e26]: Waves Survived
          - definition [ref=e27]: "3"
        - generic [ref=e28]:
          - term [ref=e29]: Gold Panned
          - definition [ref=e30]: "120"
        - generic [ref=e31]:
          - term [ref=e32]: Gold Sluiced
          - definition [ref=e33]: "0"
        - generic [ref=e34]:
          - term [ref=e35]: Stolen / Reclaimed
          - definition [ref=e36]: 0 / 0
        - generic [ref=e37]:
          - term [ref=e38]: Spent
          - definition [ref=e39]: "0"
        - generic [ref=e40]:
          - term [ref=e41]: Beacons Built
          - definition [ref=e42]: "0"
        - generic [ref=e43]:
          - term [ref=e44]: Buildings Built / Lost / Repaired
          - definition [ref=e45]: 0 / 0 / 0
        - generic [ref=e46]:
          - term [ref=e47]: Spark / Blast Damage
          - definition [ref=e48]: 1282 / 0
        - generic [ref=e49]:
          - term [ref=e50]: Blast Toggles
          - definition [ref=e51]: "0"
        - generic [ref=e52]:
          - term [ref=e53]: Blast Charge Time
          - definition [ref=e54]: 00:00
        - generic [ref=e55]:
          - term [ref=e56]: Upgrades Taken
          - definition [ref=e57]: firerate 2 · mobility 1
      - paragraph [ref=e58]: "Epoch science complete: the Voltage Age awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +991 toward the Voltage Age"
      - paragraph [ref=e59]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e60]:
        - paragraph [ref=e61]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e62]
        - generic [ref=e63]:
          - 'button "1 Advances crafting-agent Pressure Assay Effect: Steamworks gauges show the 25–80 safe pressure band. EVERY RUN" [active] [ref=e64]':
            - generic [ref=e65]: "1"
            - generic [ref=e66]: Advances crafting-agent
            - strong [ref=e67]: Pressure Assay
            - generic [ref=e68]: "Effect: Steamworks gauges show the 25–80 safe pressure band."
            - generic [ref=e70]: EVERY RUN
          - 'button "2 Advances crafting-agent Boiler Lance Effect: Unlocks the Boiler Lance: 5 damage at 5 bursts/s across 7m. EVERY RUN" [ref=e71]':
            - generic [ref=e72]: "2"
            - generic [ref=e73]: Advances crafting-agent
            - strong [ref=e74]: Boiler Lance
            - generic [ref=e75]: "Effect: Unlocks the Boiler Lance: 5 damage at 5 bursts/s across 7m."
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
  706 |           row.hpAtEnd = atSecure.hp;
  707 |           row.goldAtEnd = atSecure.gold;
  708 |           row.killsAtEnd = atSecure.kills;
  709 |           row.objective = atSecure.objective;
  710 |         }
  711 |         row.finalSnapshot = atSecure ?? undefined;
  712 |         row.secures = sawOverlay
  713 |           ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
  714 |           : fail(
  715 |               died ||
  716 |                 `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
  717 |             );
  718 | 
  719 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  720 |           row.secures = fail(`wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  721 |         }
  722 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  723 | 
  724 |         if (sawOverlay) {
  725 |           try {
  726 | 
  727 |             const before = initialScores;
  728 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  729 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  730 |             const scores = await readScores(page);
  731 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  732 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  733 |             row.banks = banked
  734 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} row(s) written by the click)`)
  735 |               : fail(
  736 |                   `the click wrote no new secured row for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  737 |                 );
  738 |           } catch (error) {
  739 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  740 |           }
  741 |         } else {
  742 |           row.banks = fail('skipped: never secured');
  743 |         }
  744 | 
  745 |         if (row.banks.ok) {
  746 |           try {
  747 |             for (let card = 0; card < 2; card += 1) {
  748 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  749 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  750 |                 await page.waitForTimeout(250);
  751 |               }
  752 |             }
  753 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  754 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  755 |             row.board = pass('the Book is on screen straight off the run ledger');
  756 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  757 |           } catch (error) {
  758 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  759 |           }
  760 |         } else {
  761 |           row.board = fail('skipped: never banked');
  762 |         }
  763 | 
  764 |         if (row.banks.ok) {
  765 |           try {
  766 |             const before = await rawScores(page);
  767 |             await page.goto('/');
  768 |             await page.waitForLoadState('domcontentloaded');
  769 |             const after = await rawScores(page);
  770 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  771 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  772 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  773 |             const reachedTavern = await walkToTavern(page, row);
  774 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  775 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  776 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  777 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  778 |           } catch (error) {
  779 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  780 |           }
  781 |         } else {
  782 |           row.reload = fail('skipped: never banked');
  783 |         }
  784 | 
  785 |         row.clean =
  786 |           consoleErrors.length === 0 && pageErrors.length === 0
  787 |             ? pass('0 console, 0 page')
  788 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  789 |       } finally {
  790 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  791 |         if (row.finalSnapshot) {
  792 |           row.objective = row.finalSnapshot.objective;
  793 |           if (!row.banks.ok) {
  794 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  795 |             row.simAtEnd = row.finalSnapshot.sim;
  796 |             row.hpAtEnd = row.finalSnapshot.hp;
  797 |             row.goldAtEnd = row.finalSnapshot.gold;
  798 |             row.runStateAtEnd = row.finalSnapshot.runState;
  799 |           }
  800 |         }
  801 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  802 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  803 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  804 |       }
  805 | 
> 806 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: wave 3, overlay=false, but only 0/3 authored boiler beds operated hot
  807 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  808 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  809 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  810 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  811 |     });
  812 | }
  813 | 
  814 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  815 | 
  816 | async function rawScores(page: Page): Promise<string | null> {
  817 |   return page.evaluate(
  818 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  819 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  820 |   );
  821 | }
  822 | 
  823 | async function readScores(page: Page): Promise<Score[]> {
  824 |   const raw = await rawScores(page);
  825 |   try {
  826 |     const parsed = JSON.parse(raw ?? '[]');
  827 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  828 |   } catch {
  829 |     return [];
  830 |   }
  831 | }
  832 | 
  833 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  834 |   for (let step = 0; step < 70; step += 1) {
  835 |     const town = await page
  836 |       .evaluate(() => {
  837 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  838 |         if (!d) return null;
  839 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  840 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  841 |       })
  842 |       .catch(() => null);
  843 |     if (!town) return false;
  844 |     if (town.prompt === 'tavern') return true;
  845 |     if (!town.approach) return false;
  846 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  847 |   }
  848 |   row.notes.push('could not reach the tavern in 70 steps');
  849 |   return false;
  850 | }
  851 | 
```