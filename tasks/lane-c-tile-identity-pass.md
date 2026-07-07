# Task tile-identity-pass: every E1 contract becomes a PLACE (LANE-C, branch lane/polish, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; **the owner's ruling (specs/terrain-render/README.md header — geography variety = success-critical)**; specs/e1-contracts/README.md (C3/C4 tiles); the contract tileParams socket (dry-gulch shipped it) + GT-01 heightfield descriptors (gt-test-basin's authoring pattern — hand-authored analytic shapes); the scatter/palette systems (w1-04 scatter params, the terrain atlas tint paths). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after ss-01 in this lane's queue.

## Why (owner, 2026-07-08: "Having geographical variations will add a lot to E1. Asking the players to play the same geography again and again is going to be not very successful.")
The contracts vary rules, not ground. This task gives each its own geography using ONLY existing machinery (heightfield descriptors + palette tints + scatter params + water params) — no new engine.

## Scope (per contract, all data-driven through descriptors)
1. **THE DRY GULCH — mesa country**: gentle arroyo channels (dry washes, VISUAL relief per the rendering-only law), a sunken spring basin (the pond sits IN a dip), ochre/red-rock palette tint, sparser+cactus-class scatter mix, NO river (already true). The wash channels funnel visually but sim-flat (GT-03 consumes real slopes only on GT tiles — state this in the report).
2. **TWIN BANKS — the braided crossing**: river widened with two mid-channel gravel bars (between the fords), marshy-damp bank tint zones, reed-class scatter near water, subtle bank relief per w1 machinery. Fords/lanes/sim untouched.
3. **NIGHT SHIFT — deliberate**: keeps the claim's bones (darkness is its geography) + ONE identity mark: lantern-post pre-placed at the claim stake (its buildable is already contract-gated) + a duskier base palette tint from wave 1.
4. **THE CLAIM — untouched** (the baseline stays byte-identical; regression-asserted).
5. Board cards gain a one-line geography blurb each (ledger voice: "Mesa country — the washes run dry and the spring runs deep").

## Firewall
Touch ONLY: contract tile descriptors (heightfield/palette/scatter/water params — additive), the pre-placed lantern data, board blurb lines, e2e, artifacts. NO engine changes, NO sim/routing changes, NO default-claim changes (byte-identity asserted), NO terrain-render v2 work (TR slices own that).

## Self-check
tsc/build; extended contract e2es: per-contract descriptor loads + palette/scatter/relief sampled-asserted + default claim byte-identical (seeded hash) + determinism per contract; e1-dry-gulch + e1-twin-banks + e1-night-shift + task-025 + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots per contract (wide establishing shot each — THE deliverable: three visibly different places) into artifacts/tile-identity/. Commit on lane/polish. End: READY-FOR-GATES + the three establishing shots called out + results.
