import { expect, test, type Page } from '@playwright/test';
import { META_PROGRESS_KEY } from '../src/game/MetaProgress';
import {
  standingOrderIdentity,
  validateStandingOrders,
  type StandingOrder,
} from '../src/agent/StandingOrders';

type Receipt = { outcome: { ok: boolean; message?: string } };
type OrdersSurface = {
  tools: {
    submit_orders: (orders: unknown) => Receipt;
    view: () => { outcome: { result: { orders: Array<{ status: string }> } } };
  };
};

const baseBuild = {
  verb: 'BUILD' as const,
  what: 'palisade' as const,
  where: { x: 0, z: 10 },
  when: { goldGte: 0 },
};

test('BUILD rejects malformed rotation and preserves the legacy identity at facing zero', () => {
  for (const rotationSteps of [0, 1, 2, 3] as const) {
    expect(validateStandingOrders([{ ...baseBuild, rotationSteps }]).ok).toBe(true);
  }
  for (const rotationSteps of [7, 'north']) {
    const result = validateStandingOrders([{ ...baseBuild, rotationSteps }]);
    expect(result).toEqual({ ok: false, message: 'orders[0] does not match the BUILD schema.' });
  }

  const legacy = '["BUILD","palisade",0,10,"goldGte",0]';
  expect(standingOrderIdentity(baseBuild)).toBe(legacy);
  expect(standingOrderIdentity({ ...baseBuild, rotationSteps: 0 })).toBe(legacy);
  expect(new Set([1, 2, 3].map((rotationSteps) => standingOrderIdentity({
    ...baseBuild,
    rotationSteps: rotationSteps as 1 | 2 | 3,
  } as StandingOrder))).size).toBe(3);
});

async function openOrders(page: Page): Promise<void> {
  await page.addInitScript(({ key }) => {
    localStorage.setItem(key, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 3 } }));
  }, { key: META_PROGRESS_KEY });
  await page.goto('/?debug&nowaves&nolevel&nopause&seed=ap16-5-rotation-parity');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.addScriptTag({
    type: 'module',
    content: `
      const adapter = {
        diagnostics: () => window.__THREE_GAME_DIAGNOSTICS__,
        economyLog: () => window.__GR_TEST__?.economyLog() ?? [],
        placeBuilding: (def, pos, rotationSteps = 0) => {
          window.__GR_TEST__?.teleport(pos.x, pos.z + 2);
          if (!window.__GR_TEST__?.selectBuildable(def)) return false;
          const current = window.__THREE_GAME_DIAGNOSTICS__?.build.ghostRotationSteps ?? 0;
          const turns = (rotationSteps - current + 4) % 4;
          for (let index = 0; index < turns; index += 1) window.__GR_TEST__?.rotateBuildGhost();
          return window.__GR_TEST__?.confirmBuild() === true;
        },
      };
      import('/src/agent/ToolSurface.ts').then(({ install }) => {
        window.__AP16_5_ORDERS__ = install(adapter, { permissionLevel: 3 });
      });
    `,
  });
  await page.waitForFunction(() => Boolean(
    (window as unknown as { __AP16_5_ORDERS__?: OrdersSurface }).__AP16_5_ORDERS__
  ));
}

test('rider BUILD places every facing and omission behaves as facing zero', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await openOrders(page);
  await page.evaluate(() => window.__GR_TEST__!.grantGold(500));

  const facings: Array<0 | 1 | 2 | 3 | undefined> = [0, 1, 2, 3, undefined];
  for (let index = 0; index < facings.length; index += 1) {
    const facing = facings[index];
    const result = await page.evaluate(({ order, rotationSteps }) => {
      const surface = (window as unknown as { __AP16_5_ORDERS__: OrdersSurface }).__AP16_5_ORDERS__;
      return surface.tools.submit_orders([rotationSteps === undefined ? order : { ...order, rotationSteps }]);
    }, {
      order: { ...baseBuild, where: { x: index * 4, z: 10 } },
      rotationSteps: facing,
    });
    expect(result.outcome.ok).toBe(true);
    await expect.poll(() => page.evaluate(() => {
      const surface = (window as unknown as { __AP16_5_ORDERS__: OrdersSurface }).__AP16_5_ORDERS__;
      return surface.tools.view().outcome.result.orders[0]?.status;
    })).toBe('done');
    expect(await page.evaluate(() => ({
      count: window.__THREE_GAME_DIAGNOSTICS__?.build.palisades,
      facing: window.__THREE_GAME_DIAGNOSTICS__?.build.ghostRotationSteps,
    }))).toEqual({ count: index + 1, facing: facing ?? 0 });
  }

  expect(errors).toEqual([]);
});
