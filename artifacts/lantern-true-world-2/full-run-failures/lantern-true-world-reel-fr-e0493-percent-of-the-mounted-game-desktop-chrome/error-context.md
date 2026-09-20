# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lantern-true-world.spec.ts >> reel frame p95 stays within 115 percent of the mounted game
- Location: e2e/lantern-true-world.spec.ts:134:1

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 19.89500008225441
Received:    32.60000002384186
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - dialog "The Lantern Show replay":
    - generic "Drag to pan the lantern view" [ref=e4]:
      - paragraph [ref=e6]: "Reel does not carry: decorative props"
    - group [ref=e7]:
      - generic "The Lantern Show" [ref=e8] [cursor=pointer]
      - paragraph [ref=e9]: Schoolhouse Lantern Room
      - paragraph [ref=e10]: This is the ride. The county is replaying it here in your browser.
    - generic [ref=e11]:
      - button "Pause" [ref=e12]
      - generic "Playback speed" [ref=e13]:
        - button "1×" [pressed] [ref=e14]
        - button "2×" [ref=e15]
        - button "4×" [ref=e16]
      - button "Restart" [ref=e17]
      - button "Next wave" [ref=e18]
      - button "Back to shelf" [ref=e19]
      - textbox "Share this reel" [ref=e20]: http://127.0.0.1:5189/?watch=agent-0729e0d5-34faa951-beba-4b1e-88b1-5b16711d9340&contract=the-claim&epoch=epoch-1-frontier
      - status [ref=e21]: 0:04 / 1:18 · wave 0 · Gold 0 · Keeper 100/100 HP
