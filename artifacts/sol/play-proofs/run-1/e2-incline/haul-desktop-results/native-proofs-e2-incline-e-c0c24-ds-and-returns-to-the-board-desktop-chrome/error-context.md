# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e2-incline.spec.ts >> e2-incline plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:536:5

# Error details

```
Error: secures: runState=dead at wave 11 / 472.5s sim, 460 kills, 0 gold

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
        - strong: 07:52
      - generic:
        - generic: Wave
        - strong: "11"
    - region "Gold pouch":
      - generic: Gold
      - strong: "0"
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
        - generic [ref=e9]: 07:46 - Gathered 40 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "20"
        - strong: 12 / 164 XP
    - region "Build":
      - generic [ref=e10]:
        - generic [ref=e11]:
          - status [ref=e12]:
            - strong [ref=e13]: Sluice Works
            - generic [ref=e14]: "Works the river for you: 3g per cycle beside water. T1: 3g every 5s"
          - menuitem "1 Sentry Beacon 4/6 - 75g" [disabled] [ref=e15]:
            - generic [ref=e17]:
              - text: "1"
              - generic [ref=e18]: Sentry Beacon
              - text: 4/6 - 75g
          - 'menuitem "2 Palisade 0/48 - 0g Palisade kit: 8 free" [ref=e19]':
            - generic [ref=e21]:
              - text: "2"
              - generic [ref=e22]: Palisade
              - generic [ref=e23]:
                - text: 0/48 - 0g
                - text: "Palisade kit: 8 free"
          - menuitem "3 Sluice Works 0/3 - 40g" [disabled] [ref=e24]:
            - generic [ref=e26]:
              - text: "3"
              - generic [ref=e27]: Sluice Works
              - text: 0/3 - 40g
          - menuitem "4 Stockpile Yard 0/2 - 60g" [disabled] [ref=e28]:
            - generic [ref=e30]:
              - text: "4"
              - generic [ref=e31]: Stockpile Yard
              - text: 0/2 - 60g
          - menuitem "5 Boiler House 0/3 - 70g" [disabled] [ref=e32]:
            - generic [ref=e34]:
              - text: "5"
              - generic [ref=e35]: Boiler House
              - text: 0/3 - 70g
          - menuitem "6 Signal Turret 4/4 - 170g" [disabled] [ref=e36]:
            - generic [ref=e38]:
              - text: "6"
              - generic [ref=e39]: Signal Turret
              - text: 4/4 - 170g
          - menuitem "7 Assay Office 0/1 - 80g" [disabled] [ref=e40]:
            - generic [ref=e42]:
              - text: "7"
              - generic [ref=e43]: Assay Office
              - text: 0/1 - 80g
        - button "Build - Close" [expanded] [pressed] [ref=e44]
    - button "Pause the claim" [ref=e45]: P - catch your breath
  - region "Run ledger" [ref=e46]:
    - generic [ref=e47]:
      - paragraph [ref=e48]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e49]
      - paragraph [ref=e50]: The claim was overrun. The gold remembers.
      - generic [ref=e51]:
        - generic [ref=e52]:
          - term [ref=e53]: Time Held
          - definition [ref=e54]: 07:52
        - generic [ref=e55]:
          - term [ref=e56]: Claim Jumpers Turned Back
          - definition [ref=e57]: "460"
        - generic [ref=e58]:
          - term [ref=e59]: Waves Survived
          - definition [ref=e60]: "11"
        - generic [ref=e61]:
          - term [ref=e62]: Gold Panned
          - definition [ref=e63]: "450"
        - generic [ref=e64]:
          - term [ref=e65]: Gold Sluiced
          - definition [ref=e66]: "0"
        - generic [ref=e67]:
          - term [ref=e68]: Stolen / Reclaimed
          - definition [ref=e69]: 0 / 0
        - generic [ref=e70]:
          - term [ref=e71]: Spent
          - definition [ref=e72]: "500"
        - generic [ref=e73]:
          - term [ref=e74]: Beacons Built
          - definition [ref=e75]: "4"
        - generic [ref=e76]:
          - term [ref=e77]: Buildings Built / Lost / Repaired
          - definition [ref=e78]: 8 / 8 / 0
        - generic [ref=e79]:
          - term [ref=e80]: Spark / Blast Damage
          - definition [ref=e81]: 16082 / 0
        - generic [ref=e82]:
          - term [ref=e83]: Blast Toggles
          - definition [ref=e84]: "0"
        - generic [ref=e85]:
          - term [ref=e86]: Blast Charge Time
          - definition [ref=e87]: 00:00
        - generic [ref=e88]:
          - term [ref=e89]: Upgrades Taken
          - definition [ref=e90]: damage 3 · firerate 3 · mobility 3 · plating 3 · blast 2 · range 2 · volley 2 · beacon 1
      - paragraph [ref=e91]: "Epoch science complete: the Voltage Age awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +991 toward the Voltage Age"
      - paragraph [ref=e92]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e93]:
        - paragraph [ref=e94]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e95]
        - generic [ref=e96]:
          - 'button "1 Advances crafting-agent Pressure Assay Effect: Steamworks gauges show the 25–80 safe pressure band. EVERY RUN" [active] [ref=e97]':
            - generic [ref=e98]: "1"
            - generic [ref=e99]: Advances crafting-agent
            - strong [ref=e100]: Pressure Assay
            - generic [ref=e101]: "Effect: Steamworks gauges show the 25–80 safe pressure band."
            - generic [ref=e103]: EVERY RUN
          - 'button "2 Advances crafting-agent Boiler Lance Effect: Unlocks the Boiler Lance: 5 damage at 5 bursts/s across 7m. EVERY RUN" [ref=e104]':
            - generic [ref=e105]: "2"
            - generic [ref=e106]: Advances crafting-agent
            - strong [ref=e107]: Boiler Lance
            - generic [ref=e108]: "Effect: Unlocks the Boiler Lance: 5 damage at 5 bursts/s across 7m."
            - generic [ref=e110]: EVERY RUN
        - paragraph [ref=e111]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e112]:
        - heading "Best Claims" [level=2] [ref=e113]
        - list [ref=e114]:
          - listitem [ref=e115]:
            - generic [ref=e116]: wave 30 · baseless
            - strong [ref=e117]: SECURED
            - generic [ref=e118]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e119]:
            - generic [ref=e120]: wave 30 · baseless
            - strong [ref=e121]: SECURED
            - generic [ref=e122]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e123]:
            - generic [ref=e124]: wave 30 · baseless
            - strong [ref=e125]: SECURED
            - generic [ref=e126]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e127]:
            - generic [ref=e128]: wave 30 · baseless
            - strong [ref=e129]: SECURED
            - generic [ref=e130]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e131]:
            - generic [ref=e132]: wave 30 · baseless
            - strong [ref=e133]: SECURED
            - generic [ref=e134]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
      - generic [ref=e135]:
        - button "Keep this tape" [ref=e136]
        - button "Return to Town" [ref=e137]
        - button "Try Again" [ref=e138]
```

