# Review — art-sprite-production-06 (The Bandits: base + thief) · ART DRAIN

**Slice:** art-sprite-production-06-bandits (`tasks/failed/rc1-20260710-063043-art-sprite-production-06-bandits.md` is the stale first attempt; the successful re-run is the runner log `tasks/runs/20260710-154500-art-art-sprite-production-06-bandits.md.log`, DONE rc=0 17:22) — walk8 Seedance production for the three claim-jumper bandits (base / thief / wrecker), following the v2 pipeline template `tasks/art-sprite-production-05-town-cast.md`.
**Producer:** ART slot (Codex). Raws committed to main directly by the runner's repo-root broad-add (`c02ec2f runner(art): art-sprite-production-06-bandits.md` — F-071 recurrence; raws + LEDGER rows landed, **no processed cells, no review**).
**Drained/gated:** s293 fire, 2026-07-11 (art slot idle, `tasks/running/` empty, all queues empty — no live-runner collision; F-080b-2 avoided). This is a **post-hoc processing drain**: the raws were already on main; s289–s292 never extracted them (busy draining the newsie / hero / save-surfaces pile).
**Verdict:** ✅ **SHIPPED (art PASS)** for **bandit-base + bandit-thief**. Both walk8 sheets are canon-clean, on-style, adult-proportioned, and extract to 32 clean runtime cells. Landed as **raw + processed but UNWIRED** (firewall: NO src/) — enemy sprite wiring is a separate slice. Display-safe, no gameplay change. **Wrecker = NOT produced** (owner resource wall — see below); its LEDGER row stays PENDING-ART.

## What it is
The claim-jumper bandit cast (the poncho/hat outlaw family established by the batch-018 turnarounds): two 4×8 walk8 sprite sheets —
- `assets/raw/char-bandit-base-sheet-walk8.png` — the base rustler (solid tattered poncho, rope/grapple hooks side-pinned).
- `assets/raw/char-bandit-thief-sheet-walk8.png` — the lighter quick-step thief (fringed jacket, waist satchel + rope).

Both 2240×1360, 8 cols × 4 rows (frame × direction: down / left-profile / left-quarter / up-back), opaque `#ff00ff` key, no mirrors. Extracted this drain to 32 runtime cells each + a `frames.json`. **No `src/` or layer-contract edit** — the bandits are not wired into any spawn/render path (that slice owns `characters.v2.json` / enemy sprite binding).

## Geometry + extraction (first-hand this fire)
- Both sheets: **2240 × 1360, 8-bit RGBA** → 8 cols × 4 rows → **280 × 340 source cells** ✓ (spec-exact, matches the town-cast/newsie geometry).
- `node scripts/extract-alpha.mjs --key ff00ff --grid 8x4 assets/raw/char-bandit-base-sheet-walk8.png assets/raw/char-bandit-thief-sheet-walk8.png`:
  - **base** → 32/32 cells @512px + `char-bandit-base-sheet-walk8.frames.json`, keyed 75.2%, despilled 18247px, **scale = 1** (figure fits natively, never upscaled).
  - **thief** → 32/32 cells @512px + `char-bandit-thief-sheet-walk8.frames.json`, keyed 81.4%, despilled 16682px, **scale = 1**.

## Seam-law check (adult band + intra-sheet alignment)
All cells share the normalized frame → **footline spread = 0 within each sheet** (feet land on one baseline; no per-frame bob when animating). Adult-proportion confirmation, apples-to-apples in the identical pipeline (all `scale=1`, 512 cell):

| Character | normalized content height | median content width | read |
|---|---:|---:|---|
| **bandit-base (adult)** | 334 | 213 | full-cell adult ✓ |
| **bandit-thief (adult, lighter)** | 334 | 198 | adult, narrower silhouette ✓ (thief build) |
| newsie (Mei, child — s292) | 291 | — | correctly shorter than the adults |

- Both bandits sit **above** the child (334 vs 291) and read as full adults filling the cell — **no shrink, no child-scaling** of the outlaws.
- Thief medW (198) < base medW (213) — the lighter quick-step build reads in the silhouette, as specced.
- Final on-screen scale + cross-character foot anchoring are set at wire time in the enemy binding; nothing here can size-pop until then.

