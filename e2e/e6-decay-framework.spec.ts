import { expect, test, type Browser, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import type { DecayEvent } from '../src/systems/DecaySystem';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type DecayRun = {
  expired: Array<{ id: string; tick: number }>;
  auraEvents: Array<{ zone: string; tick: number; auraFactor: number }>;
  pausedRemaining: number | null;
  pausedFraction: number | null;
  resumed: boolean;
  errors: ErrorBucket;
};

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function runDecayProbe(browser: Browser, inactiveDwellMs: number): Promise<DecayRun> {
  const page = await browser.newPage();
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nospawn&nolevel&nopause&seed=mesa-1');
  await page.waitForFunction(() => Boolean(window.__GR_TEST__ && window.__THREE_GAME_DIAGNOSTICS__));

  const paused = await page.evaluate((auraFactor) => {
    const harness = window.__GR_TEST__!;
    harness.setManualSim(true);
    harness.resetRun();
    harness.setManualSim(true);
    const decay = harness.decay;
    decay.register({ id: 'quick', durationTicks: 3 });
    decay.register({ id: 'same-a', durationTicks: 5 });
    decay.register({ id: 'same-b', durationTicks: 5 });
    const pausedHandle = decay.register({ id: 'paused', durationTicks: 4, paused: true });
    decay.setAuraModifier('clock-zone', auraFactor);
    decay.register({ id: 'aura', durationTicks: 8, zone: 'clock-zone' });
    return pausedHandle;
  }, Balance.decay.clockAuraFactor);

  if (inactiveDwellMs > 0) await page.waitForTimeout(inactiveDwellMs);

  const result = await page.evaluate((pausedHandle) => {
    const harness = window.__GR_TEST__!;
    const decay = harness.decay;

    harness.advanceSim(3 / 30);
    const pausedRemaining = decay.remaining(pausedHandle);
    const pausedFraction = decay.fraction(pausedHandle);
    const resumed = decay.setPaused(pausedHandle, false);
    harness.advanceSim(7 / 30);
    const expired = decay.eventLog
      .filter((event): event is Extract<DecayEvent, { type: 'decay_expired' }> => event.type === 'decay_expired' && event.reason === 'expired')
      .map(({ id, tick }) => ({ id, tick }));
    const auraEvents = decay.eventLog
      .filter((event): event is Extract<DecayEvent, { action: 'aura_modified' }> => event.type === 'decay_registered' && event.action === 'aura_modified')
      .map(({ zone, tick, auraFactor }) => ({ zone, tick, auraFactor }));
    return { expired, auraEvents, pausedRemaining, pausedFraction, resumed };
  }, paused);

  await page.close();
  return { ...result, errors };
}

test('same-seed decay registration, pause, and aura ticks are deterministic', async ({ browser }) => {
  const first = await runDecayProbe(browser, 0);
  const second = await runDecayProbe(browser, 150);

  expect(first.expired).toEqual([
    { id: 'quick', tick: 3 },
    { id: 'same-a', tick: 5 },
    { id: 'same-b', tick: 5 },
    { id: 'paused', tick: 7 },
    { id: 'aura', tick: 9 },
  ]);
  expect(second.expired).toEqual(first.expired);
  expect(first.auraEvents).toEqual([{ zone: 'clock-zone', tick: 0, auraFactor: 0.9 }]);
  expect(second.auraEvents).toEqual(first.auraEvents);
  expect(first.pausedRemaining).toBe(4);
  expect(first.pausedFraction).toBe(1);
  expect(first.resumed).toBe(true);
  expect(first.errors).toEqual({ consoleErrors: [], pageErrors: [] });
  expect(second.errors).toEqual({ consoleErrors: [], pageErrors: [] });
});

test('plain boot keeps the decay scheduler inert', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?nowaves&nospawn&nolevel&nopause&seed=e6-inert');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);

  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.decay)).toEqual({ active: 0, events: [] });
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
});
