# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e9-dome-basin.spec.ts >> e9-dome-basin plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:778:5

# Error details

```
Error: secures: runState=dead at wave 13 / 411.1s sim, 509 kills, 4 gold

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
        - generic: Wrecking crew sighted - north bank.
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 06:51
      - generic:
        - generic: Wave
        - strong: "13"
    - region "Gold pouch":
      - strong: "4"
    - region "Active weapon":
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 06:40 - Gathered 4 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "21"
        - strong: 24 / 172 XP
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
          - definition [ref=e27]: 06:51
        - generic [ref=e28]:
          - term [ref=e29]: Claim Jumpers Turned Back
          - definition [ref=e30]: "509"
        - generic [ref=e31]:
          - term [ref=e32]: Waves Survived
          - definition [ref=e33]: "13"
        - generic [ref=e34]:
          - term [ref=e35]: Gold Panned
          - definition [ref=e36]: "400"
        - generic [ref=e37]:
          - term [ref=e38]: Gold Sluiced
          - definition [ref=e39]: "0"
        - generic [ref=e40]:
          - term [ref=e41]: Stolen / Reclaimed
          - definition [ref=e42]: 0 / 0
        - generic [ref=e43]:
          - term [ref=e44]: Spent
          - definition [ref=e45]: "470"
        - generic [ref=e46]:
          - term [ref=e47]: Beacons Built
          - definition [ref=e48]: "5"
        - generic [ref=e49]:
          - term [ref=e50]: Buildings Built / Lost / Repaired
          - definition [ref=e51]: 8 / 10 / 2
        - generic [ref=e52]:
          - term [ref=e53]: Spark / Blast Damage
          - definition [ref=e54]: 24075 / 0
        - generic [ref=e55]:
          - term [ref=e56]: Blast Toggles
          - definition [ref=e57]: "0"
        - generic [ref=e58]:
          - term [ref=e59]: Blast Charge Time
          - definition [ref=e60]: 00:00
        - generic [ref=e61]:
          - term [ref=e62]: Upgrades Taken
          - definition [ref=e63]: blast 3 · damage 3 · firerate 3 · mobility 3 · plating 3 · range 2 · volley 2 · beacon 1
      - paragraph [ref=e64]: "Epoch science complete: the Deep Sky awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +977 toward the Deep Sky"
      - paragraph [ref=e65]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e66]:
        - paragraph [ref=e67]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e68]
        - generic [ref=e69]:
          - 'button "1 Advances crafting-agent Storm-Draw Effect: Unlocks Storm-Draw: 28 damage across 14m every 0.62s. EVERY RUN" [active] [ref=e70]':
            - generic [ref=e71]: "1"
            - generic [ref=e72]: Advances crafting-agent
            - strong [ref=e73]: Storm-Draw
            - generic [ref=e74]: "Effect: Unlocks Storm-Draw: 28 damage across 14m every 0.62s."
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
  1124 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  1125 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  1126 |         }
  1127 |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  1128 |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  1129 |         }
  1130 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1131 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1132 |         }
  1133 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1134 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1135 |         }
  1136 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1137 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1138 |         }
  1139 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1140 | 
  1141 |         if (sawOverlay) {
  1142 |           try {
  1143 | 
  1144 |             const before = initialScores;
  1145 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1146 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1147 |             const scores = await readScores(page);
  1148 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1149 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1150 |             row.banks = banked
  1151 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1152 |               : fail(
  1153 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1154 |                 );
  1155 |           } catch (error) {
  1156 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1157 |           }
  1158 |         } else {
  1159 |           row.banks = fail('skipped: never secured');
  1160 |         }
  1161 | 
  1162 |         if (row.banks.ok) {
  1163 |           try {
  1164 |             for (let card = 0; card < 2; card += 1) {
  1165 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1166 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1167 |                 await page.waitForTimeout(250);
  1168 |               }
  1169 |             }
  1170 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1171 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1172 |             row.board = pass('the Book is on screen straight off the run ledger');
  1173 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1174 |           } catch (error) {
  1175 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1176 |           }
  1177 |         } else {
  1178 |           row.board = fail('skipped: never banked');
  1179 |         }
  1180 | 
  1181 |         if (row.banks.ok) {
  1182 |           try {
  1183 |             const before = await rawScores(page);
  1184 |             await page.goto('/');
  1185 |             await page.waitForLoadState('domcontentloaded');
  1186 |             const after = await rawScores(page);
  1187 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1188 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1189 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1190 |             const reachedTavern = await walkToTavern(page, row);
  1191 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1192 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1193 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1194 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1195 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1196 |           } catch (error) {
  1197 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1198 |           }
  1199 |         } else {
  1200 |           row.reload = fail('skipped: never banked');
  1201 |         }
  1202 | 
  1203 |         row.clean =
  1204 |           consoleErrors.length === 0 && pageErrors.length === 0
  1205 |             ? pass('0 console, 0 page')
  1206 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1207 |       } finally {
  1208 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1209 |         if (row.finalSnapshot) {
  1210 |           row.objective = row.finalSnapshot.objective;
  1211 |           if (!row.banks.ok) {
  1212 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1213 |             row.simAtEnd = row.finalSnapshot.sim;
  1214 |             row.hpAtEnd = row.finalSnapshot.hp;
  1215 |             row.goldAtEnd = row.finalSnapshot.gold;
  1216 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1217 |           }
  1218 |         }
  1219 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1220 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1221 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1222 |       }
  1223 | 
> 1224 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 13 / 411.1s sim, 509 kills, 4 gold
  1225 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1226 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1227 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1228 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1229 |     });
  1230 | }
  1231 | 
  1232 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1233 | 
  1234 | async function rawScores(page: Page): Promise<string | null> {
  1235 |   return page.evaluate(
  1236 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1237 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1238 |   );
  1239 | }
  1240 | 
  1241 | async function readScores(page: Page): Promise<Score[]> {
  1242 |   const raw = await rawScores(page);
  1243 |   try {
  1244 |     const parsed = JSON.parse(raw ?? '[]');
  1245 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1246 |   } catch {
  1247 |     return [];
  1248 |   }
  1249 | }
  1250 | 
  1251 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1252 |   for (let step = 0; step < 70; step += 1) {
  1253 |     const town = await page
  1254 |       .evaluate(() => {
  1255 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1256 |         if (!d) return null;
  1257 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1258 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1259 |       })
  1260 |       .catch(() => null);
  1261 |     if (!town) return false;
  1262 |     if (town.prompt === 'tavern') return true;
  1263 |     if (!town.approach) return false;
  1264 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1265 |   }
  1266 |   row.notes.push('could not reach the tavern in 70 steps');
  1267 |   return false;
  1268 | }
  1269 | 
```