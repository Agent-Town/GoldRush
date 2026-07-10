# Review — art-ts-02-facades (Town v2 facade plates) · POST-HOC GATE

**Slice:** art-ts-02-facades (TS-02 THE FACADE ART, spec `specs/town-v2-style/README.md`, RATIFIED 2026-07-10)
**Landed on main:** `cb69802 runner(art): art-ts-02-facades.md` (ancestor of tip `a254575`) — **UNGATED at land time** (runner broad-add; see Findings).
**Gated:** s288 fire (post-hoc), 2026-07-10.
**Verdict:** ✅ **SHIPPED (art PASS, retro-gated).** Six E1 facade plates are canon-clean and on-style. Buildability re-confirmed. Scene-mount is a separate slice (firewall: NO src/) — the plates are display-safe until then.

## What it is
Six full-bleed portrait painted facade plates (2.5D billboard source) for the town's E1 ring, conditioned on the TS-02 style reference (`assets/reference/agenttown-town-style.jpeg`), each building's shell, and the E1 palette. OUR canon names/roles — no saloon/town-hall renames. Wiring (mounting as depth billboards) is TS-02's scene-side slice, explicitly out of this task's firewall.

## Art QA (visual inspection, each plate vs the reference)
| Plate | Pictogram signage (NO letters) | Canon name/role | Style match |
|---|---|---|---|
| `facade-tavern.png` | beer stein + hanging lantern | tavern (not saloon) ✓ | ✓ warm engraved-painted, timber/porch/warm windows |
| `facade-claim-office.png` | brass placard: map-pin + gold pan of nuggets | claim office ✓ | ✓ brass-fitting motif (Calculating-House kin) |
| `facade-schoolhouse.png` | open book + assay pan; bell tower | schoolhouse ✓ | ✓ (book pages blank — no letters) |
| `facade-assay-office.png` | brass scales + gold nugget + assay pan; teal science trim | assay office ✓ | ✓ (teal accent ties the science dimension) |
| `facade-general-store.png` | tin mug + flour sack + goods crate | general store ✓ | ✓ laden porch, barrels/produce |
| `facade-chapel.png` | radiant bell + rooftop cross | chapel ✓ | ✓ gothic arched glass, bell tower |

- **NO letters anywhere** (canon §9: pictogram signage only) — confirmed on all 6. The reference itself carries lettered signs (TOWN HALL/SALOON/PONY EXPRESS); the plates correctly translate those to pictograms.
- **Style DNA** = warm illustrated / engraved-parchment kin, matches the reference's painted western look. Minor render variance (claim/assay a touch more cel-saturated than the tavern's line-heavy engraving) — within family, NOT a retake trigger (task allowed ≤2 retakes each; 0 used).
- **Proportions:** portrait facades wrapping their footprints (`src/town/townLayout.ts` per Codex's LEDGER note); exact shell-band pixel matching happens at scene-mount, not here.
- No firearms, no gore, no people, no readable text/logos.

## Buildability (post-hoc, first-hand this fire)
- `npx tsc --noEmit` → **clean** (TSC_CLEAN).
- `npm run build` → **green** (see gate commit).
- cb69802 touched **zero src/e2e/config/Balance/schema** — art + LEDGER + request + contact-sheet only (plus swept debris, below). s286 and s287 fires already ran full e2e batteries (gz-h1 4/4 + en-02 10/10 + town-t5 10/10 + task-025 12/12 + m1-01 8/8 + m2-01 12/12; ed-01 8/8 …) on a main that **already contained** cb69802 → the facades cannot have regressed any suite.

## Findings
- **F-tsfac-1 (non-blocking, RECURRING RUNNER DEFECT — 4th+ instance of F-071-1/F-073-1):** the ART-slot runner committed cb69802 with a **repo-root broad `git add`**, sweeping unrelated files onto main alongside the legitimate art: `artifacts/057|058|060|ss-02/*` (test-screenshot churn from other tasks), `logs/_s285-gate.sh` · `logs/_s285-pw.config.ts` · `logs/_s285-serve.sh` (s285 fire's gate SCRATCH, wrongly tracked into `logs/`), `logs/dashboard.html`, `logs/lane-runner.out`. **Impact: none on build** (no src). But it is the same defect chain (058→e5 `91c4c3e`, mp-02 `ff46a53`, 071+073 `277c22b`, now facades `cb69802`). **ROOT FIX = per-slot path-scoped adds in the runner (runner-owner / attended).**
- **F-tsfac-2 (non-blocking, for the TS-02 scene-mount slice):** the plates carry a warm **parchment/cream background**, not a transparent or `#ff00ff` key — so there is **no extract-alpha step** here (correct: full-bleed billboard source). The scene slice that mounts these must **matte/cut the parchment ground** (or the plates get re-shot on transparent) before they read as clean depth billboards. Flag it in the wire task's WHY.
- **F-tsfac-3 (debris, cleanup owed):** `logs/_s285-*.sh|ts` are now tracked in git (via the F-tsfac-1 sweep). Removal is a `git rm` (delete — deny-listed for fires). A permitted/attended session should `git rm logs/_s285-gate.sh logs/_s285-pw.config.ts logs/_s285-serve.sh`.

## Merge classification
No merge performed — already on main via cb69802. This review + LEDGER update + BACKLOG note retro-gate it. No corrective task spawned (F-tsfac-1 root fix is the standing runner-owner item; F-tsfac-2 belongs in the scene-mount slice's WHY; F-tsfac-3 is a one-line cleanup).
