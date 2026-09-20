# Review — ap16-audit (AP-16-0, the same-game audit)

**Slice:** `ap16-audit` — THE SAME-GAME AUDIT: enumerate every human/agent rules divergence
**Branch:** `lane/a` · **tip** `727eb88b9113a2c668adb55552904b60772d2d6c`
**Base:** `1c7d89c3e` (main at gate time) · **Merge:** `857e888998d262977e1469278dbc618e93b2b7e0`
**Drained:** s1628, 2026-08-10 · gated in detached worktree `gate-s1628` per §3.0b

## VERDICT: MERGED — green on every gate, numbers verified independently rather than inherited.

## What it does

The owner ruled on 2026-08-10 that "agents and humans play the same game/contracts/use the same
abilities and rules", after noticing agents never use the grenade and never draft upgrades. The
spec `specs/agent-play/ap-16-same-game-law.md` banked four divergences verified at file:line. This
slice turns that anecdote-sized table into a **mechanical enumeration**, so the closure slices
(AP-16-1..3) cut against a measured list.

Three new files and a one-token package.json edit:

- `scripts/same-game-audit.mjs` (306 lines) — walks every contract in every epoch bundle and emits
  one row per parity question across five surfaces (`buildable · ability · choice · verb · economy`),
  each row carrying `humans-get`, `agents-get`, a direction, and **file:line evidence**. Emits both
  `--json` and a markdown table. Stdlib-only, read-only, no game behaviour touched.
- `docs/bench/same-game-audit.md` (1707 lines) — the generated report; the baseline the era stamp
  will point at.
- `scripts/same-game-audit.test.mjs` — pins the harness's ability to SEE the four ratified
  divergences (to be inverted to assert *absence* as AP-16-1..3 land), plus row-schema stability.
- `package.json` — wires the test into `test:node-guards`.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green, 1.32 s** |
| Own test `same-game-audit.test.mjs` | **3/3 pass**, 0.60 s |
| `test:node-guards` (full, run ALONE per s1537) | **rc=0, 311.7 s**, 61 leaves |
| New leaf actually executes in the battery | **YES** — enumerated at **position 0**; runner invoked on that leaf alone, 3/3 observed |
| `gate-caller-audit.test.mjs` (gate topology) | **26/26 pass** |
| Report reproducibility | **BYTE-IDENTICAL** — fresh harness run vs committed doc, 342,634 b both |
| Firewall | **clean** — exactly the 4 declared files; zero `src/`, `e2e/`, `functions/` |
| Boot probe | **not run, deliberately** — see below |
| `main..lane/a` after merge | **empty** (fully absorbed) |

### Audit output, measured in my own shell (not taken from the runner's report)

| Quantity | Value |
|---|---|
| contracts walked | 42 |
| total parity rows | **1,680** |
| — `agent-lacks` | 984 |
| — `agent-exceeds` | 340 |
| — `equal` | 356 |
| **divergence rows** (excl. `equal`) | **1,324** |
| rows lacking `file:line` evidence | **0** |
| surfaces | buildable 840 · verb 336 · choice 294 · ability 126 · economy 84 |

**On the headline number, which I checked precisely because it could have been the F-1627-1 shape.**
The runner reported "1,324 divergences"; the harness emits **1,680 rows**. That is not a discrepancy
— the difference is exactly the 356 `equal` parity rows, which a *divergence* count properly
excludes, and the committed report states **both** figures under its Summary. The runner's headline
was precise, not lucky. Worth recording because a stable-looking number from a prior fire is exactly
what s1627 caught being manufactured; this one survives being re-derived.

### Why no boot probe, stated rather than skipped

The merge diff is 4 files: two new `scripts/*.mjs`, one new `docs/**.md`, and a single-token
`package.json` edit. No `src/**`, `e2e/**`, or `functions/**` file is touched, so there is no
player-facing surface and no runtime code path that a desktop/390 px boot could exercise. A green
here would be vacuous — it would assert only that main still boots. The 4-file diff stat is the
proof, and it is stronger than the probe would have been.

## Merge classification

Base `1c7d89c3e`. Per-file:

| File | Class | Resolution |
|---|---|---|
| `docs/bench/same-game-audit.md` | LANE-ONLY (new) | taken |
| `scripts/same-game-audit.mjs` | LANE-ONLY (new) | taken |
| `scripts/same-game-audit.test.mjs` | LANE-ONLY (new) | taken |
| `package.json` | **BOTH-MOVED** | **3-way graft** |

