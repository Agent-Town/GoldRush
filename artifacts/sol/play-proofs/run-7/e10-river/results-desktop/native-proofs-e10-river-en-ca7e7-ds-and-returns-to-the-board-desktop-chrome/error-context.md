# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e10-river-ending.spec.ts >> real lever re-pull >> e10-river plays to its authored terminal, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:815:5

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
          - button "Previous chapter" [ref=e17] [cursor=pointer]: ‹
          - generic [active] [ref=e19]:
            - generic [ref=e20]:
              - generic [ref=e21]:
                - paragraph [ref=e22]: Chapter 10
                - heading "Deep Sky" [level=3] [ref=e23]
              - generic [ref=e24]: 4 claims
            - generic [ref=e25]:
              - article "The Ember Shore, page 1 of 4" [ref=e26]:
                - figure [ref=e27]
                - generic [ref=e28]:
                  - generic [ref=e29]:
                    - generic [ref=e30]: Deepsky
                    - generic [ref=e31]: Open
                  - heading "The Ember Shore" [level=3] [ref=e32]
                  - paragraph [ref=e33]: Cooling lava-vein bands divide the last warm vent from a cooled titan.
                  - generic [ref=e34]:
                    - paragraph [ref=e35]: Cooling lava-vein bands divide the dry shore between the last warm vent and a cooled titan machine older than the Combine.
                    - generic [ref=e36]:
                      - paragraph [ref=e37]: Goals
                      - list [ref=e38]:
                        - listitem [ref=e39]: Keep the last warm vent alight through at least one full squall.
                        - listitem [ref=e40]: Survive through wave 12 with warmth remaining to secure the shore.
                        - listitem [ref=e41]: Pan gold and return to the vent to stoke it before its warmth runs out.
                    - generic [ref=e42]:
                      - paragraph [ref=e43]: Rules
                      - list [ref=e44]:
                        - listitem [ref=e45]: During a squall, the vent loses 4 warmth each second. If it reaches zero, the claim is lost.
                        - listitem [ref=e46]: Within 4 paces of the vent, Stoke spends 15 gold to restore 40 warmth.
                        - listitem [ref=e47]: The shore has no river or water source; gather gold from the seams along the western approach.
                  - paragraph [ref=e48]: "Secured: wave 30, 400 gold"
                  - button "Launch" [ref=e49] [cursor=pointer]
              - article "The Archive World, page 2 of 4" [ref=e50]:
                - figure [ref=e51]
                - generic [ref=e52]:
                  - generic [ref=e53]:
                    - generic [ref=e54]: Deepsky
                    - generic [ref=e55]: Open
                  - heading "The Archive World" [level=3] [ref=e56]
                  - paragraph [ref=e57]: Two ruined stack wings lead from the archive entry to a deep warning shelf.
                  - generic [ref=e58]:
                    - paragraph [ref=e59]: Two ruined stack wings lead from the archive entry to a deep warning shelf left empty for us, unless.
                    - generic [ref=e60]:
                      - paragraph [ref=e61]: Goals
                      - list [ref=e62]:
                        - listitem [ref=e63]: Pan the entry hall seams and build a beacon at the west light stake.
                        - listitem [ref=e64]: Keep the next wing beacon powered through a whole warning and Static squall.
                        - listitem [ref=e65]: Restore a wing, survive twelve waves, then bank to keep the rescued pages.
                    - generic [ref=e66]:
                      - paragraph [ref=e67]: Rules
                      - list [ref=e68]:
                        - listitem [ref=e69]: "Wings restore in order: west stacks, east stacks, then the warning shelf."
                        - listitem [ref=e70]: An interrupted light hold must begin again with the next warning.
                        - listitem [ref=e71]: Lost runs keep no new restoration. Fully restored archives still require a fresh light hold.
                  - paragraph [ref=e72]: "Secured: wave 30, 400 gold"
                  - button "Launch" [ref=e73] [cursor=pointer]
              - article "The Last Claim, page 3 of 4" [ref=e74]:
                - figure [ref=e75]
                - generic [ref=e76]:
                  - generic [ref=e77]:
                    - generic [ref=e78]: Deepsky
                    - generic [ref=e79]: Open
                  - heading "The Last Claim" [level=3] [ref=e80]
                  - paragraph [ref=e81]: Ten lineage decks run stern to bow and end at three small preserves.
                  - generic [ref=e82]:
                    - paragraph [ref=e83]: "The Ark itself is the finale: ten lineage decks in a stern-to-bow run ending at three preserves."
                    - generic [ref=e84]:
                      - paragraph [ref=e85]: Goals
                      - list [ref=e86]:
                        - listitem [ref=e87]: Keep the last warm vent alight through wave 8.
                    - generic [ref=e88]:
                      - paragraph [ref=e89]: Rules
                      - list [ref=e90]:
                        - listitem [ref=e91]: The Ark carries ten lineage stations from stern to bow.
                        - listitem [ref=e92]: The Quiet drains color and song around the three preserves.
                        - listitem [ref=e93]: The Quiet is not damaged; the three preserves make it recede.
                  - paragraph [ref=e94]: "Secured: wave 8, 95 gold"
                  - button "Launch" [ref=e95] [cursor=pointer]
              - article "The River, page 4 of 4" [ref=e96]:
                - figure [ref=e97]
                - generic [ref=e98]:
                  - generic [ref=e99]:
                    - generic [ref=e100]: Deepsky
                    - generic [ref=e101]: Open
                  - heading "The River" [level=3] [ref=e102]
                  - paragraph [ref=e103]: At dawn, with no enemies and no waves, the first river waits for one pan.
                  - generic [ref=e104]:
                    - paragraph [ref=e105]: "The first claim returns at dawn: one river, one center ford, and one pan."
                    - generic [ref=e106]:
                      - paragraph [ref=e107]: Goals
                      - list [ref=e108]:
                        - listitem [ref=e109]: Pan the river.
                    - generic [ref=e110]:
                      - paragraph [ref=e111]: Rules
                      - list [ref=e112]:
                        - listitem [ref=e113]: There are no enemies and no waves.
                        - listitem [ref=e114]: The first claim returns with one river and one center ford.
                        - listitem [ref=e115]: With the waves quiet, the river keeps going.
                  - paragraph [ref=e116]: "Secured: wave 0, 5 gold"
                  - button "Launch" [ref=e117] [cursor=pointer]
          - button "Next chapter" [disabled] [ref=e118]: ›
        - navigation "Book chapters" [ref=e119]:
          - generic [ref=e120]: 10 / 10
          - generic [ref=e121]:
            - button "1. Frontier" [ref=e122] [cursor=pointer]
            - button "2. Steamworks" [ref=e123] [cursor=pointer]
            - button "3. Voltage Age" [ref=e124] [cursor=pointer]
            - button "4. Motor Frontier" [ref=e125] [cursor=pointer]
            - button "5. Deepwater Claim" [ref=e126] [cursor=pointer]
            - button "6. Atomic Homestead" [ref=e127] [cursor=pointer]
            - button "7. Signal Era" [ref=e128] [cursor=pointer]
            - button "8. Orbital Frontier" [ref=e129] [cursor=pointer]
            - button "9. Red Fields" [ref=e130] [cursor=pointer]
            - button "10. Deep Sky" [ref=e131] [cursor=pointer]
        - group [ref=e132]:
          - generic "Ride Together" [ref=e133] [cursor=pointer]:
            - generic [ref=e134]: Ride Together
            - generic [ref=e135]: Open
