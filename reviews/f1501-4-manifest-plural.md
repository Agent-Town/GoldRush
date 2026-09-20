# f1501-4-manifest-plural — drain review (s1506)

**Slice:** `f1501-4-manifest-plural` (cures F-1501-4)
**Branch / tip:** `lane/c` @ `26b9d25e05042186d7e65bd0aff4665e9511f67b`
**Base:** `7e29859ee3576a5f623077ca35b15da0259c4e4f` (the s1505 commit that authored the master)
**Gated in:** detached worktree `gate-s1506` (§3.0b — main's working tree never held undecided content)
**Verdict:** ✅ **MERGE.** One non-blocking finding (F-1506-1), not attributable to this slice.

## What it does

The Drill Yard's briefing card rendered *"straw mans"*. `mechanicsManifestLine` built every plural
by appending `s` to `humanize(id)`, which is right for four of the five plural terms the board
emits and wrong for `straw_man`. The cure adds a module-local irregular table with **exactly one
entry** (`straw_man → 'straw men'`) consulted only on the `count !== 1` branch; the regular `+ s`
fallback and the singular path are byte-unchanged. No general English pluraliser was added — that
was forbidden as the vocabulary stretch it would have been (Mistake #14).

Derivation, slug normalisation (`humanize`, `toSnakeCase`) and the byte-stable E1 fixture are
untouched, so this is a **render-time** cure and provably cannot move the fixture that F-1328-1
is still on the owner's desk about.

## Merge classification

| Side | Paths |
|---|---|
| LANE-TOUCHED (4) | `src/agent/MechanicsManifest.ts` · `e2e/agent-view.spec.ts` · `artifacts/f1501-4-manifest-plural/{desktop,mobile}-chrome-drill-yard-line.png` (both new) |
| MAIN-MOVED since base (5) | `.claude/skills/author-task/SKILL.md` · `STATUS.md` · `tasks/BACKLOG.md` · `tasks/goals.json` · `tasks/lane-f1501-4-manifest-plural.md` |

**Intersection: empty.** No BOTH-MOVED path, so no graft judgement was required — this is disjoint
by construction, not by my reading of a diff. Trial merge in `gate-s1506`: `ort` strategy, **0
conflicts**, 4 files / +12 / −1.

## Evidence (all on the MERGED tree, all playwright at `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.02 s** |
| Own spec `e2e/agent-view.spec.ts` | **8 passed (16.4 s)** — 4 `test()` titles × 2 projects, the **DERIVED** count; the master forbade new titles and none appeared |
| Adjacent suites | **84 passed / 0 failed (4.2 m)** across **11 specs**, both projects |
| Boot probes | **18 passed (1.3 m)**, desktop + 390px, zero console/page errors |
| `test:node-guards` | **rc=0 — 345 tests, 342 pass, 0 fail, 3 skipped** (the 3 are the cross-engine guards, correctly skipped in a fire shell per F-1408-2) |

### The adjacent list was RE-DERIVED, not inherited

The runner's report named three adjacent specs (`drill-yard`, `drill-yard-manifest`,
`contract-briefings`) and reported 20/20. A review's adjacent-suite list is perishable, so I asked
the tree instead: `grep -rln "mechanicsManifestLine\|MechanicsManifest\|contract-board-mechanics" e2e/`
returns **10 files**, of which one is the own spec. The runner's list missed the **eight
`er01-e*-census` specs** entirely and named `drill-yard.spec.ts`/`contract-briefings.spec.ts`,
which the grep does not reach. I ran the **union — 11 non-own specs** — and all 84 instances passed.
Nothing was red, so the wider denominator changed no verdict; it changes what the verdict is *worth*.

### The manufactured-defect probe was RE-RUN, not accepted

The runner supplied both `Expected:`/`Received:` halves, as the master required. A green on an
inherited probe is still an inherited claim, so I reproduced it in `gate-s1506`:

1. Pre-probe `src/agent/MechanicsManifest.ts` → `sha256:e3aa742e5a7749e3`.
2. Replaced the cured expression with the **exact** pre-cure line, leaving everything else alone.
3. `-g "the derived manifest rides THE VIEW"` → **2 failed, desktop AND mobile**, both at
   `e2e/agent-view.spec.ts:354`:
   - `Expected: toContainText('straw men')`
   - `Received: "This claim speaks: assay tent faucet, drill bell, rolling logs, **straw mans**, drill wave, ledger free practice, practice buildables, practice gold grant, practice target respawn, the river, water crossings."`
4. Restored → `sha256:e3aa742e5a7749e3`, **identical**, and `git status` in the gate worktree
   reports only the untracked `node_modules` symlink. The probe left no residue.

⭐ **The probe also proves the master's crux, and it does so for free.** The pre-existing assertion
at `:348-352` compares the DOM against `mechanicsManifestLine(...)` computed *in-test* — the
renderer against itself. With the defect reinstated, execution reached **`:354`**, which means
`:348-352` **passed while the card said "straw mans"**. The old test could not see this bug; that
is measured here, not argued.

## Findings

**F-1506-1 — `scripts/node-guards-timeout.test.mjs` is red in the LANE shell and green in the FIRE
shell on the same tree. NON-BLOCKING; not attributable to this slice.**

The runner reported `test:node-guards` red outside its firewall — *"343 passed, 2 failed from the
same `node-guards-timeout.test.mjs` boundary where an explicitly bounded sibling times out at
1000 ms"*, observing **~1003–1006 ms**, and stated it reproduced standalone. It does **not**
reproduce here:

| Arm | Shell | Result |
|---|---|---|
| Full battery on the merged tree | fire | **rc=0**, 345 tests, **fail 0** |
| `node scripts/node-guards-timeout.test.mjs` standalone | fire | **2/2 pass**, the bounded sibling at **4093 ms** |

Both measurements are facts and the denominators agree (345 both sides), so this is the *same*
battery giving two answers — the failure is environmental, not a tree defect. ⚠️ **The attribution
is a hypothesis and is recorded as one:** the lane shell runs 6 playwright workers and the fire
shell serialises, so a guard asserting a **~3–6 ms margin** against a 1000 ms boundary is the kind
of assertion that reads load rather than behaviour. I did **not** reproduce the lane's load, so
"concurrent load caused it" is **UNVERIFIED**. What *is* verified is that a timing-boundary guard
in the battery disagrees with itself across shells — the F-1269-1 / shell-is-the-instrument shape,
here pointing the opposite way from usual (the lane, not the fire, is the starved arm).

Recorded rather than repaired: the runner was right to report it and right not to touch it, and
the diff under review touches only `src/agent/`, so `test:node-guards` was not even a mandatory
gate for it (F-1460-1 keys on `src/sim/`, `src/systems/`, `src/entities/`). I ran it anyway
*because* the runner flagged it — a red nobody investigates is worse than no test.

## Player-visible

Yes. The Drill Yard contract briefing card now reads **"straw men"**. Screenshots ride in the
merge at `artifacts/f1501-4-manifest-plural/` (desktop 876×496, mobile 963×1702) and I **read both
by eye** per F-1332-2, in the ordinary board frame with no `?debug`:

- Desktop: *"This claim speaks: assay tent faucet, drill bell, rolling logs, **straw men**, drill
  wave, …"* — `rolling logs` sits directly beside it, unchanged, which is the sharp control
  rendering correctly rather than merely asserting correctly.
- Mobile 390px: same line, wrapped across five lines, no clipping or overflow; the card's Goals,
  Rules and *Enter the yard* affordance all remain within the viewport.

⭐ **One thing the screenshots show that no assertion in this slice tests, and which raises my
confidence that F-1501-4 was a genuine player-facing defect rather than a pedant's catch:** the
card's *hand-authored* prose already read *"the county lends the gold; **the straw men** lend their
patience"* one paragraph above, and its Goals list already read *"Practice on the **straw men** and
rolling logs."* So before this merge the card contradicted itself in two directions within ~40
words — authored copy saying "straw men", derived copy saying "straw mans". That is exactly the
seam a player reads as sloppiness, and it is now consistent.
