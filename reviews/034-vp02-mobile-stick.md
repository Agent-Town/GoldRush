# Review — 034 vp-02 / vp-02b mobile-input fix (test-only)

## s92 re-run — **Verdict: PASS, merged to main** (supersedes the s83 no-op below)

s91 re-queued 034; this run produced a genuine (small) test-only delta — NOT a redundant re-run.

### Actual delta merged (verified)
The WASD key-hold helpers (`pressMoveKeys`/`releaseMoveKeys`/`MOVE_KEYS`, wired into `startStick`/`moveStick`/`releaseStick`) were already on main for BOTH specs (from s37 run-001 / 038 `9c0ad0d`) — that half was the s83 no-op. The residual was vp-02's "missing sheet cells fall back … without console spam" test, which compared **whole-frame** screenshots via `meanPixelDelta` — noisy under the mobile viewport. 034's real change:

- `e2e/vp-02-sprite-animation.spec.ts`: removed the unused whole-frame `meanPixelDelta` helper (13 lines) and swapped its single call site to the existing viewport-robust `heroCropDifference(before, after)` (crops to the hero region). Net **−13/+1**. Test-only.
- `e2e/vp-02b-rotation-resolver.spec.ts`: **no change** — already green on both projects; Codex correctly left it untouched. Firewall respected (touched ONLY the one spec; no product code).

### Gate evidence (native, s92)
- `npx tsc --noEmit` — clean; `npm run build` — green (438ms; only the pre-existing >900kB chunk advisory).
- `npx playwright test vp-02 + vp-02b` on a scratch port (5233, reuse-existing scratch vite — 5188 could contend with the two LIVE lane runners; s56/034-sanctioned):
  - **desktop-chrome: 16 passed (49.3s)**.
  - **mobile-chrome, `--workers=1` isolated: 16 passed (1.0m)** — the previously-noisy fallback test now solidly green; `[mirror-pixels] heroCropDifference direct=0.0450 flipped=0.0449` logged.
- Boot probe inherently covered: every spec boots the game and asserts `consoleErrors`/`pageErrors` empty across all 16 tests, both viewports.

### Env exception
Scratch-port gate (5233) to avoid 5188 contention with live lane-b/lane-c runners. Scratch config + server removed post-gate.

### Findings
None blocking. F-1 (informational): the master named vp-02b as also needing the fix, but it was already green (helpers landed earlier) — no action.

---

## s83 original review (retained for history) — Verdict was PASS as NO-OP
Back at s83, 034 produced zero code diff — the WASD-key fallback for the touch-stick helpers was already present in both scoped specs (landed via 038 walk4-gait wiring `9c0ad0d`). Verified: both specs carried `MOVE_KEYS`/`pressMoveKeys`/`releaseMoveKeys`; git diff vs HEAD showed only runner churn. tsc clean; desktop 26/26; mobile isolated 16/16 on scratch port 5199. A combined desktop+mobile run showed 6 mobile `openGame` frame-progression timeouts, proven ENVIRONMENTAL (host saturation under a live lane runner + 2-project load) — identical tests passed isolated. No merge commit at s83 (zero code). The residual whole-frame `meanPixelDelta` mobile fragility was what the s92 re-run then hardened.
