# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e4-boneyard.spec.ts >> e4-boneyard plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:668:5

# Error details

```
Error: secures: runState=dead at wave 4 / 124.4s sim, 55 kills, 25 gold

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - generic:
    - generic: Wave 3 ledgered ✓
    - generic "Wave status":
      - generic:
        - generic: Beacon coils hum eastward!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 100
      - generic:
        - generic: Time
        - strong: 02:04
      - generic:
        - generic: Wave
        - strong: "4"
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
        - generic [ref=e9]: 02:04 - Gathered 4 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "5"
        - strong: 12 / 44 XP
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
          - definition [ref=e21]: 02:04
        - generic [ref=e22]:
          - term [ref=e23]: Claim Jumpers Turned Back
          - definition [ref=e24]: "55"
        - generic [ref=e25]:
          - term [ref=e26]: Waves Survived
          - definition [ref=e27]: "4"
        - generic [ref=e28]:
          - term [ref=e29]: Gold Panned
          - definition [ref=e30]: "75"
        - generic [ref=e31]:
          - term [ref=e32]: Gold Sluiced
          - definition [ref=e33]: "0"
        - generic [ref=e34]:
          - term [ref=e35]: Stolen / Reclaimed
          - definition [ref=e36]: 0 / 0
        - generic [ref=e37]:
          - term [ref=e38]: Spent
          - definition [ref=e39]: "50"
        - generic [ref=e40]:
          - term [ref=e41]: Beacons Built
          - definition [ref=e42]: "0"
        - generic [ref=e43]:
          - term [ref=e44]: Buildings Built / Lost / Repaired
          - definition [ref=e45]: 1 / 0 / 0
        - generic [ref=e46]:
          - term [ref=e47]: Spark / Blast Damage
          - definition [ref=e48]: 1485 / 0
        - generic [ref=e49]:
          - term [ref=e50]: Blast Toggles
          - definition [ref=e51]: "0"
        - generic [ref=e52]:
          - term [ref=e53]: Blast Charge Time
          - definition [ref=e54]: 00:00
        - generic [ref=e55]:
          - term [ref=e56]: Upgrades Taken
          - definition [ref=e57]: firerate 2 · mobility 1 · volley 1
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
  949  |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  950  |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  951  |         }
  952  |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  953  |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  954  |         }
  955  |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  956  |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  957  |         }
  958  |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  959  |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  960  |         }
  961  |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  962  |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  963  |         }
  964  |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  965  | 
  966  |         if (sawOverlay) {
  967  |           try {
  968  | 
  969  |             const before = initialScores;
  970  |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  971  |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  972  |             const scores = await readScores(page);
  973  |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  974  |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  975  |             row.banks = banked
  976  |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  977  |               : fail(
  978  |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  979  |                 );
  980  |           } catch (error) {
  981  |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  982  |           }
  983  |         } else {
  984  |           row.banks = fail('skipped: never secured');
  985  |         }
  986  | 
  987  |         if (row.banks.ok) {
  988  |           try {
  989  |             for (let card = 0; card < 2; card += 1) {
  990  |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  991  |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  992  |                 await page.waitForTimeout(250);
  993  |               }
  994  |             }
  995  |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  996  |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  997  |             row.board = pass('the Book is on screen straight off the run ledger');
  998  |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  999  |           } catch (error) {
  1000 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1001 |           }
  1002 |         } else {
  1003 |           row.board = fail('skipped: never banked');
  1004 |         }
  1005 | 
  1006 |         if (row.banks.ok) {
  1007 |           try {
  1008 |             const before = await rawScores(page);
  1009 |             await page.goto('/');
  1010 |             await page.waitForLoadState('domcontentloaded');
  1011 |             const after = await rawScores(page);
  1012 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1013 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1014 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1015 |             const reachedTavern = await walkToTavern(page, row);
  1016 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1017 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1018 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1019 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1020 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1021 |           } catch (error) {
  1022 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1023 |           }
  1024 |         } else {
  1025 |           row.reload = fail('skipped: never banked');
  1026 |         }
  1027 | 
  1028 |         row.clean =
  1029 |           consoleErrors.length === 0 && pageErrors.length === 0
  1030 |             ? pass('0 console, 0 page')
  1031 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1032 |       } finally {
  1033 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1034 |         if (row.finalSnapshot) {
  1035 |           row.objective = row.finalSnapshot.objective;
  1036 |           if (!row.banks.ok) {
  1037 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1038 |             row.simAtEnd = row.finalSnapshot.sim;
  1039 |             row.hpAtEnd = row.finalSnapshot.hp;
  1040 |             row.goldAtEnd = row.finalSnapshot.gold;
  1041 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1042 |           }
  1043 |         }
  1044 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1045 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1046 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1047 |       }
  1048 | 
> 1049 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 4 / 124.4s sim, 55 kills, 25 gold
  1050 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1051 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1052 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1053 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1054 |     });
  1055 | }
  1056 | 
  1057 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1058 | 
  1059 | async function rawScores(page: Page): Promise<string | null> {
  1060 |   return page.evaluate(
  1061 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1062 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1063 |   );
  1064 | }
  1065 | 
  1066 | async function readScores(page: Page): Promise<Score[]> {
  1067 |   const raw = await rawScores(page);
  1068 |   try {
  1069 |     const parsed = JSON.parse(raw ?? '[]');
  1070 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1071 |   } catch {
  1072 |     return [];
  1073 |   }
  1074 | }
  1075 | 
  1076 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1077 |   for (let step = 0; step < 70; step += 1) {
  1078 |     const town = await page
  1079 |       .evaluate(() => {
  1080 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1081 |         if (!d) return null;
  1082 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1083 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1084 |       })
  1085 |       .catch(() => null);
  1086 |     if (!town) return false;
  1087 |     if (town.prompt === 'tavern') return true;
  1088 |     if (!town.approach) return false;
  1089 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1090 |   }
  1091 |   row.notes.push('could not reach the tavern in 70 steps');
  1092 |   return false;
  1093 | }
  1094 | 
```