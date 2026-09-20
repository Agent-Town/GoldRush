# Task transfer-board-v2-registry-outside-engine-corpus: move the rotation registry out of the engine identity corpus so the transfer board is genuinely additive (lane-b, commit prefix "fix:")

FIRE-AUTHORED s2472 (attended review welcome)

LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: assets/contracts/rotation-seeds.json
EXPECTED-HOLDS: e2e/transfer-board.spec.ts
EXPECTED-HOLDS: functions/api/refusals.ts
EXPECTED-HOLDS: functions/api/standings.ts
EXPECTED-HOLDS: public/skill.md
EXPECTED-HOLDS: reviews/shots-transfer-board/desktop-chrome-transfer-board.png
EXPECTED-HOLDS: reviews/shots-transfer-board/mobile-chrome-transfer-board.png
EXPECTED-HOLDS: scripts/bench-seeds.test.mjs
EXPECTED-HOLDS: scripts/rotation-mint.mjs
EXPECTED-HOLDS: scripts/skillmd-guard.test.mjs
EXPECTED-HOLDS: scripts/test-standings.mjs
EXPECTED-HOLDS: site/assay-office.js
EXPECTED-HOLDS: site/index.html

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.

⚠️ **HOW TO READ THE FILES BELOW: this lane is deliberately NOT reset to main (see the pre-flight), so it sits ~13 commits behind and several of these do not exist in your worktree.** Read them out of main with `git show main:<path>` — e.g. `git show main:reviews/transfer-board.md`. Do NOT merge or rebase main into the lane to make them appear; that is a different act with a different risk, and this task does not authorise it.

READ FIRST: AGENTS.md; `reviews/transfer-board.md` (finding **F-2472-3** — the measurement that produced this task, including the three-row hash table); `specs/transfer-board.md` law **L1 ADDITIVE**; `scripts/assay-replay-agent.mjs:36–44` (`ENGINE_SOURCE_INPUTS` — `assets/contracts` is a WHOLE-DIRECTORY entry and `collectEngineFiles` recurses it collecting every `.json`); `assets/engine-era.json` (era 5, declared `engineHash`); your own predecessor run `tasks/runs/20260903-131051-lane-b-transfer-board.md.log` (it STOPPED honestly at this exact coupling — read its last 20 lines).

## ⛔ PRE-FLIGHT — THIS LANE'S CONTENT IS YOUR BASE. DO NOT RESET IT.

