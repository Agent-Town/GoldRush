# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e9-old-canal.spec.ts >> e9-old-canal plays to its authored terminal, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:827:5

# Error details

```
Error: secures: runState=dead at wave 19 / 599.7s sim, 891 kills, 33 gold

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
        - generic: Brass warning on the north bank!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 0 / 175
      - generic:
        - generic: Time
        - strong: 09:59
      - generic:
        - generic: Wave
        - strong: "19"
    - region "Gold pouch":
      - generic: Gold
      - strong: "33"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 09:59 - Gathered 4 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "28"
        - strong: 176 / 228 XP
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
          - definition [ref=e22]: 09:59
        - generic [ref=e23]:
          - term [ref=e24]: Claim Jumpers Turned Back
          - definition [ref=e25]: "891"
        - generic [ref=e26]:
          - term [ref=e27]: Waves Survived
          - definition [ref=e28]: "19"
        - generic [ref=e29]:
          - term [ref=e30]: Gold Panned
          - definition [ref=e31]: "580"
        - generic [ref=e32]:
          - term [ref=e33]: Gold Sluiced
          - definition [ref=e34]: "0"
        - generic [ref=e35]:
          - term [ref=e36]: Stolen / Reclaimed
          - definition [ref=e37]: 0 / 0
        - generic [ref=e38]:
          - term [ref=e39]: Spent
          - definition [ref=e40]: "547"
        - generic [ref=e41]:
          - term [ref=e42]: Beacons Built
          - definition [ref=e43]: "3"
        - generic [ref=e44]:
          - term [ref=e45]: Buildings Built / Lost / Repaired
          - definition [ref=e46]: 7 / 15 / 11
        - generic [ref=e47]:
          - term [ref=e48]: Spark / Blast Damage
          - definition [ref=e49]: 38698 / 0
        - generic [ref=e50]:
          - term [ref=e51]: Blast Toggles
          - definition [ref=e52]: "0"
        - generic [ref=e53]:
          - term [ref=e54]: Blast Charge Time
          - definition [ref=e55]: 00:00
        - generic [ref=e56]:
          - term [ref=e57]: Upgrades Taken
          - definition [ref=e58]: blast 7 · damage 3 · firerate 3 · mobility 3 · plating 3 · beacon 2 · range 2 · volley 2 · panning 1 · prospecting 1
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
  1233 |         }
  1234 |         if (contract.id === 'e3-canyon-works' && !atSecure?.canyonWorks?.complete) {
  1235 |           row.secures = fail(`${row.secures.detail}; both galleries were not connected by wave 8`);
  1236 |         }
  1237 |         if (contract.id === 'e2-incline' && (!atSecure?.escort.enabled || atSecure.escort.arrived < atSecure.escort.required)) {
  1238 |           row.secures = fail(`${row.secures.detail}; Incline Haul not completed: ${JSON.stringify(atSecure?.escort)}`);
  1239 |         }
  1240 |         if (contract.id === 'e2-pressure-garden' && row.peakHotBoilers < 3) {
  1241 |           row.secures = fail(`${row.secures.detail}; wave ${row.peakWave}, overlay=${sawOverlay}, but only ${row.peakHotBoilers}/3 authored boiler beds operated hot`);
  1242 |         }
  1243 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `terminal-${testInfo.project.name}.png`) });
  1244 | 
  1245 |         if (sawOverlay) {
  1246 |           try {
  1247 | 
  1248 |             const before = initialScores;
  1249 |             await page.getByTestId('bank-secured-claim').click({ timeout: 10_000 });
  1250 |             await expect(page.getByTestId('claim-secured')).toBeHidden({ timeout: 10_000 });
  1251 |             const scores = await readScores(page);
  1252 |             const fresh = scores.filter((score) => !before.has(JSON.stringify(score)));
  1253 |             const banked = fresh.find((score) => score.contractId === contract.id && score.secured === true && (score.waves ?? 0) >= secureWave);
  1254 |             row.banks = banked
  1255 |               ? pass(`a NEW secured row for ${contract.id}: waves=${banked.waves} gold=${banked.gold} timeAlive=${Math.round(banked.timeAlive ?? 0)} kills=${banked.kills ?? '?'} (${fresh.length} new row(s) since pre-play, retained after Return to Town)`)
  1256 |               : fail(
  1257 |                   `no new secured row since pre-play for ${contract.id} at >= wave ${secureWave} (${fresh.length} new row(s): ${JSON.stringify(fresh.slice(0, 2))})`,
  1258 |                 );
  1259 |           } catch (error) {
  1260 |             row.banks = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1261 |           }
  1262 |         } else {
  1263 |           row.banks = fail('skipped: never secured');
  1264 |         }
  1265 | 
  1266 |         if (id === 'e10-river' && sawOverlay) {
  1267 |           await riverEnding(page, row, ARTIFACT_ROOT);
  1268 |         } else if (row.banks.ok) {
  1269 |           try {
  1270 |             if (contract.id === 'e10-last-claim') {
  1271 |               await page.getByTestId('e10-return-town').click({ timeout: 20_000 });
  1272 |             }
  1273 |             for (let card = 0; card < 2; card += 1) {
  1274 |               if (await page.getByTestId('research-card-0').isVisible().catch(() => false)) {
  1275 |                 await page.getByTestId('research-card-0').click({ timeout: 5_000 }).catch(() => undefined);
  1276 |                 await page.waitForTimeout(250);
  1277 |               }
  1278 |             }
  1279 |             if (contract.id !== 'e10-last-claim') await page.getByTestId('stake-again').click({ timeout: 10_000 });
  1280 |             await expect(page.getByTestId('contract-board-title')).toBeVisible({ timeout: 20_000 });
  1281 |             row.board = pass(contract.id === 'e10-last-claim' ? 'the Book is on screen after the finale Return to the Ark button' : 'the Book is on screen straight off the run ledger');
  1282 |             await page.screenshot({ path: path.join(ARTIFACT_ROOT, `board-${testInfo.project.name}.png`) });
  1283 |           } catch (error) {
  1284 |             row.board = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1285 |           }
  1286 |         } else {
  1287 |           row.board = fail('skipped: never banked');
  1288 |         }
  1289 | 
  1290 |         if (id !== 'e10-river' && row.banks.ok) {
  1291 |           try {
  1292 |             const before = await rawScores(page);
  1293 |             await page.goto('/');
  1294 |             await page.waitForLoadState('domcontentloaded');
  1295 |             const after = await rawScores(page);
  1296 |             expect(after, 'the banked score survives a plain reload byte for byte').toBe(before);
  1297 |             await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
  1298 |             await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 40_000 });
  1299 |             const reachedTavern = await walkToTavern(page, row);
  1300 |             expect(reachedTavern, 'the tavern is reachable on foot after the reload').toBe(true);
  1301 |             await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  1302 |             await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 20_000 });
  1303 |             expect(await rawScores(page), 'score still byte-identical after opening the Book').toBe(before);
  1304 |             row.reload = pass(`score retained across reload (${(before ?? '').length} bytes) and the Book reopened on foot`);
  1305 |           } catch (error) {
  1306 |             row.reload = fail(String((error as Error).message).split('\n').slice(0, 3).join(' | '));
  1307 |           }
  1308 |         } else if (id !== 'e10-river') {
  1309 |           row.reload = fail('skipped: never banked');
  1310 |         }
  1311 | 
  1312 |         row.clean =
  1313 |           consoleErrors.length === 0 && pageErrors.length === 0
  1314 |             ? pass('0 console, 0 page')
  1315 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  1316 |       } finally {
  1317 |         if (!row.banks.ok) row.finalSnapshot = (await read(page)) ?? undefined;
  1318 |         if (row.finalSnapshot) {
  1319 |           if (id !== 'e10-river') row.objective = row.finalSnapshot.objective;
  1320 |           if (!row.banks.ok) {
  1321 |             row.peakWave = Math.max(row.peakWave, row.finalSnapshot.wave, row.finalSnapshot.hudWave);
  1322 |             row.simAtEnd = row.finalSnapshot.sim;
  1323 |             row.hpAtEnd = row.finalSnapshot.hp;
  1324 |             row.goldAtEnd = row.finalSnapshot.gold;
  1325 |             row.runStateAtEnd = row.finalSnapshot.runState;
  1326 |           }
  1327 |         }
  1328 |         await page.screenshot({ path: path.join(ARTIFACT_ROOT, `last-${testInfo.project.name}.png`) }).catch(() => undefined);
  1329 |         row.clean = consoleErrors.length === 0 && pageErrors.length === 0 ? pass('0 console, 0 page') : fail(JSON.stringify({consoleErrors, pageErrors}));
  1330 |         await writeFile(path.join(ARTIFACT_ROOT, `row-${testInfo.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  1331 |       }
  1332 | 
