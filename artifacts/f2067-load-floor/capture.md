# F-2067-1 — the F-1101-1 owner-desk ask, re-measured (s2067, 2026-08-19)

Re-measurement of the dated desk premise behind **F-1101-1**, per s2066's NEXT (B).
Board was DRY throughout (6/6 queues empty, no `tasks/CODEX-WALL`, assayer pending 0,
lanes 4/4 USABLE, runner pid 451 alive-and-idle) — i.e. the "factory idle" precondition
F-1124-1 requires was genuinely met, not assumed.

The subject is `tasks/BACKLOG.md:3300`, the 👑 OWNER'S DESK line, which asks the owner to
quiet the box via four ranked levers so the `calibrate-suite-workers-v2` gate
(hard 1-minute loadavg ceiling of 4.0) can pass.

---

## 0. Instrument note — I used the wrong one first, and the ledger had already said so

My first probe was `ps -Ao pid,pcpu,...`. It reported `spotlightknowledged` at **19.4%**.
Thirty seconds later a repeat sampler reported the same process at **~97%**.

The leaf's own `priorBlockedReason` already carried the warning, verbatim:

> Measured with `top -l 2` (true instantaneous CPU; **ps %CPU is a LIFETIME AVERAGE and
> misled the two previous readings of this question**)

So this is the *third* reading of this question misled by `ps`. Every headline number below
is therefore from **`top -l 2`, second sample only**, with the `ps` figures retained as a
cross-check rather than deleted. Where they disagree, `top` is primary.

---

## 1. The box

| fact | value |
|---|---|
| model / cores | Mac16,6 · `hw.ncpu` 16 · `hw.physicalcpu` 16 |
| uptime | **75 days 21:16** — boot `Thu Jun 4 20:48:52 2026` |
| rebooted since s1124 (2026-07-27/28, then "52 days uptime")? | **NO — same boot session** |
| `mdutil -s /` | `Indexing enabled.` |
| repo in the Spotlight index? | **YES** — `mdfind -onlyin <repo> -name STATUS.md` → **12 hits**, incl. all 4 lane worktrees + leftover `gate-s1662/`, `gate-s1689/` |
| `node_modules` trees under the repo | **5** (root + lane-a..d) |

That the box has *not* rebooted matters: it means the s1124 "stuck reindex" is the same
continuous condition, not a fresh burst — the diagnosis is directly comparable.

## 2. The load floor — the gate the desk item exists to satisfy

Kernel `vm.loadavg` (not a `ps` artifact), sampled with the factory idle.

| run | method | samples | min | median | mean | max | **≤ 4.0** |
|---|---|---|---|---|---|---|---|
| s1124 baseline (quoted from `drainNote_s1124`) | — | 8 | 2.99 | 4.24 | 4.19 | 5.56 | **3/8 = 37.5%** |
| s2067 run A | 12 × `sysctl -n vm.loadavg` @30s | 12 | 2.66 | 3.15 | 3.48 | 5.18 | **9/12 = 75%** |
| s2067 run B | 5 × `top -l 2` Load Avg @25s | 5 | 2.86 | 3.03 | 2.99 | 3.12 | **5/5 = 100%** |
| **s2067 combined** | | **17** | **2.66** | **3.09** | **3.34** | **5.18** | **14/17 = 82.4%** |

Run A raw: `3.33 3.00 4.96 5.18 4.21 3.58 2.89 2.67 3.15 3.01 3.15 2.66`
Run B raw: `3.09 3.03 2.86 3.12 2.86`

**The gate's pass rate has gone 37.5% → 82.4%.** The re-queue rule s1124 wrote
("re-queue only if the 1-min average reads ≤ 4.0") is now satisfiable on a first or second
look, where it was a coin flip against.

⚠️ Honest caveat: these are different times of day with different desktop activity, and the
two 4.96/5.18 excursions in run A show the floor still spikes. This is a materially better
floor, not a quiet box.

