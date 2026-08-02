# f1410-1 — bound the guard battery's file concurrency in the fire shell

**Slice:** `f1410-1-bound-the-guard-battery-file-concurrency-in-the-fire-shell`
**Branch/slot:** main slot (runner output, uncommitted working tree) · run `20260803-014024`
**Base:** `c43fdb51` (s1411 lock) · drained s1411, 2026-08-03
**§3.0 block-check:** ✅ CLEAR (read as the WORD, `--strict`), leaf `status="queued"`

## VERDICT: MERGE — and the fire-shell integer is RULED `1`, on evidence I took myself.

## What it does

`npm run test:node-guards` is the battery every fire drain gate runs. It used to be
`node --test <40 files>`, and `node --test` schedules FILES concurrently (~15 in flight on this
16-cpu box). In a fire shell that crosses the F-1269-1 CPU ceiling and starves the child processes
inside `scripts/gr-sim.test.mjs` until they hit their own budget — F-1409-1's measured flake.

The slice adds a pure decision module (`scripts/node-guards-concurrency.mjs`), a launcher that
re-spawns `node --test [--test-concurrency=n] <files>` while keeping `package.json`'s roster as the
single source of truth (`scripts/run-node-guards.mjs`), and a two-directional guard
(`scripts/node-guards-concurrency.test.mjs`, file 41 of the battery). It mirrors the two ratified
shell-keyed cures exactly: `playwright.config.ts` `workers: isFireShell` and `scripts/cross-engine-skip.mjs`.
Four files, one of them a single `package.json` line. Nothing in the battery's *contents* moved.

## The failure mechanism, named before it is measured

`scripts/gr-sim.test.mjs` caps each child at **30 s** — `:23`, `:41`, `:51`, `:103`, `:190`
(`spawnSync(..., { timeout: 30_000 })`). On timeout `spawnSync` returns `status: null`, and
`:27` `assert.equal(first.status, 0, first.stderr)` then fails on `null !== 0`. That is why
F-1409-1 saw *a different test fail per run, always with an inflated duration*: it is a **budget
kill, not a determinism failure**. So the question this drain must answer is not "did the flake
go away" but **"how much headroom is there to a fixed 30 s cliff"** — and one run answers that,
where a flake-rate claim would need dozens.

## Evidence — fire shell, Node v26.4.0, `CLAUDE_CONFIG_DIR=~/.claude-fires`, same hour, interleaved arms

Every arm ran the identical 41-file roster extracted from the merged `package.json`.

| arm | wall (s) | rc | tests/pass/fail/skip | gr-sim `replays…byte-for-byte` (s) | gr-sim `boots escort mode` (s) |
|---|---|---|---|---|---|
| control — `node --test`, default concurrency | 99.0 | 0 | 238/235/0/3 | — | — |
| control | 88.2 | 0 | 238/235/0/3 | **27.90** | 14.17 |
| control | 100.5 | 0 | 238/235/0/3 | **36.78** | 14.91 |
| **control mean** | **95.9** | | | **32.34** | **14.54** |
| `--test-concurrency=4` | 84.0 | 0 | 238/235/0/3 | 13.77 | 17.44 |
| `--test-concurrency=4` | 97.0 | 0 | 238/235/0/3 | 18.25 | 22.68 |
| **conc=4 mean** | **90.5** | | | **16.01** | **20.06** |
| **cured — launcher, conc=1** | 148.4 | 0 | 238/235/0/3 | **7.25** | 8.68 |
| **cured — launcher, conc=1** | 138.7 | 0 | 238/235/0/3 | **9.56** | 9.69 |
| **conc=1 mean** | **143.6** | | | **8.41** | **9.18** |
| *reference — `gr-sim.test.mjs` alone, nothing else running* | *37.4 total* | 0 | 6/6/0 | *5.38* | *10.77* |

**Margin to the 30 s cliff.** The `replays…byte-for-byte` test is three 30 s-capped spawns:

| arm | mean per spawn | share of the 30 s budget |
|---|---|---|
| control | ~10.8 s | **36%** (worst single run: 12.3 s, **41%**) |
| conc=4 | ~5.3 s | 18% |
| **conc=1 (merged)** | **~2.8 s** | **9%** |

**Full gate, through the merged launcher:** `npm run test:node-guards` → **rc=0, 144.1 s,
238 tests / 235 pass / 0 fail / 3 skipped**; chained guards `findings-state` PASS ·
`blocker-panel-closed` PASS · `ruling-propagation` PASS · `desk-declaration` PASS.
`npx tsc --noEmit` clean · `npm run build` green (built in 2.37 s).

**The reason string is printed and legible**, so a fire's green can never be misread as a
full-concurrency run: `FIRE SHELL — test:node-guards ran with reduced file concurrency 1
(F-1409-1/F-1410-1); this is the conservative default pending fire-side measurement.`

## Two things I verified rather than inherited, and one of them was a real hole

**1. rc-propagation on the FIRE branch — the runner proved only the lane branch.**
`scripts/node-guards-concurrency.test.mjs:31` does `const { CLAUDE_CONFIG_DIR: _fire, ...laneEnv }`
— it deliberately strips the discriminator, so the shipped guard exercises rc-propagation *only*
through the `undefined`/no-flag path. In a fire shell the launcher takes the **other** branch
(it appends `--test-concurrency=1`), and that is the branch every drain gate actually runs.
A launcher that swallowed rc there would be a gate that cannot fail — strictly worse than the
defect being cured. **Manufactured, not assumed:** a failing fixture through the fire branch →
`direct rc=1`, `launcher rc=1`, fire branch confirmed taken (reason string present),
`rc propagated exactly: true`. Filed below as F-1411-2; the code is correct, the *guard* is narrow.

