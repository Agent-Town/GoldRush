# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e4-boneyard.spec.ts >> e4-boneyard plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:670:5

# Error details

```
Error: secures: runState=dead at wave 10 / 324.0s sim, 312 kills, 45 gold

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
        - strong: 05:23
      - generic:
        - generic: Wave
        - strong: "10"
    - region "Gold pouch":
      - strong: "45"
    - region "Active weapon":
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 04:32 - Gathered 4 XP
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "15"
        - strong: 96 / 124 XP
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
          - definition [ref=e26]: 05:23
        - generic [ref=e27]:
          - term [ref=e28]: Claim Jumpers Turned Back
          - definition [ref=e29]: "312"
        - generic [ref=e30]:
          - term [ref=e31]: Waves Survived
          - definition [ref=e32]: "10"
        - generic [ref=e33]:
          - term [ref=e34]: Gold Panned
          - definition [ref=e35]: "285"
        - generic [ref=e36]:
          - term [ref=e37]: Gold Sluiced
          - definition [ref=e38]: "0"
        - generic [ref=e39]:
          - term [ref=e40]: Stolen / Reclaimed
          - definition [ref=e41]: 0 / 0
        - generic [ref=e42]:
          - term [ref=e43]: Spent
          - definition [ref=e44]: "240"
        - generic [ref=e45]:
          - term [ref=e46]: Beacons Built
          - definition [ref=e47]: "1"
        - generic [ref=e48]:
          - term [ref=e49]: Buildings Built / Lost / Repaired
          - definition [ref=e50]: 4 / 0 / 0
        - generic [ref=e51]:
          - term [ref=e52]: Spark / Blast Damage
          - definition [ref=e53]: 12877 / 0
        - generic [ref=e54]:
          - term [ref=e55]: Blast Toggles
          - definition [ref=e56]: "0"
        - generic [ref=e57]:
          - term [ref=e58]: Blast Charge Time
          - definition [ref=e59]: 00:00
        - generic [ref=e60]:
          - term [ref=e61]: Upgrades Taken
          - definition [ref=e62]: firerate 3 · mobility 3 · plating 3 · damage 2 · volley 2 · blast 1
      - paragraph [ref=e63]: "Epoch science complete: the Deepwater Claim awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +987 toward the Deepwater Claim"
      - paragraph [ref=e64]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e65]:
        - paragraph [ref=e66]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e67]
        - generic [ref=e68]:
          - 'button "1 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [active] [ref=e69]':
            - generic [ref=e70]: "1"
            - generic [ref=e71]: Advances crafting-agent
            - strong [ref=e72]: "Continued Study: Seam Yield"
            - generic [ref=e73]: "Effect: +1% seam panning yield."
            - generic [ref=e75]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Turret Damage Effect: +1% turret damage. EVERY RUN" [ref=e76]':
            - generic [ref=e77]: "2"
            - generic [ref=e78]: Advances crafting-agent
            - strong [ref=e79]: "Continued Study: Turret Damage"
            - generic [ref=e80]: "Effect: +1% turret damage."
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
  955  |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  956  |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  957  |         }
  958  |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  959  |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  960  |         }
  961  |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  962  |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  963  |         }
  964  |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  965  |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  966  |         }
  967  |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  968  |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  969  |         }
  970  |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  971  | 
  972  |         if (sawOverlay) {
  973  |           try {
  974  | 
  975  |             const before = initialScores;
  976  |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  977  |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  978  |             const scores = await readScores(page);
  979  |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  980  |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  981  |             row.banks = banked
  982  |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  983  |               : fail(
  984  |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  985  |                 );
  986  |           } catch (error) {
  987  |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  988  |           }
  989  |         } else {
  990  |           row.banks = fail('skipped: never secured');
  991  |         }
  992  | 
  993  |         if (row.banks.ok) {
  994  |           try {
  995  |             for (let card = 0; card < 2; card += 1) {
  996  |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  997  |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  998  |                 await page.waitForTimeout(250);
  999  |               }
  1000 |             }
  1001 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1002 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1003 |             row.board = pass('the Book is on screen straight off the run ledger');
  1004 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1005 |           } catch (error) {
  1006 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1007 |           }
  1008 |         } else {
  1009 |           row.board = fail('skipped: never banked');
  1010 |         }
  1011 | 
  1012 |         if (row.banks.ok) {
  1013 |           try {
  1014 |             const before = await rawScores(page);
  1015 |             await page.goto('/');
  1016 |             await page.waitForLoadState('domcontentloaded');
  1017 |             const after = await rawScores(page);
  1018 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1019 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1020 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1021 |             const reachedTavern = await walkToTavern(page, row);
  1022 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1023 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1024 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1025 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1026 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1027 |           } catch (error) {
  1028 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1029 |           }
  1030 |         } else {
  1031 |           row.reload = fail('skipped: never banked');
  1032 |         }
  1033 | 
  1034 |         row.clean =
  1035 |           consoleErrors.length === 0 && pageErrors.length === 0
  1036 |             ? pass('0 console, 0 page')
  1037 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1038 |       } finally {
  1039 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1040 |         if (row.finalSnapshot) {
  1041 |           row.objective = row.finalSnapshot.objective;
  1042 |           if (!row.banks.ok) {
  1043 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1044 |             row.simAtEnd = row.finalSnapshot.sim;
  1045 |             row.hpAtEnd = row.finalSnapshot.hp;
  1046 |             row.goldAtEnd = row.finalSnapshot.gold;
  1047 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1048 |           }
  1049 |         }
  1050 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1051 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1052 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1053 |       }
  1054 | 
> 1055 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 10 / 324.0s sim, 312 kills, 45 gold
  1056 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1057 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1058 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1059 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1060 |     });
  1061 | }
  1062 | 
  1063 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1064 | 
  1065 | async function rawScores(page: Page): Promise<string | null> {
  1066 |   return page.evaluate(
  1067 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1068 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1069 |   );
  1070 | }
  1071 | 
  1072 | async function readScores(page: Page): Promise<Score[]> {
  1073 |   const raw = await rawScores(page);
  1074 |   try {
  1075 |     const parsed = JSON.parse(raw ?? '[]');
  1076 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1077 |   } catch {
  1078 |     return [];
  1079 |   }
  1080 | }
  1081 | 
  1082 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1083 |   for (let step = 0; step < 70; step += 1) {
  1084 |     const town = await page
  1085 |       .evaluate(() => {
  1086 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1087 |         if (!d) return null;
  1088 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1089 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1090 |       })
  1091 |       .catch(() => null);
  1092 |     if (!town) return false;
  1093 |     if (town.prompt === 'tavern') return true;
  1094 |     if (!town.approach) return false;
  1095 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1096 |   }
  1097 |   row.notes.push('could not reach the tavern in 70 steps');
  1098 |   return false;
  1099 | }
  1100 | 
```