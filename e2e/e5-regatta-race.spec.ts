import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { createServer } from 'vite';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

/**
 * THE REGATTA COURSE — RE-WRITTEN FOR SLICE 2 OF `specs/agent-play/e5-regatta-steerable-boat.md`
 * (owner 2026-09-20: "A14 - do it"; the parity law, 2026-09-07: "AI and human users have to have
 * the same options and tools, otherwise it is unfair. fairness is crucial.").
 *
 * WHAT THESE TWO TESTS USED TO SAY, AND WHY IT HAD TO CHANGE. Both were red on main as
 * F-MAC2-1 (`logs/suite-red-inventory.md` rows 1109–1110) and both asserted a course that no
 * longer exists:
 *
 *   - `:35` raced a BODY round the gates. Under ADR-005's 1:1 grammar the Prospector is not a body
 *     anyone positions and every gate is open water no body can stand on (F-RPG-18/19), so the
 *     ride it wrote down could not be sailed by either species. Slice 1 made the Claim-Boat a
 *     steerable body; slice 2 makes that boat the ONLY racer (law 3). The ride below is therefore
 *     the one a rider actually sails: board, then steer the marks.
 *   - `:141` pinned idle-run hashes from an engine in which the boat's MOORING scored the start
 *     beacon it stands on, for free, on every run that did nothing. It does not any more — a run
 *     that never boards passes NO gate — so the idle hashes moved, deliberately, and the two
 *     Regatta null floors moved with them (`assets/contracts/null-floors.json`, re-recorded in the
 *     same commit with this cause).
 *
 * Their sibling `:157` is untouched and stays green.
 */
