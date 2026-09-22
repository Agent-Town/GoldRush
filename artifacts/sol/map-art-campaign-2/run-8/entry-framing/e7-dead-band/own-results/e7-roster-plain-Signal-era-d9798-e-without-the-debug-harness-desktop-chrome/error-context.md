# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e7-roster.spec.ts >> plain Signal-era boot stays error-free without the debug harness
- Location: e2e/e7-roster.spec.ts:164:1

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
    - button "Pause the claim" [ref=e28]: P - catch your breath
    - status: the claim is raising… 21/30
  - region
```

# Test source

```ts
  75  |       spawn: (_position: unknown, options: Record<string, unknown>) => {
  76  |         spawned.push(options);
  77  |         enemies.activeCount += 1;
  78  |         return {};
  79  |       },
  80  |     };
  81  |     const contract = window.__GR_CONTRACT_REGISTRY__!.loadContract('e7-relay-valley', 'epoch-7-signal');
  82  |     const harness = window.__GR_TEST__!;
  83  |     harness.setBalance('waves.waveInterval', 0.35);
  84  |     harness.setBalance('waves.pulseBase', 2);
  85  |     harness.setBalance('waves.pulsePerWave', 0);
  86  |     harness.setBalance('waves.pulsesPerWave', 1);
  87  |     harness.setBalance('waves.edgesPerPulse', 1);
  88  |     const waves = new WaveSystem(
  89  |       enemies as never,
  90  |       { x: 0, y: 0, z: 0 } as never,
  91  |       createRng('e7-direct-wave'),
  92  |       () => {},
  93  |       () => true,
  94  |       () => false,
  95  |       () => contract as never,
  96  |     );
  97  |     waves.setWaveForTest(3);
  98  |     waves.update(0.6);
  99  |     return spawned;
  100 |   });
  101 |   expect(e7Wave).toEqual(expect.arrayContaining([
  102 |     expect.objectContaining({ variantId: 'rogue_automaton', visualScale: 1, thief: false, tint: '#5b8a8a' }),
  103 |     expect.objectContaining({ variantId: 'data_rustler', visualScale: 1, thief: true, tint: '#c4883a' }),
  104 |   ]));
  105 |   expect(poolsSource).toContain('createEnemySpritePresentation(variantId, binding.slot, e7EnemySpriteBinding(variantId)?.placeholder === true)');
  106 |   expect(poolsSource.match(/renderOrder: RenderLayers\.gameplay(?:Fade)?, lazy: true/g)).toHaveLength(2);
  107 |   // Re-pointed 2026-09-15 (task sprite-animator-runtime-land; F-SPR-05 / F-SPR-21, tasks/PROPOSED-sprite-source-assertions-20260908.md):
  108 |   // the shared-animation loading guard this line used to pin is GONE. Astra's repair gave every occupied pool slot
  109 |   // its own cursor and its own cloned primary/fade material, released on recycle. Assert that ownership instead:
  110 |   // the lazy gate that replaced the guard, the per-body material clone, and the per-id animator registration.
  111 |   expect(poolsSource).toContain('if (!sprites.isLoaded) return null;');
  112 |   expect(poolsSource).toContain('sprite.material = sprites.cloneMaterial();');
  113 |   expect(poolsSource).toContain('this.spriteAnimations.set(enemy.id, { slotId, sprites, fades, sprite, fade, animator });');
  114 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer.calls)).toBeLessThanOrEqual(200);
  115 |   expect(errors).toEqual({ console: [], page: [] });
  116 | });
  117 | 
  118 | test('E7 placeholders preserve roster stats, thief state, and cure-only death outcomes', async ({ page }, testInfo) => {
  119 |   const errors = await open(page, E7_EPOCH_FALLBACK, 'e7-roster-outcomes');
  120 |   const result = await page.evaluate(async ({ roster, variants }) => {
  121 |     const harness = window.__GR_TEST__!;
  122 |     harness.setBalance('sparkRig.damage', 0);
  123 |     harness.setBalance('e7Arsenal.signalJammer.damage', 0);
  124 |     harness.setBalance('e7Arsenal.reportRocket.damage', 0);
  125 |     const rogue = variants.rogue_automaton;
  126 |     const rustler = variants.data_rustler;
  127 |     harness.spawnPack(3, 5, { ...rogue, variantId: 'rogue_automaton', variantLabel: 'Rogue Automaton', speedScale: 0 });
  128 |     harness.spawnPack(3, 7, { ...rustler, variantId: 'data_rustler', variantLabel: 'Data-Rustler', speedScale: 0 });
  129 |     harness.advanceSim(0.1);
  130 |     const spawned = harness.enemyPositions();
  131 |     const modulePath = '/src/entities/pools.ts';
  132 |     const { e7EnemySpriteBinding } = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/entities/pools');
  133 |     return {
  134 |       spawned,
  135 |       bindings: roster.map((id) => e7EnemySpriteBinding(id)),
  136 |     };
  137 |   }, { roster: ROSTER, variants: Balance.e7Roster.variants });
  138 | 
  139 |   expect(result.spawned.find((enemy) => enemy.variantId === 'rogue_automaton')).toMatchObject({ scale: 1, thief: false });
  140 |   expect(result.spawned.find((enemy) => enemy.variantId === 'data_rustler')).toMatchObject({ scale: 1, thief: true, state: 'seekHolding' });
  141 |   expect(result.bindings).toEqual([
  142 |     expect.objectContaining({ sheet: 'char-e7-rogue_automaton-sheet-walk8.png', placeholder: false }),
  143 |     expect.objectContaining({ sheet: 'char-e7-data_rustler-sheet-walk8.png', placeholder: false }),
  144 |   ]);
  145 | 
  146 |   mkdirSync(SHOT_DIR, { recursive: true });
  147 |   await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-placeholders.png`) });
  148 |   await page.evaluate(() => {
  149 |     const harness = window.__GR_TEST__!;
  150 |     harness.setBalance('e7Arsenal.signalJammer.damage', 1_000);
  151 |     harness.setBalance('e7Arsenal.reportRocket.damage', 1_000);
  152 |     harness.setBalance('e7Arsenal.reportRocket.cooldown', 0.1);
  153 |     harness.advanceSim(5);
  154 |   });
  155 |   const cure = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal);
  156 |   expect(cure.cureEvents).toEqual(expect.arrayContaining([
  157 |     expect.objectContaining({ type: 'powered-down', variantId: 'rogue_automaton' }),
  158 |     expect.objectContaining({ type: 'turned-back', variantId: 'data_rustler' }),
  159 |   ]));
  160 |   expect(cure.deathEvents).toBe(0);
  161 |   expect(errors).toEqual({ console: [], page: [] });
  162 | });
  163 | 
  164 | test('plain Signal-era boot stays error-free without the debug harness', async ({ page }) => {
  165 |   const errors: Errors = { console: [], page: [] };
  166 |   page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  167 |   page.on('pageerror', (error) => errors.page.push(error.message));
  168 |   await page.addInitScript(
  169 |     ({ key }) => localStorage.setItem(key, 'epoch-7-signal'),
  170 |     { key: profileDataKey('robin', ACTIVE_EPOCH_KEY) },
  171 |   );
  172 |   await page.goto('/?contract=the-claim&nowaves&nolevel&nopause&seed=e7-roster-plain');
  173 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  174 |   expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
> 175 |   expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal.enabled)).toBe(true);
      |                                                                                           ^ Error: expect(received).toBe(expected) // Object.is equality
  176 |   expect(errors).toEqual({ console: [], page: [] });
  177 | });
  178 | 
```