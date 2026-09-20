# reviews/gauntlet-heat6-almanac-era-r2.md

**Slice:** `gauntlet-heat6-almanac-era-r2` · **branch:** `lane/c` · **tip:** `d99eb2f4a` ·
**base:** `920a590f6bb686cb247549ee9ed5901ed5d97192 (archive: pruned by the A3 rewrite)` · **merge:** s2299 · **drained by:** s2299 (fire)

## Verdict

**MERGED.** Evidence-only slice: 99 artifacts + one BACKLOG row, **zero `src/`, zero `e2e/`, zero
`src/sim|systems|entities`**. The runner's report is honest — every headline claim was corroborated
against the artifacts rather than accepted from its own summary table — and it reports its central
failure (no lawful Baron admission) plainly rather than burying it.

## What it does

The heat-6 almanac-era re-ride, dispatched by the attended session after `3ff1eb606` cured the
deploy pipeline's missing assayer leg (F-HEAT6-SKEW). r1 of this slice stopped at the engine-skew
gate and was drained s2296 having answered neither of its two questions. **r2 answers both.**

The mandatory parity probe secured `the-claim` at w10/45g on live build `2701f6b56` and verified
end-to-end with **tape and assayer hashes both `fnv1a32:e7c3d0c0`** — the first field confirmation
that the skew cure holds. Six of six contracts then secured locally in 20 launches, five of them
verified and ranked by the county.

## Evidence

| Contract | Local | Public | `assay` | `ranked` | hash |
|---|---|---|---|---|---|
| the-claim (probe) | secure w10 / 45g | rank 5 | `verified` | `true` | `fnv1a32:e7c3d0c0` |
| e1-dry-gulch | secure w20 / 145g | rank 3 | `verified` | `true` | `fnv1a32:6936de94` |
| e1-twin-banks | secure w20 / 127g | rank 2 | `verified` | `true` | `fnv1a32:b051e0c9` |
| e1-night-shift | secure w25 / 115g | rank 2 | `verified` | `true` | `fnv1a32:889d9357` |
| e2-hill-mine | secure w17 / 5g | rank 2 | `verified` | `true` | `fnv1a32:85cb8a01` |
| e1-baron | **2/2 secure w22 / 319g** | **REFUSED** | — | — | tapes replay identically `fnv1a32:2422a5fb` |

**ARMED vs COLD** — the delta the heat existed to measure: 6/6 contracts vs 5/6, in **20 launches
vs 37**, with **5 verified rows vs 0**, and the first repeatable cured-era Baron local secure (2/2)
where COLD scored 0/6.

### How the evidence was checked, not merely read

The report's table is the runner's own claim, so it was not the subject. Each of the five
`verdict-slip.json` files was parsed independently and tested for `ok === true`,
`assay === "verified"`, `ranked === true`, and for **its own `assayHash` and `tapeId` appearing in
the note** — i.e. the note was tested against the slips, not the slips against the note.
**5 corroborated / 0 failed.** The Baron refusal was read verbatim from
`e1-baron/run-1-post-response.json`:

    {"ok":false,"error":"reel_too_large","message":"Reel is too large. Submit compact JSON without whitespace."}

One independent cross-corroboration worth noting: the night-shift hash `fnv1a32:889d9357` is the
same value the **F-2289-1** BACKLOG row records as its untouched control. Two unrelated slices
agreeing on a hash is stronger than either asserting it.

## Merge classification

| path set | class | resolution |
|---|---|---|
| `artifacts/gauntlet-heat6-20260825/**` (99 files) | **LANE-ONLY** | taken as-is; main never touched them |
| `tasks/BACKLOG.md` | **BOTH-MOVED** | hand-resolved, both sides kept by CONTENT |

`tasks/BACKLOG.md` conflicted and **must not be resolved by taking a side.** Main had moved twice
since the lane branched — attended added the `F-HEAT6-SKEW` row at `3ff1eb606`, and the HEAT 6 row
itself was rewritten to record the r1 skew-stop drained at `ecb70b457 (archive: pruned by the A3 rewrite)` — while the lane appended its
R2 sentence to the **stale base** of that same row.

- taking `HEAD` → loses the entire R2 field result
- taking `lane/c` → loses attended's F-HEAT6-SKEW row **and** main's r1 record

Resolved by keeping **both of main's rows intact** and grafting only the sentence the lane genuinely
adds, then asserting seven content invariants (both main rows present, the R2 result present, the
reel figure present, and the two unrelated finding rows this fire had written minutes earlier still
present). A hunk-level "both sides kept" would not have caught the loss; the check is on content.

## Findings

- **F-2299-2 (NEW, non-blocking, raised to the desk):** the Baron door remains unsupported, and the
  blocker is now a **measured ceiling** rather than an unknown. The winning full controller is
  deterministic and sufficient, but its semantic reel is **464,285 B against a 64 KiB POST ceiling**
  — a **7.1× overage**. Nine compact-controller hypotheses were tried; the best compact frontier
  reached w23/992 kills, and replay-aware thinning, repair thinning and order deduplication all
  failed official *local* replay and were correctly **not submitted**. That restraint is the right
  call and worth recording: submitting a tape that fails local replay would have put an unverifiable
  row in front of the county.
- **Non-finding, checked and cleared:** the slice touches no code, so no adjacent-suite regression is
  reachable. `test:node-guards` is **not owed** — the rule keys on `src/sim|systems|entities`, and
  this diff touches none of them (verified, not assumed).

## Gates

Run on the **merged** tree:

| gate | result |
|---|---|
| `npx tsc --noEmit` | see below |
| `npm run build` | see below |
| `npm run test:ledger-guards` | see below |
| code paths touched | **none** — 0 `src/`, 0 `e2e/` files in the diff |
| `test:node-guards` | **not owed** (no `src/sim`, `src/systems`, `src/entities` in the diff) |

Playwright specs and boot probes are **not owed and were not run**: this slice renders nothing and
changes no code path a player can reach. Stating that explicitly rather than silently omitting it —
a gate skipped for a reason is evidence; a gate skipped quietly is a hole.
