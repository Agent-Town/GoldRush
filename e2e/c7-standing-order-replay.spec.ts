import { expect, test, type Page } from '@playwright/test';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, TOWN_WELCOME_SEEN_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { RUN_TAPES_KEY, agentOrdersEventLogHash, type RunTape } from '../src/game/RunTape';
import type { StandingOrdersView } from '../src/agent/StandingOrders';
import engineEra from '../assets/engine-era.json' with { type: 'json' };

test('a fresh browser standing-order tape watches to its own hash while an unstamped tape uses the tape show', async ({ page }) => {
  test.setTimeout(180_000);
  await seedProfile(page);
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  const tape = await recordStandingTape(page);
  expect(tape.meta).toEqual({ buildId: 'dev', engineHash: engineEra.engineHash, era: engineEra.era });

  await page.goto('/');
  await page.getByTestId('start-menu-enter-town').click();
  await openTapeShelf(page);
  await page.getByTestId('watch-run-tape').click();
  await page.getByTestId('lantern-speed-4').click();
  await page.getByTestId('lantern-wave-skip').click();
  await expect(page.getByTestId('lantern-show')).toHaveAttribute('data-playback', 'complete', { timeout: 60_000 });
  const status = page.getByTestId('lantern-playback-status');
  await expect(status).toHaveAttribute('data-hash', tape.eventLogHash);
  await expect(status).toHaveAttribute('data-expected-hash', tape.eventLogHash);

  await page.getByTestId('lantern-close').click();
  await page.evaluate((key) => {
    const shelf = JSON.parse(localStorage.getItem(key) ?? '{}') as { tapes?: RunTape[] };
    if (!shelf.tapes?.[0]?.meta) throw new Error('Recorded browser tape missing.');
    shelf.tapes[0].meta = { buildId: shelf.tapes[0].meta.buildId };
    localStorage.setItem(key, JSON.stringify(shelf));
  }, RUN_TAPES_KEY);
  await openTapeShelf(page);
  await page.getByTestId('watch-run-tape').click();
  await expect(page.getByTestId('lantern-show')).toHaveAttribute('data-era-refused', 'false');
  await expect(page.getByTestId('lantern-agent-honesty')).toBeHidden();
  expect(errors).toEqual([]);
});

async function recordStandingTape(page: Page): Promise<RunTape> {
  await page.goto('/?debug&nolevel&nowaves&seed=c7-standing-order-replay');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.advanceSim(1);
  });
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  await page.getByTestId('keep-run-tape').click();
  // The former PICK_UPGRADE fixture scheduled its order outside the headless offer window and
  // therefore asserted an empty-order hash. A tick-zero HARVEST keeps the exact-hash proof real.
  const orders = [{ verb: 'HARVEST' as const, seam: 'gold-seam-1' }];
  const log: StandingOrdersView['log'] = [{
    seq: 1,
    at: 0,
    type: 'orders_replaced',
    orders: orders.map((order, index) => ({ id: `orders-1-${index + 1}`, order, status: 'pending' })),
  }];
  const eventLogHash = agentOrdersEventLogHash({ needsRider: false, orders: [], log });
  return page.evaluate(({ key, orders, eventLogHash }) => {
    const shelf = JSON.parse(localStorage.getItem(key) ?? '{}') as { tapes?: RunTape[] };
    const tape = shelf.tapes?.[0];
    if (!tape) throw new Error('Recorded browser tape missing.');
    tape.inputLog.entries.push({
      t: 0,
      mx: 0,
      my: 0,
      a: [{ kind: 'agent_orders' as const, orders }],
    });
    tape.eventLogHash = eventLogHash;
    localStorage.setItem(key, JSON.stringify(shelf));
    return tape;
  }, {
    key: RUN_TAPES_KEY,
    orders,
    eventLogHash,
  });
}

async function seedProfile(page: Page): Promise<void> {
  await page.addInitScript(({ profileKey, metaKey, townKey, firstClaimKey, welcomeKey }) => {
    if (localStorage.getItem(profileKey)) return;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(profileKey, JSON.stringify({
      version: 2,
      activeId: 'replay',
      profiles: [{ id: 'replay', name: 'Replay', createdAt: 1, updatedAt: 1, difficultyPreset: 'trail', hintsSeen: [], trailGuide: true }],
    }));
    localStorage.setItem(metaKey, JSON.stringify({
      version: 1,
      tracks: { territory: 0, science: 0, hero: 0, agent: 0 },
    }));
    localStorage.setItem(townKey, 'Quartz Hill');
    localStorage.setItem(firstClaimKey, '1');
    localStorage.setItem(welcomeKey, '1');
  }, {
    profileKey: PROFILE_KEY,
    metaKey: profileDataKey('replay', META_PROGRESS_KEY),
    townKey: profileDataKey('replay', TOWN_NAME_KEY),
    firstClaimKey: profileDataKey('replay', FIRST_CLAIM_DONE_KEY),
    welcomeKey: profileDataKey('replay', TOWN_WELCOME_SEEN_KEY),
  });
}

async function openTapeShelf(page: Page): Promise<void> {
  await page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    const town = window.__GR_TOWN_DIAGNOSTICS__!;
    const approach = town.buildings.find((building) => building.id === 'schoolhouse')!.approach;
    town.teleport(approach.x, approach.z);
  });
  await expect.poll(() => page.evaluate(() => window.__GR_TOWN_DIAGNOSTICS__?.activePrompt)).toBe('schoolhouse');
  await page.getByTestId('town-open-schoolhouse').click();
  await page.getByTestId('schoolhouse-open-tapes').click();
}
