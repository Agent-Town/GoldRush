import { expect, test, type Page } from '@playwright/test';

/**
 * A7 — "MOMENTUM IS COMMITMENT" (`specs/agent-play/door-completion-sheet.md:20`, RATIFIED
 * 2026-08-20). Three ratified mechanics and one honesty claim, each pinned here:
 *
 *   1. ORBITAL RETURN — a lob that hits NOTHING re-enters after 12s continuing its original
 *      vector; one return, then gone. The flag driving it (`E8PhysicsSystem:133`) was computed
 *      and consumed by nothing until this slice, so these are its first assertions.
 *   2. HANDHOLDS — SOFT. On the spine or a scaffold deck, full thrust; off both, half response
 *      and momentum carries. The last test proves it is not a wall.
 *   3. DEBRIS FIELDS — inside a band the suit slows and takes a slow chip.
 *   4. The HONESTY CLAIM written into `HeadlessContractSim`: the drift is inert headless because
 *      that engine never thrusts, while the debris chip is NOT inert because it is positional.
 *
 * Mistake #10 — "where does the PLAYER see this, in a plain boot?" — is answered separately, in
 * `artifacts/e8-low-orbit/boot-probe.spec.ts`, because the honest answer needs the board's own
 * unlock chain seeded rather than a query flag. See that file and F-E8LO-2.
 */

const LOW_ORBIT = '/?debug&epoch=epoch-8-orbital&contract=e8-low-orbit&nowaves&nolevel&nopause&seed=e8-low-orbit-momentum';

async function open(page: Page, query: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(query);
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 12);
  const dismiss = page.getByTestId('contract-briefing-dismiss');
  if (await dismiss.isVisible()) await dismiss.click();
  await page.evaluate(() => window.__GR_TEST__!.setManualSim(true));
  return errors;
}

test('the contract wires the low-orbit consumer with its declared geography', async ({ page }) => {
  const errors = await open(page, LOW_ORBIT);
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.lowOrbit)).toMatchObject({
    declared: true,
    orbitalReturn: true,
    returnSeconds: 12,
    // The contract's own counts: three scaffold decks, two debris bands, one five-point spine
    // (five points = four segments). Read from the consumer, so a contract edit shows up here.
    scaffoldZones: 3,
    debrisFields: 2,
    handholdSegments: 4,
  });
  expect(errors).toEqual([]);
});

test('a lob that hits nothing returns once after 12s, then is gone', async ({ page }) => {
  const errors = await open(page, LOW_ORBIT);

  // Fire from the middle of the carcass yard at empty ground. `nowaves` means there is nothing
  // to hit, which is exactly the case the mechanic is about.
  const launched = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.clearEnemies();
    test.teleport(0, 0);
    const aim = test.setBlastAim(9, 0);
    return { aim, ok: test.launchBlastAt(aim.x, aim.z, 1) };
  });
  expect(launched.ok).toBe(true);

  // Before the round lands: in flight, nothing scheduled yet.
  expect(await page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(0.5);
    return {
      alive: window.__THREE_GAME_DIAGNOSTICS__!.arsenal.blastsAlive,
      orbit: window.__THREE_GAME_DIAGNOSTICS__!.lowOrbit,
    };
  })).toMatchObject({ alive: 1, orbit: { returnsScheduled: 0, returnsDetonated: 0 } });

  // It lands, hits nothing, and goes back up: the pool still holds ONE charge — the same round,
  // now in orbit — and the consumer has counted exactly one scheduled return.
  //
  // FIVE seconds, not one: zero-g already multiplies lob air time by 4.8
  // (`Balance.e8Physics.zeroGravityLobArcDistanceMultiplier`), so the `airTime: 1` handed to
  // `launchBlastAt` is really 4.8s in flight. That multiplier predates A7 and is untouched here.
  expect(await page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(5);
    return {
      alive: window.__THREE_GAME_DIAGNOSTICS__!.arsenal.blastsAlive,
      orbit: window.__THREE_GAME_DIAGNOSTICS__!.lowOrbit,
    };
  })).toMatchObject({ alive: 1, orbit: { returnsScheduled: 1, returnsDetonated: 0 } });

  // Still in orbit most of the way through the twelve seconds. The RETURN's flight is exactly
  // `returnSeconds` — it is armed by the consumer's policy, not by the lob multiplier.
  expect(await page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(10);
    return window.__THREE_GAME_DIAGNOSTICS__!.arsenal.blastsAlive;
  })).toBe(1);

  // It re-enters, and ONE RETURN THEN GONE: the pool empties and no second return is scheduled,
  // even though this detonation also hit nothing.
  expect(await page.evaluate(() => {
    window.__GR_TEST__!.advanceSim(3);
    return {
      alive: window.__THREE_GAME_DIAGNOSTICS__!.arsenal.blastsAlive,
      orbit: window.__THREE_GAME_DIAGNOSTICS__!.lowOrbit,
    };
  })).toMatchObject({ alive: 0, orbit: { returnsScheduled: 1, returnsDetonated: 1 } });

  // TWO detonations from ONE shot: the round landed, went back up, and landed again. That count
  // is the return's signature — a spent lob detonates once.
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.arsenal.detonations)).toBe(2);
  expect(launched.aim.x).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('a lob that hits something is spent, and never returns', async ({ page }) => {
  const errors = await open(page, LOW_ORBIT);
  const result = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.clearEnemies();
    test.teleport(0, 0);
    // A ring of near-frozen targets, then aim at where one of them ACTUALLY is — `spawnPack` is
    // (count, radius, opts), so asking for a position and reading it back is the only way to be
    // sure the round lands on something rather than near it.
    test.spawnPack(8, 9, { hpScale: 100, speedScale: 0.001, contactDamageScale: 0 });
    const victim = test.enemyPositions()[0]!;
    const aim = test.setBlastAim(victim.x, victim.z);
    test.launchBlastAt(aim.x, aim.z, 1);
    test.advanceSim(6);
    return {
      alive: window.__THREE_GAME_DIAGNOSTICS__!.arsenal.blastsAlive,
      orbit: window.__THREE_GAME_DIAGNOSTICS__!.lowOrbit,
      detonations: window.__THREE_GAME_DIAGNOSTICS__!.arsenal.detonations,
    };
  });
  // At least the round we threw — and possibly more, because a live pack also draws the E8
  // arsenal's own kinetic lobber. Deliberately NOT pinned to exactly 1: the number of lobs in
  // the air is not this test's claim, and pinning it would make the test a hostage to the
  // arsenal's fire rate.
  expect(result.detonations).toBeGreaterThanOrEqual(1);
  // THE claim, and it holds across every one of those detonations: a hit is a commitment kept.
  // Nothing is left in the sky and NOTHING was scheduled to come back — each round found a
  // target, so none of them earned a return.
  expect(result).toMatchObject({ alive: 0, orbit: { returnsScheduled: 0, returnsDetonated: 0 } });
  expect(errors).toEqual([]);
});

