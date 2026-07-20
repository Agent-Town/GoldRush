import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { profileDataKey } from '../src/game/ProfileStorage';
import { researchStateKey } from '../src/meta/ResearchTree';

const E1 = '/?debug&contract=e1-dry-gulch&nolevel&nopause&nosteal&nowreck&nokill';
const E6 = '/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nolevel&nopause&nosteal&nowreck&nokill';
const E6_COMBAT = '/?debug&epoch=epoch-6-atomic&contract=e6-glow-mesa&nolevel&nopause&nosteal&nowreck';
const ROSTER = ['feral_toaster', 'lawn_shepherd', 'glowjack'];
const contracts = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-6-atomic/contracts.json', import.meta.url), 'utf8')) as {
  contracts: Array<{ id: string; twist: { enemyRoster?: Array<{ id: string }> } }>;
};

type Errors = { console: string[]; page: string[] };

async function open(page: Page, url: string, seed: string): Promise<Errors> {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => message.type() === 'error' && errors.console.push(message.text()));
  page.on('pageerror', (error) => errors.page.push(error.message));
  await page.addInitScript((key) => localStorage.setItem(key, JSON.stringify({
    version: 1,
    steps: 3,
    taken: ['sunline_beam', 'half_life_caltrops', 'sunline_mount'],
    proposalSalt: 0,
    pinnedTarget: null,
  })), profileDataKey('robin', researchStateKey('epoch-6-atomic')));
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

test('E6 wave tables field the Atomic roster while E1 stays on untagged outlaws', async ({ page }) => {
  expect(Object.fromEntries(contracts.contracts.map((contract) => [
    contract.id,
    contract.twist.enemyRoster?.map((entry) => entry.id),
  ]))).toMatchObject({
    'e6-glow-mesa': ROSTER,
    'e6-showroom': ['feral_toaster', 'lawn_shepherd'],
    'e6-half-life-hollow': ['feral_toaster', 'glowjack', 'lawn_shepherd'],
    'e6-picnic': ['feral_toaster', 'lawn_shepherd'],
  });
  const e1Errors = await open(page, E1, 'e6-roster-e1-gate');
  const e1 = await spawnWaveFour(page);
  expect(e1.length).toBeGreaterThan(0);
  expect(e1.every((enemy) => enemy.variantId === undefined)).toBe(true);
  expect(e1Errors).toEqual({ console: [], page: [] });

  const e6Errors = await open(page, E6, 'e6-roster-wave');
  const e6 = await spawnWaveFour(page);
  expect([...new Set(e6.map((enemy) => enemy.variantId))]).toEqual(expect.arrayContaining(ROSTER));
  expect(e6.some((enemy) => enemy.variantId === undefined)).toBe(false);
  expect(e6.find((enemy) => enemy.variantId === 'glowjack')?.thief).toBe(true);
  const contract = await page.evaluate(() => window.__GR_TEST__!.activeContract());
  expect(contract.twist.enemyRoster?.map((entry) => entry.id)).toEqual(ROSTER);
  expect(contract.twist.baron).toMatchObject({ variantId: 'homemaker_9000', components: [{ id: 'vac' }, { id: 'rack' }] });
  expect(e6Errors).toEqual({ console: [], page: [] });
});

test('Lawn-Shepherd herd drive produces one same-seed toaster path', async ({ browser }) => {
  const first = await herdPath(browser, 'e6-herd-drive');
  const second = await herdPath(browser, 'e6-herd-drive');
  expect(second.hash).toBe(first.hash);
  expect(first.path.at(-1)?.toasterX).toBeGreaterThan(0.05);
  expect(first.errors).toEqual({ console: [], page: [] });
  expect(second.errors).toEqual({ console: [], page: [] });
});

