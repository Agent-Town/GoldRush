# Review — 033 offline crafting pipeline + bench UX (gated s57, 2026-07-06)

**Verdict: BLOCKED (do not merge yet) — one mobile regression. Corrective queued: tasks/queue/main/035-f033-1.**

## Scope gated
Working-tree 033 output: `src/crafting/AssayBench.ts` (close ✕ + Esc + hint strip + "arrived — collection opens soon"), `src/game/buildables.ts` (assay_office blurb string only), `src/styles.css` (`.assay-bench` reposition top-left→top-right + hidden state + close btn), `e2e/m5-04-offline-queue.spec.ts` (new pipeline + hint/close/overlap tests), `assets/crafting-queue/` (example order consumed pending→approved with regenerated stats; 2 new `local_prospector` orders: 1 approved + 1 deliberately-near-limit rejected). Runbook `scripts/run-crafting-pipeline.md` already committed s54 (unchanged). NOTE: `assets/LEDGER.md` + `docs/HANDOVER-2026-07-06.md` in the working tree are NOT 033 — they are host-side bookkeeping (art-run-004 rows + Robin's 3D "world-first hybrid" ruling); committed separately this fire.

## Evidence
- `npx tsc --noEmit` — clean.
- `npm run build` — green (382ms).
- `e2e/m5-04-offline-queue.spec.ts` — **10/10 PASS** desktop + mobile (scratch vite 5207, lane-c holds 5188). Covers: pending consumed (approved+rejected=2 for local_prospector, reasons non-empty), approved history "arrived — collection opens soon", hint text + ✕ visible + Esc/click close, no overlap with hud-vitals/hud-gold, rejection reasons shown. Boot-probe folded in (every test asserts consoleErrors/pageErrors == []).
- Contract check: both new fixtures satisfy `contract.v1.json` required-field schema (approved: item+contractVerdict+simVerdict+approvedAt; rejected: contractVerdict+reasons+rejectedAt). Item-application NOT wired (correct per task — shown as "arrived — collection opens soon").

## Findings
- **F-033-1 (BLOCKING, mobile-only): bench occludes the Build button.** `e2e/lane-c-activations-assay-office.spec.ts` "build menu shows the five processed building portraits" FAILS on mobile-chrome (5/6 pass; desktop clean). `hud-build` click times out — a bench `<li data-reason-code="stat_cap">` from `data-testid="assay-bench"` intercepts the pointer. Root cause: 033 (a) repositioned the bench top-right and (b) populated the default `local_prospector` profile with fixtures, making the panel tall; on 390px the full-width panel + `max-height: calc(100vh-174px)` reaches the bottom-left Build panel (`left:18px; bottom:18px`). Pre-033 the default-profile bench was empty→short→no overlap, so this is a 033 regression, not pre-existing. Isolated at `--workers=1` — NOT lane-c contention. Fix is bench-UX (Codex Part-B firewall) + needs a mobile screenshot gate → corrective task 035. Screenshot: `reviews/shots-033/mobile-bench-occludes-build.png`.

## Disposition
Do not commit 033 code. Leave 033 in the working tree; Codex fixes 035 (F-033-1) in place, then next fire re-gates the whole 033+035 set (tsc+build + m5-04 + lane-c office spec, both projects) and merges if green.
