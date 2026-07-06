# Review — M4-07 Prospector art activation (LANE-B, drained s85)

**Verdict: PASS — merged to main by graft (lane/m4 `6c69c8d`, base `a4c1b8c`).**

## What landed
Swaps the Prospector companion's procedural canvas billboard (m4-06 placeholder) for the
real illustrated hover automaton. Activates the `char.prospector_agent` contract with a
data-only `walk4` block (32 hover cells, sheets A/B, 8-way facing, clip `walk` fps 4) —
no new SpriteAnimator code path. `src/agent/Embodiment.ts` now drives a `SpriteAnimator`
instead of `createProspectorTexture()` (−105 net lines). Balance additive: `agent.spriteScale`
1.45→2.24 (≈70% hero band), `agent.hoverFps` 4.

## Graft method (native, cherry-pick unavailable headless)
Merge-base `a4c1b8c`. Since base, main moved forward (SCI-01 drain, s84/s85). Overlap analysis:
only `src/game/Balance.ts` touched by BOTH — and the two hunks are DISJOINT (lane = `agent{}`
block ~L61; main = new `research{}` block ~L259). Non-overlap lane files
(`Embodiment.ts`, `characters.v2.json`, `LEDGER.md`, `e2e/m4-06-embodiment.spec.ts`,
`artifacts/m4-07/*`) applied via `git checkout 6c69c8d -- <file>`; Balance.ts merged by hand
(applied lane's 2-line agent-block edit onto main, main's research block preserved — verified
present at L259). No 3-way conflict.

## Evidence
- `npx tsc --noEmit` — clean.
- `npm run build` — clean (949 kB bundle, prior size-warning only).
- **Slice spec `e2e/m4-06-embodiment.spec.ts` — 10/10** (desktop-chrome + mobile-chrome/390px).
  Includes "real Prospector sprite loads and faces pan movement" (the texture swap is live,
  8-way facing works), "plain boot renders the Prospector" (boot probe, zero console/page
  errors both viewports), "no collider for scripted enemy movement" (companion is non-blocking).
- **Regression `e2e/sci-01-research-loop.spec.ts`** — passed (Balance `research{}` block intact
  after graft).
- **Regression `e2e/m3-06-demo-profiles.spec.ts` — 8/8** (difficulty/profile path unaffected).
- **Core `m1-01`, `m2-01`** — passed.
- In-world shots: `reviews/shots-m4-07/{desktop,mobile}-chrome-{idle,mid-action}.png` (lane
  runner's own gated captures, grafted in). Prospector renders at gameplay zoom near the claim.

## Gate-harness note (not a finding)
Gates ran against an isolated vite on port **5207** (`playwright.scratch.config.ts`) because
lane-a's LIVE SCI-02 run holds the default port 5188 — my first default-config run produced
2 spurious `net::ERR_CONNECTION_REFUSED` failures from that contention; all 10 passed once
isolated. Separately, batching m3-06 (stateful localStorage profiles) alongside other specs on
one shared origin caused 1 cross-contamination failure that vanished on isolated re-run (8/8).
Neither is a graft defect. Lesson: run stateful profile specs alone.

## Canon (brief §9.2 / §9.4)
The companion is "the Prospector" — warm brass hover automaton, no legs (hover-bob), no firearms,
illustrated not gory. Art was QA-passed in `reviews/art-batch-008-prospector.md`. PASS.

## Firewall
Additive/replacement only within m4-06's DORMANT slot as authored. No touch to damage math,
Economy, Combat, wave logic, sim timing, or the SpriteAnimator engine (data-only contract).
