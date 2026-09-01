# Task true-reel-sprites: the true show wears the game's own clothes — real entity visuals from replay state (lane-c, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.

READ FIRST: AGENTS.md; `specs/embodied-hand.md` (EH-3's truth contract: kinds + positions + life-state + timeline faithful; placeholders were r1's honest compromise); `src/ui/LanternShow.ts` (the true driver + the placeholder legend at ~`:353`: "Claim Keeper dot · Prospector diamond · enemy ring · work block"); `src/replay/**` (the per-tick render snapshots the worker ships to the main thread — what fields exist); the game's own entity visuals in `src/entities/` (`Hero.ts`, `Enemy.ts`, `Sluice.ts`, `SentryBeacon.ts`, `Palisade.ts`, `Projectile.ts`, `GoldNode.ts`…) and whatever the live game uses to draw the Prospector/Keeper; the owner's ask (2026-09-01 release pass): "make it perfect".

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe (ahead content on main = SAFE DUPE → `git checkout -B lane/c main && git clean -fd`, PROCEED; STOP on unmerged ahead content or foreign edits). **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1)** and **FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*`, any `.png` — always expected, never a STOP; list and proceed.** Still-STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. Then `npm ci`; `npm run build` green.

## Why (the most-watched surface at launch is the least dressed)
"Watch the Baron fall" currently shows diamonds and rings on a brown grid. The truth contract is met; the experience is not. The sim state already names every entity kind and position per tick — the game's own meshes/sprites can wear them.

## Scope
1. **Real visuals, same truth**: render the replay snapshots with the game's entity visual vocabulary — the Prospector and Keeper bodies, enemy sprites by kind, works by buildable kind (with wrecked state), gold nodes/pickups where the state carries them, the map's terrain/props as the live game draws them for that contract. Positions, kinds, life-state and timeline stay bound to the sim snapshot — no interpolated guesses that could depict a state the sim did not produce (interpolation between two REAL snapshots for smoothness is fine; say what you did).
2. **Honesty stays visible**: the banner and hash-match line remain; the legend retires only for entity classes that now render truthfully — any class still placeholdered stays listed (never silently).
3. **Budget**: frame p95 during true playback within 15% of the live game's own baseline on the same map; the replay worker's snapshot cadence may need enriching (send what the visuals need, no more) — measure and report.
4. **Tests**: the EH-3 probe assertions (positions/kinds at probe ticks) still pass against the new renderer; a visual e2e screenshots desktop + 390px mid-ride for the crown reel fixture; zero console errors; human reels untouched.

## Firewall
Touch ONLY: `src/ui/LanternShow.ts`, `src/replay/**` (snapshot enrichment), a NEW renderer module under `src/ui/` or `src/replay/` that ADAPTS existing entity visuals (import, never fork them), the e2e, BACKLOG row. NO sim mechanics, NO changes to the entity classes' live-game behaviour, NO door/era logic.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; the reel e2e green both projects; `tape-02-lantern-show` + `agent-reels` unmodified-green; the perf line; screenshots to `reviews/shots-true-reel-sprites/`. Report: the entity→visual mapping table, the remaining placeholder list (should be empty or short), the perf numbers.
End: READY-FOR-GATES + the above.

## No-op / honesty guard
If a visual would require state the snapshot cannot truthfully supply, placeholder it and list it — never fabricate. If you exit without changes, WRITE WHY first.
