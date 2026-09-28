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
      - generic [ref=e6]:
        - group [ref=e7]:
          - generic "Settings" [ref=e8] [cursor=pointer]
        - button "Exit" [ref=e9] [cursor=pointer]
    - region "Tavern contract board" [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]:
            - paragraph [ref=e14]: Tavern Ledger
            - heading "The Book" [level=2] [ref=e15]
            - button "Open every claim" [ref=e16] [cursor=pointer]
          - button "Back" [ref=e17] [cursor=pointer]
        - generic [ref=e18]:
          - button "Previous chapter" [disabled] [ref=e19]: ‹
          - generic [ref=e20]:
            - generic [ref=e21]:
              - generic [ref=e22]:
                - generic [ref=e23]:
                  - paragraph [ref=e24]: Chapter 1
                  - heading "Frontier" [level=3] [ref=e25]
                - generic [ref=e26]: 5 claims
              - generic [ref=e27]:
                - article "The Claim, page 1 of 5" [ref=e28]:
                  - figure [ref=e29]
                  - generic [ref=e30]:
                    - generic [ref=e31]:
                      - generic [ref=e32]: Trail
                      - generic [ref=e33]: Open
                    - heading "The Claim" [level=3] [ref=e34]
                    - paragraph [ref=e35]: The classic river claim.
                    - generic [ref=e36]:
                      - paragraph [ref=e37]: "This claim speaks: hero orders, the river, water crossings."
                      - generic [ref=e38]:
                        - paragraph [ref=e39]: Goals
                        - list [ref=e40]:
                          - listitem [ref=e41]: Survive through wave 10.
                      - generic [ref=e42]:
                        - paragraph [ref=e43]: Rules
                        - list [ref=e44]:
                          - listitem [ref=e45]: The river splits the claim around one center ford.
                          - listitem [ref=e46]: Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.
                    - paragraph [ref=e47]: "Secured: wave 30, 400 gold"
                    - button "Launch" [active] [ref=e48] [cursor=pointer]
                - article "The Dry Gulch, page 2 of 5" [ref=e49]:
                  - figure [ref=e50]
                  - generic [ref=e51]:
                    - generic [ref=e52]:
                      - generic [ref=e53]: Trail
                      - generic [ref=e54]: Open
                    - heading "The Dry Gulch" [level=3] [ref=e55]
                    - paragraph [ref=e56]: Mesa country; dry washes fall toward one sunken spring.
                    - generic [ref=e57]:
                      - paragraph [ref=e58]: "This claim speaks: hero orders, seam yield multiplier, spring cells."
                      - generic [ref=e59]:
                        - paragraph [ref=e60]: Goals
                        - list [ref=e61]:
                          - listitem [ref=e62]: Survive through wave 20.
                          - listitem [ref=e63]: Work the dry washes around the lone spring.
                      - generic [ref=e64]:
                        - paragraph [ref=e65]: Rules
                        - list [ref=e66]:
                          - listitem [ref=e67]: Sluices work only beside the spring.
                          - listitem [ref=e68]: The river is gone; enemies can press from every edge.
                          - listitem [ref=e69]: Seams pay 40% more gold.
                    - paragraph [ref=e70]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e71] [cursor=pointer]
                - article "Night Shift, page 3 of 5" [ref=e72]:
                  - figure [ref=e73]
                  - generic [ref=e74]:
                    - generic [ref=e75]:
                      - generic [ref=e76]: Vein-Hunter
                      - generic [ref=e77]: Open
                    - heading "Night Shift" [level=3] [ref=e78]
                    - paragraph [ref=e79]: The claim, gone dark, dotted with cold lanterns.
                    - generic [ref=e80]:
                      - paragraph [ref=e81]: "This claim speaks: lantern posts, darkness cycle, enemy lantern classes, hero orders, the river, water crossings."
                      - generic [ref=e82]:
                        - paragraph [ref=e83]: Goals
                        - list [ref=e84]:
                          - listitem [ref=e85]: Survive to DAWN at wave 25.
                      - generic [ref=e86]:
                        - paragraph [ref=e87]: Rules
                        - list [ref=e88]:
                          - listitem [ref=e89]: Beyond your light, the night owns the claim.
                          - listitem [ref=e90]: Relight cold lanterns or build new posts to see threats.
                          - listitem [ref=e91]: Turrets still target in the dark.
                    - paragraph [ref=e92]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e93] [cursor=pointer]
                - article "Twin Banks, page 4 of 5" [ref=e94]:
                  - figure [ref=e95]
                  - generic [ref=e96]:
                    - generic [ref=e97]:
                      - generic [ref=e98]: Vein-Hunter
                      - generic [ref=e99]: Open
                    - heading "Twin Banks" [level=3] [ref=e100]
                    - paragraph [ref=e101]: A braided river claim with twin fords, gravel bars, and damp reeds.
                    - generic [ref=e102]:
                      - paragraph [ref=e103]: "This claim speaks: build zones, hero orders, the river, water crossings, loss stakes."
                      - generic [ref=e104]:
                        - paragraph [ref=e105]: Goals
                        - list [ref=e106]:
                          - listitem [ref=e107]: Survive through wave 20.
                          - listitem [ref=e108]: Build on either bank and watch both fords.
                      - generic [ref=e109]:
                        - paragraph [ref=e110]: Rules
                        - list [ref=e111]:
                          - listitem [ref=e112]: Both banks can hold buildings.
                          - listitem [ref=e113]: Two fords carry pressure across the river.
                          - listitem [ref=e114]: The south stake marks your starting ground; the north marker stands across the braid.
                    - paragraph [ref=e115]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e116] [cursor=pointer]
                - article "The Claim-Jumper Baron, page 5 of 5" [ref=e117]:
                  - figure [ref=e118]
                  - generic [ref=e119]:
                    - generic [ref=e120]:
                      - generic [ref=e121]: Vein-Hunter
                      - generic [ref=e122]: Open
                    - heading "The Claim-Jumper Baron" [level=3] [ref=e123]
                    - paragraph [ref=e124]: An oxblood banner marks the outfit that keeps buying trouble.
                    - generic [ref=e125]:
                      - paragraph [ref=e126]: A brass-bannered bully compresses the waves and waits at the twentieth horn.
                      - paragraph [ref=e127]: "This claim speaks: baron, hero orders, the river, rocket volley, water crossings, wave cadence multiplier."
                      - generic [ref=e128]:
                        - paragraph [ref=e129]: Goals
                        - list [ref=e130]:
                          - listitem [ref=e131]: The Baron rides at wave 20. Break his Rocket Cart.
                      - generic [ref=e132]:
                        - paragraph [ref=e133]: Rules
                        - list [ref=e134]:
                          - listitem [ref=e135]: "His outfit rides hot: waves come 15% faster."
                          - listitem [ref=e136]: Taunts warn you before his banner appears.
                          - listitem [ref=e137]: Turn back the Baron for the medal and double science.
                    - paragraph [ref=e138]: The Baron's outfit rides at 20; cadence runs hot (+15%).
                    - paragraph [ref=e139]: "Secured: wave 30, 400 gold"
                    - button "Launch" [ref=e140] [cursor=pointer]
            - region "THE TRAINING GROUND" [ref=e141]:
              - generic [ref=e142]:
                - generic [ref=e143]: Drill bell · straw targets
                - heading "THE TRAINING GROUND" [level=3] [ref=e144]
              - article "The Drill Yard" [ref=e145]:
                - figure [ref=e146]
                - generic [ref=e147]:
                  - generic [ref=e148]:
                    - generic [ref=e149]: Training
                    - generic [ref=e150]: No stakes
                  - heading "The Drill Yard" [level=3] [ref=e151]
                  - paragraph [ref=e152]: "Practice ground: no stakes, no claim. The county lends the gold; the straw men lend their patience."
                  - generic [ref=e153]:
                    - paragraph [ref=e154]: A borrowed corner of the river claim at the edge of town.
                    - paragraph [ref=e155]: "This claim speaks: assay tent faucet, drill bell, rolling logs, straw men, drill wave, hero orders, ledger free practice, practice buildables, practice gold grant, practice target respawn, the river, water crossings."
                    - generic [ref=e156]:
                      - paragraph [ref=e157]: Goals
                      - list [ref=e158]:
                        - listitem [ref=e159]: Try every Frontier building.
                        - listitem [ref=e160]: Practice on the straw men and rolling logs.
                    - generic [ref=e161]:
                      - paragraph [ref=e162]: Rules
                      - list [ref=e163]:
                        - listitem [ref=e164]: Pull the assay-tent lever to top up practice gold.
                        - listitem [ref=e165]: Ring the Drill Bell for one small wave.
                        - listitem [ref=e166]: Nothing in the yard enters the county ledger.
                  - button "Enter the yard" [ref=e167] [cursor=pointer]
          - button "Next chapter" [ref=e168] [cursor=pointer]: ›
        - navigation "Book chapters" [ref=e169]:
          - generic [ref=e170]: 1 / 10
          - generic [ref=e171]:
            - button "1. Frontier" [ref=e172] [cursor=pointer]
            - button "2. Steamworks" [ref=e173] [cursor=pointer]
            - button "3. Voltage Age" [ref=e174] [cursor=pointer]
            - button "4. Motor Frontier" [ref=e175] [cursor=pointer]
            - button "5. Deepwater Claim" [ref=e176] [cursor=pointer]
            - button "6. Atomic Homestead" [ref=e177] [cursor=pointer]
            - button "7. Signal Era" [ref=e178] [cursor=pointer]
            - button "8. Orbital Frontier" [ref=e179] [cursor=pointer]
            - button "9. Red Fields" [ref=e180] [cursor=pointer]
            - button "10. Deep Sky" [ref=e181] [cursor=pointer]
        - group [ref=e182]:
          - generic "Ride Together" [ref=e183] [cursor=pointer]:
            - generic [ref=e184]: Ride Together
            - generic [ref=e185]: Open
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