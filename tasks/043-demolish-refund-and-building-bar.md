# Task 043: demolish refund law + ONE building context bar (MAIN slot, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; specs/building-tiers/README.md §BT-00 (REFUND LAW TIGHTENED 2026-07-07 — binding); the shipped BT-00 + BT-02 diffs (demolish + tier prompts); docs/playtests/2026-07-07-robin-playtest-02.md. Pre-flight: zero staged/modified TRACKED files (`??` untracked expected — list briefly, proceed).

## Owner findings (2026-07-07 ~06:48, screenshot)
1. **Refund exploit-feel**: sluice base 40g, tear-down offered +80g (half of base+tier invested). Owner ruling: "There has to be a loss of gold." New LAW: **refund = floor(0.5 × BASE build cost × hp/maxHp); tier spends NEVER refund.** Update the Economy demolish grant + BT-00 e2e accordingly (tiered building refunds the same as untiered).
2. **Prompt overlap**: the tier-upgrade prompt and the demolish prompt render as separate stacked bars that collide ("not the best solution as they are overlapping"). Replace with **ONE building context bar** for the nearest owned building: `[icon] Sluice Works · Tier 2 — Upgrade to T3 (320g) [key] · Tear down (+20g) [Enter]` — single ledger-styled bar, both actions in fixed slots (disabled state shows why: "need 320g"), never two bars for one building. The Assay Office prompt keeps its own slot (different interaction class) but must never overlap this bar — define a single PROMPT STACK layout (fixed anchor order, consistent spacing) so ALL bottom prompts compose without collision, including future ones.
3. **Loss legibility**: the tear-down confirm shows invested vs returned: "invested 160g → returns 20g. The timber comes back, the labor doesn't."

## Firewall
Touch ONLY: demolish refund computation (Economy grant amount — Economy stays sole gold writer), the building prompt UI (merge upgrade+demolish into the context bar + the prompt-stack layout), copy, e2e. NO tier pricing changes, NO new abilities, NO sim changes.

## Self-check
tsc/build; BT-00 e2e updated: tiered sluice at full HP refunds exactly floor(0.5×base); half-HP scales; invested/returned copy asserted; prompt-stack e2e: building bar + assay prompt coexist without overlap (bounding boxes) desktop + 390; m2-01 + task-025 + m1-01 green both projects; screenshots (context bar with both actions, disabled upgrade state, tear-down confirm) into artifacts/043/; zero console errors. End: READY-FOR-GATES + files + results.
