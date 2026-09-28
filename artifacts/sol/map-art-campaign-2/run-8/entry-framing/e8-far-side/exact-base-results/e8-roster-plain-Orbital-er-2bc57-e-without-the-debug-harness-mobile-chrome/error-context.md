# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e8-roster.spec.ts >> plain Orbital-era boot stays error-free without the debug harness
- Location: e2e/e8-roster.spec.ts:172:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - generic:
    - status [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - paragraph [ref=e7]: The Contract
          - button "Begin" [ref=e8] [cursor=pointer]
        - heading "The Claim" [level=2] [ref=e9]
        - paragraph [ref=e10]: The classic river claim.
        - generic [ref=e11]:
          - generic [ref=e12]:
            - paragraph [ref=e13]: Goals
            - list [ref=e14]:
              - listitem [ref=e15]: Survive through wave 10.
          - generic [ref=e16]:
            - paragraph [ref=e17]: Rules
            - list [ref=e18]:
              - listitem [ref=e19]: The river splits the claim around one center ford.
              - listitem [ref=e20]: Pressure comes from all four edges until wave 10 seals the claim; stay for the Rush if you want to press your luck.
    - generic "Wave status":
      - generic:
        - generic: "the Prospector: follows and observes. Chip by weapon; claim wins grow it."
    - region "Run vitals":
      - generic:
        - generic: HP
        - strong: 100 / 100
      - generic:
        - generic: Time
        - strong: 00:01
      - generic:
        - generic: Wave
        - strong: "0"
    - region "Gold pouch":
      - generic: Gold
      - strong: "0"
    - region "Active weapon":
      - generic: Weapon
      - strong: Spark Rig
      - button "Prospector permission chip" [ref=e21] [cursor=pointer]:
        - generic [ref=e22]:
          - generic [ref=e23]: the Prospector
          - strong [ref=e24]: L0
          - generic [ref=e25]: suggest-only
    - region "Experience":
      - generic:
        - generic:
          - text: Level
          - strong: "1"
        - strong: 0 / 12 XP
    - region "Build":
      - button "Build" [ref=e27]
    - button "Pause the claim" [ref=e28]: catch your breath
    - status: the claim is raising… 21/30
    - generic: Swipe to scroll
  - generic:
    - button [ref=e31]: Rotate
    - button [ref=e32]: Weapon
    - button [ref=e33]: OK
  - region
```

# Test source

```ts
  83  |     const harness = window.__GR_TEST__!;
  84  |     harness.setBalance('waves.waveInterval', 0.35);
  85  |     harness.setBalance('waves.pulseBase', 2);
  86  |     harness.setBalance('waves.pulsePerWave', 0);
  87  |     harness.setBalance('waves.pulsesPerWave', 1);
  88  |     harness.setBalance('waves.edgesPerPulse', 1);
  89  |     const waves = new WaveSystem(
  90  |       enemies as never,
  91  |       { x: 0, y: 0, z: 0 } as never,
  92  |       createRng('e8-direct-wave'),
  93  |       () => {},
  94  |       () => true,
  95  |       () => false,
  96  |       () => contract as never,
  97  |     );
  98  |     waves.setWaveForTest(3);
  99  |     waves.update(0.6);
  100 |     return spawned;
  101 |   });
  102 |   expect(e8Wave).toEqual(expect.arrayContaining([
  103 |     expect.objectContaining({ variantId: 'scrap_corsair', visualScale: 1.1, thief: false, tint: '#7fa0a8' }),
  104 |     expect.objectContaining({ variantId: 'sun_glare_shambler', visualScale: 0.8, thief: false, tint: '#caa25a' }),
  105 |   ]));
  106 |   expect(poolsSource).toContain('createEnemySpritePresentation(variantId, binding.slot, e8EnemySpriteBinding(variantId)?.placeholder === true)');
  107 |   expect(poolsSource.match(/renderOrder: RenderLayers\.gameplay(?:Fade)?, lazy: true/g)).toHaveLength(2);
  108 |   // Re-pointed 2026-09-15 (task sprite-animator-runtime-land; F-SPR-05 / F-SPR-21, tasks/PROPOSED-sprite-source-assertions-20260908.md):
  109 |   // the shared-animation loading guard this line used to pin is GONE. Astra's repair gave every occupied pool slot
  110 |   // its own cursor and its own cloned primary/fade material, released on recycle. Assert that ownership instead:
  111 |   // the lazy gate that replaced the guard, the per-body material clone, and the per-id animator registration.
  112 |   expect(poolsSource).toContain('if (!sprites.isLoaded) return null;');
  113 |   expect(poolsSource).toContain('sprite.material = sprites.cloneMaterial();');
  114 |   expect(poolsSource).toContain('this.spriteAnimations.set(enemy.id, { slotId, sprites, fades, sprite, fade, animator });');
  115 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer.calls)).toBeLessThanOrEqual(200);
  116 |   expect(errors).toEqual({ console: [], page: [] });
  117 | });
  118 | 
  119 | test('E8 placeholders preserve roster stats and cure-arms exits', async ({ page }, testInfo) => {
  120 |   await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({
  121 |     version: 1,
  122 |     steps: 5,
  123 |     taken: ['vacuum_lenses', 'lens_turret', 'breach_seals', 'magnet_grapple'],
  124 |     proposalSalt: 0,
  125 |     pinnedTarget: null,
  126 |   })), { key: profileDataKey('robin', researchStateKey('epoch-8-orbital')) });
  127 |   const errors = await open(page, E8, 'e8-roster-outcomes');
  128 |   const result = await page.evaluate(async ({ roster, variants }) => {
  129 |     const harness = window.__GR_TEST__!;
  130 |     harness.teleport(-5, 0);
  131 |     harness.spawnPack(1, 0.1, { ...variants.scrap_corsair, variantId: 'scrap_corsair', variantLabel: 'Scrap Corsair', hpScale: 100, speedScale: 0 });
  132 |     harness.teleport(5, 0);
  133 |     harness.spawnPack(1, 0.1, { ...variants.sun_glare_shambler, variantId: 'sun_glare_shambler', variantLabel: 'Sun-Glare Shambler', hpScale: 100, speedScale: 0 });
  134 |     harness.teleport(0, 3);
  135 |     harness.advanceSim(0.1);
  136 |     const spawned = harness.enemyPositions();
  137 |     const modulePath = '/src/entities/pools.ts';
  138 |     const { e8EnemySpriteBinding } = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/entities/pools');
  139 |     return {
  140 |       spawned,
  141 |       bindings: roster.map((id) => e8EnemySpriteBinding(id)),
  142 |     };
  143 |   }, { roster: ROSTER, variants: Balance.e8Roster.variants });
  144 | 
  145 |   expect(result.spawned.find((enemy) => enemy.variantId === 'scrap_corsair')).toMatchObject({ scale: 1.1, thief: false });
  146 |   expect(result.spawned.find((enemy) => enemy.variantId === 'sun_glare_shambler')).toMatchObject({ scale: 0.8, thief: false });
  147 |   expect(result.bindings).toEqual([
  148 |     expect.objectContaining({ sheet: 'char-e8-scrap_corsair-sheet-walk8.png', placeholder: false }),
  149 |     expect.objectContaining({ sheet: 'char-e8-sun_glare_shambler-sheet-walk8.png', placeholder: false }),
  150 |   ]);
  151 | 
  152 |   mkdirSync(SHOT_DIR, { recursive: true });
  153 |   await page.waitForTimeout(250);
  154 |   await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-placeholders.png`) });
  155 |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers?.spawned ?? 0);
  156 |   await page.evaluate(({ variants }) => {
  157 |     const harness = window.__GR_TEST__!;
  158 |     harness.clearEnemies();
  159 |     harness.spawnPack(1, 4, { ...variants.scrap_corsair, variantId: 'scrap_corsair', variantLabel: 'Scrap Corsair', hpScale: 0.05, speedScale: 0 });
  160 |     harness.spawnPack(1, 5, { ...variants.sun_glare_shambler, variantId: 'sun_glare_shambler', variantLabel: 'Sun-Glare Shambler', hpScale: 0.05, speedScale: 0 });
  161 |   }, { variants: Balance.e8Roster.variants });
  162 |   await expect.poll(() => page.evaluate(() => {
  163 |     window.__GR_TEST__!.advanceSim(0.2);
  164 |     return window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers?.spawned ?? 0;
  165 |   })).toBeGreaterThanOrEqual(before + 2);
  166 |   const fires = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal.fires);
  167 |   expect(fires.sunlineBeam).toBeGreaterThan(0);
  168 |   expect(fires.kineticLobber).toBeGreaterThan(0);
  169 |   expect(errors).toEqual({ console: [], page: [] });
  170 | });
  171 | 
  172 | test('plain Orbital-era boot stays error-free without the debug harness', async ({ page }) => {
  173 |   const errors: Errors = { console: [], page: [] };
  174 |   page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  175 |   page.on('pageerror', (error) => errors.page.push(error.message));
  176 |   await page.addInitScript(
  177 |     ({ key }) => localStorage.setItem(key, 'epoch-8-orbital'),
  178 |     { key: profileDataKey('robin', ACTIVE_EPOCH_KEY) },
  179 |   );
  180 |   await page.goto('/?contract=e8-mare-claim&nowaves&nolevel&nopause&seed=e8-roster-plain');
  181 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  182 |   expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
> 183 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal.available)).toBe(true);
      |                                                                                             ^ Error: expect(received).toBe(expected) // Object.is equality
  184 |   expect(errors).toEqual({ console: [], page: [] });
  185 | });
  186 | 
```