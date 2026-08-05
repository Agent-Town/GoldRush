CODEX: model=gpt-5.6-sol effort=high

# lane-f1465-1-nul-delimiters — give grep its sight back on Game.ts (cures F-1465-1)

**FIRE-AUTHORED s1465 (attended review welcome).**

ROLE: implementer on lane-a. WORKDIR: worktrees/lane-a (branch lane/a). Commit prefix `nulfix:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): `git branch --show-current` = `lane/a`. The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/a origin/main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

> **FACTORY-CHURN / EVIDENCE-ARTIFACT EXCEPTION (F-1407-1 + F-1266-1) — these tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them and proceed:** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence, whether as uncommitted dirt or as the whole content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever: discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. ⚠️ Without this, the fire that AUTHORS a master creates the dirt that blocks it, in the same fire, and cannot see it — f1406-1 died exactly that way for 54,875 tokens and zero edits. ⓘ What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — anything a live drain or concurrent task could actually own.

PRE-FLIGHT (CURRENCY + SAFE-DUPE, ONE COMMAND — deliberately not a grep, because grep is the very thing that is broken here, and deliberately not a shell-quoted `node -e`, because F-1425-2 showed quoting can fake a stale lane):

    node scripts/nul-audit.mjs

- **Command not found / module missing** → your lane predates the s1465 evidence commit. STOP and report "stale lane, needs refresh". Do not proceed.
- **Exit 0 (`CLEAN`)** → the fix has already landed. STOP and report SAFE-DUPE. Do not re-do it.
- **Exit 1 listing `src/game/Game.ts`** → this is your task. Proceed.

## WHY

Measured s1465, by a fire that nearly filed a false finding off it. `src/game/Game.ts` (8,640 lines — the game's largest file) contains **3 raw 0x00 bytes**, and `logs/session-scratch/s1224-citation-drift-audit.mjs` contains **1**. A single raw NUL makes `grep` classify a file as **binary** and print **nothing at all**, exit 1 — silently, for every pattern.

The measurement, so you can reproduce it rather than take my word:

- `grep -c import src/game/Game.ts` → **no output, exit 1**. The file contains `import` **134 times**.
- `grep -ac import src/game/Game.ts` → **134**. The `-a` flag is the whole difference.
- It is **not** a locale effect: `LC_ALL=en_US.UTF-8 grep -c PowerGraph src/game/Game.ts` is just as blind. NUL-to-binary is locale-independent, so **the lane shell and the fire shell are equally affected** — this is not a fires-only problem.

Why it is worth a slice: every session that concludes *"X is absent from src/"* from a grep has a **false negative on the single most important file in the codebase**. s1465 hit exactly this — it measured `PowerGraphSystem`, `MothSwarm`, `WrangleSystem` and `PressureSystem` as instantiated nowhere in `src/`, and was one commit from filing a finding declaring four era systems dead. All four are constructed in `Game.ts`: `WrangleSystem` **:646**, `MothSwarm` **:667**, `PressureSystem` **:1310**, `PowerGraphSystem` **:3757**. The code was fine; the instrument was blind. This also sits directly under the ER-01 socket ladder, whose masters tell a runner to *"find the browser's update order and mirror it"* — an instruction that reads a blind grep today.

The cure is an **encoding** change, not a semantic one, and it is proven byte-identical (s1465):

    raw  `${kind}<0x00>${label}<0x00>${materialName}`  ->  hex 6100620063
    esc  `${kind}\u0000${label}\u0000${materialName}`  ->  hex 6100620063   IDENTICAL: true

JS parses the six-character escape and the raw byte to the **same one-character string**, so the composite map keys keep byte-identical values and every consumer behaves the same. Only the bytes **on disk** change, which is precisely what grep reads.

## READ-FIRST

1. `scripts/nul-audit.mjs` — the instrument and your acceptance test. Its header states the finding. **Do not edit it.**
2. `src/game/Game.ts:5709` and `:5748` — the two sites. Both are composite `Map` keys built from a template literal; the NUL is an intentional "cannot collide with real content" delimiter. That intent is CORRECT and must be preserved.
3. `logs/session-scratch/s1224-citation-drift-audit.mjs:96` — same idiom, one NUL, a tracked scratch audit script.

## SCOPE

1. `src/game/Game.ts:5709` — replace the **2** raw NUL bytes in the key template with the escape `\u0000`. The string value must not change.
2. `src/game/Game.ts:5748` — replace the **1** raw NUL byte the same way.
3. `logs/session-scratch/s1224-citation-drift-audit.mjs:96` — same, **1** byte. (Fix the CLASS, not the instance — house rule. Retention law: edit it, never delete it.)
4. Guard it against regression: append `&& node scripts/nul-audit.mjs` to the **existing** `test:node-guards` script in `package.json`, in the same style as the `&& node scripts/test-ticker-stats.mjs` step already there. **Do not create a new npm script** — a new one would be an un-rooted gate and would red `gate-caller-audit` (the s1301 lesson).

## TOUCH-ONLY

`src/game/Game.ts` (ONLY the delimiter bytes on :5709 and :5748) · `logs/session-scratch/s1224-citation-drift-audit.mjs` (ONLY :96) · `package.json` (ONLY the one appended call in `test:node-guards`) · `tasks/BACKLOG.md` (goal-leaf/ledger row, same commit).

## NO

Any other edit to `Game.ts` — not a rename, not a reformat, not a lint fix, not a "while I'm here" · changing the delimiter to a different CHARACTER (a visible delimiter can collide with real material names; keep NUL semantics, change only the encoding) · editing `scripts/nul-audit.mjs` (it is the instrument, not the subject) · deleting or "cleaning up" the scratch script · a new npm script · any ER-01 / socket / era-system work (this slice is the instrument fix ONLY).

## SELF-CHECK

- `node scripts/nul-audit.mjs` exits **0** and prints `CLEAN`.
- **The point of the whole slice, asserted directly:** `grep -c import src/game/Game.ts` now prints **134** (it printed nothing before). Report the number you actually get.
- `npx tsc --noEmit` clean · `npm run build` green.
- `npm run test:node-guards` green — it now includes the audit; confirm the audit step actually ran.
- Behaviour unchanged where those keys are consumed: boot probe with **zero console/page errors**, desktop **and** 390px, plus the sprite/material-stats diagnostics path that builds these rows. Pass `--workers=1`.
- Prove the value did not move: show that the two key expressions still produce the same runtime string (a one-line node check on the parsed literal is fine).

READY-FOR-GATES. Report: the audit output before and after, the `grep -c import` number, the tsc/build/guard results, and confirmation that no line of `Game.ts` other than the two delimiter sites differs (`git diff --stat` plus the actual hunks).
