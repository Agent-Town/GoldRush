# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e9-old-canal.spec.ts >> e9-old-canal plays to its secure wave, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:811:5

# Error details

```
Error: secures: runState=dead at wave 18 / 540.4s sim, 782 kills, 15 gold

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - generic:
    - generic: Wave 17 ledgered ✓
    - generic "Wave status":
      - generic:
        - generic: Beacon coils hum eastward!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 09:00
      - generic:
        - generic: Wave
        - strong: "18"
    - region "Gold pouch":
      - strong: "15"
    - region "Active weapon":
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 08:54 - Gathered 24 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "27"
        - strong: 72 / 220 XP
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
          - definition [ref=e27]: 09:00
        - generic [ref=e28]:
          - term [ref=e29]: Claim Jumpers Turned Back
          - definition [ref=e30]: "782"
        - generic [ref=e31]:
          - term [ref=e32]: Waves Survived
          - definition [ref=e33]: "18"
        - generic [ref=e34]:
          - term [ref=e35]: Gold Panned
          - definition [ref=e36]: "475"
        - generic [ref=e37]:
          - term [ref=e38]: Gold Sluiced
          - definition [ref=e39]: "0"
        - generic [ref=e40]:
          - term [ref=e41]: Stolen / Reclaimed
          - definition [ref=e42]: 0 / 0
        - generic [ref=e43]:
          - term [ref=e44]: Spent
          - definition [ref=e45]: "460"
        - generic [ref=e46]:
          - term [ref=e47]: Beacons Built
          - definition [ref=e48]: "5"
        - generic [ref=e49]:
          - term [ref=e50]: Buildings Built / Lost / Repaired
          - definition [ref=e51]: 8 / 8 / 1
        - generic [ref=e52]:
          - term [ref=e53]: Spark / Blast Damage
          - definition [ref=e54]: 30388 / 0
        - generic [ref=e55]:
          - term [ref=e56]: Blast Toggles
          - definition [ref=e57]: "0"
        - generic [ref=e58]:
          - term [ref=e59]: Blast Charge Time
          - definition [ref=e60]: 00:00
        - generic [ref=e61]:
          - term [ref=e62]: Upgrades Taken
          - definition [ref=e63]: blast 6 · damage 3 · firerate 3 · mobility 3 · plating 3 · beacon 2 · range 2 · volley 2 · panning 1 · prospecting 1
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
  1209 |         if (contract.id === 'e3-blackout-ridge' && !['capacitor-west', 'capacitor-east'].every(id => (row.powerBanksPeak[id] ?? 0) > 0)) {
  1210 |           row.secures = fail(`${row.secures.detail}; authored banks not both observed storing current: ${JSON.stringify(row.powerBanksPeak)}`);
  1211 |         }
  1212 |         if (contract.id === 'e3-fairground' && (!atSecure?.fairground?.spinning || !atSecure?.crowdFlocks?.allCrossed)) {
  1213 |           row.secures = fail(`${row.secures.detail}; wheel and all three flock crossings not proved`);
  1214 |         }
  1215 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1216 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1217 |         }
  1218 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1219 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1220 |         }
  1221 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1222 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1223 |         }
  1224 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1225 | 
  1226 |         if (sawOverlay) {
  1227 |           try {
  1228 | 
  1229 |             const before = initialScores;
  1230 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1231 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1232 |             const scores = await readScores(page);
  1233 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1234 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1235 |             row.banks = banked
  1236 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1237 |               : fail(
  1238 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1239 |                 );
  1240 |           } catch (error) {
  1241 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1242 |           }
  1243 |         } else {
  1244 |           row.banks = fail('skipped: never secured');
  1245 |         }
  1246 | 
  1247 |         if (row.banks.ok) {
  1248 |           try {
  1249 |             for (let card = 0; card < 2; card += 1) {
  1250 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1251 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1252 |                 await page.waitForTimeout(250);
  1253 |               }
  1254 |             }
  1255 |             await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1256 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1257 |             row.board = pass('the Book is on screen straight off the run ledger');
  1258 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1259 |           } catch (error) {
  1260 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1261 |           }
  1262 |         } else {
  1263 |           row.board = fail('skipped: never banked');
  1264 |         }
  1265 | 
  1266 |         if (row.banks.ok) {
  1267 |           try {
  1268 |             const before = await rawScores(page);
  1269 |             await page.goto('/');
  1270 |             await page.waitForLoadState('domcontentloaded');
  1271 |             const after = await rawScores(page);
  1272 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1273 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1274 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1275 |             const reachedTavern = await walkToTavern(page, row);
  1276 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1277 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1278 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1279 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1280 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1281 |           } catch (error) {
  1282 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1283 |           }
  1284 |         } else {
  1285 |           row.reload = fail('skipped: never banked');
  1286 |         }
  1287 | 
  1288 |         row.clean =
  1289 |           consoleErrors.length === 0 && pageErrors.length === 0
  1290 |             ? pass('0 console, 0 page')
  1291 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1292 |       } finally {
  1293 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1294 |         if (row.finalSnapshot) {
  1295 |           row.objective = row.finalSnapshot.objective;
  1296 |           if (!row.banks.ok) {
  1297 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1298 |             row.simAtEnd = row.finalSnapshot.sim;
  1299 |             row.hpAtEnd = row.finalSnapshot.hp;
  1300 |             row.goldAtEnd = row.finalSnapshot.gold;
  1301 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1302 |           }
  1303 |         }
  1304 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1305 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1306 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1307 |       }
  1308 | 
> 1309 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 18 / 540.4s sim, 782 kills, 15 gold
  1310 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1311 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1312 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1313 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1314 |     });
  1315 | }
  1316 | 
  1317 | type Score = { contractId?: string; secured?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1318 | 
  1319 | async function rawScores(page: Page): Promise<string | null> {
  1320 |   return page.evaluate(
  1321 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1322 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1323 |   );
  1324 | }
  1325 | 
  1326 | async function readScores(page: Page): Promise<Score[]> {
  1327 |   const raw = await rawScores(page);
  1328 |   try {
  1329 |     const parsed = JSON.parse(raw ?? '[]');
  1330 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1331 |   } catch {
  1332 |     return [];
  1333 |   }
  1334 | }
  1335 | 
  1336 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1337 |   for (let step = 0; step < 70; step += 1) {
  1338 |     const town = await page
  1339 |       .evaluate(() => {
  1340 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1341 |         if (!d) return null;
  1342 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1343 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1344 |       })
  1345 |       .catch(() => null);
  1346 |     if (!town) return false;
  1347 |     if (town.prompt === 'tavern') return true;
  1348 |     if (!town.approach) return false;
  1349 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1350 |   }
  1351 |   row.notes.push('could not reach the tavern in 70 steps');
  1352 |   return false;
  1353 | }
  1354 | 
```