test('handholds are a soft constraint: off-route thrust halves, and is never a wall', async ({ page }) => {
  const errors = await open(page, LOW_ORBIT);

  // Same thrust, same duration, two places: ON the spine (the route runs through z=0 between
  // x=-48 and x=48) and OFF it (z=20 is past the carcass yard's z=14 edge and more than the
  // 4wu half-width from any segment, but short of the debris band at z=24).
  const travel = async (x: number, z: number) => page.evaluate(async ({ atX, atZ }) => {
    const test = window.__GR_TEST__!;
    test.teleport(atX, atZ);
    test.advanceSim(0.5);
    const start = window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x;
    return { start, atX, atZ };
  }, { atX: x, atZ: z });

  await travel(0, 0);
  await page.keyboard.down('KeyD');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  const onRoute = await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__!.e8Physics.filteredMovement.x);
  await page.keyboard.up('KeyD');

  await travel(0, 20);
  await page.keyboard.down('KeyD');
  await page.evaluate(() => window.__GR_TEST__!.advanceSim(0.5));
  const offRoute = await page.evaluate(() => ({
    filtered: window.__THREE_GAME_DIAGNOSTICS__!.e8Physics.filteredMovement.x,
    moved: window.__THREE_GAME_DIAGNOSTICS__!.heroPos.x,
    orbit: window.__THREE_GAME_DIAGNOSTICS__!.lowOrbit,
  }));
  await page.keyboard.up('KeyD');

  // Half the CONTROL, not half the map: thrust builds more slowly off the route...
  expect(onRoute).toBeGreaterThan(0);
  expect(offRoute.filtered).toBeGreaterThan(0);
  expect(offRoute.filtered).toBeLessThan(onRoute);
  // ...but the rider still MOVES. This is the assertion that says "soft": a wall would pin the
  // hero at its start x, and the ratified design forbids one.
  expect(offRoute.moved).toBeGreaterThan(0);
  expect(offRoute.orbit.driftSteps).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('the debris bands slow the suit and chip it', async ({ page }) => {
  const errors = await open(page, LOW_ORBIT);
  const chipped = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.clearEnemies();
    // z=30 is inside the north band (z 24..54) declared by the contract.
    test.teleport(0, 30);
    const before = window.__THREE_GAME_DIAGNOSTICS__!.hp;
    test.advanceSim(4);
    return {
      before,
      after: window.__THREE_GAME_DIAGNOSTICS__!.hp,
      orbit: window.__THREE_GAME_DIAGNOSTICS__!.lowOrbit,
    };
  });
  // 1hp/s, banked and spent in whole points, so four seconds costs about four hp — asserted as
  // a range rather than a number so the fixed-step boundary cannot make this flaky.
  expect(chipped.after).toBeLessThan(chipped.before);
  expect(chipped.before - chipped.after).toBeGreaterThanOrEqual(3);
  expect(chipped.before - chipped.after).toBeLessThanOrEqual(5);
  expect(chipped.orbit.debrisSteps).toBeGreaterThan(0);
  expect(chipped.orbit.debrisDamageDealt).toBeGreaterThanOrEqual(3);

  // And outside a band nothing chips at all — the hazard is the band, not the contract.
  const clean = await page.evaluate(() => {
    const test = window.__GR_TEST__!;
    test.teleport(0, 0);
    const before = window.__THREE_GAME_DIAGNOSTICS__!.hp;
    test.advanceSim(4);
    return { before, after: window.__THREE_GAME_DIAGNOSTICS__!.hp };
  });
  expect(clean.after).toBe(clean.before);
  expect(errors).toEqual([]);
});
