# F-2297-1 — the assayer's tree IS identified, and the engine identity's dominant churn source is a test-runner list

**Fire:** s2297, 2026-08-25 · **Board:** dry (0 drains) · **Nothing was deployed, submitted or merged by this fire.**

This is a read-only local measurement taken to execute F-2296-1's own recommended option (b),
*"identify the assayer's tree FIRST"*. It answers that question and, in doing so, refutes the
premise the desk item rests on.

---

## 0. Control asserted BEFORE any result was believed (F-2215-1)

`computeEngineHash` (`scripts/assay-replay-agent.mjs:66`) is a pure function of file CONTENT over
11 declared inputs, so it can be recomputed from any git tree without materialising a worktree.
A reimplementation is only trustworthy if it reproduces the real function exactly:

| arm | result |
|---|---|
| real `computeEngineHash(root)` on the live main worktree | `d48987df2d50c643e854a2bf8a23b7f34b81c3de1cfd2e54999129b5660f7494` |
| — matches the hash s2296 recorded for main + every rider tape | **true** |
| my git-tree reimplementation at `HEAD` | `d48987df…` (481 files) |
| — agrees with the real function | **true** |

Fidelity note: the real function THROWS when an engine input is absent (`readFile`/`readdir`
reject). The reimplementation reproduces that by refusing, so a tree predating an input is reported
UNHASHABLE rather than silently hashed over a narrowed corpus — an empty corpus is exactly the
shape of a false match.

## 1. The assayer's tree is identified — it is a plain main tree, ~4.5 h stale

Swept **every commit on every ref since 2026-08-21** (the engine-hash concept begins 2026-08-22,
when `scripts/assay-replay-agent.mjs` was added, so trees before it are UNHASHABLE by construction).
Commits were collapsed into distinct engine states by a cheap `(path, blobsha)` fingerprint, then
the real hash was computed once per distinct state.

**The assayer's `0be37691327931e7a3230f10fa5f65105cfc4b69af13845f84e05dfb281f3b0a` reproduces exactly,
from 12 commits:**

```
db58b3955  2026-08-25T06:29:55+07  runner(lane-c): gauntlet-heat5b-reearn.md
1258f8439  2026-08-25T06:19:10+07  s2288: TK-01 ticker digest for the 2026-08-24 coverage day
15e642f76  2026-08-25T06:12:17+07  s2288: factory churn
f032acd66  2026-08-25T06:12:09+07  s2288: lock ACTIVE
946b57b74  2026-08-25T06:06:38+07  feat: the re-earn — skew law honestly applied to our own heat
72433ea49  2026-08-25T05:17:04+07  s2287 handoff: F-2287-1
b5062fc2d  2026-08-25T05:15:33+07  s2287: F-2287-1 ledger row
a74c16735  2026-08-25T05:14:23+07  f2287-1: the raw hypot surface has 100x less headroom
fc8b3fb88  2026-08-25T04:58:45+07  s2287: lock ACTIVE
47082fd11  2026-08-25T03:53:34+07  s2286 handoff: F-2286-1
ca68bda90  2026-08-25T03:52:01+07  s2286: F-2286-1 ledger row
c3b169607  2026-08-25T03:51:05+07  f2286-1: pin the comparator margin
```

**ALL TWELVE ARE ANCESTORS OF MAIN** (`git merge-base --is-ancestor` — verified individually).
They share one engine-input content set, which is why they share one hash.

### What this refutes

s2296 raised F-2296-1 on the finding that the assayer *"matches no recent main tree"*, that it is
*"not one merge behind, it is on a tree not identified"*, and recommended option (b) on the reasoning
that **"it may hold local edits worth reading before they are overwritten"**.

That premise is **REFUTED**. The assayer is running a plain, known, main-line tree with **no local
edits**. s2296's method was sound and its five-tree sample was honest — it simply did not reach far
enough back; the answer sat ~4.5 h behind the commits it tested.

**Consequence for the owner's decision:** option (b)'s *rationale* is gone. Nothing forensic is
destroyed by re-deploying, because there is nothing on that box that is not already in git.

## 2. What ended the assayer's state — and it is the finding

The engine state ended at **`bbb39da55`** (2026-08-25T06:29:37+07),
*"f2288-1: close F-2287-1's declared residue — guard the REACHING contracts' extent"*.

That commit touched four files. **Exactly one is an engine input: `package.json`, changed by one
line** — adding `scripts/reaching-contract-extent-guard.test.mjs` to the `test:ledger-guards`
runner list. The other three are `scripts/*.mjs`, which are NOT engine inputs (only the single file
`scripts/assay-replay-agent.mjs` is).