**2. Gate topology — a graph question, so I asked the graph.**
`scripts/gate-caller-audit.mjs:166` computes the rooted set from `edgesOf(scripts['test:node-guards'])`.
Replacing `node --test <files>` with `node scripts/run-node-guards.mjs <files>` could have dropped all
41 files out of the rooted set — a silent, board-wide coverage hole that a green battery would not
show me. Run live on the merged tree: **PASS**, `roots 68 · reached 108 · subjects 38 · orphans 8`,
and all 8 orphans are the pre-existing grandfathered set (`test:asset-diet`, `test:ledger-guards`,
`verify:visual`, `test:preview`, `test:release`, `anim-pass-dupecheck`, `attended-owed-audit`,
`status-archive-audit`). No battery file is among them.

**Adjacent suites, derived by grep not from the runner's list:** `grep -rl "test:node-guards"` over
`scripts .claude package.json e2e src` returns the parsers `script-tree-parse.test.mjs`,
`gate-caller-audit.{mjs,test.mjs}`, `run-guards.{mjs,test.mjs}`, `desk-declaration-guard.test.mjs`,
`wave-scaling-cross-engine.test.mjs` — **all six are members of the battery and green above**.
`scripts/run-guards.mjs:43` invokes `npm run test:node-guards` as a member of `test:guards`, so the
superset is exercised through the same green. No `src/**` or `e2e/**` change, so **no boot probe and
no screenshots are owed** — nothing player-facing moved.

## The ruling: keep `1`

The master left the integer to the draining fire. `4` was the tempting alternative — it is the
fastest arm (90.5 s mean, *faster than control*) and it halves the replay inflation. **I am not
taking it**, on the evidence:

- `1` is the only arm that returns **both** named tests to their isolated durations (replay
  8.41 s vs 5.38 s alone; escort 9.18 s vs 10.77 s alone — *below* it). The ceiling is relieved.
- `4` improves replay (32.3 → 16.0) while making escort **worse** (14.5 → 20.1). Helping one test
  by the same amount it hurts another is the signature of **redistributing** load, not relieving
  it — and F-1409-1's whole point is that *a different test fails each run*, so an arm that only
  moves the load around has not addressed the class.
- Cost, stated plainly rather than buried: **+47.7 s per battery run (+50%)**, paid by every drain.
  Against F-1409-1's measured tax of roughly one drain in three drawing a false red — where each
  such red has cost a whole fire (F-1408-2 held a correct cure for a full fire; s1407 burned
  54,875 tokens on a stopped dispatch) — 48 seconds is not a close trade.
- At n=2 per arm I decline to claim `4` is better *or* worse on wall time. `1` wins on the thing
  that is not noise: margin to a fixed cliff.

## ⚠️ What this evidence does NOT say — the honest negative

**I did not reproduce the flake. Zero failures in 8 full battery runs today, control arms included.**
So I make **no claim of a measured drop in flake rate**, and the next fire must not cite one from me.
What is measured is *mechanism relief*: the child times that produce the failure moved from ~36–41%
of their kill budget to ~9%. That is F-1409-1's own stated signature (inflated durations), read
against the cliff I located in the source. A flake-rate claim would need dozens of runs at ~2 min
each; this argument needs one, which is the point of finding the cliff first.

## Findings

- **F-1411-1 (🟢 RULED, no action):** the fire-shell integer stays `1`. `--test-concurrency=4`
  measured faster in wall time but redistributes rather than relieves the ceiling (helps
  `replays…byte-for-byte`, hurts `boots escort mode`). Revisit only with a fire-side arm that shows
  **both** named tests near their isolated durations at a value >1.
- **F-1411-2 (🟡 non-blocking, guard narrowness — NOT a code defect):**
  `scripts/node-guards-concurrency.test.mjs:31` strips `CLAUDE_CONFIG_DIR` before the
  rc-propagation assertion, so the shipped guard proves rc-propagation only through the lane
  (no-flag) branch — never through the fire branch that every drain gate takes. I proved the fire
  branch by hand this drain (transcript above). A future slice could pass a fabricated
  `CLAUDE_CONFIG_DIR` in a third case; it is one assertion. Not blocking: the branch is proven
  correct *today*, and the two-directional decision guard already pins the branch selection itself.
- **F-1411-3 (🟡 informational):** the battery roster is **40 files pre-slice, not 39** as
  `scripts/fire.md` and the f1410-1 master both state (41 with the new guard). The runner caught
  this and said so. The number appears in prose only — nothing computes on it — but two law
  surfaces now carry a stale count. Correct it opportunistically; do not author a slice for it.

## Merge classification

Main-slot output: three **new** files (pure adds, no conflict surface) plus one modified line in
`package.json`. Main moved only via my own `c43fdb51` lock commit, which touches `STATUS.md` only —
**no file in this slice was touched by main**, so there is no graft question. `logs/**` churn is the
factory's own accounting (F-1407-1 exception) and is deliberately **not** committed here.
Path-scoped add of exactly the four TOUCH-ONLY paths.
