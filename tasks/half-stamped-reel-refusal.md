# Task half-stamped-reel-refusal: a half-stamped tape gets its honest era refusal instead of playing on the legacy path (lane-c, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
READ FIRST: AGENTS.md; `tasks/BACKLOG.md` row **F-2471-1** (s2471 drain of tape-resume; control-proven PRE-EXISTING on main: `e2e/agent-reels.spec.ts:301` "plain town board WATCH gives a half-stamped reel its honest unstamped-era refusal" fails on BOTH projects, expects `data-era-refused="true"`, receives `"false"`, the show reads `data-playback="playing"`); `src/game/Game.ts` ~:7091 (the agent-tape guard: a tape with agent-orders actions routes to the true reel) and ~:7033 (the LEGACY human-tape replay path, which never computes the era refusal); `startTrueRunTapeReplay` (~:7044 yesterday; re-locate) and `engineEraIncludes`; `src/ui/LanternShow.ts` (the `data-era-refused` / `data-playback` attributes the spec reads); `reviews/human-tape-true-reel-stamp.md` (yesterday's stamp slice: fully stamped human tapes; the half-stamped shape is the one between).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-2471-1: the honesty law says a reel the current era cannot vouch for is refused, not played; a half-stamped tape falls through to a path that never asks)
The watch path chooses the replay engine by whether the tape carries agent orders, and only the true-reel path computes the era refusal. A tape stamped with an era but no engine hash (or the reverse) that carries no agent orders lands on the legacy path and plays. The spec that guards this has been red on main since before tape-resume, and it names the exact shape.

## Scope
1. **Decide the era refusal before choosing the path.** Any tape carrying ANY era stamp (`meta.era` or `meta.engineHash`) is checked by the same `engineEraIncludes` rule the true reel uses; a half-stamped or foreign-era tape is refused with the honest unstamped-era refusal (`data-era-refused="true"`, the existing refusal copy) regardless of which replay path it would have taken. Fully unstamped legacy tapes keep today's behaviour (the tape show), stated in a comment with the reason.
2. **No weakening:** `e2e/agent-reels.spec.ts:301` turns green on both projects with its assertion unchanged.
3. **Adjacent:** `e2e/agent-reels.spec.ts` (all), `e2e/reel-deep-links.spec.ts`, `e2e/tape-02-lantern-show.spec.ts`, `e2e/c7-standing-order-replay.spec.ts`, `e2e/true-reel-harness.spec.ts` unmodified-green both projects; zero console/page errors; screenshots of the refusal to `reviews/shots-half-stamped-reel-refusal/`.

## Firewall
Touch ONLY: `src/game/Game.ts` (the watch-path routing and the refusal decision only), `src/ui/LanternShow.ts` ONLY if the refusal attribute needs to be set from the new site, BACKLOG row. NO changes to: the replay engines, the tape format, the sim, standings, `src/ui/TrueReelRenderer.ts`, other tasks' fresh work.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; the five suites above green both projects (counts); the previously red test named green; zero console/page errors; the engine hash reported (src moves; the drain pins).
End: READY-FOR-GATES + the routing diff and the suite counts.

## No-op / honesty guard
If the spec is green on current main (premise wrong), STOP and cite the commit that fixed it. If you find yourself about to exit without changes, WRITE WHY into your report first.
