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
 * different rows. THE SEED RUN'S ROW IS UNCHANGED BY THIS SLICE and stays exempt.
 *
 * A9 (`:24`, RATIFIED 2026-08-20) then made a THIRD row: `e9-devils-alley` is now ADMITTED. Its
 * scheduled-relocation consumer is live in both engines (`src/systems/ScheduledRelocationSystem.ts`)
 * AND the map is won — the public-verb prover secured wave 20 on both bench seeds, twice each,
 * byte-identical (`artifacts/e9-devils-alley/summary.json`), while the idle floors terminate at
 * wave 3 (Law 2). So it carries seeds, a manifest rule and a door row; the Old Canal is the only
 * Red Fields contract still unsocketed.
 *
 * ADMISSION IS DERIVED HERE RATHER THAN LISTED, which is the shape `er01-e8-census` adopted at
 * A7: the door's own rule is `tileParams.harvestAnchors?.length !== 0` minus the exemption table
 * (`HeadlessContractSim.ts:182`), so this spec reads the same data instead of carrying a second
 * hand-maintained list that can drift from it.
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
const SEEDED = new Set(['e9-dome-basin', 'e9-seed-run', 'e9-old-canal', 'e9-devils-alley']);

/**
 * The manifest rows each contract derives, IN ORDER. Only the Seed Run declares planting and only
 * the Old Canal declares canal choices, so each row is asserted where it is declared and its
 * absence is asserted everywhere else. The order is `deriveMechanicsManifest`'s own: A10's rule is
 * pushed before A5's, which is after A8's.
 */
