# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e8-low-orbit.spec.ts >> e8-low-orbit plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:753:5

# Error details

```
Error: secures: runState=dead at wave 14 / 427.3s sim, 554 kills, 50 gold

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
        - strong: 07:07
      - generic:
        - generic: Wave
        - strong: "14"
    - region "Gold pouch":
      - strong: "50"
    - region "Suit air 40 of 60 seconds, draining":
      - generic: Air
      - strong: 40s
    - region "Active weapon":
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 07:00 - Gathered 32 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "22"
        - strong: 28 / 180 XP
    - region "Build":
      - button "Build" [ref=e12]
    - button "Pause the claim" [ref=e13]: catch your breathⅡ
    - generic: Swipe to scroll
  - generic:
    - button [ref=e16]: Rotate
    - button [ref=e17]: Weapon
    - button [ref=e18]: OK
  - region "Run ledger" [ref=e19]:
    - generic [ref=e20]:
      - paragraph [ref=e21]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e22]
      - paragraph [ref=e23]: The claim was overrun. The gold remembers.
      - generic [ref=e24]:
        - generic [ref=e25]:
          - term [ref=e26]: Time Held
          - definition [ref=e27]: 07:07
        - generic [ref=e28]:
          - term [ref=e29]: Claim Jumpers Turned Back
          - definition [ref=e30]: "554"
        - generic [ref=e31]:
          - term [ref=e32]: Waves Survived
          - definition [ref=e33]: "14"
        - generic [ref=e34]:
          - term [ref=e35]: Gold Panned
          - definition [ref=e36]: "230"
        - generic [ref=e37]:
          - term [ref=e38]: Gold Sluiced
          - definition [ref=e39]: "0"
        - generic [ref=e40]:
          - term [ref=e41]: Stolen / Reclaimed
          - definition [ref=e42]: 0 / 0
        - generic [ref=e43]:
          - term [ref=e44]: Spent
          - definition [ref=e45]: "180"
        - generic [ref=e46]:
          - term [ref=e47]: Beacons Built
          - definition [ref=e48]: "2"
        - generic [ref=e49]:
          - term [ref=e50]: Buildings Built / Lost / Repaired
          - definition [ref=e51]: 4 / 0 / 0
        - generic [ref=e52]:
          - term [ref=e53]: Spark / Blast Damage
          - definition [ref=e54]: 19296 / 0
        - generic [ref=e55]:
          - term [ref=e56]: Blast Toggles
          - definition [ref=e57]: "0"
        - generic [ref=e58]:
          - term [ref=e59]: Blast Charge Time
          - definition [ref=e60]: 00:00
        - generic [ref=e61]:
          - term [ref=e62]: Upgrades Taken
          - definition [ref=e63]: blast 4 · damage 3 · firerate 3 · mobility 3 · plating 3 · range 2 · volley 2 · prospecting 1
      - paragraph [ref=e64]: "Epoch science complete: the Red Fields awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +979 toward the Red Fields"
      - paragraph [ref=e65]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e66]:
        - paragraph [ref=e67]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e68]
        - generic [ref=e69]:
          - 'button "1 Advances crafting-agent Vacuum Lenses Effect: Unlocks the Vacuum Lens beam and lobber: 9 beam damage and 28 burst damage. EVERY RUN" [active] [ref=e70]':
            - generic [ref=e71]: "1"
            - generic [ref=e72]: Advances crafting-agent
            - strong [ref=e73]: Vacuum Lenses
            - generic [ref=e74]: "Effect: Unlocks the Vacuum Lens beam and lobber: 9 beam damage and 28 burst damage."
            - generic [ref=e76]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [ref=e77]':
            - generic [ref=e78]: "2"
            - generic [ref=e79]: Advances crafting-agent
            - strong [ref=e80]: "Continued Study: Seam Yield"
            - generic [ref=e81]: "Effect: +1% seam panning yield."
            - generic [ref=e83]: EVERY RUN
        - paragraph [ref=e84]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e85]:
        - heading "Best Claims" [level=2] [ref=e86]
        - list [ref=e87]:
          - listitem [ref=e88]:
            - generic [ref=e89]: wave 30 · baseless
            - strong [ref=e90]: SECURED
            - generic [ref=e91]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e92]:
            - generic [ref=e93]: wave 30 · baseless
            - strong [ref=e94]: SECURED
            - generic [ref=e95]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e96]:
            - generic [ref=e97]: wave 30 · baseless
            - strong [ref=e98]: SECURED
            - generic [ref=e99]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e100]:
            - generic [ref=e101]: wave 30 · baseless
            - strong [ref=e102]: SECURED
            - generic [ref=e103]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e104]:
            - generic [ref=e105]: wave 30 · baseless
            - strong [ref=e106]: SECURED
            - generic [ref=e107]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
      - generic [ref=e108]:
        - button "Keep this tape" [ref=e109]
        - button "Return to Town" [ref=e110]
        - button "Try Again" [ref=e111]
```

