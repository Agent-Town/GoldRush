# f2142-1 — bind the campaign harness's terrain to the contract it runs

**Slice:** `f2142-1-campaign-harness-terrain-binding`
**Branch:** `lane/b` · **Tip:** `622506611` · **Base:** `79bb2fab0a8cf3898a6ac8da4b5d844c307e11b5`
**Merged to main:** `f9b8d02f5ed39ac0eb8916627fd7bef23a960f86` (s2143 fire, 2026-08-21)

## Verdict

**MERGE.** The cure is one line, its guard measures the binding rather than the string, the
backward-compatibility pin did not move, and the end-to-end evidence step that the first run
correctly refused was executed by this drain and reproduces the authoring fire's prediction
exactly.

## What it does

`scripts/gr-sim-campaign.mjs:17` fabricates the `globalThis.location` that every SSR-loaded
module reads. It built `http://gr-sim-campaign.local/?debug` — `?debug`, no `contract=` — so
`activeContractSelection()` found no requested id and returned the **fallback**, and
`src/world/Terrain.ts:78` bound `ACTIVE_CONTRACT` at module-evaluation time against it. Every
leg the campaign harness has ever walked therefore ran on the **default claim's ground** while
receiving the right manifest: the sim got the right contract on the wrong terrain.

The slice appends `&contract=<encoded id>` when, and only when, `--contract` was supplied, and
leaves the string byte-identical when it was not. The assignment stays above `createServer`,
which is load-bearing — the binding happens at module evaluation, so a correct value set one
line later is no cure at all.

## Evidence

Gates run on the **merged tree** in detached `gate-s2143` (§3.0b — undecided content never
entered main's working tree; the merge and its commit were one act, never staged).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0, built in 1.36 s |
| `scripts/campaign-harness-terrain.test.mjs` | 1/1 — `64×64` under `?debug`, `96×112` under `?debug&contract=e3-canyon-works`, in **separate vite servers** |
| `scripts/gr-sim-campaign.test.mjs` | 6/6, pin `fnv1a32:4f363fd5` **UNMOVED** |
| `scripts/gate-caller-audit.test.mjs` | 26/26 — the new script is rooted in `test:node-guards` |
| cross-cutting battery | **not triggered** — the diff touches no `src/`, `src/sim/`, `src/systems/` or `src/entities/` |

### Scope 5 — run by this drain, not inherited

The first run STOPPED here and was right to (F-2142-3: the master pointed it at a probe that
builds its own `?debug` location and never imports the harness). s2142 corrected the master to
drive the sanctioned harness command instead. This drain executed that command **twice, at two
different bases**, and then **manufactured the defect** to prove the discriminator — because a
green says nothing about the red.

| Arm | Throw | Rows | Last row |
|---|---|---|---|
| cure present, at lane/b tip | `e3-canyon-works ended unsecured at wave 8.` | 540 | `{"wave":8,"powered":1,"required":2,"complete":false,"failed":true}` |
| cure present, on the merged tree | `e3-canyon-works ended unsecured at wave 8.` | 540 | identical |
| **cure reverted** on the merged tree (one line, same process, same seed, same player) | `e3-canyon-works ended unsecured at wave 2.` | 10 | `{"wave":1,"powered":0,"required":2,"complete":false,"failed":false}` |

`scripts/gr-sim-campaign.mjs` restored byte-identically after the manufactured arm — SHA-256
`32f520dd0ade7187d612daf3accf079a94fe76a567b5c467d7a1a583fb468cc4` before and after, verified by
**content compare**, and `git status` over that path empty (F-1295-1: never judge a restore by the
absence of dirt alone).

**The `byWave: 6` connect deadline latches `failed: true` for the first time.** Seven fires have
been trying to reach it; the wave-2 terminal that `f2141-1` banked as a census result was an
artifact of this binding, exactly as s2142 predicted.

Banked: `artifacts/f2142-1-cure/census-s2143.json` (lane tip), `census-s2143b.json` (merged tree),
`census-s2143-before.json` (manufactured defect), `s2143-control-merged.log`.

⚠️ `artifacts/f2142-1-cure/probe-after.json` lands with this merge as **retained** output of the
retired scope-5 step. It is **not evidence for this slice and must not be cited** (s2142's
standing note; kept per the Retention Law).

## Merge classification

Base `79bb2fab`. Four paths, **all LANE-ONLY** — `git diff 79bb2fab..main` is empty over each, so
main moved none of them and no graft was possible:

| Path | Class |
|---|---|
| `scripts/gr-sim-campaign.mjs` | LANE-ONLY (the one-line cure) |
| `scripts/campaign-harness-terrain.test.mjs` | LANE-ONLY (new) |
| `package.json` | LANE-ONLY (roots the new script) |
| `artifacts/f2142-1-cure/probe-after.json` | LANE-ONLY (retained, not cited) |

`main..lane/b` empty after the merge.

⚠️ Main moved **twice** under this drain — a concurrent writer landed `508d37de0` (e5-stillwater
ADMITTED) at 22:19, having held main **mid-merge** with 73 staged files for the fire's first seven
minutes. The classification above was taken against the **post-merge** main, not the base this
fire first read.

## Findings

**F-2143-1 (non-blocking, factory-side, no cure owed) — a fire cannot commit ANYTHING while another
writer holds main mid-merge, and the failure names the wrong subject.** This fire's first act,
taking the lock with a path-scoped `git commit STATUS.md`, failed with
`fatal: cannot do a partial commit during a merge` — because `.git/MERGE_HEAD` existed and 73 files
were staged by a concurrent Cowork agent. The law's advice for concurrency (§7.6 "serialize; wait one
fire cycle") is right, but the *diagnostic* is not written down anywhere: **`git status` alone does
not say "a merge is in progress"** in a way a fire reads as a stop, and the refusal message talks
about partial commits rather than about custody. The general shape: **a fire that cannot commit
should check `.git/MERGE_HEAD` before theorising about permissions or gates.** The window closed on
its own after seven minutes and cost nothing here, because the fire spent that time on the scope-5
control in a detached worktree instead of waiting — which is the reusable half.

**F-2143-2 (non-blocking, observation, belongs to whoever next owns the census).** The wave-8 run
reaches `powered 1 / required 2` and latches `failed: true`. That is a *measurement*, not a balance
verdict: it says the census player secures one of the two galleries within the deadline on this seed.
Whether the second is reachable at all — route, cost, or deadline — is the question `F-E2S-4`
reserves for the owner, and it stays reserved. **Do not read "failed: true" as "the contract is
unmeetable."**

**F-2142-2 carried forward, unchanged and still attended-gated.** One process holds one binding, and
`Terrain`'s geometry is `const`, so a real multi-leg walk is still wrong after its first leg
(`e1-dry-gulch`, `e1-night-shift`, `e1-twin-banks`, `e1-baron`). The fixture-driven five-leg pin is
unaffected — `runCampaign` takes the `fixtureOutcome` branch and never constructs
`HeadlessContractSim`. Curing it needs a process per leg or a re-bindable terrain; both are design
forks, and the second is the same re-baselining rewire as F-2134-1.

## Env exceptions

None. This slice renders nothing, so no playwright run, no screenshots and no zero-console probe are
owed (the master says so explicitly).
