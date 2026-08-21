import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import redfields from '../assets/contracts/epoch-9-redfields/contracts.json' with { type: 'json' };

/**
 * PER-ID TRUTH, because the four Red Fields contracts stopped being the same story on 2026-08-20.
 * A10 (2026-08-21) made that shape pay for itself again: `e9-old-canal` now has a LIVE consumer
 * (`src/systems/CanalChoiceSystem.ts` — three permanent verdicts, the derived flow, the ground
 * veto and the objective latch) and still does not secure, so it joins the Seed Run as an
 * ADMISSION-EXEMPT contract rather than an unsocketed one. Its `engineDependencies` row survives
 * with its `dep` and `missing` status untouched and its DESCRIPTION rewritten to the truth: the
 * schema has no status but `missing`, and `DECLARED_INERT_PATHS` obliges a non-empty list while
 * `twist.persistentCanalChoices` is declared (F-A10-2). Devil's Alley is unchanged.
 * A8 (`specs/agent-play/door-completion-sheet.md:22`) BUILT the Seed Run's consumer: the caravan,
 * the three planting grounds, the permanent green and the objective latch are all live in both
 * engines. What it did NOT do is win the map — the best public-verb play measured
 * (`artifacts/e9-seed-run/`) terminated unsecured at waves 17/16 against secureWave 20 — so the
 * Seed Run is now an ADMISSION-EXEMPT contract rather than an unsocketed one, and those are two
 * different rows. Devil's Alley and the Old Canal are unchanged: still no consumer at all.
 */
const SIGNATURE_GAPS: Record<string, { dependency?: string; twist?: string }> = {
  'e9-dome-basin': {},
  'e9-seed-run': { dependency: 'persistent-planting-consumer', twist: 'persistentPlanting' },
  'e9-devils-alley': { dependency: 'scheduled-relocation-consumer', twist: 'scheduledRelocation' },
  'e9-old-canal': { dependency: 'persistent-canal-choice-consumer', twist: 'persistentCanalChoices' },
};

/**
 * Which contracts carry bench seeds. The Seed Run minted `-01`/`-02` with its build (A8) and KEEPS
 * them while exempt — the same shape `e2-incline` and `e6-showroom` carry: seeded, measured, and
 * refused by the door until it secures. Seeds are the comparability unit, not an admission claim.
 */
const SEEDED = new Set(['e9-dome-basin', 'e9-seed-run', 'e9-old-canal']);

/**
 * The manifest rows each contract derives, IN ORDER. Only the Seed Run declares planting and only
 * the Old Canal declares canal choices, so each row is asserted where it is declared and its
 * absence is asserted everywhere else. The order is `deriveMechanicsManifest`'s own: A10's rule is
 * pushed before A5's, which is after A8's.
 */
const EXPECTED_RULES: Record<string, string[]> = {
  'e9-dome-basin': ['build_zones'],
  'e9-seed-run': ['build_zones', 'persistent_planting'],
  'e9-devils-alley': ['build_zones'],
  'e9-old-canal': ['build_zones', 'persistent_canal_choices'],
};