test('the Regatta is won by the BOAT and secures both bench seeds deterministically', async () => {
  test.setTimeout(120_000);
  const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
  const previousLocation = host.location;
  const previousWindow = host.window;
  const location = new URL('http://gr-sim.local/?debug&contract=e5-regatta');
  host.location = location;
  host.window = { location };
  const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

  try {
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { RegattaRaceSystem, regattaRacer } = await vite.ssrLoadModule('/src/systems/RegattaRaceSystem.ts');
    const contract = loadContract('e5-regatta');
    const beacons = contract.tileParams.raceCourse.beacons;

    // ONE AUTHORED FAST-WATER NUMBER (F-RB1-2 closed): the race reads the hull's own.
    const authored = RegattaRaceSystem.create(contract);
    expect(authored).not.toBeNull();
    expect(authored.movementMultiplierAt(0, 40)).toBe(contract.tileParams.deepwater.claimBoat.physics.fastWaterMultiplier);
    expect(authored.movementMultiplierAt(0, 40)).toBe(1.5);
    expect(authored.movementMultiplierAt(0, 0)).toBe(1);

    // THE ONE RACER RULE (law 3). A hull with nobody aboard is not a racer, and neither is a body.
    expect(regattaRacer(undefined)).toBeNull();
    expect(regattaRacer({ x: 7, z: 9, aboard: null, steerable: true })).toBeNull();
    expect(regattaRacer({ x: 7, z: 9, aboard: 'hero', steerable: false })).toBeNull();
    expect(regattaRacer({ x: 7, z: 9, aboard: 'hero', steerable: true })).toEqual({ x: 7, z: 9 });

    for (const [index, gate] of beacons.entries()) authored.advance(index + 1, index, { x: gate.x, z: gate.z });
    expect(authored.diagnostics).toMatchObject({
      nextGate: { id: 'claim-boat', x: -49, z: 0 },
      gatesPassed: beacons.map(({ id }: { id: string }) => ({ id, passedAt: expect.any(Number) })),
      finished: false,
      forfeited: false,
      fastWaterMultiplier: 1.5,
    });
    authored.advance(6, 6, { x: -49, z: 0 });
    expect(authored.diagnostics).toMatchObject({ nextGate: null, finished: true, forfeited: false });

    // AND THE FORFEIT (Q2, ratified 2026-09-19). Once the start mark is passed, a step with no
    // racer ends the run's race; a run that never started cannot forfeit.
    const abandoned = RegattaRaceSystem.create(contract);
    abandoned.advance(1, 0, null);
    expect(abandoned.diagnostics).toMatchObject({ forfeited: false, gatesPassed: [] });
    abandoned.advance(2, 0, { x: beacons[0].x, z: beacons[0].z });
    abandoned.advance(3, 0, null);
    expect(abandoned.diagnostics).toMatchObject({ forfeited: true, forfeitedAt: 3, finished: false, nextGate: null });
    abandoned.advance(4, 0, { x: beacons[1].x, z: beacons[1].z });
    expect(abandoned.diagnostics).toMatchObject({ forfeited: true, gatesPassed: [{ id: 'start-beacon', passedAt: 2 }] });

    const rule = deriveMechanicsManifest(contract).rules.find(({ id }: { id: string }) => id === 'regatta_race');
    expect(rule).toMatchObject({
      source: 'RegattaRaceSystem.advance+movementMultiplierAt',
      data: {
        gates: beacons.map(({ id }: { id: string }) => id),
        gateRadiusFallback: 6,
        // ⛔ F-RB2-3, FOR SLICE 3: the published manifest still says 1.35, which is the number this
        // slice DELETED from the engine. `MechanicsManifest.ts:564` hardcodes it and that file is
        // slice 3's (the view bump, the fence, the manifest and the census pin are one censused
        // act). Asserted at the manifest's real value so the lie is measured, not hidden.
        fastWaterMultiplier: 1.35,
        deadlineWave: 12,
        competingRacerLoot: false,
      },
    });

    /**
     * THE RIDE. A rider boards the way a human does — off the deck, then back over the rail — and
     * then steers the marks. Two things it does NOT do, on purpose:
     *   · it never orders the mark itself: every buoy is a solid in the landmark registry, so
     *     `MOVE_HERO` to a mark is refused UNREACHABLE_APPROACH. It steers to open water inside
     *     the gate radius, which is the public rider grammar.
     *   · it never REANCHORs mid-race. `reanchor` is still a teleport (slice 1 kept the storm
     *     rules), and the two anchors stand on the first and last marks — see F-RB2-4.
     */
    const run = (seed: string) => {
      const sim = new HeadlessContractSim({ contractId: contract.id, seed });
      let turn = sim.currentTurn();
      let turns = 0;
      let built = false;
      let boarded = false;
      let steppedOff = false;
      while (!turn.terminal && turns++ < 60) {
        const deepwater = turn.view.now.deepwater!;
        const orders: unknown[] = [];
        if (turn.view.now.pendingSecure) {
          orders.push({ verb: 'SECURE_CHOICE', choice: 'bank' });
          const receipt = sim.submitOrders(orders);
          expect(receipt.outcome.ok, JSON.stringify(receipt.outcome)).toBe(true);
          turn = sim.advanceToTurn();
          continue;
        }
        if (!built) {
          for (const [index, pad] of deepwater.pads.entries()) {
            orders.push({ verb: 'BOAT_BUILD', padId: pad.id, buildingId: index === 0 ? 'sentry_beacon' : 'turret' });
          }
          built = true;
        }
        if (!boarded) {
          // Boarding is a CROSSING: the hero boots standing on the deck, so it steps off once and
          // walks back aboard. The same two positions the browser's own boarding test uses.
          if (!steppedOff) { orders.push({ verb: 'MOVE_HERO', pos: { x: -40, z: 0 } }); steppedOff = true; }
          else { orders.push({ verb: 'MOVE_HERO', pos: { x: -49, z: 6 } }); }
          // The rider knows it is aboard because the RACE says so: boarding passes the start mark,
          // which stands on the boat's own mooring. There is no `aboard` field in the view yet —
          // that is slice 3's censused act (view bump + fence + manifest + census pin).
          boarded = (deepwater.race?.gatesPassed?.length ?? 0) > 0;
        } else {
          // RE-ISSUED EVERY TURN, and that is not belt-and-braces: `submitOrders` REPLACES the
          // standing order list, so a turn that submits nothing wipes the helm and the boat coasts
          // to a stop mid-course (measured: the ride stalled at x = 8.9 on the run home until this
          // loop stopped skipping turns).
          const next = deepwater.race?.nextGate;
          if (next) orders.push({ verb: 'MOVE_HERO', pos: { x: next.x, z: next.z + 2 } });
        }
        const receipt = sim.submitOrders(orders);
        expect(receipt.outcome.ok, JSON.stringify(receipt.outcome)).toBe(true);
        turn = sim.advanceToTurn();
      }
      expect(turn.terminal).toBe(true);
      expect(turn.view.now.deepwater?.race?.forfeited).toBe(false);
      expect(turn.view.now.deepwater?.race?.finished).toBe(true);
      expect(turn.view.now.deepwater?.race?.gatesPassed).toHaveLength(5);
      return sim.outcome();
    };

    const expected = {
      'e5-regatta-01': 'fnv1a32:1bf7c1ff',
      'e5-regatta-02': 'fnv1a32:e8b9b2ff',
    } as const;
    for (const [seed, eventLogHash] of Object.entries(expected)) {
      const first = run(seed);
      const second = run(seed);
      expect(second).toEqual(first);
      // NAMED-CAUSE PIN (e5-regatta-boat-02, 2026-09-20): the boat is the racer. Three BOAT_BUILD
      // actions, a boarding, the five authored marks and the run home, and automatic rig combat.
      // The old pin (fnv1a32:02404a88 / fnv1a32:bf8b5db5) was a body walking gates it cannot stand
      // on, and was red on main as F-MAC2-1 row 1109.
      expect(first).toMatchObject({ secured: true, waves: 12, kills: 25, eventLogHash });
    }
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});

test('idle Regatta runs lose because nobody ever boards the boat', () => {
  test.setTimeout(30_000);
  // RE-PINNED, e5-regatta-boat-02 (2026-09-20): these two hashes moved on purpose and the cause is
  // one line — an idle run used to pass the START BEACON for free, because the boat's mooring
  // stands on it and the mooring was in the racer list. Slice 2 races the hull only while a body
  // is aboard, so a run that does nothing now passes no gate at all. The same change moved the two
  // Regatta null floors, re-recorded in the same commit. The OLD pins here
  // (fnv1a32:80b36bec / fnv1a32:3dfe7f19) were already stale before this slice — F-MAC2-1 row 1110
  // measured the engine answering `fnv1a32:d461683d`, which was `null-floors.json`'s own number.
  const expected = {
    'e5-regatta-01': 'fnv1a32:8050c83f',
    'e5-regatta-02': 'fnv1a32:18093696',
  } as const;
  for (const [seed, eventLogHash] of Object.entries(expected)) {
    const run = spawnSync(process.execPath, [
      'scripts/gr-sim.mjs', '--contract', 'e5-regatta', '--seed', seed, '--policy=idle',
    ], { cwd: process.cwd(), encoding: 'utf8', timeout: 20_000 });
    expect(run.status, run.stderr).toBe(0);
    const outcome = JSON.parse(run.stdout.trim().split('\n').at(-1)!);
    expect(outcome).toMatchObject({ secured: false, waves: 14, endReason: 'wave-ceiling', eventLogHash });
  }
});

test('plain boot resolves the Regatta contract without browser errors', async ({ page }) => {
  const watch = watchErrors(page);
  await page.goto('/?debug&contract=e5-regatta&nowaves&nolevel&nopause');
  await page.waitForFunction(() => window.__GR_TEST__ && (window.__THREE_GAME_DIAGNOSTICS__?.frame ?? 0) > 10);
  expect(await page.evaluate(() => window.__GR_TEST__!.activeContract().id)).toBe('e5-regatta');
  expect(await page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.contract.activeId)).toBe('e5-regatta');
  expectNoConsoleErrors(watch, 'e5-regatta plain boot');
});
