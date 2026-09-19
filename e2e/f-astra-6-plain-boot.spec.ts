import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, SCOREBOARD_KEY, STORY_FIRST_BOOT_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

for (const map of ['the-claim', 'town', 'e1-dry-gulch', 'e1-twin-banks']) {
  test(`F-ASTRA-6 plain ${map} boot has no console or page errors`, async ({ page }, info) => {
    test.setTimeout(120_000);
    const errors = { console: [] as string[], page: [] as string[] };
    page.on('console', message => { if (message.type() === 'error') errors.console.push(message.text()); });
    page.on('pageerror', error => errors.page.push(error.message));
    // A progressed player's storage admits the normal staged-launch path. No debug flag,
    // test API, preview unlock, renderer replacement, or scene mutation is involved.
    await page.addInitScript(({ map, profile, scores, guide, story, town }) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem(profile, JSON.stringify({ version: 2, activeId: 'robin', profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }] }));
      localStorage.setItem(scores, JSON.stringify([{ waves: 12, kills: 30, gold: 50, timeAlive: 300, at: 1, secured: true, contractId: 'the-claim', profileName: 'Robin' }]));
      localStorage.setItem(guide, '1');
      localStorage.setItem(story, '1');
      localStorage.setItem(town, 'Quartz Hill');
      if (map !== 'town') sessionStorage.setItem('gr.contract.launch.v1', map);
    }, { map, profile: PROFILE_KEY, scores: profileDataKey('robin', SCOREBOARD_KEY), guide: profileDataKey('robin', FIRST_CLAIM_DONE_KEY), story: profileDataKey('robin', STORY_FIRST_BOOT_KEY), town: profileDataKey('robin', TOWN_NAME_KEY) });
    await page.goto(map === 'town' ? '/' : `/?contract=${map}`);
    if (map === 'town') {
      await page.getByTestId('start-menu-enter-town').click();
      await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 30, null, { timeout: 60_000 });
      await expect(page.locator('#game-canvas')).toHaveAttribute('data-town3d-plaza-props-state', 'loaded', { timeout: 60_000 });
    } else {
      await page.waitForFunction(id => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === id, map, { timeout: 60_000 });
      await page.getByTestId('contract-briefing-dismiss').click({ timeout: 2000 }).catch(() => {});
      await expect(page.locator('#game-canvas')).toHaveAttribute('data-run3d-pilot-state', 'ready', { timeout: 60_000 });
    }
    await page.waitForTimeout(1000);
    expect(new URL(page.url()).searchParams.has('debug')).toBe(false);
    const out = 'artifacts/sol/open-findings';
    await mkdir(`${out}/_raw/plain`, { recursive: true });
    await page.screenshot({ path: `${out}/_raw/plain/${info.project.name}-${map}.png` });
    await writeFile(`${out}/plain-${info.project.name}-${map}.json`, JSON.stringify({ map, url: page.url(), viewport: page.viewportSize(), errors }, null, 2));
    expect(errors).toEqual({ console: [], page: [] });
  });
}
