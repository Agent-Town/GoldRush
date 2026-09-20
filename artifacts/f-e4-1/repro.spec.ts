import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';

type Errors = { console: string[]; page: string[] };
const output = (project: string, arm: string) => path.resolve(`artifacts/f-e4-1/${project}-${arm}.json`);

function collectErrors(page: Page): Errors {
  const errors: Errors = { console: [], page: [] };
  page.on('console', (message) => { if (message.type() === 'error') errors.console.push(message.text()); });
  page.on('pageerror', (error) => errors.page.push(error.stack ?? error.message));
  return errors;
}

test('plain boot crosses the first completed-wave boundary cleanly', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto('/?contract=the-claim&seed=f-e4-1-plain');
  await page.getByTestId('contract-briefing-dismiss').click();

  const chooseUpgrade = async () => {
    const card = page.getByTestId('upgrade-card-0');
    if (await card.isVisible().catch(() => false)) await card.click();
  };
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    await chooseUpgrade();
    const state = await page.evaluate(() => ({
      wave: window.__THREE_GAME_DIAGNOSTICS__?.wave ?? 0,
      runState: window.__THREE_GAME_DIAGNOSTICS__?.state ?? 'missing',
      timeAlive: window.__THREE_GAME_DIAGNOSTICS__?.timeAlive ?? 0,
      suspend: localStorage.getItem('gr.run.v1'),
    }));
    if (state.wave >= 2 || state.runState === 'dead') {
      await page.waitForTimeout(500);
      const result = { arm: 'plain-boot', query: 'contract=the-claim&seed=f-e4-1-plain', manualSim: false, debug: false, ...state, errors };
      await mkdir(path.dirname(output(testInfo.project.name, 'plain')), { recursive: true });
      await writeFile(output(testInfo.project.name, 'plain'), `${JSON.stringify(result, null, 2)}\n`);
      console.log('F_E4_1_PLAIN', JSON.stringify(result));
      expect(state.runState).not.toBe('dead');
      expect(state.wave).toBeGreaterThanOrEqual(2);
      expect(state.suspend).not.toBeNull();
      expect(errors).toEqual({ console: [], page: [] });
      return;
    }
    await page.waitForTimeout(200);
  }
  throw new Error('plain boot did not reach wave 2 within 90 seconds');
});

test('implementer harness reproduces only on its incomplete RunManager host', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await page.goto('/src/replay/harness.html?debug&contract=the-claim&seed=f-e4-1-harness');
  await page.waitForFunction(() => Boolean(window.__GR_AGENT_TAPE_REPLAY__));
  const result = await page.evaluate(async () => {
    const { HeadlessContractSim } = await import('/src/sim/HeadlessContractSim.ts');
    const ride = (supplyResearch: boolean) => {
      const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'f-e4-1-harness' });
      const manager = (sim as any).runManager;
      const host = manager.game as Record<string, unknown>;
      const before = { document: typeof document, hasResearchState: 'researchState' in host, researchState: host.researchState ?? null };
      if (supplyResearch) host.researchState = structuredClone(sim.runStart.research);
      try {
        for (let tick = 0; tick < 1_850; tick += 1) sim.advanceOneTick();
        return { before, suppliedResearch: supplyResearch, threw: false, wave: sim.currentTurn().view.now.wave };
      } catch (error) {
        return { before, suppliedResearch: supplyResearch, threw: true, error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error) };
      }
    };
    return { raw: ride(false), completedHost: ride(true) };
  });
  const record = { arm: 'implementer-harness', query: 'debug&contract=the-claim&seed=f-e4-1-harness', manualTickLoop: true, ...result, errors };
  await mkdir(path.dirname(output(testInfo.project.name, 'harness')), { recursive: true });
  await writeFile(output(testInfo.project.name, 'harness'), `${JSON.stringify(record, null, 2)}\n`);
  console.log('F_E4_1_HARNESS', JSON.stringify(record));
  expect(result.raw).toMatchObject({ threw: true, before: { document: 'object', hasResearchState: false } });
  expect(result.raw.error?.message).toMatch(/undefined.*valid JSON|Unexpected token.*undefined/i);
  expect(result.completedHost).toMatchObject({ threw: false, suppliedResearch: true });
  expect(errors).toEqual({ console: [], page: [] });
});
