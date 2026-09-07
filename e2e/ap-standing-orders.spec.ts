import { mkdirSync } from 'node:fs';
import { expect, test, type Page, type TestInfo } from '@playwright/test';
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
type ProductionOrdersSurface = {
  tools: {
    get_state: () => { outcome: { economyLog: Array<{ type?: string; nodeId?: string; sink?: string; amount?: number }> } };
    pan_at: (node: string) => Receipt;
    submit_orders: (input: unknown) => Receipt;
    view: () => { outcome: { result: OrderView } };
  };
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

async function openProductionOrders(page: Page, url: string): Promise<void> {
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(key, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 3 } }));
      const prototype = WeakMap.prototype as unknown as {
        set: (this: WeakMap<object, unknown>, mapKey: object, value: unknown) => WeakMap<object, unknown>;
      };
      const originalSet = prototype.set;
      prototype.set = function (this: WeakMap<object, unknown>, mapKey: object, value: unknown) {
        const surface = mapKey as Partial<ProductionOrdersSurface> & { namespace?: string };
        if (surface.namespace === 'et.goldrush' && surface.tools?.submit_orders) {
          (window as unknown as { __AP_PRODUCTION_ORDERS__?: ProductionOrdersSurface }).__AP_PRODUCTION_ORDERS__ =
            surface as ProductionOrdersSurface;
          prototype.set = originalSet;
        }
        return originalSet.call(this, mapKey, value);
      };
    },
    { key: META_PROGRESS_KEY },
  );
  await page.goto(url);
  await page.waitForFunction(() => (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __AP_PRODUCTION_ORDERS__?: ProductionOrdersSurface }).__AP_PRODUCTION_ORDERS__),
  );
}

async function saveProductionShot(page: Page, testInfo: TestInfo): Promise<void> {
  mkdirSync('reviews/shots-ap-06b-adapter-reland', { recursive: true });
  await page.screenshot({
    path: `reviews/shots-ap-06b-adapter-reland/plain-boot-${testInfo.project.name}.png`,
  });
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
  await armEarlyWave(page);
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
  await page.getByTestId('hud-agent').click();
  await page.getByTestId('prospector-ability-place_building').uncheck();
  // F-RPG-9, CURED HERE with the cure the drain prescribed (`reviews/rider-parity-grammar.md`):
  // the checkbox's click and the CONSENT the door reads are two different clocks, and this line
  // used to submit into the gap — measured 2 of 3 red on desktop-chrome at this gate, and 1 of 3
  // on pre-merge main. Waiting for the checkbox to REPORT itself unchecked closes it: the panel
  // re-renders from the consent state it just wrote, so an unchecked box means the door has the
  // revocation, not merely that the pointer landed.
  await expect(page.getByTestId('prospector-ability-place_building')).not.toBeChecked();
  // ...and one more clock: the checkbox re-renders from the panel's own state, and the CONSENT the
  // door reads is written on the frame after it. Measured: the box-only wait took desktop from 1 of
  // 3 green to 3 of 3 and left mobile racing. Waiting two frames closes the second gap.
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  const revokedAbility = await submit(page, [
    { verb: 'BUILD', what: 'sentry_beacon', where: { x: 0, z: 10 }, when: { goldGte: 25 } },
  ]);
  expect(revokedAbility.outcome).toMatchObject({
    ok: false,
    reason: 'PERMISSION_DENIED',
    requiredLevel: 3,
    message: 'BUILD requires the granted place_building ability.',
  });
  expect((await view(page)).orders).toEqual([]);
  await page.getByTestId('prospector-ability-place_building').check();
  await page.locator('[data-prospector-close]').click();

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
  await triggerEarlyWave(page);
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
    // ADR-005 stage 3: this was MOVE_TO, and its replacement is NOT MOVE_HERO. The subject here is
    // the ORDER LIFECYCLE, not the verb: one order that fails and one that finishes. In a SOLO
    // browser boot a HUMAN pilots the hero, so MOVE_HERO is refused HERO_NOT_YOURS by design
    // (hero-move-verb's own law, owner 2026-09-06), and the solo door binds none of the final-verb
    // handlers, so SET_WEAPON answers 'unavailable' — both read 'failed'. MEASURED, both of them.
    // A second BUILD is what finishes here, on the 85 gold this test just granted.
    { verb: 'BUILD', what: 'palisade', where: { x: -6, z: 10 }, when: { waveGte: 0 } },
  ]);
  expect(replacement.outcome).toMatchObject({ ok: true, result: { count: 2 } });
  await expect.poll(() => view(page).then((state) => state.orders[1]?.status), { timeout: 8_000 }).toBe('done');

  const lifecycle = await view(page);
  expect(lifecycle.orders.map((order) => order.status)).toEqual(['failed', 'done']);
  expect(lifecycle.orders[0]?.reason).toMatch(/^FAILED( \([a-z_]+\))?: BUILD action was rejected/);
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

async function armEarlyWave(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.setWave(0);
  });
}

