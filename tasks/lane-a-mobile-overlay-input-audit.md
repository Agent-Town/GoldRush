# Task lane-a-mobile-overlay-input-audit: mobile overlays eat the game — audit + fix + coverage gate (LANE-A, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; src/town/town.css + the town-ui name-card markup (the VERIFIED culprit below); src/styles.css + src/ui/theme.css (overlay/backdrop conventions); src/ui/Hud.ts, src/ui/DeathOverlay.ts, src/ui/ResearchChart.ts (or wherever the research overlay renders), src/crafting/AssayBench.ts (every overlay surface you will audit).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): standard safe-dupe rules (lane ahead NORMAL; content-on-main = SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd`; STOP only on undrained content/foreign edits). Then npm install; build green.

## Why (OWNER PLAYTEST FINDING 2026-07-17, verbatim: "I tried it yesterday on my phone and the overlays did not really allow me to play the game")
ATTENDED-VERIFIED on the live deploy (iPhone-13 viewport probe): `town-ui__name-card` FORM measures **100% viewport coverage with pointer-events enabled** while its visible card occupies ~40% — every tap outside the card is swallowed. The claim-ledger + clerk-toast stack compound it. This is a CLASS bug: overlay CONTAINERS sized full-viewport with pointer events, visible card smaller.

## Scope
1. **The audit probe (build it first — it is also the gate):** a spec helper that, on the mobile-chrome project, walks the DOM and reports every element with position fixed/absolute, pointer-events ≠ none, and viewport coverage > 20%, at each of these states: (a) town scene with the founding name-card open, (b) town scene idle (post-naming), (c) in-run HUD idle, (d) build menu open, (e) level-up choice open, (f) research chart open, (g) death overlay open, (h) claim ledger open.
2. **THE LAW to enforce, per state:** a full-viewport pointer-enabled element is legal ONLY if it is the currently-open MODAL's backdrop (ledger, death overlay, level-up — surfaces that legitimately own the screen). Non-modal surfaces (name-card, toasts, HUD chrome, bench edge) must catch pointer events ONLY inside their visible card bounds: containers/wrappers get `pointer-events: none`, interactive children get `pointer-events: auto`.
3. **Fix every violation the probe finds** — CSS-first (pointer-events + sizing), markup only where a wrapper cannot be styled safely. The verified culprit (town name-card form) is fix #1.
4. **Canvas smoke, mobile:** with the name-card open, a tap at the screen's top-left quarter must reach the game canvas (document it via the diagnostics click/interaction path or a DOM-level assertion that the canvas received the pointer event).
5. **New spec e2e/mobile-overlay-input.spec.ts** (GATE-AUTHORSHIP): runs the probe at all eight states on mobile-chrome, asserts ZERO violations of the law in each, plus the canvas smoke. Desktop project: the same spec runs and must also pass (the law is universal; only the finding was mobile).

## Firewall
Touch ONLY: CSS files, overlay container markup/class attributes, the new spec + its helper. NO game logic, NO sim, NO overlay CONTENT/copy changes, NO z-index redesign beyond what a violation fix requires, NO removing any overlay.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. mobile-overlay-input.spec.ts green BOTH projects. Adjacent unmodified-green both projects: town-era-switch, task-025, board-gating-and-profiles (overlay-adjacent). Zero console/page errors. Screenshots: reviews/shots-mobile-overlay/{town-namecard-390.png, run-hud-390.png, levelup-390.png} — each showing the visible card with the game readable around it.
No-op guard: if you exit without changes, WRITE WHY into your report first.
End: READY-FOR-GATES + the violation table (state × element × coverage, before/after) — this is the owner's playtest finding closed with numbers.
