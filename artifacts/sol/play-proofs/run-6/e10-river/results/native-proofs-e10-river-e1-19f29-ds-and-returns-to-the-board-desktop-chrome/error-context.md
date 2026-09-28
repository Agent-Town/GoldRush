# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e10-river.spec.ts >> e10-river plays to its authored terminal, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:812:5

# Error details

```
Error: banks: no new secured/completed score for e10-river after the authored pan; no terminal bank action. Score rows before=42, after pan=42; active lineage=the-claim

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - region "Town square":
    - generic:
      - generic:
        - strong: Quartz Hill
        - generic: Town Square
      - generic [ref=e4]:
        - group [ref=e5]:
          - generic "Settings" [ref=e6] [cursor=pointer]
        - button "Exit" [ref=e7] [cursor=pointer]
    - region "Tavern contract board" [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]:
            - paragraph [ref=e12]: Tavern Ledger
            - heading "The Book" [level=2] [ref=e13]
            - button "Open every claim" [ref=e14] [cursor=pointer]
          - button "Back" [ref=e15] [cursor=pointer]
        - generic [ref=e16]:
          - button "Previous chapter" [disabled] [ref=e17]: ‹
          - generic [ref=e18]:
            - generic [ref=e19]:
              - generic [ref=e20]:
                - generic [ref=e21]:
                  - paragraph [ref=e22]: Chapter 1
                  - heading "Frontier" [level=3] [ref=e23]
                - generic [ref=e24]: 5 claims
              - generic [ref=e25]:
                - article "The Claim, page 1 of 5" [ref=e26]:
                  - figure [ref=e27]
                  - generic [ref=e28]:
                    - generic [ref=e29]:
                      - generic [ref=e30]: Trail
                      - generic [ref=e31]: Open
                    - heading "The Claim" [level=3] [ref=e32]
                    - paragraph [ref=e33]: The classic river claim.
                    - generic [ref=e34]:
                      - paragraph [ref=e35]: "This claim speaks: hero orders, the river, water crossings."
                      - generic [ref=e36]:
                        - paragraph [ref=e37]: Goals
                        - list [ref=e38]:
                          - listitem [ref=e39]: Survive through wave 10.
                      - generic [ref=e40]:
                        - paragraph [ref=e41]: Rules
                        - list [ref=e42]:
                          - listitem [ref=e43]: The river splits the claim around one center ford.
                          - listitem [ref=e44]: Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.
                    - paragraph [ref=e45]: "Secured: wave 30, 400 gold"
                    - button "Launch" [active] [ref=e46] [cursor=pointer]
                - article "The Dry Gulch, page 2 of 5" [ref=e47]:
                  - figure [ref=e48]
                  - generic [ref=e49]:
                    - generic [ref=e50]:
                      - generic [ref=e51]: Trail
                      - generic [ref=e52]: Open
                    - heading "The Dry Gulch" [level=3] [ref=e53]
                    - paragraph [ref=e54]: Mesa country; dry washes fall toward one sunken spring.
                    - generic [ref=e55]:
                      - paragraph [ref=e56]: "This claim speaks: hero orders, seam yield multiplier, spring cells."
                      - generic [ref=e57]:
                        - paragraph [ref=e58]: Goals
                        - list [ref=e59]:
                          - listitem [ref=e60]: Survive through wave 20.
                          - listitem [ref=e61]: Work the dry washes around the lone spring.
                      - generic [ref=e62]:
                        - paragraph [ref=e63]: Rules
                        - list [ref=e64]:
                          - listitem [ref=e65]: Sluices work only beside the spring.
                          - listitem [ref=e66]: The river is gone; enemies can press from every edge.
                          - listitem [ref=e67]: Seams pay 40% more gold.
                    - paragraph [ref=e68]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e69] [cursor=pointer]
                - article "Night Shift, page 3 of 5" [ref=e70]:
                  - figure [ref=e71]
                  - generic [ref=e72]:
                    - generic [ref=e73]:
                      - generic [ref=e74]: Vein-Hunter
                      - generic [ref=e75]: Open
                    - heading "Night Shift" [level=3] [ref=e76]
                    - paragraph [ref=e77]: The claim, gone dark, dotted with cold lanterns.
                    - generic [ref=e78]:
                      - paragraph [ref=e79]: "This claim speaks: lantern posts, darkness cycle, enemy lantern classes, hero orders, the river, water crossings."
                      - generic [ref=e80]:
                        - paragraph [ref=e81]: Goals
                        - list [ref=e82]:
                          - listitem [ref=e83]: Survive to DAWN at wave 25.
                      - generic [ref=e84]:
                        - paragraph [ref=e85]: Rules
                        - list [ref=e86]:
                          - listitem [ref=e87]: Beyond your light, the night owns the claim.
                          - listitem [ref=e88]: Relight cold lanterns or build new posts to see threats.
                          - listitem [ref=e89]: Turrets still target in the dark.
                    - paragraph [ref=e90]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e91] [cursor=pointer]
                - article "Twin Banks, page 4 of 5" [ref=e92]:
                  - figure [ref=e93]
                  - generic [ref=e94]:
                    - generic [ref=e95]:
                      - generic [ref=e96]: Vein-Hunter
                      - generic [ref=e97]: Open
                    - heading "Twin Banks" [level=3] [ref=e98]
                    - paragraph [ref=e99]: A braided river claim with twin fords, gravel bars, and damp reeds.
                    - generic [ref=e100]:
                      - paragraph [ref=e101]: "This claim speaks: build zones, hero orders, the river, water crossings, loss stakes."
                      - generic [ref=e102]:
                        - paragraph [ref=e103]: Goals
                        - list [ref=e104]:
                          - listitem [ref=e105]: Survive through wave 20.
                          - listitem [ref=e106]: Build on either bank and watch both fords.
                      - generic [ref=e107]:
                        - paragraph [ref=e108]: Rules
                        - list [ref=e109]:
                          - listitem [ref=e110]: Both banks can hold buildings.
                          - listitem [ref=e111]: Two fords carry pressure across the river.
                          - listitem [ref=e112]: The south stake marks your starting ground; the north marker stands across the braid.
                    - paragraph [ref=e113]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e114] [cursor=pointer]
                - article "The Claim-Jumper Baron, page 5 of 5" [ref=e115]:
                  - figure [ref=e116]
                  - generic [ref=e117]:
                    - generic [ref=e118]:
                      - generic [ref=e119]: Vein-Hunter
                      - generic [ref=e120]: Open
                    - heading "The Claim-Jumper Baron" [level=3] [ref=e121]
                    - paragraph [ref=e122]: An oxblood banner marks the outfit that keeps buying trouble.
                    - generic [ref=e123]:
                      - paragraph [ref=e124]: A brass-bannered bully compresses the waves and waits at the twentieth horn.
                      - paragraph [ref=e125]: "This claim speaks: baron, hero orders, the river, rocket volley, water crossings, wave cadence multiplier."
                      - generic [ref=e126]:
                        - paragraph [ref=e127]: Goals
                        - list [ref=e128]:
                          - listitem [ref=e129]: The Baron rides at wave 20. Break his Rocket Cart.
                      - generic [ref=e130]:
                        - paragraph [ref=e131]: Rules
                        - list [ref=e132]:
                          - listitem [ref=e133]: "His outfit rides hot: waves come 15% faster."
                          - listitem [ref=e134]: Taunts warn you before his banner appears.
                          - listitem [ref=e135]: Turn back the Baron for the medal and double science.
                    - paragraph [ref=e136]: The Baron's outfit rides at 20; cadence runs hot (+15%).
                    - paragraph [ref=e137]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e138] [cursor=pointer]
            - region "THE TRAINING GROUND" [ref=e139]:
              - generic [ref=e140]:
                - generic [ref=e141]: Drill bell · straw targets
                - heading "THE TRAINING GROUND" [level=3] [ref=e142]
              - article "The Drill Yard" [ref=e143]:
                - figure [ref=e144]
                - generic [ref=e145]:
                  - generic [ref=e146]:
                    - generic [ref=e147]: Training
                    - generic [ref=e148]: No stakes
                  - heading "The Drill Yard" [level=3] [ref=e149]
                  - paragraph [ref=e150]: "Practice ground: no stakes, no claim. The county lends the gold; the straw men lend their patience."
                  - generic [ref=e151]:
                    - paragraph [ref=e152]: A borrowed corner of the river claim at the edge of town.
                    - paragraph [ref=e153]: "This claim speaks: assay tent faucet, drill bell, rolling logs, straw men, drill wave, hero orders, ledger free practice, practice buildables, practice gold grant, practice target respawn, the river, water crossings."
                    - generic [ref=e154]:
                      - paragraph [ref=e155]: Goals
                      - list [ref=e156]:
                        - listitem [ref=e157]: Try every Frontier building.
                        - listitem [ref=e158]: Practice on the straw men and rolling logs.
                    - generic [ref=e159]:
                      - paragraph [ref=e160]: Rules
                      - list [ref=e161]:
                        - listitem [ref=e162]: Pull the assay-tent lever to top up practice gold.
                        - listitem [ref=e163]: Ring the Drill Bell for one small wave.
                        - listitem [ref=e164]: Nothing in the yard enters the county ledger.
                  - button "Enter the yard" [ref=e165] [cursor=pointer]
          - button "Next chapter" [ref=e166] [cursor=pointer]: ›
        - navigation "Book chapters" [ref=e167]:
          - generic [ref=e168]: 1 / 10
          - generic [ref=e169]:
            - button "1. Frontier" [ref=e170] [cursor=pointer]
            - button "2. Steamworks" [ref=e171] [cursor=pointer]
            - button "3. Voltage Age" [ref=e172] [cursor=pointer]
            - button "4. Motor Frontier" [ref=e173] [cursor=pointer]
            - button "5. Deepwater Claim" [ref=e174] [cursor=pointer]
            - button "6. Atomic Homestead" [ref=e175] [cursor=pointer]
            - button "7. Signal Era" [ref=e176] [cursor=pointer]
            - button "8. Orbital Frontier" [ref=e177] [cursor=pointer]
            - button "9. Red Fields" [ref=e178] [cursor=pointer]
            - button "10. Deep Sky" [ref=e179] [cursor=pointer]
        - group [ref=e180]:
          - generic "Ride Together" [ref=e181] [cursor=pointer]:
            - generic [ref=e182]: Ride Together
            - generic [ref=e183]: Open
```

