# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e3-blackout-ridge.spec.ts >> e3-blackout-ridge plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:547:5

# Error details

```
Error: secures: Claim Secured at wave 12 / 360.1s sim, 175 HP, 3 buildings; authored banks not both observed storing current: {"capacitor-east":0,"capacitor-west":0}

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
        - generic: Town Square
      - generic [ref=e4]:
        - group [ref=e5]:
          - generic "Settings" [ref=e6] [cursor=pointer]
        - button "Exit" [ref=e7] [cursor=pointer]
    - region "Tavern contract board" [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]:
            - paragraph [ref=e12]: Tavern Ledger
            - heading "The Book" [level=2] [ref=e13]
            - button "Open every claim" [ref=e14] [cursor=pointer]
          - button "Back" [ref=e15] [cursor=pointer]
        - generic [ref=e16]:
          - button "Previous chapter" [disabled] [ref=e17]: ‹
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]:
                - generic [ref=e21]:
                  - paragraph [ref=e22]: Chapter 1
                  - heading "Frontier" [level=3] [ref=e23]
                - generic [ref=e24]: 5 claims
              - generic [ref=e25]:
                - article "The Claim, page 1 of 5" [ref=e26]:
                  - figure [ref=e27]
                  - generic [ref=e28]:
                    - generic [ref=e29]:
                      - generic [ref=e30]: Trail
                      - generic [ref=e31]: Open
                    - heading "The Claim" [level=3] [ref=e32]
                    - paragraph [ref=e33]: The classic river claim.
                    - generic [ref=e34]:
                      - paragraph [ref=e35]: "This claim speaks: hero orders, the river, water crossings."
                      - generic [ref=e36]:
                        - paragraph [ref=e37]: Goals
                        - list [ref=e38]:
                          - listitem [ref=e39]: Survive through wave 10.
                      - generic [ref=e40]:
                        - paragraph [ref=e41]: Rules
                        - list [ref=e42]:
                          - listitem [ref=e43]: The river splits the claim around one center ford.
                          - listitem [ref=e44]: Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.
                    - paragraph [ref=e45]: "Secured: wave 30, 400 gold"
                    - button "Launch" [active] [ref=e46] [cursor=pointer]
                - article "The Dry Gulch, page 2 of 5" [ref=e47]:
                  - figure [ref=e48]
                  - generic [ref=e49]:
                    - generic [ref=e50]:
                      - generic [ref=e51]: Trail
                      - generic [ref=e52]: Open
                    - heading "The Dry Gulch" [level=3] [ref=e53]
                    - paragraph [ref=e54]: Mesa country; dry washes fall toward one sunken spring.
                    - generic [ref=e55]:
                      - paragraph [ref=e56]: "This claim speaks: hero orders, seam yield multiplier, spring cells."
                      - generic [ref=e57]:
                        - paragraph [ref=e58]: Goals
                        - list [ref=e59]:
                          - listitem [ref=e60]: Survive through wave 20.
                          - listitem [ref=e61]: Work the dry washes around the lone spring.
                      - generic [ref=e62]:
                        - paragraph [ref=e63]: Rules
                        - list [ref=e64]:
                          - listitem [ref=e65]: Sluices work only beside the spring.
                          - listitem [ref=e66]: The river is gone; enemies can press from every edge.
                          - listitem [ref=e67]: Seams pay 40% more gold.
                    - paragraph [ref=e68]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e69] [cursor=pointer]
                - article "Night Shift, page 3 of 5" [ref=e70]:
                  - figure [ref=e71]
                  - generic [ref=e72]:
                    - generic [ref=e73]:
                      - generic [ref=e74]: Vein-Hunter
                      - generic [ref=e75]: Open
                    - heading "Night Shift" [level=3] [ref=e76]
                    - paragraph [ref=e77]: The claim, gone dark, dotted with cold lanterns.
                    - generic [ref=e78]:
                      - paragraph [ref=e79]: "This claim speaks: lantern posts, darkness cycle, enemy lantern classes, hero orders, the river, water crossings."
                      - generic [ref=e80]:
                        - paragraph [ref=e81]: Goals
                        - list [ref=e82]:
                          - listitem [ref=e83]: Survive to DAWN at wave 25.
                      - generic [ref=e84]:
                        - paragraph [ref=e85]: Rules
                        - list [ref=e86]:
                          - listitem [ref=e87]: Beyond your light, the night owns the claim.
                          - listitem [ref=e88]: Relight cold lanterns or build new posts to see threats.
                          - listitem [ref=e89]: Turrets still target in the dark.
                    - paragraph [ref=e90]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e91] [cursor=pointer]
                - article "Twin Banks, page 4 of 5" [ref=e92]:
                  - figure [ref=e93]
                  - generic [ref=e94]:
                    - generic [ref=e95]:
                      - generic [ref=e96]: Vein-Hunter
                      - generic [ref=e97]: Open
                    - heading "Twin Banks" [level=3] [ref=e98]
                    - paragraph [ref=e99]: A braided river claim with twin fords, gravel bars, and damp reeds.
                    - generic [ref=e100]:
                      - paragraph [ref=e101]: "This claim speaks: build zones, hero orders, the river, water crossings, loss stakes."
                      - generic [ref=e102]:
                        - paragraph [ref=e103]: Goals
                        - list [ref=e104]:
                          - listitem [ref=e105]: Survive through wave 20.
                          - listitem [ref=e106]: Build on either bank and watch both fords.
                      - generic [ref=e107]:
                        - paragraph [ref=e108]: Rules
                        - list [ref=e109]:
                          - listitem [ref=e110]: Both banks can hold buildings.
                          - listitem [ref=e111]: Two fords carry pressure across the river.
                          - listitem [ref=e112]: The south stake marks your starting ground; the north marker stands across the braid.
                    - paragraph [ref=e113]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e114] [cursor=pointer]
                - article "The Claim-Jumper Baron, page 5 of 5" [ref=e115]:
                  - figure [ref=e116]
                  - generic [ref=e117]:
                    - generic [ref=e118]:
                      - generic [ref=e119]: Vein-Hunter
                      - generic [ref=e120]: Open
                    - heading "The Claim-Jumper Baron" [level=3] [ref=e121]
                    - paragraph [ref=e122]: An oxblood banner marks the outfit that keeps buying trouble.
                    - generic [ref=e123]:
                      - paragraph [ref=e124]: A brass-bannered bully compresses the waves and waits at the twentieth horn.
                      - paragraph [ref=e125]: "This claim speaks: baron, hero orders, the river, rocket volley, water crossings, wave cadence multiplier."
                      - generic [ref=e126]:
                        - paragraph [ref=e127]: Goals
                        - list [ref=e128]:
                          - listitem [ref=e129]: The Baron rides at wave 20. Break his Rocket Cart.
                      - generic [ref=e130]:
                        - paragraph [ref=e131]: Rules
                        - list [ref=e132]:
                          - listitem [ref=e133]: "His outfit rides hot: waves come 15% faster."
                          - listitem [ref=e134]: Taunts warn you before his banner appears.
                          - listitem [ref=e135]: Turn back the Baron for the medal and double science.
                    - paragraph [ref=e136]: The Baron's outfit rides at 20; cadence runs hot (+15%).
                    - paragraph [ref=e137]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e138] [cursor=pointer]
            - region "THE TRAINING GROUND" [ref=e139]:
              - generic [ref=e140]:
                - generic [ref=e141]: Drill bell · straw targets
                - heading "THE TRAINING GROUND" [level=3] [ref=e142]
              - article "The Drill Yard" [ref=e143]:
                - figure [ref=e144]
                - generic [ref=e145]:
                  - generic [ref=e146]:
                    - generic [ref=e147]: Training
                    - generic [ref=e148]: No stakes
                  - heading "The Drill Yard" [level=3] [ref=e149]
                  - paragraph [ref=e150]: "Practice ground: no stakes, no claim. The county lends the gold; the straw men lend their patience."
                  - generic [ref=e151]:
                    - paragraph [ref=e152]: A borrowed corner of the river claim at the edge of town.
                    - paragraph [ref=e153]: "This claim speaks: assay tent faucet, drill bell, rolling logs, straw men, drill wave, hero orders, ledger free practice, practice buildables, practice gold grant, practice target respawn, the river, water crossings."
                    - generic [ref=e154]:
                      - paragraph [ref=e155]: Goals
                      - list [ref=e156]:
                        - listitem [ref=e157]: Try every Frontier building.
                        - listitem [ref=e158]: Practice on the straw men and rolling logs.
                    - generic [ref=e159]:
                      - paragraph [ref=e160]: Rules
                      - list [ref=e161]:
                        - listitem [ref=e162]: Pull the assay-tent lever to top up practice gold.
                        - listitem [ref=e163]: Ring the Drill Bell for one small wave.
                        - listitem [ref=e164]: Nothing in the yard enters the county ledger.
                  - button "Enter the yard" [ref=e165] [cursor=pointer]
          - button "Next chapter" [ref=e166] [cursor=pointer]: ›
        - navigation "Book chapters" [ref=e167]:
          - generic [ref=e168]: 1 / 10
          - generic [ref=e169]:
            - button "1. Frontier" [ref=e170] [cursor=pointer]
            - button "2. Steamworks" [ref=e171] [cursor=pointer]
            - button "3. Voltage Age" [ref=e172] [cursor=pointer]
            - button "4. Motor Frontier" [ref=e173] [cursor=pointer]
            - button "5. Deepwater Claim" [ref=e174] [cursor=pointer]
            - button "6. Atomic Homestead" [ref=e175] [cursor=pointer]
            - button "7. Signal Era" [ref=e176] [cursor=pointer]
            - button "8. Orbital Frontier" [ref=e177] [cursor=pointer]
            - button "9. Red Fields" [ref=e178] [cursor=pointer]
            - button "10. Deep Sky" [ref=e179] [cursor=pointer]
        - group [ref=e180]:
          - generic "Ride Together" [ref=e181] [cursor=pointer]:
            - generic [ref=e182]: Ride Together
            - generic [ref=e183]: Open
```

