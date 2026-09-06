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
 * while the idle floors stayed lost at wave 4 (Law 2).
 *
 * RELAY RUSH MOVED HALFWAY ON 2026-08-20 AND THE REST OF THE WAY ON 2026-08-21, and the two-step
 * is worth keeping in the record. A5 built the interference front
 * (`src/systems/InterferenceFrontSystem.ts`), authored the map's four `harvestAnchors` and minted
 * its bench seeds — so the browser resolved it and its manifest grew an `interference_front`
 * rule — but the best measured public-verb play terminated unsecured at wave 4 of 20 and the
 * headless door refused it through a cited exemption. F-A5-1 proved the cause was AUTHORED
 * GEOMETRY and not the mechanic (the deadline was met on both seeds; the claim simply had no
 * buildable ground within 24wu), and the owner ruled it: 2026-08-21, VERBATIM, "lets follow your
 * recommendation" — a `heroStart` stake inside a relay site. With
 * `relay-ridge-command-stake` at (-25,41) both seeds now secure at wave 20 twice each
 * (`artifacts/e7-relay-rush/`, `fnv1a32:bc89348d` / `fnv1a32:b25f69b0`), through the ordinary
 * door as well as the measurement seam, while the idle floors stay lost at wave 2 (Law 2).
 *
 * **E7 IS 4/4 ADMITTED.** Every assertion below is still keyed per id rather than shared — the
 * E6 census's shape — because a set that is uniform today is exactly the one that hides the next
 * divergence.
 */
const ADMITTED = new Set(['e7-relay-valley', 'e7-dead-band', 'e7-echo-canyon', 'e7-relay-rush']);

/**
 * ADMISSION MOVE — `e7-relay-rush` JOINED THE SET ABOVE 2026-08-21, ON AN OWNER RULING, AND THE
 * THIRD CASE THIS CONSTANT ONCE HELD IS GONE WITH IT.
 *
 * For one day this file needed a set called `EXEMPT_WITH_SEEDS`, because Relay Rush was SEEDED
 * and REFUSED at the same time: authored `harvestAnchors` had minted its seeds and opened the
 * browser door, while its best measured public-verb play terminated unsecured at wave 4 of 20 and
 * put it in `CONTRACT_ADMISSION_EXEMPTIONS`. F-A5-1 named the cause — authored geometry, not the
 * mechanic — and put the fork to the owner, who ruled it (2026-08-21, VERBATIM, to the five-map
 * fork table): **"lets follow your recommendation"**, i.e. a `heroStart` stake inside a relay
 * site. `relay-ridge-command-stake` now stands at (-25,41), the centre of `relay-site-r2`, and
 * both bench seeds secure at wave 20 twice each (fnv1a32:bc89348d / fnv1a32:b25f69b0) — through
 * the ORDINARY door as well as the measurement seam, byte-identical either way.
 *
 * The set is kept as an EMPTY one rather than deleted, because the state it names is real and
 * `e9-seed-run` and `e9-old-canal` may yet enter it: a map whose data is authored and whose
 * mechanic runs, held out of the door only by a measured ceiling. Emptying it is the ledger of
 * the reversal; deleting it would erase the shape.
 */
const EXEMPT_WITH_SEEDS = new Set<string>([]);