## 3. The four levers, probed BY NAME

Probed by name deliberately: a top-N sampler only sees a process while it is in the top N,
so absence there produces an under-count, not a zero. `top -l 2` 2nd sample, 5 runs @25s.

| # | lever, as ranked at `BACKLOG:3300` | claimed there | **measured s2067 (`top -l 2`)** | `ps` cross-check |
|---|---|---|---|---|
| 1 | quit ChatGPT.app | **"81%, the biggest single win"** | **0.7%** mean (0.4–1.2) — running, idle | 0.6% |
| 2 | Spotlight-privacy-list the repo | "durable; also stops the reindex recurring" | **72.3%** mean (69.3–75.4) | 98.8% |
| 3 | kill six orphaned `esbuild` daemons | 3rd | **0.0% — ZERO esbuild processes exist** | 0.0%, ZERO |
| 4 | stop the Virtualization VM | 4th | **0.0%** | 1.4% (max 6.9) |

Both instruments agree on the **ranking** and on which levers are dead; they disagree on
spotlight's magnitude (72.3 vs 98.8). Primary figure is `top`'s, per §0.

**The row's ranking is inverted.** It puts the one live lever second and a dead one first.
An owner action spent on levers 1, 3 and 4 buys ~0.7% + 0% + 0% of one core.

Lever 2 alone remains real and remains actionable: ~0.7 of a core held continuously, with
the repo confirmed in the index and 5 `node_modules` trees inside it. The row's prediction
that "1 + 2 alone should drop the floor to ~2.0–3.0" survives — but **lever 2 does all the work**.

## 4. …and the ask is moot anyway

Three later events already retired this request. All three were READ, not inferred:

1. **s1294 / F-1294-1** — the leaf's live `blockedReason` opens: *"OWNER-GATED, AND THE GATE
   CHANGED s1294 — READ THIS BEFORE SPENDING AN OWNER ACTION ON IT. The prior lift condition
   … quit ChatGPT.app, Spotlight-privacy-list the repo, kill the orphaned esbuild daemons.
   **THAT IS NOW FALSE.**"*
2. **attended 2026-08-09 desk sweep** (`fc284845d`, per `note_s1606`) — leaf flipped
   `blocked` → `stopped`, `closureReason`: *"PARKED as KNOWN-LIMITATION … whole-suite runs use
   `--workers=4` by hand; drains never run whole-suite, so the third-attempt premise retires.
   Reversible by one word."*
3. **`tasks/BACKLOG.md:3122`**, the F-1101-1 subject row — carries the same ✅ PARKED annotation.

`node scripts/drain-block-check.mjs calibrate-suite-workers-v2` → `⛔ CLOSED — DO NOT DRAIN`,
`status="stopped"` (terminal-closed); the v1 leaf reads `superseded`.

**So the desk line at :3300 is the one surface of three that was never corrected — and it is
the surface a fire actually reads when it carries the desk forward.** The ruling landed on the
leaf and on the subject row and stopped one line short.

## 5. Recommendation (owner's call — no fire may retire a desk item)

**Retire F-1101-1 from the OWNER'S DESK.** The work it gates is parked, the workaround
(`--workers=4` by hand for whole-suite; drains never run whole-suite) is in place, and three of
its four levers are dead. Nothing is owed.

If it is ever revived, the ask is **one lever, not four**: Spotlight-privacy-list the repo.
And the floor no longer needs it to pass — 82.4% of samples already clear the 4.0 ceiling.

Untouched and still flagged, exactly as s1124 left it: the 4.0 ceiling *itself* may be
miscalibrated (25% utilisation on a 16-core box for a run using at most 8 workers). Softening
a threshold to reach a nicer number is forbidden by the master's own closing rule, and that
binds me as much as the runner — so it is reported, not acted on.

---

Raw sample data: `floor-samples.json` (run A, 12 samples with per-sample top-8).
Scratch probes were written to `/tmp` per F-1665-1 and are not committed.
