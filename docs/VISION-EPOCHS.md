# The Generational Epoch Design (Robin, 2026-07-05) — THE long-game north star
Supersedes/absorbs the VISION-HOOKS multiplayer-adjacent sketches. Canon-compatible (agentfolk citizens, town pride, epoch arc). Satire allowed: epochs are playful history (steam -> steampunk), never textbook.

## Pillars (Robin's words, structured)
1. LIVING TOWN: every house has a place and function; the whole must work together — story, infrastructure, townsfolk, guests, tradesfolk. THE TAVERN is the heart: stories from near and afar are told there (rumors, contract hooks, Baron news, family-authored adventures posted as "tales").
2. TIME PASSES: each bounty/contract advances the calendar. People age, marry, have children; children attend the school, grow up. Life happens BETWEEN runs, visibly.
3. SCIENCE TRACK: pick a research after each contract. Decision: ANY completed contract advances time & allows a pick; SUCCESS grants bonus progress (failure never freezes the world — life goes on, thematically and mechanically).
4. EPOCHS: after N science steps a new epoch begins. Houses TRANSFORM into their next-era selves; grown children move in and take the NEW ROLES the epoch needs (not all children — depends on the era's needed houses). Characters the family KNOWS carry the story forward — a generational saga, not a reset.
5. EXPANDING WORLD: adventures selected from a walkable/selectable MAP; the first claim is one large tile. New tiles per epoch: new maps, countries, continents, planets, universes. New weapons + contracts per epoch (tech language evolves per ADR-001 trajectory).

## The empty-pool problem (Robin hit it at wave 36) — reward depth mechanisms
a. EPOCH-GATED FAMILIES: each science step adds a card family to the run pool — later-epoch pools are 2-3x today's.
b. MASTERY OFFERS: maxed families convert to rare cross-family synergy cards (e.g., firerate mastery feeds blast radius) — combinatorial, not inflationary.
c. CRAFTED CARDS: M5 Assay creations enter the family's own pool (validated).
d. PACT CARDS (late-wave): risk-trades (more gold / harder thieves) — infinite by construction, choice-driven.
e. AGENT SCHOOLING: late offers teach the Prospector (and later recruits) new tricks mid-run — the agent dimension IS pool depth.

## Staged path (each stage playable, no vapor)
S1 (now): 027 victory-matters + M5 finish + Demo Day. S2: M6 Town v1 — static town square grown from victories, townsfolk w/ names+barks, TAVERN with contract board (contracts = mode manifests; the kids' adventures post here). S3: TIME v1 — calendar advances per contract; tavern ledger narrates life events (weddings, births, schooling) as between-run text+portrait moments BEFORE full sim (cheap, warm, testable). S4: SCIENCE TREE v1 (M3 science dimension matures; epoch threshold visible). S5: EPOCH 2 "Steamworks" — house transforms, child succession, new family/weapons/contract tier, second map tile. S6+: tiles multiply (ocean epoch = the boat megaproject), family co-op rides the ladder.

## Laws
- Victory compounds the world, visibly, every time (027 principle, now constitutional).
- Characters persist and age; the story is the reward. Generated content (faces, houses, tales) flows through pipeline v2 + contracts — generator proposes, canon/validation disposes.
- Epochs are satire-friendly but stay warm, illustrated, never gory; naming stays places/rituals.

## Asset strategy at epoch scale (s9ao)
APPETITE (honest): per epoch ~10-15 buildings + transformed variants, 10-20 townsfolk (portraits + sheets + AGING variants), a terrain/biome set per new tile, weapons/icons/contract art -> 60-150 generations per epoch incl. retries; thousands over the project's life.
RATE LIMITS (honest): subscription pools (Codex image_gen, ChatGPT web) have window caps — fine for a DRIP, walls for BURSTS (already observed: one credit exhaustion).
STRATEGY — volume becomes a schedule, not an event:
1. assets/BACKLOG.md = the standing manifest (per-stage, priority-ordered). Fires maintain it from specs.
2. NIGHTLY ART SHIFT: a recurring art task the fires enqueue — process the top N backlog items per night (N tuned to observed limits, start 15-20), reference-conditioned, self-QA'd, logged with burn rate. Epochs are months away in play-time; their assets accrue silently in the background.
3. TRANSFORMS OVER REGENERATION: era-variants of houses/characters via image-EDIT on the existing asset (consistency + often cheaper); in-engine tint/palette variants for townsfolk diversity; procedural layer keeps carrying terrain/vfx.
4. BURST VALVE (Robin decision when needed): a usage-based API key with a hard monthly cost guard — the offline-queue JSONs make the backend swappable without touching the pipeline.

## The no-code adventure platform (Robin's end-state; the family IS the prototype)
The loop Robin runs with Claude (describe -> agent implements -> gates verify -> play) IS the product, re-surfaced for kids:
- LAYER 1 (ships within current roadmap, M5/S2-S3): tavern tale-telling / Assay authoring — describe an adventure in words -> agent composes mode-manifest + map layout -> validation gates -> playable, shareable as a file. CONTENT ONLY, no code, fully safe. This is the kids' first authorship.
- LAYER 2: the Adventure Workshop — conversational TUNING with their agent ("faster bandits, bigger reward") = manifest diffs with preview/approve (permission-ladder pattern reused verbatim). Still content-only.
- LAYER 3 (the platform): the engine's VERBS (move/shoot/build/collect/defend/chase/escort...) recombined by manifests give a Bomberman-sized possibility space WITHOUT arbitrary code. NEW verbs remain the adults' factory (specs->lanes->gates) — kids request a verb, the family factory ships it gated. Sharing = manifest+asset bundles as files first; any hosted/public gallery is a FUTURE decision with real moderation questions — flagged, not designed.
LAW: authored content passes the same two gates as crafted items (contract + sim/abuse). Canon tone holds in shared content surfaces.
