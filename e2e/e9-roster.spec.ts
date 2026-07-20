import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { profileDataKey } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';

const E1 = '/?debug&contract=e1-dry-gulch&nolevel&nopause&nosteal&nowreck&nokill';
const E9 = '/?debug&epoch=epoch-9-redfields&contract=e9-seed-run&nowaves&nolevel&nopause';
const ROSTER = ['feral_terraformer', 'claim_jump_prospect_drone'];
const SHOT_DIR = path.resolve('artifacts/lane-roster-wiring-e9-01');
const poolsSource = readFileSync(new URL('../src/entities/pools.ts', import.meta.url), 'utf8');
const contracts = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-9-redfields/contracts.json', import.meta.url), 'utf8')) as {
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

test('E9 contract rows are era-gated while E1 keeps its untagged outlaws', async ({ page }) => {
  expect(Object.fromEntries(contracts.contracts.map((contract) => [
    contract.id,
    contract.twist.enemyRoster?.map((entry) => entry.id),
  ]))).toMatchObject({
    'e9-dome-basin': ROSTER,
    'e9-seed-run': ['claim_jump_prospect_drone', 'feral_terraformer'],
    'e9-devils-alley': ['claim_jump_prospect_drone'],
    'e9-old-canal': ROSTER,
  });

  const errors = await open(page, E1, 'e9-roster-e1-gate');
  const e1 = await spawnWaveFour(page);
  expect(e1.length).toBeGreaterThan(0);
  expect(e1.every((enemy) => enemy.variantId === undefined)).toBe(true);

  const e9Wave = await page.evaluate(async () => {
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
    const contract = window.__GR_CONTRACT_REGISTRY__!.loadContract('e9-dome-basin', 'epoch-9-redfields');
    const harness = window.__GR_TEST__!;
    harness.setBalance('waves.waveInterval', 0.35);
    harness.setBalance('waves.pulseBase', 2);
    harness.setBalance('waves.pulsePerWave', 0);
    harness.setBalance('waves.pulsesPerWave', 1);
    harness.setBalance('waves.edgesPerPulse', 1);
    const waves = new WaveSystem(
      enemies as never,
      { x: 0, y: 0, z: 0 } as never,
      createRng('e9-direct-wave'),
      () => {},
      () => true,
      () => false,
      () => contract as never,
    );
    waves.setWaveForTest(3);
    waves.update(0.6);
    return spawned;
  });
  expect(e9Wave).toEqual(expect.arrayContaining([
    expect.objectContaining({ variantId: 'feral_terraformer', visualScale: 1.8, wrecker: true, thief: false, tint: '#b06a3a' }),
    expect.objectContaining({ variantId: 'claim_jump_prospect_drone', visualScale: 0.45, wrecker: false, thief: true, tint: '#9a8b57' }),
  ]));
  expect(poolsSource).toContain('createEnemySpritePresentation(variantId, binding.slot, e9EnemySpriteBinding(variantId)?.placeholder === true)');
  expect(poolsSource.match(/renderOrder: RenderLayers\.gameplay(?:Fade)?, lazy: true/g)).toHaveLength(2);
  expect(poolsSource).toContain('if (!animation.active && !presentation.sprites.isLoaded) continue;');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer.calls)).toBeLessThanOrEqual(200);
  expect(errors).toEqual({ console: [], page: [] });
});

test('E9 placeholders preserve siege/thief flags and cure-arms exits', async ({ page }, testInfo) => {
  await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({
    version: 1,
    steps: 4,
    taken: ['storm_draw', 'storm_lance', 'storm_fence', 'terraform_cannon'],
    proposalSalt: 0,
    pinnedTarget: null,
  })), { key: profileDataKey('robin', researchStateKey('epoch-9-redfields')) });
  const errors = await open(page, E9, 'e9-roster-outcomes');
  const result = await page.evaluate(async ({ roster, variants }) => {
    const harness = window.__GR_TEST__!;
    harness.toggleWeapon();
    harness.setBalance('blast.damage', 0);
    harness.setBalance('e9Arsenal.stormDraw.damage', 0);
    harness.setBalance('e9Arsenal.terraformCannon.damage', 1_000);
    harness.spawnPack(1, 4, { ...variants.feral_terraformer, variantId: 'feral_terraformer', variantLabel: 'Faithful Terraformer', hpScale: 0.05, speedScale: 0.01, wrecker: false });
    harness.advanceSim(1.1);
    const cure = harness.e9Arsenal.diagnostics();
    harness.clearEnemies();
    harness.setBalance('e9Arsenal.terraformCannon.damage', 0);
    harness.teleport(-2, 0);
    harness.spawnPack(1, 0.1, { ...variants.feral_terraformer, variantId: 'feral_terraformer', variantLabel: 'Faithful Terraformer', hpScale: 100, speedScale: 0 });
    harness.teleport(2, 0);
    harness.spawnPack(1, 0.1, { ...variants.claim_jump_prospect_drone, variantId: 'claim_jump_prospect_drone', variantLabel: 'Claim-Jump Prospect Drone', hpScale: 100, speedScale: 0 });
    harness.teleport(0, 3);
    harness.advanceSim(0.1);
    const spawned = harness.enemyPositions();
    const modulePath = '/src/entities/pools.ts';
    const { e9EnemySpriteBinding } = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/entities/pools');
    return {
      spawned,
      bindings: roster.map((id) => e9EnemySpriteBinding(id)),
      cure,
    };
  }, { roster: ROSTER, variants: Balance.e9Roster.variants });

  expect(result.spawned.find((enemy) => enemy.variantId === 'feral_terraformer')).toMatchObject({ scale: 1.8, wrecker: true, wreckState: 'seekBuilding' });
  expect(result.spawned.find((enemy) => enemy.variantId === 'claim_jump_prospect_drone')).toMatchObject({ scale: 0.45, thief: true, state: 'seekHolding' });
  expect(result.bindings).toEqual([
    expect.objectContaining({ sheet: 'char-e9-feral_terraformer-sheet-walk8.png', placeholder: true }),
    expect.objectContaining({ sheet: 'char-e9-claim_jump_prospect_drone-sheet-walk8.png', placeholder: true }),
  ]);

  mkdirSync(SHOT_DIR, { recursive: true });
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-placeholders.png`) });
  expect(result.cure.fires.terraformCannon).toBeGreaterThan(0);
  expect(result.cure.outcomes).toEqual(expect.arrayContaining([
    expect.objectContaining({ variantId: 'feral_terraformer', lethal: false }),
  ]));
  expect(result.cure.outcomes.some((event) => (event.type as string).includes('death'))).toBe(false);
  expect(errors).toEqual({ console: [], page: [] });
});

test('plain Red Fields boot stays error-free without the debug harness', async ({ page }) => {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  page.on('pageerror', (error) => errors.page.push(error.message));
  await page.addInitScript(
    ({ key }) => localStorage.setItem(key, 'epoch-9-redfields'),
    { key: profileDataKey('robin', ACTIVE_EPOCH_KEY) },
  );
  await page.goto('/?contract=e9-seed-run&nowaves&nolevel&nopause&seed=e9-roster-plain');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e9Arsenal.eraActive)).toBe(true);
  expect(errors).toEqual({ console: [], page: [] });
});
