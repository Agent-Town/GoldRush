# raise-action-at-the-mill-site — the ceremony trigger lives at the monument too
ROLE: town-UI implementer. WORKDIR: lane-b (worktrees/lane-b).
CODEX: model=gpt-5.6-sol effort=medium

## WHY (owner, T1 morning 2026-07-12, verbatim): "ah it is in the Elder's Survey Chart screen - ok, I did not expect that."
He stood AT the completed mill ("awaits the whistle") looking for the button; it only exists inside the schoolhouse overlay. Expectation law: the thing you built is where you expect to start it. STANDING RULE FOR ALL FUTURE TRANSITIONS (T2..T10 per lore/STORYBOOK.md interstitials): the transition action lives AT the megaproject site; the schoolhouse stays as the formal secondary door.

## READ-FIRST
- src/town/TownScene.ts: `stampMillAt()` (site proximity exists), `renderEpochActivationAction()` + `raiseStampMill()` (the gates + the action — REUSE both, do not duplicate gate logic), the building approach-prompt pattern (`activePrompt`, approach barks).
- e2e/072-era-activation.spec.ts (door-path assertions — the site path must satisfy the same one-shot/ceremony/persistence truths).

## SCOPE
1. When the hero stands at the mill site AND the door-state is 'ready' (same predicate as the schoolhouse door): the site approach prompt offers **"Raise the Stamp Mill"** → calls the SAME `raiseStampMill()` (one-shot + ceremony signal unchanged).
2. When ready-but-needs-science: the prompt shows the same needs-science line (never silent).
3. Schoolhouse door unchanged. Plaque unchanged.
4. e2e: seed complete state → walk to site → prompt shows the action → activate → `epoch-activated` fires once, ceremony stages, second visit shows no action (already active). Both projects incl. 390px tap target.

## TOUCH-ONLY: src/town/TownScene.ts (site prompt + wiring), town.css if a prompt style is needed, one new e2e (or 072 extension), artifacts/.
## NO: Megaproject.ts, ResearchTree, StartMenu, run scene, story beats engine.
## SELF-CHECK: tsc; build; new/extended spec green BOTH projects; 072 full suite unmodified-green; town-t1..t6 adjacents green; zero console; screenshot of the site prompt in artifacts/raise-at-site/.
END: READY-FOR-GATES + screenshot + confirm one-shot held via the 072 re-run.