## Art QA (visual — raw sheets + processed down/front cells, first-hand this fire)
- **No firearms — hard canon §9 gate PASS**: base carries a coiled rope + grapple hooks on the hip; thief carries a waist satchel + rope. Melee/grapple/tool gear only, both. Zero firearm read in any frame.
- **Illustrated, warm, never gory** ✓ — earthy sepia/rust palette, engraved-parchment kin to the town cast and the batch-018 turnarounds; menace is silhouette + gear, not blood.
- **Fully-clothed adult outlaws** ✓ (poncho/duster/hat/boots; nothing exposed) — not peoples, canon-safe outlaw archetype.
- **Identity held across all 4 directions + walk frames** — same figure per sheet; poncho/hat family preserved (base = solid rust poncho, thief = fringed vest + neckerchief).
- **Asymmetric gear side-pinned consistently** (asymmetry/seam law — no side-swap or mirror frame-to-frame): base rope/hooks and thief satchel stay on the same side through the turn.
- **No readable text / letters / numbers / logos · no extra characters.** All canon §9 gates PASS.

## Buildability (asset-only, certified this fire)
- `npx tsc --noEmit` → **clean**.
- `npm run build` → **green** (✓ built in 390ms).
- Touches **zero src / e2e / config / Balance / schema / layer-contract** — only `assets/processed/char-bandit-{base,thief}-sheet-walk8*` (64 cells + 2 frames.json), `assets/LEDGER.md`, this review. tsc/build trivially unchanged; certified green regardless.

## Findings
- **F-bandit-1 (non-blocking — thief profile-frame residual key fringe):** the thief processed cells retain **5456 near-magenta px = 0.9503% of opaque area** (worst `-r2c1/-r2c4/-r2c7` ≈ 380px each, on the left-profile row), vs the base's clean **0.0109%** (82px). Diagnosis (first-hand): **100% of these pixels are semi-transparent edge (alpha < 230); zero interior/opaque** — it is anti-aliased boundary fringe, not artwork. Cause is the thief's **frayed/tattered silhouette** (fringed poncho hem, loose straps, rope coils) = far more soft-edge perimeter than the base's solid poncho, so more residual magenta-tinted edge pixels at the same per-pixel rate. A re-extract at `--tol 34 --feather 20` did **not** move it (0.9503 → 0.9404%) → the despill's hue-subtraction has already done its work; the remainder is inherent soft-edge tint. **Display-safe while unwired**; at true game scale (sprites ~48–64px, heavy downscale) the soft-edge tint blends. Recommend an in-game re-QA at the wire slice against dark backgrounds, and a targeted edge-despill pass only if a pink halo actually reads. Not blocking an unwired raw+processed handoff.
- **F-bandit-2 (owner-owed, not a defect — wrecker not produced):** `char-bandit-wrecker-sheet-walk8.png` was **never generated** — the run hit the task's clean partial-stop rule: Higgsfield balance was **384 credits** and the expected 244-credit wrecker run would drop below the task's **300-credit floor**, so Codex stopped before spend (correct, in-contract). LEDGER row 50 (`char.bandit_wrecker`) stays **PENDING-ART**. To finish the trio the owner must top up the higgsfield/Seedance balance, then a fire re-queues just the wrecker leg (turnaround `turn-bandit-wrecker.png` already on main; the master says "verify cell band vs the baron precedent, don't shrink" for the heavy build). **Owner resource wall — nag, don't block.**

## Merge classification
No branch merge — the raws already sit on main (runner broad-add `c02ec2f`); this drain only adds the processed cells + evidence. Path-scoped `git add` of exactly: `assets/processed/char-bandit-base-sheet-walk8*` (32 cells + frames.json), `assets/processed/char-bandit-thief-sheet-walk8*` (32 cells + frames.json), `assets/LEDGER.md`, `reviews/art-sprite-production-06-bandits.md`. No corrective task spawned (F-bandit-1 non-blocking / wire-time; F-bandit-2 owner-owed). **Not player-visible** (unwired) → per GZ-01 filter law, **no gazette item**.
