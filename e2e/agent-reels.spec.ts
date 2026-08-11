import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { expect, test } from '@playwright/test';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, TOWN_WELCOME_SEEN_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { RUN_TAPES_KEY } from '../src/game/RunTape';

const ORDERS = [
  [{ verb: 'HOLD', pos: { x: 0, z: 12 } }],
  ...Array(20).fill(null),
].map((value) => JSON.stringify(value)).join('\n') + '\n';

test('a headless agent reel replays through the browser with the same event hash', async ({ page }) => {
  test.setTimeout(180_000);
  const directory = await mkdtemp(path.join(tmpdir(), 'gold-rush-agent-reel-'));
  const tapePath = path.join(directory, 'tape.json');
  const run = spawnSync(process.execPath, [
    'scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--tape', tapePath,
  ], { encoding: 'utf8', input: ORDERS, timeout: 30_000 });
  expect(run.status, run.stderr).toBe(0);
  const tape = JSON.parse(await readFile(tapePath, 'utf8'));
  expect(tape.inputLog.entries.some((entry: { a: Array<{ kind?: string }> }) =>
    entry.a.some((action) => action.kind === 'agent_orders'))).toBe(true);

  await page.addInitScript(({ profileKey, tapesKey, townKey, firstClaimKey, welcomeKey, tape }) => {
    localStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'reel',
      profiles: [{ id: 'reel', name: 'Reel', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [], trailGuide: true }],
    }));
    localStorage.setItem(tapesKey, JSON.stringify({ version: 1, tapes: [tape] }));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(firstClaimKey, '1');
    localStorage.setItem(welcomeKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    tapesKey: profileDataKey('reel', RUN_TAPES_KEY),
    townKey: profileDataKey('reel', TOWN_NAME_KEY),
    firstClaimKey: profileDataKey('reel', FIRST_CLAIM_DONE_KEY),
    welcomeKey: profileDataKey('reel', TOWN_WELCOME_SEEN_KEY),
    tape,
  });

  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const approach = town.buildings.find((building) => building.id === 'schoolhouse')!.approach;
    town.teleport(approach.x, approach.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
  await page.getByTestId('schoolhouse-open-tapes').click();
  await page.getByTestId('watch-run-tape').click();
  await page.getByTestId('lantern-speed-4').click();
  await expect(page.getByTestId('lantern-show')).toHaveAttribute('data-playback', 'complete', { timeout: 120_000 });
  const status = page.getByTestId('lantern-playback-status');
  await expect(status).toHaveAttribute('data-hash', tape.eventLogHash);
  await expect(status).toHaveAttribute('data-expected-hash', tape.eventLogHash);
  expect(errors).toEqual([]);
});