# Test source

```ts
  751 |         }
  752 |         row.finalSnapshot = atSecure ?? undefined;
  753 |         row.secures = sawOverlay
  754 |           ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
  755 |           : fail(
  756 |               died ||
  757 |                 `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
  758 |             );
  759 | 
  760 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  761 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  762 |         }
  763 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  764 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  765 |         }
  766 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  767 | 
  768 |         if (sawOverlay) {
  769 |           try {
  770 | 
  771 |             const before = initialScores;
  772 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  773 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  774 |             const scores = await readScores(page);
  775 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  776 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  777 |             row.banks = banked
  778 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  779 |               : fail(
  780 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  781 |                 );
  782 |           } catch (error) {
  783 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  784 |           }
  785 |         } else {
  786 |           row.banks = fail('skipped: never secured');
  787 |         }
  788 | 
  789 |         if (row.banks.ok) {
  790 |           try {
  791 |             for (let card = 0; card < 2; card += 1) {
  792 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  793 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  794 |                 await page.waitForTimeout(250);
  795 |               }
  796 |             }
  797 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  798 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  799 |             row.board = pass('the Book is on screen straight off the run ledger');
  800 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  801 |           } catch (error) {
  802 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  803 |           }
  804 |         } else {
  805 |           row.board = fail('skipped: never banked');
  806 |         }
  807 | 
  808 |         if (row.banks.ok) {
  809 |           try {
  810 |             const before = await rawScores(page);
  811 |             await page.goto('/');
  812 |             await page.waitForLoadState('domcontentloaded');
  813 |             const after = await rawScores(page);
  814 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  815 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  816 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  817 |             const reachedTavern = await walkToTavern(page, row);
  818 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  819 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  820 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  821 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  822 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  823 |           } catch (error) {
  824 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  825 |           }
  826 |         } else {
  827 |           row.reload = fail('skipped: never banked');
  828 |         }
  829 | 
  830 |         row.clean =
  831 |           consoleErrors.length === 0 && pageErrors.length === 0
  832 |             ? pass('0 console, 0 page')
  833 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  834 |       } finally {
  835 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  836 |         if (row.finalSnapshot) {
  837 |           row.objective = row.finalSnapshot.objective;
  838 |           if (!row.banks.ok) {
  839 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  840 |             row.simAtEnd = row.finalSnapshot.sim;
  841 |             row.hpAtEnd = row.finalSnapshot.hp;
  842 |             row.goldAtEnd = row.finalSnapshot.gold;
  843 |             row.runStateAtEnd = row.finalSnapshot.runState;
  844 |           }
  845 |         }
  846 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  847 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  848 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  849 |       }
  850 | 
> 851 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: runState=dead at wave 11 / 472.5s sim, 460 kills, 0 gold
  852 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  853 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  854 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  855 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  856 |     });
  857 | }
  858 | 
  859 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  860 | 
  861 | async function rawScores(page: Page): Promise<string | null> {
  862 |   return page.evaluate(
  863 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  864 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  865 |   );
  866 | }
  867 | 
  868 | async function readScores(page: Page): Promise<Score[]> {
  869 |   const raw = await rawScores(page);
  870 |   try {
  871 |     const parsed = JSON.parse(raw ?? '[]');
  872 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  873 |   } catch {
  874 |     return [];
  875 |   }
  876 | }
  877 | 
  878 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  879 |   for (let step = 0; step < 70; step += 1) {
  880 |     const town = await page
  881 |       .evaluate(() => {
  882 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  883 |         if (!d) return null;
  884 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  885 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  886 |       })
  887 |       .catch(() => null);
  888 |     if (!town) return false;
  889 |     if (town.prompt === 'tavern') return true;
  890 |     if (!town.approach) return false;
  891 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  892 |   }
  893 |   row.notes.push('could not reach the tavern in 70 steps');
  894 |   return false;
  895 | }
  896 | 
```