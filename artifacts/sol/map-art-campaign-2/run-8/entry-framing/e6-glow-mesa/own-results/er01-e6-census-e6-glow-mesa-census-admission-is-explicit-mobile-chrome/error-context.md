# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: er01-e6-census.spec.ts >> e6-glow-mesa census admission is explicit
- Location: e2e/er01-e6-census.spec.ts:74:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 0
+ Received  + 1

@@ -1,9 +1,10 @@
  Array [
    "baron",
    "build_zones",
    "decay_field_windows",
+   "entry_landmark",
    "hero_orders",
    "night_vein_ring",
    "wrangle_capture",
    "wrangle_exhausted",
    "wrangle_pen",
```

# Test source

```ts
  16  |     'wrangle_capture', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down',
  17  |   ],
  18  |   'e6-showroom': ['build_zones', 'hero_orders', 'showroom_capture_quota', 'wrangle_capture', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down'],
  19  |   'e6-half-life-hollow': ['build_zones', 'hero_orders', 'hollow_crossing', 'wrangle_capture', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down'],
  20  |   'e6-picnic': ['build_zones', 'hero_orders', 'three_stake_hold', 'wrangle_capture', 'wrangle_exhausted', 'wrangle_pen', 'wrangle_wind_down'],
  21  | };
  22  | 
  23  | /**
  24  |  * THE ADMITTED SET (2026-08-20, `fix-e6-homemaker-headless-socket`). The Homemaker socket landed:
  25  |  * `HomemakerBossSystem` constructs headless behind four `typeof document` guards, the boss is built
  26  |  * through its own factory against a real `GoldPickupPool`, and both bench seeds SECURE under public
  27  |  * verbs alone — HARVEST the seam ring, BUILD a turret on the pad the hero's own rig cannot reach,
  28  |  * CAPTURE the wound-down machines, rebuild what the Homemaker unbuilds, break VAC then CORE.
  29  |  * Seed 01 secures at wave 12 (`fnv1a32:e66807f6`), seed 02 at wave 10 (`fnv1a32:da62f7b9`).
  30  |  *
  31  |  * PROPOSAL: Showroom requires 6 captures before secure, a conservative minimum with wide margin
  32  |  * under the cap-fix evidence's competent aimed loop. The latch makes idle
  33  |  * survival honest without changing density or difficulty; admission still depends on two public-
  34  |  * verb secures per seed. The other Atomic contracts remain independently refused until proven.
  35  |  *
  36  |  * Half-Life Hollow is also admitted now: its authored crossing is consumed in both engines and
  37  |  * both bench seeds secure twice through public verbs.
  38  |  *
  39  |  * THE PICNIC IS ADMITTED (2026-08-22), AND IT TOOK TWO OWNER RULINGS, A YEAR APART IN SPIRIT.
  40  |  * The first (2026-08-21, verbatim: "picnic - no, just standing there should not win") built the
  41  |  * contest predicate: a stake's disc is held by a STANDING STRUCTURE inside it, or by a hero that
  42  |  * has dealt damage in the last `PICNIC_ACTIVE_DEFENSE_SECONDS`. Correct, and not enough — all three
  43  |  * `stakeMarkers` carried `heroStart: true`, so the hero opened the run standing in one of the three
  44  |  * discs, and the headless hero auto-fires with no policy term in its gate
  45  |  * (`HeadlessContractSim.ts:480`). Its own stake could never fall, the loss could never complete, and
  46  |  * `--policy=idle` SECURED both bench seeds at wave 20 (`fnv1a32:b9f476a6` / `fnv1a32:612de94b`,
  47  |  * `calls: 0`) — a Law-2 refusal, measured and filed rather than papered over
  48  |  * (`reviews/e6-picnic-admission.md`, F-E6PA-1).
  49  |  *
  50  |  * The second ruling (2026-08-22, verbatim: "flip the stakes") cured it in contract DATA alone: all
  51  |  * three sandwiches now carry `heroStart: false`, so the hero starts at the engine default (0,12) —
  52  |  * inside `mesa-meadow`, outside every disc — and the ruled pressure reaches all three stakes.
  53  |  *   · idle now LOSES, by stakes-all-lost with the hero untouched: wave 2 `fnv1a32:c26f77d5`,
  54  |  *     wave 1 `fnv1a32:a649be29`, each repeated identical. Law 2 holds.
  55  |  *   · the public-verb prover SECURES both bench seeds twice at wave 20 — fence each live disc with
  56  |  *     a 10-gold palisade, then spend to the turret cap, CAPTURE the wound-down machines:
  57  |  *     `fnv1a32:b55e6ff4` (607 kills) / `fnv1a32:44f0f3dc` (690 kills).
  58  |  * The opening rush takes two sandwiches on both seeds; the rider holds the third to wave 20, which
  59  |  * is exactly what the authored secure rule asks for ("at-least-one-stake-held-at-default-secure-
  60  |  * wave"). Only the Showroom remains refused.
  61  |  */
  62  | const ADMITTED = new Set(['e6-glow-mesa', 'e6-half-life-hollow', 'e6-picnic']);
  63  | 
  64  | // Each refused Atomic contract declares the era socket it is missing (AP-11 engineDependencies
  65  | // mandate). An ADMITTED contract must declare NONE — a shipped "missing consumer" on a map the door
  66  | // serves is an agent-facing lie, which is why the Picnic's row left this table on admission
  67  | // (its consumer, `PicnicHoldSystem`, has been live in both engines since `afbda29bc`).
  68  | const EXPECTED_DEPENDENCY: Record<string, string> = {
  69  |   'e6-glow-mesa': 'glow-mesa-contract-consumers',
  70  |   'e6-showroom': 'atomic-wrangle-consumer',
  71  | };
  72  | 
  73  | for (const contract of atomic.contracts) {
  74  |   test(`${contract.id} census admission is explicit`, async () => {
  75  |     test.setTimeout(60_000);
  76  |     const seeds = (benchSeeds as Record<string, string[]>)[contract.id]!;
  77  |     const admitted = ADMITTED.has(contract.id);
  78  |     const host = globalThis as unknown as { location?: URL; window?: { location: URL } };
  79  |     const previousLocation = host.location;
  80  |     const previousWindow = host.window;
  81  |     const location = new URL(`http://gr-sim.local/?debug&contract=${contract.id}`);
  82  |     const consoleErrors: string[] = [];
  83  |     const originalError = console.error;
  84  |     const originalWarn = console.warn;
  85  |     let vite: ViteDevServer | undefined;
  86  | 
  87  |     host.location = location;
  88  |     host.window = { location };
  89  |     console.error = (...args: unknown[]) => {
  90  |       const message = args.map(String).join(' ');
  91  |       if (!message.includes('ExperimentalWarning: localStorage is not available because --localstorage-file was not provided')) consoleErrors.push(message);
  92  |     };
  93  |     console.warn = (...args: unknown[]) => consoleErrors.push(args.map(String).join(' '));
  94  |     try {
  95  |       vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  96  |       const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
  97  |       const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  98  |       const { AtomicSocket } = await vite.ssrLoadModule('/src/sim/AtomicSocket.ts');
  99  |       const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  100 |       const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  101 |       const { EventBus } = await vite.ssrLoadModule('/src/core/EventBus.ts');
  102 |       const { Economy } = await vite.ssrLoadModule('/src/game/Economy.ts');
  103 |       const { EnemyPool } = await vite.ssrLoadModule('/src/entities/pools.ts');
  104 |       const mechanics = deriveMechanicsManifest(contract);
  105 | 
  106 |       expect(seeds).toEqual([`${contract.id}-01`, `${contract.id}-02`]);
  107 |       if (EXPECTED_DEPENDENCY[contract.id] === undefined) expect(contract.tileParams.engineDependencies).toBeUndefined();
  108 |       else {
  109 |         expect(contract.tileParams.engineDependencies).toEqual([
  110 |           expect.objectContaining({ dep: EXPECTED_DEPENDENCY[contract.id], status: 'missing' }),
  111 |         ]);
  112 |         expect(contract.tileParams.engineDependencies![0]!.description.trim()).not.toEqual('');
  113 |       }
  114 |       expect(contract.twist.enemyRoster.some(({ id }) => id === 'feral_toaster' || id === 'lawn_shepherd')).toBe(true);
  115 |       expect(mechanics.interactables).toEqual([]);
> 116 |       expect(mechanics.rules.map(({ id }: { id: string }) => id)).toEqual(EXPECTED_RULES[contract.id]);
      |                                                                   ^ Error: expect(received).toEqual(expected) // deep equality
  117 | 
  118 |       // The socket is REAL: it constructs for this contract, and it is epoch-gated, not
  119 |       // contract-gated — the same test the browser applies at Game.ts:646.
  120 |       const events = new EventBus();
  121 |       const enemies = new EnemyPool();
  122 |       const socket = AtomicSocket.create(loadContract(contract.id), events, enemies, new Economy());
  123 |       expect(socket).not.toBeNull();
  124 |       expect(socket.diagnostics.epochId).toBe('epoch-6-atomic');
  125 |       expect(socket.diagnostics.wrangle.enabled).toBe(true);
  126 |       expect(AtomicSocket.create(loadContract('e1-dry-gulch'), new EventBus(), new EnemyPool(), new Economy())).toBeNull();
  127 | 
  128 |       // F-ER01-E6-5, demonstrated on real objects rather than asserted in prose.
  129 |       // Spawn the machines this contract's roster carries, wind them down, and show the board
  130 |       // fills with enemies that can be neither fought nor cleared.
  131 |       const machines = ['feral_toaster', 'lawn_shepherd']
  132 |         .filter((id) => contract.twist.enemyRoster.some((entry) => entry.id === id));
  133 |       // Borrow a vector from the pool itself: importing `three` into the spec loads a SECOND
  134 |       // copy of the library, and its console warning reds the zero-console assertion below.
  135 |       const at = (x: number) => enemies.all[0].position.clone().set(x, Balance.enemy.groundY, 0);
  136 |       const spawned = machines.map((variantId, index) => enemies.spawn(at(index * 4), { variantId }));
  137 |       expect(spawned.every(Boolean)).toBe(true);
  138 |       expect(spawned.every((enemy) => socket.isHostile(enemy))).toBe(true);
  139 | 
  140 |       const windDownFrames = Math.round(Balance.wrangle.windDownSeconds / (1 / 30)) + 30;
  141 |       for (let frame = 0; frame < windDownFrames; frame += 1) {
  142 |         socket.tickDecay();
  143 |         socket.updateWrangle(1 / 30, frame / 30);
  144 |       }
  145 | 
  146 |       const active = socket.diagnostics.wrangle.active;
  147 |       expect(active.map(({ variantId }: { variantId: string }) => variantId).sort()).toEqual([...machines].sort());
  148 |       expect(active.every(({ state }: { state: string }) => state === 'exhausted')).toBe(true);
  149 |       // Exhausted: harmless to the hero AND immune to it (Game.ts:536 and :2606 share the
  150 |       // predicate), and still alive — but as of the owner's 2026-08-20 cap ruling they no
  151 |       // longer hold a spawn slot against Balance.waves.aliveCap. `exhaustedCount` is the ONE
  152 |       // number both engines subtract (WaveSystem's `capExemptCount` seat), so counting it here
  153 |       // pins the exemption at the same place the census pins the rest of the consumer.
  154 |       expect(spawned.every((enemy) => socket.isHostile(enemy))).toBe(false);
  155 |       expect(spawned.every((enemy) => enemy.isAlive)).toBe(true);
  156 |       expect(socket.exhaustedCount()).toBe(spawned.length);
  157 |       expect(spawned.every((enemy) => socket.movementMultiplier(enemy) === Balance.wrangle.exhaustedSpeedMultiplier)).toBe(true);
  158 |       // AP-16-7: the agent-surface lever now closes the consumer loop without changing its law.
  159 |       expect(socket.diagnostics.wrangle.pen.total).toBe(0);
  160 |       expect(socket.diagnostics.captureLever).toBe('CAPTURE');
  161 |       expect(socket.capture(spawned[0].position)).toBe(true);
  162 |       expect(socket.diagnostics.wrangle.pen.total).toBe(1);
  163 |       if (contract.id === 'e6-showroom') {
  164 |         expect(socket.diagnostics.showroomObjective).toMatchObject({ captures: 1, quota: 6, complete: false });
  165 |         expect(socket.objectiveAllowsSecure).toBe(false);
  166 |       } else {
  167 |         expect(socket.diagnostics.showroomObjective).toBeUndefined();
  168 |         expect(socket.objectiveAllowsSecure).toBe(true);
  169 |       }
  170 | 
  171 |       // The manifest must keep saying so, in the consumer's own numbers.
  172 |       const captureRule = mechanics.rules.find(({ id }: { id: string }) => id === 'wrangle_capture');
  173 |       expect(captureRule.data.aliveCap).toBe(Balance.waves.aliveCap);
  174 |       expect(captureRule.data.consumerLever).toBe('WrangleSystem.tryCapture');
  175 |       if (contract.id === 'e6-showroom') {
  176 |         expect(mechanics.rules.find(({ id }: { id: string }) => id === 'showroom_capture_quota')).toMatchObject({
  177 |           source: 'ShowroomCaptureObjective',
  178 |           data: { captureQuota: 6, consumerLever: 'WrangleSystem.tryCapture' },
  179 |         });
  180 |       }
  181 |       expect(mechanics.buildables).toEqual(expect.any(Array));
  182 | 
  183 |       // THE DOOR ITSELF. Glow Mesa boots on its own bench seeds now that its boss resolves; the
  184 |       // other three are still refused BY NAME, which is what keeps the refusal honest rather than
  185 |       // silent. (The admitted contract's `engineDependencies` prose above — "the headless sim
  186 |       // composes none" — is now stale for all three of its consumers, but the declaration lives in
  187 |       // contract JSON outside this slice's firewall and is filed as a finding, not edited here.)
  188 |       for (const seed of seeds) {
  189 |         if (admitted) expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).not.toThrow();
  190 |         else {
  191 |           expect(() => new HeadlessContractSim({ contractId: contract.id, seed })).toThrow(
  192 |             new RegExp(`AP-07 supports only .*received ${contract.id}`),
  193 |           );
  194 |         }
  195 |       }
  196 |       if (contract.id === 'e6-glow-mesa') {
  197 |         // No `admissionProbe` escape hatch: constructing through the ordinary door IS the
  198 |         // admission assertion. The boss the census used to report as ABSENT now reports itself,
  199 |         // and it reports the state a fresh run should be in — asleep, whole, and unmet.
  200 |         const door = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0]! });
  201 |         expect(door.currentTurn().view.now.atomic).toMatchObject({
  202 |           epochId: 'epoch-6-atomic',
  203 |           captureLever: 'CAPTURE',
  204 |           homemakerBoss: expect.objectContaining({
  205 |             act: 0,
  206 |             liveComponents: [],
  207 |             poweredDown: false,
  208 |             chairPlaced: false,
  209 |             persistentKept: false,
  210 |           }),
  211 |         });
  212 |       }
  213 |       if (contract.id === 'e6-half-life-hollow') {
  214 |         const door = new HeadlessContractSim({ contractId: contract.id, seed: seeds[0]! });
  215 |         expect(door.currentTurn().view.now.hollowCrossing).toEqual({
  216 |           declared: true,
```