```

# Test source

```ts
  50  |         for (let i = 0; i < data.length; i += 4) {
  51  |           colors.add(`${data[i]! >> 4},${data[i + 1]! >> 4},${data[i + 2]! >> 4}`);
  52  |           if (Math.max(data[i]!, data[i + 1]!, data[i + 2]!) - Math.min(data[i]!, data[i + 1]!, data[i + 2]!) > 15) colored++;
  53  |         }
  54  |         resolve({ colors: colors.size, colored });
  55  |       });
  56  |     });
  57  |   });
  58  | }
  59  | 
  60  | for (const kind of ['claim', 'signal'] as const) test(`${kind} plain watch draws its contract world with snapshot sprites`, async ({ page }, info) => {
  61  |   test.setTimeout(180_000);
  62  |   const { tape, errors, requests, show } = await openReel(page, kind);
  63  |   const canvas = page.getByTestId('lantern-world-canvas');
  64  |   await expect(canvas).toBeVisible();
  65  |   await expect(canvas).toHaveAttribute('data-contract', tape.contract);
  66  |   await expect(canvas).toHaveAttribute('data-terrain3d-pilot-state', 'ready', { timeout: 90_000 });
  67  |   await expect.poll(async () => Number(await canvas.getAttribute('data-rendered-sprites')), { timeout: 60_000 }).toBeGreaterThan(1);
  68  |   expect(requests.some((url) => /terrain[^/]*\.glb/.test(url))).toBe(true);
  69  |   expect(requests.some((url) => /\/src\/game\/Game\.ts/.test(url))).toBe(false);
  70  |   expect(await page.evaluate(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__))).toBe(false);
  71  |   expect(JSON.parse((await show.getAttribute('data-true-reel-probe'))!).contract.id).toBe(tape.contract);
  72  |   const probe = await pixels(page);
  73  |   expect(probe.colors).toBeGreaterThan(10);
  74  |   expect(probe.colored).toBeGreaterThan(1000);
  75  |   if (info.project.name === 'mobile-chrome') {
  76  |     const ratio = await canvas.evaluate((element) => element.getBoundingClientRect().height / innerHeight);
  77  |     expect(ratio).toBeGreaterThanOrEqual(.6);
  78  |     await expect(page.locator('.lantern-show__title details')).not.toHaveAttribute('open', '');
  79  |   }
  80  |   await mkdir(output, { recursive: true });
  81  |   await page.screenshot({ path: path.join(output, `${info.project.name}-${kind}.png`) });
  82  |   if (kind === 'claim') {
  83  |     await page.getByTestId('lantern-speed-4').click();
  84  |     await expect(show).toHaveAttribute('data-playback', 'complete', { timeout: 90_000 });
  85  |     await expect(page.getByTestId('lantern-playback-status')).toContainText('hash matched in this browser');
  86  |     await expect(page.getByTestId('lantern-playback-status')).toHaveAttribute('data-hash', tape.eventLogHash);
  87  |     await page.getByTestId('lantern-restart').click();
  88  |     await expect(show).toHaveAttribute('data-playback', 'playing');
  89  |     await page.getByTestId('lantern-pause').click();
  90  |     await expect(show).toHaveAttribute('data-playback', 'paused');
  91  |     // Let an already-issued worker request settle before asserting the frozen tick.
  92  |     await page.waitForTimeout(250);
  93  |     const tick = await show.getAttribute('data-tick');
  94  |     await page.waitForTimeout(250);
  95  |     expect(await show.getAttribute('data-tick')).toBe(tick);
  96  |   }
  97  |   expect(errors).toEqual([]);
  98  | });
  99  | 
  100 | for (const mode of ['tactical', 'lite', 'no-webgl'] as const) test(`${mode} opens the labelled tactical reel without returning to the menu`, async ({ page }, info) => {
  101 |   test.setTimeout(120_000);
  102 |   if (mode === 'no-webgl') await page.addInitScript(() => {
  103 |     const getContext = HTMLCanvasElement.prototype.getContext;
  104 |     HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
  105 |       if (/webgl/i.test(type)) return null;
  106 |       return Reflect.apply(getContext, this, [type, ...args]);
  107 |     } as typeof getContext;
  108 |   });
  109 |   const { show, errors, requests } = await openReel(page, 'claim', mode === 'tactical' ? '&reel=tactical' : mode === 'lite' ? '&tier=lite' : '');
  110 |   await expect(page.getByTestId('lantern-reel-label')).toHaveText('Tactical reel');
  111 |   await expect(page.getByTestId('lantern-true-world')).toBeVisible();
  112 |   await expect(page.getByTestId('start-menu')).toHaveCount(0);
  113 |   await expect.poll(() => show.getAttribute('data-true-reel-probe'), { timeout: 60_000 }).not.toBe('');
  114 |   if (mode === 'tactical') {
  115 |     expect(new URL(page.url()).searchParams.get('reel')).toBe('tactical');
  116 |     await expect(page.getByTestId('lantern-share-url')).toHaveValue(page.url());
  117 |   }
  118 |   if (mode === 'lite') {
  119 |     await expect(show).toHaveAttribute('data-world-source', 'painted');
  120 |     expect(requests.some((url) => /terrain-bank[^/]*\.png/.test(url))).toBe(true);
  121 |     expect(requests.some((url) => /\.glb(?:\?|$)/.test(url))).toBe(false);
  122 |   }
  123 |   if (mode === 'no-webgl') {
  124 |     await expect(show).toHaveAttribute('data-fallback', 'no-webgl');
  125 |     await mkdir(output, { recursive: true });
  126 |     await page.screenshot({ path: path.join(output, `${info.project.name}-no-webgl.png`) });
  127 |     await page.getByTestId('lantern-close').click();
  128 |     await expect(page.getByTestId('start-menu')).toBeVisible({ timeout: 30_000 });
  129 |     expect(new URL(page.url()).search).toBe('');
  130 |   }
  131 |   expect(errors).toEqual([]);
  132 | });
  133 | 
  134 | test('reel frame p95 stays within 115 percent of the mounted game', async ({ page }, info) => {
  135 |   test.setTimeout(180_000);
  136 |   await page.goto('/?debug&nowaves&nolevel&nokill&nopause&seed=terrain3d-claim');
  137 |   const begin = page.getByRole('button', { name: 'Begin' });
  138 |   if (await begin.isVisible()) await begin.click();
  139 |   await expect(page.locator('#game-canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready', { timeout: 90_000 });
  140 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 120);
  141 |   const gameP95 = await frameP95(page);
  142 |   const { errors } = await openReel(page);
  143 |   await expect(page.getByTestId('lantern-world-canvas')).toHaveAttribute('data-terrain3d-pilot-state', 'ready', { timeout: 90_000 });
  144 |   await expect.poll(async () => Number(await page.getByTestId('lantern-world-canvas').getAttribute('data-frame')), { timeout: 60_000 }).toBeGreaterThan(120);
  145 |   const reelP95 = await frameP95(page);
  146 |   const sample = { project: info.project.name, gameP95, reelP95, ratio: reelP95 / gameP95 };
  147 |   await mkdir(output, { recursive: true });
  148 |   await writeFile(path.join(output, `${info.project.name}-perf.json`), JSON.stringify(sample, null, 2));
  149 |   console.log('[lantern-perf]', JSON.stringify(sample));
> 150 |   expect(reelP95).toBeLessThanOrEqual(gameP95 * 1.15);
      |                   ^ Error: expect(received).toBeLessThanOrEqual(expected)
  151 |   expect(errors).toEqual([]);
  152 | });
  153 | 
  154 | 
  155 | test('Game uses the shared agent controller and reproduces the recorded hash', async ({ page }) => {
  156 |   test.setTimeout(120_000);
  157 |   const tape = JSON.parse(await readFile(fixtures.claim, 'utf8'));
  158 |   tape.meta = { ...tape.meta, engineHash: engineEra.engineHash, era: engineEra.era };
  159 |   await page.addInitScript((recording) => sessionStorage.setItem('gr.assay-replay.v1', JSON.stringify(recording)), tape);
  160 |   const errors: string[] = [];
  161 |   page.on('pageerror', (error) => errors.push(error.message));
  162 |   page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  163 |   await page.goto('/?debug&assayReplay&contract=the-claim&nolevel&nopause');
  164 |   const begin = page.getByRole('button', { name: 'Begin' });
  165 |   if (await begin.isVisible()) await begin.click();
  166 |   const show = page.getByTestId('lantern-show');
  167 |   await expect(show).toBeVisible({ timeout: 45_000 });
  168 |   await expect.poll(() => page.evaluate(() => Boolean(window.__THREE_GAME_DIAGNOSTICS__))).toBe(true);
  169 |   await page.getByTestId('lantern-speed-4').click();
  170 |   await expect(show).toHaveAttribute('data-playback', 'complete', { timeout: 90_000 });
  171 |   await expect(page.getByTestId('lantern-playback-status')).toHaveAttribute('data-hash', tape.eventLogHash);
  172 |   expect(errors).toEqual([]);
  173 | });
  174 | 
  175 | test('a stored lite preference survives replay storage isolation', async ({ page }) => {
  176 |   await page.addInitScript(() => localStorage.setItem('gr.performance.tier.v1', 'lite'));
  177 |   const { show, errors } = await openReel(page);
  178 |   await expect(show).toHaveAttribute('data-tier', 'lite');
  179 |   await expect(page.getByTestId('lantern-reel-label')).toHaveText('Tactical reel');
  180 |   expect(errors).toEqual([]);
  181 | });
  182 | 
  183 | 
  184 | test('stationary works keep family identity and Night Shift renders its dark phase', async ({ page }) => {
  185 |   test.setTimeout(60_000);
  186 |   const errors: string[] = [];
  187 |   page.on('pageerror', (error) => errors.push(error.message));
  188 |   page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  189 |   await page.goto('/src/replay/harness.html?debug&contract=e1-night-shift');
  190 |   const result = await page.evaluate(async () => {
  191 |     const contractPath = '/src/meta/ContractFamilies.ts';
  192 |     const contracts = await import(/* @vite-ignore */ contractPath) as typeof import('../src/meta/ContractFamilies');
  193 |     contracts.stageReplayContract('e1-night-shift');
  194 |     const stagePath = '/src/world/LanternWorldStage.ts';
  195 |     const { LanternWorldStage } = await import(/* @vite-ignore */ stagePath) as typeof import('../src/world/LanternWorldStage');
  196 |     const stage = new LanternWorldStage();
  197 |     stage.canvas.style.cssText = 'width:600px;height:400px';
  198 |     document.body.append(stage.canvas);
  199 |     const manifest = contracts.loadContract('e1-night-shift');
  200 |     const snapshot: import('../src/replay/AgentTapeReplay').AgentTapeReplaySnapshot = {
  201 |       contract: { id: manifest.id, tileId: manifest.tileParams.tileId, width: 64, height: 64 },
  202 |       tick: 30, wave: 11, timeAlive: 100, gold: 0,
  203 |       hero: { x: 0, z: 12, hp: 100, maxHp: 100, alive: true }, rider: null, enemies: [], seams: [], pickups: [{ index: 0, x: -5, z: 12, amount: 7 }],
  204 |       works: [
  205 |         { id: 'sentry_beacon', index: 0, x: -10, z: 12, hp: 10, maxHp: 10, wrecked: false },
  206 |         { id: 'sluice', index: 0, x: 10, z: 12, hp: 10, maxHp: 10, wrecked: false },
  207 |         { id: 'lantern_post', index: 0, x: 3, z: 12, hp: 10, maxHp: 10, wrecked: false },
  208 |       ],
  209 |     };
  210 |     stage.update(snapshot);
  211 |     stage.render(0, false, 1);
  212 |     stage.update({ ...snapshot, tick: 31, pickups: [{ index: 0, x: 5, z: 12, amount: 7 }] });
  213 |     stage.render(1 / 60, false, 1);
  214 |     const sentries = stage.scene.getObjectByName('Lantern-bld.sentry_beacon')!.children;
  215 |     const sluices = stage.scene.getObjectByName('Lantern-bld.portrait.sluice')!.children;
  216 |     const sun = stage.scene.getObjectByName('LedgerLowSun') as import('three').DirectionalLight;
  217 |     const pickups = stage.scene.getObjectByName('GoldPickupPool')!.children[0] as import('three').InstancedMesh;
  218 |     const observed = { sentryX: sentries[0]!.position.x, lanternX: sentries[1]!.position.x, sluiceX: sluices[0]!.position.x,
  219 |       pickupX: pickups.instanceMatrix.array[12], pickupFloats: stage.canvas.dataset.pickupFloats,
  220 |       darkness: stage.canvas.dataset.darkness, phase: stage.canvas.dataset.lightPhase, lightSources: Number(stage.canvas.dataset.lightSources), sun: sun.intensity };
  221 |     stage.dispose();
  222 |     return observed;
  223 |   });
  224 |   expect(result).toEqual({ sentryX: -10, lanternX: 3, sluiceX: 10, pickupX: 0, pickupFloats: '1', darkness: '1', phase: 'dark', lightSources: 3, sun: 0 });
  225 |   expect(errors).toEqual([]);
  226 | });
  227 | 
```