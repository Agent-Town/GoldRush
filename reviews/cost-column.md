# cost-column — HarnessDev C: the county board learns what a run COST

- **Slice:** `cost-column` (HarnessDev ladder item C, owner-approved 2026-09-03)
- **Branch / tip:** `lane/c` @ `bbcad2bc26ff15fa2f250e81362911a03ba05838`
- **Gated commit / merged as:** `083a95ce1a8f7b4c023745dec5c053eafcfe3b63`
- **Base:** `125e2faa3e62736222a255ed6384c459918e3e5c`
- **Drained by:** s2468, 2026-09-03

## VERDICT: MERGED — gates green, one named measurement deliberately not taken (see Findings F-2468-2).

## What it does

The county's Claim board could tell you *how well* a rider did and never *what it
cost*. This slice adds the cost column: `functions/api/standings.ts` accepts and
publishes per-run orders / calls / duration alongside the existing score keys, and
`site/assay-office.js` + `site/index.html` render those cells on the board plus a
theme-aware, responsive cost-vs-waves chart on the landing. `public/skill.md`
gains the door-side grammar for the new fields so an agent can declare them.

This is the HarnessDev paper's "cost" axis (arXiv:2609.01437): a result that
reports quality without cost is not comparable across harnesses.

**Player-visibility (Mistake #10):** the surface is the public landing and the
Claim board — a plain boot at `/`, no `?debug`. `e2e/cost-column.spec.ts` asserts
the cells and the chart render from `site/index.html` as served, on desktop AND
390px mobile, and asserts `errors` is empty (console + pageerror listeners).
Screenshots: `reviews/shots-cost-column/` (4 — cost-column + cost-chart, both
projects).

## Evidence — gated on the MERGED tree in a detached worktree (`gate-s2468`, §3.0b)

Undecided content never entered main's working tree or index. Main was
fast-forwarded to the exact gated commit, so **what shipped is byte-identical to
what was measured** (`083a95ce1`, parents `125e2faa3` + `bbcad2bc2`).

| Gate | Result | Wall |
|---|---|---|
| `npx tsc --noEmit` | **rc=0** | 7.5 s |
| `npm run build` | **rc=0** | 24.1 s |
| `e2e/cost-column.spec.ts` (own spec) `--workers=1` | **rc=0 — 2 passed / 0 failed**, desktop + mobile | 7.3 s |
| `e2e/lb-01-county-standings.spec.ts` + `e2e/en-01-claim-ledger.spec.ts` | **rc=0 — 30 passed / 0 failed**, both projects | 86.4 s |
| `e2e/skillmd-door.spec.ts` | **rc=0 — 2 passed / 0 failed**, both projects | 2.5 s |
| `npm run test:stats` | **rc=0** | 8.1 s |
| `scripts/skillmd-guard.test.mjs` + `scripts/site-contract.test.mjs` | **rc=0** | 5.1 s |
| Console / page errors | **zero**, asserted in-spec (`expect(errors).toEqual([])`) | — |

Adjacent suites were chosen from the diff, not guessed: `standings.ts` →
`lb-01-county-standings` + `en-01-claim-ledger`; `public/skill.md` +
`skillmd-guard.test.mjs` → `skillmd-door` + the guard itself; `site/*` →
`site-contract`; `test-standings.mjs` → `test:stats`.

⚠️ **One correction worth recording, because it nearly became false evidence:**
my first adjacent-suite invocation named `e2e/county-standings.spec.ts`, which
**does not exist**. Playwright exited **rc=0** having silently run only the other
file in the argument list. An rc=0 from a suite that never ran is
indistinguishable from a green — the F-2215-1 trap. It was caught by reading the
test COUNT (2, not ~30), not the exit code. The real filename is
`lb-01-county-standings.spec.ts`, and the 30-test result above is from that run.

## Merge classification

Clean 3-way merge, **zero conflicts**. 12 files, +213 / −18. Every path is
LANE-TOUCHED; main moved none of them between `125e2faa3` and the merge, so no
graft or hand-resolution was required. `tasks/BACKLOG.md` moves by exactly one
line — the runner marking its own ladder row `🚧 lane-c implementation` — and
s2468's `F-2468-1` row, filed earlier in the same fire, survives the merge
intact (verified by count, not assumed).

## Findings

**F-2468-2 — `npm run test:node-guards` was named by the master and NOT run in
full. This is an OWED MEASUREMENT, not a closed item.**

The master's self-check names `test:node-guards` (~530 s, and it is the battery
the law says must be run **ALONE**). At gate time **three lane runners were live**
(`lane-a` f2466-1, `lane-b` harness-receipts, `lane-d` refusal-taxonomy) at
**load average 27.91 on 16 CPUs**. F-2462-1 measured a **2.9× swing on a timing
assertion** under exactly this condition and rules that a self-contaminated
battery's red "is not evidence in either direction"; F-2462-3 measured the same
inflation across a handoff. Running it here would have produced either a green
(trustworthy, since contention inflates reds rather than manufacturing greens) or
a red that is **not evidence** — at a cost of 9+ minutes baseline and materially
more under this load.

What was done instead, and why it is proportionate rather than a thinned gate:

1. The **F-1460-1 mandate does not bind this slice.** That rule makes
   `test:node-guards` compulsory when the diff touches `src/sim/`, `src/systems/`
   or `src/entities/`. **This diff touches none of them** — it is
   `functions/` + `site/` + `e2e/` + `scripts/` + `public/`.
2. The **two leaves of that battery whose subjects this diff actually changes**
   were run directly and are green: `scripts/skillmd-guard.test.mjs` (edited by
   this slice) and `scripts/site-contract.test.mjs` (`site/*` edited).

➡️ **Owed:** a full `test:node-guards` run, **ALONE**, on the next quiet board.
It is recorded here rather than silently skipped because a gate you did not run
is not a gate that passed.

## Ledger

- Goal leaf `cost-column` → `merged` @ `083a95ce1a8f7b4c023745dec5c053eafcfe3b63`
- Done-move renamed `drained-s2468-083a95ce1-…`
- GZ-01: player-visible (the board gains a cost column, the landing a chart) →
  gazette item filed.