async function triggerEarlyWave(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(1 / 60);
    window.__GR_TEST__!.startWaveForTest(1);
    window.__GR_TEST__!.advanceSim(1 / 60);
    window.__GR_TEST__!.setManualSim(false);
  });
}

test('manual early-wave seam resets an expired countdown before forcing the transition', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/?debug&nowaves&nolevel&timescale=8&seed=ap-standing-orders-wave-seam');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  await page.evaluate(() => {
    window.__GR_TEST__!.setManualSim(true);
    window.__GR_TEST__!.advanceSim(31);
  });
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.nextWaveInSim)).toBe(0);

  await armEarlyWave(page);
  await installOrdersSurface(page);
  await triggerEarlyWave(page);

  expect((await view(page)).log.some((event) => event.surprise === 'wave_early')).toBe(true);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('consent restores a save from before place-building existed', async ({ page }) => {
  await page.goto('/');
  await page.addScriptTag({
    type: 'module',
    content: `
      import('/src/agent/AgentConsent.ts').then(({ AgentConsentStore }) => {
        const legacy = new AgentConsentStore().captureFutureState();
        delete legacy.abilities.place_building;
        const restored = new AgentConsentStore();
        window.__AP_LEGACY_CONSENT__ = {
          ok: restored.restoreFutureState(legacy),
          placeBuilding: restored.captureFutureState().abilities.place_building,
        };
      });
    `,
  });
  await page.waitForFunction(
    () => (window as unknown as { __AP_LEGACY_CONSENT__?: unknown }).__AP_LEGACY_CONSENT__ !== undefined,
  );
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __AP_LEGACY_CONSENT__: { ok: boolean; placeBuilding: boolean } })
          .__AP_LEGACY_CONSENT__,
    ),
  ).toEqual({ ok: true, placeBuilding: false });
});

test('place-building consent survives a new save round-trip', async ({ page }) => {
  await page.addInitScript(
    ({ key }) => {
      localStorage.setItem(key, JSON.stringify({ version: 1, tracks: { territory: 0, science: 0, hero: 0, agent: 3 } }));
    },
    { key: META_PROGRESS_KEY },
  );
  await page.goto('/?debug&nowaves&nolevel&seed=ap-place-building-round-trip');
  await page.waitForFunction(() => window.__GR_TEST__ !== undefined);
  await page.keyboard.press('KeyG');
  await page.getByTestId('prospector-ability-light_duty').check();

  const result = await page.evaluate(async () => {
    const test = window.__GR_TEST__!;
    const captured = test.captureSuspend();
    const suspend = (await Function('return import("/src/game/RunSuspend.ts")')()) as typeof import('../src/game/RunSuspend');
    const decoded = suspend.normalizeRunSuspendDatum(captured);
    const restored = decoded ? test.restoreSuspend(decoded) : false;
    const after = test.captureSuspend();
    return {
      captured: {
        lightDuty: captured.agent?.consent.abilities.light_duty,
        placeBuilding: captured.agent?.consent.abilities.place_building,
      },
      decoded: {
        lightDuty: decoded?.agent?.consent.abilities.light_duty,
        placeBuilding: decoded?.agent?.consent.abilities.place_building,
      },
      restored,
      after: {
        lightDuty: after.agent?.consent.abilities.light_duty,
        placeBuilding: after.agent?.consent.abilities.place_building,
      },
    };
  });

  expect(result).toEqual({
    captured: { lightDuty: true, placeBuilding: true },
    decoded: { lightDuty: true, placeBuilding: true },
    restored: true,
    after: { lightDuty: true, placeBuilding: true },
  });
});

