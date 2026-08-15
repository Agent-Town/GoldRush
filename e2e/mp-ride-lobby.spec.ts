import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { PROFILE_KEY, SCOREBOARD_KEY, TOWN_NAME_KEY, profileDataKey } from '../src/game/ProfileStorage';

const CODE = '0123456789ABCDEF01234567';
type StubRider = { playerId: string; name: string; town: string; client: 'browser' | 'headless' };
const HOST = { playerId: 'host', name: 'Robin', town: 'Dawn Claim', client: 'browser' } as const;
const AGENT = { playerId: 'agent', name: 'Claude', town: 'Calculating House', client: 'headless' } as const;
const SHOT_DIR = path.resolve('artifacts/mp-ride-lobby');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ profileKey, townKey, scoreKey }) => {
    if (window.name === 'mp-ride-lobby-seeded') return;
    window.name = 'mp-ride-lobby-seeded';
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'host',
      profiles: [{ id: 'host', name: 'Robin', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [] }],
    }));
    localStorage.setItem(townKey, 'Dawn Claim');
    localStorage.setItem(scoreKey, '[]');
  }, {
    profileKey: PROFILE_KEY,
    townKey: profileDataKey('host', TOWN_NAME_KEY),
    scoreKey: profileDataKey('host', SCOREBOARD_KEY),
  });
});

test('host sees the contract and riders update before start', async ({ page }, testInfo) => {
  test.setTimeout(45_000);
  const errors = watchErrors(page);
  let roster: StubRider[] = [HOST, AGENT];
  let inspectCalls = 0;
  await stubRideApi(page, () => {
    inspectCalls += 1;
    return roster;
  });
  await openRideLobby(page);

  await expect(page.getByTestId('ride-contract')).toContainText('the-claim');
  await expect(page.getByTestId('ride-contract')).toContainText('trail');
  await expect(page.getByTestId('ride-contract')).toContainText('gold-rush');
  await expect(page.getByTestId('ride-roster')).toContainText('Riders (2)');
  await expect(page.getByTestId('ride-roster')).toContainText('Robin · Dawn Claim · browser');
  await expect(page.getByTestId('ride-roster')).toContainText('Claude · Calculating House · headless');

  await page.mouse.click(6, 6);
  await mkdir(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-two-rider-lobby.png`), fullPage: true });

  roster = [...roster, { playerId: 'agent-2', name: 'Ada', town: 'Brass Mesa', client: 'headless' }];
  await expect(page.getByTestId('ride-roster')).toContainText('Ada · Brass Mesa · headless', { timeout: 5_000 });
  expect(inspectCalls).toBeGreaterThanOrEqual(2);
  expect(errors).toEqual({ console: [], page: [] });
});

test('Riding solo card dismisses itself', async ({ page }) => {
  test.setTimeout(45_000);
  const errors = watchErrors(page);
  let socketMessages = 0;
  let inspectCalls = 0;
  await stubRideApi(page, () => {
    inspectCalls += 1;
    return [HOST, AGENT];
  });
  await page.routeWebSocket('**/api/multiplayer/connect**', (socket) => {
    socket.onMessage(() => {
      socketMessages += 1;
      socket.send(JSON.stringify({ v: 3, type: 'error', error: 'room_not_found' }));
    });
  });
  await openRideLobby(page);
  await expect(page.getByTestId('ride-roster')).toContainText('Riders (2)');
  const inspectCallsAtStart = inspectCalls;
  await page.getByTestId('ride-start').click();

  const card = page.getByTestId('mp-desync-card');
  await expect.poll(() => socketMessages).toBeGreaterThan(0);
  await expect(card).toContainText('Riding solo', { timeout: 15_000 });
  await expect(card).toHaveAttribute('aria-hidden', 'true', { timeout: 8_000 });
  await expect(card).not.toHaveClass(/death-overlay--visible/);
  expect(inspectCalls).toBe(inspectCallsAtStart);
  expect(errors).toEqual({ console: [], page: [] });
});

async function stubRideApi(page: Page, roster: () => readonly object[]): Promise<void> {
  await page.route('**/api/multiplayer/create', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ code: CODE }),
  }));
  await page.route('**/api/multiplayer/inspect**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ ok: true, started: false, players: roster().length, roster: roster() }),
  }));
}

async function openRideLobby(page: Page): Promise<void> {
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
}

async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

function watchErrors(page: Page): { console: string[]; page: string[] } {
  const errors = { console: [] as string[], page: [] as string[] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.console.push(message.text());
  });
  page.on('pageerror', (error) => errors.page.push(error.message));
  return errors;
}
