# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: terrain3d-claim-pilot.spec.ts >> contract-valid GLB feeds every visualY consumer and keeps the water agreement
- Location: e2e/terrain3d-claim-pilot.spec.ts:76:1

# Error details

```
Error: expect(received).toBeCloseTo(expected, precision)

Expected: 0.7964298105239869
Received: 0.8177936887741089

Expected precision:    2
Expected difference: < 0.005
Received difference:   0.02136387825012198
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
          - strong: 00:04
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
    - generic:
      - button [ref=e31]: R
      - button [ref=e32]: Q
      - button [ref=e33]: OK
    - region
    - text: None None None
  - generic [ref=e34]:
    - button "▸ Game tuning" [ref=e35] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e36]: "Meta territory: 0 | science: 0 | hero: 0 | agent: 0 | agent autonomy: 0"
```

# Test source

```ts
  1   | import { createHash } from 'node:crypto';
  2   | import { mkdir, writeFile } from 'node:fs/promises';
  3   | import path from 'node:path';
  4   | import { expect, test, type Browser, type Page, type TestInfo } from '@playwright/test';
  5   | import { Balance } from '../src/game/Balance';
  6   | 
  7   | const ARTIFACT_DIR = path.resolve('artifacts/terrain3d-claim-pilot');
  8   | const MODEL = /the-claim-terrain(?:-[^/?]+)?\.glb/;
  9   | type Errors = { console: string[]; page: string[] };
  10  | 
  11  | function collectErrors(page: Page): Errors {
  12  |   const errors: Errors = { console: [], page: [] };
  13  |   page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  14  |   page.on('pageerror', (error) => errors.page.push(error.message));
  15  |   return errors;
  16  | }
  17  | 
  18  | async function boot(page: Page, extra = ''): Promise<void> {
  19  |   await page.goto(`/?debug&nowaves&nolevel&nokill&nopause&seed=terrain3d-claim${extra}`);
  20  |   const begin = page.getByRole('button', { name: 'Begin' });
  21  |   if (await begin.isVisible()) await begin.click();
  22  |   await page.waitForFunction(() => Boolean(window.__GR_TEST__) && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  23  | }
  24  | 
  25  | async function p95(page: Page, frames = 120): Promise<number> {
  26  |   return page.evaluate(async (count) => {
  27  |     const samples: number[] = [];
  28  |     let previous = performance.now();
  29  |     for (let index = 0; index < count; index += 1) {
  30  |       await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  31  |       const now = performance.now();
  32  |       samples.push(now - previous);
  33  |       previous = now;
  34  |     }
  35  |     samples.sort((a, b) => a - b);
  36  |     return samples[Math.floor(samples.length * 0.95)] ?? 0;
  37  |   }, frames);
  38  | }
  39  | 
  40  | async function simFingerprint(browser: Browser, pilot: boolean): Promise<{ hash: string; payload: unknown; errors: Errors }> {
  41  |   const page = await browser.newPage();
  42  |   const errors = collectErrors(page);
  43  |   await boot(page, pilot ? '' : '&terrain2d');
  44  |   if (pilot) await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState === 'ready');
  45  |   const payload = await page.evaluate(() => {
  46  |     const test = window.__GR_TEST__!;
  47  |     test.setManualSim(true);
  48  |     test.clearEnemies();
  49  |     test.spawnEnemyAt(-18, -18);
  50  |     test.spawnEnemyAt(18, -18);
  51  |     test.spawnEnemyAt(0, 22);
  52  |     test.advanceSim(1.2);
  53  |     return {
  54  |       sim: window.__THREE_GAME_DIAGNOSTICS__?.terrain.sim,
  55  |       samples: [[0, 12], [0, 0], [12, -18]].map(([x, z]) => test.terrainSample(x!, z!)),
  56  |       enemies: test.enemyPositions().map(({ id, x, z, hp, vx, vz, zone }) => ({ id, x, z, hp, vx, vz, zone })),
  57  |       economy: test.summarizeLog(test.economyLog()),
  58  |     };
  59  |   });
  60  |   await page.close();
  61  |   return { payload, hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), errors };
  62  | }
  63  | 
  64  | test('terrain2d is byte-lazy and keeps the painted Claim', async ({ page }) => {
  65  |   const errors = collectErrors(page);
  66  |   let requests = 0;
  67  |   page.on('request', (request) => { if (MODEL.test(request.url())) requests += 1; });
  68  |   await boot(page, '&terrain2d');
  69  |   const canvas = page.locator('canvas');
  70  |   await expect(canvas).toHaveAttribute('data-terrain3d-pilot-state', 'off');
  71  |   await expect(canvas).toHaveAttribute('data-terrain3d-pilot-render-source', 'painted');
  72  |   expect(requests).toBe(0);
  73  |   expect(errors).toEqual({ console: [], page: [] });
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
> 101 |     expect(sample.heroY).toBeCloseTo(sample.height + 0.06, 2);
      |                          ^ Error: expect(received).toBeCloseTo(expected, precision)
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
  174 |   await page.waitForFunction(() => document.querySelector('canvas')?.dataset.terrain3dPilotState === 'ready');
  175 |   const pilotP95Ms = await p95(page);
  176 |   const report = { paintedP95Ms, pilotP95Ms, ratio: pilotP95Ms / paintedP95Ms };
  177 |   await mkdir(ARTIFACT_DIR, { recursive: true });
  178 |   await writeFile(path.join(ARTIFACT_DIR, `p95-${testInfo.project.name}.json`), `${JSON.stringify(report, null, 2)}\n`);
  179 |   expect(pilotP95Ms).toBeLessThanOrEqual(paintedP95Ms * 1.15);
  180 | });
  181 | 
```