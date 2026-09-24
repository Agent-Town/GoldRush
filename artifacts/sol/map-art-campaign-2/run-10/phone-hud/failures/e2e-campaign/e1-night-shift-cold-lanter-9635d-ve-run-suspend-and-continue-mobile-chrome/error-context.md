# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e1-night-shift.spec.ts >> cold lantern relight costs survive run suspend and continue
- Location: e2e/e1-night-shift.spec.ts:478:1

# Error details

```
TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic "Playable Three.js game canvas" [ref=e3]
    - generic:
      - generic "Wave status":
        - generic:
          - generic: Brass warning on the north bank!
      - region "Run vitals":
        - generic:
          - generic: HP
          - strong: 100 / 100
        - generic:
          - generic: Time
          - strong: 12:30
        - generic:
          - generic: Wave
          - strong: "25"
      - region "Gold pouch":
        - strong: "0"
      - button "Back to the claim" [ref=e4]: back to the claim
      - text: Swipe to scroll
    - region
    - text: None None None
    - region "Claim Secured" [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Secure Claim
        - heading "Claim Secured" [level=1] [ref=e8]
        - paragraph [ref=e9]: The win is banked. Ride home with the claim, or stay for the Rush and press your luck.
        - generic [ref=e10]:
          - generic [ref=e11]:
            - term [ref=e12]: Waves Held
            - definition [ref=e13]: "25"
          - generic [ref=e14]:
            - term [ref=e15]: Gold Panned
            - definition [ref=e16]: "0"
          - generic [ref=e17]:
            - term [ref=e18]: Gold Reclaimed
            - definition [ref=e19]: "0"
          - generic [ref=e20]:
            - term [ref=e21]: Buildings Raised
            - definition [ref=e22]: "0"
        - region "Claim Office" [ref=e23]:
          - heading "Claim Office" [level=2] [ref=e24]
          - paragraph [ref=e25]: "The Prospector tips his hat: “Struck it proper, partner.”"
          - list [ref=e26]:
            - listitem [ref=e27]:
              - generic [ref=e28]: Territory
              - strong [ref=e29]: "+1"
              - generic [ref=e30]: Stamped
            - listitem [ref=e31]:
              - generic [ref=e32]: Science
              - strong [ref=e33]: "+1"
              - generic [ref=e34]: Stamped
            - listitem [ref=e35]:
              - generic [ref=e36]: Hero
              - strong [ref=e37]: "+1"
              - generic [ref=e38]: Stamped
            - listitem [ref=e39]:
              - generic [ref=e40]: Agent
              - strong [ref=e41]: "+1"
              - generic [ref=e42]: Stamped
          - paragraph [ref=e43]: "Next claim: a palisade kit is yours to place where the gold runs; unused pieces expire when the wagon rolls home."
          - button "Run Ledger" [ref=e44]
        - generic [ref=e45]:
          - button "Return to Town" [ref=e46]
          - button "Stay for the Rush" [ref=e47]
  - generic [ref=e48]:
    - button "▸ Game tuning" [ref=e49] [cursor=pointer]
    - text: ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ Empty ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ▾ ✓ ▾ ▾ ▾ ▾ ✓ ▾ ▾
  - status [ref=e50]: "Meta territory: 1 | science: 1 | hero: 1 | agent: 1 | agent autonomy: 1"
```

# Test source

