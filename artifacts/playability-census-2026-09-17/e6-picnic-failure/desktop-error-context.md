# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: playability-smoke.spec.ts >> playability smoke: every board contract, plain boot >> e6-picnic boots plain, briefs, moves and reaches wave 2
- Location: e2e/playability-smoke.spec.ts:311:5

# Error details

```
Error: wave 2: reached wave 1 after 5.6s wall / 37.9s sim at timescale 4 (runState=dead, HUD wave reads "1", simTick=296)

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
        - generic: East ridge dust is moving!
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 100 / 100
      - generic:
        - generic: Time
        - strong: 00:37
      - generic:
        - generic: Wave
        - strong: "1"
    - region "Gold pouch":
      - generic: Gold
      - strong: "0"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
        - generic [ref=e5]:
          - generic [ref=e6]: the Prospector
          - strong [ref=e7]: L3
          - generic [ref=e8]: autonomous-within-budget
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "1"
        - strong: 0 / 12 XP
    - region "Build":
      - button "Build" [ref=e10]
    - button "Pause the claim" [ref=e11]: P - catch your breath
  - region "Run ledger" [ref=e12]:
    - generic [ref=e13]:
      - paragraph [ref=e14]: The claim went quiet.
      - heading "Run Ledger" [level=1] [ref=e15]
      - paragraph [ref=e16]: The claim was overrun. The gold remembers.
      - generic [ref=e17]:
        - generic [ref=e18]:
          - term [ref=e19]: Time Held
          - definition [ref=e20]: 00:37
        - generic [ref=e21]:
          - term [ref=e22]: Claim Jumpers Turned Back
          - definition [ref=e23]: "11"
        - generic [ref=e24]:
          - term [ref=e25]: Waves Survived
          - definition [ref=e26]: "1"
        - generic [ref=e27]:
          - term [ref=e28]: Gold Panned
          - definition [ref=e29]: "0"
        - generic [ref=e30]:
          - term [ref=e31]: Gold Sluiced
          - definition [ref=e32]: "0"
        - generic [ref=e33]:
          - term [ref=e34]: Stolen / Reclaimed
          - definition [ref=e35]: 0 / 0
        - generic [ref=e36]:
          - term [ref=e37]: Spent
          - definition [ref=e38]: "0"
        - generic [ref=e39]:
          - term [ref=e40]: Beacons Built
          - definition [ref=e41]: "0"
        - generic [ref=e42]:
          - term [ref=e43]: Buildings Built / Lost / Repaired
          - definition [ref=e44]: 0 / 0 / 0
        - generic [ref=e45]:
          - term [ref=e46]: Spark / Blast Damage
          - definition [ref=e47]: 226 / 0
        - generic [ref=e48]:
          - term [ref=e49]: Blast Toggles
          - definition [ref=e50]: "0"
        - generic [ref=e51]:
          - term [ref=e52]: Blast Charge Time
          - definition [ref=e53]: 00:00
        - generic [ref=e54]:
          - term [ref=e55]: Upgrades Taken
          - definition [ref=e56]: none
      - paragraph [ref=e57]: "Epoch science complete: the Signal Era awaits a town to build it. (Steps beyond the threshold are banked for the new era.) carried forward: +983 toward the Signal Era"
      - paragraph [ref=e58]: Recorded for the claim of Quartz Hill.
      - region "Research proposal" [ref=e59]:
        - paragraph [ref=e60]: Research pick 1 of 1
        - heading "The Elder proposes..." [level=2] [ref=e61]
        - generic [ref=e62]:
          - 'button "1 Advances crafting-agent Sunline Beam Effect: Unlocks the Sunline Beam: 16 damage across 13m every 0.7s. EVERY RUN" [active] [ref=e63]':
            - generic [ref=e64]: "1"
            - generic [ref=e65]: Advances crafting-agent
            - strong [ref=e66]: Sunline Beam
            - generic [ref=e67]: "Effect: Unlocks the Sunline Beam: 16 damage across 13m every 0.7s."
            - generic [ref=e69]: EVERY RUN
          - 'button "2 Advances crafting-agent Continued Study: Seam Yield Effect: +1% seam panning yield. EVERY RUN" [ref=e70]':
            - generic [ref=e71]: "2"
            - generic [ref=e72]: Advances crafting-agent
            - strong [ref=e73]: "Continued Study: Seam Yield"
            - generic [ref=e74]: "Effect: +1% seam panning yield."
            - generic [ref=e76]: EVERY RUN
        - paragraph [ref=e77]: Skip chooses neither proposal.
      - region "Best Claims" [ref=e78]:
        - heading "Best Claims" [level=2] [ref=e79]
        - list [ref=e80]:
          - listitem [ref=e81]:
            - generic [ref=e82]: wave 30 · baseless
            - strong [ref=e83]: SECURED
            - generic [ref=e84]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e85]:
            - generic [ref=e86]: wave 30 · baseless
            - strong [ref=e87]: SECURED
            - generic [ref=e88]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e89]:
            - generic [ref=e90]: wave 30 · baseless
            - strong [ref=e91]: SECURED
            - generic [ref=e92]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e93]:
            - generic [ref=e94]: wave 30 · baseless
            - strong [ref=e95]: SECURED
            - generic [ref=e96]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
          - listitem [ref=e97]:
            - generic [ref=e98]: wave 30 · baseless
            - strong [ref=e99]: SECURED
            - generic [ref=e100]: Robin · 30 waves · 10:00 · 40 turned back · 400 gold held · spark 0 / blast 0
      - generic [ref=e101]:
        - button "Keep this tape" [ref=e102]
        - button "Return to Town" [ref=e103]
        - button "Try Again" [ref=e104]
```

