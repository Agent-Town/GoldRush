/**
 * board-launchable-guard — every contract on the board must be openable by a player.
 *
 * WHY THIS EXISTS (F-E10L-1, 2026-09-06). The 42-contract playability smoke of 2026-09-05 found
 * three maps that a player could click and never reach: `e10-ember-shore`, `e10-archive-world` and
 * `e10-river` fell back to The Claim in 12 of 12 cells with `fallbackReason: 'unavailable-contract'`
 * and the line "<name> is not ready for a direct claim; The Claim opened instead"
 * (`artifacts/playability-smoke/report.md`). The cause was one array carrying two meanings:
 * `harvestAnchors: []` is the AGENT-PLAY door's "not admitted yet" (`HeadlessContractSim.ts:254`,
 * ratcheted by `scripts/door-admission-baseline.json`, and REQUIRED to stay empty until a
 * public-verb prover earns admission — `tasks/e10s-1c-ember-shore-inert-landing.md:27`), and the
 * browser door read the same emptiness as "unfinished map, send them to The Claim"
 * (`src/meta/ContractFamilies.ts:1349`).
 *
 * The cure is an authored declaration, `twist.harvestFreeObjective`, and this guard is its other
 * half: a fourth seamless map cannot ship silently, because it must either author seams or say in
 * its own data that it does not extract, and that declaration is ratcheted below.
 *
 * WHAT IT DOES NOT DO. It does not judge whether a map is FUN or finished, and it does not open the
 * agent-play door — the last assertion pins that these two doors stay separate, which is the whole
 * point of the fix.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));

/**
 * The ratchet. Adding a row here is a deliberate act with a reason, exactly like
 * `CONTRACT_ADMISSION_EXEMPTIONS` and `door-admission-baseline.json`. Removing one means the map
 * grew seams, which is good news and should be paired with its admission evidence.
 */
const HARVEST_FREE_BOARD_CONTRACTS = {
  // ⓘ `e10-ember-shore` HELD A ROW HERE UNTIL E10S-4 (2026-09-06) AND NO LONGER DOES — it grew
  // seams, which is the good-news half this ratchet's own doc comment predicts and the remedy its
  // own message prescribes, verbatim: "add the row with its spec citation, or remove it with the
  // anchors that replaced it." The retired reason, kept so the removal is legible rather than
  // silent: "specs/epoch-saga/e10-deepsky-bundle.md:17 gives the Ember Shore 'one
  // preserve-contract (keep the last warm vent alight through the Static squall)';
  // specs/agent-play/e10-ember-shore-preserve.md:18 builds the vent as a warmth structure with a
  // STOKE action. Its seams stay unauthored until E10S-4 earns the admission on evidence
  // (tasks/e10s-1c-ember-shore-inert-landing.md:27, landed d08cfe31b)."
  //
  // WHY THE DECLARATION HAD TO GO WITH THE ANCHORS, not merely could: the four cooling-vein
  // anchors ARE the map's authored stoking economy (`specs/agent-play/e10-ember-shore-preserve.md`
  // §3 "Anchors"), so `harvestAnchors` is no longer empty; and `:98` below refuses a contract that
  // carries seams AND the declaration ("one of the two is a lie"), while `:130` refuses a
  // harvest-free contract that reaches the agent-play door. Keeping both would have reddened this
  // guard twice with no src/ change able to reconcile them. The contract's OWN retired description
  // said the same thing in advance: "Seams stay unauthored until the E10S-4 door slice earns them
  // on measured evidence, so this claim declares no harvest anchors." Measured before the removal
  // (`artifacts/e10s-4-door/door-both-declared.json`): the BROWSER door does not refuse the
  // anchored map either way — `activeId: 'e10-ember-shore'`, `fallbackReason: null` — so the map
  // stays openable on its seams alone, which is the first test in this file.
  // ⓘ `e10-archive-world` HELD A ROW HERE UNTIL THE ERA-6 LAND (2026-09-14) AND NO LONGER DOES — Astra's map
  // campaign (sol/map-art-inventory-20260908 7c2744e5a, landed by maps-campaign-land-era6) authored four
  // harvestAnchors for it and replaced `twist.harvestFreeObjective` with the `archiveWorld` restoration
  // objective (src/systems/E10ArchiveSystem.ts), so per `:98` the declaration had to go with the anchors
  // that replaced it. The retired reason, kept legible: 'specs/agent-play/e10-archive-world-restoration.md:24, verbatim: "the wings themselves yield nothing - you are not here to extract." Its seams wait on the same door-slice evidence.',
  'e10-river':
    'specs/agent-play/door-completion-sheet.md:36 (RATIFIED 2026-08-20), verbatim: "RECORDED as permanently door-exempt-by-design (it is the ending, not a contract)"; specs/enemy-rosters-e6-e10.md:195: "empty enemyRoster, no boss, no waves. This contract remains one pan and the river."',
};

