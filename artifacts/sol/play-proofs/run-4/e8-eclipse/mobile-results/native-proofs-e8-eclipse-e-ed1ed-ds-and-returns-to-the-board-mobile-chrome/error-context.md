# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e8-eclipse.spec.ts >> e8-eclipse plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:766:5

# Error details

```
Error: secures: runState=dead at wave 13 / 391.9s sim, 476 kills, 5 gold; timed regolith, post-eclipse work and dome/rim builds not proved

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - generic:
    - generic: Wave 12 ledgered ✓
    - generic "Wave status":
      - generic:
        - generic: Brass warning on the west ridge!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 06:31
      - generic:
        - generic: Wave
        - strong: "13"
    - region "Gold pouch":
      - strong: "5"
    - region "Suit air 0 of 60 seconds, empty":
      - generic: Air
      - strong: 0s
    - region "Build":
      - generic [ref=e4]:
        - generic [ref=e5]:
          - status [ref=e6]:
            - strong [ref=e7]: Sluice Works
            - generic [ref=e8]: "Works the river for you: 3g per cycle beside water. T1: 3g every 5s"
          - menuitem "1 Sentry Beacon 2/6 - 45g" [disabled] [ref=e9]:
            - generic [ref=e11]:
              - text: "1"
              - generic [ref=e12]: Sentry Beacon
              - text: 2/6 - 45g
          - 'menuitem "2 Palisade 0/48 - 0g Palisade kit: 8 free" [ref=e13]':
            - generic [ref=e15]:
              - text: "2"
              - generic [ref=e16]: Palisade
              - generic [ref=e17]:
                - text: 0/48 - 0g
                - text: "Palisade kit: 8 free"
          - menuitem "3 Sluice Works 0/3 - 40g" [disabled] [ref=e18]:
            - generic [ref=e20]:
              - text: "3"
              - generic [ref=e21]: Sluice Works
              - text: 0/3 - 40g
          - menuitem "4 Stockpile Yard 0/2 - 60g" [disabled] [ref=e22]:
            - generic [ref=e24]:
              - text: "4"
              - generic [ref=e25]: Stockpile Yard
              - text: 0/2 - 60g
          - menuitem "5 Signal Turret 2/4 - 95g" [disabled] [ref=e26]:
            - generic [ref=e28]:
              - text: "5"
              - generic [ref=e29]: Signal Turret
              - text: 2/4 - 95g
          - menuitem "6 Assay Office 0/1 - 80g" [disabled] [ref=e30]:
            - generic [ref=e32]:
              - text: "6"
              - generic [ref=e33]: Assay Office
              - text: 0/1 - 80g
        - button "Build - Close" [expanded] [pressed] [ref=e34]
    - text: Ⅱ
    - text: Swipe to scroll
  - generic:
    - button [ref=e37]: Rotate
    - button [ref=e38]: Weapon
    - button [ref=e39]: OK
  - region "Run ledger" [ref=e40]:
    - generic [ref=e41]:
      - paragraph [ref=e42]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e43]
      - paragraph [ref=e44]: The claim was overrun. The gold remembers.
      - generic [ref=e45]:
        - generic [ref=e46]:
          - term [ref=e47]: Time Held
          - definition [ref=e48]: 06:31
        - generic [ref=e49]:
          - term [ref=e50]: Claim Jumpers Turned Back
          - definition [ref=e51]: "476"
        - generic [ref=e52]:
          - term [ref=e53]: Waves Survived
          - definition [ref=e54]: "13"
        - generic [ref=e55]:
          - term [ref=e56]: Gold Panned
          - definition [ref=e57]: "185"
        - generic [ref=e58]:
          - term [ref=e59]: Gold Sluiced
          - definition [ref=e60]: "0"
        - generic [ref=e61]:
          - term [ref=e62]: Stolen / Reclaimed
          - definition [ref=e63]: 0 / 0
        - generic [ref=e64]:
          - term [ref=e65]: Spent
          - definition [ref=e66]: "180"
        - generic [ref=e67]:
          - term [ref=e68]: Beacons Built
          - definition [ref=e69]: "2"
        - generic [ref=e70]:
          - term [ref=e71]: Buildings Built / Lost / Repaired
          - definition [ref=e72]: 4 / 0 / 0
        - generic [ref=e73]:
          - term [ref=e74]: Spark / Blast Damage
          - definition [ref=e75]: 21504 / 0
        - generic [ref=e76]:
          - term [ref=e77]: Blast Toggles
          - definition [ref=e78]: "0"
        - generic [ref=e79]:
          - term [ref=e80]: Blast Charge Time
          - definition [ref=e81]: 00:00
        - generic [ref=e82]:
          - term [ref=e83]: Upgrades Taken
          - definition [ref=e84]: damage 3 · firerate 3 · mobility 3 · plating 3 · blast 2 · range 2 · volley 2 · beacon 1
      - paragraph [ref=e85]: "Epoch science complete: the Red Fields awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +979 toward the Red Fields"
      - paragraph [ref=e86]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e87]:
        - paragraph [ref=e88]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e89]
        - generic [ref=e90]:
          - 'button "1 Advances crafting-agent Vacuum Lenses Effect: Unlocks the Vacuum Lens beam and lobber: 9 beam damage and 28 burst damage. EVERY RUN" [active] [ref=e91]':
            - generic [ref=e92]: "1"
            - generic [ref=e93]: Advances crafting-agent
            - strong [ref=e94]: Vacuum Lenses
            - generic [ref=e95]: "Effect: Unlocks the Vacuum Lens beam and lobber: 9 beam damage and 28 burst damage."
            - generic [ref=e97]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [ref=e98]':
            - generic [ref=e99]: "2"
            - generic [ref=e100]: Advances crafting-agent
            - strong [ref=e101]: "Continued Study: Seam Yield"
            - generic [ref=e102]: "Effect: +1% seam panning yield."
            - generic [ref=e104]: EVERY RUN
        - paragraph [ref=e105]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e106]:
        - heading "Best Claims" [level=2] [ref=e107]
        - list [ref=e108]:
          - listitem [ref=e109]:
            - generic [ref=e110]: wave 30 · baseless
            - strong [ref=e111]: SECURED
            - generic [ref=e112]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e113]:
            - generic [ref=e114]: wave 30 · baseless
            - strong [ref=e115]: SECURED
            - generic [ref=e116]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e117]:
            - generic [ref=e118]: wave 30 · baseless
            - strong [ref=e119]: SECURED
            - generic [ref=e120]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e121]:
            - generic [ref=e122]: wave 30 · baseless
            - strong [ref=e123]: SECURED
            - generic [ref=e124]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e125]:
            - generic [ref=e126]: wave 30 · baseless
            - strong [ref=e127]: SECURED
            - generic [ref=e128]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
      - generic [ref=e129]:
        - button "Keep this tape" [ref=e130]
        - button "Return to Town" [ref=e131]
        - button "Try Again" [ref=e132]
```

