# Task 045: the megaproject construction site — epoch transitions become buildable (MAIN slot, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; specs/epoch-saga/README.md §1 (the megaproject spine — "science completes → the megaproject becomes buildable → its completion IS the epoch transition") + e2-steamworks-bundle.md; src/meta (science state, epoch registry SCI-04); BuildSystem (build pads, HP, the BT tier machinery). Pre-flight: zero staged/modified TRACKED files (`??` untracked expected — list briefly, proceed). SEQUENCING: run after 043 has merged (verify its commit by pattern in the full git log, NOT a short window).

## Why
Robin hit the science ceiling ("0 to the Steamworks (locked)") and the fix so far is honest copy. This task builds the MECHANIC that copy promises: a data-driven, multi-run construction site — the system every epoch transition (E2's Stamp Mill & Rail Spur through E9's Generation Ark) will reuse. GENERIC ENGINE, dev-manifest tested; E2's real manifest arrives with Town v1 (do NOT ship player-facing Steamworks content in this task).

## Scope
1. **`src/meta/Megaproject.ts`**: manifest-driven (from the epoch bundle via the SCI-04 registry): {id, siteFootprint, stages: [{materials: {gold:n, ...}, buildTicks, defenseWaves}], unlockCondition (science ≥ threshold)}. State persists across runs in meta storage (per-profile, like MetaProgress).
2. **The site in-run**: once unlocked, a SITE footprint appears at a manifest-designated location (build-pad law: footprint reserved, routing respects it); the player FUNDS a stage (Economy spend — sole-writer law), then the stage builds over N waves while enemies target it (site HP per stage; damage delays, never destroys progress — warm law: setbacks, not resets); stage completion persists even if the run ends.
3. **Progress rendering**: scaffold placeholder visuals per stage count (procedural — art arrives per-epoch later); a ledger-voice progress chip ("The Stamp Mill rises: stage 2 of 3").
4. **Dev manifest for testing**: `epoch-1-frontier` gets a hidden dev megaproject (debug-gated `?megaproject=dev`) with 2 tiny stages — the e2e vehicle. NO player-facing epoch-1 megaproject (epoch-1's transition ships with Town v1 content).
5. **Diagnostics**: megaproject {unlocked, stage, hp, funded} exposed.

## Firewall
Touch ONLY: new src/meta/Megaproject.ts, registry read path (additive), BuildSystem site-footprint reservation (additive), Economy spend call, meta storage (versioned, migration-safe), scaffold placeholder visuals, diagnostics + vite-env additive, new e2e. NO changes to: wave scheduler internals (sites register as targets via the existing target surface), science thresholds, epoch content, existing e2e.

## Self-check
tsc/build; new `e2e/045-megaproject.spec.ts` (debug dev-manifest: unlock via seeded meta → site appears + reserves footprint → fund → stage builds across waves → damage delays → completion persists across a reload); m2-01 + task-025 + m1-01 + sci suites unmodified green both projects; zero console errors; screenshots (site stage 1, under attack, complete) into artifacts/045/. End: READY-FOR-GATES + the manifest schema as shipped + results.
