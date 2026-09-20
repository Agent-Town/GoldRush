# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: advance-stream.spec.ts >> launch aborts pending prefetch before the run requests its own map
- Location: e2e/advance-stream.spec.ts:138:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "tavern"
Received: null

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic "Playable Three.js game canvas" [ref=e3]
  - region "Town square":
    - generic:
      - generic:
        - strong: Quartz Hill
      - generic [ref=e6]:
        - group [ref=e7]:
          - generic "Settings" [ref=e8] [cursor=pointer]
        - button "Exit" [ref=e9] [cursor=pointer]
```

# Test source

```ts
  89  |   await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-enabled', 'false');
  90  |   expect(prefetched).toEqual([]);
  91  |   expect(errors).toEqual([]);
  92  | });
  93  | 
  94  | test('the warm-every-map opt-in restores the sweep', async ({ page }, testInfo) => {
  95  |   test.setTimeout(60_000);
  96  |   const errors = collectErrors(page);
  97  |   const prefetched: string[] = [];
  98  |   await page.route('**/*.glb', async (route) => {
  99  |     if (route.request().headers()['x-gold-rush-prefetch'] !== '1') return route.continue();
  100 |     prefetched.push(route.request().url());
  101 |     await route.fulfill({ contentType: 'model/gltf-binary', body: Buffer.alloc(1) });
  102 |   });
  103 |   await page.goto('/?tier=full');
  104 |   const canvas = page.locator('#game-canvas');
  105 |   await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'ready', { timeout: 20_000 });
  106 |   expect(prefetched.some(url => url.includes('dry-gulch-terrain'))).toBe(false);
  107 | 
  108 |   await page.getByTestId('start-menu-settings').click();
  109 |   const toggle = page.getByRole('checkbox', { name: 'Warm every map' });
  110 |   await expect(toggle).not.toBeChecked();
  111 |   await toggle.check();
  112 |   await expect.poll(() => prefetched.some(url => url.includes('dry-gulch-terrain'))).toBe(true);
  113 |   await expect(canvas).toHaveAttribute('data-asset-prefetch-state', 'ready', { timeout: 30_000 });
  114 |   expect(prefetched.some(url => url.includes('archive-world-terrain'))).toBe(true);
  115 |   expect(await page.evaluate(key => localStorage.getItem(key), WARM_EVERY_MAP_KEY)).toBe('true');
  116 |   await page.getByTestId('start-menu-settings-close').click();
  117 |   await page.getByTestId('start-menu-settings').click();
  118 |   await expect(toggle).toBeChecked();
  119 |   await toggle.scrollIntoViewIfNeeded();
  120 |   await expect(toggle).toBeInViewport();
  121 |   await page.screenshot({ path: `artifacts/prefetch-bounded-warming/settings-${testInfo.project.name}.png` });
  122 |   await toggle.uncheck();
  123 |   expect(await page.evaluate(key => localStorage.getItem(key), WARM_EVERY_MAP_KEY)).toBe('false');
  124 |   expect(errors).toEqual([]);
  125 | });
  126 | 
  127 | test('closing profiles resumes the menu stream', async ({ page }) => {
  128 |   const errors = collectErrors(page);
  129 |   await page.route('**/*.glb', async (route) => {
  130 |     if (route.request().headers()['x-gold-rush-prefetch'] === '1') await new Promise((resolve) => setTimeout(resolve, 500));
  131 |     await route.continue().catch(() => undefined);
  132 |   });
  133 | 
  134 |   await page.goto('/');
  135 |   await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-state', 'fetching', { timeout: 15_000 });
  136 |   await page.getByTestId('start-menu-profile').click();
  137 |   await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-state', 'paused');
  138 |   await page.getByTestId('profile-back').click();
  139 |   await expect(page.locator('#game-canvas')).not.toHaveAttribute('data-asset-prefetch-state', 'paused');
  140 |   await expect(page.locator('#game-canvas')).toHaveAttribute('data-asset-prefetch-scene', 'menu');
  141 |   expect(errors).toEqual([]);
  142 | });
  143 | 
  144 | test('launch aborts pending prefetch before the run requests its own map', async ({ page }) => {
  145 |   test.setTimeout(60_000);
  146 |   const errors = collectErrors(page);
  147 |   let releasePrefetch: () => void = () => {};
  148 |   const barrier = new Promise<void>((resolve) => { releasePrefetch = resolve; });
  149 |   let blockedPrefetches = 0;
  150 |   let actualRunRequest = false;
  151 | 
  152 |   page.on('request', (request) => {
  153 |     if (request.headers()['x-gold-rush-prefetch'] !== '1' && request.url().includes('the-claim-terrain')) {
  154 |       actualRunRequest = true;
  155 |     }
  156 |   });
  157 |   await page.route('**/*.glb', async (route) => {
  158 |     if (route.request().headers()['x-gold-rush-prefetch'] !== '1') {
  159 |       await route.continue();
  160 |       return;
  161 |     }
  162 |     blockedPrefetches += 1;
  163 |     await barrier;
  164 |     await route.continue().catch(() => undefined);
  165 |   });
  166 | 
  167 |   await page.goto('/');
  168 |   await expect.poll(() => blockedPrefetches, { timeout: 15_000 }).toBeGreaterThan(0);
  169 |   await page.evaluate(() => history.replaceState(null, '', '/?debug&nowaves&nolevel&seed=advance-stream'));
  170 |   await page.getByTestId('start-menu-enter-town').click();
  171 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  172 |   await openBoard(page);
  173 |   await page.getByTestId('contract-launch-the-claim').click();
  174 | 
  175 |   const runStartedBeforeRelease = await Promise.race([
  176 |     expect.poll(() => actualRunRequest, { timeout: 4_000 }).toBe(true).then(() => true),
  177 |     new Promise<false>((resolve) => setTimeout(() => resolve(false), 4_500)),
  178 |   ]);
  179 |   releasePrefetch();
  180 |   expect(runStartedBeforeRelease).toBe(true);
  181 |   await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  182 |   expect(errors).toEqual([]);
  183 | });
  184 | 
  185 | function collectErrors(page: Page): string[] {
  186 |   const errors: string[] = [];
  187 |   page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  188 |   page.on('pageerror', (error) => errors.push(error.message));
> 189 |   return errors;
      |                                                                                                                  ^ Error: expect(received).toBe(expected) // Object.is equality
  190 | }
  191 | 
  192 | async function openBoard(page: Page): Promise<void> {
  193 |   await hold(page, 'KeyA', 850);
  194 |   await hold(page, 'KeyW', 850);
  195 |   await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 8_000 }).toBe('tavern');
  196 |   await page.getByTestId('town-open-board').click();
  197 |   await expect(page.getByTestId('contract-board')).toBeVisible();
  198 | }
  199 | 
  200 | async function hold(page: Page, key: string, ms: number): Promise<void> {
  201 |   await page.keyboard.down(key);
  202 |   await page.waitForTimeout(ms);
  203 |   await page.keyboard.up(key);
  204 | }
  205 | 
```