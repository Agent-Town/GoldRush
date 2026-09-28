import { expect, test } from '@playwright/test';
import { createServer, type ViteDevServer } from 'vite';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import deepSky from '../assets/contracts/epoch-10-deepsky/contracts.json' with { type: 'json' };

// RE-POINTED BY hero-move-verb (owner ruling 2026-09-06, "rider has to be able to move"):
// `hero_orders` is `deriveMechanicsManifest`'s first UNCONDITIONAL row, published on every
// contract because the MOVE_HERO contract (arrival radius, refusal vocabulary, who may hold the
// hero) belongs to the ENGINE, not to a map. The list is `rules.sort(byId)`, so it lands
// alphabetically and no other row moved. Measured on this tree, not assumed.
const EXPECTED_RULES: Record<string, string[]> = {
  // RE-POINTED BY E10S-4, and the Ember Shore row was STALE IN ITS ORDER, not its contents:
  // `deriveMechanicsManifest` returns `rules.sort(byId)` (`src/agent/MechanicsManifest.ts:986`),
  // so the derived list is alphabetical and E10S-3's `['build_zones','static_squall',
  // 'preserve_vent']` could never have matched. It was never SEEN because the buildables clause
  // below fails earlier in the same test (F-E10S3-7), which is exactly how one stale clause hides
  // another. Measured on this tree, 2026-09-06, by `artifacts/e10s-4-door/census-truth-probe.mjs`.
  // Both Ember Shore rules are DERIVED FROM CONSUMERS both engines run, which is what this census
  // is for: the debt on the card must match the debt in the engine.
  'e10-ember-shore': ['build_zones', 'hero_orders', 'preserve_vent', 'static_squall'],
  'e10-archive-world': ['archive_restoration', 'build_zones', 'hero_orders', 'static_squall'], // 2026-09-22, 6351690fb0 + 7c2744e5a: squall + restoration consumers.
  'e10-last-claim': ['build_zones', 'hero_orders'],
  'e10-river': ['hero_orders', 'river', 'water_crossings'],
};

const EXPECTED_DEPENDENCY: Record<string, string | undefined> = {
  // RE-POINTED BY engine-correctives-batch (F-E10S4-2 cured, 2026-09-07). STILL NOT RETIRED, BUT
  // THE ENGINE IS NO LONGER THE REASON, and the difference is the whole point of re-pointing this
  // block rather than leaving it. What this comment used to say — that removing the row fails the
  // whole bundle with
  //   Invalid authored contract epoch-10-deepsky/e10-ember-shore: twist.emberShore:
  //   engine_dependency_required
  // because `twist.emberShore` sat in `DECLARED_INERT_PATHS` and `validateEngineDependencies`
  // demands a non-empty `engineDependencies` array from any contract declaring a listed path — was
  // TRUE and is now FALSE. That path is gone from the list (`src/meta/ContractFamilies.ts`, the
  // RETIRED comment where it stood; the inert check is `validateEngineDependencies`, currently
  // `:1841`), and the retirement was MEASURED on this tree with the row deleted: 42 contracts load
  // and `parseContractDescriptor` returns `ok: true` with no reasons
  // (`artifacts/engine-correctives-batch/probe-inert-retire.mjs`).
  // WHAT KEEPS THE ROW IS NOW A GUARD, NAMED: `scripts/e10-preserve-consumer.test.mjs:455` ("the
  // engine dependency says LANDED and names the slice that landed it") reads
  // `contract.tileParams.engineDependencies` and reds `TypeError: Cannot read properties of
  // undefined (reading 'status')` at `:459` the moment the row goes. That guard was outside the
  // curing task's firewall, so the retirement is one ledger line plus that guard's own retirement,
  // and it is deliberately left for whoever owns both. The row therefore stays, `status: 'landed'`
  // with `landedBy: 'E10S-3'` and a description that says the claim is earned, so the campaign
  // dossier does not report a served map as missing (`scripts/campaign-map-dossier-table.mjs:63`).
  'e10-ember-shore': 'ember-shore-preserve-consumers',
  'e10-archive-world': 'archive-world-consumers',
  // RE-POINTED (stale before E10S-3, cited): the Last Claim's dependency was renamed to
  // `last-claim-finale-metadata-consumer` by `fa26f170c` ("runner(lane-a): e10-preserve-objective")
  // when its warm-vent objective landed and only the finale METADATA stayed missing. Measured at
  // base `1d5a329c8`, 2026-09-06: the contract carries the new id and this row still claimed the
  // old one, so this clause had been red since that drain.
  'e10-last-claim': 'last-claim-finale-metadata-consumer',
  'e10-river': 'credits-river-consumer',
};

/**
 * Landed dependencies are named here; every omitted Deep Sky row still defaults to `missing`, so
 * another map flipping without its own evidence would red here rather than pass by omission. The
 * explicit rows keep every landed state tied to its cited consumer evidence.
 */
const EXPECTED_DEPENDENCY_STATUS: Record<string, 'missing' | 'landed'> = {
  'e10-ember-shore': 'landed', 'e10-archive-world': 'landed', // 2026-09-22, 7c2744e5a: Archive consumers landed.
};

const EXPECTED_LOSS_STAKES: Record<string, number> = {
  'e10-ember-shore': 1,
  'e10-archive-world': 1, // 2026-09-22, 7c2744e5a: archive-entry hero start is the loss stake.
  'e10-last-claim': 3,
  'e10-river': 0,
};

