> ⬆️ **SUPERSEDED s1323, 2026-08-01 — the REJECT below stood for one cycle and no longer holds.**
> The corrective it ordered (`pc-01b`) resolved the single blocking objection, and the whole stack **MERGED**
> at s1323. See **`reviews/pc-01b-drill-yard-parity.md`** for the accept verdict and evidence. This file is kept
> intact as the record of *why* the slice waited — the reasoning was sound and the objection was real.

# pc-01-drill-yard — The Drill Yard (PC-01)

- **Slice:** PC-01, `specs/practice-claim/README.md` (RATIFIED as THE DRILL YARD, owner 2026-08-01)
- **Master:** `tasks/done/20260801-072250-lane-drill-yard.md` (attended-authored; **not** queued by s1319 or s1320)
- **Branch / tip:** `lane/m4` @ `f86b28b3` (`runner(lane-b): lane-drill-yard.md`, 2026-08-01T08:14:09+07:00)
- **Merge-base:** `62760ec0` (2026-08-01T07:14:03+07:00)
- **Drained by:** s1321 fire, 2026-08-01
- **VERDICT: REJECT — do not merge.** The slice is good work and its own spec is strong, but it lands a **sixth E1 contract** whose card is filtered out of the rendered board, which reds **4 tests across 2 adjacent suites** that the runner's own gate battery never ran. Corrective queued to lane-b as `lane-b-pc01b-drill-yard-board-manifest-parity.md`. **Nothing is lost — the work stays on `lane/m4`; main was restored byte-clean.**

## What it does

Adds `e1-drill-yard`: a standing, stakes-free practice claim on the tavern board. The county lends practice gold through a faucet lever at the assay tent (routed through `Economy` as `gold_granted / source: 'practice'`, so the sole-gold-writer law holds), all seven E1 buildables are offered locally regardless of research, five straw/rolling-log targets take damage, fall and re-stand, and a drill bell rings one on-demand wave of 8 basic jumpers. Nothing persists: scores, meta progression, run history, standings and **tapes** are all asserted OFF, and the yard fully resets on re-entry.

The persistence-absence work is the best part of this slice and I want it on the record: `e2e/drill-yard.spec.ts` snapshots **14 storage keys** (7 logical × 7 profile-scoped) before practice and asserts byte-equality both on exit *and* after re-entry, asserts the ledger-discovery delta is `[]`, counts `standings` HTTP requests to **0**, and asserts the research overlay and keep-tape prompts have `toHaveCount(0)` after a practice death. That is absence tested properly, not assumed.

## Evidence (all measured by me on the grafted tree, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (no output, rc 0) |
| `npm run build` | **green** — `✓ built in 1.99s` |
| `e2e/drill-yard.spec.ts` desktop-chrome | **1 passed (17.4s)**, 0 console errors |
| `e2e/drill-yard.spec.ts` mobile-chrome (390px) | **1 passed (17.3s)**, 0 console errors |
| Adjacent board/ledger battery (4 specs, 15 tests, desktop) | **11 passed / 4 FAILED (4.6m)** |
| Screenshots | 6 delivered (`artifacts/pc-01-drill-yard/`, desktop+mobile × card/yard-dummies/bell-wave) |

### The four reds, with their reasons (not their count)

```
board-era-chapters.spec.ts:98  › fresh profile opens only the Frontier chapter
board-era-chapters.spec.ts:125 › the era door exposes chapters through the reached frontier
board-era-chapters.spec.ts:146 › debug opens every chapter without removing any launch surface
    expect(locator).toHaveCount(expected)
    Locator: getByTestId('contract-chapter-epoch-1-frontier').locator('[data-contract-id]')
    Expected: 6   Received: 5        (at expectChapter, spec line 90)

en-02-e1-coverage.spec.ts:323  › town board and bark discover contracts and townsfolk
    expect(received).toContain("contract_e1_drill_yard")
    Received: ["the_claim","town_tavernkeeper","contract_e1_dry_gulch",
               "contract_e1_night_shift","contract_e1_twin_banks","contract_e1_baron"]
```

## Attribution — a guarantee, not a sample

I did not need a control run, because the *expected* values in all four reds are computed from data this graft introduces:

```
main   E1 contracts: 5  the-claim, e1-dry-gulch, e1-night-shift, e1-twin-banks, e1-baron
graft  E1 contracts: 6  the-claim, e1-drill-yard, e1-dry-gulch, e1-night-shift, e1-twin-banks, e1-baron
```

`board-era-chapters` asserts `rendered == epoch.contracts.length`. On main that is 5 == 5 (green). With the graft the manifest says **6** while the board renders **5**, because `TownScene.ts:1941` filters the drill-yard card out unless the town welcome has been seen — and these fixtures use fresh profiles. Identically, `en-02` derives `CONTRACT_ENTRY_IDS` from `listContracts()`, which now includes `contract_e1_drill_yard` via the new `registry.ts` entry, but board-open discovery filters that same id. **Every red is structurally caused by this merge; none is a flake, a load ceiling, or a pre-existing red.**

## Merge classification (performed, then reverted)

