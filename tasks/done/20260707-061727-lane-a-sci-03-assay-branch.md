# Task SCI-03: the Assay Works research branch — contract tiers with real teeth (LANE-A, branch lane/m3, commit prefix "sci:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a. READ FIRST: AGENTS.md; specs/science-dimension/README.md (§Assay Works — this is slice SCI-03; the s91 "what does contract tier gate" question is ANSWERED below, s61 attended 2026-07-07); src/meta/ResearchTree.ts + ContractFamilies.ts (SCI-04 socket); assets/crafting-queue/contract.v1.json; scripts/fire.md §2D ASSAYER (the consumer of what you gate). Pre-flight: safe-dupe rule (ahead-merged commits → `git checkout -B lane/m3 main && git clean -fd`, proceed; STOP only on unmerged content/foreign edits); npm install; build green. SEQUENCING: if sci-copy-clarity is queued ahead of you in this lane, normal — independent resets off main.

## Design ruling (what contract tier gates — s61, from the ratified spec §Assay Works)
Science raises the CEILING of what the era's assay works can approve. Three SCI-03 nodes in the Assay branch:
1. **"Refined Assay" (tier 2)**: the epoch contract's stat-budget cap for approved items raises +20% (the assayer validates against the tier the ORDER's profile had earned at post time — tier is recorded IN the pending order).
2. **"Pattern Library" (tier 3)**: APPROVED crafted items become offerable run cards in their family's pool (empty-pool fix c goes live: read approved/, map item → card via its family tag, capped at 2 crafted cards per run offer pool; validation shape unchanged).
3. **"Agent Schooling"**: unlocks a late-run offer family that grants the Prospector one extra ability-slot policy for THAT run (consumes the m4 policy switches; appears only past wave 15 — empty-pool fix e).

## Scope
1. The three nodes in the epoch-1 bundle's tree data (effect-first copy per the legibility law — numbers in every description).
2. **Tier plumbing**: science state → `contractTier` in meta; the bench stamps `tier` into pending orders; contract validation reads the tier's stat-budget from the epoch bundle (data, not code — SCI-04 socket). The assayer protocol (fire.md §2D) needs NO change: verdict files already carry contractVerdict — the budget table it validates against is bundle data.
3. **Pattern Library wiring**: approved/ → family-tagged run cards (offer pool integration via the SCI-02 familyGate machinery).
4. **Agent Schooling offer**: late-run family, grants a policy slot via the existing permission/policy surface (additive; if the M4-07 panel hasn't merged, the grant applies silently + one ledger line).
5. e2e: seeded meta at each tier → pending order carries tier; budget cap delta validated (fixture orders at/over budget per tier); Pattern Library: a seeded approved item appears as an offer card; schooling offer appears past wave 15 only.

## Firewall
Touch ONLY: ResearchTree data + tier state, bench order-stamping, contract validation budget-table read path (epoch bundle data), offer-pool integration via existing gates, e2e. NO assayer protocol changes, NO Economy/Combat/wave changes, NO new UI beyond node copy + one ledger line (the panel is M4-07's).

## Self-check
tsc/build; sci-01/02/04 + m5-04 + activations suites green both projects; new sci-03 spec green; the legibility guard passes on the three new nodes; zero console errors. Commit on lane/m3. End: READY-FOR-GATES + the tier budget table as shipped + results.