/**
 * THE PER-ID ADMISSION TRUTH, which is the whole reason this census exists as four tests rather
 * than one epoch-wide assertion (the `er01-e6-census` pattern). Two Deep Sky maps are now served
 * by the agent-play door and two are not, and every clause below is keyed on that rather than on
 * "E10 is unfinished":
 *   - `e10-ember-shore` — ADMITTED by E10S-4 on measured evidence: four cooling-vein
 *     `harvestAnchors`, two bench seeds, two null-floor rows that both LOSE (`vent_guttered` at
 *     93.0 s, `fnv1a32:1b73c4b7` / `fnv1a32:5c8b38ac`), and a public-verb prover that SECURES both
 *     seeds twice at wave 12 (`fnv1a32:84aace38` / `fnv1a32:de0f1cb5`). `reviews/e10s-4-*`.
 *   - `e10-last-claim` — ADMITTED before this slice, and this census had been LYING about it: the
 *     old blanket clause asserted the constructor throws for every Deep Sky id, which has been
 *     false for the Last Claim since its own admission. Measured 2026-09-06: it constructs.
 *   - `e10-archive-world` and `e10-river` — still refused, and the refusal is asserted with its
 *     own message so the two doors stay legible.
 */
const ADMITTED: Record<string, boolean> = {
  'e10-ember-shore': true,
  'e10-archive-world': true, // 2026-09-22, 7c2744e5a: harvest anchors opened the derived AP-07 door.
  'e10-last-claim': true,
  'e10-river': false,
};

/**
 * F-E10S3-7, CURED. The census asserted `mechanics.buildables` was `undefined` for every Deep Sky
 * contract; the manifest derives the six-entry registry menu for all four, and has since long
 * before E10S-3 — that clause reddened all four tests on a pristine tree. The list is the
 * REGISTRY's, identical on every Deep Sky map and not a function of admission, so it is asserted
 * once here rather than per id, and a map that ever loses or gains a buildable reddens.
 */
const EXPECTED_BUILDABLES = ['sentry_beacon', 'palisade', 'sluice', 'stockpile', 'turret', 'assay_office'];

/**
 * Bench seeds arrive WITH admission and never before it (`tasks/e10s-1c-ember-shore-inert-landing.md:27`).
 * They are NOT implied by it, though, and this map says so: `e10-last-claim` is admitted and
 * publishes none, which is why the census keeps a measured row per id rather than deriving seeds
 * from `ADMITTED` and quietly asserting a rule the county does not follow.
 */
const EXPECTED_SEEDS: Record<string, string[] | undefined> = {
  'e10-ember-shore': ['e10-ember-shore-01', 'e10-ember-shore-02'],
  'e10-archive-world': ['e10-archive-world-01', 'e10-archive-world-02'], // 2026-09-22, 7c2744e5a: two authored seeds landed.
  'e10-last-claim': undefined,
  'e10-river': undefined,
};

for (const contract of deepSky.contracts) {
  test(`${contract.id} census cites the existing Deep Sky debt`, async () => {
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
      expect((benchSeeds as Record<string, string[]>)[contract.id]).toEqual(EXPECTED_SEEDS[contract.id]);
      const dependency = 'engineDependencies' in contract.tileParams
        ? contract.tileParams.engineDependencies
        : undefined;
      const expectedDependency = EXPECTED_DEPENDENCY[contract.id];
      // RE-POINTED BY E10S-3, WITH THE REASON (F-E10S2-1). The schema admitted only the literal
      // `missing`, so a dependency whose consumers had SHIPPED could say so only in prose. It now
      // admits `landed` with a `landedBy` slice name, and the Ember Shore's row is the first to
      // use it: both `twist.emberShore` consumers run in both engines. The census's PURPOSE is
      // unchanged — a Deep Sky map must still NAME its engine debt — so the assertion keeps
      // requiring the entry and the id, and now checks the status the map actually carries.
      const expectedStatus = EXPECTED_DEPENDENCY_STATUS[contract.id] ?? 'missing';
      if (expectedDependency === undefined) expect(dependency).toBeUndefined();
      else expect(dependency).toEqual([expect.objectContaining({ dep: expectedDependency, status: expectedStatus })]);

      vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
      const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      const mechanics = deriveMechanicsManifest(contract);

      expect(mechanics.buildables?.map(({ id }: { id: string }) => id)).toEqual(EXPECTED_BUILDABLES);
      expect(mechanics.interactables).toEqual([]);
      expect(mechanics.rules.map(({ id }: { id: string }) => id)).toEqual(EXPECTED_RULES[contract.id]);
      expect(mechanics.posting.lossStakes).toHaveLength(EXPECTED_LOSS_STAKES[contract.id]!);
      for (const seed of [`${contract.id}-01`, `${contract.id}-02`]) {
        // The agent-play door, asked directly. An admitted map must OPEN for a rider on its own
        // id; a refused one must say so in the door's own words rather than failing some other
        // way. This is the clause admission actually flips, so it is the clause that has to be
        // per id — asserting the throw for the whole epoch was already false for the Last Claim.
        if (ADMITTED[contract.id]) {
          const sim = new HeadlessContractSim({ contractId: contract.id, seed });
          expect(sim.currentTurn().view.now.wave).toBe(0);
        } else {
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
