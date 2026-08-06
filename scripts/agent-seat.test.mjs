import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// THE AGENT SEAT — the seam's own contract, proven without a relay.
// The two-seat shared-run proof (which needs wrangler) lives in scripts/agent-seat-room.mjs;
// this file is the part that can gate on any machine, in seconds, with no network.

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTRACT = 'the-claim';
const SEED = 'agent-seat-seam';

async function withSim(run) {
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  const location = new URL(`http://gr-sim.local/?debug&contract=${CONTRACT}&seed=${SEED}`);
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    return await run(vite);
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location;
    else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
}

test('a wire act crosses into the sim and changes it', { timeout: 60_000 }, async () => {
  await withSim(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    const place = { type: 'place_build', id: 'palisade', position: { x: 0, z: 10 }, rotationSteps: 0 };

    // A run starts broke, so the same act is REFUSED first and honoured second. Both
    // answers are decisions the sim made from state every seat shares — which is why a
    // refusal is as good a lockstep citizen as a placement.
    assert.equal(sim.applyWireAction(place), false, 'a palisade cannot be raised on an empty purse');
    assert.equal(sim.build.diagnostics.palisades, 0);

    sim.economy.apply({ id: 'seat-test-1', at: 0, type: 'gold_granted', source: 'debug', amount: 100 });
    assert.equal(sim.applyWireAction(place), true, 'the wire act places the palisade');
    assert.equal(sim.build.diagnostics.palisades, 1);

    // Everything else the vocabulary can say is REPORTED, never silently swallowed.
    for (const action of [
      { type: 'weapon_toggle' },
      { type: 'set_pause', paused: true },
      { type: 'context_action', action: 'fund' },
      { type: 'set_agent_ability', ability: 'auto_pan', granted: true },
    ]) {
      assert.equal(sim.applyWireAction(action), false, `${action.type} is not a headless sim's to honour`);
    }
  });
});

test('two independently booted sims agree tick for tick', { timeout: 60_000 }, async () => {
  await withSim(async (vite) => {
    const { HeadlessContractSim, SEAT_HASH_ENGINE } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    assert.equal(SEAT_HASH_ENGINE, 'gr-sim.headless.v1');

    const left = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    const right = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    const hashes = [];
    for (let tick = 0; tick < 300; tick += 1) {
      left.advanceOneTick();
      right.advanceOneTick();
      if (tick % 30 !== 0) continue;
      const hash = left.tickHash(tick);
      assert.equal(right.tickHash(tick), hash, `seats disagreed at tick ${tick}`);
      hashes.push(hash);
    }
    // The hash has to MOVE, or "identical" would prove nothing about the sim.
    assert.ok(new Set(hashes).size > 1, 'the determinism hash never moved — it is not reading the sim');
    assert.match(hashes[0], /^fnv1a32:[0-9a-f]{8}$/);

    // A tick that diverges must be VISIBLE. One extra step on one side is the smallest
    // divergence there is, and it is exactly what the wire's hash exchange has to catch.
    right.advanceOneTick();
    assert.notEqual(right.tickHash(300), left.tickHash(300), 'a one-tick drift went unnoticed');
  });
});

test('the seat carries BUILD and refuses to stretch for the rest', { timeout: 60_000 }, async () => {
  await withSim(async (vite) => {
    const { SeatOrdersDriver } = await vite.ssrLoadModule('/src/sim/SeatOrders.ts');
    const driver = new SeatOrdersDriver();

    const accepted = driver.submit([{ verb: 'BUILD', what: 'palisade', where: { x: 0, z: 10 }, when: { goldGte: 10 } }]);
    assert.deepEqual(accepted, { ok: true, accepted: 1 });
    assert.equal(driver.waiting, 1);
    assert.deepEqual(driver.fire({ wave: 3, gold: 9 }), [], 'an unmet condition must not fire');

    const fired = driver.fire({ wave: 3, gold: 10 });
    assert.deepEqual(fired, [{ type: 'place_build', id: 'palisade', position: { x: 0, z: 10 }, rotationSteps: 0 }]);
    assert.equal(driver.waiting, 0);
    assert.deepEqual(driver.fire({ wave: 4, gold: 999 }), [], 'a fired order must not fire twice');

    // REJECT, DON'T STRETCH. Every other verb commands a body the wire has no word for.
    for (const order of [
      { verb: 'HARVEST', seam: 'gold-seam-1' },
      { verb: 'REPAIR_UNDER', pct: 50 },
      { verb: 'MOVE_TO', pos: { x: 1, z: 2 } },
      { verb: 'HOLD', pos: { x: 1, z: 2 } },
      { verb: 'FALLBACK_IF', threat: { enemiesGte: 5 }, pos: { x: 1, z: 2 } },
    ]) {
      const verdict = driver.submit([order]);
      assert.equal(verdict.ok, false, `${order.verb} must not ride the wire`);
      assert.equal(verdict.reason, 'UNSPEAKABLE_ON_THE_WIRE');
      assert.match(verdict.message, /cannot ride the lockstep wire yet/);
      assert.match(verdict.message, /BUILD alone/);
    }

    // A malformed BUILD is a different failure from an unspeakable verb, and the rider
    // has to be able to tell them apart: one is a typo, the other is an unbuilt door.
    const malformed = driver.submit([{ verb: 'BUILD', what: 'not_a_building', where: { x: 0, z: 0 }, when: { goldGte: 1 } }]);
    assert.equal(malformed.ok, false);
    assert.equal(malformed.reason, 'INVALID_ARGS');
    // The two reasons must be decidable WITHOUT reading the copy back. An earlier draft
    // classified by substring-matching its own message, which fails open the first time
    // anyone rewords it — so pin that the messages do not overlap.
    assert.doesNotMatch(malformed.message, /cannot ride the lockstep wire yet/);
    assert.equal(driver.submit('not an array').ok, false);
  });
});

test('the throttle ceiling is the relay rate limit, not a taste', { timeout: 60_000 }, async () => {
  await withSim(async (vite) => {
    const { ROOM_TICK_RATE, SEAT_TICK_RATE_CEILING } = await vite.ssrLoadModule('/src/sim/SeatedLockstepSim.ts');
    const relay = await import('node:fs/promises').then((fs) => fs.readFile(new URL('../functions/api/_multiplayer.ts', import.meta.url), 'utf8'));
    const limit = Number(/const RATE_LIMIT_MESSAGES = ([\d_]+);/.exec(relay)?.[1]?.replace(/_/g, ''));
    const windowMs = Number(/const RATE_WINDOW_MS = ([\d_]+);/.exec(relay)?.[1]?.replace(/_/g, ''));
    assert.ok(Number.isInteger(limit) && Number.isInteger(windowMs), 'the relay still declares its rate limit');

    const messagesPerSecond = limit / (windowMs / 1000);
    // One `input` per tick plus one `hash` every 30 ticks is what a seat actually spends.
    const spendAtCeiling = SEAT_TICK_RATE_CEILING * (1 + 1 / 30);
    assert.ok(spendAtCeiling < messagesPerSecond, `a seat at ${SEAT_TICK_RATE_CEILING} ticks/s spends ${spendAtCeiling}/s against ${messagesPerSecond}/s`);
    assert.ok(spendAtCeiling < messagesPerSecond * 0.85, 'the ceiling leaves no headroom for jitter');
    assert.ok(ROOM_TICK_RATE < SEAT_TICK_RATE_CEILING, 'the default must sit under its own ceiling');
    assert.equal(ROOM_TICK_RATE, 30, "the room's clock is LockstepClient.stepSeconds");
  });
});
