import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import atomic from '../assets/contracts/epoch-6-atomic/contracts.json' with { type: 'json' };

// Post-socket rule lists. `wrangle_*` appears on every Atomic contract because the browser
// enables WrangleSystem for the whole epoch (Game.ts:646); the two tile rules are Glow Mesa's.
const EXPECTED_RULES: Record<string, string[]> = {
  'e6-glow-mesa': [
    'baron', 'build_zones', 'decay_field_windows', 'night_vein_ring',
    'wrangle_capture_unreachable', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down',
  ],
  'e6-showroom': ['build_zones', 'wrangle_capture_unreachable', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down'],
  'e6-half-life-hollow': ['build_zones', 'wrangle_capture_unreachable', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down'],
  'e6-picnic': ['build_zones', 'wrangle_capture_unreachable', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down'],
};

/**
 * THE ADMITTED SET (2026-08-20, `fix-e6-homemaker-headless-socket`). The Homemaker socket landed:
 * `HomemakerBossSystem` constructs headless behind four `typeof document` guards, the boss is built
 * through its own factory against a real `GoldPickupPool`, and both bench seeds SECURE under public
 * verbs alone — HARVEST the seam ring, BUILD a turret on the pad the hero's own rig cannot reach,
 * CAPTURE the wound-down machines, rebuild what the Homemaker unbuilds, break VAC then CORE.
 * Seed 01 secures at wave 12 (`fnv1a32:e66807f6`), seed 02 at wave 10 (`fnv1a32:da62f7b9`).
 *
 * The other three Atomic contracts are unchanged and still refused: `e6-showroom` keeps its cited
 * exemption (its wave-20 false green is a separate, unresolved finding), and `e6-half-life-hollow`
 * and `e6-picnic` still declare consumers nobody has written. This census is per-id from here on.
 */
const ADMITTED = new Set(['e6-glow-mesa']);

// Each Atomic contract declares the era socket it is missing (AP-11 engineDependencies mandate).
// The declaration is honesty, not admission: every contract below stays rejected by the support gate.
const EXPECTED_DEPENDENCY: Record<string, string> = {
  'e6-glow-mesa': 'glow-mesa-contract-consumers',
  'e6-showroom': 'atomic-wrangle-consumer',
  'e6-half-life-hollow': 'half-life-hollow-contract-consumers',
  'e6-picnic': 'picnic-contract-consumers',
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
      expect(contract.tileParams.engineDependencies).toEqual([
        expect.objectContaining({ dep: EXPECTED_DEPENDENCY[contract.id], status: 'missing' }),
      ]);
      expect(contract.tileParams.engineDependencies[0].description.trim()).not.toEqual('');
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

      // The manifest must keep saying so, in the consumer's own numbers.
      const captureRule = mechanics.rules.find(({ id }: { id: string }) => id === 'wrangle_capture_unreachable');
      expect(captureRule.data.aliveCap).toBe(Balance.waves.aliveCap);
      expect(captureRule.data.consumerLever).toBe('WrangleSystem.tryCapture');
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
      if (admitted) {
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
      if (contract.id === 'e6-picnic') expect(mechanics.posting.lossStakes).toHaveLength(3);
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
