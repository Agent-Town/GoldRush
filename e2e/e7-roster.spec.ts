import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { profileDataKey } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';

const E1 = '/?debug&contract=e1-dry-gulch&nolevel&nopause&nosteal&nowreck&nokill';
const E7_EPOCH_FALLBACK = '/?debug&epoch=epoch-7-signal&contract=the-claim&nowaves&nolevel&nopause';
const ROSTER = ['rogue_automaton', 'data_rustler'];
const SHOT_DIR = path.resolve('artifacts/lane-roster-wiring-e7-01');
const poolsSource = readFileSync(new URL('../src/entities/pools.ts', import.meta.url), 'utf8');
const contracts = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-7-signal/contracts.json', import.meta.url), 'utf8')) as {
  contracts: Array<{ id: string; twist: { enemyRoster?: Array<{ id: string }> } }>;
};

type Errors = { console: string[]; page: string[] };

async function open(page: Page, url: string, seed: string): Promise<Errors> {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  page.on('pageerror', (error) => errors.page.push(error.message));
  await page.goto(`${url}&seed=${seed}`);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.evaluate((button: HTMLButtonElement) => button.click());
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

async function spawnWaveFour(page: Page) {
  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setBalance('waves.waveInterval', 0.35);
    harness.setBalance('waves.trickleInterval', 999);
    harness.setBalance('waves.pulseBase', 12);
    harness.setBalance('waves.pulsePerWave', 0);
    harness.setBalance('waves.pulsesPerWave', 1);
    harness.setBalance('waves.edgesPerPulse', 3);
    harness.setBalance('sparkRig.range', 0);
    harness.setWave(3);
    harness.advanceSim(1.2);
  });
  return page.evaluate(() => window.__GR_TEST__!.enemyPositions());
}

test('E7 contract rows are era-gated while E1 keeps its untagged outlaws', async ({ page }) => {
  expect(Object.fromEntries(contracts.contracts.map((contract) => [
    contract.id,
    contract.twist.enemyRoster?.map((entry) => entry.id),
  ]))).toMatchObject({
    'e7-relay-valley': ROSTER,
    'e7-echo-canyon': ROSTER,
    'e7-dead-band': ['data_rustler'],
    'e7-relay-rush': ['data_rustler', 'rogue_automaton'],
  });

  const errors = await open(page, E1, 'e7-roster-e1-gate');
  const e1 = await spawnWaveFour(page);
  expect(e1.length).toBeGreaterThan(0);
  expect(e1.every((enemy) => enemy.variantId === undefined)).toBe(true);

  const e7Wave = await page.evaluate(async () => {
    const waveSystemPath = '/src/systems/WaveSystem.ts';
    const rngPath = '/src/core/Rng.ts';
    const [{ WaveSystem }, { createRng }] = await Promise.all([
      import(/* @vite-ignore */ waveSystemPath) as Promise<typeof import('../src/systems/WaveSystem')>,
      import(/* @vite-ignore */ rngPath) as Promise<typeof import('../src/core/Rng')>,
    ]);
    const spawned: Array<Record<string, unknown>> = [];
    const enemies = {
      activeCount: 0,
      capacity: 20,
      group: { add: () => {} },
      spawn: (_position: unknown, options: Record<string, unknown>) => {
        spawned.push(options);
        enemies.activeCount += 1;
        return {};
      },
    };
    const contract = window.__GR_CONTRACT_REGISTRY__!.loadContract('e7-relay-valley', 'epoch-7-signal');
    const harness = window.__GR_TEST__!;
    harness.setBalance('waves.waveInterval', 0.35);
    harness.setBalance('waves.pulseBase', 2);
    harness.setBalance('waves.pulsePerWave', 0);
    harness.setBalance('waves.pulsesPerWave', 1);
    harness.setBalance('waves.edgesPerPulse', 1);
    const waves = new WaveSystem(
      enemies as never,
      { x: 0, y: 0, z: 0 } as never,
      createRng('e7-direct-wave'),
      () => {},
      () => true,
      () => false,
      () => contract as never,
    );
    waves.setWaveForTest(3);
    waves.update(0.6);
    return spawned;
  });
  expect(e7Wave).toEqual(expect.arrayContaining([
    expect.objectContaining({ variantId: 'rogue_automaton', visualScale: 1, thief: false, tint: '#5b8a8a' }),
    expect.objectContaining({ variantId: 'data_rustler', visualScale: 1, thief: true, tint: '#c4883a' }),
  ]));
  expect(poolsSource).toContain('createEnemySpritePresentation(variantId, binding.slot, e7EnemySpriteBinding(variantId)?.placeholder === true)');
  expect(poolsSource.match(/renderOrder: RenderLayers\.gameplay(?:Fade)?, lazy: true/g)).toHaveLength(2);
  expect(poolsSource).toContain('if (!animation.active && !presentation.sprites.isLoaded) continue;');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer.calls)).toBeLessThanOrEqual(200);
  expect(errors).toEqual({ console: [], page: [] });
});

