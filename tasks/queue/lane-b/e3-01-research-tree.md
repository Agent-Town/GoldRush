# e3-01-research-tree — the Voltage chart gets its science (lane-b #3; commit prefix "feat:")
ROLE: content data. WORKDIR: lane-b (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner: "Does this also unlock the work on E3? I would love to keep pushing forward." E3 OPENS. The epoch-3-voltage manifest exists LOCKED with scienceThreshold 10 and EMPTY research branches (Grid Craft / Arsenal / Fabrication stubs).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: the player's E2 science already banks toward the Voltage Age (+3 on the owner's live profile — research-inheritance working). When he presses T2 (Dynamo), the E3 chart must EXIST. This slice fills the research tree DATA ONLY — the first content brick of E3, exactly how E2's chart preceded its mechanics (banked-effect law).

## READ-FIRST: specs/epoch-saga/e3-voltage-bundle.md IN FULL (the Canyon Works grid mechanic, arsenal, buildings — nodes must foreshadow THESE, nothing else) · assets/contracts/epoch-2-steamworks/manifest.json research block (THE data shape: branches/nodes/requires/effects/iconKeys) · src/meta/ResearchTree.ts effect plumbing (which effect kinds are ENGINE-LIVE vs display-banked) · RESEARCH_UNLOCK_REVEALS in src/ui/ResearchChart.ts (each node needs its reveal line) · lore voice: docs/GOLD_RUSH_BRIEF.md §9.

## SCOPE:
1. Fill epoch-3-voltage/manifest.json research: 3 branches (keep the stub ids), 12-16 nodes total mirroring E2's density. EFFECT LAW: every node effect is either (a) a mechanic that ALREADY ships (assay slots, stockpile caps, fire-rate — reuse E2 effect kinds), or (b) an explicit BANK ("Banks the <X> family/tier") for e3-bundle mechanics (pylon spans, arc turret, tram, brown-out ledger, capacitor crate) — NEVER a dangling engine promise. Boss-science node mirrors sky_rocket_battery's capture-gate pattern (the Crawler's drain-mast science, gated on a future medal flag — flag name reserved, defaults false).
2. Icon keys: reuse existing RESEARCH_ICON_REGISTRY keys where they read correctly; new e3 keys ONLY as registry entries pointing at EXISTING processed icons (icons-e3 art does not exist yet — placeholder-first; add a LEDGER note listing which icons want the future e3 sheet).
3. RESEARCH_UNLOCK_REVEALS lines for every node (ledger voice, one sentence).
4. e2e `e2e/e3-research-tree.spec.ts`: seed a Voltage-active profile (schoolhouse-era-truth pattern), the chart renders 3 branches + all nodes with icons resolving, era row shows three eras, picks/pins work on frontier nodes, zero console/page errors, both projects. E2/E1 charts unmodified-green (research-inheritance spec).

## Firewall
Touch ONLY: assets/contracts/epoch-3-voltage/manifest.json (research block + displayName polish if the bundle names differ), RESEARCH_ICON_REGISTRY additions (existing-file pointers only), RESEARCH_UNLOCK_REVEALS additions, the new spec, assets/LEDGER.md icon-wants note. NO engine effects, NO unlock-threshold change, NO E1/E2 data, NO ResearchTree.ts logic.

## Self-check
tsc + build green · new spec green both projects · research-inheritance + schoolhouse-era-truth unmodified-green · zero console/page errors · the full node table (name/branch/requires/effect/reveal) in the report FOR OWNER RATIFICATION (veto window — names/effects are canon-touching). If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the node table.