test('Cure-Arms leave appliances wranglable, free Glowjack home, and resolve named sprite fallbacks', async ({ page }) => {
  const errors = await open(page, `${E6_COMBAT}&nowaves`, 'e6-roster-outcomes');
  const result = await page.evaluate(async (roster) => {
    const harness = window.__GR_TEST__!;
    harness.setBalance('e6Arsenal.sunlineBeam.damage', 200);
    harness.spawnPack(1, 4, { variantId: 'glowjack', variantLabel: 'Glowjack', hpScale: 0.2, speedScale: 0.01 });
    harness.advanceSim(0.35);
    harness.advanceSim(0.8);
    harness.spawnPack(1, 4, { variantId: 'feral_toaster', variantLabel: 'Feral Toaster', hpScale: 0.2, speedScale: 0.01 });
    harness.advanceSim(0.35);
    const powered = harness.enemyPositions()[0]!;
    harness.teleport(powered.x, powered.z);
    const captured = harness.wrangle.capture();
    const modulePath = '/src/entities/pools.ts';
    const { e6EnemySpriteBinding } = (await import(/* @vite-ignore */ modulePath)) as typeof import('../src/entities/pools');
    return {
      powered,
      captured,
      pen: harness.wrangle.diagnostics().pen,
      outcomes: harness.e6Arsenal.diagnostics().outcomes,
      freed: window.__THREE_GAME_DIAGNOSTICS__!.freedWalkers,
      bindings: roster.map((id) => e6EnemySpriteBinding(id)),
    };
  }, ROSTER);

  expect(result.powered).toMatchObject({ variantId: 'feral_toaster', wrangleState: 'exhausted', hp: 1 });
  expect(result.captured).toBe(true);
  expect(result.pen.roster).toContainEqual({ variantId: 'feral_toaster', count: 1 });
  expect(result.outcomes).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'fevered_machine_powered_down', variantId: 'feral_toaster', lethal: false }),
    expect.objectContaining({ type: 'freed_turned_back', variantId: 'glowjack', lethal: false }),
  ]));
  expect(result.freed?.entities.some((entry) => entry.readState === 'freed' && entry.behavior === 'run')).toBe(true);
  expect(result.bindings).toEqual([
    expect.objectContaining({ sheet: 'char-e6-feral_toaster-sheet-walk8.png', placeholder: expect.any(Boolean) }),
    expect.objectContaining({ sheet: 'char-e6-lawn_shepherd-sheet-walk8.png', placeholder: expect.any(Boolean) }),
    expect.objectContaining({ sheet: 'char-e6-glowjack-sheet-walk8.png', placeholder: expect.any(Boolean) }),
  ]);
  expect(errors).toEqual({ console: [], page: [] });
});

async function herdPath(browser: Browser, seed: string) {
  const page = await browser.newPage();
  try {
    const errors = await open(page, `${E6}&nowaves`, seed);
    const path = await page.evaluate(() => {
      const harness = window.__GR_TEST__!;
      harness.setBalance('sparkRig.damage', 0);
      harness.teleport(0, 0);
      harness.spawnPack(1, 0.5, { variantId: 'feral_toaster', hpScale: 100, speedScale: 1 });
      harness.teleport(4, 0);
      harness.spawnPack(1, 0.5, { variantId: 'lawn_shepherd', hpScale: 100, speedScale: 1 });
      harness.teleport(0, 20);
      const samples: Array<{ toasterX: number; toasterZ: number; shepherdX: number; shepherdZ: number }> = [];
      for (let step = 0; step < 8; step += 1) {
        harness.advanceSim(0.25);
        const enemies = harness.enemyPositions();
        const toaster = enemies.find((enemy) => enemy.variantId === 'feral_toaster')!;
        const shepherd = enemies.find((enemy) => enemy.variantId === 'lawn_shepherd')!;
        samples.push({
          toasterX: Number(toaster.x.toFixed(4)),
          toasterZ: Number(toaster.z.toFixed(4)),
          shepherdX: Number(shepherd.x.toFixed(4)),
          shepherdZ: Number(shepherd.z.toFixed(4)),
        });
      }
      return samples;
    });
    return { path, hash: createHash('sha256').update(JSON.stringify(path)).digest('hex'), errors };
  } finally {
    await page.close();
  }
}
