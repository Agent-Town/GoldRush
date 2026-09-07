import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { createServer } from 'vite';
import { expectNoConsoleErrors, watchErrors } from './support/console-watch';

/**
 * ⛔ RED AND OWED, 2026-09-07 (`rider-parity-grammar-stage3`, ADR-005). READ THIS BEFORE RE-RUNNING.
 *
 * The ride below cannot finish under the 1:1 grammar, and that is a FINDING rather than a
 * regression this task introduced. Two measurements, both on this tree:
 *
 * F-RPG-18 — GR-SIM RACES THE PROSPECTOR HERE. `HeadlessContractSim` builds the deepwater socket
 *   with `raceCourse || flotilla ? this.prospector.position : this.hero.group.position` as the
 *   socket's own "hero position", and `DeepwaterSocket.advance:130` feeds that to
 *   `RegattaRaceSystem.advance`'s racer list. So on this course the body that passes the gates is
 *   the PROSPECTOR — a body no human can position. The browser races every VISIBLE ACTOR plus the
 *   boat's anchor (`Game.ts:2989-2992`) and never the Prospector. `MOVE_TO` was the only verb that
 *   steered that racer, and ADR-005 retired it: the plan below is the 1:1 one, and the hero it
 *   walks is not the body the course measures.
 *
 * F-RPG-19 — AND THE GATES ARE NOT STANDABLE. Even with the racer re-based onto the hero (measured:
 *   one line in `HeadlessContractSim`, applied and then backed out because it is another slice's
 *   behaviour to change), `MOVE_HERO` refuses every gate: `Terrain.sample` reports
 *   `walkable: false` at `(-49, 0)`, `(-28, 38)`, `(28, 38)` and `(49, 0)` — the whole course is
 *   open water. The ride reaches gate 1 and stops, at wave 17 of a 20-turn bound, with one gate of
 *   five.
 *
 * SO THE CURE IS NOT A PLAN. It is one of: race the hero AND make the course standable for it; or
 * give BOTH species a steering control for the boat (ADR-005 amendment clause 5 — a control added
 * for one species is added for both in the same slice or not at all). Either is an E5 Deepwater
 * decision with an owner's word behind it, not a fixture edit, and both are outside this task's
 * firewall. The plan below is left in the SURVIVING grammar so the next reader sees the shape the
 * cure has to make work, rather than a verb the door no longer knows.
 */
test('the Regatta runs its authored course and secures both bench seeds deterministically', async () => {
  test.setTimeout(90_000);
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
    const { RegattaRaceSystem } = await vite.ssrLoadModule('/src/systems/RegattaRaceSystem.ts');
    const contract = loadContract('e5-regatta');
    const authored = RegattaRaceSystem.create(contract);
    expect(authored).not.toBeNull();
    expect(authored.movementMultiplierAt(0, 40)).toBe(1.35);
    expect(authored.movementMultiplierAt(0, 0)).toBe(1);
    for (const [index, gate] of contract.tileParams.raceCourse.beacons.entries()) {
      authored.advance(index + 1, index, [gate]);
    }
    expect(authored.diagnostics).toMatchObject({
      nextGate: { id: 'claim-boat', x: -49, z: 0 },
      gatesPassed: contract.tileParams.raceCourse.beacons.map(({ id }: { id: string }) => ({ id, passedAt: expect.any(Number) })),
      finished: false,
      fastWaterMultiplier: 1.35,
    });
    authored.advance(6, 6, [{ x: -49, z: 0 }]);
    expect(authored.diagnostics).toMatchObject({ nextGate: null, finished: true });

    const rule = deriveMechanicsManifest(contract).rules.find(({ id }: { id: string }) => id === 'regatta_race');
    expect(rule).toMatchObject({
      source: 'RegattaRaceSystem.advance+movementMultiplierAt',
      data: {
        gates: contract.tileParams.raceCourse.beacons.map(({ id }: { id: string }) => id),
        gateRadiusFallback: 6,
        fastWaterMultiplier: 1.35,
        deadlineWave: 12,
        competingRacerLoot: false,
      },
    });

    const run = (seed: string) => {
      const sim = new HeadlessContractSim({ contractId: contract.id, seed });
      let turn = sim.currentTurn();
      let firstTurn = true;
      let turns = 0;
      while (!turn.terminal && turns++ < 20) {
        const deepwater = turn.view.now.deepwater!;
        const orders: unknown[] = [];
        if (turn.view.now.pendingSecure) {
          orders.push({ verb: 'SECURE_CHOICE', choice: 'bank' });
          const receipt = sim.submitOrders(orders);
          expect(receipt.outcome.ok, JSON.stringify(receipt.outcome)).toBe(true);
          turn = sim.advanceToTurn();
          continue;
        }
        if (firstTurn) {
          for (const [index, pad] of deepwater.pads.entries()) {
            orders.push({ verb: 'BOAT_BUILD', padId: pad.id, buildingId: index === 0 ? 'sentry_beacon' : 'turret' });
          }
          orders.push({ verb: 'REANCHOR', anchorId: 'finish-line' });
          firstTurn = false;
        }
        const next = deepwater.race?.nextGate;
        if (next) {
          if (deepwater.race!.gatesPassed.length === 5) orders.push({ verb: 'REANCHOR', anchorId: 'start-line' });
          // ADR-005 stage 3: the HERO sails the gates, and since F-RPG-18 it really is the hero —
          // gr-sim used to hand this course the PROSPECTOR'S body as its 'hero position', so the
          // racer was a body no human can position and `MOVE_TO` was the only thing that steered
          // it. One body now, on both sides, and `MOVE_HERO` is the verb a human's keys share.
          orders.push({ verb: 'MOVE_HERO', pos: { x: next.x, z: next.z } });
        }
        const receipt = sim.submitOrders(orders);
        expect(receipt.outcome.ok, JSON.stringify(receipt.outcome)).toBe(true);
        turn = sim.advanceToTurn();
      }
      expect(turn.terminal).toBe(true);
      expect(turn.view.now.deepwater?.race?.finished).toBe(true);
      expect(turn.view.now.deepwater?.race?.gatesPassed).toHaveLength(5);
      return sim.outcome();
    };

    const expected = {
      'e5-regatta-01': 'fnv1a32:02404a88',
      'e5-regatta-02': 'fnv1a32:bf8b5db5',
    } as const;
    for (const [seed, eventLogHash] of Object.entries(expected)) {
      const first = run(seed);
      const second = run(seed);
      expect(second).toEqual(first);
      // NAMED-CAUSE PIN (b1-regatta-race, 2026-08-20): the five authored gates, return to the
      // Claim-Boat, three BOAT_BUILD actions, REANCHOR, MOVE_HERO, and automatic rig combat.
      expect(first).toMatchObject({ secured: true, waves: 12, kills: 33, eventLogHash });
    }
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete host.location;
    else host.location = previousLocation;
    if (previousWindow === undefined) delete host.window;
    else host.window = previousWindow;
  }
});

test('idle Regatta runs lose because the course remains unfinished', () => {
  test.setTimeout(30_000);
  const expected = {
    'e5-regatta-01': 'fnv1a32:80b36bec',
    'e5-regatta-02': 'fnv1a32:3dfe7f19',
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