# Test source

```ts
  1061 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  1062 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  1063 |         }
  1064 |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  1065 |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  1066 |         }
  1067 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1068 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1069 |         }
  1070 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1071 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1072 |         }
  1073 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1074 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1075 |         }
  1076 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1077 | 
  1078 |         if (sawOverlay) {
  1079 |           try {
  1080 | 
  1081 |             const before = initialScores;
  1082 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1083 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1084 |             const scores = await readScores(page);
  1085 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1086 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1087 |             row.banks = banked
  1088 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1089 |               : fail(
  1090 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1091 |                 );
  1092 |           } catch (error) {
  1093 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1094 |           }
  1095 |         } else {
  1096 |           row.banks = fail('skipped: never secured');
  1097 |         }
  1098 | 
  1099 |         if (row.banks.ok) {
  1100 |           try {
  1101 |             for (let card = 0; card < 2; card += 1) {
  1102 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1103 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1104 |                 await page.waitForTimeout(250);
  1105 |               }
  1106 |             }
  1107 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1108 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1109 |             row.board = pass('the Book is on screen straight off the run ledger');
  1110 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1111 |           } catch (error) {
  1112 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1113 |           }
  1114 |         } else {
  1115 |           row.board = fail('skipped: never banked');
  1116 |         }
  1117 | 
  1118 |         if (row.banks.ok) {
  1119 |           try {
  1120 |             const before = await rawScores(page);
  1121 |             await page.goto('/');
  1122 |             await page.waitForLoadState('domcontentloaded');
  1123 |             const after = await rawScores(page);
  1124 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1125 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1126 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1127 |             const reachedTavern = await walkToTavern(page, row);
  1128 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1129 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1130 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1131 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1132 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1133 |           } catch (error) {
  1134 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1135 |           }
  1136 |         } else {
  1137 |           row.reload = fail('skipped: never banked');
  1138 |         }
  1139 | 
  1140 |         row.clean =
  1141 |           consoleErrors.length === 0 && pageErrors.length === 0
  1142 |             ? pass('0 console, 0 page')
  1143 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1144 |       } finally {
  1145 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1146 |         if (row.finalSnapshot) {
  1147 |           row.objective = row.finalSnapshot.objective;
  1148 |           if (!row.banks.ok) {
  1149 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1150 |             row.simAtEnd = row.finalSnapshot.sim;
  1151 |             row.hpAtEnd = row.finalSnapshot.hp;
  1152 |             row.goldAtEnd = row.finalSnapshot.gold;
  1153 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1154 |           }
  1155 |         }
  1156 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1157 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1158 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1159 |       }
  1160 | 
> 1161 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 14 / 427.3s sim, 554 kills, 50 gold
  1162 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1163 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1164 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1165 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1166 |     });
  1167 | }
  1168 | 
  1169 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1170 | 
  1171 | async function rawScores(page: Page): Promise<string | null> {
  1172 |   return page.evaluate(
  1173 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1174 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1175 |   );
  1176 | }
  1177 | 
  1178 | async function readScores(page: Page): Promise<Score[]> {
  1179 |   const raw = await rawScores(page);
  1180 |   try {
  1181 |     const parsed = JSON.parse(raw ?? '[]');
  1182 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1183 |   } catch {
  1184 |     return [];
  1185 |   }
  1186 | }
  1187 | 
  1188 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1189 |   for (let step = 0; step < 70; step += 1) {
  1190 |     const town = await page
  1191 |       .evaluate(() => {
  1192 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1193 |         if (!d) return null;
  1194 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1195 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1196 |       })
  1197 |       .catch(() => null);
  1198 |     if (!town) return false;
  1199 |     if (town.prompt === 'tavern') return true;
  1200 |     if (!town.approach) return false;
  1201 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1202 |   }
  1203 |   row.notes.push('could not reach the tavern in 70 steps');
  1204 |   return false;
  1205 | }
  1206 | 
```