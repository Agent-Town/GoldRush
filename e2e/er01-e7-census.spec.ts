import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import signal from '../assets/contracts/epoch-7-signal/contracts.json' with { type: 'json' };

/**
 * PER-ID TRUTH. `e7-dead-band` was admitted 2026-08-20 by the A4 signal-suppression consumer
 * (`specs/agent-play/door-completion-sheet.md:14`): its `harvestAnchors` were authored, its
 * bench seeds minted, and a public-verb prover secured both seeds at wave 20 twice each
 * (`artifacts/e7-dead-band/`).
 *
 * `e7-echo-canyon` FOLLOWED IT THE SAME DAY, by the A3 broadcast-mirror consumer
 * (`specs/agent-play/door-completion-sheet.md:12`) and through the same door: four authored
 * `harvestAnchors`, its own bench seeds, and a public-verb prover that secured both seeds at
 * wave 20 twice each (`artifacts/e7-echo-canyon/`, `fnv1a32:7d877de5` / `fnv1a32:0a267a0b`)
 * while the idle floors stayed lost at wave 4 (Law 2). Relay Rush is unchanged and still
 * refused, so every assertion below stays keyed per id rather than shared — the E6 census's
 * shape.
 */
const ADMITTED = new Set(['e7-relay-valley', 'e7-dead-band', 'e7-echo-canyon']);

const EXPECTED_ACTIVE_CONTRACT: Record<string, string> = {
  'e7-relay-valley': 'e7-relay-valley',
  'e7-echo-canyon': 'e7-echo-canyon',
  'e7-dead-band': 'e7-dead-band',
  'e7-relay-rush': 'the-claim',
};

/**
 * WHAT EACH CONTRACT STILL DECLARES MISSING — the AP-11 honesty mandate, read as it IS rather
 * than as it ought to be. The Dead Band's row is now STALE PROSE: it names
 * `signal-suppression-consumer` as missing, and that consumer exists. It is not edited here.
 * `twist.signalSuppression` is still listed in `DECLARED_INERT_PATHS`
 * (`ContractFamilies.ts:1586`), which is what OBLIGES this contract to carry a non-empty
 * `engineDependencies` at all (`:1713-1718`) — and its `tileParams.signalNullZones` remains
 * genuinely inert either way, since the ratified design is contract-level and reads no zone.
 * Both files sit outside this slice's firewall, so the staleness is filed as F-E7DB-1 and
 * asserted here as the truth it currently is. Same call the E6 census made for glow-mesa.
 *
 * ECHO CANYON'S ROW IS NOW PARTLY STALE IN THE SAME WAY, and is likewise asserted as-is rather
 * than edited (F-A3-1). Its dependency names three consumers — "the playbook broadcast-mirror,
 * echo-band, and objective consumers" — and A3 built exactly ONE of them, because exactly one is
 * declared as a mechanic: `twist.broadcastMirror`. The echo BANDS are `heightfield.mode:
 * "visual"` (render-side by their own declaration, so there is nothing to socket), and the
 * "objective" is `objectiveMetadata` prose with no `secureWave` clause and no latch anywhere in
 * the contract — building one would be inventing scope the data refuses (Mistake #14). The row
 * must stay non-empty regardless: `tileParams.echoCanyonBands`, `tileParams.broadcastMirrorZones`,
 * `tileParams.objectiveMetadata` and `twist.broadcastMirror` are ALL in `DECLARED_INERT_PATHS`
 * (`ContractFamilies.ts:1580-1585`), and that list is outside this slice's firewall.
 */
const EXPECTED_DEPENDENCY: Record<string, string | undefined> = {
  'e7-relay-valley': undefined,
  'e7-echo-canyon': 'broadcast-mirror-consumer',
  'e7-dead-band': 'signal-suppression-consumer',
  'e7-relay-rush': 'interference-front-consumer',
};

/**
 * The manifest rows each contract derives, in order. Only the Dead Band declares suppression and
 * only Echo Canyon declares a mirror — asserted as ORDERED lists, so a rule that leaked onto the
 * wrong contract reddens here rather than passing as an extra.
 */
const EXPECTED_RULES: Record<string, string[]> = {
  'e7-relay-valley': ['build_zones'],
  'e7-echo-canyon': ['broadcast_mirror', 'build_zones'],
  'e7-dead-band': ['build_zones', 'signal_suppression'],
  'e7-relay-rush': ['build_zones'],
};

