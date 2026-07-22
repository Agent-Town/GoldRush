# Review — AP-02 The Second Rider (human+AI co-op harness)

**Slice:** ap-02-second-rider (lane-second-rider done-move `20260722-103819`)
**Branch/tip:** lane/m4 @`d9a15e73` "feat: summon the Second Rider companion"
**Merge-base:** `700a9a4e` (feat: THE SECOND RIDER — human+AI co-op harness commissioned, owner request)
**Drain:** s895 fire, 2026-07-22
**Verdict:** ✅ SHIPPED — gates green; the 3 firewall-allowed files land additively; 4 adjacent reds proven pre-existing (this drain touches zero src).

## What it does
Adds `scripts/second-rider.mjs` — a standalone Node CLI that boots headless chromium, seeds a throwaway profile, joins a host's claim word through the REAL Ride Together town UI (the mp-02 join grammar), and plays a competent AI companion: follows the host at convoy spacing, fights what comes near, takes upgrades, never idle-dies, and reconnects on drop (MP-R2 law). Launchable 2–3× for the party-of-4 table. This is the owner's own co-op test ask, verbatim: *"Could I then play multiplayer with it as well to test that?"* Ships with a "Summon the Second Rider" section in `docs/OWNER-TEST-PLAN.md` and a two-project e2e (`e2e/second-rider.spec.ts`) that imports the script as a module, joins a locally-spawned relay rig, and asserts the rider appears in the roster, moves within N ticks, and survives a host-visible wave with zero console.

## Evidence (gates on the merged tree — s895)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (`✓ built in 2.10s`, 1908 modules) |
| `e2e/second-rider.spec.ts` (desktop + mobile) | **2 passed** (2.3m) — boots app, joins via town UI, moves, fights, survives, zero console |
| adjacent boot suites (task-025, m1-01, m2-01, desktop + mobile) | 28 passed, 4 failed — see Findings |
| roster proof | reviews/shots-second-rider/roster-desktop.png + roster-mobile.png (both riders in roster) |

Config: `playwright.s895-scratch.config.ts` (self-booting dev on :5289, isolated from sol/attended servers). The second-rider spec self-spawns its own relay env (worker + pages relay) in `beforeAll`.

## Merge classification
Base `700a9a4e`; two-dot `main..lane/m4` shows phantom deletions (STATUS.md / goals.json / specs/agent-play — main advanced past the stale base; MAIN-MOVED-ONLY, not lane edits). Base-relative diff (`700a9a4e..lane/m4`) is the truth: the lane touched EXACTLY 3 files, all firewall-allowed, purely additive:

| File | Kind | Notes |
|------|------|-------|
| `scripts/second-rider.mjs` | NEW (320 lines) | standalone CLI, NOT imported by src (grep-verified) → not in app bundle |
| `e2e/second-rider.spec.ts` | NEW (261 lines) | two-project spec |
| `docs/OWNER-TEST-PLAN.md` | APPEND (+6 lines) | main untouched since base → clean additive apply |

No 3-way needed. Merged via path-scoped `git checkout lane/m4 -- <3 files>` on clean main. Firewall honored: NO src/mp, NO relay, NO Balance.

## Findings
- **F-1 (non-blocking, PRE-EXISTING — provably not this drain):** 4 adjacent reds — `m1-01:70 double-restart geometry growth` (expect 77, got 87; absolute geometry-count baseline drift) and `m2-01:322 stress draw calls` (fails at line 84 `ghostValid` poll timeout, a UI-timing flake), both desktop + mobile. This drain stages ONLY script+spec+doc (git-verified src-free); the script is not bundled → the app under test is BYTE-IDENTICAL to base main → these reds exist on base main independent of this change. Both are load/state-sensitive (geometry baseline + ghost-placement timing) and the machine is under heavy load (census ghost + sol workers). Documented history: reviews/036-f033-2-m2-01-regressions.md, reviews/vp-02-retro-gate.md. Not owed by this slice; flagged for the standing perf-baseline drift thread.
- **F-2 (owner-facing note, non-blocking):** The codex run reported the PRODUCTION relay returns `multiplayer_not_enabled` — the hosted co-op path needs the deployment MP binding activated before the owner can actually summon a rider on `gold-rush-3in.pages.dev`. The harness itself is correct (proven against the local relay rig); this is a deploy-config gap, not a code defect. → OWNER'S DESK.
