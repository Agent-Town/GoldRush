# Task 037: Assay Bench must work in normal play (un-gate + discoverability) (MAIN slot, commit prefix "fix:")

RE-QUEUED (s61 attended, 2026-07-06 ~16:30): the 20260706-1537 run was a NO-OP anomaly — rc=0 in 69 seconds, zero diff, bench still ?debug-gated (s70 handoff flagged it; s70 ruling: re-queue). If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. The work below is real and still undone: AssayBench.ts:189 still early-returns without ?debug.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; src/crafting/AssayBench.ts; src/game/Game.ts confirmAction(); reviews/w1-01-terrain-relief.md §Findings. SEQUENCING LAW: 036 (F-033-2) is MERGED — verified precondition satisfied. Pre-flight: `git status --short` must show zero staged/modified TRACKED files (`??` untracked host debris expected — list briefly, proceed).

## Why (owner-hit bug, live play 2026-07-06)
Robin built the Assay Office, walked onto it, pressed keys — nothing. Root cause: `src/crafting/AssayBench.ts:189` returns undefined unless the URL has `?debug`, a leftover from the m5-04 era when the bench was a debug-only bridge. `Game.ts` confirmAction() correctly routes Enter/Space in office range to `openAssayBench?.()` — which is undefined in a normal boot, so it SILENTLY does nothing. Merged M5 is invisible to the owner. Also: nothing in-game tells the player Enter/Space interacts.

## Scope
1. **Un-gate the install**: AssayBench installs in every boot. Anything genuinely debug-only inside the bench (test hooks, verbose console receipts) stays behind the existing debug check INSIDE the class — the user-facing bench (post order → contract verdict → approved/rejected + history) is normal play now.
2. **Discoverability**: when the hero enters assay-office range (and not in build mode), show a small in-world/HUD prompt — Frontier Ledger tone, e.g. a parchment chip near the office or above the HUD hotbar: "Enter — Assay Office". Hide it when out of range, in build mode, or while the bench is open. Reuse the existing hint/blurb visual language (see 011 build-menu blurbs); no new art slots.
3. **Mobile**: the confirm intent maps to TouchConfirm (`#confirm-button`) — the prompt must reference the touch control on ≤430px (text without hotkey, or the button glyph), and opening/closing the bench must work by touch (bench close button already exists).
4. **Expectation text unchanged**: item application is still not wired — do NOT promise effects; leave that copy as is.

## Firewall
Touch ONLY: src/crafting/AssayBench.ts (install gate + internal debug checks), the prompt UI (src/ui/ + styles), Game.ts ONLY the minimal wiring for the range-prompt visibility (no sim logic), e2e (new/extended spec). NO changes to: contract validation, queue middleware, Economy/Combat/Wave systems, 036's fixes, m2-01 spec.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. NEW e2e coverage: (a) boot WITHOUT `?debug` → walk into office range → prompt visible → Enter opens bench → post an order → verdict renders; (b) prompt hidden out-of-range/in-build-mode/while-open; (c) mobile 390px: touch-confirm opens bench, close works, prompt does not overlap HUD (check intersects). Full m2-01 12/12 + m5-04 + lane-c-activations 6/6, both projects; task-025 + m1-01 unmodified green; zero console/page errors. End: READY-FOR-GATES + files touched + per-finding root cause + results.
