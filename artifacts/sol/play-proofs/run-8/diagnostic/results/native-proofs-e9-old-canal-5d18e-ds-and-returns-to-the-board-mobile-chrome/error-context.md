# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e9-old-canal.spec.ts >> e9-old-canal plays to its authored terminal, banks, reloads and returns to the board
- Location: e2e/native-proofs/driver.ts:815:5

# Error details

```
Error: secures: runState=dead at wave 18 / 540.7s sim, 778 kills, 4 gold

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
      - strong: "4"
    - region "Active weapon":
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
        - generic [ref=e9]: 08:56 - Gathered 88 XP
      - button "Tape Reel" [ref=e10]: ● Tape Reel
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "27"
        - strong: 20 / 220 XP
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
          - definition [ref=e30]: "778"
        - generic [ref=e31]:
          - term [ref=e32]: Waves Survived
          - definition [ref=e33]: "18"
        - generic [ref=e34]:
          - term [ref=e35]: Gold Panned
          - definition [ref=e36]: "555"
        - generic [ref=e37]:
          - term [ref=e38]: Gold Sluiced
          - definition [ref=e39]: "0"
        - generic [ref=e40]:
          - term [ref=e41]: Stolen / Reclaimed
          - definition [ref=e42]: 0 / 0
        - generic [ref=e43]:
          - term [ref=e44]: Spent
          - definition [ref=e45]: "551"
        - generic [ref=e46]:
          - term [ref=e47]: Beacons Built
          - definition [ref=e48]: "4"
        - generic [ref=e49]:
          - term [ref=e50]: Buildings Built / Lost / Repaired
          - definition [ref=e51]: 8 / 8 / 4
        - generic [ref=e52]:
          - term [ref=e53]: Spark / Blast Damage
          - definition [ref=e54]: 25870 / 0
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
  1221 |         }
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
> 1321 |       expect(row.secures.ok, `secures: ${row.secures.detail}`).toBe(true);
       |                                                                ^ Error: secures: runState=dead at wave 18 / 540.7s sim, 778 kills, 4 gold
  1322 |       expect(row.banks.ok, `banks: ${row.banks.detail}`).toBe(true);
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
```