```

# Test source

```ts
  1222 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1223 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1224 |         }
  1225 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1226 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1227 |         }
  1228 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1229 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1230 |         }
  1231 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1232 | 
  1233 |         if (sawOverlay) {
  1234 |           try {
  1235 | 
  1236 |             const before = initialScores;
  1237 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1238 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1239 |             const scores = await readScores(page);
  1240 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1241 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1242 |             row.banks = banked
  1243 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1244 |               : fail(
  1245 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1246 |                 );
  1247 |           } catch (error) {
  1248 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1249 |           }
  1250 |         } else {
  1251 |           row.banks = fail('skipped: never secured');
  1252 |         }
  1253 | 
  1254 |         if (id === 'e10-river' && sawOverlay) {
  1255 |           await riverEnding(page, row, ARTIFACT_ROOT);
  1256 |         } else if (row.banks.ok) {
  1257 |           try {
  1258 |             if (contract.id === 'e10-last-claim') {
  1259 |               await page.getByTestId('e10-return-town').click({ timeout: 20_000 });
  1260 |             }
  1261 |             for (let card = 0; card < 2; card += 1) {
  1262 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1263 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1264 |                 await page.waitForTimeout(250);
  1265 |               }
  1266 |             }
  1267 |             if (contract.id !== 'e10-last-claim') await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1268 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1269 |             row.board = pass(contract.id === 'e10-last-claim' ? 'the Book is on screen after the finale Return to the Ark button' : 'the Book is on screen straight off the run ledger');
  1270 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1271 |           } catch (error) {
  1272 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1273 |           }
  1274 |         } else {
  1275 |           row.board = fail('skipped: never banked');
  1276 |         }
  1277 | 
  1278 |         if (id !== 'e10-river' && row.banks.ok) {
  1279 |           try {
  1280 |             const before = await rawScores(page);
  1281 |             await page.goto('/');
  1282 |             await page.waitForLoadState('domcontentloaded');
  1283 |             const after = await rawScores(page);
  1284 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1285 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1286 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1287 |             const reachedTavern = await walkToTavern(page, row);
  1288 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1289 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1290 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1291 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1292 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1293 |           } catch (error) {
  1294 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1295 |           }
  1296 |         } else if (id !== 'e10-river') {
  1297 |           row.reload = fail('skipped: never banked');
  1298 |         }
  1299 | 
  1300 |         row.clean =
  1301 |           consoleErrors.length === 0 && pageErrors.length === 0
  1302 |             ? pass('0 console, 0 page')
  1303 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1304 |       } finally {
  1305 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1306 |         if (row.finalSnapshot) {
  1307 |           if (id !== 'e10-river') row.objective = row.finalSnapshot.objective;
  1308 |           if (!row.banks.ok) {
  1309 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1310 |             row.simAtEnd = row.finalSnapshot.sim;
  1311 |             row.hpAtEnd = row.finalSnapshot.hp;
  1312 |             row.goldAtEnd = row.finalSnapshot.gold;
  1313 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1314 |           }
  1315 |         }
  1316 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1317 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1318 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1319 |       }
  1320 | 
  1321 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
