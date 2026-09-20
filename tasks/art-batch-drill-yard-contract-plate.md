# art-batch-drill-yard-contract-plate — the 42nd contract gets its own board card
**FIRE-AUTHORED s1331 (attended review welcome)**

**Role:** ART-slot generator (Codex `image_gen`, native path only — no paid-credit path).
**Workdir:** `worktrees/art/` (a PLAIN DIRECTORY, not a git worktree — it has no `.git` and does not
appear in `git worktree list`. Your output is untracked-by-default; see scope 5.)

## READ FIRST (paths, in this order)
1. `specs/practice-claim/README.md` — the ratified spec. **12 lines; read all of it.**
2. `assets/requests/art-batch-020-contract-plates.md` — the batch this one extends; the style
   anchor lives at its line 12, and the six E1 teases are its "Accepted raws" table.
3. `assets/LEDGER.md` entry **36** (art-batch-020) and entry **53** (art-batch-028, the E4–E5
   contract plates) — the two QA precedents you must match.
4. `src/town/TownScene.ts:2782-2794` (`function renderContractArt`) — **the consumer.** Read it
   before naming your output file; a plate the resolver cannot address is a plate that does not exist.

## WHY (evidence, quoted and dated — do not re-derive, but do re-verify scope 0)
- **The spec slice already ordered this.** `specs/practice-claim/README.md:9`, SLICE PC-01:
  *"map (small mask reuse), **board card**, budget faucet, straw targets, drill bell, exit/reset."*
  PC-01 shipped at `f86b28b3` (2026-08-01 08:14) **without the board card.**
- **Owner order, 2026-07-10** (`assets/requests/art-batch-020-contract-plates.md:9`, verbatim):
  *"each contract should have an image depicting what it is about, its topic and tease that.
  Not a generic image."*
- **Measured, s1331 (F-1331-1, `tasks/BACKLOG.md`).** `assets/raw/` holds **41**
  `plate-contract-*.png` for **42** shipped contracts; set difference names exactly one contract
  with no plate: `e1-drill-yard`. It therefore falls through to the last-resort fallback at
  `src/town/TownScene.ts:2790` (`const imageUrl = plateUrl ?? interimUrl ?? contractPlateUrls['../../assets/raw/plate-contract-the-claim.png'];`)
  and **renders the Claim's card.**
- **A live test names it.** `e2e/board-card-images.spec.ts:45` ("all contract chapters use their own board-card URL") fails with `Error: e1-drill-yard` on
  `expect(imageUrl, contract.id).not.toBe(claimUrl)`. That suite went red at `:37` on a stale
  count until merge `68deb90a`; the count now passes and this is the remaining failure.
- **Not blocked on the map's own art.** The census records the Drill Yard rendering painted-not-glb
  with no mounted landmark (F-1331-2). That is the terrain tier and is **irrelevant here**: a
  contract plate is an *illustrated* engraved plate, not a render of the map. The six E1 plates
  predate their maps.

## SCOPE (numbered; each item is checkable)

