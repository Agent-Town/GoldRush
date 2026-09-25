# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e8-far-side.spec.ts >> e8-far-side plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:703:5

# Error details

```
Error: secures: runState=dead at wave 12 / 375.1s sim, 436 kills, 0 gold; four air-supported crossings and one probe playback not proved

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
        - generic: West ridge shadows want the gold!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 06:15
      - generic:
        - generic: Wave
        - strong: "12"
    - region "Gold pouch":
      - generic: Gold
      - strong: "0"
    - region "Suit air 60 of 60 seconds, breathing":
      - generic: Air
      - strong: 60s
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 06:12 - Gathered 20 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "20"
        - strong: 52 / 164 XP
    - region "Build":
      - button "Build" [ref=e12]
    - button "Pause the claim" [ref=e13]: P - catch your breath
  - region "Run ledger" [ref=e14]:
    - generic [ref=e15]:
      - paragraph [ref=e16]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e17]
      - paragraph [ref=e18]: The claim was overrun. The gold remembers.
      - generic [ref=e19]:
        - generic [ref=e20]:
          - term [ref=e21]: Time Held
          - definition [ref=e22]: 06:15
        - generic [ref=e23]:
          - term [ref=e24]: Claim Jumpers Turned Back
          - definition [ref=e25]: "436"
        - generic [ref=e26]:
          - term [ref=e27]: Waves Survived
          - definition [ref=e28]: "12"
        - generic [ref=e29]:
          - term [ref=e30]: Gold Panned
          - definition [ref=e31]: "0"
        - generic [ref=e32]:
          - term [ref=e33]: Gold Sluiced
          - definition [ref=e34]: "0"
        - generic [ref=e35]:
          - term [ref=e36]: Stolen / Reclaimed
          - definition [ref=e37]: 0 / 0
        - generic [ref=e38]:
          - term [ref=e39]: Spent
          - definition [ref=e40]: "0"
        - generic [ref=e41]:
          - term [ref=e42]: Beacons Built
          - definition [ref=e43]: "0"
        - generic [ref=e44]:
          - term [ref=e45]: Buildings Built / Lost / Repaired
          - definition [ref=e46]: 0 / 0 / 0
        - generic [ref=e47]:
          - term [ref=e48]: Spark / Blast Damage
          - definition [ref=e49]: 27493 / 0
        - generic [ref=e50]:
          - term [ref=e51]: Blast Toggles
          - definition [ref=e52]: "0"
        - generic [ref=e53]:
          - term [ref=e54]: Blast Charge Time
          - definition [ref=e55]: 00:00
        - generic [ref=e56]:
          - term [ref=e57]: Upgrades Taken
          - definition [ref=e58]: blast 3 · damage 3 · firerate 3 · mobility 3 · plating 3 · range 2 · volley 2
      - paragraph [ref=e59]: "Epoch science complete: the Red Fields awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +979 toward the Red Fields"
      - paragraph [ref=e60]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e61]:
        - paragraph [ref=e62]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e63]
        - generic [ref=e64]:
          - 'button "1 Advances crafting-agent Vacuum Lenses Effect: Unlocks the Vacuum Lens beam and lobber: 9 beam damage and 28 burst damage. EVERY RUN" [active] [ref=e65]':
            - generic [ref=e66]: "1"
            - generic [ref=e67]: Advances crafting-agent
            - strong [ref=e68]: Vacuum Lenses
            - generic [ref=e69]: "Effect: Unlocks the Vacuum Lens beam and lobber: 9 beam damage and 28 burst damage."
            - generic [ref=e71]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [ref=e72]':
            - generic [ref=e73]: "2"
            - generic [ref=e74]: Advances crafting-agent
            - strong [ref=e75]: "Continued Study: Seam Yield"
            - generic [ref=e76]: "Effect: +1% seam panning yield."
            - generic [ref=e78]: EVERY RUN
        - paragraph [ref=e79]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e80]:
        - heading "Best Claims" [level=2] [ref=e81]
        - list [ref=e82]:
          - listitem [ref=e83]:
            - generic [ref=e84]: wave 30 · baseless
            - strong [ref=e85]: SECURED
            - generic [ref=e86]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
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
      - generic [ref=e103]:
        - button "Keep this tape" [ref=e104]
        - button "Return to Town" [ref=e105]
        - button "Try Again" [ref=e106]
```

