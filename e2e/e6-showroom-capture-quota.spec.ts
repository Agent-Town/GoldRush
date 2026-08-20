import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import { contractNumberRange } from '../src/meta/ContractFamilies';

test('Showroom capture quota is an integer editor field', () => {
  expect(contractNumberRange('twist.showroom.captureQuota', 6)).toEqual({ min: 0, max: 20, step: 1 });
});

test('Showroom plain browser boot resolves the staged contract and exposes the quota', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && consoleErrors.push(message.text()));
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-6-atomic');
    sessionStorage.setItem('gr.contract.launch.v1', 'e6-showroom');
  });
  await page.goto('/?contract=e6-showroom&nowaves&nolevel&nopause');
  await page.waitForFunction(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId === 'e6-showroom');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.showroomCaptureObjective)).toEqual({
    declared: true,
    captures: 0,
    quota: 6,
    complete: false,
    objectiveAllowsSecure: false,
  });
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('Showroom secure stays latched until six real CAPTURE events', async () => {
  test.setTimeout(60_000);
  const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
  const previousLocation = host.location;
  const previousWindow = host.window;
  host.location = new URL('http://gr-sim.local/?debug&contract=e6-showroom');
  host.window = { location: host.location };
  let vite: ViteDevServer | undefined;

  try {
    vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const sim = new HeadlessContractSim({ contractId: 'e6-showroom', seed: 'e6-showroom-quota-test', admissionProbe: true });
    const internals = sim as unknown as {
      atomic: {
        diagnostics: { showroomObjective: { captures: number; quota: number; complete: boolean; objectiveAllowsSecure: boolean } };
        tickDecay(): void;
        updateWrangle(delta: number, at: number): void;
      };
      enemies: { spawn(position: unknown, params: { variantId: string }): unknown };
      prospector: { position: { clone(): unknown } };
      runManager: { host: { secureWave(): number } };
    };
    const objective = () => internals.atomic.diagnostics.showroomObjective;
    const secureWave = sim.manifest.twist.secureWave ?? Balance.run.secureWave;

    expect(objective()).toEqual({ declared: true, captures: 0, quota: 6, complete: false, objectiveAllowsSecure: false });
    expect(internals.runManager.host.secureWave()).toBe(Number.MAX_SAFE_INTEGER);

    for (let index = 0; index < 6; index += 1) {
      expect(internals.enemies.spawn(internals.prospector.position.clone(), { variantId: 'feral_toaster' })).toBeTruthy();
    }
    const windDownFrames = Math.round(Balance.wrangle.windDownSeconds / (1 / 30)) + 2;
    for (let frame = 0; frame < windDownFrames; frame += 1) {
      internals.atomic.tickDecay();
      internals.atomic.updateWrangle(1 / 30, frame / 30);
    }

    for (let captures = 1; captures <= 6; captures += 1) {
      expect(sim.submitOrders([{ verb: 'CAPTURE' }]).outcome.ok).toBe(true);
      sim.advanceOneTick();
      expect(objective().captures).toBe(captures);
      expect(internals.runManager.host.secureWave()).toBe(captures < 6 ? Number.MAX_SAFE_INTEGER : secureWave);
    }
    expect(objective()).toMatchObject({ complete: true, objectiveAllowsSecure: true });
  } finally {
    await vite?.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});
