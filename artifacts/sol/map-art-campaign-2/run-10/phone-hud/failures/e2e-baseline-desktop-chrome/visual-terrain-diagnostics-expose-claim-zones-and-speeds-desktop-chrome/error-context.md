# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> terrain diagnostics expose claim zones and speeds
- Location: e2e/visual.spec.ts:113:1

# Error details

```
Error: expect(received).toMatchObject(expected)

- Expected  - 4
+ Received  + 4

@@ -8,22 +8,22 @@
      "speedMul": 0.85,
      "walkable": true,
      "zone": "ford",
    },
    "northBank": Object {
-     "speedMul": 1,
-     "walkable": true,
+     "speedMul": 0,
+     "walkable": false,
      "zone": "bank",
    },
    "out": Object {
      "speedMul": 0,
      "walkable": false,
      "zone": "out",
    },
    "river": Object {
-     "speedMul": 0.55,
-     "walkable": true,
+     "speedMul": 0,
+     "walkable": false,
      "zone": "river",
    },
    "shallows": Object {
      "speedMul": 0.8,
      "walkable": true,
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
        - strong: 00:02
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
  - region
```

# Test source

```ts
  18  | async function sampleCanvas(page: import('@playwright/test').Page): Promise<CanvasSample> {
  19  |   const canvas = page.locator('#game-canvas');
  20  |   const box = await canvas.boundingBox();
  21  |   if (!box || box.width < 32 || box.height < 32) {
  22  |     return { ok: false, reason: 'canvas-too-small' };
  23  |   }
  24  | 
  25  |   const buffer = await canvas.screenshot();
  26  |   const png = PNG.sync.read(buffer);
  27  |   let min = 255;
  28  |   let max = 0;
  29  |   let alphaPixels = 0;
  30  |   const buckets = new Set<string>();
  31  |   const stride = Math.max(1, Math.floor((png.width * png.height) / 4096));
  32  | 
  33  |   for (let pixel = 0; pixel < png.width * png.height; pixel += stride) {
  34  |     const offset = pixel * 4;
  35  |     const r = png.data[offset];
  36  |     const g = png.data[offset + 1];
  37  |     const b = png.data[offset + 2];
  38  |     const a = png.data[offset + 3];
  39  |     min = Math.min(min, r, g, b);
  40  |     max = Math.max(max, r, g, b);
  41  |     if (a > 0) alphaPixels += 1;
  42  |     buckets.add(`${r >> 4},${g >> 4},${b >> 4},${a >> 6}`);
  43  |   }
  44  | 
  45  |   const variance = max - min;
  46  |   return {
  47  |     ok: alphaPixels > 256 && (variance > 8 || buckets.size > 3),
  48  |     reason: 'sampled',
  49  |     variance,
  50  |     colorBuckets: buckets.size,
  51  |   };
  52  | }
  53  | 
  54  | function expectStableRect(after: Rect | null, before: Rect | null): void {
  55  |   expect(before).not.toBeNull();
  56  |   expect(after).not.toBeNull();
  57  |   if (!before || !after) return;
  58  |   expect(Math.abs(after.x - before.x)).toBeLessThan(0.5);
  59  |   expect(Math.abs(after.y - before.y)).toBeLessThan(0.5);
  60  |   expect(Math.abs(after.width - before.width)).toBeLessThan(0.5);
  61  |   expect(Math.abs(after.height - before.height)).toBeLessThan(0.5);
  62  | }
  63  | 
  64  | test('renders a nonblank interactive game canvas', async ({ page }, testInfo) => {
  65  |   const consoleErrors: string[] = [];
  66  |   const pageErrors: string[] = [];
  67  |   page.on('console', (message) => {
  68  |     if (message.type() === 'error') consoleErrors.push(message.text());
  69  |   });
  70  |   page.on('pageerror', (error) => pageErrors.push(error.message));
  71  | 
  72  |   await page.goto('/?nowaves');
  73  |   await expect(page.locator('#game-canvas')).toBeVisible();
  74  |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  75  | 
  76  |   const sample = await sampleCanvas(page);
  77  |   expect(sample, JSON.stringify(sample)).toMatchObject({ ok: true });
  78  | 
  79  |   const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.z ?? 0);
  80  | 
  81  |   if (testInfo.project.name.includes('mobile')) {
  82  |     const stick = page.locator('#touch-stick');
  83  |     await expect(stick).toBeVisible();
  84  |     const box = await stick.boundingBox();
  85  |     expect(box).not.toBeNull();
  86  |     if (box) {
  87  |       await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  88  |       await page.mouse.down();
  89  |       await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.05, { steps: 6 });
  90  |       await page.waitForTimeout(450);
  91  |       await page.mouse.up();
  92  |     }
  93  |   } else {
  94  |     await page.keyboard.down('KeyW');
  95  |     await page.waitForTimeout(450);
  96  |     await page.keyboard.up('KeyW');
  97  |   }
  98  | 
  99  |   await expect
  100 |     .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.z ?? 0))
  101 |     .toBeLessThan(before - 0.3);
  102 | 
  103 |   const screenshot = await page.screenshot({ fullPage: true });
  104 |   await testInfo.attach(`${testInfo.project.name}-game`, {
  105 |     body: screenshot,
  106 |     contentType: 'image/png',
  107 |   });
  108 | 
  109 |   expect(consoleErrors).toEqual([]);
  110 |   expect(pageErrors).toEqual([]);
  111 | });
  112 | 
  113 | test('terrain diagnostics expose claim zones and speeds', async ({ page }) => {
  114 |   await page.goto('/?nowaves');
  115 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  116 | 
  117 |   const probes = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.probes);
> 118 |   expect(probes).toMatchObject({
      |                  ^ Error: expect(received).toMatchObject(expected)
  119 |     bank: { walkable: true, speedMul: 1, zone: 'bank' },
  120 |     shallows: { walkable: true, speedMul: 0.8, zone: 'shallows' },
  121 |     river: { walkable: true, speedMul: 0.55, zone: 'river' },
  122 |     ford: { walkable: true, speedMul: 0.85, zone: 'ford' },
  123 |     northBank: { walkable: true, speedMul: 1, zone: 'bank' },
  124 |     out: { walkable: false, speedMul: 0, zone: 'out' },
  125 |   });
  126 | });
  127 | 
  128 | test('HUD shell is readable and stable as run numbers tick', async ({ page }) => {
  129 |   const consoleErrors: string[] = [];
  130 |   const pageErrors: string[] = [];
  131 |   page.on('console', (message) => {
  132 |     if (message.type() === 'error') consoleErrors.push(message.text());
  133 |   });
  134 |   page.on('pageerror', (error) => pageErrors.push(error.message));
  135 | 
  136 |   await page.goto('/?nowaves');
  137 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  138 | 
  139 |   const vitals = page.getByTestId('hud-vitals');
  140 |   const gold = page.getByTestId('hud-gold');
  141 |   const xp = page.getByTestId('hud-xp');
  142 |   const wave = page.getByTestId('hud-wave');
  143 |   const pause = page.getByTestId('hud-pause');
  144 | 
  145 |   await expect(vitals).toBeVisible();
  146 |   await expect(gold).toBeVisible();
  147 |   await expect(xp).toBeVisible();
  148 |   await expect(wave).toBeVisible();
  149 |   await expect(pause).toBeVisible();
  150 |   await expect(vitals).toContainText('HP');
  151 |   await expect(vitals).toContainText('100 / 100');
  152 |   await expect(gold).toContainText('Gold');
  153 |   await expect(gold).toContainText('0');
  154 |   await expect(xp).toContainText('0 / 12 XP');
  155 |   await expect(pause).toContainText('P - catch your breath');
  156 | 
  157 |   const before = {
  158 |     vitals: await vitals.boundingBox(),
  159 |     gold: await gold.boundingBox(),
  160 |     xp: await xp.boundingBox(),
  161 |   };
  162 | 
  163 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0) > 1.05);
  164 | 
  165 |   expectStableRect(await vitals.boundingBox(), before.vitals);
  166 |   expectStableRect(await gold.boundingBox(), before.gold);
  167 |   expectStableRect(await xp.boundingBox(), before.xp);
  168 | 
  169 |   const viewport = page.viewportSize();
  170 |   for (const locator of [vitals, gold, xp, wave, pause]) {
  171 |     const box = await locator.boundingBox();
  172 |     expect(box).not.toBeNull();
  173 |     if (!box || !viewport) continue;
  174 |     expect(box.x).toBeGreaterThanOrEqual(0);
  175 |     expect(box.y).toBeGreaterThanOrEqual(0);
  176 |     expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 0.5);
  177 |     expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 0.5);
  178 |   }
  179 | 
  180 |   expect(consoleErrors).toEqual([]);
  181 |   expect(pageErrors).toEqual([]);
  182 | });
  183 | 
  184 | async function holdKey(page: Page, key: string): Promise<void> {
  185 |   await page.keyboard.down(key);
  186 |   await page.waitForTimeout(160);
  187 |   await page.keyboard.up(key);
  188 | }
  189 | 
  190 | test('P toggles pause diagnostics and freezes sim time', async ({ page }) => {
  191 |   await page.goto('/?nowaves');
  192 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  193 | 
  194 |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
  195 | 
  196 |   await holdKey(page, 'KeyP');
  197 |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('paused');
  198 |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)).toBe(true);
  199 |   const pausedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  200 |   await page.waitForTimeout(280);
  201 |   const stillPausedAt = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0);
  202 |   expect(stillPausedAt).toBe(pausedAt);
  203 | 
  204 |   await holdKey(page, 'KeyP');
  205 |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.state)).toBe('playing');
  206 |   await expect.poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)).toBe(false);
  207 |   await expect
  208 |     .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0))
  209 |     .toBeGreaterThan(pausedAt);
  210 | });
  211 | 
  212 | test('river band slows the hero through diagnostics', async ({ page }) => {
  213 |   await page.goto('/?nowaves');
  214 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  215 | 
  216 |   await page.keyboard.down('KeyA');
  217 |   await expect
  218 |     .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.heroPos.x ?? 0))
```