# Test source

```ts
  1000 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  1001 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  1002 |         }
  1003 |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  1004 |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  1005 |         }
  1006 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1007 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1008 |         }
  1009 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1010 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1011 |         }
  1012 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1013 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1014 |         }
  1015 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1016 | 
  1017 |         if (sawOverlay) {
  1018 |           try {
  1019 | 
  1020 |             const before = initialScores;
  1021 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1022 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1023 |             const scores = await readScores(page);
  1024 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1025 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1026 |             row.banks = banked
  1027 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1028 |               : fail(
  1029 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1030 |                 );
  1031 |           } catch (error) {
  1032 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1033 |           }
  1034 |         } else {
  1035 |           row.banks = fail('skipped: never secured');
  1036 |         }
  1037 | 
  1038 |         if (row.banks.ok) {
  1039 |           try {
  1040 |             for (let card = 0; card < 2; card += 1) {
  1041 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1042 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1043 |                 await page.waitForTimeout(250);
  1044 |               }
  1045 |             }
  1046 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1047 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1048 |             row.board = pass('the Book is on screen straight off the run ledger');
  1049 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1050 |           } catch (error) {
  1051 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1052 |           }
  1053 |         } else {
  1054 |           row.board = fail('skipped: never banked');
  1055 |         }
  1056 | 
  1057 |         if (row.banks.ok) {
  1058 |           try {
  1059 |             const before = await rawScores(page);
  1060 |             await page.goto('/');
  1061 |             await page.waitForLoadState('domcontentloaded');
  1062 |             const after = await rawScores(page);
  1063 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1064 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1065 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1066 |             const reachedTavern = await walkToTavern(page, row);
  1067 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1068 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1069 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1070 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1071 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1072 |           } catch (error) {
  1073 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1074 |           }
  1075 |         } else {
  1076 |           row.reload = fail('skipped: never banked');
  1077 |         }
  1078 | 
  1079 |         row.clean =
  1080 |           consoleErrors.length === 0 && pageErrors.length === 0
  1081 |             ? pass('0 console, 0 page')
  1082 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1083 |       } finally {
  1084 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1085 |         if (row.finalSnapshot) {
  1086 |           row.objective = row.finalSnapshot.objective;
  1087 |           if (!row.banks.ok) {
  1088 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1089 |             row.simAtEnd = row.finalSnapshot.sim;
  1090 |             row.hpAtEnd = row.finalSnapshot.hp;
  1091 |             row.goldAtEnd = row.finalSnapshot.gold;
  1092 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1093 |           }
  1094 |         }
  1095 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1096 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1097 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1098 |       }
  1099 | 
> 1100 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 12 / 375.1s sim, 436 kills, 0 gold; four air-supported crossings and one probe playback not proved
  1101 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1102 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1103 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1104 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1105 |     });
  1106 | }
  1107 | 
  1108 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1109 | 
  1110 | async function rawScores(page: Page): Promise<string | null> {
  1111 |   return page.evaluate(
  1112 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1113 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1114 |   );
  1115 | }
  1116 | 
  1117 | async function readScores(page: Page): Promise<Score[]> {
  1118 |   const raw = await rawScores(page);
  1119 |   try {
  1120 |     const parsed = JSON.parse(raw ?? '[]');
  1121 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1122 |   } catch {
  1123 |     return [];
  1124 |   }
  1125 | }
  1126 | 
  1127 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1128 |   for (let step = 0; step < 70; step += 1) {
  1129 |     const town = await page
  1130 |       .evaluate(() => {
  1131 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1132 |         if (!d) return null;
  1133 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1134 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1135 |       })
  1136 |       .catch(() => null);
  1137 |     if (!town) return false;
  1138 |     if (town.prompt === 'tavern') return true;
  1139 |     if (!town.approach) return false;
  1140 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1141 |   }
  1142 |   row.notes.push('could not reach the tavern in 70 steps');
  1143 |   return false;
  1144 | }
  1145 | 
```