# Task lane-c-flood-reset-era-props: honor floodReset in the era-props chain (THE FLOOD BREAK, runtime half) (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; src/town/TownTavernPilot.ts (~lines 525-600 — ERA_PROP_MANIFESTS accretion; the exact gap: line ~531 maps ALL eras ≤ active and flatMaps their props, ignoring flags); assets/pilots/plaza-props-3d/era-props.e5.json (carries `floodReset: true` — verified 2026-07-16); docs/SOL-3D-C-QUEUE.md §THE FLOOD BREAK (the law: accretion runs in TWO CHAINS broken at the flood; E1–E4 props drown, E5 starts fresh); e2e/town-era-switch.spec.ts (the suite you extend).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: grep `floodReset` in src/town/ — absent (verified 2026-07-16) = BUILD. If the loader already honors it, STOP and report SHIPPED.

## Why (3D-C factory gate, recorded at its E5 harbor delivery 2026-07-16, verbatim)
"One factory gate is explicitly recorded: the runtime must honor floodReset: true so E2–E4 street props are removed rather than mounted underneath E5 replacements." The E5 submerged-harbor town merged (77502243 ancestry); its manifest sets `floodReset: true`; the loader accretes regardless — at E5 the drowned square would wrongly show four eras of street furniture stacked under the water. THE FLOOD BREAK law (owner 2026-07-16) requires the chain to break.

## Scope
1. In the era-prop manifest composition (TownTavernPilot.ts ~531): when building the manifest list for the active era, find the LATEST manifest ≤ active era with `floodReset === true`; if found, include only manifests FROM that era onward (chain 2). Earlier manifests (chain 1) are excluded entirely. No flag anywhere → behavior byte-identical to today.
2. Type the manifest shape additively (`floodReset?: boolean`) wherever the manifest type lives.
3. Extend e2e/town-era-switch.spec.ts (GATE-AUTHORSHIP — assert exactly, both projects):
   a. At active era E4: E2/E3/E4 prop ids all present in `town3dEraPropIds` (accretion unchanged — regression guard).
   b. At active era E5: NO E2/E3/E4 prop ids present; E5 prop ids present (the flood break, testable).
   c. Existing 12 assertions unmodified-green.

## Firewall
Touch ONLY: src/town/TownTavernPilot.ts (manifest composition only), the manifest type declaration, e2e/town-era-switch.spec.ts (additive).
NO changes to: prop GLBs/manifest JSONs, building era-variant loading, TownScene beyond the props path, sim/game code, other specs.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. town-era-switch green desktop+mobile (old 12 + new assertions). Zero console/page errors in an E5 town boot probe. Screenshot: reviews/shots-flood-reset/e5-town-no-chain1-props.png.
No-op guard: if you exit without changes, WRITE WHY into your report first.
End: READY-FOR-GATES + report: the composition rule as landed, prop-id lists observed at E4 vs E5.
