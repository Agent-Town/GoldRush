# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: terrain3d-claim-pilot.spec.ts >> the mounted terrain stays inside the 115% p95 budget
- Location: e2e/terrain3d-claim-pilot.spec.ts:166:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForFunction: Test timeout of 60000ms exceeded.
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
          - strong: 00:59
        - generic:
          - generic: Wave
          - strong: "0"
      - region "Gold pouch":
        - generic: Gold
        - strong: "0"
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
        - button "Build" [ref=e10]
      - button "Pause the claim" [ref=e11]: catch your breath
      - status: the claim is raising… 27/29
      - generic:
        - status:
          - strong: Claim Stake
          - paragraph: The heart of the claim. Lose it and the run is done.
    - generic:
      - button [ref=e14]: R
      - button [ref=e15]: Q
      - button [ref=e16]: OK
    - region
    - text: None None None
  - generic [ref=e17]:
    - button "▸ Game tuning" [ref=e18] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e19]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  74  | });
  75  | 
  76  | test('contract-valid GLB feeds every visualY consumer and keeps the water agreement', async ({ page }, testInfo) => {
  77  |   test.setTimeout(60_000);
  78  |   const errors = collectErrors(page);
  79  |   await boot(page, '&terrain3dPilot');
  80  |   await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState === 'ready');
  81  |   const canvas = page.locator('canvas');
  82  |   await expect(canvas).toHaveAttribute('data-terrain3d-pilot-render-source', 'glb');
  83  |   await expect(canvas).toHaveAttribute('data-terrain3d-pilot-height-source', 'baked-grid');
  84  |   expect(Number(await canvas.getAttribute('data-terrain3d-pilot-meshes'))).toBe(1);
  85  |   expect(Number(await canvas.getAttribute('data-terrain3d-pilot-triangles'))).toBe(32_768);
  86  |   expect(Number(await canvas.getAttribute('data-terrain3d-pilot-materials'))).toBe(1);
  87  | 
  88  |   const samplePoints = [[-15, 14], [24, 25], [-13, -10], [18, 11], [0, 12]] as const;
  89  |   const table = [];
  90  |   for (const [x, z] of samplePoints) {
  91  |     await page.evaluate(([px, pz]) => window.__GR_TEST__?.teleport(px, pz), [x, z]);
  92  |     await page.waitForFunction(([px, pz]) => {
  93  |       const hero = window.__THREE_GAME_DIAGNOSTICS__?.heroPos;
  94  |       return hero != null && Math.abs(hero.x - px) < 0.01 && Math.abs(hero.z - pz) < 0.01;
  95  |     }, [x, z]);
  96  |     const sample = await page.evaluate(([px, pz]) => ({
  97  |       height: window.__GR_TEST__!.terrainVisualY(px, pz),
  98  |       padded: window.__GR_TEST__!.terrainVisualY(px, pz, 0, 1.1),
  99  |       heroY: window.__THREE_GAME_DIAGNOSTICS__!.heroPos.y,
  100 |     }), [x, z]);
  101 |     expect(sample.heroY).toBeCloseTo(sample.height + 0.06, 2);
  102 |     table.push({ x, z, ...sample });
  103 |   }
  104 |   expect(Math.max(...table.map((entry) => entry.height)) - Math.min(...table.map((entry) => entry.height))).toBeGreaterThan(0.35);
  105 | 
  106 |   await page.evaluate(() => {
  107 |     window.__GR_TEST__!.setManualSim(true);
  108 |     window.__GR_TEST__!.spawnEnemyAt(-20, 14);
  109 |     window.__GR_TEST__!.advanceSim(0.05);
  110 |   });
  111 |   const enemy = await page.evaluate(() => window.__GR_TEST__!.enemyPositions()[0]);
  112 |   expect(enemy?.y).toBeCloseTo(await page.evaluate(([x, z, base]) => window.__GR_TEST__!.terrainVisualY(x!, z!, base), [enemy!.x, enemy!.z, Balance.enemy.groundY]), 2);
  113 | 
  114 |   await page.evaluate(() => window.__GR_TEST__!.teleport(20, 20));
  115 |   await expect(page.evaluate(() => window.__GR_TEST__!.placeFree('stockpile', 4, 12))).resolves.toBe(true);
  116 |   await expect(page.evaluate(() => window.__GR_TEST__!.placeFree('sluice', 0, 7))).resolves.toBe(true);
  117 |   const banks = await page.evaluate(async () => {
  118 |     const terrain = await Function('return import("/src/world/Terrain.ts")')() as typeof import('../src/world/Terrain');
  119 |     return [-24, -12, 0, 12, 24, 30].map((x) => ({
  120 |       x,
  121 |       z: 6,
  122 |       adjacent: terrain.isWaterSourceAdjacent(x, 6, 1),
  123 |       zone: window.__GR_TEST__!.terrainSample(x, 6).zone,
  124 |       height: window.__GR_TEST__!.terrainVisualY(x, 6),
  125 |     }));
  126 |   });
  127 |   expect(banks.every((bank) => bank.adjacent && bank.zone === 'shallows')).toBe(true);
  128 | 
  129 |   await mkdir(ARTIFACT_DIR, { recursive: true });
  130 |   await writeFile(path.join(ARTIFACT_DIR, `sample-points-${testInfo.project.name}.json`), `${JSON.stringify({ method: 'baked-grid', samples: table, waterBanks: banks }, null, 2)}\n`);
  131 |   await page.evaluate(() => {
  132 |     window.__GR_TEST__!.teleport(2, 13);
  133 |     document.querySelector<HTMLElement>('.lil-gui')?.style.setProperty('display', 'none');
  134 |   });
  135 |   await page.waitForTimeout(500);
  136 |   await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-claim-with-base.png`) });
  137 |   expect(errors).toEqual({ console: [], page: [] });
  138 | });
  139 | 
  140 | test('the terrain pilot leaves the planar simulation fingerprint unchanged', async ({ browser }, testInfo) => {
  141 |   test.setTimeout(60_000);
  142 |   const off = await simFingerprint(browser, false);
  143 |   const on = await simFingerprint(browser, true);
  144 |   await mkdir(ARTIFACT_DIR, { recursive: true });
  145 |   await writeFile(path.join(ARTIFACT_DIR, `sim-fingerprint-${testInfo.project.name}.json`), `${JSON.stringify({ off: off.hash, on: on.hash, payload: off.payload }, null, 2)}\n`);
  146 |   expect(on.hash).toBe(off.hash);
  147 |   expect(off.errors).toEqual({ console: [], page: [] });
  148 |   expect(on.errors).toEqual({ console: [], page: [] });
  149 | });
  150 | 
  151 | test('LITE and invalid bytes retain the painted fallback', async ({ page }) => {
  152 |   const errors = collectErrors(page);
  153 |   let requests = 0;
  154 |   page.on('request', (request) => { if (MODEL.test(request.url())) requests += 1; });
  155 |   await boot(page, '&terrain3dPilot&tier=lite');
  156 |   await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'lite');
  157 |   expect(requests).toBe(0);
  158 | 
  159 |   await page.route(MODEL, (route) => route.fulfill({ status: 200, body: 'invalid glb bytes', contentType: 'model/gltf-binary' }));
  160 |   await boot(page, '&terrain3dPilot&tier=full');
  161 |   await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'failed');
  162 |   await expect(page.locator('canvas')).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
  163 |   expect(errors).toEqual({ console: [], page: [] });
  164 | });
  165 | 
  166 | test('the mounted terrain stays inside the 115% p95 budget', async ({ page }, testInfo: TestInfo) => {
  167 |   test.setTimeout(60_000);
  168 |   let release: (() => Promise<void>) | undefined;
  169 |   await page.route(MODEL, (route) => { release = () => route.continue(); });
  170 |   await boot(page, '&terrain3dPilot');
  171 |   await expect.poll(() => release).toBeTruthy();
  172 |   const paintedP95Ms = await p95(page);
  173 |   await release!();
> 174 |   await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState === 'ready');
      |              ^ Error: page.waitForFunction: Test timeout of 60000ms exceeded.
  175 |   const pilotP95Ms = await p95(page);
  176 |   const report = { paintedP95Ms, pilotP95Ms, ratio: pilotP95Ms / paintedP95Ms };
  177 |   await mkdir(ARTIFACT_DIR, { recursive: true });
  178 |   await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  179 |   expect(pilotP95Ms).toBeLessThanOrEqual(paintedP95Ms * 1.15);
  180 | });
  181 | 
```