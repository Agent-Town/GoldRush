import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';

type ErrorBucket = { consoleErrors: string[]; pageErrors: string[] };
type Receipt = {
  outcome: { ok: boolean; reason?: string; message?: string; requiredLevel?: number; result?: unknown };
};
type OrderView = {
  needsRider: boolean;
  orders: Array<{ id: string; status: string; reason?: string; order: { verb: string } }>;
  log: Array<{ seq: number; type: string; orderId?: string; status?: string; surprise?: string; reason?: string }>;
};

test.setTimeout(45_000);

function collectErrors(page: Page): ErrorBucket {
  const errors: ErrorBucket = { consoleErrors: [], pageErrors: [] };
  page.on('console', (message) => {
    if (message.type() === 'error') errors.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => errors.pageErrors.push(error.message));
  return errors;
}

async function installOrdersSurface(page: Page): Promise<void> {
  await page.addScriptTag({
    type: 'module',
    content: `
      window.__AP_LEVEL__ = 2;
      const rotationSteps = (rot) => {
        const raw = Number.isInteger(rot) ? rot : Math.round(rot / (Math.PI / 2));
        return ((raw % 4) + 4) % 4;
      };
      const adapter = {
        metaProgress: {
          get agentAutonomyLevel() { return window.__AP_LEVEL__; },
        },
        diagnostics: () => window.__THREE_GAME_DIAGNOSTICS__,
        economyLog: () => window.__GR_TEST__?.economyLog() ?? [],
        placeBuilding: (def, pos, rot = 0) => {
          window.__GR_TEST__?.teleport(pos.x, pos.z + 2);
          if (!window.__GR_TEST__?.selectBuildable(def)) return false;
          const current = window.__THREE_GAME_DIAGNOSTICS__?.build.ghostRotationSteps ?? 0;
          const turns = (rotationSteps(rot) - current + 4) % 4;
          for (let i = 0; i < turns; i += 1) window.__GR_TEST__?.rotateBuildGhost();
          return window.__GR_TEST__?.confirmBuild() === true;
        },
      };
      import('/src/agent/ToolSurface.ts').then(({ createToolSurface, install }) => {
        window.__AP_ORDERS__ = install(adapter);
        window.__AP_OTHER_ORDERS__ = createToolSurface(adapter);
      });
    `,
  });
  await page.waitForFunction(() => Boolean((window as unknown as { __AP_ORDERS__?: unknown }).__AP_ORDERS__));
}

async function submit(page: Page, orders: unknown): Promise<Receipt> {
  return page.evaluate((value) => {
    const surface = (window as unknown as {
      __AP_ORDERS__: { tools: { submit_orders: (input: unknown) => Receipt } };
    }).__AP_ORDERS__;
    return surface.tools.submit_orders(value);
  }, orders);
}

async function view(page: Page): Promise<OrderView> {
  return page.evaluate(() => {
    const surface = (window as unknown as {
      __AP_ORDERS__: { tools: { view: () => { outcome: { result: OrderView } } } };
    }).__AP_ORDERS__;
    return surface.tools.view().outcome.result;
  });
}

async function grantGold(page: Page, amount: number): Promise<void> {
  await page.evaluate((value) => window.__GR_TEST__?.grantGold(value), amount);
}

test('seeded standing orders obey priority, gates, legal actions, surprises, and the live rung', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(key, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 3 } }));
    },
    { key: META_PROGRESS_KEY },
  );
  await page.goto('/?debug&nowaves&nolevel&timescale=8&seed=ap-standing-orders');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await installOrdersSurface(page);

  const unknown = await submit(page, [{ verb: 'DANCE', pos: { x: 0, z: 10 } }]);
  expect(unknown.outcome).toMatchObject({ ok: false, reason: 'INVALID_ARGS' });
  expect(unknown.outcome.message).toContain('unknown');
  expect((await view(page)).orders).toEqual([]);

  const aboveRung = await submit(page, [
    { verb: 'BUILD', what: 'sentry_beacon', where: { x: 0, z: 10 }, when: { goldGte: 25 } },
  ]);
  expect(aboveRung.outcome).toMatchObject({ ok: false, reason: 'PERMISSION_DENIED', requiredLevel: 3 });
  expect((await view(page)).orders).toEqual([]);

  await page.evaluate(() => {
    (window as unknown as { __AP_LEVEL__: number }).__AP_LEVEL__ = 3;
  });
  const accepted = await submit(page, [
    { verb: 'BUILD', what: 'sentry_beacon', where: { x: 0, z: 10 }, when: { goldGte: 25 } },
    { verb: 'BUILD', what: 'palisade', where: { x: 6, z: 10 }, when: { goldGte: 25 } },
  ]);
  expect(accepted.outcome).toMatchObject({ ok: true, result: { count: 2 } });
  expect(
    await page.evaluate(() => {
      const surface = (window as unknown as {
        __AP_OTHER_ORDERS__: { tools: { view: () => { outcome: { result: OrderView } } } };
      }).__AP_OTHER_ORDERS__;
      return surface.tools.view().outcome.result.orders;
    }),
  ).toEqual([]);
  await expect.poll(() => view(page).then((state) => state.orders[0]?.status)).toBe('pending');
  await page.evaluate(() => window.__GR_TEST__?.startWaveForTest(1));
  await expect.poll(() => view(page).then((state) => state.log.some((event) => event.surprise === 'wave_early'))).toBe(true);

  await grantGold(page, 24);
  await page.waitForTimeout(250);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0)).toBe(0);
  expect((await view(page)).orders[0]?.status).toBe('pending');

  await grantGold(page, 1);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0)).toBe(1);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? -1)).toBe(0);
  expect((await view(page)).orders.slice(0, 2).map((order) => order.status)).toEqual(['done', 'pending']);

  await grantGold(page, 25);
  await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? 0)).toBe(1);
  expect((await view(page)).orders.map((order) => order.status)).toEqual(['done', 'done']);

  const revoked = await submit(page, [
    { verb: 'BUILD', what: 'sentry_beacon', where: { x: 3, z: 10 }, when: { goldGte: 100 } },
  ]);
  expect(revoked.outcome).toMatchObject({ ok: true, result: { count: 1 } });
  await page.getByTestId('hud-agent').click();
  await page.getByTestId('prospector-rung-toggle-3').uncheck();
  await expect(page.getByTestId('prospector-rung-3')).toContainText('Revoked');
  await grantGold(page, 85);
  await expect.poll(() => view(page).then((state) => state.orders[0]?.status)).toBe('failed');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.beacons ?? 0)).toBe(1);
  await page.getByTestId('prospector-rung-toggle-3').check();
  await expect(page.getByTestId('prospector-rung-3')).toContainText('Granted');

  const replacement = await submit(page, [
    { verb: 'BUILD', what: 'sentry_beacon', where: { x: 0, z: 0 }, when: { waveGte: 0 } },
    { verb: 'MOVE_TO', pos: { x: 3, z: 10 } },
  ]);
  expect(replacement.outcome).toMatchObject({ ok: true, result: { count: 2 } });
  await expect.poll(() => view(page).then((state) => state.orders[1]?.status), { timeout: 8_000 }).toBe('done');

  const lifecycle = await view(page);
  expect(lifecycle.orders.map((order) => order.status)).toEqual(['failed', 'done']);
  expect(lifecycle.orders[0]?.reason).toContain('FAILED: BUILD action was rejected');
  expect(lifecycle.needsRider).toBe(true);
  expect(lifecycle.log.some((event) => event.type === 'surprise' && event.surprise === 'order_failure')).toBe(true);

  const done = lifecycle.log.filter((event) => event.type === 'order_status' && event.status === 'done');
  expect(done.map((event) => event.orderId)).toEqual(['orders-1-1', 'orders-1-2', 'orders-3-2']);

  await expect(page.evaluate(() => window.__GR_TEST__?.wreck('palisade', 0))).resolves.toBe(true);
  await expect.poll(() => view(page).then((state) => state.log.some((event) => event.surprise === 'claim_damage'))).toBe(true);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.runState)).toBe('playing');
  await page.evaluate(() => window.__GR_TEST__?.endRunForTest());
  await expect.poll(() => view(page).then((state) => state.log.some((event) => event.surprise === 'hero_down'))).toBe(true);

  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
