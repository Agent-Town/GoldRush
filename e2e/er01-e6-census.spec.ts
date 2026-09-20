import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import atomic from '../assets/contracts/epoch-6-atomic/contracts.json' with { type: 'json' };

// Post-socket rule lists. `wrangle_*` appears on every Atomic contract because the browser
// enables WrangleSystem for the whole epoch (Game.ts:646); the two tile rules are Glow Mesa's.
// RE-POINTED BY hero-move-verb (owner ruling 2026-09-06, "rider has to be able to move"):
// `hero_orders` is `deriveMechanicsManifest`'s first UNCONDITIONAL row, published on every
// contract because the MOVE_HERO contract (arrival radius, refusal vocabulary, who may hold the
// hero) belongs to the ENGINE, not to a map. The list is `rules.sort(byId)`, so it lands
// alphabetically and no other row moved. Measured on this tree, not assumed.
const EXPECTED_RULES: Record<string, string[]> = {
  'e6-glow-mesa': [
    'baron', 'build_zones', 'decay_field_windows', 'hero_orders', 'night_vein_ring',
    'wrangle_capture', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down',
  ],
  'e6-showroom': ['build_zones', 'hero_orders', 'showroom_capture_quota', 'wrangle_capture', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down'],
  'e6-half-life-hollow': ['build_zones', 'hero_orders', 'hollow_crossing', 'wrangle_capture', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down'],
  'e6-picnic': ['build_zones', 'hero_orders', 'three_stake_hold', 'wrangle_capture', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down'],
};

/**
 * THE ADMITTED SET (2026-08-20, `fix-e6-homemaker-headless-socket`). The Homemaker socket landed:
 * `HomemakerBossSystem` constructs headless behind four `typeof document` guards, the boss is built
 * through its own factory against a real `GoldPickupPool`, and both bench seeds SECURE under public
 * verbs alone — HARVEST the seam ring, BUILD a turret on the pad the hero's own rig cannot reach,
 * CAPTURE the wound-down machines, rebuild what the Homemaker unbuilds, break VAC then CORE.
 * Seed 01 secures at wave 12 (`fnv1a32:e66807f6`), seed 02 at wave 10 (`fnv1a32:da62f7b9`).
 *
 * PROPOSAL: Showroom requires 6 captures before secure, a conservative minimum with wide margin
 * under the cap-fix evidence's competent aimed loop. The latch makes idle
 * survival honest without changing density or difficulty; admission still depends on two public-
 * verb secures per seed. The other Atomic contracts remain independently refused until proven.
 *
 * Half-Life Hollow is also admitted now: its authored crossing is consumed in both engines and
 * both bench seeds secure twice through public verbs.
 *
 * THE PICNIC IS ADMITTED (2026-08-22), AND IT TOOK TWO OWNER RULINGS, A YEAR APART IN SPIRIT.
 * The first (2026-08-21, verbatim: "picnic - no, just standing there should not win") built the
 * contest predicate: a stake's disc is held by a STANDING STRUCTURE inside it, or by a hero that
 * has dealt damage in the last `PICNIC_ACTIVE_DEFENSE_SECONDS`. Correct, and not enough — all three
 * `stakeMarkers` carried `heroStart: true`, so the hero opened the run standing in one of the three
 * discs, and the headless hero auto-fires with no policy term in its gate
 * (`HeadlessContractSim.ts:480`). Its own stake could never fall, the loss could never complete, and
 * `--policy=idle` SECURED both bench seeds at wave 20 (`fnv1a32:b9f476a6` / `fnv1a32:612de94b`,
 * `calls: 0`) — a Law-2 refusal, measured and filed rather than papered over
 * (`reviews/e6-picnic-admission.md`, F-E6PA-1).
 *
 * The second ruling (2026-08-22, verbatim: "flip the stakes") cured it in contract DATA alone: all
 * three sandwiches now carry `heroStart: false`, so the hero starts at the engine default (0,12) —
 * inside `mesa-meadow`, outside every disc — and the ruled pressure reaches all three stakes.
 *   · idle now LOSES, by stakes-all-lost with the hero untouched: wave 2 `fnv1a32:c26f77d5`,
 *     wave 1 `fnv1a32:a649be29`, each repeated identical. Law 2 holds.
 *   · the public-verb prover SECURES both bench seeds twice at wave 20 — fence each live disc with
 *     a 10-gold palisade, then spend to the turret cap, CAPTURE the wound-down machines:
 *     `fnv1a32:b55e6ff4` (607 kills) / `fnv1a32:44f0f3dc` (690 kills).
 * The opening rush takes two sandwiches on both seeds; the rider holds the third to wave 20, which
 * is exactly what the authored secure rule asks for ("at-least-one-stake-held-at-default-secure-
 * wave"). Only the Showroom remains refused.
 */
const ADMITTED = new Set(['e6-glow-mesa', 'e6-half-life-hollow', 'e6-picnic']);

// Each refused Atomic contract declares the era socket it is missing (AP-11 engineDependencies
// mandate). An ADMITTED contract must declare NONE — a shipped "missing consumer" on a map the door
// serves is an agent-facing lie, which is why the Picnic's row left this table on admission
// (its consumer, `PicnicHoldSystem`, has been live in both engines since `afbda29bc`).
const EXPECTED_DEPENDENCY: Record<string, string> = {
  'e6-glow-mesa': 'glow-mesa-contract-consumers',
  'e6-showroom': 'atomic-wrangle-consumer',
};

for (const contract of atomic.contracts) {
  test(`${contract.id} census admission is explicit`, async () => {
    test.setTimeout(60_000);
    const seeds = (benchSeeds as Record<string, string[]>)[contract.id]!;
    const admitted = ADMITTED.has(contract.id);
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
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const { AtomicSocket } = await vite.ssrLoadModule('/src/sim/AtomicSocket.ts');
      const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
      const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
      const { EventBus } = await vite.ssrLoadModule('/src/core/EventBus.ts');
      const { Economy } = await vite.ssrLoadModule('/src/game/Economy.ts');
      const { EnemyPool } = await vite.ssrLoadModule('/src/entities/pools.ts');
      const mechanics = deriveMechanicsManifest(contract);

      expect(seeds).toEqual([`${contract.id}-01`, `${contract.id}-02`]);
      if (EXPECTED_DEPENDENCY[contract.id] === undefined) expect(contract.tileParams.engineDependencies).toBeUndefined();
      else {
        expect(contract.tileParams.engineDependencies).toEqual([
          expect.objectContaining({ dep: EXPECTED_DEPENDENCY[contract.id], status: 'missing' }),
        ]);
        expect(contract.tileParams.engineDependencies![0]!.description.trim()).not.toEqual('');
      }
      expect(contract.twist.enemyRoster.some(({ id }) => id === 'feral_toaster' || id === 'lawn_shepherd')).toBe(true);
      expect(mechanics.interactables).toEqual([]);
      expect(mechanics.rules.map(({ id }: { id: string }) => id)).toEqual(EXPECTED_RULES[contract.id]);

      // The socket is REAL: it constructs for this contract, and it is epoch-gated, not
      // contract-gated — the same test the browser applies at Game.ts:646.
      const events = new EventBus();
      const enemies = new EnemyPool();
      const socket = AtomicSocket.create(loadContract(contract.id), events, enemies, new Economy());
      expect(socket).not.toBeNull();
      expect(socket.diagnostics.epochId).toBe('epoch-6-atomic');
      expect(socket.diagnostics.wrangle.enabled).toBe(true);
      expect(AtomicSocket.create(loadContract('e1-dry-gulch'), new EventBus(), new EnemyPool(), new Economy())).toBeNull();

      // F-ER01-E6-5, demonstrated on real objects rather than asserted in prose.
      // Spawn the machines this contract's roster carries, wind them down, and show the board
      // fills with enemies that can be neither fought nor cleared.
      const machines = ['feral_toaster', 'lawn_shepherd']
        .filter((id) => contract.twist.enemyRoster.some((entry) => entry.id === id));
      // Borrow a vector from the pool itself: importing `three` into the spec loads a SECOND
      // copy of the library, and its console warning reds the zero-console assertion below.
      const at = (x: number) => enemies.all[0].position.clone().set(x, Balance.enemy.groundY, 0);
      const spawned = machines.map((variantId, index) => enemies.spawn(at(index * 4), { variantId }));
      expect(spawned.every(Boolean)).toBe(true);
      expect(spawned.every((enemy) => socket.isHostile(enemy))).toBe(true);

      const windDownFrames = Math.round(Balance.wrangle.windDownSeconds / (1 / 30)) + 30;
      for (let frame = 0; frame < windDownFrames; frame += 1) {
        socket.tickDecay();
        socket.updateWrangle(1 / 30, frame / 30);
      }

      const active = socket.diagnostics.wrangle.active;
      expect(active.map(({ variantId }: { variantId: string }) => variantId).sort()).toEqual([...machines].sort());
      expect(active.every(({ state }: { state: string }) => state === 'exhausted')).toBe(true);
      // Exhausted: harmless to the hero AND immune to it (Game.ts:536 and :2606 share the
      // predicate), and still alive — but as of the owner's 2026-08-20 cap ruling they no
      // longer hold a spawn slot against Balance.waves.aliveCap. `exhaustedCount` is the ONE
      // number both engines subtract (WaveSystem's `capExemptCount` seat), so counting it here
      // pins the exemption at the same place the census pins the rest of the consumer.
      expect(spawned.every((enemy) => socket.isHostile(enemy))).toBe(false);
      expect(spawned.every((enemy) => enemy.isAlive)).toBe(true);
      expect(socket.exhaustedCount()).toBe(spawned.length);
      expect(spawned.every((enemy) => socket.movementMultiplier(enemy) === Balance.wrangle.exhaustedSpeedMultiplier)).toBe(true);
      // AP-16-7: the agent-surface lever now closes the consumer loop without changing its law.
      expect(socket.diagnostics.wrangle.pen.total).toBe(0);
      expect(socket.diagnostics.captureLever).toBe('CAPTURE');
      expect(socket.capture(spawned[0].position)).toBe(true);
      expect(socket.diagnostics.wrangle.pen.total).toBe(1);
      if (contract.id === 'e6-showroom') {
        expect(socket.diagnostics.showroomObjective).toMatchObject({ captures: 1, quota: 6, complete: false });
        expect(socket.objectiveAllowsSecure).toBe(false);
      } else {
        expect(socket.diagnostics.showroomObjective).toBeUndefined();
        expect(socket.objectiveAllowsSecure).toBe(true);
      }

      // The manifest must keep saying so, in the consumer's own numbers.
      const captureRule = mechanics.rules.find(({ id }: { id: string }) => id === 'wrangle_capture');
      expect(captureRule.data.aliveCap).toBe(Balance.waves.aliveCap);
      expect(captureRule.data.consumerLever).toBe('WrangleSystem.tryCapture');
      if (contract.id === 'e6-showroom') {
        expect(mechanics.rules.find(({ id }: { id: string }) => id === 'showroom_capture_quota')).toMatchObject({
          source: 'ShowroomCaptureObjective',
          data: { captureQuota: 6, consumerLever: 'WrangleSystem.tryCapture' },
        });
      }
      expect(mechanics.buildables).toEqual(expect.any(Array));

      // THE DOOR ITSELF. Glow Mesa boots on its own bench seeds now that its boss resolves; the
      // other three are still refused BY NAME, which is what keeps the refusal honest rather than
      // silent. (The admitted contract's `engineDependencies` prose above — "the headless sim
      // composes none" — is now stale for all three of its consumers, but the declaration lives in
      // contract JSON outside this slice's firewall and is filed as a finding, not edited here.)
      for (const seed of seeds) {
        if (admitted) expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).not.toThrow();
        else {
          expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(
            new RegExp(`AP-07 supports only .*received ${contract.id}`),
          );
        }
      }
      if (contract.id === 'e6-glow-mesa') {
        // No `admissionProbe` escape hatch: constructing through the ordinary door IS the
        // admission assertion. The boss the census used to report as ABSENT now reports itself,
        // and it reports the state a fresh run should be in — asleep, whole, and unmet.
        const door = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0]! });
        expect(door.currentTurn().view.now.atomic).toMatchObject({
          epochId: 'epoch-6-atomic',
          captureLever: 'CAPTURE',
          homemakerBoss: expect.objectContaining({
            act: 0,
            liveComponents: [],
            poweredDown: false,
            chairPlaced: false,
            persistentKept: false,
          }),
        });
      }
      if (contract.id === 'e6-half-life-hollow') {
        const door = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0]! });
        expect(door.currentTurn().view.now.hollowCrossing).toEqual({
          declared: true,
          stage: 'launch',
          routeId: null,
          onGlowBridge: false,
          radiationDamageDealt: 0,
        });
      }
      if (contract.id === 'e6-picnic') {
        // THE RULING, ASSERTED ON THE DATA IT CHANGED: no sandwich is a hero start any more, so the
        // hero cannot open the run inside a disc and hold it with its own auto-fire.
        expect(contract.tileParams.stakeMarkers!.map(({ heroStart }) => heroStart)).toEqual([false, false, false]);
        // ...and the loss still names all three, which is the whole point of the flip. `heroStart`
        // was doing double duty (hero start AND loss stake); `MechanicsManifest` reads them apart
        // for a picnic-hold contract, so this list cannot silently empty when the flags flip.
        expect(mechanics.posting.lossStakes).toHaveLength(3);
        expect(mechanics.posting.lossStakes.map(({ id }: { id: string }) => id))
          .toEqual(['sandwich-center', 'sandwich-east', 'sandwich-west']);

        // No `admissionProbe` escape hatch: constructing through the ordinary door IS the admission
        // assertion, and THE VIEW must show a hold that has actually started — three stakes, none
        // claimed, none contested at t0, with the hero posted at the engine default (0,12).
        const door = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0]! });
        const view = door.currentTurn().view.now;
        expect(view.atomic.picnicHold).toEqual([
          { id: 'sandwich-west', position: { x: -16, z: 18 }, held: true, claimed: false, contested: false, timer: 0 },
          { id: 'sandwich-center', position: { x: 0, z: 26 }, held: true, claimed: false, contested: false, timer: 0 },
          { id: 'sandwich-east', position: { x: 16, z: 18 }, held: true, claimed: false, contested: false, timer: 0 },
        ]);
        expect({ x: view.hero.x, z: view.hero.z }).toEqual({ x: 0, z: 12 });
      }
      if (contract.id === 'e6-half-life-hollow') expect(mechanics.posting.lossStakes).toEqual([]);
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
