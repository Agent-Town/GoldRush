# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e3-blackout-ridge.spec.ts >> e3-blackout-ridge plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:546:5

# Error details

```
Error: secures: Claim Secured at wave 12 / 360.1s sim, 175 HP, 2 buildings; authored banks not both observed storing current: {"capacitor-east":0,"capacitor-west":0}

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - region "Town square":
    - generic:
      - generic:
        - strong: Quartz Hill
      - generic [ref=e6]:
        - group [ref=e7]:
          - generic "Settings" [ref=e8] [cursor=pointer]
        - button "Exit" [ref=e9] [cursor=pointer]
    - region "Tavern contract board" [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]:
            - paragraph [ref=e14]: Tavern Ledger
            - heading "The Book" [level=2] [ref=e15]
            - button "Open every claim" [ref=e16] [cursor=pointer]
          - button "Back" [ref=e17] [cursor=pointer]
        - generic [ref=e18]:
          - button "Previous chapter" [disabled] [ref=e19]: ‹
          - generic [ref=e20]:
            - generic [ref=e21]:
              - generic [ref=e22]:
                - generic [ref=e23]:
                  - paragraph [ref=e24]: Chapter 1
                  - heading "Frontier" [level=3] [ref=e25]
                - generic [ref=e26]: 5 claims
              - generic [ref=e27]:
                - article "The Claim, page 1 of 5" [ref=e28]:
                  - figure [ref=e29]
                  - generic [ref=e30]:
                    - generic [ref=e31]:
                      - generic [ref=e32]: Trail
                      - generic [ref=e33]: Open
                    - heading "The Claim" [level=3] [ref=e34]
                    - paragraph [ref=e35]: The classic river claim.
                    - generic [ref=e36]:
                      - paragraph [ref=e37]: "This claim speaks: hero orders, the river, water crossings."
                      - generic [ref=e38]:
                        - paragraph [ref=e39]: Goals
                        - list [ref=e40]:
                          - listitem [ref=e41]: Survive through wave 10.
                      - generic [ref=e42]:
                        - paragraph [ref=e43]: Rules
                        - list [ref=e44]:
                          - listitem [ref=e45]: The river splits the claim around one center ford.
                          - listitem [ref=e46]: Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.
                    - paragraph [ref=e47]: "Secured: wave 30, 400 gold"
                    - button "Launch" [active] [ref=e48] [cursor=pointer]
                - article "The Dry Gulch, page 2 of 5" [ref=e49]:
                  - figure [ref=e50]
                  - generic [ref=e51]:
                    - generic [ref=e52]:
                      - generic [ref=e53]: Trail
                      - generic [ref=e54]: Open
                    - heading "The Dry Gulch" [level=3] [ref=e55]
                    - paragraph [ref=e56]: Mesa country; dry washes fall toward one sunken spring.
                    - generic [ref=e57]:
                      - paragraph [ref=e58]: "This claim speaks: hero orders, seam yield multiplier, spring cells."
                      - generic [ref=e59]:
                        - paragraph [ref=e60]: Goals
                        - list [ref=e61]:
                          - listitem [ref=e62]: Survive through wave 20.
                          - listitem [ref=e63]: Work the dry washes around the lone spring.
                      - generic [ref=e64]:
                        - paragraph [ref=e65]: Rules
                        - list [ref=e66]:
                          - listitem [ref=e67]: Sluices work only beside the spring.
                          - listitem [ref=e68]: The river is gone; enemies can press from every edge.
                          - listitem [ref=e69]: Seams pay 40% more gold.
                    - paragraph [ref=e70]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e71] [cursor=pointer]
                - article "Night Shift, page 3 of 5" [ref=e72]:
                  - figure [ref=e73]
                  - generic [ref=e74]:
                    - generic [ref=e75]:
                      - generic [ref=e76]: Vein-Hunter
                      - generic [ref=e77]: Open
                    - heading "Night Shift" [level=3] [ref=e78]
                    - paragraph [ref=e79]: The claim, gone dark, dotted with cold lanterns.
                    - generic [ref=e80]:
                      - paragraph [ref=e81]: "This claim speaks: lantern posts, darkness cycle, enemy lantern classes, hero orders, the river, water crossings."
                      - generic [ref=e82]:
                        - paragraph [ref=e83]: Goals
                        - list [ref=e84]:
                          - listitem [ref=e85]: Survive to DAWN at wave 25.
                      - generic [ref=e86]:
                        - paragraph [ref=e87]: Rules
                        - list [ref=e88]:
                          - listitem [ref=e89]: Beyond your light, the night owns the claim.
                          - listitem [ref=e90]: Relight cold lanterns or build new posts to see threats.
                          - listitem [ref=e91]: Turrets still target in the dark.
                    - paragraph [ref=e92]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e93] [cursor=pointer]
                - article "Twin Banks, page 4 of 5" [ref=e94]:
                  - figure [ref=e95]
                  - generic [ref=e96]:
                    - generic [ref=e97]:
                      - generic [ref=e98]: Vein-Hunter
                      - generic [ref=e99]: Open
                    - heading "Twin Banks" [level=3] [ref=e100]
                    - paragraph [ref=e101]: A braided river claim with twin fords, gravel bars, and damp reeds.
                    - generic [ref=e102]:
                      - paragraph [ref=e103]: "This claim speaks: build zones, hero orders, the river, water crossings, loss stakes."
                      - generic [ref=e104]:
                        - paragraph [ref=e105]: Goals
                        - list [ref=e106]:
                          - listitem [ref=e107]: Survive through wave 20.
                          - listitem [ref=e108]: Build on either bank and watch both fords.
                      - generic [ref=e109]:
                        - paragraph [ref=e110]: Rules
                        - list [ref=e111]:
                          - listitem [ref=e112]: Both banks can hold buildings.
                          - listitem [ref=e113]: Two fords carry pressure across the river.
                          - listitem [ref=e114]: The south stake marks your starting ground; the north marker stands across the braid.
                    - paragraph [ref=e115]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e116] [cursor=pointer]
                - article "The Claim-Jumper Baron, page 5 of 5" [ref=e117]:
                  - figure [ref=e118]
                  - generic [ref=e119]:
                    - generic [ref=e120]:
                      - generic [ref=e121]: Vein-Hunter
                      - generic [ref=e122]: Open
                    - heading "The Claim-Jumper Baron" [level=3] [ref=e123]
                    - paragraph [ref=e124]: An oxblood banner marks the outfit that keeps buying trouble.
                    - generic [ref=e125]:
                      - paragraph [ref=e126]: A brass-bannered bully compresses the waves and waits at the twentieth horn.
                      - paragraph [ref=e127]: "This claim speaks: baron, hero orders, the river, rocket volley, water crossings, wave cadence multiplier."
                      - generic [ref=e128]:
                        - paragraph [ref=e129]: Goals
                        - list [ref=e130]:
                          - listitem [ref=e131]: The Baron rides at wave 20. Break his Rocket Cart.
                      - generic [ref=e132]:
                        - paragraph [ref=e133]: Rules
                        - list [ref=e134]:
                          - listitem [ref=e135]: "His outfit rides hot: waves come 15% faster."
                          - listitem [ref=e136]: Taunts warn you before his banner appears.
                          - listitem [ref=e137]: Turn back the Baron for the medal and double science.
                    - paragraph [ref=e138]: The Baron's outfit rides at 20; cadence runs hot (+15%).
                    - paragraph [ref=e139]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e140] [cursor=pointer]
            - region "THE TRAINING GROUND" [ref=e141]:
              - generic [ref=e142]:
                - generic [ref=e143]: Drill bell · straw targets
                - heading "THE TRAINING GROUND" [level=3] [ref=e144]
              - article "The Drill Yard" [ref=e145]:
                - figure [ref=e146]
                - generic [ref=e147]:
                  - generic [ref=e148]:
                    - generic [ref=e149]: Training
                    - generic [ref=e150]: No stakes
                  - heading "The Drill Yard" [level=3] [ref=e151]
                  - paragraph [ref=e152]: "Practice ground: no stakes, no claim. The county lends the gold; the straw men lend their patience."
                  - generic [ref=e153]:
                    - paragraph [ref=e154]: A borrowed corner of the river claim at the edge of town.
                    - paragraph [ref=e155]: "This claim speaks: assay tent faucet, drill bell, rolling logs, straw men, drill wave, hero orders, ledger free practice, practice buildables, practice gold grant, practice target respawn, the river, water crossings."
                    - generic [ref=e156]:
                      - paragraph [ref=e157]: Goals
                      - list [ref=e158]:
                        - listitem [ref=e159]: Try every Frontier building.
                        - listitem [ref=e160]: Practice on the straw men and rolling logs.
                    - generic [ref=e161]:
                      - paragraph [ref=e162]: Rules
                      - list [ref=e163]:
                        - listitem [ref=e164]: Pull the assay-tent lever to top up practice gold.
                        - listitem [ref=e165]: Ring the Drill Bell for one small wave.
                        - listitem [ref=e166]: Nothing in the yard enters the county ledger.
                  - button "Enter the yard" [ref=e167] [cursor=pointer]
          - button "Next chapter" [ref=e168] [cursor=pointer]: ›
        - navigation "Book chapters" [ref=e169]:
          - generic [ref=e170]: 1 / 10
          - generic [ref=e171]:
            - button "1. Frontier" [ref=e172] [cursor=pointer]
            - button "2. Steamworks" [ref=e173] [cursor=pointer]
            - button "3. Voltage Age" [ref=e174] [cursor=pointer]
            - button "4. Motor Frontier" [ref=e175] [cursor=pointer]
            - button "5. Deepwater Claim" [ref=e176] [cursor=pointer]
            - button "6. Atomic Homestead" [ref=e177] [cursor=pointer]
            - button "7. Signal Era" [ref=e178] [cursor=pointer]
            - button "8. Orbital Frontier" [ref=e179] [cursor=pointer]
            - button "9. Red Fields" [ref=e180] [cursor=pointer]
            - button "10. Deep Sky" [ref=e181] [cursor=pointer]
        - group [ref=e182]:
          - generic "Ride Together" [ref=e183] [cursor=pointer]:
            - generic [ref=e184]: Ride Together
            - generic [ref=e185]: Open
```