**Adding one guard leg to an npm script invalidated every rider's tape.**

## 3. This is not a one-off — it is 78.8% of all engine-identity churn

Classified every engine-identity transition on main's first-parent line since 2026-08-22 by which
engine inputs actually moved:

| | count | share |
|---|---|---|
| engine-identity transitions | 66 | — |
| moved ONLY `package.json` / `package-lock.json` | **52** | **78.8%** |
| moved a file the sim executes or loads as data | 14 | 21.2% |

Tightened, because *"moved only package.json"* is not the same claim as *"behaviourally inert"* —
package.json legitimately carries dependency, `engines` and `type` fields that DO reach the sim.
Of those 52:

| | count |
|---|---|
| moved **only the `scripts` block** (a test-runner list) | **52** |
| moved a dependency / `engines` / `type` field, or `package-lock.json` | **0** |
| unclassifiable → counted as SUSPECT, never as inert | **0** |

Verified that the replay genuinely never reads that block: `scripts/assay-replay-agent.mjs` contains
**zero** `exec`/`execFile`/`spawn`/`npm` calls — it imports vite and runs the sim in-process. The
`scripts` block is npm's task list and nothing in the replay path consults it.

### Why this compounds

`test:ledger-guards` is a set the law **orders to grow**. `scripts/fire.md` §2E, verbatim:

> *"This set is MEANT to grow as law/ledger/gate surfaces do, so COUNT it, never PRUNE it back to
> the number written here."*

Measured directly from the script's own history rather than paraphrased from the law text —
`test:ledger-guards` leg count on main's first-parent line since 2026-08-01:

```
5 -> 6 -> 7 -> ... -> 64 -> 65      (every step exactly +1)
```

| | |
|---|---|
| legs on 2026-08-01 (`73329e15e`) | 5 |
| legs on 2026-08-25 (`bbb39da55`) | **65** |
| growth events | **60 in 24 days ≈ 2.5/day** |
| monotone non-decreasing | **true** — it has never once shrunk |

**The final growth event in that series IS `bbb39da55` — the commit that invalidated the assayer.**

So the county's assay identity is coupled by construction to a set the factory is under standing
orders to expand, and which has in fact expanded 2.5×/day for 24 days without a single decrease.
**A re-deploy fixes today and breaks again on the next guard leg — a median of hours, not days.**

### Relation to prior art — this EXTENDS F-2281-3, it does not duplicate it

**F-2281-3** (s2281) named the class: *"`engineHash` covers `src/**` entire, a conservative superset:
docs-only deploys no longer churn the pin, but render-only edits still will."* Correct, and it aimed
at `src/**`. The measurement above says the dominant churn source is not `src/**` at all — it is the
`scripts` block, at 78.8%. `docs/ops/agenttown-server.md:34` likewise reasons about which deploys
churn the pin and never reaches this input.

## 4. Severity, stated honestly and deliberately not inflated

- **The direction is CONSERVATIVE.** The assayer refuses rather than ranking what it cannot
  reproduce. Nothing false has entered the standings; no player has been credited wrongly. That half
  of s2296's severity reading is confirmed, not disturbed.
- **This is NOT a correctness defect in the sim, the tape, or the assayer's logic.** All three are
  behaving exactly as designed. The defect is that the identity's *surface* is wider than its
  *meaning*.
- **What it costs is throughput, in announcement week.** It stops the gauntlet program, the Baron's
  first lawful admission evidence, and the announcement-week standings — and it will keep doing so on
  a roughly per-fire cadence until the surface is narrowed or the deploy is automated.

## 5. Bound on this evidence

- Every figure here is **local and read-only**. This fire did **not** probe the live assayer, submit
  a ride, or deploy anything — that remains the owner's call, exactly as s2296 left it.
- The evidence therefore establishes **what the assayer was running as of the 03:56:14Z / 03:56:44Z
  submissions**, via a hash match that is conclusive about *content*. It does not establish that the
  box is still on that tree now.
- **Which of the 12 commits was deployed is not determinable from the hash**, and does not matter:
  their engine-input content is identical.

## 6. Reproduce

The sweep scripts were written to `/tmp` per F-1665-1 (`scripts/` is a run surface). To re-take:
recompute `computeEngineHash` over `git ls-tree`/`git cat-file --batch` for the 11
`ENGINE_SOURCE_INPUTS`, control it against the real function at `HEAD` first, then group commits by
a `(path, blobsha)` fingerprint and hash once per distinct state.
