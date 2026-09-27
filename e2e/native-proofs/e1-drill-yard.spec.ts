import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PROFILE_KEY, TOWN_NAME_KEY, TOWN_WELCOME_SEEN_KEY, SCOREBOARD_KEY, profileDataKey } from '../../src/game/ProfileStorage';
import { META_PROGRESS_KEY } from '../../src/game/MetaProgress';
import { openBook, steer } from '../../artifacts/sol/play-proofs/run-11/board-entry';

test.skip(process.env.GR_NATIVE_PROOF !== '1', 'native practice proof — set GR_NATIVE_PROOF=1');
test.use({ trace: 'off' });
const root = path.resolve('artifacts/sol/play-proofs/run-11/e1-drill-yard');
async function walk(page: Page, x: number, z: number) {
  for (let i = 0; i < 180; i++) {
    const d = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!);
    if (d.runState === 'dead') return false;
    if (Math.hypot(x - d.heroPos.x, z - d.heroPos.z) < 1.2) return true;
    if (d.progression?.offer) await page.keyboard.press('Digit1');
    await steer(page, x - d.heroPos.x, z - d.heroPos.z, 80);
  }
  return false;
}
test('Drill Yard practice wave, Book return and unchanged plain-reload persistence', async ({ page }, info) => {
  test.setTimeout(240_000);
  await mkdir(root, { recursive: true });
  const errors: string[] = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  let standings = 0;
  page.on('request', r => { if (r.url().includes('/api/standings')) standings++; });
  await page.addInitScript(({ profile, town, welcome }) => {
    if (sessionStorage.getItem('pp7-yard')) return;
    localStorage.clear(); sessionStorage.clear(); sessionStorage.setItem('pp7-yard', '1');
    localStorage.setItem(profile, JSON.stringify({ version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: ['story:first-contract'] }] }));
    localStorage.setItem(town, 'Quartz Hill'); localStorage.setItem(welcome, '1');
  }, { profile: PROFILE_KEY, town: profileDataKey('robin', TOWN_NAME_KEY), welcome: profileDataKey('robin', TOWN_WELCOME_SEEN_KEY) });
  const persistence = () => page.evaluate(keys => Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)])), [SCOREBOARD_KEY, META_PROGRESS_KEY].flatMap(k => [k, profileDataKey('robin', k)]));
  const row: Record<string, unknown> = { project: info.project.name, errors };
  try {
    await page.goto('/'); await openBook(page);
    const before = await persistence();
    await page.getByTestId('contract-launch-e1-drill-yard').click();
    await page.waitForFunction(() => !!window.__THREE_GAME_DIAGNOSTICS__?.drillYard, undefined, { timeout: 60_000 });
    expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
    expect(new URL(page.url()).searchParams.has('seed')).toBe(false);
    const dismiss = page.getByTestId('contract-briefing-dismiss');
    if (await dismiss.isVisible()) await dismiss.click();
    if (await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.paused)) await page.keyboard.press('KeyP');
    expect(await walk(page, -8, 12), 'reach practice gold station').toBe(true);
    await expect(page.getByTestId('drill-yard-action')).toHaveText('Draw practice gold');
    await page.getByTestId('drill-yard-action').click();
    expect(await walk(page, 8, 12), 'reach bell').toBe(true);
    await expect(page.getByTestId('drill-yard-action')).toHaveText('Ring for a practice wave');
    await page.getByTestId('drill-yard-action').click();
    await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.drillYard?.bell.wavesCompleted), { timeout: 90_000 }).toBe(1);
    row.terminal = await page.evaluate(() => ({ yard: window.__THREE_GAME_DIAGNOSTICS__?.drillYard, hp: window.__THREE_GAME_DIAGNOSTICS__?.hp, gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold, sim: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive }));
    await page.screenshot({ path: path.join(root, `terminal-${info.project.name}.png`) });
    await page.getByTestId('drill-yard-exit').click();
    await expect(page.getByTestId('contract-board')).toBeVisible({ timeout: 30_000 });
    expect(await persistence()).toEqual(before);
    await page.screenshot({ path: path.join(root, `board-${info.project.name}.png`) });
    await expect(page.getByTestId('contract-best-e1-drill-yard')).toHaveCount(0);
    await page.getByTestId('contract-card-e1-drill-yard').screenshot({ path: path.join(root, `no-bank-${info.project.name}.png`) });
    await page.goto('/'); await openBook(page);
    expect(await persistence()).toEqual(before);
    expect(standings).toBe(0);
    expect(errors).toEqual([]);
    row.verdict = 'PASS'; row.persistence = before; row.standingsRequests = standings;
  } finally {
    row.final = await page.evaluate(() => ({ yard: window.__THREE_GAME_DIAGNOSTICS__?.drillYard, hp: window.__THREE_GAME_DIAGNOSTICS__?.hp, state: window.__THREE_GAME_DIAGNOSTICS__?.runState })).catch(() => null);
    await page.screenshot({ path: path.join(root, `last-${info.project.name}.png`) }).catch(() => {});
    await writeFile(path.join(root, `row-${info.project.name}.json`), JSON.stringify(row, null, 2) + '\n');
  }
});
