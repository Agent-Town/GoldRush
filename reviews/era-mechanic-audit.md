# era-mechanic-audit — drain review (s2457)

**Slice:** `era-mechanic-audit` (L1 of the ladder + story batch, attended 2026-09-02)
**Branch:** `lane/d` · **gated commit:** `4f960c21a` (`runner(lane-d): era-mechanic-audit.md`)
**Base:** `d348c58cc` · **Merge:** `28e7984251d8263f8609058d8a5a9f330999654f`
**Gated in:** detached worktree `gate-s2457` (§3.0b)

## Verdict

**MERGE.** A documentation-and-evidence slice: 34 files, +494, −0, confined to
`artifacts/era-mechanic-audit/**` (32), `docs/audits/**` (1) and `tasks/BACKLOG.md` (1). Zero
`src/`, zero `scripts/`, zero `e2e/` — exactly the master's allowed paths.

## What it does

It rides every admitted E3–E10 door contract once through `gr-sim` and judges, per contract,
whether the era's *signature mechanic* actually fires in the headless rider. The verdict is
**9 EXERCISES · 3 PARTIAL · 14 RESKIN · 6 UNRIDDEN** over a 32-contract corpus of which
`public/skill.md` admits 26 — the six absent ones being exactly the six `gr-sim` refusals, each
preserved verbatim rather than guessed at.

**The headline is a refutation of its own task's premise, and it is the reason this slice matters.**
The master inherited the belief that E4, E8 and E9 have *no engine system*. The audit measured that
false and names the systems with file:line — `ConvoyBehavior`, `RoadNetwork`, `WeatherSystem`
(E4), `E8PhysicsSystem` (E8), `SeedCaravanSystem` / `CanalChoiceSystem` /
`ScheduledRelocationSystem` / `E9CanalSystem` (E9). **The real defect is COMPOSITION:**
`HeadlessContractSim` imports and composes none of the E4 transport/weather systems and no
`E8PhysicsSystem`, and composes only Low Orbit's projectile-return subset
(`src/sim/HeadlessContractSim.ts:52-83`, `:728-744`). E10 has browser systems with the same headless
gap. So the middle saga is not missing mechanics — the *rider* cannot reach them, which is a far
cheaper thing to fix and a different piece of work from what the task assumed.

## Evidence

| Leg | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **rc=0**, 22.6 s, zero output |
| `npm run build` (merged tree) | **rc=0**, 75.7 s |
| diff confinement | 34 files — `artifacts/` 32 · `docs/` 1 · `tasks/` 1 · **OTHER 0** (enumerated, not sampled) |
| ride evidence | 32 logs under `artifacts/era-mechanic-audit/`, one per contract, each carrying its wave count and `eventLogHash` |

**Stated honestly: `tsc` and `build` are CONTROL legs here, not discriminating ones.** The diff
contains no code, so neither can differ from main by construction; they are run to prove the merged
tree is sound, not to test the slice. The slice's real evidence is the 32 preserved ride logs and
the file:line citations behind every table row, which I spot-checked against the merged tree.

## Merge classification

Base `d348c58cc`; 34 files, +494, **−0**, no conflicts.

| File class | Class | Resolution |
|---|---|---|
| `artifacts/era-mechanic-audit/*.log` (32) | LANE-ONLY (new) | ride evidence, none present on main |
| `docs/audits/2026-09-02-era-mechanic-audit.md` | LANE-ONLY (new) | the audit itself |
| `tasks/BACKLOG.md` | BOTH-MOVED | 1 added line; auto-merged, main's rows untouched |

⚠️ **I gated and merged the PINNED COMMIT `4f960c21a`, not the branch `lane/d`.** A live runner
holds that worktree (`human-tape-true-reel-stamp`, dispatched 22:18) and the branch ref can move
under a gate. `main..lane/d` is therefore *not* expected to be empty, and that is not a false-ahead:
the audit's content is on main, verified by `git merge-base --is-ancestor 4f960c21a main` → **YES**.

**Custody note (Mistake #2, the Reset Massacre).** When I found this done-move, lane-d had already
been refilled and its new master's pre-flight carries the F-1266-1 evidence-artifact exception —
which pardons `artifacts/**` and would have **discarded this audit's 32 ride logs on reset**. The
work survived only because the runner auto-committed it. Before doing anything else I pinned it:
`archive/era-mechanic-audit-s2457-1e2ad5473`. History first, then the gate. The ref is kept (it now
duplicates main, so it costs nothing and it is how a future reader finds the pre-merge tip).

## Findings

**F-2457-4 — the audit's own conclusion is the finding, and it is not a fire's to act on.** Fourteen
RESKIN and six UNRIDDEN verdicts across E4–E10 mean most of the middle saga's *ladder mechanics do
not fire for a headless rider*, and the cause is composition in `HeadlessContractSim`, not absent
systems. That reframes the ladder work the batch was authored against: the cheap fix is to compose
the existing systems into the headless rider; the expensive one is to treat the eras as genuinely
unbuilt. Which of those the saga wants is a **design/scope question for the owner and an attended
spec**, so it goes to the desk rather than into a master. Nothing is broken for the player — the
browser game composes these systems; it is the *rider* (and therefore agent reels and bench
evidence) that cannot reach them. Evidence: `docs/audits/2026-09-02-era-mechanic-audit.md`.

**No finding against the slice.** The audit declares its own honesty limit rather than papering
over it — `gr-sim` does not serialize the event list, so mechanic invocation is judged from
rider-visible diagnostics and *"no hidden event contents are guessed"* — and it refuses to invent a
runtime verdict for any contract the door would not construct. That is the house standard
(reject-don't-stretch, Mistake #14) executed without being asked.