// RE-POINTED BY hero-move-verb (owner ruling 2026-09-06, "rider has to be able to move"):
// `hero_orders` is `deriveMechanicsManifest`'s first UNCONDITIONAL row, published on every
// contract because the MOVE_HERO contract (arrival radius, refusal vocabulary, who may hold the
// hero) belongs to the ENGINE, not to a map. The list is `rules.sort(byId)`, so it lands
// alphabetically and no other row moved. Measured on this tree, not assumed.
const EXPECTED_RULES: Record<string, string[]> = {
  'e9-dome-basin': ['build_zones', 'hero_orders'],
  'e9-seed-run': ['build_zones', 'hero_orders', 'persistent_planting'],
  'e9-devils-alley': ['build_zones', 'hero_orders', 'scheduled_relocation'],
  'e9-old-canal': ['build_zones', 'hero_orders', 'persistent_canal_choices'],
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
      const { HeadlessContractSim, CONTRACT_ADMISSION_EXEMPTIONS } =
        await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      /**
       * DERIVED, not listed: BOTH halves of the door's own rule, read off the same data it reads
       * (`HeadlessContractSim.ts:182`) — non-empty `harvestAnchors` AND absent from the exemption
       * table. Deriving only the FIRST half is a real trap this spec fell into once: `e9-seed-run`
       * authored anchors with A8 and is STILL refused, because it carries a cited exemption, so a
       * one-half derivation reports it admitted and the census reds on the truthful engine.
       */
      const admitted = (contract.tileParams.harvestAnchors?.length ?? 0) > 0
        && !(contract.id in CONTRACT_ADMISSION_EXEMPTIONS);
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

      // A9 — THE WIND, asserted where it is DECLARED and inert where it is not. Same law as the
      // caravan above: the consumer is built off the CONTRACT (twist + authored routes + authored
      // bays and stakes), never the epoch, so its three Red Fields siblings each get an UNDECLARED
      // consumer from the same call.
      const { ScheduledRelocationSystem, DEVIL_COLUMN_RADIUS, DEVIL_SWEEP_SECONDS } =
        await vite.ssrLoadModule('/src/systems/ScheduledRelocationSystem.ts');
      const wind = ScheduledRelocationSystem.create(loadContract(contract.id));

      if (contract.id === 'e9-devils-alley') {
        expect(wind.isDeclared).toBe(true);
        // THE ROUTES ARE AUTHORED DATA, in authored order — the same three `lanes.patrolRoutes`
        // the mask table publishes and `scripts/e3-mask-tables.test.mjs` pins.
        expect(wind.routeIds).toEqual(['south-devil-sweep', 'center-devil-sweep', 'north-devil-sweep']);
        // THE HOLD IS DERIVED, NOT AUTHORED: min(halfWidth, halfDepth) of the bay each stake
        // stands in. All three bays are 20x16, so every hold is exactly 8 and every stake is
        // dead centre — the hold is the circle inscribed in its own bay.
        expect(wind.anchorHolds.map(({ id, zoneId, holdRadius }: { id: string; zoneId: string; holdRadius: number }) =>
          [id, zoneId, holdRadius])).toEqual([
          ['anchor-west', 'west-anchor-bay', 8],
          ['anchor-center', 'center-anchor-bay', 8],
          ['anchor-east', 'east-anchor-bay', 8],
        ]);
        expect(wind.anchored(0, 3)).toBe(true);
        expect(wind.anchored(9, 0)).toBe(false);

        // Drive two fresh consumers over the same fixed steps: same in, same out, and the wind
        // takes the work outside the hold while the one inside it never moves.
        const drive = () => {
          const driven = ScheduledRelocationSystem.create(loadContract(contract.id));
          // BOTH pads are inside `center-anchor-bay` and inside the centre column's reach
          // (radius 4 about z = 0) — the beacon at z = 3 deliberately so, because a pad the
          // column never reaches would report zero anchored refusals for the boring reason
          // instead of the interesting one. Only the turret is outside the anchor's 8wu hold.
          const board = [
            { family: 'turret', index: 0, position: { x: 9, z: 0 }, active: true, hp: 100 },
            { family: 'sentry_beacon', index: 0, position: { x: 0, z: 3 }, active: true, hp: 100 },
          ];
          const move = (family: string, index: number, to: { x: number; z: number }) => {
            const work = board.find((entry) => entry.family === family && entry.index === index);
            if (!work) return false;
            work.position = { x: to.x, z: to.z };
            return true;
          };
          const steps = Math.ceil(DEVIL_SWEEP_SECONDS * 30) + 2;
          // Wave 1 sweeps the SOUTH route (z -26): nothing here is near it.
          for (let step = 0; step < steps; step += 1) driven.update(1 / 30, 1, board, move);
          const afterSouth = board.map(({ position }: { position: { x: number; z: number } }) => ({ ...position }));
          // Wave 2 sweeps the CENTRE route (z 0), straight through both works.
          for (let step = 0; step < steps; step += 1) driven.update(1 / 30, 2, board, move);
          return { driven, board, afterSouth };
        };
        const firstWind = drive();
        const secondWind = drive();

        expect(firstWind.afterSouth).toEqual([{ x: 9, z: 0 }, { x: 0, z: 3 }]);
        // The unanchored turret is set down at the centre sweep's authored end point, ALIVE.
        expect(firstWind.board[0]!.position).toEqual({ x: -52, z: 0 });
        // The anchored beacon never left the hold, though the column passed straight over it.
        expect(firstWind.board[1]!.position).toEqual({ x: 0, z: 3 });
        expect(firstWind.driven.relocationCount).toBe(1);
        expect(firstWind.driven.diagnostics).toMatchObject({
          declared: true,
          columnRadius: DEVIL_COLUMN_RADIUS,
          sweepSeconds: DEVIL_SWEEP_SECONDS,
          relocations: 1,
          carried: [],
          lastRelocation: {
            family: 'turret',
            index: 0,
            routeId: 'center-devil-sweep',
            wave: 2,
            from: { x: 9, z: 0 },
            to: { x: -52, z: 0 },
          },
        });
        expect(firstWind.driven.diagnostics.refusals.anchored).toBeGreaterThan(0);
        expect(firstWind.driven.diagnostics.works).toEqual([
          { family: 'sentry_beacon', index: 0, anchored: true, carried: false },
          { family: 'turret', index: 0, anchored: false, carried: false },
        ]);
        expect(JSON.stringify(secondWind.driven.simulationSnapshot))
          .toBe(JSON.stringify(firstWind.driven.simulationSnapshot));

        // THE MANIFEST ROW IS SOURCED FROM THE CONSUMER, so a row cannot drift from the gate.
        const relocationRule = mechanics.rules.find(({ id }: { id: string }) => id === 'scheduled_relocation');
        expect(relocationRule.source).toBe('ScheduledRelocationSystem.update');
        expect(relocationRule.data.routes).toEqual(wind.routeIds);
        expect(relocationRule.data.damages).toBe(false);
        expect(relocationRule.data.gatesSecure).toBe(false);
      } else {
        expect(wind.isDeclared).toBe(false);
        expect(wind.routeIds).toEqual([]);
        expect(wind.anchorHolds).toEqual([]);
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