test('plain-boot production orders pan a seam and place a real building', async ({ page }, testInfo) => {
  const errors = collectErrors(page);
  await openProductionOrders(page, '/?nowaves&nolevel&nopause&seed=ap-orders-production');
  expect(await page.evaluate(() => window.__GR_TEST__)).toBeUndefined();
  await page.getByTestId('contract-briefing-dismiss').click();
  await expect(page.getByTestId('contract-briefing')).toBeHidden();

  const before = await page.evaluate(() => {
    const seam = window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.active);
    return {
      seam,
      palisades: window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? 0,
    };
  });
  expect(before.seam).toBeTruthy();

  await page.evaluate((seam) => {
    const surface = (window as unknown as { __AP_PRODUCTION_ORDERS__: ProductionOrdersSurface }).__AP_PRODUCTION_ORDERS__;
    surface.tools.submit_orders([
      { verb: 'HARVEST', seam: seam.id },
      { verb: 'HARVEST', seam: seam.id },
      { verb: 'BUILD', what: 'palisade', where: { x: 0, z: 10 }, when: { goldGte: 10 } },
    ]);
  }, before.seam!);

  await expect
    .poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? 0))
    .toBe(before.palisades + 1);
  const world = await page.evaluate((seamId) => {
    const surface = (window as unknown as { __AP_PRODUCTION_ORDERS__: ProductionOrdersSurface }).__AP_PRODUCTION_ORDERS__;
    return {
      gold: window.__THREE_GAME_DIAGNOSTICS__?.economy.gold ?? -1,
      seam: window.__THREE_GAME_DIAGNOSTICS__?.harvest.activeNodes.find((entry) => entry.id === seamId),
      economyLog: surface.tools.get_state().outcome.economyLog,
      orders: surface.tools.view().outcome.result.orders,
    };
  }, before.seam!.id);
  expect(world.gold).toBe(0);
  expect(world.seam?.remaining).toBe(before.seam!.remaining - 10);
  expect(world.economyLog.filter((event) => event.type === 'gold_panned' && event.nodeId === before.seam!.id)).toHaveLength(2);
  expect(world.economyLog.at(-1)).toMatchObject({ type: 'gold_spent', sink: 'build_palisade' });
  expect(world.orders.map((order) => order.status)).toEqual(['done', 'done', 'done']);
  await saveProductionShot(page, testInfo);

  await page.evaluate(() => {
    const surface = (window as unknown as { __AP_PRODUCTION_ORDERS__: ProductionOrdersSurface }).__AP_PRODUCTION_ORDERS__;
    surface.tools.submit_orders([
      { verb: 'BUILD', what: 'palisade', where: { x: 2, z: 10 }, when: { goldGte: 0 } },
    ]);
  });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const surface = (window as unknown as { __AP_PRODUCTION_ORDERS__: ProductionOrdersSurface }).__AP_PRODUCTION_ORDERS__;
        return surface.tools.view().outcome.result.orders[0]?.status;
      }),
    )
    .toBe('failed');
  const rejected = await page.evaluate(() => {
    const surface = (window as unknown as { __AP_PRODUCTION_ORDERS__: ProductionOrdersSurface }).__AP_PRODUCTION_ORDERS__;
    return {
      buildingCount: window.__THREE_GAME_DIAGNOSTICS__?.build.palisades ?? 0,
      order: surface.tools.view().outcome.result.orders[0],
    };
  });
  expect(rejected.buildingCount).toBe(before.palisades + 1);
  expect(rejected.order?.reason).toMatch(/^FAILED( \([a-z_]+\))?: BUILD action was rejected/);
  expect(['insufficient_gold', 'out_of_reach', 'out_of_zone', 'collision', 'cap_reached', undefined]).toContain(
    rejected.order?.reason?.match(/^FAILED \(([a-z_]+)\):/)?.[1],
  );
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});

test('production pan does not advance an active player channel', async ({ page }) => {
  const errors = collectErrors(page);
  await openProductionOrders(page, '/?debug&nowaves&nolevel&nopause&seed=ap-orders-pan-isolation');
  const result = await page.evaluate(() => {
    const game = window.__GR_TEST__!;
    const surface = (window as unknown as { __AP_PRODUCTION_ORDERS__: ProductionOrdersSurface }).__AP_PRODUCTION_ORDERS__;
    const seams = window.__THREE_GAME_DIAGNOSTICS__!.harvest.activeNodes.filter((entry) => entry.active).slice(0, 2);
    if (seams.length < 2) throw new Error('pan isolation requires two active seams');
    game.setManualSim(true);
    game.teleport(seams[0].position.x, seams[0].position.z);
    game.advanceSim(0.5);
    const before = window.__THREE_GAME_DIAGNOSTICS__!.harvest;
    const beforeLog = surface.tools.get_state().outcome.economyLog.length;
    const receipt = surface.tools.pan_at(seams[1].id);
    game.advanceSim(1 / 30);
    const after = window.__THREE_GAME_DIAGNOSTICS__!.harvest;
    return {
      receipt,
      playerProgressBefore: before.progress,
      playerProgressAfter: after.progress,
      playerRemainingBefore: before.activeNodes.find((entry) => entry.id === seams[0].id)?.remaining,
      playerRemainingAfter: after.activeNodes.find((entry) => entry.id === seams[0].id)?.remaining,
      agentNodeId: seams[1].id,
      agentRemainingBefore: before.activeNodes.find((entry) => entry.id === seams[1].id)?.remaining,
      agentRemainingAfter: after.activeNodes.find((entry) => entry.id === seams[1].id)?.remaining,
      events: surface.tools.get_state().outcome.economyLog.slice(beforeLog),
    };
  });
  expect(result.receipt.outcome.ok).toBe(true);
  expect(result.playerProgressAfter).toBeCloseTo(result.playerProgressBefore + 1 / 45, 6);
  expect(result.playerRemainingAfter).toBe(result.playerRemainingBefore);
  expect(result.agentRemainingAfter).toBe(result.agentRemainingBefore! - 5);
  expect(result.events).toEqual([
    expect.objectContaining({ type: 'gold_panned', nodeId: result.agentNodeId, amount: 5 }),
  ]);
  expect(errors.consoleErrors).toEqual([]);
  expect(errors.pageErrors).toEqual([]);
});