# Test source

```ts
  1081 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  1082 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  1083 |         }
  1084 |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  1085 |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  1086 |         }
  1087 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1088 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1089 |         }
  1090 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1091 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1092 |         }
  1093 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1094 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1095 |         }
  1096 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1097 | 
  1098 |         if (sawOverlay) {
  1099 |           try {
  1100 | 
  1101 |             const before = initialScores;
  1102 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1103 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1104 |             const scores = await readScores(page);
  1105 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1106 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1107 |             row.banks = banked
  1108 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1109 |               : fail(
  1110 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1111 |                 );
  1112 |           } catch (error) {
  1113 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1114 |           }
  1115 |         } else {
  1116 |           row.banks = fail('skipped: never secured');
  1117 |         }
  1118 | 
  1119 |         if (row.banks.ok) {
  1120 |           try {
  1121 |             for (let card = 0; card < 2; card += 1) {
  1122 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1123 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1124 |                 await page.waitForTimeout(250);
  1125 |               }
  1126 |             }
  1127 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1128 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1129 |             row.board = pass('the Book is on screen straight off the run ledger');
  1130 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1131 |           } catch (error) {
  1132 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1133 |           }
  1134 |         } else {
  1135 |           row.board = fail('skipped: never banked');
  1136 |         }
  1137 | 
  1138 |         if (row.banks.ok) {
  1139 |           try {
  1140 |             const before = await rawScores(page);
  1141 |             await page.goto('/');
  1142 |             await page.waitForLoadState('domcontentloaded');
  1143 |             const after = await rawScores(page);
  1144 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1145 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1146 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1147 |             const reachedTavern = await walkToTavern(page, row);
  1148 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1149 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1150 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1151 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1152 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1153 |           } catch (error) {
  1154 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1155 |           }
  1156 |         } else {
  1157 |           row.reload = fail('skipped: never banked');
  1158 |         }
  1159 | 
  1160 |         row.clean =
  1161 |           consoleErrors.length === 0 && pageErrors.length === 0
  1162 |             ? pass('0 console, 0 page')
  1163 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1164 |       } finally {
  1165 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1166 |         if (row.finalSnapshot) {
  1167 |           row.objective = row.finalSnapshot.objective;
  1168 |           if (!row.banks.ok) {
  1169 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1170 |             row.simAtEnd = row.finalSnapshot.sim;
  1171 |             row.hpAtEnd = row.finalSnapshot.hp;
  1172 |             row.goldAtEnd = row.finalSnapshot.gold;
  1173 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1174 |           }
  1175 |         }
  1176 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1177 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1178 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1179 |       }
  1180 | 
> 1181 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 13 / 391.9s sim, 476 kills, 5 gold; timed regolith, post-eclipse work and dome/rim builds not proved
  1182 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1183 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1184 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1185 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1186 |     });
  1187 | }
  1188 | 
  1189 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1190 | 
  1191 | async function rawScores(page: Page): Promise<string | null> {
  1192 |   return page.evaluate(
  1193 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1194 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1195 |   );
  1196 | }
  1197 | 
  1198 | async function readScores(page: Page): Promise<Score[]> {
  1199 |   const raw = await rawScores(page);
  1200 |   try {
  1201 |     const parsed = JSON.parse(raw ?? '[]');
  1202 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1203 |   } catch {
  1204 |     return [];
  1205 |   }
  1206 | }
  1207 | 
  1208 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1209 |   for (let step = 0; step < 70; step += 1) {
  1210 |     const town = await page
  1211 |       .evaluate(() => {
  1212 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1213 |         if (!d) return null;
  1214 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1215 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1216 |       })
  1217 |       .catch(() => null);
  1218 |     if (!town) return false;
  1219 |     if (town.prompt === 'tavern') return true;
  1220 |     if (!town.approach) return false;
  1221 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1222 |   }
  1223 |   row.notes.push('could not reach the tavern in 70 steps');
  1224 |   return false;
  1225 | }
  1226 | 
```