for (const contract of signal.contracts) {
  test(`${contract.id} census refuses the unsocketed Signal mechanics`, async () => {
    const seeds = [`${contract.id}-01`, `${contract.id}-02`];
    const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
    const previousLocation = host.location;
    const previousWindow = host.window;
    const location = new URL(`http://gr-sim.local/?debug&contract=${contract.id}`);
    const consoleErrors: string[] = [];
    const originalError = console.error;
    const originalWarn = console.warn;
    let vite: ViteDevServer | undefined;

    host.location = location;
    host.window = { location };
    console.error = (...args: unknown[]) => {
      const message = args.map(String).join(' ');
      if (!message.includes('ExperimentalWarning: localStorage is not available because --localstorage-file was not provided')) consoleErrors.push(message);
    };
    console.warn = (...args: unknown[]) => consoleErrors.push(args.map(String).join(' '));
    try {
      vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
      const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
      const { activeContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const mechanics = deriveMechanicsManifest(contract.id);
      const dependency = EXPECTED_DEPENDENCY[contract.id];
      const admitted = ADMITTED.has(contract.id);

      if (admitted) expect((benchSeeds as Record<string, string[]>)[contract.id]).toEqual(seeds);
      else expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();
      expect(mechanics).toMatchObject({ interactables: [], modes: [] });
      expect(mechanics.rules.map(({ id }: { id: string }) => id)).toEqual(EXPECTED_RULES[contract.id]);
      // prep-bench-seeds-flagships: deriveMechanicsManifest now exposes the shared buildables registry.
      expect(activeContract().id).toBe(EXPECTED_ACTIVE_CONTRACT[contract.id]);
      if (dependency === undefined) expect(contract.tileParams.engineDependencies).toBeUndefined();
      else expect(contract.tileParams.engineDependencies).toEqual([expect.objectContaining({ dep: dependency, status: 'missing' })]);
      for (const seed of seeds) {
        if (admitted) expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).not.toThrow();
        else {
          expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(
            new RegExp(`AP-07 supports only .*received ${contract.id}`),
          );
        }
      }

      // THE CONSUMER IS REAL, AND ONLY WHERE DECLARED. The Dead Band is the one Signal
      // contract that carries `twist.signalSuppression`, so it is the one whose view grows a
      // `signalSuppression` row — asserted BIDIRECTIONALLY so the field cannot leak onto a
      // contract that never asked for it.
      if (contract.id === 'e7-dead-band') {
        const { SignalSuppression } = await vite.ssrLoadModule('/src/systems/SignalSuppression.ts');
        const consumer = SignalSuppression.create(contract);
        expect(consumer.suppressedSystems).toEqual(['drones', 'playbooks', 'relayChains']);
        const rule = mechanics.rules.find(({ id }: { id: string }) => id === 'signal_suppression');
        // Sourced FROM the consumer: the manifest row and the gate cannot disagree.
        expect(rule.source).toBe('SignalSuppression.refuse');
        expect(rule.data.off).toEqual(consumer.suppressedSystems);
        const view = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0] }).currentTurn().view;
        expect(view.now.signalSuppression).toEqual({
          declared: true,
          drones: true,
          playbooks: true,
          relayChains: true,
          refusals: { drones: 0, playbooks: 0, relayChains: 0 },
        });
      } else if (admitted) {
        const view = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0] }).currentTurn().view;
        expect(view.now.signalSuppression).toBeUndefined();
      }

      // A3 — THE MIRROR IS REAL, AND ONLY WHERE DECLARED, asserted BIDIRECTIONALLY like A4's
      // block above so the field cannot leak onto a contract that never asked for one. Three
      // things are proved here and they are deliberately separate: the CONSUMER's arithmetic,
      // the VIEW row a rider polls, and — the load-bearing one — that a queued mirror really
      // reaches `WaveSystem` and spawns bodies.
      const { BroadcastMirror, BROADCAST_MIRROR_VARIANT_ID, BROADCAST_MIRROR_SQUAD_CAP } =
        await vite.ssrLoadModule('/src/systems/BroadcastMirror.ts');
      const mirror = BroadcastMirror.create(contract);
      if (contract.id === 'e7-echo-canyon') {
        expect(mirror.isDeclared).toBe(true);
        const rule = mechanics.rules.find(({ id }: { id: string }) => id === 'broadcast_mirror');
        // Sourced FROM the consumer: the manifest row and the spawn rule cannot disagree.
        expect(rule.source).toBe('BroadcastMirror.fieldMirrors');
        expect(rule.data.delay).toBe(mirror.diagnostics.delay);
        expect(rule.data.capPerWave).toBe(BROADCAST_MIRROR_SQUAD_CAP);

        // A fresh run has no habits, so it has no shadow. This is the ratified rule stated as an
        // assertion — and in THIS engine it is also the run's FINAL state, because the door
        // declares no playbook verb to record a use from.
        const sim = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0] });
        expect(sim.currentTurn().view.now.broadcastMirror).toEqual({
          declared: true,
          delay: 'next-wave',
          recordedUses: 0,
          distinctPlaybooks: 0,
          maxRepeat: 0,
          pending: [],
          squadsFielded: 0,
          bodiesFielded: 0,
          lastFieldedWave: null,
          capPerWave: 3,
          hpPerRepeat: 0.1,
          refusals: { cappedSquads: 0 },
        });

        // THE SHAPE MATH, driven with synthetic tapes so every ratified clause is pinned:
        // a tape that BUILT returns as wreckers, a repeat of the SAME tape is 10% heavier, and
        // the fourth use of one wave is DROPPED by the cap rather than banked.
        const built = [{ t: 0, mx: 0, my: 0, a: [{ type: 'place_build', id: 'turret', position: { x: 0, z: 0 }, rotationSteps: 0 }] }];
        const roved = [{ t: 0, mx: 1, my: 0, a: [] }, { t: 1, mx: 1, my: 0, a: [] }];
        mirror.noteUse({ id: 'tape-a', entries: built });
        mirror.noteUse({ id: 'tape-a', entries: built });
        mirror.noteUse({ id: 'tape-b', entries: roved });
        mirror.noteUse({ id: 'tape-c', entries: roved });
        const queued = mirror.diagnostics;
        expect(queued.recordedUses).toBe(4);
        expect(queued.distinctPlaybooks).toBe(3);
        expect(queued.maxRepeat).toBe(1);
        expect(queued.pending.map(({ wrecker, thief, roving, repeat }: Record<string, unknown>) => ({ wrecker, thief, roving, repeat })))
          .toEqual([
            { wrecker: true, thief: false, roving: false, repeat: 0 },
            { wrecker: true, thief: false, roving: false, repeat: 1 },
            { wrecker: false, thief: true, roving: true, repeat: 0 },
            { wrecker: false, thief: true, roving: true, repeat: 0 },
          ]);
        // +10% per repeat of the SAME playbook, off the roster's own hp — the whole lesson.
        expect(queued.pending[1].hpScale).toBeCloseTo(queued.pending[0].hpScale * 1.1, 10);

        // THE SEAM. A real `WaveSystem`, built exactly as both engines build it, handed this
        // consumer's own reader — so what spawns below is what a run spawns.
        const { WaveSystem } = await vite.ssrLoadModule('/src/systems/WaveSystem.ts');
        const { EnemyPool } = await vite.ssrLoadModule('/src/entities/pools.ts');
        const { createRng } = await vite.ssrLoadModule('/src/core/Rng.ts');
        const THREE = await vite.ssrLoadModule('three');
        const enemies = new EnemyPool();
        const waves = new WaveSystem(
          enemies,
          new THREE.Vector3(0, 0, 12),
          createRng('e7-echo-canyon-mirror-seam'),
          () => undefined,
          () => true,
          () => false,
          () => contract,
          {},
          undefined, undefined, undefined, undefined, undefined,
          undefined, undefined, undefined, undefined, undefined,
          (wave: number) => mirror.fieldMirrors(wave),
        );
        waves.update(31);
        const spawned = enemies.all.filter((enemy: { isAlive: boolean; variantId: string | null }) =>
          enemy.isAlive && enemy.variantId === BROADCAST_MIRROR_VARIANT_ID);
        // Three squads of 2 — the cap held, the fourth use was dropped, and every body is a
        // WRECKER or a THIEF exactly as its tape's shape said it would be.
        expect(spawned.length).toBe(6);
        expect(spawned.filter((enemy: { isWrecker: boolean }) => enemy.isWrecker).length).toBe(4);
        expect(spawned.filter((enemy: { isThief: boolean }) => enemy.isThief).length).toBe(2);
        const drained = mirror.diagnostics;
        expect(drained.pending).toEqual([]);
        expect(drained.squadsFielded).toBe(BROADCAST_MIRROR_SQUAD_CAP);
        expect(drained.bodiesFielded).toBe(6);
        expect(drained.lastFieldedWave).toBe(1);
        expect(drained.refusals.cappedSquads).toBe(1);
      } else {
        expect(mirror.isDeclared).toBe(false);
        if (admitted) {
          const view = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0] }).currentTurn().view;
          expect(view.now.broadcastMirror).toBeUndefined();
        }
      }
      expect(consoleErrors).toEqual([]);
    } finally {
      await vite?.close();
      console.error = originalError;
      console.warn = originalWarn;
      if (previousLocation === undefined) delete host.location;
      else host.location = previousLocation;
      if (previousWindow === undefined) delete host.window;
      else host.window = previousWindow;
    }
  });
}