const EXPECTED_ACTIVE_CONTRACT: Record<string, string> = {
  'e7-relay-valley': 'e7-relay-valley',
  'e7-echo-canyon': 'e7-echo-canyon',
  'e7-dead-band': 'e7-dead-band',
  // A5: authored anchors moved this one out of `activeContractSelection`'s
  // `harvestAnchors?.length === 0` -> 'unavailable-contract' branch (`ContractFamilies.ts:1336`,
  // RE-MEASURED 2026-08-21 — the F-2125-1 law pointer for the same gate; it read `:1329` when this
  // line was written and main has moved 234 commits since). Both doors now agree: the browser
  // resolves the map AND `HeadlessContractSim` constructs it.
  'e7-relay-rush': 'e7-relay-rush',
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
  'e7-relay-valley': ['build_zones', 'contract_hero_grit'], // 2026-09-06 relay-valley-winnable: the claim grit is a published rule (F-RVW-3)
  'e7-echo-canyon': ['broadcast_mirror', 'build_zones'],
  'e7-dead-band': ['build_zones', 'signal_suppression'],
  // A5: sourced FROM `InterferenceFrontSystem`, so the row cannot promise a deadline the run
  // does not enforce. Relay Rush is the only Signal contract that declares the front.
  'e7-relay-rush': ['build_zones', 'interference_front'],
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

      // A5 splits what used to be one question into two: a seed set is minted by AUTHORING the
      // map's data, while admission is decided by whether it can be WON. Relay Rush has the first
      // and not the second.
      if (admitted || EXEMPT_WITH_SEEDS.has(contract.id)) expect((benchSeeds as Record<string, string[]>)[contract.id]).toEqual(seeds);
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
      // A5 — THE INTERFERENCE FRONT, ASSERTED BIDIRECTIONALLY for the same reason A4's row is:
      // Relay Rush is the one Signal contract that carries `twist.interferenceFront`, so it is
      // the one whose manifest grows an `interference_front` rule, and the field must not leak
      // onto a contract that never asked for it. The run itself is proven by the public-verb
      // prover (`artifacts/e7-relay-rush/`), never here — this census asserts the DECLARATION and,
      // since 2026-08-21, the owner-ruled stake that turned the refusal into an admission.
      if (contract.id === 'e7-relay-rush') {
        const { InterferenceFrontSystem } = await vite.ssrLoadModule('/src/systems/InterferenceFrontSystem.ts');
        const consumer = InterferenceFrontSystem.create(contract);
        expect(consumer.isDeclared).toBe(true);
        // The placeholder `"N"` resolved to the sheet's ratified 3 of 4 (A5 DEFAULTS).
        expect(consumer.relayTarget).toBe(3);
        expect(consumer.deadlineFront).toBe(3);
        // Still false AT RUN START, and that is the objective doing its job: the latch opens only
        // when the deadline front finds three relays lit. Admission did not weaken it.
        expect(consumer.objectiveAllowsSecure).toBe(false);
        expect(consumer.diagnostics.sites.map(({ id }: { id: string }) => id))
          .toEqual(['relay-site-r1', 'relay-site-r2', 'relay-site-r3', 'relay-site-r4']);
        const rule = mechanics.rules.find(({ id }: { id: string }) => id === 'interference_front');
        // Sourced FROM the consumer: the manifest row and the gate cannot disagree.
        expect(rule.source).toBe('InterferenceFrontSystem.refuse');
        expect(rule.data.relayTarget).toBe(consumer.relayTarget);
        expect(rule.data.cadenceSeconds).toBe(90);
        expect(rule.data.crossingSeconds).toBe(20);
        // The door DATA is authored and the door is now OPEN: four anchors so the map is playable,
        // and the owner-ruled stake that made it winnable.
        expect(contract.tileParams.harvestAnchors).toHaveLength(4);
        // THE STAKE, PINNED AT ITS EXACT COORDINATES, because it is owner-ruled data and a silent
        // drift would quietly un-win the map. (-25,41) is the CENTRE of `relay-site-r2`: the only
        // point from which a 10x10 box sits wholly inside `Balance.beacon.range` of 8.
        const stake = contract.tileParams.stakeMarkers?.find(({ heroStart }: { heroStart: boolean }) => heroStart);
        expect(stake).toMatchObject({ id: 'relay-ridge-command-stake', x: -25, z: 41, heroStart: true });
        const home = contract.tileParams.buildZones.find(({ id }: { id: string }) => id === 'relay-site-r2');
        expect(stake?.x).toBe(((home?.minX ?? NaN) + (home?.maxX ?? NaN)) / 2);
        expect(stake?.z).toBe(((home?.minZ ?? NaN) + (home?.maxZ ?? NaN)) / 2);
        // And the exemption is GONE, asserted from source rather than believed.
        const { CONTRACT_ADMISSION_EXEMPTIONS } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
        expect(CONTRACT_ADMISSION_EXEMPTIONS['e7-relay-rush']).toBeUndefined();
      } else {
        expect(mechanics.rules.some(({ id }: { id: string }) => id === 'interference_front')).toBe(false);
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
