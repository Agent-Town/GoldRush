# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: native-proofs/e1-drill-yard.spec.ts >> Drill Yard practice wave, Book return and unchanged plain-reload persistence
- Location: e2e/native-proofs/e1-drill-yard.spec.ts:21:1

# Error details

```
TimeoutError: locator.click: Timeout 20000ms exceeded.
Call log:
  - waiting for getByTestId('start-menu-enter-town')

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
  1  | /** Run-11-only entry adapter: preserve the shared driver's play strategy unchanged. */
  2  | import { expect, type Page } from '@playwright/test';
  3  | export async function steer(page: Page, dx: number, dz: number, ms = 120) {
  4  |   const keys = [Math.abs(dx) > .35 ? (dx > 0 ? 'KeyD' : 'KeyA') : '', Math.abs(dz) > .35 ? (dz > 0 ? 'KeyS' : 'KeyW') : ''].filter(Boolean);
  5  |   for (const key of keys) await page.keyboard.down(key);
  6  |   await page.waitForTimeout(ms);
  7  |   for (const key of keys) await page.keyboard.up(key);
  8  | }
  9  | export async function openBook(page: Page) {
> 10 |   await page.waitForFunction(() => !!document.querySelector('[data-testid="start-menu-enter-town"]') || (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 60_000 });
     |                                                   ^ TimeoutError: locator.click: Timeout 20000ms exceeded.
  11 |   if (await page.getByTestId('start-menu-enter-town').isVisible()) await page.getByTestId('start-menu-enter-town').click();
  12 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 60_000 });
  13 |   for (let step = 0; step < 90; step++) {
  14 |     const d = await page.evaluate(() => {
  15 |       const d = window.__GR_TOWN_DIAGNOSTICS__!;
  16 |       return { prompt: d.activePrompt, hero: d.player, target: d.buildings.find(b => b.id === 'tavern')!.approach };
  17 |     });
  18 |     if (d.prompt === 'tavern') break;
  19 |     await steer(page, d.target.x - d.hero.x, d.target.z - d.hero.z, 170);
  20 |   }
  21 |   await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  22 |   await expect(page.getByTestId('contract-board')).toBeVisible();
  23 | }
  24 | export async function boardEntry(page: Page, id: string, epoch: string) {
  25 |   const goto = page.goto.bind(page);
  26 |   let entered = false;
  27 |   page.goto = async (url, options) => {
  28 |     if (entered || !url.includes(`contract=${id}`)) return goto(url, options);
  29 |     entered = true;
  30 |     await goto('/');
  31 |     await openBook(page);
  32 |     await page.getByTestId(`contract-chapter-tab-${epoch}`).click();
  33 |     await page.getByTestId(`contract-launch-${id}`).click();
  34 |     await page.waitForFunction(id => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId === id, id, { timeout: 60_000 });
  35 |     const launch = new URL(page.url());
  36 |     expect(launch.searchParams.has('debug')).toBe(false);
  37 |     expect(launch.searchParams.has('seed')).toBe(false);
  38 |     launch.searchParams.set('timescale', '4');
  39 |     return goto(launch.toString(), options);
  40 |   };
  41 | }
  42 | 
```