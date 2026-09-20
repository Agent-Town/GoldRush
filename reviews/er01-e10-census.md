# reviews/er01-e10-census.md — ER-01 E10 Deep Sky readiness census

- **Slice:** `lane-er01-e10-census.md` (ER-01 ladder, E10 Deep Sky — the last rung)
- **Branch / tip:** `lane/d` @ `31ea5f7dc` (single runner commit)
- **Merged to main:** `1f5383ad3ee7d7afb6ef5bbf36b1a4127047fae9`
- **Drained by:** s1480 fire, 2026-08-06
- **Verdict:** ✅ **MERGE** — and it completes the ER-01 census ladder E2..E10.

## What it does

Measures all four `epoch-10-deepsky` contracts against `HeadlessContractSim` under AP-11.
Verdict **0 AGENT-READY / 4 DATA-GAP / 0 BROKEN**:

- `e10-ember-shore` — preserve-contract Static squall has no headless consumer **and no declared
  `engineDependencies` entry** (the mechanic is named only in prose).
- `e10-archive-world` — declares `archive-world-consumers: missing` for ordered wing restoration,
  light holds, empty shelf, procgen, objective, lore unlocks.
- `e10-last-claim` — the browser v0 exists, but `last-claim-objective-consumer` is declared
  `missing`, no Static system runs headlessly, and the manifest cannot express the owner-ruled
  three verbs or split hands.
- `e10-river` — declares `credits-river-consumer: missing`; river/ford geometry derives, but PAN,
  credit flecks, the no-enemies/no-waves rule and completion do not.

## The scope call is the best thing in this slice

Every row is classified as **EXISTING DEBT** under the owner's ratified a/a/a Static ruling and
the post-launch `roster-wiring-e6-e10` leaf. The census says so explicitly and **neither sockets
nor re-specifies the finale** — *"do not stretch the E1 wave driver into a finale socket"*.

That is the correct call and the tempting one to get wrong: this is the game's ending, the browser
v0 already runs, and a generic wave hash was available for the taking. The census refuses it on
the stated ground that *"a generic wave hash would certify a different finale"*. Reject-don't-stretch,
applied where it costs the most.

## Evidence

| Gate | Result |
|---|---|
| Custody | detached worktree `gate-s1480` @ `271a40409`, stacked on E7+E8+E9 — §3.0b |
| §3.0 block check | UNKNOWN pre-drain (F-1480-1); leaf registered by this drain |
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **green, 1.89s** |
| Own spec, desktop + mobile | **8/8 passed, 8.7s**, `--workers=1` |
| Console/page errors | zero captured |
| Diff shape | **118 insertions, 0 deletions**, exactly 3 files |

## Merge classification

Base `main` @ `7b043b01` (post-E9). Both new files pure LANE-ONLY adds (38 / 79 lines).
`tasks/BACKLOG.md` BOTH-MOVED add/add — union-resolved, lane's `READY-FOR-GATES on lane/d`
retired to `✅ MERGED s1480` in the merge commit (F-1461-4). `SUPPORTED_CONTRACTS` and
`bench-seeds.json` unchanged; zero `src/` bytes, so F-1460-1 does not engage.

## Finding — F-1480-2 REVISED, and the revision matters more than the original

### ⚠️ Correction to `reviews/er01-e9-census.md`

That review (written by me, ~15 minutes earlier this fire) generalised from three instances:

> *"in every case the offender is **the epoch's flagship contract** — the one with the most real
> browser machinery behind it… This is now a pattern with a predictable shape."*

**E10 falsifies that at n=4.** E10's flagship is unambiguously `e10-last-claim` — the finale, the
one contract with a working browser v0 — and it **declares its missing dependency correctly**.
The offender is `e10-ember-shore`, which is not the flagship by any reading.

The E9 review has been corrected in place rather than left standing; the erroneous sentence is
struck there with a pointer here.

### The finding that survives

Across E5, E7, E9, E10 — **four epochs, exactly one offender each** — one contract per epoch names
its missing mechanic only in prose and omits the `engineDependencies` declaration AP-11 requires:

| Epoch | Offender | Flagship? |
|---|---|---|
| E5 Deepwater (s1461) | `e5-deepwater-claim` | yes |
| E7 Signal (s1480) | `e7-relay-valley` | yes |
| E9 Red Fields (s1480) | `e9-dome-basin` | yes |
| E10 Deep Sky (s1480) | `e10-ember-shore` | **no** |

So the real, defensible claim is narrower and duller than the one I first wrote: **the omission is
systematic (1 per epoch, 4 for 4), its victim is not predictable from flagship status.** The
consequence for readers is unchanged and is the part worth acting on — a reader of contract data
alone cannot tell "no missing dependency" from "missing dependency not declared", so an
undeclared contract reads as *more* ready than its honest siblings.

**Recommended (not authored — this is attended scope):** the fix belongs in the per-epoch socket
masters as a *declaration* fix alongside the socket, and it is cheap enough to be a single sweep
across all four contracts. **No corrective queued this fire** — E10's own rows are owner-ruled
post-launch debt under `roster-wiring-e6-e10`, and touching contract data to add declarations
would be exactly the content edit all four censuses correctly refused to make.

💡 *The reusable lesson, recorded because it cost nothing here and could have cost a wrong
attended master: three instances that agree are not a pattern, they are three instances. I had a
fourth data point ten minutes away and generalised before reading it.*
