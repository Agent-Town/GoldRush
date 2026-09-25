# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e4-gusher-county.spec.ts >> e4-gusher-county plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:653:5

# Error details

```
Error: secures: runState=dead at wave 14 / 425.6s sim, 549 kills, 25 gold

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
        - generic: Wrecking crew sighted - east ridge.
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 07:05
      - generic:
        - generic: Wave
        - strong: "14"
    - region "Gold pouch":
      - generic: Gold
      - strong: "25"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 06:57 - Gathered 4 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "22"
        - strong: 8 / 180 XP
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
          - definition [ref=e21]: 07:05
        - generic [ref=e22]:
          - term [ref=e23]: Claim Jumpers Turned Back
          - definition [ref=e24]: "549"
        - generic [ref=e25]:
          - term [ref=e26]: Waves Survived
          - definition [ref=e27]: "14"
        - generic [ref=e28]:
          - term [ref=e29]: Gold Panned
          - definition [ref=e30]: "300"
        - generic [ref=e31]:
          - term [ref=e32]: Gold Sluiced
          - definition [ref=e33]: "0"
        - generic [ref=e34]:
          - term [ref=e35]: Stolen / Reclaimed
          - definition [ref=e36]: 0 / 0
        - generic [ref=e37]:
          - term [ref=e38]: Spent
          - definition [ref=e39]: "275"
        - generic [ref=e40]:
          - term [ref=e41]: Beacons Built
          - definition [ref=e42]: "2"
        - generic [ref=e43]:
          - term [ref=e44]: Buildings Built / Lost / Repaired
          - definition [ref=e45]: 5 / 0 / 0
        - generic [ref=e46]:
          - term [ref=e47]: Spark / Blast Damage
          - definition [ref=e48]: 20189 / 0
        - generic [ref=e49]:
          - term [ref=e50]: Blast Toggles
          - definition [ref=e51]: "0"
        - generic [ref=e52]:
          - term [ref=e53]: Blast Charge Time
          - definition [ref=e54]: 00:00
        - generic [ref=e55]:
          - term [ref=e56]: Upgrades Taken
          - definition [ref=e57]: blast 4 · damage 3 · firerate 3 · mobility 3 · plating 3 · range 2 · volley 2 · prospecting 1
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
  934  |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  935  |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  936  |         }
  937  |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  938  |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  939  |         }
  940  |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  941  |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  942  |         }
  943  |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  944  |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  945  |         }
  946  |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  947  |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  948  |         }
  949  |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  950  | 
  951  |         if (sawOverlay) {
  952  |           try {
  953  | 
  954  |             const before = initialScores;
  955  |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  956  |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  957  |             const scores = await readScores(page);
  958  |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  959  |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  960  |             row.banks = banked
  961  |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  962  |               : fail(
  963  |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  964  |                 );
  965  |           } catch (error) {
  966  |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  967  |           }
  968  |         } else {
  969  |           row.banks = fail('skipped: never secured');
  970  |         }
  971  | 
  972  |         if (row.banks.ok) {
  973  |           try {
  974  |             for (let card = 0; card < 2; card += 1) {
  975  |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  976  |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  977  |                 await page.waitForTimeout(250);
  978  |               }
  979  |             }
  980  |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  981  |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  982  |             row.board = pass('the Book is on screen straight off the run ledger');
  983  |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  984  |           } catch (error) {
  985  |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  986  |           }
  987  |         } else {
  988  |           row.board = fail('skipped: never banked');
  989  |         }
  990  | 
  991  |         if (row.banks.ok) {
  992  |           try {
  993  |             const before = await rawScores(page);
  994  |             await page.goto('/');
  995  |             await page.waitForLoadState('domcontentloaded');
  996  |             const after = await rawScores(page);
  997  |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  998  |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  999  |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1000 |             const reachedTavern = await walkToTavern(page, row);
  1001 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1002 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1003 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1004 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1005 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1006 |           } catch (error) {
  1007 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1008 |           }
  1009 |         } else {
  1010 |           row.reload = fail('skipped: never banked');
  1011 |         }
  1012 | 
  1013 |         row.clean =
  1014 |           consoleErrors.length === 0 && pageErrors.length === 0
  1015 |             ? pass('0 console, 0 page')
  1016 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1017 |       } finally {
  1018 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1019 |         if (row.finalSnapshot) {
  1020 |           row.objective = row.finalSnapshot.objective;
  1021 |           if (!row.banks.ok) {
  1022 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1023 |             row.simAtEnd = row.finalSnapshot.sim;
  1024 |             row.hpAtEnd = row.finalSnapshot.hp;
  1025 |             row.goldAtEnd = row.finalSnapshot.gold;
  1026 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1027 |           }
  1028 |         }
  1029 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1030 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1031 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1032 |       }
  1033 | 
> 1034 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 14 / 425.6s sim, 549 kills, 25 gold
  1035 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1036 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1037 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1038 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1039 |     });
  1040 | }
  1041 | 
  1042 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1043 | 
  1044 | async function rawScores(page: Page): Promise<string | null> {
  1045 |   return page.evaluate(
  1046 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1047 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1048 |   );
  1049 | }
  1050 | 
  1051 | async function readScores(page: Page): Promise<Score[]> {
  1052 |   const raw = await rawScores(page);
  1053 |   try {
  1054 |     const parsed = JSON.parse(raw ?? '[]');
  1055 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1056 |   } catch {
  1057 |     return [];
  1058 |   }
  1059 | }
  1060 | 
  1061 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1062 |   for (let step = 0; step < 70; step += 1) {
  1063 |     const town = await page
  1064 |       .evaluate(() => {
  1065 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1066 |         if (!d) return null;
  1067 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1068 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1069 |       })
  1070 |       .catch(() => null);
  1071 |     if (!town) return false;
  1072 |     if (town.prompt === 'tavern') return true;
  1073 |     if (!town.approach) return false;
  1074 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1075 |   }
  1076 |   row.notes.push('could not reach the tavern in 70 steps');
  1077 |   return false;
  1078 | }
  1079 | 
```