# Task lane-a-e10-extra-maps-contracts: the e10 EXTRA MAPS as DATA — 3 contracts + 3 mask tables (the 27-map campaign) (LANE-A, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; lore/STORYBOOK.md — the E10 chapter's "New maps, specified for whoever builds them" section (~line 597; THREE maps, each fully specced with layout/objective/teaching intent; extract, NEVER invent); specs/epoch-saga/e10-*-bundle.md (era laws + style); assets/contracts/epoch-5-*/contracts.json + mask-tables/ (schema precedents — mirror the signature tile's shapes key-for-key).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL. Content-on-main = SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP only on undrained content or foreign uncommitted edits. Then npm install; build green.
GROUND-TRUTH pre-flight: the era's contracts.json must NOT yet contain the three extra-map ids. Any present = author only the missing; all present = STOP SHIPPED.

## Why (OWNER GREENLIGHT 2026-07-17, verbatim: "I want to greenlight all of these 27 maps. Lets build them as quickly as possible - I will have to test them all!")
Appendix E item 19's per-map owner gates are ALL OPEN by the blanket ruling above. This task lands era E10's three: contract + mask each, data-only, inert behind the era lock. 3D-D's sculpt grants activate on these mask files.

## Scope
1. THREE contract entries in the era's contracts.json (schema-exact vs its signature tile): tileParams per each map's storybook spec — zones, spawn edges, objective metadata, teaching-intent notes as description fields. Where a map is a VARIANT of an existing tile (reuses terrain semantics), say so in the contract (tileId reuse) and REPORT it — do not force a new landform where the spec doesn't ask for one.
2. THREE mask tables (core keys exact; additive per-map keys for each map's special zones).
3. ENGINE-DEPENDENCY FLAGS (report, never build): if a map's mechanic needs an engine slice that does not exist (zero-G, broadcast-mirror, event-driven cycle, persistence consumers), note it in the contract's description + your report — the contract still lands; playability gates later.
4. Node-test extension (bounds + water truth ×3) + board-gating inertness assertions ×3.

## Firewall
Touch ONLY: the era's contracts.json (additive), its mask-tables/ (3 new files), node test, board-gating assertions. NO tile/sim code, NO manifest edits, NO other eras, NO src/ beyond the spec.

## Self-check (evidence, not vibes)
tsc + build green · node test green · board-gating green both projects · task-025 unmodified-green · zero console plain boot.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + per-map zone summaries + variant/reuse decisions + engine-dependency flags — this report is 3D-D's sculpt-grant evidence for all three.
