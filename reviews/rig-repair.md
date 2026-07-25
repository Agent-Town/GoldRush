# Drain review — lane-rig-repair (AP-01 v2, THE HONEST-PLAY GATE)

**Slice:** `lane-rig-repair.md` (saga-rehearsal rig repair R1–R4 + honest full-traversal re-run)
**Branch / tip:** `lane/m4` @ `1244914b` (`runner(lane-b): lane-rig-repair.md`, 2026-07-25 02:40 +07)
**Base:** `fa9ed6b0` (merge-base with main) · **merged onto main** at `ae04f0a0` (s1025 lock)
**Drained by:** s1025 fire, 2026-07-25 ~03:0xZ

## VERDICT: MERGE — gates green, firewall clean, evidence real.

## What it does

The saga-rehearsal rig is the evidence tooling that drives a real browser through the whole
ten-epoch saga on ONE profile and films it. The 2026-07-22 rehearsal was **voided** by four rig
defects (not game defects): a visibility check that was always true, boss detection on a field that
does not exist, a Stamp Mill funded 1/3 so the profile never left epoch 1, and an E10 leg that
skipped its reference spec's setup. This slice repairs all four (plus four more the runner found:
R5 spaces-in-path, R6 stop-at-first-failure, R7 story-card drain during the T2 crank, R8 profile-scoped
epoch key), then **re-runs the full traversal on a fresh profile** and lands the ledger.

The delivered evidence: `reviews/saga-rehearsal-2026-07-25.md` (gates table, per-era ledger,
F-REH debt disposition, 22-file video ledger, THE TEN MOMENTS), a contact sheet, and 96 refreshed or
new `reviews/shots-rehearsal/*.png`. Per the rig's own law the `.webm` footage stays local
(`rehearsal-video/`); screenshots + ledger commit.

**This merge changes NO player-facing behaviour** — it is evidence tooling only. See Firewall.

## Merge classification

| | |
|---|---|
| Base | `fa9ed6b0` |
| Files changed | 118 (`rehearsal/**` 21 · `reviews/**` 96 · `tasks/DRAFT-*` 1) |
| MAIN-MOVED-ONLY | **none** — `git log fa9ed6b0..main -- rehearsal reviews/shots-rehearsal reviews/saga-rehearsal-2026-07-25.md tasks/DRAFT-deepwater-hud-corsair-counter.md` = **empty** |
| LANE-TOUCHED | all 118 |
| Conflicts | **none.** `git merge --squash lane/m4` → "Automatic merge went well" |
| 3-way grafts needed | none |
| Merge style | squash (house pattern) — `lane/m4` will therefore read **1-ahead but FALSE-AHEAD** afterwards; verify by file-probe, never by ahead-count |

## Firewall audit — PASS

TOUCH-ONLY was `rehearsal/**`, `reviews/**`, `rehearsal-video/**` (local), `tasks/DRAFT-*`; NO src/,
NO assets/, NO e2e/.

`git diff --name-only fa9ed6b0 lane/m4 -- src e2e package.json package-lock.json vite.config.ts tsconfig.json`
→ **empty**. ✓ VERIFIED. The buildable surface of the merged tree is byte-identical to pre-merge main,
which is why the gate battery below is conclusive rather than merely reassuring.

## Gate battery (run on the MERGED tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (no output) |
| `npm run build` | **green**, `✓ built in 1.18s`; asset-diet fingerprint active (235 GLBs 84% cut, 53 plates 87% cut) |
| Rig syntax — all 22 `.mjs` | **22/22 parse**, 0 failures (`node --check` each) |
| Rig module load | `rehearsal/lib.mjs` imports clean; 20 exports resolve (playwright graph OK) |
| Rig orchestrator | `node rehearsal/run-all.mjs 99` runs and prints SEQUENCE SUMMARY (zero side effects) |
| Boot probe `_s106-prospector-boot-probe` | **2/2 PASS** desktop-chrome + mobile-chrome (390px), 4.1s, zero console/page errors |
| Adjacent suites | not re-run **by design** — the merge touches no `src/`, `e2e/` or config; nothing they cover can have moved. Pre-merge main was gated 12/12 zero-console at `0dfa1d3f` (s1024). |

### Repair claims verified against the merged tree (not taken on the report's word)

| Claim | Verification |
|---|---|
| R1 — no `getClientRects` visibility checks remain | `grep -rn getClientRects rehearsal/` → **empty** ✓ |
| R2 — bosses detected by `variantId`/`bossComponentId`, not `eliteKind` | `grep -rn eliteKind rehearsal/` → **empty**; `lib.mjs:69-77` `pilotBoss(page, variantId, componentIds)` filters `enemy.variantId === variant` with an E1 `hasBanner` fallback and targets `bossComponentId` ✓ |
| R5 — spaces-in-path fix | `lib.mjs:5,8` `fileURLToPath(import.meta.url)` for ROOT ✓ (this repo path contains a space — a real bug, not a hypothetical) |
| R6 — traversal stops at first failure | `run-all.mjs` diff: `if (code !== 0) { … process.exitCode = code; break }` + resume-from-index ✓ |

## Findings

**F-1025-1 (non-blocking, note-for-owner) — the rehearsal evidence predates the asset diet.**
The report states its runtime was "detached current `main` at `76635963`". Current main is 12 commits
further on and those commits include **THE ASSET DIET** (`0dfa1d3f`), which re-encodes 235 terrain GLBs
and 53 plate PNGs. So the filmed footage shows the pre-diet asset set. This does **not** weaken the
rig (the code merged here is runtime-agnostic) and the diet shipped with its own visual-parity gate on
2 maps + town, but the honest statement is: *the saga was proven on `76635963`, not on today's tip*.
No corrective task — a re-run is hours of wall-clock and buys little; the next natural re-run picks it up.

**F-1025-2 (non-blocking, deliberate) — I did not re-run a live rehearsal segment as a smoke test.**
The obvious deeper gate would be to drive one short segment (e.g. `e1-01-founding`) against a preview
server. I declined: segments write to `reviews/shots-rehearsal/*.png`, which are **the tracked evidence
this very slice delivers**, and per F-1024-4 a headless fire has no `git restore`/`checkout`/`clean`
permission — a smoke run would have overwritten the lane's own evidence with re-renders I could not
revert. Bounded substitutes used instead (syntax ×22, module load, orchestrator run). An attended
session with revert powers can run the real segment cheaply.

**F-1025-3 (informational) — a new draft rode in with the slice.**
`tasks/DRAFT-deepwater-hud-corsair-counter.md` (P2): at 2,405 sim-seconds Deepwater reports
`corsairWaves=100, xp=500, kills=129` while the generic HUD still reads `wave 0` — the counter is
misleading, not the progression. This RESOLVES the old F-REH-05 no-XP suspicion. Draft only; unqueued.

**Debt closed by this merge (from the lane's report, now on main as evidence):**
F-REH-01 (T6 exists live, on film) · F-REH-02 (E7 flagship boots) · F-REH-03 (E10 finale chain) ·
F-REH-04 (E1–E7 spine proven on one profile) · F-REH-05 (resolved → F-1025-3 draft).

## Gazette / ticker

**No gazette item owed.** The GZ-01 filter law requires the review to name a *player-visible* change;
this merge is evidence tooling with zero player-facing surface. The 07-24 ticker digest was compiled by
s1024 (`marketing/outbox/ticker-digest-2026-07-24.md`); no digest is due for today's merges until
tomorrow's first post-06:00 fire.
