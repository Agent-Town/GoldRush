import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { FIRST_CLAIM_DONE_KEY, PROFILE_KEY, TOWN_NAME_KEY, TOWN_WELCOME_SEEN_KEY, profileDataKey } from '../src/game/ProfileStorage';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import { RUN_TAPES_KEY, agentOrdersEventLogHash, type RunTape } from '../src/game/RunTape';
import type { StandingOrder, StandingOrdersView } from '../src/agent/StandingOrders';
import { PLAYBOOK_STEP_SECONDS } from '../src/playbook/PlaybookFormat';

const DRAFT_TICKS = Math.ceil(Balance.offers.pickSeconds / PLAYBOOK_STEP_SECONDS);
const PICK_SETTLE_TICKS = 300;

test('a browser standing-order tape defaults one draft, picks the next, and reproduces its hash', async ({ page }) => {
  test.setTimeout(180_000);
  await seedProfile(page);
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  const tape = await recordStandingTape(page);

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
  await page.getByTestId('lantern-wave-skip').click();
  await expect(page.getByTestId('lantern-show')).toHaveAttribute('data-playback', 'complete', { timeout: 60_000 });
  const status = page.getByTestId('lantern-playback-status');
  await expect(status).toHaveAttribute('data-hash', tape.eventLogHash);
  await expect(status).toHaveAttribute('data-expected-hash', tape.eventLogHash);
  expect(errors).toEqual([]);
});

async function recordStandingTape(page: Page): Promise<RunTape> {
  await page.goto('/?debug&seed=c7-standing-order-replay');
  await page.waitForFunction(() => window.__GR_TEST__ && window.__GR_AGENT__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const script = Array.from({ length: 28 }, (_, index) => ({
    t: index * 135,
    mx: [1, 0, -1, 0][index % 4]!,
    my: [0, 1, 0, -1][index % 4]!,
    a: [],
  }));
  await page.evaluate((entries) => {
    window.__GR_TEST__!.setManualSim(true);
    const started = window.__GR_TEST__!.playbook.startRecording({ script: entries });
    if (!started.ok) throw new Error(`Could not start draft recording: ${started.reason}`);
  }, script);
  const firstDraftTick = await advanceToDraft(page);
  await expect.poll(() => page.evaluate(() => Object.keys(
    (window.__THREE_GAME_DIAGNOSTICS__ as unknown as { progression: { stacks: Record<string, number> } }).progression.stacks,
  ).length), {
    timeout: 60_000,
  }).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('playing');
  const secondDraftTick = await advanceToDraft(page);
  const orders = await page.evaluate(() => {
    const id = (window.__THREE_GAME_DIAGNOSTICS__ as unknown as { progression: { offer: string[] | null } }).progression.offer?.[0];
    if (!id) throw new Error('Second browser upgrade offer did not open.');
    const orders = [{ verb: 'PICK_UPGRADE' as const, id }];
    const receipt = window.__GR_AGENT__!.submitOrders(orders);
    if (!receipt.outcome.ok) throw new Error(receipt.outcome.message ?? receipt.outcome.reason);
    window.__GR_TEST__!.advanceSim(1 / 30);
    return orders;
  });
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('playing');
  await page.evaluate(() => window.__GR_TEST__!.endRunForTest());
  await page.getByTestId('keep-run-tape').click();
  const log: StandingOrdersView['log'] = [{
    seq: 1,
    at: 0,
    type: 'orders_replaced',
    orders: orders.map((order, index) => ({ id: `orders-1-${index + 1}`, order, status: 'pending' })),
  }];
  const eventLogHash = agentOrdersEventLogHash({ needsRider: false, orders: [], log });
  return page.evaluate(({ key, orders, firstDraftTick, secondDraftTick, draftTicks, pickSettleTicks, eventLogHash }) => {
    const shelf = JSON.parse(localStorage.getItem(key) ?? '{}') as { tapes?: RunTape[] };
    const tape = shelf.tapes?.[0];
    if (!tape) throw new Error('Recorded browser tape missing.');
    for (const entry of tape.inputLog.entries) {
      entry.a = entry.a.filter((action) => !('type' in action) || action.type !== 'pick_upgrade');
      if (entry.t >= firstDraftTick) entry.t += draftTicks;
    }
    const pickTick = secondDraftTick + draftTicks + pickSettleTicks;
    tape.inputLog.entries.push({
      t: pickTick,
      mx: 0,
      my: 0,
      a: [{ kind: 'agent_orders' as const, orders: orders as StandingOrder[] }],
    });
    tape.inputLog.entries.sort((left, right) => left.t - right.t);
    tape.inputLog.durationTicks = Math.max(tape.inputLog.durationTicks + draftTicks, pickTick + 2);
    tape.eventLogHash = eventLogHash;
    localStorage.setItem(key, JSON.stringify(shelf));
    return tape;
  }, {
    key: RUN_TAPES_KEY,
    orders,
    firstDraftTick,
    secondDraftTick,
    draftTicks: DRAFT_TICKS,
    pickSettleTicks: PICK_SETTLE_TICKS,
    eventLogHash,
  });
}

async function advanceToDraft(page: Page): Promise<number> {
  return page.evaluate(() => {
    for (let tick = 0; tick < 3_600; tick += 1) {
      window.__GR_TEST__!.advanceSim(1 / 30);
      if (window.__THREE_GAME_DIAGNOSTICS__?.runState === 'levelup') {
        return window.__GR_TEST__!.playbook.status().recording!.ticks;
      }
      if (window.__THREE_GAME_DIAGNOSTICS__?.runState === 'dead') throw new Error('Hero fell before the next draft.');
    }
    throw new Error('No upgrade draft opened within 120 sim seconds.');
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
      tracks: { territory: 0, science: 0, hero: 0, agent: 2 },
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
