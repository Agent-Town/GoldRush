# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e8-eclipse.spec.ts >> e8-eclipse plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:764:5

# Error details

```
Error: secures: runState=dead at wave 16 / 487.5s sim, 674 kills, 0 gold; timed regolith, post-eclipse work and dome/rim builds not proved

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
        - generic: Wrecking crew sighted - west ridge.
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 08:07
      - generic:
        - generic: Wave
        - strong: "16"
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
        - generic [ref=e9]: 07:56 - Gathered 8 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "24"
        - strong: 140 / 196 XP
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
          - definition [ref=e22]: 08:07
        - generic [ref=e23]:
          - term [ref=e24]: Claim Jumpers Turned Back
          - definition [ref=e25]: "674"
        - generic [ref=e26]:
          - term [ref=e27]: Waves Survived
          - definition [ref=e28]: "16"
        - generic [ref=e29]:
          - term [ref=e30]: Gold Panned
          - definition [ref=e31]: "145"
        - generic [ref=e32]:
          - term [ref=e33]: Gold Sluiced
          - definition [ref=e34]: "0"
        - generic [ref=e35]:
          - term [ref=e36]: Stolen / Reclaimed
          - definition [ref=e37]: 0 / 0
        - generic [ref=e38]:
          - term [ref=e39]: Spent
          - definition [ref=e40]: "145"
        - generic [ref=e41]:
          - term [ref=e42]: Beacons Built
          - definition [ref=e43]: "1"
        - generic [ref=e44]:
          - term [ref=e45]: Buildings Built / Lost / Repaired
          - definition [ref=e46]: 3 / 0 / 0
        - generic [ref=e47]:
          - term [ref=e48]: Spark / Blast Damage
          - definition [ref=e49]: 34492 / 0
        - generic [ref=e50]:
          - term [ref=e51]: Blast Toggles
          - definition [ref=e52]: "0"
        - generic [ref=e53]:
          - term [ref=e54]: Blast Charge Time
          - definition [ref=e55]: 00:00
        - generic [ref=e56]:
          - term [ref=e57]: Upgrades Taken
          - definition [ref=e58]: blast 3 · damage 3 · firerate 3 · mobility 3 · plating 3 · beacon 2 · range 2 · volley 2 · panning 1 · prospecting 1
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
  1079 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  1080 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  1081 |         }
  1082 |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  1083 |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  1084 |         }
  1085 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1086 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1087 |         }
  1088 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1089 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1090 |         }
  1091 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1092 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1093 |         }
  1094 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1095 | 
  1096 |         if (sawOverlay) {
  1097 |           try {
  1098 | 
  1099 |             const before = initialScores;
  1100 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1101 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1102 |             const scores = await readScores(page);
  1103 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1104 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1105 |             row.banks = banked
  1106 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1107 |               : fail(
  1108 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1109 |                 );
  1110 |           } catch (error) {
  1111 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1112 |           }
  1113 |         } else {
  1114 |           row.banks = fail('skipped: never secured');
  1115 |         }
  1116 | 
  1117 |         if (row.banks.ok) {
  1118 |           try {
  1119 |             for (let card = 0; card < 2; card += 1) {
  1120 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1121 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1122 |                 await page.waitForTimeout(250);
  1123 |               }
  1124 |             }
  1125 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1126 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1127 |             row.board = pass('the Book is on screen straight off the run ledger');
  1128 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1129 |           } catch (error) {
  1130 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1131 |           }
  1132 |         } else {
  1133 |           row.board = fail('skipped: never banked');
  1134 |         }
  1135 | 
  1136 |         if (row.banks.ok) {
  1137 |           try {
  1138 |             const before = await rawScores(page);
  1139 |             await page.goto('/');
  1140 |             await page.waitForLoadState('domcontentloaded');
  1141 |             const after = await rawScores(page);
  1142 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1143 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1144 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1145 |             const reachedTavern = await walkToTavern(page, row);
  1146 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1147 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1148 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1149 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1150 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1151 |           } catch (error) {
  1152 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1153 |           }
  1154 |         } else {
  1155 |           row.reload = fail('skipped: never banked');
  1156 |         }
  1157 | 
  1158 |         row.clean =
  1159 |           consoleErrors.length === 0 && pageErrors.length === 0
  1160 |             ? pass('0 console, 0 page')
  1161 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1162 |       } finally {
  1163 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1164 |         if (row.finalSnapshot) {
  1165 |           row.objective = row.finalSnapshot.objective;
  1166 |           if (!row.banks.ok) {
  1167 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1168 |             row.simAtEnd = row.finalSnapshot.sim;
  1169 |             row.hpAtEnd = row.finalSnapshot.hp;
  1170 |             row.goldAtEnd = row.finalSnapshot.gold;
  1171 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1172 |           }
  1173 |         }
  1174 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1175 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1176 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1177 |       }
  1178 | 
> 1179 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 16 / 487.5s sim, 674 kills, 0 gold; timed regolith, post-eclipse work and dome/rim builds not proved
  1180 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1181 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1182 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1183 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1184 |     });
  1185 | }
  1186 | 
  1187 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1188 | 
  1189 | async function rawScores(page: Page): Promise<string | null> {
  1190 |   return page.evaluate(
  1191 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1192 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1193 |   );
  1194 | }
  1195 | 
  1196 | async function readScores(page: Page): Promise<Score[]> {
  1197 |   const raw = await rawScores(page);
  1198 |   try {
  1199 |     const parsed = JSON.parse(raw ?? '[]');
  1200 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1201 |   } catch {
  1202 |     return [];
  1203 |   }
  1204 | }
  1205 | 
  1206 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1207 |   for (let step = 0; step < 70; step += 1) {
  1208 |     const town = await page
  1209 |       .evaluate(() => {
  1210 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1211 |         if (!d) return null;
  1212 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1213 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1214 |       })
  1215 |       .catch(() => null);
  1216 |     if (!town) return false;
  1217 |     if (town.prompt === 'tavern') return true;
  1218 |     if (!town.approach) return false;
  1219 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1220 |   }
  1221 |   row.notes.push('could not reach the tavern in 70 steps');
  1222 |   return false;
  1223 | }
  1224 | 
```