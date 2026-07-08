# Task town-T4: the town grows — earned buildings + the Stamp Mill rising on the square (LANE-B, branch lane/m4, commit prefix "town:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; **specs/town-v1/README.md T4 (BINDING: growth is EARNED, rendered from meta — law §3)**; the town scene/layout (T1-T3 + polish state); MetaProgress (territory tier) + the epoch/megaproject state (045 + stamp-mill manifest — its stage mirrors on the square per the manifest's town link); processed bld-general-store + bld-chapel (batch-009, LEDGER state; placeholder-first). Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/m4 main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after baron-presence drains from this lane (safe-dupe handles the merged commit).

## Why (spec T4; the Stamp Mill now EXISTS as a manifest — the square should show the era rising)
The town renders meta facts. Territory growth adds buildings; the megaproject's construction mirrors at the square's edge — the player SEES their saga between runs.

## Scope
1. **Epoch-1 growth manifest**: territory tier ≥2 → general store shell appears; ≥3 → chapel; each with plaque + one bark-slot for T5. Data-driven (the growth manifest from the spec), fresh profile = the bare founding square (asserted).
2. **The Stamp Mill on the square's edge**: megaproject stage state renders as the construction site vignette (scaffold → boilers → the mill; reuse the claim-side stage visuals' sprites at town scale); a plaque with the ledger-voice progress line. Completion state shows the ready-mill with "awaits the whistle" copy (the ceremony remains gated).
3. **Growth beats**: SS-01 beats on first sight of each new building (tavernkeeper: "The store came in on Tuesday's wagon. We're a town now.") — data entries via the beat system, once per profile.
4. Layout: growth positions from townLayout data (no overlaps with T1 shells/props; collision-marked).
5. Mobile: the grown square readable at 390px.

## Firewall
Touch ONLY: town growth rendering + manifest data, the square's megaproject vignette, beat data entries, e2e, artifacts. NO changes to: meta/territory earning math, the megaproject engine/manifest, run scene, naming/board (T2/T3 surfaces), SS-01 engine.

## Self-check
tsc/build; new `e2e/town-t4-growth.spec.ts`: seeded territory tiers → correct buildings appear (0/2/3 staged) · seeded megaproject stages → the square vignette advances · fresh profile = bare square · growth beats fire once; town-t1/t2/t3 + ss-01 + m1-01 + m2-01 unmodified green both projects; zero console errors; screenshots (bare vs grown square, the mill rising, 390px) into artifacts/town-t4/. Commit on lane/m4. End: READY-FOR-GATES + results.
