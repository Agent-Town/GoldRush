# Town v1 — the place between runs
Status: **DRAFT v1, 2026-07-07 ~13:20, attended (s61)** — ratified-in-principle by owner 2026-07-06 ("Ok, I like the idea of the town in between"); 3 small ratification items at bottom, all defaulted so slices are fire-authorable IMMEDIATELY. This spec consumes the M6 actors foundation (5de1c85) and GATES Epoch 2.

## Owner directives (verbatim, binding)
- "Ok, I like the idea of the town in between." (2026-07-06, ratifying the between-runs town model)
- Upgrades/agents vision (2026-07-06): "…farming can be so automated by agents that the user can just only be there to support because they want to be there." The town is where that support-role future lives.
- Meta-visibility law (2026-07-07, F-0707-14): earned meta must announce itself — the town IS that announcement, walkable.
- Naming (attended proposal, owner-seen 2026-07-07 ~12:20 reply, unobjected): **the player names their town at founding; per-profile.** Agent Town = the UNIVERSE, never this settlement's name.

## Laws
1. **The town is a SCENE, not a sim.** No waves, no damage, no economy ticking. It renders meta state; it never mutates it except through explicit player actions (board picks, naming, future shop). The run sim's determinism laws are untouched — town and claim never share a scene graph.
2. **Per-profile.** Town name, layout growth, townsfolk roster all live under `profileDataKey()`. Each kid's saga = their own town.
3. **Growth is EARNED, rendered from meta:** territory tier + epoch progress + megaproject stages map to which buildings stand (data-driven manifest per epoch bundle; epoch-1's manifest ships in this spec's slices). No building appears without a meta fact behind it.
4. **The tavern contract board is THE run launcher** going forward: every run starts as a chosen contract (v1: the standard claim + Continued variants; GT-07's Re-survey and epoch tiles plug in here later — the board is the socket the whole saga's adventures mount into).
5. **Canon:** frontier warmth, §9 guardrails, ADR-001/003. Townsfolk are named characters (batch-009 sprites exist: tavernkeeper, storekeeper, elder, preacher, schoolteacher, assay clerk, youngsters). The Elder runs the Schoolhouse; research surfaces live there narratively.
6. **Entry flow v1:** main menu gains "Enter Town" (and after a victory, the run's exit leads THROUGH the town — victory → ceremony → town square). Menu's New Claim remains as a shortcut that routes via the board's default contract (no dead ends for the impatient).

## Slices (each ends playable + gated)
- **T1 — the square exists**: town scene (three.js, reuses claim rendering stack + actors foundation for the walkable player), ground + 4 placeholder building shells (tavern, claim office, schoolhouse, assay office), WASD/touch walk, enter from menu, exit back. GATE: e2e — enter town, walk to each building, prompts render, exit; zero console; both projects.
- **T2 — the founding naming**: first town entry per profile asks "What will you call this place?" (text input, 2–18 chars, profanity-light filter, rename later at the claim office for free v1); the name appears on the town header, run-start recap ("<Name> remembers…"), and the run ledger. GATE: e2e naming persistence per profile + rename + both projects.
- **T3 — the tavern contract board**: enter tavern (interior backdrop exists: tavern-interior-backdrop.png) → board UI listing contracts from a data manifest: v1 = "The Claim" (standard run) + "Continued Study" flavored variants (existing modifiers). Selecting one launches the run (replaces menu New Claim path internally). Board shows per-contract best-wave/last-result from the scoreboard. GATE: e2e — pick each contract type, run launches with correct config, results post back to the board.
- **T4 — the town grows**: epoch-1 growth manifest — territory tier ≥2 adds the general store shell, ≥3 adds the chapel; megaproject (045) stage-completions render construction progress on the square's edge (the Steamworks site!). Rendered purely from meta reads. GATE: seeded-meta e2e for each growth stage; fresh profile = bare square.
- **T5 — townsfolk v1**: the six batch-009 townsfolk placed per manifest (tavernkeeper inside, elder at schoolhouse, etc.), idle facing + 1-line ledger-voice barks on approach (data file, ≤90 chars each, epoch-aware later). The Prospector (your agent) idles near the claim office and greets by town name. GATE: e2e bark triggers + no sim objects in scene; visual screenshots.
- **T6 — surfaces move home**: menu Research opens the Schoolhouse view (the Elder's Survey Chart from lane-a mounts here when it lands); crafting order status readable at the Assay Office porch (existing panel reused). Menu thins to Continue / Enter Town / Profiles / Settings. GATE: all previous menu functions reachable through town OR menu (no regression), 044 spec updated-green.

## Integration map
Touches: new `src/town/` (scene, growth manifest, board UI, barks), main menu wiring, profile storage (additive keys), run-launch plumbing (board → existing run config path), run-exit → town routing. NEVER touches: sim/CombatSystem/WaveSystem/Economy internals (board passes config, nothing else), determinism, existing e2e assertions (044 menu spec updated in T6 only).

## Ratification items (defaulted — owner may veto with one word)
1. Town visual scale v1: intimate square (~30×30, 6 buildings max) vs sprawling street — **DEFAULT: intimate square** (readable, grows meaningfully).
2. Victory routing: every victory passes through town before next run — **DEFAULT: yes** (the town is the reward beat; skippable with one click).
3. Rename cost: free forever vs one-time-free — **DEFAULT: free at claim office v1** (kids will iterate names; friction later if abused).
