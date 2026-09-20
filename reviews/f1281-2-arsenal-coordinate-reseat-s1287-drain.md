# s1287 drain — F-1281-2 arsenal turret coordinate reseat

## Verdict

**MERGED.** Test-only coordinate reseat. The stale turret coordinate in *"Auto-Pan upkeep and boiler
battery bands consume the fixed-step pressure store"* moves `(0, 10)` → `(10, 12)`. The load-bearing
landmark-solidity rule is untouched, which is the whole point of the slice.

- Slice: `lane-a-f1281-2-arsenal-coordinate-reseat`
- Branch: `lane/m3`, tip `c362ab95` (`runner(lane-a): …`)
- Lane base: `cf4dddb9` · merged onto main at `4978af8c`
- Runner's own review: `reviews/f1281-2-arsenal-coordinate-reseat.md` (kept, not superseded)

## What it does

`e2e/e2-arsenal.spec.ts` asked `placeFree('turret', 0, 10)` to return `true`. Since `5e527a28`
(2026-07-19) that point sits inside the non-walkable authored footprint `hill-mine:boiler-house-site`,
so `Terrain.isBuildable` returns `false` and the assertion had been red for twelve days. The fix moves
the coordinate to a measured-open tile and leaves the rule alone. A comment at the call site names
F-1281-2 and warns the next reader off the footprint.

## §3.0 block check

`node scripts/drain-block-check.mjs 20260731-115934-lane-a-f1281-2-arsenal-coordinate-reseat.md --strict`
→ **CLEAR**, and it *matched a leaf* (`f1281-2-arsenal-coordinate-reseat`, `status="planned"`). Run with
`--strict` deliberately: a default invocation returns 0 for UNKNOWN as well as CLEAR, so only the strict
form distinguishes "allowed" from "never registered".

## Merge classification

`node scripts/lane-freeze-classify.mjs lane/m3` → `ahead=1 base=cf4dddb9 paths=6`:

| Bucket | Count |
|---|---:|
| DUPLICATE | 0 |
| LANE-ONLY | **6** |
| MAIN-ONLY | 0 |
| BOTH-MOVED | **0** |

Every path `main == base`, so a path-scoped checkout takes the lane's change and none of main's. No
graft judgement was required. Post-graft the working tree is **byte-identical to the lane tip**
(`git diff lane/m3 -- <paths>` empty).

## Firewall

The master's firewall was `NO: src/** — any file, any line`. **Held exactly:**
`git diff cf4dddb9 lane/m3 --name-only -- src/` → **0 files**. The merged delta is one test file, four
scratch probe artifacts and the runner's review.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, built in 1.96s |
| Own spec `e2-arsenal.spec.ts`, both projects, `--workers=1` | **6/6 passed** (31.3s) |
| `npm run test:node-guards` | **rc=0** · findings-state 135 subjects / 114 closed / 21 open, double-state 0 · ruling-propagation PASS (3 RULED / 18 refusing / 0 stale) |
| Adjacent battery (grep-derived), both projects, `--workers=1` | 29 passed / 5 failed / 2 skipped — all five attributed below |

Boot probe **deliberately not run, and here is why** rather than a silent omission: the merged delta
contains **zero product code** (`src/` firewall proven empty above), so nothing the player can see
changed and a boot probe could not distinguish this tree from main. The gate that *does* carry
information here is the own-spec run, which is green on both projects.

## Adjacent suites — derived by grep, not from the runner's list

`grep -rn "placeFree(" e2e/` surfaced ~40 call sites; the specs exercising the same landmark/placement
rule are `landmark-collision`, `e2-hill-mine`, `e2-pressure-in-run`, `run-suspend`. All four were run.

**All five reds are structurally not mine.** The three red specs are **byte-identical to main**
(`git diff HEAD --name-only -- <them>` empty), and this drain's only executable change is one
coordinate *inside a different spec file*. Playwright gives each spec its own page; there is no causal
path. Attribution per red:

| Red | Projects | Status |
|---|---|---|
| `Hill Mine render descriptor auto-activates mesh relief and leaves the flat claim fallback alone` | both | **Documented known red** — `logs/suite-red-inventory.md:105-106,441`, measured 35/50 (70.0%) on both projects. Consistent. |
| `later-era modeled plaza props use their authored Town footprints` | desktop | **Undeclared, and a load flake** — absent from the inventory; **passes in isolation** (5.0s). |
| `coal feeds boilers, pressure vents, and PRESSURIZE completes` | **both** | Inventory declares this **MOBILE-ONLY** (`:107`, `:347`). The desktop arm failed anyway. See F-1287-1. |

## Findings

**F-1287-1 — the inventory's `MOBILE-ONLY` qualifier on *"coal feeds boilers, pressure vents, and
PRESSURIZE completes"* is falsified; the desktop arm fails too.** `logs/suite-red-inventory.md:107`
records the red as `MOBILE-ONLY` and `:347` repeats it. Measured today on a tree byte-identical to main
for that spec: desktop failed in the adjacent battery, then failed again **isolated**
(`--project=desktop-chrome -g …`). ⚠️ **But it is NOT deterministic, and I nearly recorded that it was.**
A third run, same command, same shell, **passed** (6.8s). So the honest statement is: the desktop arm
fails at an **unmeasured rate > 0**, and the inventory says it cannot fail at all. A scope qualifier is
a claim about a denominator nobody re-ran.
**GATE: measure a rate on an idle machine (`--repeat-each`, both projects) before editing the inventory
or repairing the test.** Same gate shape as F-1286-2, and for the same reason — this machine had a
lane runner on it.
Non-blocking for this merge: the spec is untouched by it.

**F-1287-2 — the runner discharged two separate report duties with one point (non-blocking,
bookkeeping).** The master asked for *"at least one rejected candidate and why"* **and**, separately,
*"the old-coordinate control still failing"*. The runner's review satisfies both with the same point,
`(0, 10)` — the known-bad coordinate. The intent of the rejected-candidate duty was to prove the chosen
tile came from a *search* rather than a lucky guess, and re-rejecting the coordinate you were sent to
replace cannot show that. ✓ **The intent is nonetheless met by other means, which is why this is not a
rejection:** the review enumerates **every** blocker registered for the contract with the `0.58`
collision pad and reports the chosen point's clearance to the nearest padded edge (`6.06125`), plus all
five door-values measured live on both projects. That is a measurement, not a lucky point.

## Goal registration

Leaf `f1281-2-arsenal-coordinate-reseat` flipped `planned` → shipped with its merge receipt in the
ledger commit that follows this merge (a leaf cannot carry its own merge hash — house precedent
`28485613`, followed by s1286).
