# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m2-06-arsenal-blast-charge.spec.ts >> stress blast pool never exceeds cap
- Location: e2e/m2-06-arsenal-blast-charge.spec.ts:212:1

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - generic: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 0 / 100
        - generic:
          - generic: Time
          - strong: 00:15
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - generic: Gold
        - strong: "0"
      - region "Active weapon":
        - generic: Weapon
        - strong: Blast Charge
        - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
          - generic [ref=e5]:
            - generic [ref=e6]: the Prospector
            - strong [ref=e7]: L0
            - generic [ref=e8]: suggest-only
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "2"
          - strong: 0 / 20 XP
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
            - definition [ref=e20]: 00:15
          - generic [ref=e21]:
            - term [ref=e22]: Claim Jumpers Turned Back
            - definition [ref=e23]: "5"
          - generic [ref=e24]:
            - term [ref=e25]: Waves Survived
            - definition [ref=e26]: "0"
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
            - definition [ref=e47]: 248 / 0
          - generic [ref=e48]:
            - term [ref=e49]: Blast Toggles
            - definition [ref=e50]: "0"
          - generic [ref=e51]:
            - term [ref=e52]: Blast Charge Time
            - definition [ref=e53]: 00:00
          - generic [ref=e54]:
            - term [ref=e55]: Upgrades Taken
            - definition [ref=e56]: none
        - paragraph [ref=e57]: "Science: 0 steps - 6 to the Steamworks"
        - region "Research proposal" [ref=e58]:
          - paragraph [ref=e59]: Research pick 1 of 1
          - heading "The Elder proposes..." [level=2] [ref=e60]
          - generic [ref=e61]:
            - 'button "1 Advances economy Assay Grading Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight. EVERY RUN" [active] [ref=e62]':
              - generic [ref=e63]: "1"
              - generic [ref=e64]: Advances economy
              - strong [ref=e65]: Assay Grading
              - generic [ref=e66]: "Effect: Prospecting cards add +35 stockpile cap per stack and +1.25 offer weight."
              - generic [ref=e68]: EVERY RUN
            - 'button "2 Advances arsenal Chain Spark Primer Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate. EVERY RUN" [ref=e69]':
              - generic [ref=e70]: "2"
              - generic [ref=e71]: Advances arsenal
              - strong [ref=e72]: Chain Spark Primer
              - generic [ref=e73]: "Effect: Adds Chain Spark Arc to run offers: +12% fire rate, +12% beacon fire rate."
              - generic [ref=e75]: EVERY RUN
          - paragraph [ref=e76]: Skip chooses neither proposal.
        - region "Best Claims" [ref=e77]:
          - heading "Best Claims" [level=2] [ref=e78]
          - list [ref=e79]:
            - listitem [ref=e80]:
              - generic [ref=e81]: wave 0 · baseless
              - strong [ref=e82]: OVERRUN
              - generic [ref=e83]: Robin · 0 waves · 00:15 · 5 turned back · 0 gold held · spark 248 / blast 0
        - generic [ref=e84]:
          - button "Keep this tape" [ref=e85]
          - button "Return to Town" [ref=e86]
          - button "Try Again" [ref=e87]
    - status [ref=e88] [cursor=pointer]:
      - generic [ref=e89]:
        - paragraph [ref=e90]: Assay Clerk
        - paragraph [ref=e91]: "The ledger gains a page: Claim Jumper."
        - paragraph [ref=e92]: Open it before the next trail.
    - text: None None None
  - generic [ref=e93]:
    - button "▸ Game tuning" [ref=e94] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e95]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  128 |   expect(errors.pageErrors).toEqual([]);
  129 | });
  130 | 
  131 | test('turret line of sight ignores blocked nearest and shoots clear second target', async ({ page }) => {
  132 |   const errors = await openGame(page);
  133 |   await easyEnemies(page, 10);
  134 |   await setBalance(page, 'palisade.cost', 0);
  135 |   await setBalance(page, 'turret.costBase', 0);
  136 |   await grantGold(page, 10);
  137 |   await placeBuildableAt(page, 'palisade', 0, 10);
  138 |   await placeBuildableAt(page, 'turret', 0, 12);
  139 |   await page.evaluate(() => window.__GR_TEST__?.teleport(20, 20));
  140 | 
  141 |   await page.evaluate(() => {
  142 |     const w = window as unknown as { __m206TurretTrack: { samples: number; maxKills: number } };
  143 |     w.__m206TurretTrack = { samples: 0, maxKills: 0 };
  144 |     const tick = () => {
  145 |       const track = w.__m206TurretTrack;
  146 |       track.samples += 1;
  147 |       track.maxKills = Math.max(track.maxKills, window.__GR_TEST__?.state().arsenal.turretKills ?? 0);
  148 |       requestAnimationFrame(tick);
  149 |     };
  150 |     requestAnimationFrame(tick);
  151 |   });
  152 | 
  153 |   await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, 8));
  154 |   await page.waitForTimeout(2200);
  155 |   expect(await page.evaluate(() => window.__GR_TEST__?.state().arsenal.turretKills ?? 0)).toBe(0);
  156 |   expect(await page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? 0)).toBe(1);
  157 | 
  158 |   await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(6, 12));
  159 |   await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.turretKills ?? 0), { timeout: 12_000 }).toBe(1);
  160 |   const track = await page.evaluate(() => (window as unknown as { __m206TurretTrack: { samples: number; maxKills: number } }).__m206TurretTrack);
  161 |   expect(track.samples).toBeGreaterThan(2);
  162 |   expect(track.maxKills).toBe(1);
  163 |   expect(await page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? 0)).toBe(1);
  164 |   expect(errors.consoleErrors).toEqual([]);
  165 |   expect(errors.pageErrors).toEqual([]);
  166 | });
  167 | 
  168 | test('slot 5 selects turret, spends once, and HUD gold matches replay', async ({ page }) => {
  169 |   const errors = await openGame(page);
  170 |   await grantGold(page, 75);
  171 |   await page.keyboard.press('KeyB');
  172 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.ui?.buildMenuOpen ?? false)).toBe(true);
  173 |   await expect(page.locator('[data-testid="hud-build-tile-turret"]')).toBeVisible();
  174 |   await page.keyboard.press('Digit5');
  175 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.selectedBuildable)).toBe('turret');
  176 |   await page.keyboard.press('Enter');
  177 | 
  178 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.turrets ?? 0)).toBe(1);
  179 |   const spent = await page.evaluate(() =>
  180 |     (window.__GR_TEST__?.economyLog() ?? []).filter((event) => (event as { sink?: string }).sink === 'build_turret').length,
  181 |   );
  182 |   expect(spent).toBe(1);
  183 |   const diag = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__);
  184 |   expect(diag?.ui?.gold).toBe(diag?.economy.replay.gold);
  185 |   expect(errors.consoleErrors).toEqual([]);
  186 |   expect(errors.pageErrors).toEqual([]);
  187 | });
  188 | 
  189 | test('real waves stay neutral without toggling or turrets', async ({ page }) => {
  190 |   const errors = await openGame(page, '?debug&timescale=12&nokill&nolevel&nopause&seed=m2-06-neutral');
  191 |   await page.evaluate(() => {
  192 |     window.__GR_TEST__?.setBalance('waves.waveInterval', 2);
  193 |     window.__GR_TEST__?.setBalance('waves.trickleInterval', 9999);
  194 |     window.__GR_TEST__?.setBalance('waves.pulseBase', 3);
  195 |     window.__GR_TEST__?.setBalance('waves.pulsePerWave', 0);
  196 |     window.__GR_TEST__?.setBalance('waves.pulsesPerWave', 1);
  197 |     window.__GR_TEST__?.setBalance('waves.edgesPerPulse', 1);
  198 |     window.__GR_TEST__?.resetRun();
  199 |   });
  200 | 
  201 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0), { timeout: 10_000 }).toBeGreaterThan(0);
  202 |   const state = await page.evaluate(() => window.__GR_TEST__?.state().arsenal);
  203 |   expect(state?.active).toBe('rig');
  204 |   expect(state?.detonations).toBe(0);
  205 |   const kills = await ownerKills(page);
  206 |   expect(kills.hero_blast ?? 0).toBe(0);
  207 |   expect(kills.turrets ?? 0).toBe(0);
  208 |   expect(errors.consoleErrors).toEqual([]);
  209 |   expect(errors.pageErrors).toEqual([]);
  210 | });
  211 | 
  212 | test('stress blast pool never exceeds cap', async ({ page }) => {
  213 |   const errors = await openGame(page, '?debug&timescale=10&nolevel&nopause&stress=60&seed=m2-06-stress');
  214 |   await easyEnemies(page, 10);
  215 |   await toggleBlast(page);
  216 |   await page.evaluate(() => {
  217 |     const w = window as unknown as { __m206BlastTrack: { samples: number; maxAlive: number } };
  218 |     w.__m206BlastTrack = { samples: 0, maxAlive: 0 };
  219 |     const tick = () => {
  220 |       const track = w.__m206BlastTrack;
  221 |       track.samples += 1;
  222 |       track.maxAlive = Math.max(track.maxAlive, window.__GR_TEST__?.state().arsenal.blastsAlive ?? 0);
  223 |       requestAnimationFrame(tick);
  224 |     };
  225 |     requestAnimationFrame(tick);
  226 |   });
  227 | 
> 228 |   await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0), { timeout: 15_000 }).toBeGreaterThan(0);
      |                                                                                                                           ^ Error: expect(received).toBeGreaterThan(expected)
  229 |   // Give the rAF tracker time to actually sample: at ~6fps one poll round-trip spans ~2 frames,
  230 |   // so asserting samples>2 immediately after the detonation poll is a coin flip (s25 gate, env A/B-proven).
  231 |   await expect
  232 |     .poll(
  233 |       () => page.evaluate(() => (window as unknown as { __m206BlastTrack: { samples: number } }).__m206BlastTrack.samples),
  234 |       { timeout: 10_000 },
  235 |     )
  236 |     .toBeGreaterThan(2);
  237 |   const track = await page.evaluate(() => (window as unknown as { __m206BlastTrack: { samples: number; maxAlive: number } }).__m206BlastTrack);
  238 |   expect(track.samples).toBeGreaterThan(2);
  239 |   expect(track.maxAlive).toBeGreaterThan(0);
  240 |   expect(track.maxAlive).toBeLessThanOrEqual(Balance.blast.pool);
  241 |   expect(errors.consoleErrors).toEqual([]);
  242 |   expect(errors.pageErrors).toEqual([]);
  243 | });
  244 | 
```