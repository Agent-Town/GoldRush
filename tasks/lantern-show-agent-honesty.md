# Task lantern-show-agent-honesty: the replay viewer stops lying about agent reels (lane-d, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; **the OWNER REPORT in the Why (his screenshot + URL is the exact fixture)**; the PROVEN two-engines law in scripts/assay-replay.mjs:29-41 (F-ASSAY-E2E-3: agent tapes CANNOT faithfully replay in the browser — the worlds differ from tick 0; the ASSAYER learned this and routes agent tapes to the sim engine; the VIEWER never did); src/ui/LanternShow.ts (:139-224 — state, `complete`, the status line) + src/game/Game.ts:6978-7050 (the show's driver: completion DOES pause via `state.setPaused(true)` — find why it never fires or fires without an honest ending for this fixture) + the agent-tape discriminator the replay seam already uses (the `isAgentTape` shape, Game.ts ~:6892 per the assay routing comment); the fixture tape: `artifacts/gauntlet-heat-20260824/e1-dry-gulch/tape.json` (verified w20 secured on the county's engine; the owner watched its browser show run past its ending into an immortal-hero swarm).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe template (ahead content on main = SAFE DUPE → `git checkout -B lane/d main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign edits). FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, `.png` — expected, list, proceed. `npm install --no-audit --no-fund`; build green.

## Why (owner playtest 2026-08-25, verbatim: "this reel ended but the player should die: [the dry-gulch watch URL] instead it looks like this continues? weird, somehow very weird" + "and I can't play the 20 waves that it is supposed to have?")
The landing's watch links open the Lantern Show, which plays AGENT reels through the BROWSER engine — the engine the county already proved cannot reproduce them. The show renders a divergent hallucination: the verified w20 secure never happens on screen, the recorded orders misfire against a mismatched world, and past the reel's content the presentation degenerates into an endless swarm around an apparently undying idle hero. The tape's verdict is TRUE (verified on the county's engine); the show is FALSE THEATER — the worst possible thing under a "Verified" chip.

## Scope
1. **Diagnose the end-state with the fixture** (the owner's exact URL): why `complete` never delivers an honest ending here — trace whether the tick reaches `durationTicks`, whether death is suppressed in replay mode, what the hero's damage path does during playback. Name it in the report.
2. **The honesty banner for agent reels**: the show detects agent tapes (reuse the seam's own discriminator — never a second one) and says plainly, in the county voice, at start: this is a browser APPROXIMATION of a machine ride; the VERIFIED outcome is `<secured, wave N, hash>` replayed exactly on the county's engine. The recorded outcome card renders from the tape's own `outcome` — the viewer sees the TRUTH regardless of what the approximation does.
3. **The hard ending, all reels**: at `durationTicks` the show ALWAYS stops — paused world, the outcome card, no free-running sim beyond the reel, ever. If the approximation's world diverges terminally EARLIER (hero death, secure), end the show THERE with the card + one honest line ("the approximation diverged from the verified ride at wave N — exact replay runs on the county's engine").
4. **No immortal theater**: whatever suppresses death during playback either ends the show per item 3 or is removed for the playback path — an undying swarmed hero must be unreachable.
5. HUMAN (browser-recorded) reels keep today's behavior plus the item-3 hard ending — they replay faithfully by construction and need no banner.
6. Tests: extend the lantern e2e — the fixture tape reaches `data-playback=complete` with the outcome card asserting the RECORDED outcome (w20, secured) + the banner present for agent reels + absent for a browser reel; no sim advance after complete (pin a diagnostics counter across 2 wall-seconds).

## Firewall
Touch ONLY: src/ui/LanternShow.ts, src/game/Game.ts (the show driver + playback death/end paths ONLY), the lantern e2e(s), BACKLOG row. NO sim mechanics (the LIVE game's death path untouched — prove via task-025 unmodified-green), no tape formats, no assay/worker code, no ranking.

## Self-check (evidence, not vibes)
tsc + build green; the extended lantern e2e green both projects (the fixture URL pattern exercised); tape-02-lantern-show + run-suspend + task-025 + m1-01 unmodified-green; floors `--check` clean; zero console/page errors; screenshots of the banner + the end card, desktop + 390px, to `reviews/shots-lantern-honesty/`. End: READY-FOR-GATES + report: the diagnosed end-state mechanism, the banner/card copy verbatim, the divergence-ending behavior.

## No-op / honesty guard
Do not attempt to make the browser faithfully replay agent tapes — that is the proven-impossible path (F-ASSAY-E2E-3) and a future sim-render project, not this slice. Honesty about the approximation IS the fix.