```ts
  71  |   await mkdir(ARTIFACT_DIR, { recursive: true });
  72  |   await page.screenshot({ path: path.join(ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), fullPage: false });
  73  | }
  74  | 
  75  | async function captureDuskStrip(page: Page, testInfo: TestInfo): Promise<void> {
  76  |   await mkdir(DUSK_ARTIFACT_DIR, { recursive: true });
  77  |   const frames: PNG[] = [];
  78  |   for (const [name, wave] of [['day', 4], ['golden', 7], ['dusk', 8], ['dark', 10]] as const) {
  79  |     await setWave(page, wave);
  80  |     await page.waitForTimeout(80);
  81  |     const buffer = await page.locator('#game-canvas').screenshot();
  82  |     await writeFile(path.join(DUSK_ARTIFACT_DIR, `${testInfo.project.name}-${name}.png`), buffer);
  83  |     frames.push(PNG.sync.read(buffer));
  84  |   }
  85  |   const width = frames[0]!.width;
  86  |   const height = frames[0]!.height;
  87  |   const strip = new PNG({ width: width * frames.length, height });
  88  |   for (const [index, frame] of frames.entries()) {
  89  |     for (let y = 0; y < height; y += 1) {
  90  |       frame.data.copy(strip.data, (y * strip.width + index * width) * 4, y * width * 4, (y + 1) * width * 4);
  91  |     }
  92  |   }
  93  |   await writeFile(path.join(DUSK_ARTIFACT_DIR, `${testInfo.project.name}-day-golden-dusk-dark-strip.png`), PNG.sync.write(strip));
  94  | }
  95  | 
  96  | async function setBalance(page: Page, key: string, value: number | boolean): Promise<void> {
  97  |   await expect(
  98  |     page.evaluate(([pathKey, next]) => window.__GR_TEST__?.setBalance(pathKey, next), [key, value] as const),
  99  |   ).resolves.toBe(true);
  100 | }
  101 | 
  102 | async function setWave(page: Page, wave: number): Promise<void> {
  103 |   await page.evaluate((next) => window.__GR_TEST__?.setWave(next), wave);
  104 |   await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0)).toBe(wave);
  105 | }
  106 | 
  107 | async function grantGold(page: Page, amount: number): Promise<void> {
  108 |   await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
  109 | }
  110 | 
  111 | async function teleport(page: Page, x: number, z: number): Promise<void> {
  112 |   await page.evaluate((pos) => window.__GR_TEST__?.teleport(pos.x, pos.z), { x, z });
  113 | }
  114 | 
  115 | async function selectBuildable(page: Page, id: string): Promise<boolean> {
  116 |   return page.evaluate((buildableId) => window.__GR_TEST__?.selectBuildable(buildableId) ?? false, id);
  117 | }
  118 | 
  119 | async function aimBuildAt(page: Page, point: { x: number; z: number }, tolerance = 1): Promise<void> {
  120 |   const screen = await page.evaluate((target) => window.__GR_TEST__?.screenPoint(target.x, target.z, 0.03) ?? null, point);
  121 |   expect(screen?.inView).toBe(true);
  122 |   await page.mouse.move(screen!.x, screen!.y);
  123 |   await expect.poll(() => page.evaluate((target) => {
  124 |     const ghost = window.__THREE_GAME_DIAGNOSTICS__?.build.ghostPos;
  125 |     return ghost ? Math.hypot(ghost.x - target.x, ghost.z - target.z) : Number.POSITIVE_INFINITY;
  126 |   }, point)).toBeLessThan(tolerance);
  127 | }
  128 | 
  129 | async function lanternHp(page: Page) {
  130 |   return page.evaluate(() =>
  131 |     window.__THREE_GAME_DIAGNOSTICS__?.build.hp
  132 |       .filter((entry) => entry.id === 'lantern_post')
  133 |       .map((entry) => ({
  134 |         index: entry.index,
  135 |         hp: entry.hp,
  136 |         maxHp: entry.maxHp,
  137 |         wrecked: entry.wrecked,
  138 |         repairCost: entry.repairCost,
  139 |         position: entry.position,
  140 |       })) ?? [],
  141 |   );
  142 | }
  143 | 
  144 | async function relightLantern(page: Page, index = 0): Promise<unknown> {
  145 |   const target = COLD_LANTERN_POSITIONS[index]!;
  146 |   await grantGold(page, 20);
  147 |   await teleport(page, target.x, target.z);
  148 |   const result = await page.evaluate((targetIndex) => window.__GR_TEST__?.repair('lantern_post', targetIndex), index);
  149 |   await expect.poll(() => lanternHp(page).then((entries) => entries[index]?.wrecked)).toBe(false);
  150 |   return result;
  151 | }
  152 | 
  153 | async function spawnAssault(page: Page): Promise<void> {
  154 |   const lantern = COLD_LANTERN_POSITIONS[0]!;
  155 |   for (const point of [
  156 |     { x: lantern.x - 2, z: lantern.z },
  157 |     { x: lantern.x, z: lantern.z + 2 },
  158 |     { x: lantern.x + 4, z: lantern.z },
  159 |     { x: lantern.x + 9, z: lantern.z },
  160 |   ]) {
  161 |     await expect(page.evaluate((pos) => window.__GR_TEST__?.spawnEnemyAt(pos.x, pos.z), point)).resolves.toBe(true);
  162 |   }
  163 |   await expect.poll(() => page.evaluate(() => window.__GR_TEST__?.enemyPositions().length ?? 0)).toBe(4);
  164 | }
  165 | 
  166 | async function enemyLights(page: Page): Promise<number[]> {
  167 |   return page.evaluate(() => window.__GR_TEST__?.enemyPositions().map((enemy) => enemy.light ?? 1).sort((a, b) => a - b) ?? []);
  168 | }
  169 | 
  170 | async function waitForSavedNightWave(page: Page, wave: number): Promise<SavedNightSuspend> {
> 171 |   await page.waitForFunction(
      |              ^ TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
  172 |     ([key, wanted]) => {
  173 |       const raw = localStorage.getItem(key);
  174 |       if (!raw) return false;
  175 |       try {
  176 |         return (JSON.parse(raw) as { wave?: number }).wave === wanted;
  177 |       } catch {
  178 |         return false;
  179 |       }
  180 |     },
  181 |     [RUN_SUSPEND_KEY, wave] as const,
  182 |     { timeout: 15_000 },
  183 |   );
  184 |   const raw = await page.evaluate((key) => localStorage.getItem(key), RUN_SUSPEND_KEY);
  185 |   expect(raw).toBeTruthy();
  186 |   return JSON.parse(raw!) as SavedNightSuspend;
  187 | }
  188 | 
  189 | async function enemyLightNear(page: Page, point: { x: number; z: number }): Promise<number> {
  190 |   const light = await page.evaluate((target) => {
  191 |     const enemies = window.__GR_TEST__?.enemyPositions() ?? [];
  192 |     let best = null as { distanceSq: number; light: number } | null;
  193 |     for (const enemy of enemies) {
  194 |       const dx = enemy.x - target.x;
  195 |       const dz = enemy.z - target.z;
  196 |       const distanceSq = dx * dx + dz * dz;
  197 |       if (!best || distanceSq < best.distanceSq) best = { distanceSq, light: enemy.light ?? 1 };
  198 |     }
  199 |     return best;
  200 |   }, point);
  201 |   expect(light).toBeTruthy();
  202 |   expect(light!.distanceSq).toBeLessThan(1);
  203 |   return light!.light;
  204 | }
  205 | 
  206 | async function spriteLuminance(page: Page, point: { x: number; z: number }): Promise<number> {
  207 |   const screen = await page.evaluate((pos) => window.__GR_TEST__?.screenPoint(pos.x, pos.z, 1.25) ?? null, point);
  208 |   expect(screen).toBeTruthy();
  209 |   expect(screen!.inView).toBe(true);
  210 | 
  211 |   const canvas = page.locator('#game-canvas');
  212 |   const [box, buffer] = await Promise.all([canvas.boundingBox(), canvas.screenshot()]);
  213 |   expect(box).toBeTruthy();
  214 |   const png = PNG.sync.read(buffer);
  215 |   const scaleX = png.width / box!.width;
  216 |   const scaleY = png.height / box!.height;
  217 |   const centerX = Math.round(screen!.x * scaleX);
  218 |   const centerY = Math.round(screen!.y * scaleY);
  219 |   const samples: number[] = [];
  220 | 
  221 |   for (let y = centerY - 8; y <= centerY + 8; y += 1) {
  222 |     if (y < 0 || y >= png.height) continue;
  223 |     for (let x = centerX - 6; x <= centerX + 6; x += 1) {
  224 |       if (x < 0 || x >= png.width) continue;
  225 |       const offset = (y * png.width + x) * 4;
  226 |       if (png.data[offset + 3] < 64) continue;
  227 |       const r = png.data[offset] / 255;
  228 |       const g = png.data[offset + 1] / 255;
  229 |       const b = png.data[offset + 2] / 255;
  230 |       samples.push(0.2126 * r + 0.7152 * g + 0.0722 * b);
  231 |     }
  232 |   }
  233 | 
  234 |   expect(samples.length).toBeGreaterThan(0);
  235 |   samples.sort((a, b) => a - b);
  236 |   return samples[Math.floor(samples.length * 0.95)] ?? 0;
  237 | }
  238 | 
  239 | async function groundLuminances(page: Page, points: readonly { x: number; z: number }[]): Promise<number[]> {
  240 |   const screen = await page.evaluate((worldPoints) => worldPoints.map((point) => window.__GR_TEST__?.screenPoint(point.x, point.z, 0.03) ?? null), points);
  241 |   expect(screen.every((point) => point?.inView)).toBe(true);
  242 |   const canvas = page.locator('#game-canvas');
  243 |   const [box, buffer] = await Promise.all([canvas.boundingBox(), canvas.screenshot()]);
  244 |   expect(box).toBeTruthy();
  245 |   const png = PNG.sync.read(buffer);
  246 | 
  247 |   return screen.map((point) => {
  248 |     const centerX = Math.round(point!.x * png.width / box!.width);
  249 |     const centerY = Math.round(point!.y * png.height / box!.height);
  250 |     const samples: number[] = [];
  251 |     for (let y = centerY - 4; y <= centerY + 4; y += 1) {
  252 |       for (let x = centerX - 4; x <= centerX + 4; x += 1) {
  253 |         const offset = (y * png.width + x) * 4;
  254 |         samples.push((0.2126 * png.data[offset]! + 0.7152 * png.data[offset + 1]! + 0.0722 * png.data[offset + 2]!) / 255);
  255 |       }
  256 |     }
  257 |     samples.sort((a, b) => a - b);
  258 |     return samples[Math.floor(samples.length / 2)] ?? 0;
  259 |   });
  260 | }
  261 | 
  262 | function visibleThreats(lights: readonly number[]): number {
  263 |   return lights.filter((light) => light >= VISIBLE_LIGHT).length;
  264 | }
  265 | 
  266 | async function expectClean(errors: ErrorBucket): Promise<void> {
  267 |   expect(errors.consoleErrors).toEqual([]);
  268 |   expect(errors.pageErrors).toEqual([]);
  269 | }
  270 | 
  271 | test('loads Night Shift contract data and ramps full, dusk, dark, dawn lighting', async ({ page }, testInfo) => {
```