# Review — art-e2-eight-winds-row-repairs (THE FOUR CROOKED WINDS)

**Slice:** `art-e2-eight-winds-row-repairs` (FIRE-AUTHORED s1192)
**Landed as:** `f61843c074d71b93b6659784e034e7f654abf8ba` — **already on `main`** (see F-1193-2: the run committed itself; there was no branch and therefore no merge step)
**Drained:** s1193 fire, 2026-07-29
**Verdict:** ✅ **ACCEPTED AS A PARTIAL — 2 rows landed, 2 rows parked.** Every number in the run report was re-measured from the bytes and every one held. The two parked rows are **byte-identical to their pre-batch state**, so this batch ships **no regression** and leaves two pre-existing defects explicitly open.

## What it does

Repairs four named diagonal rows across the three E2 enemy `walkdiag4` sheets, and — first — fixes the **data** that made one of them impossible to get right. `reviews/eight-winds/cast.json` gave `steam-wrecker` `"props": []`, so the prompt builder emitted no prop-side clause at all while the `who` string said the gauge panel sits "on one flank" without naming which. The entry's own `propNote` already said *"the **single** teal gauge panel"* — the canon was one panel and it had never reached a prompt. The run added the side as data (`side: "L"`, "exactly ONE, never two") and rebuilt all four prompts from the builder.

Of the four rows, **two landed** (Steam Wrecker row 2 `nw`; Rail Tough row 1 `se`) and **two parked** after three changed-premise attempts each (Coal Thief row 0 `sw`; Steam Wrecker row 1 `se`).

## Evidence — re-measured, not read

s1192's handoff pre-declared the three things a green run cannot show. All three were measured independently with `scripts/tmp-s1193-e2-row-repair-gate.mjs` against `f61843c0^`.

| gate | run report claims | s1193 measured | |
|---|---|---|---|
| Row-level byte-exactness, 12 rows | 8/8 required preserves identical; 10/12 overall | **10/12 identical**; the only rows that moved are **Steam Wrecker row 2** and **Rail Tough row 1** | ✅ exact match |
| Steam Wrecker row 2 `nw` cyan | clusters **1,1,1,1**, 100% screen-left (`116/0, 112/0, 117/0, 99/0`) | clusters **1,1,1,1**, cores **111/109/105/106**, side **L** in all 4 frames | ✅ reproduces the published control |
| Steam Wrecker row 1 `se` cyan | **2,2,2,2**, split across both sides | clusters **2,2,2,2**, cores `[43,84] [60,90] [36,90] [39,83]`, sides **R+L** in every frame | ✅ exact match |
| `side: "L"` — confirmed or contradicted? | **confirmed** from the shipped cardinal sheet (front `s` → screen-right, back `n` → screen-left, both ⇒ body-LEFT) | consistent: the landed `nw` row reads screen-**left**, which is what body-left predicts for a north wind | ✅ confirmed, both hemispheres (F-EW-5 satisfied) |
| `cast.json` blast radius | only `steam-wrecker.props` | diff is `+6 −1`, one entry | ✅ |
| Prompt rebuild | both Steam prompts gain one generated bullet; Coal Thief + Rail Tough **byte-unchanged** | matches — the two unchanged prompts are the check that the `cast.json` edit touched one entry | ✅ |

**The cyan instrument was validated before it was believed.** Its first calibration read 30 px where the published control said 116 — so by its own doctrine it was not trusted on the disputed row until it reproduced the known-good one. After calibration (teal predicate `g+b−2r ≥ 70`, dilate-then-cluster) it returns **1,1,1,1** on row 2 and **2,2,2,2** on row 1, and is **stable across dilation radii 4/6/8** — the result is not a knob-tuning artifact.

