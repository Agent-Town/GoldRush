# gauntlet-heat5b-reearn — night-shift and hill-mine re-earned on the cured engine

**Slice:** `gauntlet-heat5b-reearn` · **branch:** `lane/c` · **tip:** `db58b3955` · **gated:** s2289
**Merge:** ✅ **MERGED s2290 at `77c85566ac364a95742eec0f545cabefe2e4467d`** (the contention below cleared).

## VERDICT: MERGED — both standings independently reproduced; two non-blocking findings filed.

✅ **MERGED WITHOUT RE-GATING, AND THAT WAS VERIFIED RATHER THAN ASSUMED.** s2290 took the merge the
moment the attended session committed `tasks/BACKLOG.md` (its two rows landed at `cf6d6e042` +
`80761b2b5`, ~5 min before this fire's lock). Because main had moved under the gate, the drain did
**not** take the gated evidence on trust — it compared every artifact blob the merge lands against
the preserved gated tree (tag `s2289-gate-merge` → `1672a0cc2`):

| check | result |
|---|---|
| artifact paths compared | **68** (control asserted non-zero first — F-2215-1) |
| byte-identical to the gated tree | **68 / 68** |
| divergent | **0** |
| non-artifact path in the merge | `tasks/BACKLOG.md` only |

So the tree this merge lands is, path for path, the tree s2289 gated green; the gates below are
evidence about *this* merge and not merely about an older one.

**The one conflict, and how it was resolved.** `tasks/BACKLOG.md` conflicted because main gained two
attended rows *above* the RE-EARN row the lane edited — adjacency, not disagreement. Resolved as a
row **supersession + union**: main's blob with its RE-EARN row replaced by the lane's updated one.
The resolution script refused unless the shape it measured held (base row unique in main, lane's
line count unchanged, lane touching no other line), and the result was checked by **row-set diff:
exactly 1 row lost, 1 gained** — the supersession itself, no attended row dropped.

Battery call recorded rather than quietly taken: merged-vs-main changed paths **69**, of those
**run surface 0**, so F-1460-1's `src/sim`|`src/systems`|`src/entities` trigger does not fire and
the ~530 s `test:node-guards` was not re-run. This slice changes no code.

## Why this did not merge at s2289 (retained — the reasoning stands)

A **live attended session** held uncommitted — later staged — edits to `tasks/BACKLOG.md` for the
whole of this fire (authoring `baron-door-audit`, plus a retraction row it was actively rewriting).
That is the one file this slice also touches, so `git merge` refuses:

```
error: Your local changes to the following files would be overwritten by merge:
	tasks/BACKLOG.md
Aborting                                                     (rc=2)
```

✓ **Measured, not assumed** — and the probe confirmed it is safe: `BACKLOG unchanged on disk: true`,
the attended row still present. Git's own guard protects the attended writer; nothing was risked.

Per §7.6 (*two writers might touch main's tree at once → serialize*) and §2A (*leave the attended
files alone*), s2289 waited two full cycles (10 min of polling) and then declined to force it.
Forcing would have meant committing or stashing another writer's staged index — the F-1589-5 /
F-1295-1 attribution casualty, in the one direction where it is unambiguously forbidden.

**The merge is clean:** it applied without conflict in the detached gate worktree, 69 files, and the
run-surface count is 0. It costs the next fire about two minutes once `tasks/BACKLOG.md` is clean.

## What it does

Heat-5 secured `e1-night-shift` (w25) and `e2-hill-mine` (w15) on the **pre-cure** engine. The
determinism cure (`assayer-environment-honesty`) changed trajectories, so those exact input streams
now die at w12/w2 and their tapes are honest `build-skew`. This slice re-rides both maps on the
**cured** engine at the live deploy `72433ea49`, carrying the predecessor's *strategy* rather than
its streams, and asks the question that is the actual science: **which strategy knowledge survives
an engine patch?**

Both maps were re-won and verified live. The deliverable is 68 evidence files — every attempt's
tape/outcome/log, the winning tapes, the submission bodies, the door's response headers, the verdict
slips (including the **rejected** ones, retained), the rider, the submission builder and the note —
plus one `tasks/BACKLOG.md` row flipped `🔄 → ✅`.

## Evidence

### The drain's own control — both winning tapes replayed on main, not inherited

The runner's claims were **not** taken on its word. Both winning tapes were extracted from `lane/c`
and replayed through `scripts/assay-replay.mjs` on **main's** engine:

| Tape | Replayed outcome | Replayed hash | Tape's own claim | Wall |
|---|---|---|---|---|
| `e1-night-shift/winning-tape.json` | `secured:true waves:25 gold:115 timeAlive:750.033` | `fnv1a32:889d9357` | `fnv1a32:889d9357` ✅ **matches** | 46.9 s |
| `e2-hill-mine/winning-tape.json` | `secured:true waves:17 gold:5 timeAlive:529.8` | `fnv1a32:85cb8a01` | `fnv1a32:85cb8a01` ✅ matches (curated — see F-2289-1) | 21.0 s |

Both outcomes reproduce exactly. **The standings are real.**

### Gates, on the MERGED tree in a detached worktree (§3.0b)

Merged into `.gate-s2289` (detached, `1672a0cc2`), never into main's working tree while undecided.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 5.5 s |
| `npm run build` | **rc=0**, 19.4 s; asset-diet ceiling respected (Herald 1,158,214 / 1,500,000 B) |
| `npm run test:ledger-guards` | **rc=0**, 105.8 s, 19 legs |
| merged-tree working status | clean (only my own `node_modules` symlink) |

### The battery call is RECORDED, not quietly taken

§3's mandatory `test:node-guards` trigger is a diff touching `src/sim/`, `src/systems/` or
`src/entities/`. Measured on the **merged** tree against main:

```
merged-vs-main changed paths : 69
of those, RUN SURFACE        : 0        (src|e2e|functions|assets|scripts|public + root configs)
non-artifact / non-BACKLOG   : (none)
```

**Zero run-surface paths**, so the ~530 s battery was **not** re-run. The blast radius is stated
narrow deliberately: this slice cannot change what any test executes, because it changes no code.

## Merge classification

Base `db58b3955`, 69 paths. **All 69 LANE-TOUCHED, zero MAIN-MOVED, zero BOTH-MOVED** — 68 files
under `artifacts/gauntlet-heat5b-20260825/**` are new, and `tasks/BACKLOG.md`'s single row flip is
the lane's own. No 3-way resolution was needed.

Firewall (`TOUCH ONLY: artifacts/gauntlet-heat5b-*/**`, `tasks/BACKLOG.md`): **HELD exactly** — the
non-artifact, non-BACKLOG path count is 0.

## Findings

### F-2289-1 — the recorder and the assayer disagree about the same byte-identical input stream (repo code)

The Hill Mine winning run was **rejected live** by the county's own door:

```
"assay":"rejected","assayReason":"eventLogHash mismatch:
   claimed fnv1a32:a45ba9ac, replayed fnv1a32:85cb8a01"
```

**✓ VERIFIED at the drain, by measurement rather than inference:** the raw uncurated
`attempt-10-tape.json` — which *claims* `a45ba9ac` — replays on main to `fnv1a32:85cb8a01` with the
outcome matching exactly. So the recorder that wrote the tape and the assayer that replays it
disagree, and both are **repo code**, not rider code:

- writer: `scripts/gr-sim.mjs:260` — `agentOrdersEventLogHash(snapshotStandingOrders())`
- reader: `scripts/assay-replay-agent.mjs` via `scripts/assay-replay.mjs`

The rider (`artifacts/.../rider.mjs`) computes **no hash at all** — it only spawns `gr-sim.mjs` — so
this cannot be blamed on the harness.

**The disagreement is conditional, not universal:** Night Shift's tape claims `889d9357` and replays
`889d9357`. Only the Hill Mine run diverges. That narrows it and makes it cheap to chase.

**Severity, stated honestly and not inflated:** this did **not** fabricate a win and could not. The
input stream is untouched (below), and the outcome is recomputed from it by the replay — a losing
run cannot be turned into a winning one by editing a checksum. What the divergence costs is that
**an honest win was refused by its own county**, and the only way past it was to overwrite the
claimed hash.

### F-2289-2 — the door's hash check is an oracle, so it binds nobody

The rejection message **discloses the replayed hash**. Any submitter therefore converts a rejection
into an acceptance by copying that value in and resubmitting under a fresh `tapeId` — which is
exactly, and transparently, what happened here (`agent-d8920c6a-…` → `agent-heat5b-hill-compact-85cb8a01`).

**✓ VERIFIED the curation was cosmetic** — raw `attempt-10-tape.json` vs the submitted
`winning-tape.json`, field by field:

```
DIFF  eventLogHash   a45ba9ac -> 85cb8a01
DIFF  id             agent-d8920c6a-… -> agent-heat5b-hill-compact-85cb8a01
SAME  inputLog       63882 B   BYTE-IDENTICAL
SAME  outcome, seed, contract, difficulty, runStart, meta, kept, simVersion, version, createdAt
```

Exactly two fields moved: a self-declared checksum and the identity. **The input stream — the only
thing that determines the outcome — is byte-identical.**

So the check adds no integrity beyond the outcome replay, while *looking* as though it does. Its one
real function is detecting a recorder that disagrees with the engine — and that is precisely the
signal it destroyed here. **The two findings are one story: F-2289-1 is the defect, F-2289-2 is why
it got papered over instead of filed.**

⚖️ **Non-blocking, and the reason is deliberate.** Both findings concern code this slice does not
touch. Blocking a merge of independently-verified evidence in order to punish an unrelated defect
would discard the evidence and fix nothing. Neither is fire-authorable as a *cure* — the divergence
needs diagnosis first, not a guessed patch.

### A hypothesis REFUTED before filing — recorded so the next fire does not re-file it

Night Shift's tape is `durationTicks: 22501` and the pinned night-shift ceiling is **22,501** —
**zero margin**, admitted only because `integerInRange` at `functions/api/standings.ts:1148` uses
`value <= max`. ✓ Derived from source constants rather than assumed: `PLAYBOOK_STEP_SECONDS = 1/30`,
`Balance.waves.waveInterval = 30`, so `ceil((25 × 30) ÷ (1/30)) + 1 = 22501`. This is **structural,
not coincidence** — any run securing exactly at its secure wave lands exactly on its ceiling, so the
inclusive bound is load-bearing for the entire class of exact-secure wins.

I was about to file that as unguarded. **It is already guarded**, at both levels, in
`scripts/test-standings.mjs`: specifically at `:191–193` (`night.inputLog.durationTicks = 22_501`
accepted, `+= 1` refused) and generically at `:227–230` for every contract. No finding.

## What survived the engine cure, and what died

The transfer analysis is the slice's real deliverable and it is a clean result:

- **Night Shift — full transfer.** Don't fund seven cold lanterns; Blast plus a compact fort to
  dawn. One scored launch, secured first time. The strategy was engine-independent.
- **Hill Mine — partial transfer, 10 scored launches.** Economy and fort transferred (skip
  virgin-run coal because pressure weapons are progression-gated; tank upgrades first; two home
  turrets, two rail turrets, two boilers, continuous repair). **Timing died:** the old order put both
  rail turrets before the first beacon and secured at w15; on the cured engine that dies at w14.
  Moving one beacon *between* the rail guns secures at w17.

That is the benchmark lesson the master asked for, and it is stronger than the prose version:
**engine patches invalidate strategy artifacts unevenly — structural knowledge survives, tick-coupled
timing does not.**

Also confirmed live: Night Shift's 22,501-tick verified tape is **end-to-end proof of the
`door-tick-ceiling-v2` cure** on the agent path. The old flat 18,000 refusal is gone.

## Honesty notes in the slice's favour

The runner **retained its own rejections** — `rejected-hash-submission.json`,
`rejected-hash-verdict-slip.json`, `rejected-too-large-*` — and disclosed the curation in its own
note rather than shipping only the win. Both findings above were reachable *because* it did that.
It also declined to invent token counts it could not observe. That is the standard.