# Test source

```ts
  787 |           ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
  788 |           : fail(
  789 |               died ||
  790 |                 `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
  791 |             );
  792 | 
  793 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  794 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  795 |         }
  796 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  797 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  798 |         }
  799 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  800 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  801 |         }
  802 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  803 | 
  804 |         if (sawOverlay) {
  805 |           try {
  806 | 
  807 |             const before = initialScores;
  808 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  809 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  810 |             const scores = await readScores(page);
  811 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  812 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  813 |             row.banks = banked
  814 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  815 |               : fail(
  816 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  817 |                 );
  818 |           } catch (error) {
  819 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  820 |           }
  821 |         } else {
  822 |           row.banks = fail('skipped: never secured');
  823 |         }
  824 | 
  825 |         if (row.banks.ok) {
  826 |           try {
  827 |             for (let card = 0; card < 2; card += 1) {
  828 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  829 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  830 |                 await page.waitForTimeout(250);
  831 |               }
  832 |             }
  833 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  834 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  835 |             row.board = pass('the Book is on screen straight off the run ledger');
  836 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  837 |           } catch (error) {
  838 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  839 |           }
  840 |         } else {
  841 |           row.board = fail('skipped: never banked');
  842 |         }
  843 | 
  844 |         if (row.banks.ok) {
  845 |           try {
  846 |             const before = await rawScores(page);
  847 |             await page.goto('/');
  848 |             await page.waitForLoadState('domcontentloaded');
  849 |             const after = await rawScores(page);
  850 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  851 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  852 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  853 |             const reachedTavern = await walkToTavern(page, row);
  854 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  855 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  856 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  857 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  858 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  859 |           } catch (error) {
  860 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  861 |           }
  862 |         } else {
  863 |           row.reload = fail('skipped: never banked');
  864 |         }
  865 | 
  866 |         row.clean =
  867 |           consoleErrors.length === 0 && pageErrors.length === 0
  868 |             ? pass('0 console, 0 page')
  869 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  870 |       } finally {
  871 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  872 |         if (row.finalSnapshot) {
  873 |           row.objective = row.finalSnapshot.objective;
  874 |           if (!row.banks.ok) {
  875 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  876 |             row.simAtEnd = row.finalSnapshot.sim;
  877 |             row.hpAtEnd = row.finalSnapshot.hp;
  878 |             row.goldAtEnd = row.finalSnapshot.gold;
  879 |             row.runStateAtEnd = row.finalSnapshot.runState;
  880 |           }
  881 |         }
  882 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  883 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  884 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  885 |       }
  886 | 