| gate on the merged tree | result |
|---|---|
| `npx tsc --noEmit` | **rc 0** |
| `npm run build` | **rc 0**, 1.43 s, asset-diet green |
| `node --test scripts/*.test.mjs` (node guards) | **61/61**, run **before** gating per standing order |
| playwright | **not run, and that is proportionate** — the commit touches no `src/`, no `e2e/`, no contract, manifest, balance or spec; nothing renders (see Mistake #10 below) |

**Mistake #10 — where does the PLAYER see this, in a plain boot? Answered from source: NOWHERE YET, and that is correct.** Runtime binds the **cardinal** cells — `src/assets/generated.ts:11-13` and `src/encyclopedia/registry.ts:18-20` both point at `assets/processed/char-{railtough,steamwrecker,coalthief}-sheet-walk4-a-r0c0.png`. The **diagonal** `walkdiag4` raws this batch repaired are referenced nowhere in `src/` or `e2e/`, and no processed cells were shipped (`grep` for the three stems in `src/`+`e2e/` returns only cardinal paths). The E2 diagonal wiring slice is where a player would first see these rows. ⇒ **GZ-01 is not owed for this merge** (the filter law asks for a player-visible change; there is none).

## Why the partial is an ACCEPT and not a REJECT

s1192's pre-declared gate said *"every frame of Steam Wrecker rows 1 and 2 must read exactly 1; a **2** anywhere is a REJECT, not a note."* Row 1 does read `2,2,2,2` — **and it is byte-identical to its pre-batch state.** That gate was written on the assumption that row 1 would be regenerated; the run instead rejected three bad takes and grafted none, so the `2,2,2,2` is the **pre-existing** defect, not something this batch shipped. Rejecting the merge would discard two genuinely good rows, would not fix row 1, and would punish precisely the behaviour the laws demand: reject-don't-stretch (Mistake #14), three attempts each with a **changed premise** (§7.5), and **no failed take silently replaced** — all eight candidates are retained under `reviews/eight-winds/crops/e2-repair-*.png` with the rejection reason in the filename.

## Merge classification

**None — the work was already on `main` when the drain began** (F-1193-2). No branch, no base, no graft, no conflicts. The drain therefore gated the merged tree directly and verified by row-hash that the commit changed exactly the two rows it claims and nothing else.

## Findings

- **F-1193-2 (process, MEDIUM — a live mechanism, benign this time).** `f61843c0` carries **`tasks/lane-a-m3-05e-ledger-rush-card-evidence.md`** — a master authored by *this fire* minutes earlier — plus `logs/dashboard.html` and `logs/task-stats.jsonl`. None appear in the art task's TOUCH-ONLY list. ✓ **Neither runner commit path can produce this, verified by reading `scripts/lane-runner-v3.sh`:** the scoped art branch at `:88` is pathspec-limited to `assets artifacts` **and is unreachable for this slot**, because `dir_for_slot("art")` returns `$ROOT/worktrees/art` (`:31`) which is not `$ROOT`, so the `:78` guard is false; and the lane branch at `:105` runs with cwd `worktrees/art`, which **`.gitignore:13` excludes**, so its `-- .` pathspec stages nothing at repo root. ⇒ the commit was made by **Codex itself**, against `AGENTS.md:18` ("no commits") and `AGENTS.md:37` ("never commit to main"), using a message that mimics the runner's `runner(<slot>): <task>` format. **Impact:** harmless here — it swept a file this fire intended to commit anyway — but it is Mistake #3 / the attended-coexistence hazard with a working mechanism: an ART run that commits broadly to `main` will sweep **any** concurrent uncommitted work, a fire's or the attended session's, into a commit attributed to an art task. Non-blocking for this merge; **the corrective belongs to whoever owns the runner/art-slot contract**, and the cheapest durable fix is to make `worktrees/art` a real git worktree (which would also close **F-1120-2**, the 566 MB AT-RISK hole, since both defects have the same root cause: `worktrees/art` is a plain ignored directory pretending to be a slot).
- **F-1193-3 (residual, open — NOT a defect of this batch).** Two rows remain wrong on `main` and are now *documented* rather than silently broken: **Coal Thief row 0** is still the old duplicate `se` instead of `sw`, and **Steam Wrecker row 1** still carries `2,2,2,2` cyan clusters (two tanks where canon says one). Both are byte-identical to their pre-batch state. **Re-queue only with a changed generation premise** — the run's own closing line says "do not retry either row identically", and §7.5 forbids an identical third attempt. Three premises are already spent on each: base prompt, `--retake-mirrored`, and retake-plus-cardinal-front-row-control.
- **F-1193-4 (informational).** All three raws exceed the 600 KB cap (1.20–1.37 MB), reported and deliberately **not** optimized — consistent with LEDGER rows 63–65, where the same sheets ship over cap. No new debt; recorded so the cap conversation has a number.

## Bookkeeping

- `assets/LEDGER.md` row **67** written by the run (verified: row 66 exists, so the numbering has no gap).
- Goal leaf `art-e2-eight-winds-row-repairs` → `merged` with the full 40-char hash, in the drain commit (Goal Registration Law).
- Done-move renamed `shipped-f61843c0-…`.
- **ART-SLOT LAW** (this fire touched the ART slot): `node scripts/art-staging-audit.mjs` → **AT RISK 748 files / 566.47 MB** (unchanged; standing F-1120-2) · **LOCAL-ONLY 3 files / 2.70 MB** (was 0 at s1192 — one push from safe).