# Test source

```ts
  422 |           } catch (error) {
  423 |             row.moves = fail(String((error as Error).message).split('\n')[0]);
  424 |           }
  425 |         } else {
  426 |           row.moves = fail('skipped: boot failed');
  427 |         }
  428 | 
  429 |         // --- wave 2, or the practice objective for a contract that has no waves --------------
  430 |         if (row.boots.ok && contract.practice) {
  431 |           row.wave2 = await practiceObjective(page, contract.practice, row);
  432 |         } else if (row.boots.ok) {
  433 |           const started = Date.now();
  434 |           const deadline = started + WAVE_TIMEOUT_MS;
  435 |           let reached = 0;
  436 |           let runState = '';
  437 |           let simTick = 0;
  438 |           let hudWave = '';
  439 |           let diagWave = 0;
  440 |           let timeAlive = 0;
  441 |           let upgrades = 0;
  442 |           let pollError = '';
  443 |           while (Date.now() < deadline) {
  444 |             const snapshot = await page
  445 |               .evaluate(() => {
  446 |                 const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
  447 |                 return {
  448 |                   wave: diagnostics?.wave ?? 0,
  449 |                   hudWave: document.querySelector('[data-hud-wave-number]')?.textContent?.trim() ?? '',
  450 |                   timeAlive: diagnostics?.timeAlive ?? 0,
  451 |                   tick: diagnostics?.simulation?.tick ?? 0,
  452 |                   runState: String(diagnostics?.runState ?? ''),
  453 |                   upgrade: document.querySelector('[data-testid="upgrade-overlay"]')?.getAttribute('aria-hidden') === 'false',
  454 |                 };
  455 |               })
  456 |               .catch((error: Error) => {
  457 |                 pollError = String(error.message).split('\n')[0] ?? '';
  458 |                 return null;
  459 |               });
  460 |             if (!snapshot) break;
  461 |             // THE PLAYER'S WAVE, NOT THE SCHEDULER'S. `__THREE_GAME_DIAGNOSTICS__.wave` publishes
  462 |             // `waveSystem.diagnostics.wave` (src/game/Game.ts:5400), but the number on the HUD is
  463 |             // `Game.currentRunWave()` (src/game/Game.ts:6210), and on a deepwater storm contract
  464 |             // those are different counters: `deepwaterStormDisablesScheduledWaves`
  465 |             // (src/world/DeepwaterClaimTile.ts:174) turns the scheduled wave system OFF and the run
  466 |             // counts `deepwaterCorsairWavesSpawned` instead — so the diagnostics field sits at 0 for
  467 |             // the whole run while the player watches waves 1, 2, 3 tick by. Measured on e5-regatta:
  468 |             // HUD "1" at 5s, diagnostics.wave 0 after 263 sim-seconds. This smoke asks what the
  469 |             // OWNER will see, so it takes the larger of the two.
  470 |             reached = Math.max(reached, snapshot.wave, Number.parseInt(snapshot.hudWave, 10) || 0);
  471 |             runState = snapshot.runState;
  472 |             simTick = snapshot.tick;
  473 |             hudWave = snapshot.hudWave;
  474 |             diagWave = snapshot.wave;
  475 |             timeAlive = snapshot.timeAlive;
  476 |             if (reached >= 2) break;
  477 |             if (snapshot.runState === 'dead' || snapshot.runState === 'won') break;
  478 |             // A level-up freezes the sim behind the Patent Office; a player picks a card, so do we.
  479 |             if (snapshot.upgrade) {
  480 |               upgrades += 1;
  481 |               await page.keyboard.press('Digit1');
  482 |             }
  483 |             await page.waitForTimeout(500);
  484 |           }
  485 |           const elapsed = Date.now() - started;
  486 |           if (upgrades) row.notes.push(`picked ${upgrades} upgrade card(s)`);
  487 |           if (pollError) row.notes.push(`wave poll error: ${pollError}`);
  488 |           row.notes.push(`runState=${runState || 'unknown'} diagnosticsWave=${diagWave} hudWave=${hudWave} simTick=${simTick} timeAlive=${timeAlive.toFixed(1)}s waited=${(elapsed / 1_000).toFixed(1)}s`);
  489 |           row.wave2 =
  490 |             reached >= 2
  491 |               ? pass(`wave ${reached} after ${(elapsed / 1_000).toFixed(1)}s wall (sim ${timeAlive.toFixed(1)}s)`)
  492 |               : fail(
  493 |                   `reached wave ${reached} after ${(elapsed / 1_000).toFixed(1)}s wall / ${timeAlive.toFixed(1)}s sim at timescale ${TIMESCALE} (runState=${runState || 'unknown'}, HUD wave reads "${hudWave}", simTick=${simTick}${pollError ? `, poll error: ${pollError}` : ''})`,
  494 |                 );
  495 |         } else {
  496 |           row.wave2 = fail('skipped: boot failed');
  497 |         }
  498 | 
  499 |         // --- screenshot (always, even for a failed cell — a row without evidence is a claim) --
  500 |         try {
  501 |           const file = path.join(SHOT_DIR, `${contract.id}-${testInfo.project.name}.png`);
  502 |           const buffer = await page.screenshot({ fullPage: false });
  503 |           row.screenshotBytes = await shrinkTo(file, buffer, testInfo.project.name === 'mobile-chrome' ? 390 : 640);
  504 |           row.screenshot = path.relative(process.cwd(), file);
  505 |         } catch (error) {
  506 |           row.notes.push(`screenshot failed: ${String((error as Error).message).split('\n')[0]}`);
  507 |         }
  508 | 
  509 |         // --- clean -------------------------------------------------------------------------
  510 |         row.clean =
  511 |           consoleErrors.length === 0 && pageErrors.length === 0
  512 |             ? pass('0 console, 0 page')
  513 |             : fail(`${consoleErrors.length} console / ${pageErrors.length} page: ${[...consoleErrors, ...pageErrors].slice(0, 3).join(' || ')}`);
  514 |       } finally {
  515 |         await appendFile(ROWS_PATH, `${JSON.stringify(row)}\n`, 'utf8');
  516 |       }
  517 | 
  518 |       expect(row.boots.ok, `boots: ${row.boots.detail}`).toBe(true);
  519 |       expect(row.briefing.ok, `briefing: ${row.briefing.detail}`).toBe(true);
  520 |       expect(row.hud.ok, `HUD: ${row.hud.detail}`).toBe(true);
  521 |       expect(row.moves.ok, `moves: ${row.moves.detail}`).toBe(true);
> 522 |       expect(row.wave2.ok, `wave 2: ${row.wave2.detail}`).toBe(true);
      |                                                           ^ Error: wave 2: reached wave 1 after 5.6s wall / 37.9s sim at timescale 4 (runState=dead, HUD wave reads "1", simTick=296)
  523 |       expect(row.clean.ok, `clean: ${row.clean.detail}`).toBe(true);
  524 |       expect(row.screenshotBytes, 'screenshot exists and is under 300 KB').toBeGreaterThan(0);
  525 |       expect(row.screenshotBytes, 'screenshot is under 300 KB').toBeLessThan(300 * 1024);
  526 |     });
  527 |   }
  528 | });
  529 | 
```