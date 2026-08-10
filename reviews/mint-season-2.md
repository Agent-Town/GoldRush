# Review — mint-season-2 (Season 2, "The Same Game")

**Slice:** `lane-b-mint-season-2` · **Branch:** `lane/b` · **Tip at gate:** `9bcbb0e` (lane), base `605dcd08a`
**Merged:** `37b094f0f3f9ccc772cc0e118305da1043b456bb` (main, s1642 fire)
**Gated by:** s1642, fire shell, all playwright `--workers=1`, detached worktree `gate-s1642` (§3.0b), merged+committed as ONE act (F-1589-5).

## VERDICT: MERGED

## What it does

The county turns its season. `src/seasons/registry.ts` closes **The Founding Season** and opens **Season 2 — The Same Game**, and the whole change is ten lines of data plus the guard that makes the boundary honest.

The load-bearing detail is *where the boundary is*. Season 2 starts at `1786376727000`, and that is not a chosen round number — it is the **exact commit time of `b8cf2332d`**, the AP-16-2b keystone that completed AP-16-1..3. `specs/seasons/seasons-v1.md` names that completion as the condition for opening Season 2, and `specs/agent-play/ap-16-same-game-law.md` records the stamp. The registry therefore says the same thing the git history says, to the second. I verified this rather than accepting it (see Evidence).

The boundary is **half-open and closed against itself**: `founding.endsAt === sameGame.startsAt`, so no timestamp can fall in a gap between seasons and none can belong to both. The replaced test asserts exactly that, at the boundary and one millisecond below it, which is the only place the rule can break.

Season 1's `endsAt` moves from `null` to a real instant and Season 2 inherits the open end — so "still riding" transfers to the live season instead of being duplicated, and SEA-2's page copy (*"Since August 6, 2026 — still riding"*) stays true of exactly one season.

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (2.32 s; asset-diet ceilings respected) |
| `scripts/season-registry.test.mjs` | **4 / 4 pass**, 0 fail |
| `e2e/sea-2-season-page.spec.ts` | **6 / 6** — desktop-chrome + mobile-chrome (390px) |
| `e2e/lb-01-county-standings.spec.ts` | **18 / 18** — desktop + 390px |
| adjacent `e2e/field-book.spec.ts` + `e2e/en-01-claim-ledger.spec.ts` | **10 / 10** unmodified-green, both projects |
| plain boot `e2e/_s106-prospector-boot-probe.spec.ts` | **2 / 2**, zero console/page errors, desktop + 390px |
| `test:node-guards` (full) | **not run, deliberately** — F-1460-1 keys that duty on `src/sim/`, `src/systems/`, `src/entities/`; this diff touches none of them (`src/seasons/registry.ts` only). The one node guard that reads the changed file was run directly and is in the table above. |

**Boundary verified, not assumed.** `git log -1 --format=%ct b8cf2332d` → `1786376727`; `× 1000` → `1786376727000`, byte-equal to `SEASONS[1].startsAt` and to `SEASONS[0].endsAt`. ISO: `2026-08-10T15:45:27.000Z`.

**Guard teeth re-proven by manufacturing the defect** (a passing guard never executes its violation path). Moving `founding.endsAt` one millisecond off the boundary (`1786376727000` → `1786376726000`) reds the guard with `AssertionError: Expected values to be strictly equal: + 1786376726000 - 1786376727000`. Probe reverted and confirmed byte-identical, `sha256(src/seasons/registry.ts) = 958579bca724` before and after.

## Merge classification

Base `605dcd08a`. **8 paths, ALL LANE-ONLY.** Main moved 38 paths since the base and the intersection with the lane's set is **empty** — no graft, no 3-way, nothing hand-resolved. `ort` merged clean in the detached gate worktree and again on main. Post-merge `main..lane/b` is empty.

| path | class |
|---|---|
| `src/seasons/registry.ts` | LANE-ONLY |
| `scripts/season-registry.test.mjs` | LANE-ONLY |
| `e2e/sea-2-season-page.spec.ts` | LANE-ONLY |
| `e2e/lb-01-county-standings.spec.ts` | LANE-ONLY |
| `reviews/shots-mint-season-2/*.png` (4) | LANE-ONLY (evidence) |

## Findings

**F-1642-2 — non-blocking, cosmetic, filed so it is not mistaken for a defect later.** The two seasons cite their era stamps at **different hash widths**: `founding` carries `eraStamps: ['3dd7790d']` (8 chars) and `same-game` carries `['b8cf2332d']` (9 chars). Both resolve, nothing reads them programmatically today, and `git log --format=%h` in this repo now abbreviates to 9 — so this is drift in a convention, not an error. It is worth knowing because **F-1633-1 measured exactly this class biting elsewhere**: an 8-vs-9-char mismatch made a whole-corpus grep return false absents in the GZ-01 sweep. If anything ever *matches* on `eraStamps`, normalise the width first. **GATE: none owed. Closes when a consumer exists or the widths are normalised.**

No blocking findings. Nothing was adapted outside the slice's own firewall; the two e2e specs it edited are the ones that assert the season label, and their edits are the expected consequence of the boundary moving (`'The Founding Season'` → `'Season 2 — The Same Game'` on rows submitted after the stamp).

## Note on what this slice deliberately did NOT do

It mints the season and nothing else. Season 2's *commentary* and *what we learned* remain the honest "not yet written" states SEA-2 built — that text is **SEA-3's**, and SEA-3 is still gated on **F-1639-3** (an attended ruling on where the prose lives). Minting the season does not unblock it and does not pretend to.
