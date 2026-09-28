# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e2-incline.spec.ts >> e2-incline plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:535:5

# Error details

```
Error: secures: runState=dead at wave 1 / 51.3s sim, 12 kills, 50 gold; Incline Haul not completed: {"enabled":false}

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
        - generic: North bank shadows want the gold!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 100
      - generic:
        - generic: Time
        - strong: 00:51
      - generic:
        - generic: Wave
        - strong: "1"
    - region "Gold pouch":
      - generic: Gold
      - strong: "50"
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
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "3"
        - strong: 0 / 28 XP
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
          - definition [ref=e20]: 00:51
        - generic [ref=e21]:
          - term [ref=e22]: Claim Jumpers Turned Back
          - definition [ref=e23]: "12"
        - generic [ref=e24]:
          - term [ref=e25]: Waves Survived
          - definition [ref=e26]: "1"
        - generic [ref=e27]:
          - term [ref=e28]: Gold Panned
          - definition [ref=e29]: "50"
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
          - definition [ref=e47]: 418 / 0
        - generic [ref=e48]:
          - term [ref=e49]: Blast Toggles
          - definition [ref=e50]: "0"
        - generic [ref=e51]:
          - term [ref=e52]: Blast Charge Time
          - definition [ref=e53]: 00:00
        - generic [ref=e54]:
          - term [ref=e55]: Upgrades Taken
          - definition [ref=e56]: firerate 1 · mobility 1
      - paragraph [ref=e57]: "Epoch science complete: the Voltage Age awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +991 toward the Voltage Age"
      - paragraph [ref=e58]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e59]:
        - paragraph [ref=e60]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e61]
        - generic [ref=e62]:
          - 'button "1 Advances crafting-agent Pressure Assay Effect: Steamworks gauges show the 25–80 safe pressure band. EVERY RUN" [active] [ref=e63]':
            - generic [ref=e64]: "1"
            - generic [ref=e65]: Advances crafting-agent
            - strong [ref=e66]: Pressure Assay
            - generic [ref=e67]: "Effect: Steamworks gauges show the 25–80 safe pressure band."
            - generic [ref=e69]: EVERY RUN
          - 'button "2 Advances crafting-agent Boiler Lance Effect: Unlocks the Boiler Lance: 5 damage at 5 bursts/s across 7m. EVERY RUN" [ref=e70]':
            - generic [ref=e71]: "2"
            - generic [ref=e72]: Advances crafting-agent
            - strong [ref=e73]: Boiler Lance
            - generic [ref=e74]: "Effect: Unlocks the Boiler Lance: 5 damage at 5 bursts/s across 7m."
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
  737 |         }
  738 |         row.finalSnapshot = atSecure ?? undefined;
  739 |         row.secures = sawOverlay
  740 |           ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
  741 |           : fail(
  742 |               died ||
  743 |                 `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
  744 |             );
  745 | 
  746 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  747 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  748 |         }
  749 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  750 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  751 |         }
  752 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  753 | 
  754 |         if (sawOverlay) {
  755 |           try {
  756 | 
  757 |             const before = initialScores;
  758 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  759 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  760 |             const scores = await readScores(page);
  761 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  762 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  763 |             row.banks = banked
  764 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  765 |               : fail(
  766 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  767 |                 );
  768 |           } catch (error) {
  769 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  770 |           }
  771 |         } else {
  772 |           row.banks = fail('skipped: never secured');
  773 |         }
  774 | 
  775 |         if (row.banks.ok) {
  776 |           try {
  777 |             for (let card = 0; card < 2; card += 1) {
  778 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  779 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  780 |                 await page.waitForTimeout(250);
  781 |               }
  782 |             }
  783 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  784 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  785 |             row.board = pass('the Book is on screen straight off the run ledger');
  786 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  787 |           } catch (error) {
  788 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  789 |           }
  790 |         } else {
  791 |           row.board = fail('skipped: never banked');
  792 |         }
  793 | 
  794 |         if (row.banks.ok) {
  795 |           try {
  796 |             const before = await rawScores(page);
  797 |             await page.goto('/');
  798 |             await page.waitForLoadState('domcontentloaded');
  799 |             const after = await rawScores(page);
  800 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  801 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  802 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  803 |             const reachedTavern = await walkToTavern(page, row);
  804 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  805 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  806 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  807 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  808 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  809 |           } catch (error) {
  810 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  811 |           }
  812 |         } else {
  813 |           row.reload = fail('skipped: never banked');
  814 |         }
  815 | 
  816 |         row.clean =
  817 |           consoleErrors.length === 0 && pageErrors.length === 0
  818 |             ? pass('0 console, 0 page')
  819 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  820 |       } finally {
  821 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  822 |         if (row.finalSnapshot) {
  823 |           row.objective = row.finalSnapshot.objective;
  824 |           if (!row.banks.ok) {
  825 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  826 |             row.simAtEnd = row.finalSnapshot.sim;
  827 |             row.hpAtEnd = row.finalSnapshot.hp;
  828 |             row.goldAtEnd = row.finalSnapshot.gold;
  829 |             row.runStateAtEnd = row.finalSnapshot.runState;
  830 |           }
  831 |         }
  832 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  833 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  834 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  835 |       }
  836 | 
> 837 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: runState=dead at wave 1 / 51.3s sim, 12 kills, 50 gold; Incline Haul not completed: {"enabled":false}
  838 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  839 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  840 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  841 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  842 |     });
  843 | }
  844 | 
  845 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  846 | 
  847 | async function rawScores(page: Page): Promise<string | null> {
  848 |   return page.evaluate(
  849 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  850 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  851 |   );
  852 | }
  853 | 
  854 | async function readScores(page: Page): Promise<Score[]> {
  855 |   const raw = await rawScores(page);
  856 |   try {
  857 |     const parsed = JSON.parse(raw ?? '[]');
  858 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  859 |   } catch {
  860 |     return [];
  861 |   }
  862 | }
  863 | 
  864 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  865 |   for (let step = 0; step < 70; step += 1) {
  866 |     const town = await page
  867 |       .evaluate(() => {
  868 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  869 |         if (!d) return null;
  870 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  871 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  872 |       })
  873 |       .catch(() => null);
  874 |     if (!town) return false;
  875 |     if (town.prompt === 'tavern') return true;
  876 |     if (!town.approach) return false;
  877 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  878 |   }
  879 |   row.notes.push('could not reach the tavern in 70 steps');
  880 |   return false;
  881 | }
  882 | 
```