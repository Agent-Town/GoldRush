# Review — F-1324-1: the charter fuzz rig is now TOTAL over its mutation space

**Slice:** `lane-c-f1324-1-charter-fuzz-composition-totality.md` (FIRE-AUTHORED s1324)
**Branch / tip:** `lane/e2-arsenal` @ `dafd70c3` · **Merge:** `d640dc31edcd9ec0e9aa699b965855d86caf2fa5` (main, `--no-ff`)
**Drained by:** s1324, 2026-08-01 · **Base:** `245102b0`

## VERDICT: ACCEPT

The one standing red on main is cured at its root, the cure is guarded against the whole class rather than the
one index, and **the whole e2e suite is collecting again — 0 → 2476 tests.**

## What it does

`charterMutants` applies **1–2 independent mutations to the same charter** with no memory between steps. When
the arm returning `illegal:missing-briefing` (which `delete`s `contract.briefing`) preceded the arm returning
`blank:briefing.goal` (which reads `contract.briefing.goals`), the read threw a `TypeError` **at module scope**
in `cp02-charter-boot.spec.ts` — so playwright dropped the file at collection and, with it, the entire suite.

The fix guards the reading arm with the file's own `return 'noop'` idiom (three sibling arms already use it) and
a dated comment naming the composition. `applyMutation`'s rng consumption is **unchanged** — the menu array is
now built by an extracted `charterMutationArmsForTest`, and the single selection draw still happens in
`applyMutation`, so the seeded stream is bit-identical where it previously existed.

The real deliverable is the new guard: `e2e/charter-press-totality.spec.ts` drives **every ordered pair of the
13 arms** (169 pairs, each on a fresh charter) and asserts none throws, plus a **bidirectional** assertion that
the arm still *fires* when a briefing exists and only *noops* after one has been deleted. That converts "index
41 of one seed is fixed" into "no composition in the one/two-mutation space can throw."

## Evidence (measured on the MERGED tree by s1324, not inherited from the runner's report)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (no output) |
| `npm run build` | **green**, built in 2.11s |
| `npx playwright test --list --workers=1` | **`Total: 2476 tests in 350 files`** — was **`0 tests in 0 files`** before the merge |
| `cp02-charter-boot` + `cp02-charter-stamp` + `charter-press-totality`, `--workers=1` | **50 passed** (27.0s), both projects, zero console/page errors |
| `test:node-guards`, 37 files **derived from `package.json`** | **209 tests / 209 pass / 0 fail** (was 209 / 3 fail) |
| Adjacent suites | Derived by grep, not from the runner's list: the only importers of `charter-press.rig` are the two CP-02 specs and the new totality spec — **all three run above.** |
| Firewall | Honoured exactly: `git diff main...lane/e2-arsenal` = **2 files**, `e2e/charter-press.rig.ts` (+12/−2) and the new `e2e/charter-press-totality.spec.ts` (+33). No `src/`, no `assets/`, no instrument guard touched. |

**All three node-guard reds cleared together**, which independently confirms s1323's "one root, three costumes"
finding (`collection-guards-cwd-invariance` and `fixture-teardown` were each reporting
`whole-suite-collection`'s child failure as their own).

**Stream-preservation tripwire held.** The master named four mutants measured before the cure; after it, the
collected names still read mutant **6** `[e1-twin-banks]` (legal:rename), **10** `[e1-baron]` (legal:rename),
**12** `[e1-dry-gulch]` (noop), **25** `[the-claim]` (perturb:tileParams.lanes.territoryRingBiasWaves +
legal:rename). The cure did not move the stream.

**Merge classification.** Base `245102b0`; one lane commit. The two-dot diff also lists `STATUS.md`,
`reviews/pc-01b-drill-yard-parity.md`, `tasks/BACKLOG.md` and `tasks/goals.json` — those are **MAIN-MOVED-ONLY**
(this fire's own bookkeeping, landed after the lane branched), not lane content. Three-dot diff is the two e2e
files only. No conflicts; nothing hand-resolved.

## Findings

**F-1324-3 — the totality guard addresses arms by hardcoded INDEX and drives them with a constant rng. 🟡 OPEN,
NON-BLOCKING.** Two limits worth writing down rather than discovering later:
1. The bidirectional test uses `arms[3]` and `arms[9]` as literals. **If anyone reorders the menu, those
   literals silently re-point at different arms** and the test keeps passing while asserting nothing about the
   composition it was written for. The 169-pair test is immune (it derives `armCount`), but the assertion that
   proves the arm still *fires* is not. A label-based lookup would fix it.
2. `fixedRng = () => 0` means every arm runs with all its internal selections pinned to index 0, and only the
   **first** Frontier template is used. So the guard proves *structural* totality, not value-space totality — a
   throw that needs a non-zero draw or a differently-shaped template would still slip through.

Neither blocks: both are strictly stronger than what existed before (nothing), and the class of defect that took
the suite down — one arm destroying state another reads — is fully covered. **GATE: none owed; fold into the
next touch of this rig.**

## The reusable lesson

The defect was eight hours old and had been certified **"pre-existing"** by the drain that shipped it, on the
reasoning that the rig file was untouched by the merge (last modified 12 days earlier). That reasoning is
unsound, and it is the thing to carry forward: the merge added **one contract** to an epoch, template choice is
`templates[floor(rng() * templates.length)]`, and so **changing a collection's cardinality re-rolled an entire
seeded stream**. *A merge can cause a red in a file it never touched* — wherever code consumes a count, a seed,
an ordering or a hash of something the merge changed, file-level provenance says nothing about causation.
"Pre-existing" is a causal claim; if the control was not actually run against it, the honest word is
**"unattributed."**