> 1333 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 19 / 599.7s sim, 891 kills, 33 gold
  1334 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
  1335 |       expect(row.board.ok, `board: ${row.board.detail}`).toBe(true);
  1336 |       expect(row.reload.ok, `reload: ${row.reload.detail}`).toBe(true);
  1337 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  1338 |     });
  1339 | }
  1340 | 
  1341 | type Score = { contractId?: string; secured?: boolean; completed?: boolean; waves?: number; gold?: number; timeAlive?: number; kills?: number; at?: number };
  1342 | 
  1343 | async function rawScores(page: Page): Promise<string | null> {
  1344 |   return page.evaluate(
  1345 |     ([key, profileKey]) => localStorage.getItem(`${profileKey}.robin.${key}`) ?? localStorage.getItem(key),
  1346 |     [SCOREBOARD_KEY, PROFILE_KEY] as const,
  1347 |   );
  1348 | }
  1349 | 
  1350 | async function readScores(page: Page): Promise<Score[]> {
  1351 |   const raw = await rawScores(page);
  1352 |   try {
  1353 |     const parsed = JSON.parse(raw ?? '[]');
  1354 |     return Array.isArray(parsed) ? (parsed as Score[]) : [];
  1355 |   } catch {
  1356 |     return [];
  1357 |   }
  1358 | }
  1359 | 
  1360 | async function walkToTavern(page: Page, row: Row): Promise<boolean> {
  1361 |   for (let step = 0; step < 70; step += 1) {
  1362 |     const town = await page
  1363 |       .evaluate(() => {
  1364 |         const d = window.__GR_TOWN_DIAGNOSTICS__;
  1365 |         if (!d) return null;
  1366 |         const tavern = d.buildings.find((building) => building.id === 'tavern');
  1367 |         return { prompt: d.activePrompt, player: d.player, approach: tavern?.approach ?? null };
  1368 |       })
  1369 |       .catch(() => null);
  1370 |     if (!town) return false;
  1371 |     if (town.prompt === 'tavern') return true;
  1372 |     if (!town.approach) return false;
  1373 |     await steer(page, town.approach.x - town.player.x, town.approach.z - town.player.z, 170);
  1374 |   }
  1375 |   row.notes.push('could not reach the tavern in 70 steps');
  1376 |   return false;
  1377 | }
  1378 | 
  1379 | /** The no-wave River ending starts at the real lever, after a native wave-8 prelude. */
  1380 | async function riverEnding(page: Page, row: Row, root: string): Promise<void> {
  1381 |   const prelude = { secures: row.secures, banks: row.banks, finalSnapshot: row.finalSnapshot, builds: [...row.builds], samples: [...row.samples], upgrades: [...row.upgrades] };
  1382 |   row.notes.push('Last Claim prelude retained in objective.prelude; River fields below measure the lever-launched ending.');
  1383 |   const beforeScores = await readScores(page);
  1384 |   const beforeAts = new Set(beforeScores.map(s => s.at));
  1385 |   await page.screenshot({ path: path.join(root, `prelude-${row.project}.png`) });
  1386 |   await page.getByTestId('e10-river-lever').click({ timeout: 20_000 });
  1387 |   await page.waitForURL(url => url.searchParams.get('contract') === 'the-claim', { timeout: BOOT_TIMEOUT_MS });
  1388 |   // The application itself writes nowaves. We do not construct or modify this URL.
  1389 |   const launchUrl = page.url();
  1390 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12, undefined, { timeout: BOOT_TIMEOUT_MS });
  1391 |   const active = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract);
  1392 |   const briefing = await page.getByTestId('contract-briefing-name').textContent();
  1393 |   row.boots = active?.activeId === 'the-claim' && active.fallbackReason === null && briefing?.trim() === 'The River'
  1394 |     ? pass(`earned finale lever launched The River, activeId=${active.activeId}; application URL=${launchUrl}`)
  1395 |     : fail(`lever launch mismatch: ${JSON.stringify(active)}, briefing=${briefing}`);
  1396 |   await page.getByTestId('contract-briefing-dismiss').click({ timeout: 10_000 });
  1397 |   await unpause(page, row);
  1398 |   row.samples = [];
  1399 |   row.builds = [];
  1400 |   row.upgrades = [];
  1401 |   row.peakWave = 0;
  1402 |   row.secureWave = 0;
  1403 |   const opened = await read(page);
  1404 |   const startGold = opened?.gold ?? 0;
  1405 |   const started = Date.now();
  1406 |   const panned = await fund(page, row, startGold + 5, started + 60_000, [{ x: 0 }], new Set());
  1407 |   // Observe beyond the ordinary first-wave interval; the ending must remain quiet.
  1408 |   while (Date.now() < started + 75_000) {
  1409 |     await takeUpgrades(page, row);
  1410 |     const state = await read(page);
  1411 |     if (!state || state.wave > 0 || state.enemiesAlive > 0 || state.sim >= 35) break;
  1412 |     await page.waitForTimeout(250);
  1413 |   }
  1414 |   const end = await read(page);
  1415 |   row.finalSnapshot = end ?? undefined;
  1416 |   row.peakWave = end?.wave ?? 0;
  1417 |   row.simAtEnd = end?.sim ?? 0;
  1418 |   row.runStateAtEnd = end?.runState ?? '';
  1419 |   row.hpAtEnd = end?.hp ?? 0;
  1420 |   row.goldAtEnd = end?.gold ?? 0;
  1421 |   row.killsAtEnd = end?.kills ?? 0;
  1422 |   const quiet = end && end.sim >= 35 && end.wave === 0 && end.enemiesAlive === 0 && row.samples.every(s => s.wave === 0 && s.alive === 0);
  1423 |   row.secures = panned && quiet
  1424 |     ? pass(`authored no-wave pan: gold ${startGold} -> ${end.gold}, wave 0, zero enemies through ${end.sim.toFixed(1)}s; no Claim Secured overlay`)
  1425 |     : fail(`River pan=${panned}, gold=${end?.gold}, wave=${end?.wave}, enemies=${end?.enemiesAlive}, sim=${end?.sim}`);
  1426 |   row.objective = { prelude, river: { launchUrl, briefing, startGold, panned, quiet, end } };
  1427 |   await page.screenshot({ path: path.join(root, `terminal-${row.project}.png`) });
  1428 |   const atPan = await readScores(page);
  1429 |   const bankButton = page.getByTestId('bank-secured-claim');
  1430 |   if (await bankButton.isVisible().catch(() => false)) await bankButton.click();
  1431 |   const completed = (await readScores(page)).find(s => s.contractId === 'e10-river' && !beforeAts.has(s.at) && (s.secured || s.completed));
  1432 |   row.banks = completed
  1433 |     ? pass(`new completed River score: ${JSON.stringify(completed)}`)
```