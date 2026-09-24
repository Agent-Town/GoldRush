# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m2-06-arsenal-blast-charge.spec.ts >> turret line of sight ignores blocked nearest and shoots clear second target
- Location: e2e/m2-06-arsenal-blast-charge.spec.ts:131:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: 1
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
          - strong: 01:03
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - generic: Gold
        - strong: "10"
      - region "Active weapon":
        - generic: Weapon
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
        - button "Build - Close" [pressed] [ref=e10]
      - button "Pause the claim" [ref=e11]: P - catch your breath
    - region
    - generic:
      - status:
        - generic:
          - paragraph: Tavernkeeper
          - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
          - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
    - text: None None None
  - generic [ref=e12]:
    - button "▸ Game tuning" [ref=e13] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e14]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  55  |   await page.evaluate(([n, r]) => window.__GR_TEST__?.spawnPack(n, r, { speedScale: 0 }), [count, radius] as const);
  56  |   await expect
  57  |     .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.waveSpawnedTotal ?? 0))
  58  |     .toBeGreaterThanOrEqual(before + count);
  59  | }
  60  | 
  61  | async function grantGold(page: Page, amount: number): Promise<void> {
  62  |   await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  63  | }
  64  | 
  65  | async function placeBuildableAt(page: Page, id: BuildableId, x: number, z: number): Promise<void> {
  66  |   await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z + 2), { x, z });
  67  |   await page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId), id);
  68  |   await expect(page.evaluate(() => window.__GR_TEST__?.confirmBuild())).resolves.toBe(true);
  69  | }
  70  | 
  71  | test('toggle defaults to rig, then blast kills while rig owner stops', async ({ page }) => {
  72  |   const errors = await openGame(page);
  73  |   await easyEnemies(page, 24);
  74  |   await spawnFrozenPack(page, 1, 2);
  75  |   await expect.poll(() => ownerKills(page).then((kills) => kills.hero ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);
  76  |   expect((await ownerKills(page)).hero_blast ?? 0).toBe(0);
  77  |   expect((await ownerKills(page)).turrets ?? 0).toBe(0);
  78  | 
  79  |   await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  80  |   const rigKills = (await ownerKills(page)).hero ?? 0;
  81  |   await easyEnemies(page, 10);
  82  |   await toggleBlast(page);
  83  |   await aimBlastAtHero(page);
  84  |   await spawnFrozenPack(page, 1, 2);
  85  | 
  86  |   await expect.poll(() => ownerKills(page).then((kills) => kills.hero_blast ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);
  87  |   expect((await ownerKills(page)).hero ?? 0).toBe(rigKills);
  88  |   expect(errors.consoleErrors).toEqual([]);
  89  |   expect(errors.pageErrors).toEqual([]);
  90  | });
  91  | 
  92  | test('one blast detonation kills a frozen cluster once through hero_blast', async ({ page }) => {
  93  |   const errors = await openGame(page);
  94  |   await easyEnemies(page, 10);
  95  |   await toggleBlast(page);
  96  |   await aimBlastAtHero(page);
  97  |   await spawnFrozenPack(page, 4, 0.35);
  98  | 
  99  |   await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0), { timeout: 12_000 }).toBe(1);
  100 |   await expect.poll(() => ownerKills(page).then((kills) => kills.hero_blast ?? 0)).toBe(4);
  101 |   expect(await page.evaluate(() => window.__GR_TEST__?.state().enemiesAlive ?? -1)).toBe(0);
  102 |   expect(errors.consoleErrors).toEqual([]);
  103 |   expect(errors.pageErrors).toEqual([]);
  104 | });
  105 | 
  106 | test('blast friendly fire leaves hero and buildables intact, beacon still fires', async ({ page }) => {
  107 |   const errors = await openGame(page);
  108 |   await easyEnemies(page, 10);
  109 |   await setBalance(page, 'beacon.costBase', 0);
  110 |   await setBalance(page, 'palisade.cost', 0);
  111 |   await grantGold(page, 10);
  112 |   await placeBuildableAt(page, 'sentry_beacon', -2, 12);
  113 |   await placeBuildableAt(page, 'palisade', 1, 11);
  114 |   const hpBefore = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 0);
  115 | 
  116 |   await toggleBlast(page);
  117 |   await spawnFrozenPack(page, 1, 2);
  118 |   await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0), { timeout: 12_000 }).toBe(1);
  119 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.hp ?? 0)).toBe(hpBefore);
  120 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0)).toBe(1);
  121 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? 0)).toBe(1);
  122 | 
  123 |   await page.evaluate(() => window.__GR_TEST__?.clearEnemies());
  124 |   await page.evaluate(() => window.__GR_TEST__?.teleport(20, 20));
  125 |   await page.evaluate(() => window.__GR_TEST__?.spawnEnemyAt(-2, 10));
  126 |   await expect.poll(() => ownerKills(page).then((kills) => kills.beacons ?? 0), { timeout: 12_000 }).toBeGreaterThan(0);
  127 |   expect(errors.consoleErrors).toEqual([]);
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
> 155 |   expect(await page.evaluate(() => window.__GR_TEST__?.state().arsenal.turretKills ?? 0)).toBe(0);
      |                                                                                           ^ Error: expect(received).toBe(expected) // Object.is equality
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
  228 |   await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.state().arsenal.detonations ?? 0), { timeout: 15_000 }).toBeGreaterThan(0);
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