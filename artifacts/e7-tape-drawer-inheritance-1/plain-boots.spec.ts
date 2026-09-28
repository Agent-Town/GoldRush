import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('new E6 profile has no drawer; Signal profile inherits it on plain E1 and E6 maps', async ({ page }, info) => {
  test.setTimeout(90_000);
  const errors = { consoleErrors: [] as string[], pageErrors: [] as string[] };
  const boots: unknown[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.consoleErrors.push(message.text()); });
  page.on('pageerror', error => errors.pageErrors.push(error.message));
  // Same E6 access/launch prerequisites as e6-showroom-capture-quota.spec.ts.
  await page.addInitScript(() => {
    if (sessionStorage.getItem('drawer-proof-seeded')) return;
    localStorage.setItem('gr.activeEpoch.v1', 'epoch-6-atomic');
    sessionStorage.setItem('gr.contract.launch.v1', 'e6-showroom');
    sessionStorage.setItem('drawer-proof-seeded', '1');
  });
  try {
    for (const [contract, epoch, inherited] of [
      ['e6-showroom', 'epoch-6-atomic', false],
      ['the-claim', 'epoch-1-frontier', true],
      ['e6-showroom', 'epoch-6-atomic', true],
    ] as const) {
      if (inherited) await page.evaluate(contract => {
        localStorage.setItem('gr.activeEpoch.v1', 'epoch-7-signal');
        sessionStorage.setItem('gr.contract.launch.v1', contract);
      }, contract);
      await page.goto(`/?contract=${contract}&nowaves&nolevel&nopause`);
      await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0)).toBeGreaterThan(10);
      const state = await page.evaluate(() => ({
        contract: window.__THREE_GAME_DIAGNOSTICS__!.contract.activeId,
        epoch: window.__THREE_GAME_DIAGNOSTICS__!.contract.epochId,
        campaign: localStorage.getItem('gr.activeEpoch.v1'),
        debug: window.__GR_TEST__ !== undefined,
        toggleCount: document.querySelectorAll('[data-testid="playbook-toggle"]').length,
      }));
      boots.push(state);
      expect(state).toMatchObject({ contract, epoch, campaign: inherited ? 'epoch-7-signal' : 'epoch-6-atomic', debug: false, toggleCount: inherited ? 1 : 0 });
      if (inherited) await expect(page.getByTestId('playbook-toggle')).toBeVisible();
    }
    expect(errors).toEqual({ consoleErrors: [], pageErrors: [] });
  } finally {
    await writeFile(`artifacts/e7-tape-drawer-inheritance-1/plain-boots-${info.project.name}.json`, JSON.stringify({ boots, errors }, null, 2) + '\n');
  }
});
