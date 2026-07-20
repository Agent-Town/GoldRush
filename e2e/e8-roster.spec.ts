import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { Balance } from '../src/game/Balance';
import { profileDataKey } from '../src/game/ProfileStorage';
import { ACTIVE_EPOCH_KEY } from '../src/meta/ContractFamilies';
import { researchStateKey } from '../src/meta/ResearchTree';

const E1 = '/?debug&contract=e1-dry-gulch&nolevel&nopause&nosteal&nowreck&nokill';
const E8 = '/?debug&epoch=epoch-8-orbital&contract=e8-mare-claim&nowaves&nolevel&nopause';
const ROSTER = ['scrap_corsair', 'sun_glare_shambler'];
const SHOT_DIR = path.resolve('artifacts/lane-roster-wiring-e8-01');
const poolsSource = readFileSync(new URL('../src/entities/pools.ts', import.meta.url), 'utf8');
const contracts = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-8-orbital/contracts.json', import.meta.url), 'utf8')) as {
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

test('E8 contract rows are era-gated while E1 keeps its untagged outlaws', async ({ page }) => {
  expect(Object.fromEntries(contracts.contracts.map((contract) => [
    contract.id,
    contract.twist.enemyRoster?.map((entry) => entry.id),
  ]))).toMatchObject({
    'e8-mare-claim': ROSTER,
    'e8-far-side': ['sun_glare_shambler'],
    'e8-low-orbit': ['scrap_corsair'],
    'e8-eclipse': ['sun_glare_shambler', 'scrap_corsair'],
  });

  const errors = await open(page, E1, 'e8-roster-e1-gate');
  const e1 = await spawnWaveFour(page);
  expect(e1.length).toBeGreaterThan(0);
  expect(e1.every((enemy) => enemy.variantId === undefined)).toBe(true);

  const e8Wave = await page.evaluate(async () => {
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
    const contract = window.__GR_CONTRACT_REGISTRY__!.loadContract('e8-mare-claim', 'epoch-8-orbital');
    const harness = window.__GR_TEST__!;
    harness.setBalance('waves.waveInterval', 0.35);
    harness.setBalance('waves.pulseBase', 2);
    harness.setBalance('waves.pulsePerWave', 0);
    harness.setBalance('waves.pulsesPerWave', 1);
    harness.setBalance('waves.edgesPerPulse', 1);
    const waves = new WaveSystem(
      enemies as never,
      { x: 0, y: 0, z: 0 } as never,
      createRng('e8-direct-wave'),
      () => {},
      () => true,
      () => false,
      () => contract as never,
    );
    waves.setWaveForTest(3);
    waves.update(0.6);
    return spawned;
  });
  expect(e8Wave).toEqual(expect.arrayContaining([
    expect.objectContaining({ variantId: 'scrap_corsair', visualScale: 1.1, thief: false, tint: '#7fa0a8' }),
    expect.objectContaining({ variantId: 'sun_glare_shambler', visualScale: 0.8, thief: false, tint: '#caa25a' }),
  ]));
  expect(poolsSource).toContain('createEnemySpritePresentation(variantId, binding.slot, e8EnemySpriteBinding(variantId)?.placeholder === true)');
  expect(poolsSource.match(/renderOrder: RenderLayers\.gameplay(?:Fade)?, lazy: true/g)).toHaveLength(2);
  expect(poolsSource).toContain('if (!animation.active && !presentation.sprites.isLoaded) continue;');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.renderer.calls)).toBeLessThanOrEqual(200);
  expect(errors).toEqual({ console: [], page: [] });
});

test('E8 placeholders preserve roster stats and cure-arms exits', async ({ page }, testInfo) => {
  await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({
    version: 1,
    steps: 5,
    taken: ['vacuum_lenses', 'lens_turret', 'breach_seals', 'magnet_grapple'],
    proposalSalt: 0,
    pinnedTarget: null,
  })), { key: profileDataKey('robin', researchStateKey('epoch-8-orbital')) });
  const errors = await open(page, E8, 'e8-roster-outcomes');
  const result = await page.evaluate(async ({ roster, variants }) => {
    const harness = window.__GR_TEST__!;
    harness.teleport(-5, 0);
    harness.spawnPack(1, 0.1, { ...variants.scrap_corsair, variantId: 'scrap_corsair', variantLabel: 'Scrap Corsair', hpScale: 100, speedScale: 0 });
    harness.teleport(5, 0);
    harness.spawnPack(1, 0.1, { ...variants.sun_glare_shambler, variantId: 'sun_glare_shambler', variantLabel: 'Sun-Glare Shambler', hpScale: 100, speedScale: 0 });
    harness.teleport(0, 3);
    harness.advanceSim(0.1);
    const spawned = harness.enemyPositions();
    const modulePath = '/src/entities/pools.ts';
    const { e8EnemySpriteBinding } = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/entities/pools');
    return {
      spawned,
      bindings: roster.map((id) => e8EnemySpriteBinding(id)),
    };
  }, { roster: ROSTER, variants: Balance.e8Roster.variants });

  expect(result.spawned.find((enemy) => enemy.variantId === 'scrap_corsair')).toMatchObject({ scale: 1.1, thief: false });
  expect(result.spawned.find((enemy) => enemy.variantId === 'sun_glare_shambler')).toMatchObject({ scale: 0.8, thief: false });
  expect(result.bindings).toEqual([
    expect.objectContaining({ sheet: 'char-e8-scrap_corsair-sheet-walk8.png', placeholder: false }),
    expect.objectContaining({ sheet: 'char-e8-sun_glare_shambler-sheet-walk8.png', placeholder: false }),
  ]);

  mkdirSync(SHOT_DIR, { recursive: true });
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOT_DIR, `${testInfo.project.name}-placeholders.png`) });
  const before = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers?.spawned ?? 0);
  await page.evaluate(({ variants }) => {
    const harness = window.__GR_TEST__!;
    harness.clearEnemies();
    harness.spawnPack(1, 4, { ...variants.scrap_corsair, variantId: 'scrap_corsair', variantLabel: 'Scrap Corsair', hpScale: 0.05, speedScale: 0 });
    harness.spawnPack(1, 5, { ...variants.sun_glare_shambler, variantId: 'sun_glare_shambler', variantLabel: 'Sun-Glare Shambler', hpScale: 0.05, speedScale: 0 });
  }, { variants: Balance.e8Roster.variants });
  await expect.poll(() => page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(0.2);
    return window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers?.spawned ?? 0;
  })).toBeGreaterThanOrEqual(before + 2);
  const fires = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal.fires);
  expect(fires.sunlineBeam).toBeGreaterThan(0);
  expect(fires.kineticLobber).toBeGreaterThan(0);
  expect(errors).toEqual({ console: [], page: [] });
});

test('plain Orbital-era boot stays error-free without the debug harness', async ({ page }) => {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  page.on('pageerror', (error) => errors.page.push(error.message));
  await page.addInitScript(
    ({ key }) => localStorage.setItem(key, 'epoch-8-orbital'),
    { key: profileDataKey('robin', ACTIVE_EPOCH_KEY) },
  );
  await page.goto('/?contract=e8-mare-claim&nowaves&nolevel&nopause&seed=e8-roster-plain');
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Arsenal.available)).toBe(true);
  expect(errors).toEqual({ console: [], page: [] });
});
