# gauntlet-heat9-r2 — the de-conflation field, re-run

**Slice:** `gauntlet-heat9-r2` · **branch:** `lane/b` · **tip:** `ada738857 (archive: pruned by the A3 rewrite)` · **merge:** `4e0328e56 (archive: pruned by the A3 rewrite)`
**Drained:** s2430, 2026-09-01 · **Master:** `tasks/done/20260901-152657-gauntlet-heat9-r2.md`

## Verdict

**MERGED.** The re-run's premise held, both rigs rode the full field, and every headline claim in
the runner's own note was **re-derived from the artifacts rather than trusted** (the drain's own
re-derivation is a free control on the runner's headline). Zero source, spec, review, STATUS,
BACKLOG or e2e paths touched — verified mechanically, not taken on the self-check's word.

## What it does

Heat 9 originally **stopped correctly** at its early skew probe: production minted tapes at engine
pin `417ac150…` while era 5's registry recorded only its declaration pin, so the door answered
`400 reel_not_current` and the whole field DNF'd without an attempt. That premise was cured
attended at `ec71f923` (both owed era-5 pins appended with causes, era **unchanged**).

This re-run confirms the cure **by riding**: the early probe verified instead of stopping, and both
executable families completed the four-map field separately for the first time.

It is also **the first post-conflation field**. Heats 6–8 merged the two rigs under one label
(`pi (Prime Agent)`), and heat 8 actually invoked Prime under the misleading `pi` key. PI
(`@mariozechner/pi-coding-agent` 0.73.1) and Prime Agent (Prime Intellect `prime-agent` 0.8.0) now
have separate receipts, separate notebooks and separate verified rows. **Future masters must name
both** — that is the durable output of this heat.

## Evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 7.5 s |
| `npm run build` | **rc=0**, 19.8 s |
| `npm run test:ledger-guards` (merged tree) | **rc=0 · 981 pass / 0 fail** |
| Merge classification | **81 files, 81 `A`, 0 `M`, 0 `D`** — pure additions under one new dir |
| Firewall (master: artifacts-only) | **HELD** — every path under `artifacts/gauntlet-heat9-r2-20260901/` |
| Path collisions with main | **0** — no `MAIN-MOVED` path exists, so no conflict was possible |

### Headline claims re-derived from the artifacts, not from the note

| Submission | Note claims | `post-response.json` | `verdict-slip.json` | Agrees |
|---|---|---|---|---|
| Operator probe | rank 4, `fnv1a32:8886f412` | `rank: 4` | `assay:"verified"`, `ranked:true`, `8886f412` | ✅ |
| PI — The Claim | rank 6, `fnv1a32:490b83e3` | `rank: 6` | `assay:"verified"`, `ranked:true`, `490b83e3` | ✅ |
| Prime — The Claim | rank 8, `fnv1a32:904e9638` | `rank: 8` | `assay:"verified"`, `ranked:true`, `904e9638` | ✅ |

**The engine envelope is byte-identical across all three** `watch-reel.json` `reel.meta` blocks and
matches the note exactly:
`{"buildId":"ec71f9234","engineHash":"25040ad58451125adfa7d1d6c19c70f40ce17cd8cc6d377134e0a545922ca2ca","era":5}`

### Field results (both rigs, verbatim from the matrices)

| Map | PI 0.73.1 | Prime Agent 0.8.0 |
|---|---|---|
| The Claim | **secured** w10/300s/2g → rank 6 | **secured** w10/300s/0g → rank 8 |
| Night Shift | 3 deaths (w2/w2/w3) — not submitted | wall + 2 deaths (w3/w5) — not submitted |
| Hill Mine | 3 deaths (all w2) — not submitted | 3 deaths (w1/w1/w3) — not submitted |
| Baron | 2 walls + death w12 — boss not reached | 3 walls — boss not reached |

**No unsecured or wall-only attempt was posted.** Neither rig secured Night Shift, Hill Mine or
Baron, and the note does not dress that up — it is a partial field, honestly reported.

## Findings

**F-2430-3 — the desk's F-2408-1 alarm text is now refuted BY EVIDENCE, not merely stale.**
The engine-pin desk item reads *"Nothing rideable can score until this is ruled"* and cites as its
realised cost *"the whole heat-9 field — PI and Prime Agent, the two rigs you asked for by name,
both DNF'd without an attempt."* **Both rigs have now ridden and both hold verified era-5 rows on
the live board.** s2424 and s2429 both flagged that text as stale on the strength of the attended
`ec71f923` commit; this slice supplies the positive evidence that the cure *works in production*,
not merely that it landed. **NON-BLOCKING and the desk item is deliberately NOT retired here** —
question (ii), whether `package.json` belongs in `ENGINE_SOURCE_INPUTS` at all, is untouched by
this run and remains a genuine owner fork. Retiring another fire's desk item on my own reading is
not a fire's call.

**F-2430-4 — a diagnostic attempt is retained as transport evidence and correctly excluded from the
matrix; the exclusion is sound.** PI's first Claim attempt died w2 because the stateless driver
supplied the manual only on the first completion, so three later order arrays were rejected. The
runner fixed the driver once, re-ran, and **all subsequent PI and Prime transcripts show zero
rejected arrays** — so this is a harness defect that was found, fixed and evidenced, not a
gameplay result. Counting it as an attempt would have understated both rigs. **NON-BLOCKING.**

## Merge classification

Base `main` at `89ce6e60e`; lane tip `ada738857 (archive: pruned by the A3 rewrite)`, a single runner commit. Every one of the 81 paths
is **LANE-TOUCHED and new**; there are **no MAIN-MOVED paths**, so no three-way graft was required
and no conflict was possible. Merged `--no-ff` and committed as one act (F-1589-5 — never leave a
merge staged on main).

## Not gated, and why

No playwright run, no screenshots, no perf table. **Nothing in this slice renders**: it adds 81
evidence files under `artifacts/` and changes no `src/`, `e2e/`, `functions/`, `scripts/` or config
path, so the merged tree's run surface is **byte-identical to main's**. `tsc` and `build` are
reported above as positive proof of that, rather than skipped on the same argument.
