# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e1-twin-banks.spec.ts >> routes enemies through both west and east fords
- Location: e2e/e1-twin-banks.spec.ts:122:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - generic: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 04:00
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - strong: "0"
      - region "Active weapon":
        - strong: Spark Rig
        - button "Prospector permission chip" [ref=e4] [cursor=pointer]:
          - generic [ref=e5]:
            - generic [ref=e6]: the Prospector
            - strong [ref=e7]: L0
            - generic [ref=e8]: suggest-only
      - region "Experience":
        - generic:
          - generic:
            - text: Level
            - strong: "1"
          - strong: 0 / 12 XP
      - region "Build":
        - button "Build" [ref=e10]
      - button "Pause the claim" [ref=e11]: catch your breathⅡ
      - generic [ref=e12]:
        - text: Swipe to scroll
        - group [ref=e13]:
          - generic "Claim Stake" [ref=e14] [cursor=pointer]
          - paragraph [ref=e15]: The heart of the claim. Lose it and the run is done.
    - generic:
      - button [ref=e18]: Rotate
      - button [ref=e19]: Weapon
      - button [ref=e20]: OK
    - status [ref=e21] [cursor=pointer]:
      - generic [ref=e22]:
        - paragraph [ref=e23]: Assay Clerk
        - paragraph [ref=e24]: "The ledger gains a page: Claim Jumper."
        - paragraph [ref=e25]: Open it before the next trail.
    - region
    - text: None None None
  - generic [ref=e26]:
    - button "▸ Game tuning" [ref=e27] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e28]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  128 |   await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-16, 14));
  129 |   await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(16, 14));
  130 |   await page.waitForTimeout(450);
  131 |   await shot(page, testInfo, 'north-plot-skirmish');
  132 |   expectClean(errors);
  133 | });
  134 |
  135 | test('north marker is not the run loss stake, south overrun still ends the run, and waves use the two ford-forcing edges', async ({ page }) => {
  136 |   const errors = await openGame(
  137 |     page,
  138 |     '?debug&contract=e1-twin-banks&timescale=20&nolevel&nokill&nopause&nosteal&nowreck&seed=e1-twin-spawns',
  139 |   );
  140 |   const markers = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.tileParams.stakeMarkers ?? []);
  141 |   expect(markers.find((marker) => marker.id === 'north-expansion-marker')?.heroStart).toBe(false);
  142 |   expect(markers.find((marker) => marker.id === 'south-claim-stake')?.heroStart).toBe(true);
  143 |
  144 |   for (const [key, value] of [
  145 |     ['enemy.speed', 0],
  146 |     ['waves.graceSeconds', 0.1],
  147 |     ['waves.waveInterval', 2],
  148 |     ['waves.trickleInterval', 999],
  149 |     ['waves.pulseBase', 4],
  150 |     ['waves.pulsePerWave', 0],
  151 |     ['waves.pulsesPerWave', 1],
  152 |     ['waves.edgesPerPulse', 4],
  153 |     ['waves.aliveCap', 8],
  154 |   ] as const) {
  155 |     await setBalance(page, key, value);
  156 |   }
  157 |   await page.evaluate(() => window.__GR_TEST__?.resetRun());
  158 |   await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0), { timeout: 10_000 }).toBeGreaterThanOrEqual(4);
  159 |   const edges = await page.evaluate(() => [...new Set(window.__GR_TEST__?.enemyPositions().map((enemy) => enemy.edge).filter(Boolean))].sort());
  160 |   // RE-POINTED 2026-09-19 (`tasks/rulings-play-2026-09-19.md`, F-OMA-4). Owner ruling of the same
  161 |   // day, verbatim: "I agree with all your recommendations on the decisions - good work" — the desk
  162 |   // register's F-OMA-4 row reads "Yes. Small and reversible; one word."
  163 |   //
  164 |   // WAS `['east', 'north', 'south', 'west']`. The claim's own briefing rule 2 says "Two fords carry
  165 |   // pressure across the river", and the data had never made that sentence true: no E1 contract
  166 |   // authors `spawnGates`, so `WaveSystem.spawnAt` places every body on the HERO-CENTRED ring at
  167 |   // `Balance.waves.spawnRingRadius` = 26 from EACH listed edge, and with all four listed the ring
  168 |   // closed from every quarter at once — nothing ever had to find a ford. With east and west gone,
  169 |   // the north half of every wave has to reach a ford at x = ±16 and cross it
  170 |   // (`Balance.pathing.riverBlocksEnemies`), and the wave BUDGET does not move at all because
  171 |   // `WaveSystem.planWave` sizes a wave from `waveBudget(wave)` rather than from the edge count.
  172 |   //
  173 |   // The cure was made, measured and reverted once already, on 2026-09-18, for exactly this
  174 |   // assertion: `artifacts/open-maps-acceptance-e1-e4/report.md` §5c landed it as `196c811d1` and
  175 |   // pulled it as `742a53898` because re-pointing this line was outside that task's firewall, and
  176 |   // filed the two-edit commit a drainer would need. This is that commit's second edit.
  177 |   expect(edges).toEqual(['north', 'south']);
  178 |   expectClean(errors);
  179 |
  180 |   const overrunErrors = await openGame(
  181 |     page,
  182 |     '?debug&contract=e1-twin-banks&timescale=12&nolevel&nowaves&nopause&nosteal&nowreck&seed=e1-twin-overrun',
  183 |   );
  184 |   await setBalance(page, 'enemy.contactDamage', 200);
  185 |   await setBalance(page, 'enemy.speed', 4);
  186 |   await expect(page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(0, -10))).resolves.toBe(true);
  187 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState), { timeout: 8_000 }).toBe('dead');
  188 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.run.lastRunEndedReason)).toBe('death');
  189 |   expectClean(overrunErrors);
  190 | });
  191 |
  192 | test('seeded Twin Banks diagnostics are stable', async ({ page }) => {
  193 |   const errors = await openGame(page, '?debug&contract=e1-twin-banks&timescale=3&nolevel&nowaves&seed=e1-twin-stable');
  194 |   const first = await determinismSnapshot(page);
  195 |   await openGame(page, '?debug&contract=e1-twin-banks&timescale=3&nolevel&nowaves&seed=e1-twin-stable');
  196 |   const second = await determinismSnapshot(page);
  197 |   expect(second).toEqual(first);
  198 |   expectClean(errors);
  199 | });
  200 |
  201 | async function assertFordRoute(page: Page, fordX: number): Promise<void> {
  202 |   await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  203 |   await expect(page.evaluate((x) => window.__GR_TEST__?.spawnEnemyAt(x, 14), fordX)).resolves.toBe(true);
  204 |   await page.evaluate((x) => {
  205 |     const w = window as unknown as {
  206 |       __twinRoute?: { deepSamples: number; fordSamples: number; reached: boolean; samples: number };
  207 |     };
  208 |     w.__twinRoute = { deepSamples: 0, fordSamples: 0, reached: false, samples: 0 };
  209 |     const tick = () => {
  210 |       const track = w.__twinRoute;
  211 |       if (!track) return;
  212 |       const enemy = window.__GR_TEST__?.enemyPositions()[0];
  213 |       const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
  214 |       if (enemy && hero) {
  215 |         track.samples += 1;
  216 |         if (enemy.zone === 'river') track.deepSamples += 1;
  217 |         if (enemy.zone === 'ford' && Math.abs(enemy.x - x) <= 3.2) track.fordSamples += 1;
  218 |         if (Math.hypot(enemy.x - hero.x, enemy.z - hero.z) < 1.4) track.reached = true;
  219 |       }
  220 |       if (!track.reached) requestAnimationFrame(tick);
  221 |     };
  222 |     requestAnimationFrame(tick);
  223 |   }, fordX);
  224 |   await expect
  225 |     .poll(() => page.evaluate(() => (window as unknown as { __twinRoute?: { reached: boolean } }).__twinRoute?.reached ?? false), {
  226 |       timeout: 15_000,
  227 |     })
> 228 |     .toBe(true);
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  229 |   const track = await page.evaluate(() => (window as unknown as { __twinRoute?: { deepSamples: number; fordSamples: number } }).__twinRoute);
  230 |   expect(track?.deepSamples).toBe(0);
  231 |   expect(track?.fordSamples ?? 0).toBeGreaterThan(0);
  232 | }
  233 |
  234 | async function determinismSnapshot(page: Page): Promise<unknown> {
  235 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  236 |   return page.evaluate(() => {
  237 |     const diagnostics = window.__THREE_GAME_DIAGNOSTICS__!;
  238 |     return {
  239 |       contract: diagnostics.contract.activeId,
  240 |       hero: diagnostics.heroPos,
  241 |       water: diagnostics.terrain.water
  242 |         ? {
  243 |             foam: diagnostics.terrain.water.foam,
  244 |             fordPresent: diagnostics.terrain.water.fordPresent,
  245 |             fordStones: diagnostics.terrain.water.fordStones,
  246 |             glints: diagnostics.terrain.water.glints,
  247 |             material: diagnostics.terrain.water.material,
  248 |             mobile: diagnostics.terrain.water.mobile,
  249 |             quality: diagnostics.terrain.water.quality,
  250 |             riverPresent: diagnostics.terrain.water.riverPresent,
  251 |             springPonds: diagnostics.terrain.water.springPonds,
  252 |             waterPhaseVariance: diagnostics.terrain.water.waterPhaseVariance,
  253 |           }
  254 |         : null,
  255 |       scatter: diagnostics.terrain.detailScatter?.signature ?? null,
  256 |       stakes: diagnostics.contract.tileParams.stakeMarkers,
  257 |       fords: diagnostics.contract.tileParams.fords,
  258 |       harvest: diagnostics.harvest.activeNodes.map((node) => ({
  259 |         active: node.active,
  260 |         anchorIndex: node.anchorIndex,
  261 |         position: node.position,
  262 |         remaining: node.remaining,
  263 |       })),
  264 |       samples: [
  265 |         window.__GR_TEST__?.terrainSample(-16, 0),
  266 |         window.__GR_TEST__?.terrainSample(16, 0),
  267 |         window.__GR_TEST__?.terrainSample(0, -12),
  268 |         window.__GR_TEST__?.terrainSample(0, 12),
  269 |       ],
  270 |     };
  271 |   });
  272 | }
  273 |
  274 | // Run 10: exercise the actual scatter owner against the delivered GLB height source.
  275 | test('riparian scatter keeps its counts and clears both build banks and fords', async ({ page }) => {
  276 |   await page.goto('/?debug&epoch=epoch-1-frontier&contract=e1-twin-banks&nowaves&seed=code-presentation&tier=full');
  277 |   await page.waitForFunction(() => document.querySelector('#game-canvas')?.getAttribute('data-terrain3d-pilot-landmark-load-state') === 'mounted');
  278 |   const result = await page.evaluate(async () => {
  279 |     const { DetailScatter } = await Function('return import("/src/world/Scatter.ts")')();
  280 |     const terrain = await Function('return import("/src/world/Terrain.ts")')();
  281 |     const { activeContract } = await Function('return import("/src/meta/ContractFamilies.ts")')();
  282 |     const scatter = new DetailScatter(), tile = activeContract().tileParams;
  283 |     const details = scatter.seededInstances as Array<{ x: number; y: number; z: number }>;
  284 |     const result = { count: scatter.diagnostics().seededInstances, kinds: scatter.classes.filter((c: { instances: unknown[] }) => c.instances.length).map((c: { profile: { material: { userData: { riparianCard: string } } } }) => c.profile.material.userData.riparianCard),
  285 |       grounded: details.every(d => Math.abs(d.y - terrain.visualY(d.x, d.z, -0.025)) < 1e-7),
  286 |       clear: details.every(d => !tile.buildZones.some((b: { minX: number; maxX: number; minZ: number; maxZ: number }) => d.x >= b.minX - 1 && d.x <= b.maxX + 1 && d.z >= b.minZ - 1 && d.z <= b.maxZ + 1) && !tile.fords.some((f: { x: number; halfWidth: number }) => Math.abs(d.x - f.x) < f.halfWidth + 1 && Math.abs(d.z) < 7)) };
  287 |     scatter.dispose(); return result;
  288 |   });
  289 |   expect(result.count).toBe(test.info().project.name === 'mobile-chrome' ? 102 : 248);
  290 |   expect(result.kinds).toEqual(['driftwood', 'willow', 'reeds', 'driftwood', 'willow', 'reeds']);
  291 |   expect(result.grounded).toBe(true); expect(result.clear).toBe(true);
  292 | });
  293 |
```