# Test source

```ts
  1219 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1220 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1221 |         }
  1222 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1223 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1224 |         }
  1225 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1226 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1227 |         }
  1228 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1229 | 
  1230 |         if (sawOverlay) {
  1231 |           try {
  1232 | 
  1233 |             const before = initialScores;
  1234 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1235 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1236 |             const scores = await readScores(page);
  1237 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1238 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1239 |             row.banks = banked
  1240 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1241 |               : fail(
  1242 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1243 |                 );
  1244 |           } catch (error) {
  1245 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1246 |           }
  1247 |         } else {
  1248 |           row.banks = fail('skipped: never secured');
  1249 |         }
  1250 | 
  1251 |         if (id === 'e10-river' && sawOverlay) {
  1252 |           await riverEnding(page, row, ARTIFACT_ROOT);
  1253 |         } else if (row.banks.ok) {
  1254 |           try {
  1255 |             if (contract.id === 'e10-last-claim') {
  1256 |               await page.getByTestId('e10-return-town').click({ timeout: 20_000 });
  1257 |             }
  1258 |             for (let card = 0; card < 2; card += 1) {
  1259 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1260 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1261 |                 await page.waitForTimeout(250);
  1262 |               }
  1263 |             }
  1264 |             if (contract.id !== 'e10-last-claim') await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1265 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1266 |             row.board = pass(contract.id === 'e10-last-claim' ? 'the Book is on screen after the finale Return to the Ark button' : 'the Book is on screen straight off the run ledger');
  1267 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1268 |           } catch (error) {
  1269 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1270 |           }
  1271 |         } else {
  1272 |           row.board = fail('skipped: never banked');
  1273 |         }
  1274 | 
  1275 |         if (id !== 'e10-river' && row.banks.ok) {
  1276 |           try {
  1277 |             const before = await rawScores(page);
  1278 |             await page.goto('/');
  1279 |             await page.waitForLoadState('domcontentloaded');
  1280 |             const after = await rawScores(page);
  1281 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1282 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1283 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1284 |             const reachedTavern = await walkToTavern(page, row);
  1285 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1286 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1287 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1288 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1289 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1290 |           } catch (error) {
  1291 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1292 |           }
  1293 |         } else if (id !== 'e10-river') {
  1294 |           row.reload = fail('skipped: never banked');
  1295 |         }
  1296 | 
  1297 |         row.clean =
  1298 |           consoleErrors.length === 0 && pageErrors.length === 0
  1299 |             ? pass('0 console, 0 page')
  1300 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1301 |       } finally {
  1302 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1303 |         if (row.finalSnapshot) {
  1304 |           if (id !== 'e10-river') row.objective = row.finalSnapshot.objective;
  1305 |           if (!row.banks.ok) {
  1306 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1307 |             row.simAtEnd = row.finalSnapshot.sim;
  1308 |             row.hpAtEnd = row.finalSnapshot.hp;
  1309 |             row.goldAtEnd = row.finalSnapshot.gold;
  1310 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1311 |           }
  1312 |         }
  1313 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1314 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1315 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1316 |       }
  1317 | 
  1318 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
> 1319 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
       |                                                          ^ Error: banks: no new secured/completed score for e10-river after the authored pan; no terminal bank action. Score rows before=42, after pan=42; active lineage=the-claim
  1320 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1321 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1322 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1323 |     });
  1324 | }
  1325 | 
  1326 | type Score = { contractId?: string; secured?: boolean; completed?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1327 | 
  1328 | async function rawScores(page: Page): Promise<string | null> {
  1329 |   return page.evaluate(
  1330 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1331 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1332 |   );
  1333 | }
  1334 | 
  1335 | async function readScores(page: Page): Promise<Score[]> {
  1336 |   const raw = await rawScores(page);
  1337 |   try {
  1338 |     const parsed = JSON.parse(raw ?? '[]');
  1339 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1340 |   } catch {
  1341 |     return [];
  1342 |   }
  1343 | }
  1344 | 
  1345 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1346 |   for (let step = 0; step < 70; step += 1) {
  1347 |     const town = await page
  1348 |       .evaluate(() => {
  1349 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1350 |         if (!d) return null;
  1351 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1352 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1353 |       })
  1354 |       .catch(() => null);
  1355 |     if (!town) return false;
  1356 |     if (town.prompt === 'tavern') return true;
  1357 |     if (!town.approach) return false;
  1358 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1359 |   }
  1360 |   row.notes.push('could not reach the tavern in 70 steps');
  1361 |   return false;
  1362 | }
  1363 | 
  1364 | /** The no-wave River ending starts at the real lever, after a native wave-8 prelude. */
  1365 | async function riverEnding(page: Page, row: Row, root: string): Promise<void> {
  1366 |   const prelude = { secures: row.secures, banks: row.banks, finalSnapshot: row.finalSnapshot, builds: [...row.builds], samples: [...row.samples], upgrades: [...row.upgrades] };
  1367 |   row.notes.push('Last Claim prelude retained in objective.prelude; River fields below measure the lever-launched ending.');
  1368 |   const beforeScores = await readScores(page);
  1369 |   const beforeAts = new Set(beforeScores.map(s => s.at));
  1370 |   await page.screenshot({ path: path.join(root, `prelude-${row.project}.png`) });
  1371 |   await page.getByTestId('e10-river-lever').click({ timeout: 20_000 });
  1372 |   await page.waitForURL(url => url.searchParams.get('contract') === 'the-claim', { timeout: BOOT_TIMEOUT_MS });
  1373 |   // The application itself writes nowaves. We do not construct or modify this URL.
  1374 |   const launchUrl = page.url();
  1375 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: BOOT_TIMEOUT_MS });
  1376 |   const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  1377 |   const briefing = await page.getByTestId('contract-briefing-name').textContent();
  1378 |   row.boots = active?.activeId === 'the-claim' && active.fallbackReason === null && briefing?.trim() === 'The River'
  1379 |     ? pass(`earned finale lever launched The River, activeId=${active.activeId}; application URL=${launchUrl}`)
  1380 |     : fail(`lever launch mismatch: ${JSON.stringify(active)}, briefing=${briefing}`);
  1381 |   await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 });
  1382 |   await unpause(page, row);
  1383 |   row.samples = [];
  1384 |   row.builds = [];
  1385 |   row.upgrades = [];
  1386 |   row.peakWave = 0;
  1387 |   row.secureWave = 0;
  1388 |   const opened = await read(page);
  1389 |   const startGold = opened?.gold ?? 0;
  1390 |   const started = Date.now();
  1391 |   const panned = await fund(page, row, startGold + 5, started + 60_000, [{ x: 0 }], new Set());
  1392 |   // Observe beyond the ordinary first-wave interval; the ending must remain quiet.
  1393 |   while (Date.now() < started + 75_000) {
  1394 |     await takeUpgrades(page, row);
  1395 |     const state = await read(page);
  1396 |     if (!state || state.wave > 0 || state.enemiesAlive > 0 || state.sim >= 35) break;
  1397 |     await page.waitForTimeout(250);
  1398 |   }
  1399 |   const end = await read(page);
  1400 |   row.finalSnapshot = end ?? undefined;
  1401 |   row.peakWave = end?.wave ?? 0;
  1402 |   row.simAtEnd = end?.sim ?? 0;
  1403 |   row.runStateAtEnd = end?.runState ?? '';
  1404 |   row.hpAtEnd = end?.hp ?? 0;
  1405 |   row.goldAtEnd = end?.gold ?? 0;
  1406 |   row.killsAtEnd = end?.kills ?? 0;
  1407 |   const quiet = end && end.sim >= 35 && end.wave === 0 && end.enemiesAlive === 0 && row.samples.every(s => s.wave === 0 && s.alive === 0);
  1408 |   row.secures = panned && quiet
  1409 |     ? pass(`authored no-wave pan: gold ${startGold} -> ${end.gold}, wave 0, zero enemies through ${end.sim.toFixed(1)}s; no Claim Secured overlay`)
  1410 |     : fail(`River pan=${panned}, gold=${end?.gold}, wave=${end?.wave}, enemies=${end?.enemiesAlive}, sim=${end?.sim}`);
  1411 |   row.objective = { prelude, river: { launchUrl, briefing, startGold, panned, quiet, end } };
  1412 |   await page.screenshot({ path: path.join(root, `terminal-${row.project}.png`) });
  1413 |   const atPan = await readScores(page);
  1414 |   const bankButton = page.getByTestId('bank-secured-claim');
  1415 |   if (await bankButton.isVisible().catch(() => false)) await bankButton.click();
  1416 |   const completed = (await readScores(page)).find(s => s.contractId === 'e10-river' && !beforeAts.has(s.at) && (s.secured || s.completed));
  1417 |   row.banks = completed
  1418 |     ? pass(`new completed River score: ${JSON.stringify(completed)}`)
  1419 |     : fail(`no new secured/completed score for e10-river after the authored pan; no terminal bank action. Score rows before=${beforeScores.length}, after pan=${atPan.length}; active lineage=${active?.activeId}`);
```