# Test source

```ts
  766 |           ? pass(`Claim Secured at wave ${row.peakWave} / ${row.simAtEnd.toFixed(1)}s sim, ${row.hpAtEnd.toFixed(0)} HP, ${row.builds.length} buildings`)
  767 |           : fail(
  768 |               died ||
  769 |                 `never secured: peak wave ${row.peakWave} of ${secureWave} after ${row.simAtEnd.toFixed(1)}s sim (runState=${row.runStateAtEnd || 'unknown'}, ${row.builds.length} buildings, ${row.killsAtEnd} kills)`,
  770 |             );
  771 | 
  772 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  773 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  774 |         }
  775 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  776 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  777 |         }
  778 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  779 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  780 |         }
  781 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  782 | 
  783 |         if (sawOverlay) {
  784 |           try {
  785 | 
  786 |             const before = initialScores;
  787 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  788 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  789 |             const scores = await readScores(page);
  790 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  791 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  792 |             row.banks = banked
  793 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  794 |               : fail(
  795 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  796 |                 );
  797 |           } catch (error) {
  798 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  799 |           }
  800 |         } else {
  801 |           row.banks = fail('skipped: never secured');
  802 |         }
  803 | 
  804 |         if (row.banks.ok) {
  805 |           try {
  806 |             for (let card = 0; card < 2; card += 1) {
  807 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  808 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  809 |                 await page.waitForTimeout(250);
  810 |               }
  811 |             }
  812 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  813 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  814 |             row.board = pass('the Book is on screen straight off the run ledger');
  815 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  816 |           } catch (error) {
  817 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  818 |           }
  819 |         } else {
  820 |           row.board = fail('skipped: never banked');
  821 |         }
  822 | 
  823 |         if (row.banks.ok) {
  824 |           try {
  825 |             const before = await rawScores(page);
  826 |             await page.goto('/');
  827 |             await page.waitForLoadState('domcontentloaded');
  828 |             const after = await rawScores(page);
  829 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  830 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  831 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  832 |             const reachedTavern = await walkToTavern(page, row);
  833 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  834 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  835 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  836 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  837 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  838 |           } catch (error) {
  839 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  840 |           }
  841 |         } else {
  842 |           row.reload = fail('skipped: never banked');
  843 |         }
  844 | 
  845 |         row.clean =
  846 |           consoleErrors.length === 0 && pageErrors.length === 0
  847 |             ? pass('0 console, 0 page')
  848 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  849 |       } finally {
  850 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  851 |         if (row.finalSnapshot) {
  852 |           row.objective = row.finalSnapshot.objective;
  853 |           if (!row.banks.ok) {
  854 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  855 |             row.simAtEnd = row.finalSnapshot.sim;
  856 |             row.hpAtEnd = row.finalSnapshot.hp;
  857 |             row.goldAtEnd = row.finalSnapshot.gold;
  858 |             row.runStateAtEnd = row.finalSnapshot.runState;
  859 |           }
  860 |         }
  861 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  862 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  863 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  864 |       }
  865 | 
> 866 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
      |                                                                ^ Error: secures: Claim Secured at wave 12 / 360.1s sim, 175 HP, 3 buildings; authored banks not both observed storing current: {"capacitor-east":0,"capacitor-west":0}
  867 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  868 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  869 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  870 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  871 |     });
  872 | }
  873 | 
  874 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  875 | 
  876 | async function rawScores(page: Page): Promise<string | null> {
  877 |   return page.evaluate(
  878 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  879 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  880 |   );
  881 | }
  882 | 
  883 | async function readScores(page: Page): Promise<Score[]> {
  884 |   const raw = await rawScores(page);
  885 |   try {
  886 |     const parsed = JSON.parse(raw ?? '[]');
  887 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  888 |   } catch {
  889 |     return [];
  890 |   }
  891 | }
  892 | 
  893 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  894 |   for (let step = 0; step < 70; step += 1) {
  895 |     const town = await page
  896 |       .evaluate(() => {
  897 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  898 |         if (!d) return null;
  899 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  900 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  901 |       })
  902 |       .catch(() => null);
  903 |     if (!town) return false;
  904 |     if (town.prompt === 'tavern') return true;
  905 |     if (!town.approach) return false;
  906 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  907 |   }
  908 |   row.notes.push('could not reach the tavern in 70 steps');
  909 |   return false;
  910 | }
  911 | 
```