for (const contract of redfields.contracts) {
  test(`${contract.id} census rejects the unsocketed Red Fields mechanic`, async () => {
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
      const gap = SIGNATURE_GAPS[contract.id]!;
      const admitted = contract.id === 'e9-dome-basin';
      const seeds = [`${contract.id}-01`, `${contract.id}-02`];
      if (SEEDED.has(contract.id)) expect((benchSeeds as Record<string, string[]>)[contract.id]).toEqual(seeds);
      else expect((benchSeeds as Record<string, string[]>)[contract.id]).toBeUndefined();
      if (gap.dependency) {
        expect(contract.tileParams.engineDependencies).toEqual([
          expect.objectContaining({ dep: gap.dependency, status: 'missing' }),
        ]);
        expect(Object.hasOwn(contract.twist, gap.twist!)).toBe(true);
      } else {
        expect('engineDependencies' in contract.tileParams).toBe(false);
        expect(contract.tileParams.stakeMarkers.map(({ id }) => id)).toEqual([
          'canal-stage-c1',
          'canal-stage-c2',
          'canal-stage-c3',
        ]);
      }

      vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
      const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
      const { EnemyPool } = await vite.ssrLoadModule('/src/entities/pools.ts');
      const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
      const { Economy } = await vite.ssrLoadModule('/src/game/Economy.ts');
      const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
      const { E9ArsenalSocket } = await vite.ssrLoadModule('/src/sim/E9ArsenalSocket.ts');
      const { E9CanalSocket } = await vite.ssrLoadModule('/src/sim/E9CanalSocket.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const mechanics = deriveMechanicsManifest(contract.id);

      expect(mechanics.interactables).toEqual([]);
      expect(mechanics.rules.map(({ id }: { id: string }) => id)).toEqual(EXPECTED_RULES[contract.id]);
      const driveArsenal = (hasResearch: boolean) => {
        const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'er01-e9-arsenal-probe' });
        const enemies = new EnemyPool();
        const socket = E9ArsenalSocket.create(
          loadContract(contract.id),
          sim.combat,
          sim.events,
          enemies,
          () => sim.hero.group.position,
          (index: number) => sim.build.turretPosition(index),
          () => hasResearch,
        );
        expect(socket).not.toBeNull();
        let chargeDuringStorm = 0;
        for (let step = 1; step <= 180; step += 1) {
          socket.advance(1 / 30, step / 30);
          if (step === 120) chargeDuringStorm = socket.diagnostics.weather.charge;
        }
        return { sim, enemies, socket, chargeDuringStorm };
      };
      const locked = driveArsenal(false);
      expect(locked.socket.diagnostics.items).toEqual([]);
      expect(locked.socket.deployFence()).toBe(false);

      const firstArsenal = driveArsenal(true);
      const secondArsenal = driveArsenal(true);
      for (const driven of [firstArsenal, secondArsenal]) {
        expect(driven.chargeDuringStorm).toBeGreaterThan(0);
        expect(driven.chargeDuringStorm).toBeLessThan(Balance.e9Arsenal.weather.chargeCapacity);
        expect(driven.socket.diagnostics.items).toEqual([
          'stormDraw',
          'stormLance',
          'stormFence',
          'terraformCannon',
        ]);
        expect(driven.socket.diagnostics.weather).toMatchObject({
          phase: 'storm',
          charge: Balance.e9Arsenal.weather.chargeCapacity,
          capacity: Balance.e9Arsenal.weather.chargeCapacity,
        });
        expect(driven.socket.deployFence()).toBe(true);
        const enemy = driven.enemies.spawn(driven.sim.hero.group.position.clone());
        expect(enemy).not.toBeNull();
        driven.socket.advance(1 / 30, 181 / 30);
        expect(driven.socket.movementMultiplier(enemy)).toBe(Balance.e9Arsenal.stormFence.slowMultiplier);
        expect(driven.socket.diagnostics).toMatchObject({
          fenceDeployments: 1,
          refusedConsumers: ['CombatSystem.update', 'EnemyPool.update'],
          combatTicksRefused: 181,
          enemyIntegrationTicksRefused: 181,
          fires: { stormDraw: 0, stormLance: 0, terraformCannon: 0 },
          outcomes: [],
        });
        expect(driven.socket.diagnostics.pushedDistance).toBeGreaterThan(0);
        expect(driven.socket.diagnostics.denialTicks).toBeGreaterThan(0);
      }
      expect(JSON.stringify(secondArsenal.socket.simulationSnapshot)).toBe(
        JSON.stringify(firstArsenal.socket.simulationSnapshot),
      );
      expect(firstArsenal.socket.diagnostics.combatTicksRefused).toBeGreaterThan(0);
      expect(firstArsenal.socket.diagnostics.enemyIntegrationTicksRefused).toBeGreaterThan(0);
      for (const control of ['e1-dry-gulch', 'e5-deepwater-claim']) {
        expect(E9ArsenalSocket.create(
          loadContract(control),
          firstArsenal.sim.combat,
          firstArsenal.sim.events,
          firstArsenal.enemies,
          () => firstArsenal.sim.hero.group.position,
          (index: number) => firstArsenal.sim.build.turretPosition(index),
          () => true,
        )).toBeNull();
      }
      if (contract.id === 'e9-dome-basin') {
        const drive = () => {
          const sim = new HeadlessContractSim({ contractId: 'the-claim', seed: 'er01-e9-canal-probe' });
          const socket = E9CanalSocket.create(loadContract(contract.id), new EnemyPool(), new Economy());
          expect(socket).not.toBeNull();
          const initialStage = socket.diagnostics.stage;
          const actor = { position: sim.hero.group.position, speed: 0 };
          let ticks = 0;
          const advance = (steps: number) => {
            for (let step = 0; step < steps; step += 1) {
              ticks += 1;
              socket.advance(1 / 30, ticks / 30, [actor]);
            }
          };
          const stages: number[] = [];
          for (const gate of socket.diagnostics.gates) {
            actor.position.set(gate.x, 0, gate.z);
            advance(45);
            stages.push(socket.diagnostics.stage);
          }
          const node = socket.diagnostics.quarry.nodes[0];
          actor.position.set(node.x, 0, node.z);
          advance(30);
          for (let step = 0; step < 45; step += 1) {
            const position = socket.diagnostics.dustDevil.position;
            if (position) actor.position.set(position.x, 0, position.z);
            advance(1);
          }
          return { socket, initialStage, stages, ticks };
        };
        const first = drive();
        const second = drive();
        const diagnostics = first.socket.diagnostics;

        expect([first.initialStage, second.initialStage]).toEqual([0, 0]);
        expect(first.stages).toEqual([1, 2, 3]);
        expect(diagnostics).toMatchObject({
          stage: 3,
          canal: { wet: true },
          quarry: { harvested: 1 },
          dustDevil: { phase: 'storm' },
          refusedConsumers: ['OldDiggerBossSystem', 'E9ArsenalSystem'],
        });
        expect(diagnostics.receipts.map(({ id }: { id: string }) => id)).toContain('e9-canal-quarry-payout-ice-pack-1');
        expect(diagnostics.dustDevil.shoves).toBeGreaterThan(0);
        expect(diagnostics.dustDevil.pushedDistance).toBeGreaterThan(0);
        expect(first.ticks).toBe(second.ticks);
        expect(JSON.stringify(second.socket.simulationSnapshot)).toBe(JSON.stringify(first.socket.simulationSnapshot));
        expect(diagnostics.bossStepsRefused).toBeGreaterThan(0);
        expect(diagnostics.arsenalStepsRefused).toBeGreaterThan(0);
        expect(E9CanalSocket.create(loadContract('e1-dry-gulch'), new EnemyPool(), new Economy())).toBeNull();
      } else {
        expect(E9CanalSocket.create(loadContract(contract.id), new EnemyPool(), new Economy())).toBeNull();
      }
      // A8 — THE SEED CARAVAN, asserted where it is DECLARED and refused where it is not. The
      // consumer is built off the CONTRACT (twist + authored zones + authored stakes), never the
      // epoch, so its three Red Fields siblings must each get a null from the same call.
      const { SeedCaravanSystem, SEED_CARAVAN_MAX_HP, SEED_CARAVAN_PLANT_COST_RATIO } =
        await vite.ssrLoadModule('/src/systems/SeedCaravanSystem.ts');
      const tileState = await vite.ssrLoadModule('/src/game/TileStateStore.ts');
      const { TileStateStore } = tileState;
      // A REAL BACKING MAP, not a null sink: A10 asserts the STAGE -> COMMIT -> INHERIT cycle, and
      // a store that swallows writes would let a broken persistence path pass.
      const emptyStore = () => {
        const cells = new Map<string, string>();
        return new TileStateStore({
          getItem: (key: string) => cells.get(key) ?? null,
          setItem: (key: string, value: string) => void cells.set(key, value),
          removeItem: (key: string) => void cells.delete(key),
        });
      };
      const caravan = SeedCaravanSystem.create(loadContract(contract.id), emptyStore());

      if (contract.id === 'e9-seed-run') {
        expect(caravan).not.toBeNull();
        const diagnostics = caravan.diagnostics;
        // THE ROUTE IS AUTHORED DATA, not a constant in the consumer: the five buildZone centres,
        // in authored order — the same five points the mask table publishes as `caravanRoute` and
        // `scripts/e3-mask-tables.test.mjs:352` already pins.
        expect(diagnostics.route).toEqual([
          { x: 0, z: -48 }, { x: -34, z: -21 }, { x: 0, z: 3 }, { x: 34, z: 27 }, { x: 0, z: 48 },
        ]);
        expect(diagnostics.grounds.map(({ id, zoneId }: { id: string; zoneId: string }) => [id, zoneId])).toEqual([
          ['plant-west-waypoint', 'west-green-waypoint'],
          ['plant-center-waypoint', 'center-green-waypoint'],
          ['plant-east-waypoint', 'east-green-waypoint'],
        ]);
        expect(diagnostics).toMatchObject({
          declared: true,
          state: 'moving',
          hp: SEED_CARAVAN_MAX_HP,
          maxHp: SEED_CARAVAN_MAX_HP,
          arrived: false,
          plantedThisRun: [],
          plantedBefore: [],
          atGround: null,
        });

        // THE PLANT IS REFUSED UNTIL BOTH BODIES ARE AT THE GROUND, and each refusal is COUNTED.
        const at = (x: number, z: number) => ({ x, z, distanceTo: () => 0 } as never);
        expect(caravan.tryPlant(at(0, 3)).ok).toBe(false);
        expect(caravan.diagnostics.refusals.caravanAway).toBe(1);
        expect(caravan.tryPlant(at(60, 60)).ok).toBe(false);
        expect(caravan.diagnostics.refusals.outOfReach).toBe(1);

        // Drive the crossing at the fixed step, twice, from two fresh consumers: same in, same out.
        const drive = () => {
          const driven = SeedCaravanSystem.create(loadContract(contract.id), emptyStore());
          const seen: string[] = [];
          for (let step = 0; step < 12_000 && !driven.diagnostics.arrived; step += 1) {
            driven.update(1 / 30, []);
            const ground = driven.diagnostics.atGround;
            if (ground && seen.at(-1) !== ground) seen.push(ground);
          }
          return { driven, seen };
        };
        const first = drive();
        const second = drive();
        expect(first.seen).toEqual(['plant-west-waypoint', 'plant-center-waypoint', 'plant-east-waypoint']);
        expect(second.seen).toEqual(first.seen);
        expect(JSON.stringify(second.driven.simulationSnapshot)).toBe(JSON.stringify(first.driven.simulationSnapshot));
        // THE LATCH: an empty road costs the caravan nothing, and arriving is what opens the secure.
        expect(first.driven.diagnostics).toMatchObject({ state: 'arrived', arrived: true, progress: 1, hp: SEED_CARAVAN_MAX_HP });
        expect(first.driven.objectiveComplete).toBe(true);
        expect(first.driven.objectiveLost).toBe(false);

        // THE MANIFEST ROW IS SOURCED FROM THE CONSUMER, so a row cannot drift from the gate.
        const rule = mechanics.rules.find(({ id }: { id: string }) => id === 'persistent_planting');
        expect(rule.source).toBe('SeedCaravanSystem.tryPlant');
        expect(rule.data.grounds).toEqual(diagnostics.grounds.map(({ id }: { id: string }) => id));
        expect(rule.data.plantCostHp).toBe(Math.round(SEED_CARAVAN_MAX_HP * SEED_CARAVAN_PLANT_COST_RATIO));
      } else {
        expect(caravan).toBeNull();
      }

      // A10 — THE OLD CANAL'S THREE VERDICTS, asserted where they are DECLARED and refused where
      // they are not. Same law as the caravan above: the consumer is built off the CONTRACT (twist
      // + authored zones + authored stakes), never the epoch, so its three Red Fields siblings must
      // each get a null from the same call.
      const { CanalChoiceSystem, CANAL_DECISION_REACH } =
        await vite.ssrLoadModule('/src/systems/CanalChoiceSystem.ts');
      const canal = CanalChoiceSystem.create(loadContract(contract.id), emptyStore());

      if (contract.id === 'e9-old-canal') {
        expect(canal).not.toBeNull();
        // THE SEGMENTS ARE AUTHORED DATA, not constants in the consumer: each is the buildZone that
        // CONTAINS an authored stake, which on this tile is exactly the three canal boxes. The two
        // yards hold no stake and are therefore not segments and can never be decided.
        expect(canal.diagnostics.segments.map(({ id, zoneId }: { id: string; zoneId: string }) => [id, zoneId])).toEqual([
          ['decide-segment-a', 'old-canal-segment-a'],
          ['decide-segment-b', 'old-canal-segment-b'],
          ['decide-segment-c', 'old-canal-segment-c'],
        ]);
        expect(canal.diagnostics).toMatchObject({
          declared: true,
          decided: 0,
          total: 3,
          allDecided: false,
          flow: [],
          openGround: [],
          decidedThisRun: [],
          decidedBefore: [],
        });

        // THE LATCH: a fresh canal pins the run unsecurable, and every verdict is REFUSED out of
        // reach and COUNTED. `objectiveAllowsSecure` is the only thing the two engines' gates read.
        expect(canal.objectiveAllowsSecure).toBe(false);
        // (0,60) is the north outflow yard — a surveyed build ground with NO stake in it, which
        // is exactly why it is not a segment and can never be decided.
        expect(canal.decide({ x: 0, z: 60 }, 'redig').ok).toBe(false);
        expect(canal.diagnostics.refusals.outOfReach).toBe(1);

        // AN UNDECIDED BAND TAKES NO WORKS; a BACKFILLED one does; a RE-DUG one never will again.
        expect(canal.worksAllowed(2, 0)).toBe(false);
        expect(canal.worksAllowed(0, 30)).toBe(true);
        expect(canal.decide({ x: 2, z: 0 }, 'demolish')).toMatchObject({ ok: true, segmentId: 'decide-segment-b', choice: 'demolish' });
        expect(canal.worksAllowed(2, 0)).toBe(true);
        expect(canal.isWet(2, 0)).toBe(false);
        // ONE-TIME, FOR THE LIFE OF THE PROFILE: the second verdict on the same ground is refused.
        expect(canal.decide({ x: 2, z: 0 }, 'redig').ok).toBe(false);
        expect(canal.diagnostics.refusals.alreadyDecided).toBe(1);

        expect(canal.decide({ x: -30, z: -23 }, 'redig')).toMatchObject({ ok: true, choice: 'redig' });
        expect(canal.worksAllowed(-30, -23)).toBe(false);
        expect(canal.isWet(-30, -23)).toBe(true);
        expect(canal.objectiveAllowsSecure).toBe(false);
        expect(canal.decide({ x: 32, z: 23 }, 'redig').ok).toBe(true);
        // ALL THREE DECIDED IS THE OBJECTIVE, and the flow is the combined verdicts in authored order.
        expect(canal.diagnostics).toMatchObject({
          decided: 3,
          allDecided: true,
          flow: ['decide-segment-a', 'decide-segment-c'],
          openGround: ['decide-segment-b'],
        });
        expect(canal.objectiveAllowsSecure).toBe(true);

        // THE VERDICTS ARE STAGED, NEVER WRITTEN MID-RUN — TP-02's persistence law, unchanged.
        // A second consumer built on the SAME store must still see three undecided segments,
        // because nothing has reached the profile until the run-end commit.
        const sameStore = emptyStore();
        const staging = CanalChoiceSystem.create(loadContract(contract.id), sameStore);
        expect(staging.decide({ x: 2, z: 0 }, 'redig').ok).toBe(true);
        expect(CanalChoiceSystem.create(loadContract(contract.id), sameStore).diagnostics.decided).toBe(0);
        expect(sameStore.commitAtRunEnd()).toBe(true);
        const inheritor = CanalChoiceSystem.create(loadContract(contract.id), sameStore);
        expect(inheritor.diagnostics).toMatchObject({
          decided: 1,
          decidedBefore: ['decide-segment-b'],
          decidedThisRun: [],
          flow: ['decide-segment-b'],
        });
        expect(inheritor.decide({ x: 2, z: 0 }, 'demolish').ok).toBe(false);

        // A RE-DUG BAND IS BORN AS A NO-SPAWN ZONE — the inscribed disc of the authored rectangle,
        // on the SAME sim substrate TP-02 and A8 use. A demolished one adds nothing at birth.
        const born = tileState.applyAtBirth(sameStore.readSnapshot(contract.id).entries, loadContract(contract.id).tileParams);
        expect(born.noSpawnZones).toEqual([{ x: 2, z: 0, radius: 8 }]);

        // THE MANIFEST ROW IS SOURCED FROM THE CONSUMER, so a row cannot drift from the gate.
        const rule = mechanics.rules.find(({ id }: { id: string }) => id === 'persistent_canal_choices');
        expect(rule.source).toBe('CanalChoiceSystem.decide');
        expect(rule.data.segments).toEqual(['decide-segment-a', 'decide-segment-b', 'decide-segment-c']);
        expect(rule.data.decisionReach).toBe(CANAL_DECISION_REACH);
        expect(rule.data.verbs).toEqual(['CONTEXT_ACTION action=redig', 'CONTEXT_ACTION action=backfill']);
      } else {
        expect(canal).toBeNull();
      }

      for (const seed of seeds) {
        if (admitted) expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).not.toThrow();
        else {
          expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(
            new RegExp(`AP-07 supports only .*received ${contract.id}`),
          );
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
