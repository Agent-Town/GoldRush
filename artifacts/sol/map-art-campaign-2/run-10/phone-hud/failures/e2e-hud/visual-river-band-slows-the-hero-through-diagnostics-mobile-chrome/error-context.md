# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> river band slows the hero through diagnostics
- Location: e2e/visual.spec.ts:212:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "river"
Received: "shallows"

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
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
        - strong: 00:10
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
    - generic: Swipe to scroll
  - generic:
    - button [ref=e14]: Rotate
    - button [ref=e15]: Weapon
    - button [ref=e16]: OK
  - generic:
    - status:
      - generic:
        - paragraph: Tavernkeeper
        - paragraph: You came up the trail with a hat, a coat and a satchel, and out here that is a whole outfit.
        - paragraph: What is a claim? Gold, they will tell you. Simple, wrong, and the reason every one of us is standing here.
  - region
```

# Test source

```ts
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
  219 |     .toBeLessThan(-4);
  220 |   await page.keyboard.up('KeyA');
  221 |   await page.waitForTimeout(180);
  222 | 
  223 |   await page.keyboard.down('KeyW');
  224 |   await page.waitForTimeout(650);
  225 |   const bankSpeed = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.speed ?? 0);
  226 |   expect(bankSpeed).toBeGreaterThan(5.2);
  227 | 
  228 |   await expect
  229 |     .poll(async () => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.terrain.playerZone))
> 230 |     .toBe('river');
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  231 |   await page.waitForTimeout(400);
  232 |   const riverSpeed = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.speed ?? 0);
  233 |   await page.keyboard.up('KeyW');
  234 | 
  235 |   const ratio = riverSpeed / bankSpeed;
  236 |   expect(ratio).toBeGreaterThan(0.48);
  237 |   expect(ratio).toBeLessThan(0.62);
  238 | });
  239 | 
```