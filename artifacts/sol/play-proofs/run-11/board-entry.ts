/** Run-11-only entry adapter: preserve the shared driver's play strategy unchanged. */
import { expect, type Page } from '@playwright/test';
export async function steer(page: Page, dx: number, dz: number, ms = 120) {
  const keys = [Math.abs(dx) > .35 ? (dx > 0 ? 'KeyD' : 'KeyA') : '', Math.abs(dz) > .35 ? (dz > 0 ? 'KeyS' : 'KeyW') : ''].filter(Boolean);
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  for (const key of keys) await page.keyboard.up(key);
}
export async function openBook(page: Page) {
  await page.waitForFunction(() => !!document.querySelector('[data-testid="start-menu-enter-town"]') || (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 60_000 });
  if (await page.getByTestId('start-menu-enter-town').isVisible()) await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10, undefined, { timeout: 60_000 });
  for (let step = 0; step < 90; step++) {
    const d = await page.evaluate(() => {
      const d = window.__GR_TOWN_DIAGNOSTICS__!;
      return { prompt: d.activePrompt, hero: d.player, target: d.buildings.find(b => b.id === 'tavern')!.approach };
    });
    if (d.prompt === 'tavern') break;
    await steer(page, d.target.x - d.hero.x, d.target.z - d.hero.z, 170);
  }
  await page.getByTestId('town-open-board').click({ timeout: 10_000 });
  await expect(page.getByTestId('contract-board')).toBeVisible();
}
export async function boardEntry(page: Page, id: string, epoch: string) {
  const goto = page.goto.bind(page);
  let entered = false;
  page.goto = async (url, options) => {
    if (entered || !url.includes(`contract=${id}`)) return goto(url, options);
    entered = true;
    await goto('/');
    await openBook(page);
    await page.getByTestId(`contract-chapter-tab-${epoch}`).click();
    await page.getByTestId(`contract-launch-${id}`).click();
    await page.waitForFunction(id => window.__THREE_GAME_DIAGNOSTICS__?.contract?.activeId === id, id, { timeout: 60_000 });
    const launch = new URL(page.url());
    expect(launch.searchParams.has('debug')).toBe(false);
    expect(launch.searchParams.has('seed')).toBe(false);
    launch.searchParams.set('timescale', '4');
    return goto(launch.toString(), options);
  };
}
