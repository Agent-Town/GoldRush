# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e9-seed-run.spec.ts >> e9-seed-run plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:780:5

# Error details

```
Error: secures: runState=dead at wave 13 / 399.9s sim, 468 kills, 50 gold

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
        - strong: 06:39
      - generic:
        - generic: Wave
        - strong: "13"
    - region "Gold pouch":
      - generic: Gold
      - strong: "50"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 06:33 - Gathered 48 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "20"
        - strong: 48 / 164 XP
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
          - definition [ref=e22]: 06:39
        - generic [ref=e23]:
          - term [ref=e24]: Claim Jumpers Turned Back
          - definition [ref=e25]: "468"
        - generic [ref=e26]:
          - term [ref=e27]: Waves Survived
          - definition [ref=e28]: "13"
        - generic [ref=e29]:
          - term [ref=e30]: Gold Panned
          - definition [ref=e31]: "195"
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
          - definition [ref=e46]: 3 / 3 / 0
        - generic [ref=e47]:
          - term [ref=e48]: Spark / Blast Damage
          - definition [ref=e49]: 25829 / 0
        - generic [ref=e50]:
          - term [ref=e51]: Blast Toggles
          - definition [ref=e52]: "0"
        - generic [ref=e53]:
          - term [ref=e54]: Blast Charge Time
          - definition [ref=e55]: 00:00
        - generic [ref=e56]:
          - term [ref=e57]: Upgrades Taken
          - definition [ref=e58]: damage 3 · firerate 3 · mobility 3 · plating 3 · blast 2 · range 2 · volley 2 · beacon 1
      - paragraph [ref=e59]: "Epoch science complete: the Deep Sky awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +977 toward the Deep Sky"
      - paragraph [ref=e60]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e61]:
        - paragraph [ref=e62]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e63]
        - generic [ref=e64]:
          - 'button "1 Advances crafting-agent Storm-Draw Effect: Unlocks Storm-Draw: 28 damage across 14m every 0.62s. EVERY RUN" [active] [ref=e65]':
            - generic [ref=e66]: "1"
            - generic [ref=e67]: Advances crafting-agent
            - strong [ref=e68]: Storm-Draw
            - generic [ref=e69]: "Effect: Unlocks Storm-Draw: 28 damage across 14m every 0.62s."
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
  1148 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  1149 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  1150 |         }
  1151 |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  1152 |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  1153 |         }
  1154 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1155 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1156 |         }
  1157 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1158 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1159 |         }
  1160 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1161 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1162 |         }
  1163 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1164 | 
  1165 |         if (sawOverlay) {
  1166 |           try {
  1167 | 
  1168 |             const before = initialScores;
  1169 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1170 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1171 |             const scores = await readScores(page);
  1172 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1173 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1174 |             row.banks = banked
  1175 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1176 |               : fail(
  1177 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1178 |                 );
  1179 |           } catch (error) {
  1180 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1181 |           }
  1182 |         } else {
  1183 |           row.banks = fail('skipped: never secured');
  1184 |         }
  1185 | 
  1186 |         if (row.banks.ok) {
  1187 |           try {
  1188 |             for (let card = 0; card < 2; card += 1) {
  1189 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1190 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1191 |                 await page.waitForTimeout(250);
  1192 |               }
  1193 |             }
  1194 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1195 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1196 |             row.board = pass('the Book is on screen straight off the run ledger');
  1197 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1198 |           } catch (error) {
  1199 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1200 |           }
  1201 |         } else {
  1202 |           row.board = fail('skipped: never banked');
  1203 |         }
  1204 | 
  1205 |         if (row.banks.ok) {
  1206 |           try {
  1207 |             const before = await rawScores(page);
  1208 |             await page.goto('/');
  1209 |             await page.waitForLoadState('domcontentloaded');
  1210 |             const after = await rawScores(page);
  1211 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1212 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1213 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1214 |             const reachedTavern = await walkToTavern(page, row);
  1215 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1216 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1217 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1218 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1219 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1220 |           } catch (error) {
  1221 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1222 |           }
  1223 |         } else {
  1224 |           row.reload = fail('skipped: never banked');
  1225 |         }
  1226 | 
  1227 |         row.clean =
  1228 |           consoleErrors.length === 0 && pageErrors.length === 0
  1229 |             ? pass('0 console, 0 page')
  1230 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1231 |       } finally {
  1232 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1233 |         if (row.finalSnapshot) {
  1234 |           row.objective = row.finalSnapshot.objective;
  1235 |           if (!row.banks.ok) {
  1236 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1237 |             row.simAtEnd = row.finalSnapshot.sim;
  1238 |             row.hpAtEnd = row.finalSnapshot.hp;
  1239 |             row.goldAtEnd = row.finalSnapshot.gold;
  1240 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1241 |           }
  1242 |         }
  1243 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1244 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1245 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1246 |       }
  1247 | 
> 1248 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 13 / 399.9s sim, 468 kills, 50 gold
  1249 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1250 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1251 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1252 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1253 |     });
  1254 | }
  1255 | 
  1256 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1257 | 
  1258 | async function rawScores(page: Page): Promise<string | null> {
  1259 |   return page.evaluate(
  1260 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1261 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1262 |   );
  1263 | }
  1264 | 
  1265 | async function readScores(page: Page): Promise<Score[]> {
  1266 |   const raw = await rawScores(page);
  1267 |   try {
  1268 |     const parsed = JSON.parse(raw ?? '[]');
  1269 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1270 |   } catch {
  1271 |     return [];
  1272 |   }
  1273 | }
  1274 | 
  1275 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1276 |   for (let step = 0; step < 70; step += 1) {
  1277 |     const town = await page
  1278 |       .evaluate(() => {
  1279 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1280 |         if (!d) return null;
  1281 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1282 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1283 |       })
  1284 |       .catch(() => null);
  1285 |     if (!town) return false;
  1286 |     if (town.prompt === 'tavern') return true;
  1287 |     if (!town.approach) return false;
  1288 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1289 |   }
  1290 |   row.notes.push('could not reach the tavern in 70 steps');
  1291 |   return false;
  1292 | }
  1293 | 
```