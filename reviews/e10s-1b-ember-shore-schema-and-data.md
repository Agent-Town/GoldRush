# e10s-1b — Ember Shore schema and data

**Slice:** E10S-1 (`specs/agent-play/e10-ember-shore-preserve.md` §4)
**Branch:** `lane/a` · **Tip:** `91dd6dd9d0096cab88100acba3b349281cbd2cd9` (2026-08-21T12:00:13+07:00)
**Base at gate:** `45926491c` (main, s2125 lock)
**Gate worktree:** `gate-s2125` (detached, §3.0b — undecided content never entered main's tree)
**Drained by:** s2125 fire, 2026-08-21

## VERDICT: **HOLD — NOT MERGED.** Owner fork; see F-2125-1.

> ⬆️ **SUPERSEDED s2258 (2026-08-24) — THE HOLD IS DISCHARGED AND THE SLICE IS ON MAIN at `22d0e1cc7`** (`git merge-base --is-ancestor 22d0e1cc7c1d0adfdd009334c6b14c03d0a28855 main` → rc=0, verified this fire). The verdict above is KEPT VERBATIM under the Retention Law and was CORRECT when written: this slice's payload really did admit the map, and merging it as authored really did turn the door guards from 6 pass / 0 fail into 3 pass / 3 fail. What discharged it was not a re-argument but the corrective `e10s-1c`, which emptied the anchors so the data lands INERT — the attended pick of s2165's option (a), the e6-picnic precedent. On the merged tree `skillmd-guard` + `door-admission-ratchet` read **6 pass / 0 fail**. Both leaves are `status="merged"`. See `reviews/e10s-1c-ember-shore-inert-landing.md` — and note F-2258-1 there: the anchors this slice authored live on THREE surfaces, so the E10S-4 door slice must re-land all three.

The slice does what its master asked and its own gates are sound. It is held for a
reason no gate in its master could have seen: **it admits `e10-ember-shore` to the
public door while omitting the two door-surface files that every other admission in
this repo carries, which reds three deterministic guards on main.**

## What it does

Authors the E10S-1 data layer for the Ember Shore preserve: the `twist.emberShore`
block and roster in the epoch-10 contracts, four `harvestAnchors` on the cooling
veins, the `e10-ember-shore` mask table, bench seeds `-01`/`-02`, regenerated null
floors, the census row, a mask-table assertion, and two `AUTHORED_TWIST_KEYS`
entries in `src/meta/ContractFamilies.ts`. Twist-inert by design — the preserve
consumer lands at E10S-3, the door at E10S-4.

## Merge classification

Clean 3-way merge, no conflicts, 7 paths — **all LANE-ONLY** (`lane-usable.mjs lane-a`:
`ahead=1 behind=9 paths=7 tracked-dirt=0 untracked=0`). Main had moved none of them.

| Path | Class |
|---|---|
| `assets/contracts/bench-seeds.json` | LANE-ONLY (+4) |
| `assets/contracts/epoch-10-deepsky/contracts.json` | LANE-ONLY (+55/-1) |
| `assets/contracts/epoch-10-deepsky/mask-tables/e10-ember-shore.json` | LANE-ONLY (+19/-1) |
| `assets/contracts/null-floors.json` | LANE-ONLY (+20/-1) |
| `e2e/er01-e10-census.spec.ts` | LANE-ONLY (+1/-1) |
| `scripts/e3-mask-tables.test.mjs` | LANE-ONLY (+7/-1) |
| `src/meta/ContractFamilies.ts` | LANE-ONLY (+3/-1) |

## Evidence

| Check | Result |
|---|---|
| Merge into `gate-s2125` | clean, `f47b1c42c`, 7 files / +103 / −7 |
| `e10-last-claim` unmoved | ✅ **verified** — the door diff is exactly one line, `+ 'e10-ember-shore'`; `e10-last-claim` present in both sides |
| **Control — clean main `45926491c`** | ✅ `skillmd-guard` + `door-admission-ratchet` → **6 pass / 0 fail**, 3.10 s |
| **Merged tree `f47b1c42c`** | 🔴 **3 pass / 3 fail**, 5.52 s |
| Runner-reported battery (lane tree) | `468 tests · 461 pass · 6 fail · 1 cancelled`, 301.9 s |

### The three deterministic reds — slice-caused, timing-free

| Test | Merged tree | Clean main |
|---|---|---|
| `door-admission-ratchet.test.mjs:15` derived door matches the fixed admission baseline | ✖ 2537 ms | ✔ 1718 ms |
| `skillmd-guard.test.mjs:33` skill.md bench seeds match the source registry | ✖ **1.93 ms** | ✔ 0.16 ms |
| `skillmd-guard.test.mjs:40` skill.md door-contracts match SUPPORTED_CONTRACTS | ✖ **0.39 ms** | ✔ 0.09 ms |

Two of the three fail in **under 2 ms**. No scheduling, load or engine hypothesis can
reach them. In each case `actual` is what `public/skill.md` / `door-admission-baseline.json`
declare and `expected` is what the slice's own registry now derives — the assertion
diff is the single token `e10-ember-shore` in all three.

**This refutes the inherited hypothesis.** The run report volunteered that *"some
timeout failures ran under Node 23 instead of the required Node 26.4.0"*, and s2124
carried that forward as the whole explanation (*"the F-2076-1 / F-2099-1
engine-and-load class"*), gating the drain on a two-battery fingerprint. **Half the
set was never load.** The differential above cost 8.6 seconds of measurement, not the
~14 minutes two full batteries would have cost — because the question was *which
tests*, and the run log answered it.

### The run log **does** name the six

s2124 recorded that *"the run log does not name the six"*. It does, in a standard
node TAP summary at `tasks/runs/20260821-112744-lane-a-e10s-1b-ember-shore-schema-and-data.md.log:16909–16919`,
followed by a `✖ failing tests:` block naming each with its file, line and duration.
The remaining three, **not re-measured this fire** (see below):

| Test | Duration | Class |
|---|---|---|
| `fixture-teardown.test.mjs:24` | 170,226 ms | timing (F-2099-1 records this same test at 69.6 s) |
| `gr-sim.test.mjs` (file-level) | **300,000.9 ms** | timing — a failure lasting *exactly* the timeout is a scheduling verdict |
| `node-guards-timeout.test.mjs:94` | 1,225 ms vs a 1,000 ms budget | timing (this test's whole subject is budget enforcement) |

**UNVERIFIED THIS FIRE, deliberately and by law:** `lane/d` was mid-run on `f2124-1`
throughout (pid 28579, dispatched 12:01) and load average reached **11.26**. F-1537-1
forbids overlapping batteries — they contaminate both — and F-2099-1 establishes that
these reds are load-attributable, so a battery taken under a live lane run could not
have produced a trustworthy fingerprint in either direction. None of the three reads
any file this slice touches. They are carried as *probable* timing-class, not proven.

## Findings

### 🔴 F-2125-1 (BLOCKING — owner fork) — the slice opens the public door on a map that cannot be beaten, and omits the two files every other admission carries

`src/meta/ContractFamilies.ts:1336` gates direct play on
`requested.tileParams.harvestAnchors?.length === 0`. An **empty** anchors array is
precisely what holds a map out of play. This slice authors **four** anchors, so
`e10-ember-shore` becomes enterable the moment it merges — with no preserve consumer
(E10S-3) and no door (E10S-4) behind it. The run's own null-floor measurement:
**69 rows, both Ember seeds terminate unsecured at wave 3, `0 secured:true`.**

**The house template couples admission to its door surfaces, and it is not ambiguous.**
Two independent precedents, both within the last 36 hours, touch the *identical* file
set to this slice **plus** the two it omits:

| Admission | bench-seeds | contracts | mask-table | null-floors | **skill.md** | **door baseline** |
|---|---|---|---|---|---|---|
| `01afad743` e7-echo-canyon | +4 | ✅ | ✅ | ✅ | **+5** | **+1** |
| `485aacd7d` e9-devils-alley | +4 | +7 | +7 | +20 | **+5** | **+1** |
| **`91dd6dd9d` e10s-1b** | +4 | +55 | +19 | +20 | **— absent** | **— absent** |

Both precedents admitted a map whose consumer already existed; each commit message
says so (*"admitted — four anchors, bench seeds, **door surfaces**"*, *"admitted —
anchors, seeds, floors, census, audit (A9 **door**)"*). **No map in this repo has been
admitted at its data slice.**

**Neither the runner nor s2124 was wrong about the facts.** The runner flagged this as
its blocker 1 (*"Ember Shore's anchors prematurely admit it before E10S-4"*) and
declined to touch it — correct on both counts. s2124 re-derived it against the spec and
found `specs/agent-play/e10-ember-shore-preserve.md:25` ratifying admission at slice 1
(*"rows appear only with admission; 0 secured:true"*) — also correct. **What neither
checked is that the spec's slice split is out of step with the template the factory
actually follows**, and the spec assigns *"skill.md fences, door baseline"* to E10S-4
(`:28`) without noting that deferring them reds three ratchets in the meantime.

**Why this is not a fire's to take.** Every resolution is a player-facing or
spec-amending call:

- **(a) RECOMMENDED — hold the anchors.** Land E10S-1 with `harvestAnchors: []`; move
  the four anchors to E10S-4 alongside `skill.md` + baseline, exactly as e7 and e9 did.
  Guards stay green, no unbeatable map reaches the public door, and the data layer
  still lands now. Costs a one-line correction to the spec's E10S-1 gate wording.
- **(b) Complete the admission here.** Add the 6 lines (`skill.md` +5, baseline +1).
  Guards go green, but the public door advertises a map that terminates at wave 3 of
  12 for however long E10S-2/3/4 take — and `skill.md` is the agent-facing door doc.
- **(c) Merge as-is.** Forbidden: it reds `test:node-guards` on main on three
  deterministic guards, which is the F-1460-1 shape — a red board that acquires an
  excuse label and then hides a real regression. Five fires missed a genuine sim
  regression that way.

**GATE: re-admit when the owner picks (a) or (b).** Under (a) the corrective is a
one-file data edit and this branch re-lands with anchors emptied; under (b) it is a
6-line completion. Either is a single small master. **Nothing here is lost** — `lane/a`
holds all 7 paths, `ahead=1`, and the branch is untouched.

## Notes

- `lane/c` separately holds the earlier **stopped** `e10s-1` attempt (`1a2b93969`,
  2 paths, leaf `e10s-1-ember-shore-data` blocked `gate-side`). s2124's handoff item
  (B) expected `lane/c` to flip to AHEAD-BUT-ABSORBED once `e10s-1b` merged. **It did
  not merge, so that item does not come due** — `lane/c` still reads HOLDS and must
  not be reset.
- `E10A-1` remains sequenced behind this slice (shared `AUTHORED_TWIST_KEYS` array;
  two lanes on one array is a serialize-law violation). **It does not become authorable**
  — s2124's item (C) was conditioned on this merge landing.
- Gate worktree `gate-s2125` retained with the probe merge for the next fire; it is
  detached and touches nothing.

---

## s2165 RE-GATE (2026-08-22) — the re-scoped hold instructed this merge; I re-measured and it still reds main

**Base:** `91ac67653` (main, s2165 lock) · **Gate worktree:** `gate-s2165` (detached, §3.0b)
**Lane tip:** `91dd6dd9d0096cab88100acba3b349281cbd2cd9` — unchanged · **behind=307** (was 9 at s2125)

### VERDICT: **HOLD — STILL NOT MERGED.** F-2125-1 re-confirmed at source; new F-2165-1 filed.

> ⬆️ **SUPERSEDED s2258 (2026-08-24) — THE HOLD IS DISCHARGED AND THE SLICE IS ON MAIN at `22d0e1cc7`** (`git merge-base --is-ancestor 22d0e1cc7c1d0adfdd009334c6b14c03d0a28855 main` → rc=0, verified this fire). The verdict above is KEPT VERBATIM under the Retention Law and was CORRECT when written: this slice's payload really did admit the map, and merging it as authored really did turn the door guards from 6 pass / 0 fail into 3 pass / 3 fail. What discharged it was not a re-argument but the corrective `e10s-1c`, which emptied the anchors so the data lands INERT — the attended pick of s2165's option (a), the e6-picnic precedent. On the merged tree `skillmd-guard` + `door-admission-ratchet` read **6 pass / 0 fail**. Both leaves are `status="merged"`. See `reviews/e10s-1c-ember-shore-inert-landing.md` — and note F-2258-1 there: the anchors this slice authored live on THREE surfaces, so the E10S-4 door slice must re-land all three.

**Why this fire re-gated at all.** `drain-block-check lane/a` prints a hold whose reason,
re-scoped by attended today (`d9789325d`, F-2162-1), ends: *"LIFT = the drain itself:
merge lane/a (91dd6dd9d), regen null-floors on the merged tree, --check clean, flip this
leaf in the drain commit."* That is an instruction to merge. **I executed it as far as
evidence, and the evidence refuses it.**

### What PASSED — the re-scoped condition, satisfied in full

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green, 1.17 s |
| Contract loads **headless** | ✅ `null-floor-anchors.test.mjs` passes — its coverage assertion coerces `floors` keys to `benchSeeds ∩ supportedContractIds()`, so its green **is** the proof `e10-ember-shore` loads |
| `e3-mask-tables` + `bench-seeds` + `null-floor-anchors` | ✅ **33 pass / 0 fail**, 1.84 s (incl. `e10-ember-shore mask stays inside bounds`) |
| Floors regen on the merged tree | ✅ **81 floors, 671.1 s**, rc=0 |
| **0 `secured:true`** | ✅ none anywhere in 81 rows; both Ember seeds `secured:false`, wave 3 |
| Regen reproduces the lane's 20-h-old pins | ✅ **byte-identical**, incl. `eventLogHash` `fnv1a32:efe6d491` / `fnv1a32:7257e0b7` — determinism proven across a **307-commit** gap |
| Regen moves nothing else | ✅ merged-vs-main delta in `null-floors.json` is **exactly 20 lines**: the `eraStamp` + the two Ember rows. All 34 pre-existing contracts re-derived byte-identically — a stronger result than `--check`, which is the same computation |
| `e10-last-claim` floors | ⓘ **vacuous by absence, not a green** — it is not in `bench-seeds.json`, so it has no floors row in either tree. Stated plainly because the naive comparison is `undefined === undefined` |

### What FAILED — the same three deterministic reds, re-measured on a base 307 commits newer

| Test | Clean main `91ac67653` | Merged tree |
|---|---|---|
| `door-admission-ratchet` — derived door matches the fixed admission baseline | ✔ 9260 ms | ✖ 2766 ms |
| `skillmd-guard` — skill.md bench seeds match the source registry | ✔ 0.20 ms | ✖ **0.96 ms** |
| `skillmd-guard` — skill.md door-contracts match `SUPPORTED_CONTRACTS` | ✔ 0.11 ms | ✖ **0.19 ms** |
| **File totals** | ✅ **6 pass / 0 fail** | 🔴 **3 pass / 3 fail** |

Two fail in **under 1 ms**. No load or scheduling hypothesis reaches them, and the control
was taken this fire on today's main — **F-2125-1 is not stale.**

**Root re-verified at source, by reading the file:** `src/meta/ContractFamilies.ts:1345`
— `else if (requested.tileParams.harvestAnchors?.length === 0) { fallbackReason =
'unavailable-contract'; … }`, redirecting to The Claim. An **empty** anchors array is what
holds a map out of play; this slice authors **four**, so the map becomes directly enterable
on merge. (s2125 cited `:1336`; the coordinate has rotted **9 lines** — cite the code.)

### 🔴 F-2165-1 (BLOCKING, ATTENDED-OWED) — the re-scope's premise is refuted by a measurement that predates it

F-2162-1 re-scoped this hold on the argument that the data is machine-declared inert
(`DECLARED_INERT_PATHS` + `engine_dependency_required`), therefore *"no player-reachable
behaviour lands."* **That argument is sound about the twist and silent about the anchors.**
Admission is not gated on the twist being live — it is gated on `harvestAnchors.length`
(`:1345`), and on the bench seeds that feed `skill.md`'s door-contract list. The slice moves
both. So:

> **The bench seeds and anchors ARE the admission mechanism.** The re-scope assumed E10S-1's
> data could land with admission withheld; measured, this content cannot — landing the data
> *is* admitting the map, which is precisely the act F-2162-1 deferred to the newly-minted
> E10S-4 door leaf.

The re-scope never addressed F-2125-1's three reds — they are named nowhere in the
`d9789325d` reason text or the BACKLOG row. This is not a disagreement about values; it is a
measurement the ruling did not have in front of it.

**A fourth red, new this fire, same root:** `e2e/er01-e10-census.spec.ts` at `--workers=1`,
desktop. `e10-ember-shore` fails at **line 46** (`expect(benchSeeds[contract.id]).toBeUndefined()`,
received `["e10-ember-shore-01","e10-ember-shore-02"]`) — the spec encodes "Deep Sky is
declared debt, unserved", and the slice's seeds contradict it. The master's firewall permitted
this file only for *"the `e10-ember-shore` **dependency** expectation ONLY"*, so **the runner
was forbidden from fixing it and correctly did not** — a firewall success, not a lapse.

⚠️ **Pre-existing and UNRELATED, recorded so the next reader does not attribute it to the
slice — `er01-e10-census.spec.ts` is ALREADY RED ON MAIN:** all four e10 contracts fail on
clean main at **line 59** (`expect(mechanics.buildables).toBeUndefined()`, received the full
six-item buildables registry). Same test *names* fail in both trees, at **different lines and
for different causes** — the merged tree's ember-shore failure is a genuine *additional* red
that a name-level comparison would have called pre-existing. Fingerprint by line, not by title.

### The choice is unchanged from s2125, and now has a third option

- **(a)** Empty the anchors — data lands inert and un-enterable; door opens at E10S-4. One-file edit.
- **(b)** Complete the admission — add `public/skill.md` (+5) and the door baseline (+1), matching
  the two precedents `01afad743` / `485aacd7d`. **Admits a map with no consumer and no door.**
- **(c)** *(new)* **Drop the bench seeds and floors rows from this slice** — the null-floor guard is
  then satisfied trivially (no seeds ⇒ no floors row, its coverage assertion is an intersection),
  the door surface is untouched, and the contract/mask/twist declaration still lands. This reads
  closest to the spec's own gate wording, *"rows appear only **with admission**"* — under a
  deferred door there should be **no** Ember rows yet.

**GATE: attended picks (a), (b) or (c).** All three are a single small master. **Nothing is
lost** — `lane/a` holds all 7 paths at `ahead=1`, untouched by this fire.

### Custody

Per §3.0b every probe ran in the detached `gate-s2165` worktree; **nothing was staged on main
and no merge was ever left in main's index** (F-1295-1 / F-1589-5). The worktree was removed
after measurement. Clean-main controls were taken at the repo root, read-only.
