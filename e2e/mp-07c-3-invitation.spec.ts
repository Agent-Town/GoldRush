import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

const CODE = '0123456789ABCDEF01234567';
const SHOT_DIR = path.join(process.cwd(), 'reviews/shots-mp-07c-3');

test('the tavern invites an agent in one paste without closing the human door', async ({ page, context }, testInfo) => {
  test.setTimeout(60_000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const errors = watchErrors(page);
  await page.route('**/api/multiplayer/create', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: CODE }) }));
  await page.addInitScript(({ profileKey, townKey, scoreKey }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'robin',
      profiles: [{ id: 'robin', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(townKey, 'Dawn Claim');
    localStorage.setItem(scoreKey, '[]');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('robin', TOWN_NAME_KEY),
    scoreKey: profileDataKey('robin', SCOREBOARD_KEY),
  });

  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await hold(page, 'KeyA', 850);
  await hold(page, 'KeyW', 850);
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt), { timeout: 10_000 }).toBe('tavern');
  await page.getByTestId('town-open-board').click();
  const card = page.getByTestId('ride-together-card');
  if ((await card.getAttribute('open')) === null) await page.getByTestId('ride-together-toggle').click();

  await page.getByTestId('ride-open-claim').click();
  await expect(page.getByTestId('ride-code-word')).not.toHaveText('No claim open');
  const phrase = ((await page.getByTestId('ride-code-word').textContent()) ?? '').trim();
  expect(phrase).toMatch(/^[A-Z]+-[A-Z]+-[0-9A-V]{20}$/);
  const command = page.getByTestId('ride-agent-command');
  await expect(command).toBeVisible();
  await expect(command).toHaveValue(
    `node scripts/gr-sim.mjs --room ${CODE} --origin https://gold-rush-3in.pages.dev # claim ${phrase}`,
  );

  await page.getByTestId('ride-agent-copy').click();
  await expect(page.getByTestId('ride-status')).toHaveText('Agent invitation copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await command.inputValue());
  await expect(page.getByTestId('ride-join-input')).toBeVisible();
  await expect(page.getByTestId('ride-join-submit')).toHaveText('Join a Ride');

  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-invitation.png`) });
  expect(errors.console).toEqual([]);
  expect(errors.page).toEqual([]);
});

function watchErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}
