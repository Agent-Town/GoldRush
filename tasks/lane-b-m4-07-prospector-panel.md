> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, verified s1131 2026-07-27).** Content probe on main today: `src/ui/ProspectorPanel.ts:72` renders `data-testid="prospector-panel"` — the exact testid scope item 1 asks for — inside `<section class="prospector-panel" aria-label="Prospector ledger">`; `src/agent/AgentConsent.ts` (106 lines) is the reusable consent/policy store scope item 3 specifies; `e2e/m4-07-prospector-panel.spec.ts` exists. No done-move, no goal leaf; see F-1130-4 / F-1131-2. Retained per the RETENTION LAW.

# Task M4-07: the Prospector Panel — how do I use my robot? (LANE-B, branch lane/m4, commit prefix "feat:")

**FIRE-AUTHORED s109 (attended review welcome)** — from the ratified spec-lite `specs/m4-agent-ux/README.md` (owner's mid-playtest questions: "how do I interact with it? How do I change the permissions? What are the buttons?"). Gate satisfied: prospector-presence merged to main (`7e37c61`) — the chip/HUD surface this builds on is live.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.

## READ FIRST
- AGENTS.md; `specs/m4-agent-ux/README.md` (the full design — panel, ladder, consent-vs-ceiling law, receipts, G binding, mobile).
- `src/ui/Hud.ts` (the HUD agent chip: `data-testid="hud-agent"`, `aria-expanded`, portrait/name/level/label/feed/detail spans, ~L74-95; `agentChip`/`agentFeed` fields).
- `src/agent/PermissionLadder.ts` (the ceiling model: `AgentPermissionLevel` 0-3, `AGENT_PERMISSION_LABELS`, `readAgentPermissionLevel(meta.agentAutonomyLevel)`, `decideToolPermission`).
- `src/agent/AgentStub.ts` (`receiptFeed`, capped at 3 — you will surface ~8 readable lines) + `src/agent/Embodiment.ts` (the companion's actual behaviors, just made live in prospector-presence: idle drift, XP-mote collection).
- `src/systems/UiBridge.ts` (the snapshot shape the HUD renders from) + `docs/GOLD_RUSH_BRIEF.md` §6.2/§6.3 (Founders Plot ceiling-vs-consent) + §5 (ledger voice) + §3.2 (agent-as-partner — never commanded like a tool in UI copy).

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The runner auto-commits lane output, so the lane branch being ahead of main is NORMAL. For each ahead commit: if its content is already merged to main (verify by diffing its product files vs main), it is a SAFE DUPE. **Known: `de3cd6d` "fix: make prospector present and usable" is a VERIFIED loss-free content-dupe** — its core product (`src/entities/XpMote.ts`, `src/agent/Embodiment.ts`) is byte-identical to main via `7e37c61`; its other diffs are stale pre-images of files main has evolved past (task-037/sci-01/SpriteAnimator). So: `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP only if the worktree holds uncommitted edits you did not make, or an ahead commit's PRODUCT is not on main. Then `npm install --no-audit --no-fund`; `npm run build` green.

## Design law (do not violate — brief §6.2/§6.3)
- **Meta sets the CEILING**: `agentAutonomyLevel` (victory-fed, via `readAgentPermissionLevel`) is the hard cap. The panel NEVER raises it — earned, never bought mid-run.
- **The player sets the CONSENT**: within the earned ceiling, each rung has a grant/revoke toggle and each ability a checkbox. Consent can only REVOKE within the ceiling, never exceed it. Revocation is instant and visible.
- Default state = fully granted up to the current ceiling → **default behavior is unchanged** from today (this is the regression-safety anchor).

## Scope
1. **The panel** — a ledger-styled overlay, opened by **G key** OR click/tap on the HUD chip (`data-testid="hud-agent"`); closed by G / Esc / outside-tap. It PAUSES NOTHING (glanceable mid-wave — it is a ledger page, not a menu). Set `aria-expanded` truthfully on the chip; give the panel `data-testid="prospector-panel"`.
2. **Contents** (spec §The panel, in order):
   - Portrait (batch-008, already in the chip) + name + current level in plain words.
   - **The ladder, four rungs**, one line each: L0 suggest-only (watches, comments) · L1 collect & carry (XP motes, dropped gold) · L2 tend & repair (walls, buildings) · L3 work the claim (pan, haul to stockpile). Earned rungs (≤ ceiling) show a grant/revoke toggle; unearned show "earned at agent level N" + one line on how the track grows (victories).
   - **Abilities at your level**: checkboxes (auto-collect / auto-repair / auto-pan …) scoped to what the current ceiling permits. These are the consent switches — build them as a reusable policy store so BT-04's homestead automation can consume the same state later (build once).
   - **Receipts, readable**: replace the run-on `agentFeed` sentence with stacked lines, newest first, ~8 visible: `time · verb · outcome` in ledger voice (e.g. "02:14 — panned the east sluice: +6 gold"). The chip's collapsed one-liner may stay as the latest receipt; the panel shows the stack.
3. **Consent wiring**: the toggles/checkboxes gate the Prospector's autonomous actions through the EXISTING behavior path (Embodiment / collect-xp). Unchecking an ability instantly stops that behavior; re-checking resumes. The ceiling remains the hard cap (a revoked-then-toggled rung can never exceed `agentAutonomyLevel`). Persist consent in RUN state (reset by `resetRun()`), NOT meta — consent is a per-run trust choice, not a permanent unlock.
4. **Mobile**: chip tap opens the same panel as a full-width bottom-sheet; 44px minimum tap targets on every toggle/checkbox/close.
5. **Voice/canon**: all panel copy in ledger voice; the Prospector is granted trust, never commanded ("Let the Prospector tend the walls", not "Enable wall repair"). No firearms language. Name per brief §9.4 ("the Prospector").

## Firewall
Touch ONLY: `src/ui/Hud.ts` + a new panel module under `src/ui/` (e.g. `src/ui/ProspectorPanel.ts`), a new consent/policy store module under `src/agent/` (e.g. `src/agent/AgentConsent.ts`), the minimal Embodiment/Game wiring to CONSULT that consent store when gating actions, `src/styles.css` (panel + bottom-sheet), `src/systems/UiBridge.ts` (snapshot fields the panel needs), and new/edited e2e. **NO changes to `PermissionLadder.ts` ceiling logic** (the cap is untouched — you only read it). **NO meta-threshold / Balance / victory-feed changes.** **NO tool-surface behavior beyond consulting consent (default-granted).** Do NOT touch other lanes' files (ResearchTree, BuildSystem tiers, StartMenu, terrain).

## Self-check (acceptance)
- `npx tsc --noEmit` clean; `npm run build` green.
- New `e2e/m4-07-prospector-panel.spec.ts`, plain boot (NO ?debug), desktop + 390px:
  - G key opens the panel; G/Esc/outside-tap closes it; chip `aria-expanded` reflects state; opening the panel does NOT pause the sim (wave timer/enemies keep advancing).
  - Ladder shows 4 rungs; earned rungs (≤ ceiling) render a toggle, unearned render the "earned at level N" hint.
  - Toggling an earned ability OFF visibly stops that behavior (assert against the prospector-presence diagnostics surface, e.g. XP-mote collection halts when auto-collect is unchecked) and back ON resumes; a revoked rung can never exceed the ceiling.
  - Receipts render as ≥2 stacked lines newest-first in the panel (drive an action or seed the feed), not the run-on sentence.
  - Mobile: chip tap opens the bottom-sheet full-width; close target ≥44px.
- Regression green both projects: `m4-06-embodiment`, `m4-05-agent-closeout`, `m4-01`, `task-027-victory-must-matter` (run serial if the 4-worker batch flakes — F-042-1/F-S106-1 concurrent-load family).
- Zero console/page errors both viewports.
- Screenshots into `artifacts/m4-07-panel/`: panel-open-desktop, panel-open-mobile, receipts-stack, a revoked-ability state.
- Commit on lane/m4 (`feat:` prefix). End your run with: **READY-FOR-GATES** + which files changed + the consent-store design (where state lives, how the ceiling stays the cap) + any finding.
