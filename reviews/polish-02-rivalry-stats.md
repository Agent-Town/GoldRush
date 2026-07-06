# Review — polish-02 rivalry-stats (CORRECTIVE drain)

**Slice:** lane-c polish-02 rivalry-stats (run-ledger totals, v1→v2 scoreboard migration, rivalry/base-value stats, weapon split, Best Claims sort)
**Verdict:** ✅ **PASS — merged to main (s98 drain).**
**Source:** `lane/polish` commit `ed564f1` (corrective run 023942), grafted onto clean main.
**Base:** `9805e10` (main-side; only STATUS.md + a stray landmine spec moved on main since).

## What landed
Single clean commit `ed564f1` (+648/−34 over `9805e10`), 15 files:
- `src/game/Economy.ts`, `src/game/Game.ts` (additive — 031 GATE RIDER CLEAR, office/SpriteAnimator branches untouched), `src/game/ProfileStorage.ts`, `src/game/Scoreboard.ts`, `src/systems/BuildSystem.ts`, `src/systems/CombatSystem.ts`, `src/ui/DeathOverlay.ts`, `src/ui/theme.css`, `src/vite-env.d.ts`
- specs: `polish-02-rivalry-stats` (327 lines, definitive), `m1-08`, `m3-06`, `sci-01`, `sci-02`, `sci-04` (test-only edits)

## F-POLISH02-1 (s96 BLOCKER) — RESOLVED
s96 blocked this slice: one real victory applied the claim payout to `meta.tracks` **twice** (+2/track, expected +1), causation proven. The corrective run `ed564f1` fixes it. Verified DEAD:
- `task-027-victory-must-matter` **2/2 both projects** (desktop 3.3s + mobile 3.1s) — the mandatory regression gate.
- `polish-02-rivalry-stats.spec.ts:264` "a single secured victory increments every meta track exactly once" **2/2**.

## s97 landmine — RESOLVED
The s97 lock commit `59de42c` accidentally committed a stray 179-line `e2e/polish-02-rivalry-stats.spec.ts` to main (path-scoped-add slip; that spec's product code was NOT on main, so it was an ungated test on main). This graft overwrites it with ed564f1's definitive 327-line version + the product code it exercises → landmine resolved, spec now green.

## Gate (native, scratch port 5238)
- `npx tsc --noEmit`: clean
- `npm run build`: green (479ms)
- **task-027 2/2** both projects (double-count dead)
- **polish-02 + m1-08 + m3-06 = 30/30** both projects — incl. `polish-02:144` v1→v2 migration **under a SELECTED profile** (profile-scope guard held, no fix-027 regression), `polish-02:204` base-value replay subtracts demolished cost, `polish-02:237` Best Claims sorts wave-then-base-value, `polish-02:264` victory-once
- **sci-01 + sci-02 + sci-04 = 26/26** both projects (graft-touched specs)
- **boot probe 2/2** both projects — zero console/page errors, desktop 1280 + mobile 390
- **Total: 60 e2e green.**

## Post-merge note
`lane/polish` still points at `ed564f1` (content now merged into main as a graft, not a cherry-pick). It is a content-dupe ahead of main — LANE-SAFETY: the next lane-c refill (combat-readability) must carry a drain-gated self-resetting pre-flight (`checkout lane/polish && reset --hard main`, runner-executed) before use. No undrained content is at risk (ed564f1 is fully merged).