/**
 * DERIVED, not listed (the `er01-e9-census` discipline): this reads the door's OWN datum,
 * `twist.harvestFreeObjective`, rather than keeping a second hand-maintained list that can drift
 * from it. The door writes the same test inline at `src/meta/ContractFamilies.ts:1349` and must
 * keep doing so: `scripts/same-game-audit.mjs:104` re-evaluates that expression in a sandbox where
 * only `requested` is bound, so it cannot survive being factored into a shared helper.
 */
const declaresHarvestFreeObjective = (contract) => contract.twist.harvestFreeObjective !== undefined;

let listBoardContracts;
let supportedContractIds;
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  ({ listBoardContracts } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts'));
  ({ supportedContractIds } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'));
} finally {
  await vite.close();
}

const board = listBoardContracts();

test('the board is not empty', () => {
  // An empty corpus is the shape of false good news in every instrument on this board: a `for` loop
  // over nothing registers no assertions and reports success. Refuse rather than certify.
  assert.ok(board.length >= 42, `board resolved ${board.length} contracts; the selector or the root is wrong, not the tree`);
});

test('every board contract either has seams or declares a harvest-free objective', () => {
  const silent = board
    .filter((contract) => contract.tileParams.harvestAnchors?.length === 0)
    .filter((contract) => !declaresHarvestFreeObjective(contract))
    .map((contract) => contract.id);
  assert.deepEqual(
    silent,
    [],
    [
      'These board contracts declare `harvestAnchors: []` and no `twist.harvestFreeObjective`, so',
      'ContractFamilies.ts:1349 silently opens The Claim instead and the player never sees the map',
      'they clicked. Either author the seams the map calls for, or declare',
      '`twist.harvestFreeObjective` with the spec line that says this map does not extract, and add',
      'it to HARVEST_FREE_BOARD_CONTRACTS in this file with that reason.',
    ].join('\n'),
  );
});

test('the harvest-free declaration is ratcheted, and only seamless maps carry it', () => {
  const declared = board.filter((contract) => declaresHarvestFreeObjective(contract)).map((contract) => contract.id).sort();
  assert.deepEqual(
    declared,
    Object.keys(HARVEST_FREE_BOARD_CONTRACTS).sort(),
    'harvest-free declarations drifted from the ratchet in scripts/board-launchable-guard.test.mjs; add the row with its spec citation, or remove it with the anchors that replaced it',
  );
  for (const contract of board.filter((entry) => declaresHarvestFreeObjective(entry))) {
    assert.equal(
      contract.tileParams.harvestAnchors?.length ?? 0,
      0,
      `${contract.id} declares a harvest-free objective AND authors seams; one of the two is a lie`,
    );
    assert.ok(
      typeof contract.twist.harvestFreeObjective.description === 'string'
        && contract.twist.harvestFreeObjective.description.trim().length > 0,
      `${contract.id} must say IN ITS OWN DATA why it does not extract`,
    );
  }
});

test('the door still reads the declaration, in the shape the same-game audit can lift', () => {
  // Without this the guard could stay green while the door quietly went back to refusing every
  // seamless map. The regex is `scripts/same-game-audit.mjs:104`'s own: the clause must end the
  // line at `) {` with no trailing comment and no helper call, or that audit throws
  // "Browser unavailable-contract source wiring changed".
  const source = readFileSync(new URL('../src/meta/ContractFamilies.ts', import.meta.url), 'utf8');
  const clause = /} else if \(([^\n]+)\) {\n\s+fallbackReason = 'unavailable-contract';/.exec(source)?.[1];
  assert.equal(
    clause,
    "requested.tileParams.harvestAnchors?.length === 0 && requested.twist.harvestFreeObjective === undefined",
    'the browser launch door no longer reads twist.harvestFreeObjective in a form scripts/same-game-audit.mjs can evaluate',
  );
});

test('the harvest-free exemption does not open the agent-play door', () => {
  // The two doors are deliberately separate. `harvestAnchors: []` still means "not admitted" to the
  // benchmark, and a harvest-free contract must never appear in the derived admission set without
  // the evidence `door-admission-baseline.json` ratchets.
  const admitted = supportedContractIds().filter((id) => id in HARVEST_FREE_BOARD_CONTRACTS);
  assert.deepEqual(
    admitted,
    [],
    'a harvest-free board contract reached the agent-play door; admission needs a public-verb prover and a baseline row, not a launch exemption',
  );
});