> 1322 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
       |                                                          ^ Error: banks: no new secured/completed score for e10-river after the authored pan; no terminal bank action. Score rows before=42, after pan=42; active lineage=the-claim
  1323 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1324 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1325 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1326 |     });
  1327 | }
  1328 | 
  1329 | type Score = { contractId?: string; secured?: boolean; completed?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1330 | 
  1331 | async function rawScores(page: Page): Promise<string | null> {
  1332 |   return page.evaluate(
  1333 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1334 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1335 |   );
  1336 | }
  1337 | 
  1338 | async function readScores(page: Page): Promise<Score[]> {
  1339 |   const raw = await rawScores(page);
  1340 |   try {
  1341 |     const parsed = JSON.parse(raw ?? '[]');
  1342 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1343 |   } catch {
  1344 |     return [];
  1345 |   }
  1346 | }
  1347 | 
  1348 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1349 |   for (let step = 0; step < 70; step += 1) {
  1350 |     const town = await page
  1351 |       .evaluate(() => {
  1352 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1353 |         if (!d) return null;
  1354 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1355 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1356 |       })
  1357 |       .catch(() => null);
  1358 |     if (!town) return false;
  1359 |     if (town.prompt === 'tavern') return true;
  1360 |     if (!town.approach) return false;
  1361 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1362 |   }
  1363 |   row.notes.push('could not reach the tavern in 70 steps');
  1364 |   return false;
  1365 | }
  1366 | 
  1367 | /** The no-wave River ending starts at the real lever, after a native wave-8 prelude. */
  1368 | async function riverEnding(page: Page, row: Row, root: string): Promise<void> {
  1369 |   const prelude = { secures: row.secures, banks: row.banks, finalSnapshot: row.finalSnapshot, builds: [...row.builds], samples: [...row.samples], upgrades: [...row.upgrades] };
  1370 |   row.notes.push('Last Claim prelude retained in objective.prelude; River fields below measure the lever-launched ending.');
  1371 |   const beforeScores = await readScores(page);
  1372 |   const beforeAts = new Set(beforeScores.map(s => s.at));
  1373 |   await page.screenshot({ path: path.join(root, `prelude-${row.project}.png`) });
  1374 |   await page.getByTestId('e10-river-lever').click({ timeout: 20_000 });
  1375 |   await page.waitForURL(url => url.searchParams.get('contract') === 'the-claim', { timeout: BOOT_TIMEOUT_MS });
  1376 |   // The application itself writes nowaves. We do not construct or modify this URL.
  1377 |   const launchUrl = page.url();
  1378 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: BOOT_TIMEOUT_MS });
  1379 |   const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  1380 |   const briefing = await page.getByTestId('contract-briefing-name').textContent();
  1381 |   row.boots = active?.activeId === 'the-claim' && active.fallbackReason === null && briefing?.trim() === 'The River'
  1382 |     ? pass(`earned finale lever launched The River, activeId=${active.activeId}; application URL=${launchUrl}`)
  1383 |     : fail(`lever launch mismatch: ${JSON.stringify(active)}, briefing=${briefing}`);
  1384 |   await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 });
  1385 |   await unpause(page, row);
  1386 |   row.samples = [];
  1387 |   row.builds = [];
  1388 |   row.upgrades = [];
  1389 |   row.peakWave = 0;
  1390 |   row.secureWave = 0;
  1391 |   const opened = await read(page);
  1392 |   const startGold = opened?.gold ?? 0;
  1393 |   const started = Date.now();
  1394 |   const panned = await fund(page, row, startGold + 5, started + 60_000, [{ x: 0 }], new Set());
  1395 |   // Observe beyond the ordinary first-wave interval; the ending must remain quiet.
  1396 |   while (Date.now() < started + 75_000) {
  1397 |     await takeUpgrades(page, row);
  1398 |     const state = await read(page);
  1399 |     if (!state || state.wave > 0 || state.enemiesAlive > 0 || state.sim >= 35) break;
  1400 |     await page.waitForTimeout(250);
  1401 |   }
  1402 |   const end = await read(page);
  1403 |   row.finalSnapshot = end ?? undefined;
  1404 |   row.peakWave = end?.wave ?? 0;
  1405 |   row.simAtEnd = end?.sim ?? 0;
  1406 |   row.runStateAtEnd = end?.runState ?? '';
  1407 |   row.hpAtEnd = end?.hp ?? 0;
  1408 |   row.goldAtEnd = end?.gold ?? 0;
  1409 |   row.killsAtEnd = end?.kills ?? 0;
  1410 |   const quiet = end && end.sim >= 35 && end.wave === 0 && end.enemiesAlive === 0 && row.samples.every(s => s.wave === 0 && s.alive === 0);
  1411 |   row.secures = panned && quiet
  1412 |     ? pass(`authored no-wave pan: gold ${startGold} -> ${end.gold}, wave 0, zero enemies through ${end.sim.toFixed(1)}s; no Claim Secured overlay`)
  1413 |     : fail(`River pan=${panned}, gold=${end?.gold}, wave=${end?.wave}, enemies=${end?.enemiesAlive}, sim=${end?.sim}`);
  1414 |   row.objective = { prelude, river: { launchUrl, briefing, startGold, panned, quiet, end } };
  1415 |   await page.screenshot({ path: path.join(root, `terminal-${row.project}.png`) });
  1416 |   const atPan = await readScores(page);
  1417 |   const bankButton = page.getByTestId('bank-secured-claim');
  1418 |   if (await bankButton.isVisible().catch(() => false)) await bankButton.click();
  1419 |   const completed = (await readScores(page)).find(s => s.contractId === 'e10-river' && !beforeAts.has(s.at) && (s.secured || s.completed));
  1420 |   row.banks = completed
  1421 |     ? pass(`new completed River score: ${JSON.stringify(completed)}`)
  1422 |     : fail(`no new secured/completed score for e10-river after the authored pan; no terminal bank action. Score rows before=${beforeScores.length}, after pan=${atPan.length}; active lineage=${active?.activeId}`);
```