Base `62760ec0`; 22 paths moved on the lane. Per-path merge-base classification, run independently of `lane-usable`:

- **4 ABSORBED-IDENTICAL** — `docs/bench/agent-playability-census.md`, `env/goldrush-verifiers/README.md`, `scripts/gr-sim.test.mjs`, `src/sim/HeadlessContractSim.ts`. These are s1319's ap-07 drain (`90003628`) reaching the lane; lane content is byte-identical to main, so there was nothing to graft.
- **18 LANE-ONLY** — main has not touched any of them since the base, so a path-scoped checkout is a faithful graft. Grafted, gated, then reverted on the REJECT.

⚠️ A blind `git merge` here would have been the s1319 shape again: the lane base is ~1h stale, so a two-dot diff renders main's newer commits as deletions. The per-path classifier is what makes this safe.

**Main was restored byte-clean:** the 10 modified paths via `git checkout HEAD --`, the 8 new paths removed from index and disk; `git diff -- src` is **empty**, and the only residual tracked dirt is the inherited artifact/log churn from s1319–s1320 that I never touched.

## Findings

### F-1321-1 — BLOCKING. A manifest contract that the board refuses to render desynchronises three existing invariants.

`TownScene.ts:1941` gates the card at **render** time:

```ts
const contracts = (chapter?.contracts ?? []).filter(
  (contract) => contract.id !== 'e1-drill-yard' || localStorage.getItem(TOWN_WELCOME_SEEN_KEY) === '1',
);
```

so the manifest and the board disagree for any profile that has not seen the welcome — a reachable state, as `board-era-chapters` demonstrates by opening the board from a fresh profile. The same filter is applied to `discoverLedgerContract`, so the divergence leaks into the Claim Ledger too.

ⓘ **The gate itself is not broken, and I checked rather than assumed.** The bare `localStorage.getItem(TOWN_WELCOME_SEEN_KEY)` looks like a profile-scoping bug next to `TownWelcome.ts:50`, which reads the same key through the profile-scoped `ProfileStorage`. It is not: `ProfileStorage.ts:303` monkey-patches `Storage.prototype.getItem` to scope every read. The key resolves correctly.

⚠️ **The important half: this is not simply "the adjacent specs are stale."** Adding a 6th E1 contract necessarily changes a number that four specs assert, and **either** implementation reds two of them — with the filter, `board-era-chapters` and `en-02` go red; without it, `town-t3-board:194/:335` and `board-gating-and-profiles:63` (all hard-coded `toHaveCount(5)`) go red instead. Those two passed here *only because* the filter hid the new card from them. So the filter reads as a design decision but **functions as a test-accommodation**, and the price it pays is a hidden manifest/board divergence. The spec text (`"always available once the welcome has run"`) is genuinely ambiguous between *hide it before the welcome* and *it is never progression-gated*; the corrective resolves this against the spec's own wording rather than against whichever choice keeps more tests green.

### F-1321-2 — Goal Registration Law: `lane-drill-yard.md` has no goal leaf.

`drain-block-check.mjs 20260801-072250-lane-drill-yard.md --strict` returns **UNKNOWN** (rc 2), and a corrected walk of all **553** nodes in `tasks/goals.json` finds no node whose id or title matches drill/practice. So the master was queued without registering a leaf, and the drain had no `blockedReason` to consult. **UNKNOWN is a bookkeeping finding, not a clearance** — I proceeded to gate, but recorded it. Repaired in this fire's bookkeeping commit.

ⓘ Method note against myself: my *first* goal-tree walk reported zero matches after walking **zero nodes**, because I used `g.subgoals` when the top-level key is `g.goals`. An empty search and an exhaustive search return the same word. The 553 is the denominator that makes the negative result mean anything.

### F-1321-3 — The runner reported "adjacent 10/10" green while 4 adjacent tests were red.

Its report reads *"Green: TypeScript, builds, E1 release 26/26, adjacent 10/10"*. Those ten were real and did pass; the set simply omitted the board and ledger suites whose arithmetic its own new contract changes. Deriving the adjacent set **by grep on the touched symbols** (`contract-card-`, `chapter-contracts`, `listContracts`) rather than by judgement puts `board-era-chapters` and `en-02-e1-coverage` at the top of the list in one command. This is the house law (*derive adjacent suites by grep, not from the runner's list*) earning its keep — non-blocking on its own, and folded into the corrective's self-check.

## Non-blocking observations

- **F-1321-4** — `WaveSystem.update` changes shared behaviour outside the contract flag: `scheduledDisabled()` used to force `waveState = 'quiet'` unconditionally, and now preserves `'active'`/`'cleared'`. Every spawn-disabled contract goes through that branch, not just the Drill Yard. The board battery exercised it without incident and `m2-03-wave-scheduler` was not in my battery; the corrective's self-check names it explicitly.
- Mistake #10 (the Debug-Gate Leftover) is **not answered by the shipped spec**: the whole test runs under `?debug&nolevel&nopause`, so no assertion proves the card reaches a player in a plain boot. The corrective owes a no-`?debug` assertion — this is release content that ships in E1.
