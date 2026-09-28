# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e4-dust-flats.spec.ts >> e4-dust-flats plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:621:5

# Error details

```
Error: secures: runState=dead at wave 2 / 69.2s sim, 24 kills, 15 gold

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
        - strong: 01:09
      - generic:
        - generic: Wave
        - strong: "2"
    - region "Gold pouch":
      - generic: Gold
      - strong: "15"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 01:00 - Gathered 4 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "3"
        - strong: 20 / 28 XP
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
          - definition [ref=e21]: 01:09
        - generic [ref=e22]:
          - term [ref=e23]: Claim Jumpers Turned Back
          - definition [ref=e24]: "24"
        - generic [ref=e25]:
          - term [ref=e26]: Waves Survived
          - definition [ref=e27]: "2"
        - generic [ref=e28]:
          - term [ref=e29]: Gold Panned
          - definition [ref=e30]: "15"
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
          - definition [ref=e48]: 645 / 0
        - generic [ref=e49]:
          - term [ref=e50]: Blast Toggles
          - definition [ref=e51]: "0"
        - generic [ref=e52]:
          - term [ref=e53]: Blast Charge Time
          - definition [ref=e54]: 00:00
        - generic [ref=e55]:
          - term [ref=e56]: Upgrades Taken
          - definition [ref=e57]: firerate 1 · mobility 1
      - paragraph [ref=e58]: "Epoch science complete: the Deepwater Claim awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +987 toward the Deepwater Claim"
      - paragraph [ref=e59]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e60]:
        - paragraph [ref=e61]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e62]
        - generic [ref=e63]:
          - 'button "1 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [active] [ref=e64]':
            - generic [ref=e65]: "1"
            - generic [ref=e66]: Advances crafting-agent
            - strong [ref=e67]: "Continued Study: Seam Yield"
            - generic [ref=e68]: "Effect: +1% seam panning yield."
            - generic [ref=e70]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Turret Damage Effect: +1% turret damage. EVERY RUN" [ref=e71]':
            - generic [ref=e72]: "2"
            - generic [ref=e73]: Advances crafting-agent
            - strong [ref=e74]: "Continued Study: Turret Damage"
            - generic [ref=e75]: "Effect: +1% turret damage."
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
  896  |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  897  |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  898  |         }
  899  |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  900  |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  901  |         }
  902  |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  903  |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  904  |         }
  905  |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  906  |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  907  |         }
  908  |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  909  |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  910  |         }
  911  |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  912  | 
  913  |         if (sawOverlay) {
  914  |           try {
  915  | 
  916  |             const before = initialScores;
  917  |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  918  |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  919  |             const scores = await readScores(page);
  920  |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  921  |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  922  |             row.banks = banked
  923  |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  924  |               : fail(
  925  |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  926  |                 );
  927  |           } catch (error) {
  928  |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  929  |           }
  930  |         } else {
  931  |           row.banks = fail('skipped: never secured');
  932  |         }
  933  | 
  934  |         if (row.banks.ok) {
  935  |           try {
  936  |             for (let card = 0; card < 2; card += 1) {
  937  |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  938  |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  939  |                 await page.waitForTimeout(250);
  940  |               }
  941  |             }
  942  |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  943  |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  944  |             row.board = pass('the Book is on screen straight off the run ledger');
  945  |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  946  |           } catch (error) {
  947  |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  948  |           }
  949  |         } else {
  950  |           row.board = fail('skipped: never banked');
  951  |         }
  952  | 
  953  |         if (row.banks.ok) {
  954  |           try {
  955  |             const before = await rawScores(page);
  956  |             await page.goto('/');
  957  |             await page.waitForLoadState('domcontentloaded');
  958  |             const after = await rawScores(page);
  959  |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  960  |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  961  |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  962  |             const reachedTavern = await walkToTavern(page, row);
  963  |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  964  |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  965  |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  966  |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  967  |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  968  |           } catch (error) {
  969  |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  970  |           }
  971  |         } else {
  972  |           row.reload = fail('skipped: never banked');
  973  |         }
  974  | 
  975  |         row.clean =
  976  |           consoleErrors.length === 0 && pageErrors.length === 0
  977  |             ? pass('0 console, 0 page')
  978  |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  979  |       } finally {
  980  |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  981  |         if (row.finalSnapshot) {
  982  |           row.objective = row.finalSnapshot.objective;
  983  |           if (!row.banks.ok) {
  984  |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  985  |             row.simAtEnd = row.finalSnapshot.sim;
  986  |             row.hpAtEnd = row.finalSnapshot.hp;
  987  |             row.goldAtEnd = row.finalSnapshot.gold;
  988  |             row.runStateAtEnd = row.finalSnapshot.runState;
  989  |           }
  990  |         }
  991  |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  992  |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  993  |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  994  |       }
  995  | 
> 996  |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 2 / 69.2s sim, 24 kills, 15 gold
  997  |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  998  |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  999  |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1000 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1001 |     });
  1002 | }
  1003 | 
  1004 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1005 | 
  1006 | async function rawScores(page: Page): Promise<string | null> {
  1007 |   return page.evaluate(
  1008 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1009 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1010 |   );
  1011 | }
  1012 | 
  1013 | async function readScores(page: Page): Promise<Score[]> {
  1014 |   const raw = await rawScores(page);
  1015 |   try {
  1016 |     const parsed = JSON.parse(raw ?? '[]');
  1017 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1018 |   } catch {
  1019 |     return [];
  1020 |   }
  1021 | }
  1022 | 
  1023 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1024 |   for (let step = 0; step < 70; step += 1) {
  1025 |     const town = await page
  1026 |       .evaluate(() => {
  1027 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1028 |         if (!d) return null;
  1029 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1030 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1031 |       })
  1032 |       .catch(() => null);
  1033 |     if (!town) return false;
  1034 |     if (town.prompt === 'tavern') return true;
  1035 |     if (!town.approach) return false;
  1036 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1037 |   }
  1038 |   row.notes.push('could not reach the tavern in 70 steps');
  1039 |   return false;
  1040 | }
  1041 | 
```