> 887 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: Claim Secured at wave 12 / 360.1s sim, 175 HP, 2 buildings; authored banks not both observed storing current: {"capacitor-east":0,"capacitor-west":0}
  888 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  889 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  890 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  891 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  892 |     });
  893 | }
  894 | 
  895 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  896 | 
  897 | async function rawScores(page: Page): Promise<string | null> {
  898 |   return page.evaluate(
  899 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  900 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  901 |   );
  902 | }
  903 | 
  904 | async function readScores(page: Page): Promise<Score[]> {
  905 |   const raw = await rawScores(page);
  906 |   try {
  907 |     const parsed = JSON.parse(raw ?? '[]');
  908 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  909 |   } catch {
  910 |     return [];
  911 |   }
  912 | }
  913 | 
  914 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  915 |   for (let step = 0; step < 70; step += 1) {
  916 |     const town = await page
  917 |       .evaluate(() => {
  918 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  919 |         if (!d) return null;
  920 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  921 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  922 |       })
  923 |       .catch(() => null);
  924 |     if (!town) return false;
  925 |     if (town.prompt === 'tavern') return true;
  926 |     if (!town.approach) return false;
  927 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  928 |   }
  929 |   row.notes.push('could not reach the tavern in 70 steps');
  930 |   return false;
  931 | }
  932 | 
```