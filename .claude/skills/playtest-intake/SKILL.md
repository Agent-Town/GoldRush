---
name: playtest-intake
description: Turn Robin's live playtest feedback (a sentence, a screenshot, a complaint mid-game) into verified findings, correct tasks, and durable ledger entries — in one pass, while he keeps playing. Use the moment the owner reports anything from inside the game.
---

# /playtest-intake — owner feedback → verified finding → task + ledger, in one pass

The owner playtesting is the factory's highest-value input stream. The bar: every finding he reports becomes a queued task or a recorded ruling within minutes, WITHOUT him repeating himself, and without you filing a fix for a misread symptom.

## 1. TRIAGE each item into exactly one bucket (a message usually contains several — split them)
- **BUG** (something broken): needs code verification before filing.
- **DESIGN RULING** (he decided something: "there has to be a loss of gold", "cut the flashes"): needs recording as LAW + a task if code must change.
- **KNOWN-SCOPE** (works as currently staged: "items don't apply yet"): needs an EXPECTATION answer, not a task — tell him what it is and where the future slice lives.
- **DIRECTION** (a wish: "real terrain everywhere"): needs a spec entry or spec update, cost-honesty, and possibly ratification questions — not an immediate task.
- **CONFIRMATION** (something now works: "turrets are much stronger now"): bank it — it may close a gate or a milestone. Check the OWNER'S DESK for what it retires.

## 2. VERIFY before filing (the step weaker models skip — don't)
For every BUG: find the mechanism in code FIRST. Grep/read until you can name file:line and the actual cause. The turret case is the cautionary tale: the symptom said "bullets blocked by walls," the code said "targeting refuses to ACQUIRE through palisades" (`canTarget`/`hasLineOfSight`) — a fix filed on the symptom would have touched the wrong system. If the owner's report contradicts your earlier claim, HIS observation wins; re-verify yours (it was wrong once already — the projectile/LOS distinction).
- Can't reproduce/verify in ~10 minutes? File it as INVESTIGATE-then-fix with a measurement matrix (model: task 042 anim-smoothness), never as a blind fix.
- Screenshot provided? Extract every incidental finding too (black buildings were spotted in a screenshot about something else). Crop-zoom with sips into the scratchpad when detail matters.

## 3. ANSWER him first (he's mid-game)
Reply order: (1) anything he needs to keep playing (workaround, key, URL — with exact commands), (2) what each finding IS (bug vs ruling vs scope) in one line each, (3) what you filed. Keep expectation-setting honest: if a thing he wants exists behind a gate/slice, say which and when.

## 4. FILE (per finding)
- BUG → task via `/author-task` (the WHY quotes his words verbatim + your verified file:line; his exact scenario becomes an e2e assertion so it can never regress silently — "turret behind palisade acquires and kills" style). Queue per throttle/lane-safety.
- DESIGN RULING → update the governing spec IN THE RULING'S WORDS (owner-quoted, dated) + task if needed. If it supersedes an earlier written decision, mark the old line SUPERSEDED — never silently edit history.
- DIRECTION → spec entry (new slice or scope raise) with an honest cost split (cheap-visual vs expensive-systemic was the terrain pattern) + ratification question ONLY if it's truly his call.
- CONFIRMATION → retire the desk/gate line, SAME commit as the record (a confirmation can close a milestone — turret-feel closed M2; check what each one gates).

## 5. RECORD — `docs/playtests/<date>-robin-playtest-NN.md`
Append per wave of feedback: timestamp · build context · his words verbatim · F-IDs with triage class · the task/spec each spawned · confirmations banked · anything still open with him. Then the BACKLOG lines for every spawned item (Completeness Law: same commit). Regenerate the dashboard if ledger lines changed (`bash scripts/dashboard-gen.sh`).

## 6. The quality bar for this skill's output
- [ ] Every sentence of his message is accounted for in a bucket (count them).
- [ ] No bug filed without file:line verification or an explicit INVESTIGATE framing.
- [ ] His exact scenario exists as an e2e assertion in every bug task.
- [ ] His words appear verbatim (quoted, dated) in every spec/task they justified.
- [ ] He got a playable answer (workaround/state) BEFORE the paperwork summary.
- [ ] Playtest doc + BACKLOG updated in the same pass; desk items retired where confirmations landed.
