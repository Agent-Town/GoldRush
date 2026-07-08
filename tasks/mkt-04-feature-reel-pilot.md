# Task mkt-04: the feature-reel pilot — "what the factory shipped today," in three clips (LANE-D, branch lane/perf, commit prefix "mkt:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d. READ FIRST: AGENTS.md; **specs/marketing/README.md §Stage 2.5 (the FEATURE REEL — this is its pilot)**; the footage rig (scripts/capture-footage.mjs + marketing/shots.json — EXTEND the shot list, reuse the machinery; capture-profile privacy law binding); the game's audio (clips carry the real game sound — the governor's mix). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/perf main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green.

## Why (owner idea: every finished feature → a short video → the channel fills itself)
Pilot with today's three crown features. If these three clips read well, the fires author one per notable merge forever (the spec's Stage-2.5 loop).

## Scope
1. **Three showcase scenarios added to shots.json** (16:9 + 9:16 each, 20–40s raw):
   a. **THE TOWNSFOLK** — enter town (seeded named town), walk the square: the Elder at the schoolhouse, tavernkeeper at the board, a bark on approach, the Prospector greeting by town name.
   b. **THE BARON'S ENTRANCE** — seeded science-complete profile on e1-baron at wave-19→20: taunt banner, the arrival card, the ×4 man cresting with boss bar (film past the first rampage swing on a sacrificial palisade).
   c. **THE TERRACES** — the Hill Mine flyover-by-walk (mesh-required tile): switchbacks, a high turret firing long, the flooded gallery.
2. **Caption cards**: 2s ledger-styled title card per clip rendered IN-PAGE by the rig (an overlay div the rig injects — "The town gets townsfolk · built today" voice; NO post-editing tools) + end-card (the agenttown wordmark slot, key-art og frame).
3. **Output**: `marketing/reel/<feature>-<aspect>-<date>.webm` + a REEL-INDEX.md row each (feature, merge hash it showcases, duration, quality notes) → these land for the OWNER'S APPROVAL per the outbox law (nothing posts itself).
4. Honest-quality bar: if a feature shows a bug on camera, note it in the index (owner decides: post-with-charm or hold) — never stage around one silently.

## Firewall
Touch ONLY: shots.json scenarios, the rig's caption-overlay capability (rig-side, not game UI), marketing/reel outputs + index, e2e rig-exclusion intact, artifacts. NO game src/ changes, NO posting/uploading anywhere, NO standard-suite impact (m1-01 canary green).

## Self-check
tsc/build; the rig runs all three scenarios both aspects (files exist, durations in range); caption cards visible in first frames; m1-01 + m2-01 canary green both projects (rig stays excluded); REEL-INDEX complete with merge hashes. Commit on lane/perf (webm ≤40MB total — trim/re-encode if over, note it). End: READY-FOR-GATES + per-clip quality notes + the index.
