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
        - generic: Town Square
      - generic [ref=e4]:
        - group [ref=e5]:
          - generic "Settings" [ref=e6] [cursor=pointer]
        - button "Exit" [ref=e7] [cursor=pointer]
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
> 10 |   await page.getByTestId('start-menu-enter-town').click({ timeout: 20_000 });
     |                                                   ^ TimeoutError: locator.click: Timeout 20000ms exceeded.
  11 |   await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 60_000 });
  12 |   for (let step = 0; step < 90; step++) {
  13 |     const d = await page.evaluate(() => {
  14 |       const d = window.__GR_TOWN_DIAGNOSTICS__!;
  15 |       return { prompt: d.activePrompt, hero: d.player, target: d.buildings.find(b => b.id === 'tavern')!.approach };
  16 |     });
  17 |     if (d.prompt === 'tavern') break;
  18 |     await steer(page, d.target.x - d.hero.x, d.target.z - d.hero.z, 170);
  19 |   }
  20 |   await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  21 |   await expect(page.getByTestId('contract-board')).toBeVisible();
  22 | }
  23 | export async function boardEntry(page: Page, id: string, epoch: string) {
  24 |   const goto = page.goto.bind(page);
  25 |   let entered = false;
  26 |   page.goto = async (url, options) => {
  27 |     if (entered || !url.includes(`contract=${id}`)) return goto(url, options);
  28 |     entered = true;
  29 |     await goto('/');
  30 |     await openBook(page);
  31 |     await page.getByTestId(`contract-chapter-tab-${epoch}`).click();
  32 |     await page.getByTestId(`contract-launch-${id}`).click();
  33 |     await page.waitForFunction(id => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId === id, id, { timeout: 60_000 });
  34 |     const launch = new URL(page.url());
  35 |     expect(launch.searchParams.has('debug')).toBe(false);
  36 |     expect(launch.searchParams.has('seed')).toBe(false);
  37 |     launch.searchParams.set('timescale', '4');
  38 |     return goto(launch.toString(), options);
  39 |   };
  40 | }
  41 | 
```