`package.json` was the only conflict, and it is the ordinary shape for a battery-leaf edit: main had
gained `master-shipped-classifier.test.mjs` and `src/encyclopedia/stackDirectory.test.mjs` at the
tail (from the s1626/s1627 drains) while the lane inserted `same-game-audit.test.mjs` at the head.
Resolved by keeping **both sides** — verified token-by-token rather than by eye: 63 leaves on HEAD,
62 on the lane, symmetric difference exactly those three files, chained tails (`test-ticker-stats`,
`test:findings-state`, `test:blocker-panel`, `test:ruling-propagation`, `test:desk-declaration`,
`nul-audit`) confirmed byte-identical between the two sides before grafting.

**Merge window: zero.** Main was fast-forwarded to the *gated commit itself* — the gate worktree's
merge commit had main's tip as its first parent and `lane/a` as its second — so no merge was ever
staged in main's index. F-1589-5 is satisfied here by construction rather than by working quickly.

## Findings

**F-1628-1 — LOAD AVERAGE IS THE WRONG INSTRUMENT FOR PRICING A FIRE'S DRAIN BUDGET, AND THREE
FIRES HAVE NOW CUT THEIR BUDGETS ON IT.** *Non-blocking; a measurement, not a defect in this slice.*

s1627 cut itself to ONE drain in 34 minutes citing "the box sat at load 16–25", and escalated
F-1626-2 to "a THREE-fire standing condition, not an incident; price it into the plan". This fire
arrived to find load average **175.54 / 136.20 / 90.58** — by that reasoning, unusable.

Measured instead of assumed:

| Probe | Result |
|---|---|
| `npx tsc --noEmit` on clean main | **4.4 s** (fast; no degradation) |
| `top -l 2` CPU | **67.4% then 73.9% IDLE** |
| cores | 16 |
| top CPU consumers | `fseventsd` **102%**, `mds`/`mdworker_shared` ×8 — Spotlight, not the factory |
| live `codex exec` runners | **zero** |

macOS load average counts threads in **uninterruptible I/O wait**, not just runnable ones. An
`fseventsd` + Spotlight indexing storm therefore inflates it without competing for CPU: ~11 of 16
cores were idle at "load 175". The full 311.7 s `test:node-guards` battery then ran **rc=0 with zero
contention stamps** under exactly that load.

⚠️ **What must NOT be concluded is that s1626/s1627 were wrong about their hangs.** s1627's
`test:ledger-guards` genuinely hung >31 min at load 84, and s1626 hit a real contended battery —
but the cause named in both cases was *concurrent batteries cycling against shared fixtures*
(F-1537-1), which is a **contention** fact, not a **load** fact. The two got conflated, and load
average — the number that is always to hand — became the proxy. It is a bad one in both directions:
it reads 175 when the box is two-thirds idle, and it would have read modestly during s1627's genuine
fixture collision.

➡️ **The discriminator that actually works is cheap and was available all along: `top`'s idle %, plus
`pgrep` for a live `codex exec` or a second battery.** A fire deciding whether to open its budget
should ask those two questions, not read `uptime`. This fire ran the full PILE MODE budget on that
basis and the instrument held.

**No blocking findings.** The slice measures and changes nothing; its own test passes; its report is
reproducible from its own harness.

## Notes for the closure slices (AP-16-1..3)

The audit's four **new** classes beyond the spec's seed — these are the harness's measured claims,
recorded here as its output rather than as my independent re-verification:

1. **Contract reachability** — 30 contracts can launch in the browser but are rejected by the
   headless door without a declared mode.
2. **Browser-menu vs door** — 203 buildable rows disagree even after separating the browser menu
   from the contract manifest.
3. **Build orientation** — human `place_build` tapes carry `rotationSteps` 0..3; the standing-order
   `BUILD` path omits rotation and defaults to 0.
4. **Tape-only actions** — `restart`, `debug_spawn`, `debug_xp`, `skip_ceremony`, `set_pause`,
   `pick_upgrade`, `context_action`, `set_agent_rung`, `set_agent_ability` have no standing-order verb.

Widest gates: `e10-archive-world`, `e10-ember-shore`, `e10-last-claim`, `e10-river`, `e4-boneyard`
(34 divergences each).