`lane/b` is `ahead=1` at `19c2e9f12` and HOLDS all 13 paths declared above. **That commit is the thing you are extending.** Do NOT `git checkout -B lane/b main`, do NOT `git reset --hard`, do NOT `git clean -fd` anything tracked — doing so destroys a complete, unmerged implementation (Mistake #2, the Reset Massacre).

STOP-and-report if: the lane tip is NOT `19c2e9f12` and its content is not obviously a descendant of it; or the lane holds a tracked path NOT in the EXPECTED-HOLDS list above (that is an unexpected state and this opt-in does not cover it). Untracked `logs/**`, `artifacts/**`, `reviews/shots-*` and any `.png` churn are never a STOP (F-1266-1/F-1407-1) — list and proceed.

Then: `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (measured s2472, control-proven — `reviews/transfer-board.md`)

Placing the rotation registry at `assets/contracts/rotation-seeds.json` puts a new `.json` inside the engine identity corpus, which rotates `computeEngineHash()` from `2a06eb51…` (= era 5's declared hash, the door's current lineage) to `43f54a20…`. **Every existing verified reel would then be refused `reel_not_current` at the county door** — the whole public board goes dark until a new era lands.

That directly violates the ratified spec's own first law, **L1 ADDITIVE**: *"Public boards, existing tapes, seeds, **eras** and ranking are untouched."* The path was an incidental choice in a scope list; L1 is a law, and the law wins.

**The cure is measured, not argued: the same file at `assets/rotations/rotation-seeds.json` leaves the engine hash byte-identical to base.** No change to `ENGINE_SOURCE_INPUTS`, no era bump, no re-pin, no owner ruling about what "the engine" is. A rotation calendar is door/scheduling data; `assets/contracts` is in the corpus because contract *manifests* define what the sim does, and this file does not.

## Scope

1. **Relocate** `assets/contracts/rotation-seeds.json` → `assets/rotations/rotation-seeds.json` (`git mv`; content unchanged).
2. **Repoint exactly these five readers, and no others** — measured s2472 by attributing every added line mentioning the file to its own diff hunk, so this list is complete:
   - `e2e/transfer-board.spec.ts` — `import rotationRegistry from '../assets/contracts/…'`
   - `functions/api/standings.ts` — `import rotationSeeds from '../../assets/contracts/…'`
   - `scripts/bench-seeds.test.mjs` — `import rotations from '../assets/contracts/…'`
   - `scripts/skillmd-guard.test.mjs` — `JSON.parse(read('assets/contracts/rotation-seeds.json'))`
   - `scripts/test-standings.mjs` — `import rotationSeeds from '../assets/contracts/…'`

   Fix the relative depth per file; do not change any logic. ⓘ `functions/api/refusals.ts` only adds the `'rotation_closed'` string and does **not** reference the path — leave it alone.
3. **`scripts/rotation-mint.mjs` needs NO change** and is deliberately excluded: it writes the registry to **stdout** and never names an output path (verified s2472). If you find yourself editing it, stop and re-read this line.
4. **The proof, and it is the point of this task** — add it as a test in `scripts/bench-seeds.test.mjs` (or a sibling already in `test:node-guards`): assert that **no file under any `ENGINE_SOURCE_INPUTS` directory entry is a rotation registry**, and assert `computeEngineHash()` on the working tree **equals `assets/engine-era.json`'s declared `engineHash`**. Import `ENGINE_SOURCE_INPUTS` and `computeEngineHash` from `scripts/assay-replay-agent.mjs`; do NOT transcribe the list. **Mutation proof required:** copy the registry into `assets/contracts/` in a temp tree, show the guard REDS, remove it, show it GREENS — quote both.
5. **BACKLOG row** recording the relocation and the restored hash.

## Firewall

Touch ONLY: `assets/rotations/rotation-seeds.json` (moved), and **import-path-only** edits to the five readers named in scope 2 (`e2e/transfer-board.spec.ts`, `functions/api/standings.ts`, `scripts/bench-seeds.test.mjs`, `scripts/skillmd-guard.test.mjs`, `scripts/test-standings.mjs`), plus the new corpus guard, `public/skill.md` (only if it names the path), BACKLOG row.

**NO changes to:** `scripts/rotation-mint.mjs` (writes to stdout, needs nothing); `functions/api/refusals.ts` (does not name the path); `scripts/assay-replay-agent.mjs` — narrowing `ENGINE_SOURCE_INPUTS` is the expensive cure this task exists to avoid and is an owner question; `assets/engine-era.json` — no re-pin is needed and writing one would misclassify this as an engine change; `compareScores` or any ranking order; the sim; `bench-seeds.json`; `specs/transfer-board.md` (attended will amend the path).

⚠️ `public/skill.md` now carries **generated fences** (`<!-- contracts:begin -->` / `<!-- contracts:end -->`, merged `9b9397c8e`). Anything inside them comes from `node scripts/render-skillmd-contracts.mjs` only; put the ROTATION section OUTSIDE them or `skillmd-contracts-guard` reds.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` clean; `npm run build` green; **quote `computeEngineHash()` and show it equals `assets/engine-era.json`'s `engineHash`**; the new guard's mutation proof RED then GREEN, both quoted; `npm run test:stats` green with counts; the transfer-board e2e green both projects at `--workers=1`, zero console/page errors, screenshots refreshed under `reviews/shots-transfer-board/`; `node --test scripts/skillmd-guard.test.mjs scripts/skillmd-contracts-guard.test.mjs` green with counts.

End: READY-FOR-GATES + the two hashes, the mutation proof, the test counts, the screenshot paths.

## No-op / honesty guard

If relocating the file does NOT restore the hash to `assets/engine-era.json`'s declared value, STOP and report — something else in your diff is inside the corpus and the premise of this task is wrong. Do not "fix" that by editing the era registry or the corpus list.