test('E7 placeholders preserve roster stats, thief state, and cure-only death outcomes', async ({ page }, testInfo) => {
  const errors = await open(page, E7_EPOCH_FALLBACK, 'e7-roster-outcomes');
  const result = await page.evaluate(async ({ roster, variants }) => {
    const harness = window.__GR_TEST__!;
    harness.setBalance('sparkRig.damage', 0);
    harness.setBalance('e7Arsenal.signalJammer.damage', 0);
    harness.setBalance('e7Arsenal.reportRocket.damage', 0);
    const rogue = variants.rogue_automaton;
    const rustler = variants.data_rustler;
    harness.spawnPack(3, 5, { ...rogue, variantId: 'rogue_automaton', variantLabel: 'Rogue Automaton', speedScale: 0 });
    harness.spawnPack(3, 7, { ...rustler, variantId: 'data_rustler', variantLabel: 'Data-Rustler', speedScale: 0 });
    harness.advanceSim(0.1);
    const spawned = harness.enemyPositions();
    const modulePath = '/src/entities/pools.ts';
    const { e7EnemySpriteBinding } = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/entities/pools');
    return {
      spawned,
      bindings: roster.map((id) => e7EnemySpriteBinding(id)),
    };
  }, { roster: ROSTER, variants: Balance.e7Roster.variants });

  expect(result.spawned.find((enemy) => enemy.variantId === 'rogue_automaton')).toMatchObject({ scale: 1, thief: false });
  expect(result.spawned.find((enemy) => enemy.variantId === 'data_rustler')).toMatchObject({ scale: 1, thief: true, state: 'seekHolding' });
  expect(result.bindings).toEqual([
    expect.objectContaining({ sheet: 'char-e7-rogue_automaton-sheet-walk8.png', placeholder: false }),
    expect.objectContaining({ sheet: 'char-e7-data_rustler-sheet-walk8.png', placeholder: false }),
  ]);

  mkdirSync(SHOT_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-placeholders.png`) });
  await page.evaluate(() => {
    const harness = window.__GR_TEST__!;
    harness.setBalance('e7Arsenal.signalJammer.damage', 1_000);
    harness.setBalance('e7Arsenal.reportRocket.damage', 1_000);
    harness.setBalance('e7Arsenal.reportRocket.cooldown', 0.1);
    harness.advanceSim(5);
  });
  const cure = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal);
  expect(cure.cureEvents).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'powered-down', variantId: 'rogue_automaton' }),
    expect.objectContaining({ type: 'turned-back', variantId: 'data_rustler' }),
  ]));
  expect(cure.deathEvents).toBe(0);
  expect(errors).toEqual({ console: [], page: [] });
});

test('plain Signal-era boot stays error-free without the debug harness', async ({ page }) => {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  page.on('pageerror', (error) => errors.page.push(error.message));
  await page.addInitScript(
    ({ key }) => localStorage.setItem(key, 'epoch-7-signal'),
    { key: profileDataKey('robin', ACTIVE_EPOCH_KEY) },
  );
  await page.goto('/?contract=the-claim&nowaves&nolevel&nopause&seed=e7-roster-plain');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e7Arsenal.enabled)).toBe(true);
  expect(errors).toEqual({ console: [], page: [] });
});