**0. PRE-FLIGHT — verify the premise before spending a single image call.**
   Run, from the repo root, and STOP with a written report if either answer differs:
   - `ls assets/raw/plate-contract-e1-drill-yard.png assets/raw/plate-contract-drill-yard.png`
     → **both must be absent.** If either exists, the batch is already shipped: STOP (Mistake #8).
   - Confirm `e1-drill-yard` is still in `assets/contracts/epoch-1-frontier/contracts.json`.
   If either check fails, write WHY into your report and stop. **A run that changes nothing must
   say why** (Mistake #1).

**1. Generate ONE plate: `plate-contract-e1-drill-yard.png`.**
   - **Filename is load-bearing and verified against the consumer.** `renderContractArt` tries
     `plate-contract-${contract.id}.png` FIRST (`src/town/TownScene.ts:2787`), then the legacy
     prefix-stripped form (`:2788`). Use the **full-id** form — `plate-contract-e1-drill-yard.png` —
     which is the modern convention (cf. `plate-contract-e4-dust-flats.png`, LEDGER 53).
   - Absolute output path: `/Users/robin/Claude/Projects/Gold Rush/assets/raw/plate-contract-e1-drill-yard.png`
   - **Full-bleed 16:9 landscape, 1672×941, opaque sRGB.** No `#ff00ff` key (this is a reference-tier
     full-bleed plate, NOT a sheet — so there is no extraction and no seam law).
   - **Style anchor — paste VERBATIM into the prompt, exactly as it appears at
     `assets/requests/art-batch-020-contract-plates.md:12`:**
     > Antique frontier expedition ledger map ... Style of a Wild-West survey map: fine sepia engraved linework and hatching, subtle aged-paper texture underneath, muted warm colors, illustrated - not photorealistic, not saturated.
   - **The tease (what this contract IS, per the spec's laws 1–4):** a practice ground at the edge
     of town where nothing is at stake — a fenced yard of **straw men and rolling log dummies**, a
     **drill bell** on its post, and the **assay tent with the county's top-up lever** for practice
     gold. It should read as a *gym*, not a battle: orderly, warm, unthreatening, obviously safe.
   - **Retakes: maximum 2.** Reject and retake on any canon or QA failure below rather than
     accepting a near-miss.

**2. CANON — non-negotiable (`CLAUDE.md` §4.9, brief §9).**
   - **NO firearms, ever.** Frontier-tech only.
   - **TARGETS, NOT VICTIMS** (`specs/practice-claim/README.md:6`, verbatim: *"straw men and rolling
     log dummies (canon-safe: no fevered folk get practiced upon)"*). The dummies must read
     unmistakably as **straw and timber** — never as a person, a body, or a hanged figure.
   - Illustrated, warm, never gory. No horror framing.
   - **No visible letters, numbers, signage, watermarks or logos** of any kind.
   - No decorative map borders or corner marks — both were retake causes in batch-020.

**3. MEASURED self-QA (numbers in your report, not adjectives).**
   - Dimensions + mode read back from the written file: **1672×941, RGB/opaque**. Aspect within
     **0.06%** of the 1.77683:1 anchor (the batch-028 bar).
   - Mean luminance inside the six-anchor band **0.078–0.525** (LEDGER 53). Report the number.
   - **Card-scale legibility:** at **240px wide**, name the distinct zones you can still identify
     (batch-025 used four). Target ≥3 — e.g. dummy line / bell post / assay tent.
   - Zero exact `#ff00ff` pixels.
   - Explicit PASS/FAIL per scope-2 canon bullet, checked by looking at the image.

**4. Write the run note** to `assets/raw/codex-art-run-drill-yard-contract-plate.md`: the verbatim
   prompt(s), native job/call id(s), retake count **with the reason for each**, the scope-3 numbers,
   and the SHA-256 of the final PNG.

**5. RETENTION (`CLAUDE.md` §4.10b) — your output dies with the disk unless you do this.**
   `worktrees/art/` is not a git worktree, and F-1045-1 found 10 files / 16.5 MB of art stranded in
   no object database, the oldest for 14 days. Therefore: **write the PNG and the run note directly
   to `assets/raw/` under the repo root** (paths above), so the drain can `git add` them by path.
   Do NOT leave the only copy in a scratch directory.

## TOUCH-ONLY
- `assets/raw/plate-contract-e1-drill-yard.png` (new)
- `assets/raw/codex-art-run-drill-yard-contract-plate.md` (new)

## NO — violations, not judgement calls
- **NO `src/` edits.** In particular do NOT touch `src/town/TownScene.ts`. The resolver already
  addresses this filename by glob (`:95`, `:2787`); the plate wires itself by existing. **Wiring is
  the drain's job, and TownScene.ts is currently HELD on lane-b** (`lane-usable` → HOLDS), so an
  edit here would collide with an owner-gated branch.
- **NO e2e edits.** Do not touch `e2e/board-card-images.spec.ts`. That test is the *instrument* that
  proves this batch worked; editing it would be marking your own homework.
- NO other contract plates, no contact sheet, no processing, no extraction, no `assets/processed/`.
- NO edits to `assets/contracts/**`, specs, reviews, `tasks/**`, `STATUS.md`, or `assets/LEDGER.md`
  (the LEDGER entry is the drain's, per §8).
- NO `git commit` (the ART slot's `-A` commit has swallowed a live fire's work before — leave the
  files in the working tree for the drain).

## SELF-CHECK before you report
- [ ] Scope-0 pre-flight ran and both files were absent (quote the `ls` output).
- [ ] Exactly ONE new PNG exists, at the exact absolute path, named `plate-contract-e1-drill-yard.png`.
- [ ] Style anchor pasted verbatim — quote the line you pasted.
- [ ] Every scope-2 canon bullet answered PASS/FAIL individually.
- [ ] Scope-3 numbers present: dimensions, aspect delta %, mean luminance, 240px zone names, `#ff00ff` count.
- [ ] Run note written with prompts, job ids, retake count + reasons, SHA-256.
- [ ] `git status` shows ONLY the two new untracked files under `assets/raw/` — no `src/`, no `e2e/`, nothing else.

**READY-FOR-GATES** — report: the two file paths, the scope-3 measured table, the retake count with
reasons, the canon PASS list, and (if you stopped) exactly which pre-flight check failed and why.

## FOR THE DRAINING FIRE (not this run's work)
1. Verify the plate at card scale in-game, desktop + 390px, and screenshot to `reviews/shots-drill-yard-plate/`.
2. `e2e/board-card-images.spec.ts` should go **GREEN** (`--workers=1`). That is this batch's acceptance
   test: it currently fails `Error: e1-drill-yard` at `:45`. **If it still fails, the plate is
   mis-named — re-read `src/town/TownScene.ts:2787-2790` before regenerating anything.**
3. `assets/LEDGER.md` entry + `tasks/goals.json` leaf `drill-yard-contract-plate` → shipped, in the
   drain commit (Goal Registration Law).
4. Run `node scripts/art-staging-audit.mjs` and report **both** its AT RISK and LOCAL-ONLY counts.
