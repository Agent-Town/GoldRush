# Science dimension — research picks, epoch thresholds, and the Contract-Family Law

Status: DRAFT for owner ratification (3 items at bottom), sliceable immediately after.
Sources bound into this spec: docs/VISION-EPOCHS.md (pillars 3–5, empty-pool fixes a–e, staged path S4/S5), docs/GOLD_RUSH_BRIEF.md §2 (four progression dimensions) + §3.5–3.6 + §5 (voice) + §9 (canon), docs/decisions/ADR-001 (tech-language trajectory) + ADR-002 (meta tracks), docs/playtests/2026-07-06-robin-playtest-01.md (F2 wave-32 wall, F5 dead seam picks), src/game/MetaProgress.ts (the 4-track skeleton), assets/crafting-queue/contract.v1.json (the M5 contract shape).

## Owner directives (verbatim, dated)
- 2026-07-05 (VISION-EPOCHS): "pick a research after each contract… ANY completed contract advances time & allows a pick; SUCCESS grants bonus progress (failure never freezes the world)." "After N science steps a new epoch begins." "New weapons + contracts per epoch."
- 2026-07-06 (Robin, direct): "**Each epoche has to come with its unique contracts.** We can really go all out here and make unique experiences that people would like to replay later again."
- 2026-07-06 playtest grounding: upgrades stop holding the wave curve ~w30+ (F2); seam/prospecting cards are never-picked dead weight (F5). Robin hit the same wall at wave 36 on 07-05 — VISION-EPOCHS names it "the empty-pool problem." Science is the structural fix, not a band-aid.

## Thesis
Science is the **pacemaker of the generational game**. Contracts (v1: completed runs; later: tavern bounties) advance time and grant **research picks**; picks take **nodes** in a branching tree; nodes are **science steps** on the meta track; enough steps cross an **epoch threshold**; and every epoch arrives as a **contract family** — a versioned data bundle that changes what can be invented, offered, built, and ordered. Depth compounds run over run; the offer pool never runs dry; each epoch is a genuinely different game that stays replayable forever.

## Vocabulary (binding)
- **Research pick**: the choice moment after a run — pick 1 of 2 proposed nodes.
- **Node**: one concrete, legible unlock in a branch ("what changed" must fit one sentence).
- **Science step**: `MetaProgress.tracks.science += 1` per node taken (the skeleton already persists this).
- **Epoch threshold**: visible meter — "N steps to the Steamworks."
- **Contract family**: the per-epoch bundle (next section).
- **Era-stamped tile**: an adventure map that permanently keeps its epoch's contract family.

## THE EPOCH-CONTRACT LAW (owner, 2026-07-06 — constitutional)
Every epoch ships as a **self-contained versioned bundle** at `assets/contracts/<epoch-id>/`:
1. **Crafting contract** `contract.vN.json` — the era's invention vocabulary: materials, verbs, stat caps, validators. (Epoch-1 = today's contract.v1, relocated/aliased.)
2. **Upgrade card families** `families.json` — epoch-gated pool additions + mastery-conversion rules.
3. **Mode-manifest vocabulary** — win conditions/modifiers/verb-data this era adds (feeds tavern adventures and the family-authoring ladder, VISION layers 1–3).
4. **Tech-language sheet** — ADR-001 step: brass/steam → progressively sleeker agent-tech.
5. **Art manifest** — BACKLOG.md entries per the epoch asset strategy (drip, not burst).
6. **Tile/biome descriptor** — where this era's adventures happen (pillar 5).

The engine consumes bundles through a **registry** (`src/meta/ContractFamilies.ts`): adding an epoch must require **zero engine rewrites**. We build the SOCKET now and epoch-1's bundle now; epoch-2 ("Steamworks") content waits for staged-path S5 — this honors the M7+ hooks-only guardrail while making Robin's law architectural fact.

## Replay Law (synthesis — ratification item 1)
The **town transforms forward** (pillar 4: one evolving home, houses become their next-era selves, children take the new roles). **Adventure tiles are era-stamped and replayable forever** with their era's full contract family — the first claim remains a Gold-Rush-frontier run for all time, retold at the tavern like a family tale. New tiles carry new eras. This is how "unique experiences people would like to replay later again" coexists with a world that moves on.

## Mechanics v1 (what we build now)
**EARN.** After every completed run, the Run Ledger flows into a **Research proposal**: the Elder proposes 2 nodes; pick 1. Victory (wave-20 Claim Secured) grants **+1 bonus pick** — victory visibly compounds the world (027's principle, constitutional). Death still earns the base pick: *the claim went quiet; the town kept thinking.* Failure never freezes the world (pillar 3).

**STRUCTURE.** Epoch-1 "Frontier" tree, three branches (ratification item 2):
- **Prospecting Works** (economy): makes the dead seam family matter — e.g. *Assay Grading* (seam cards also raise stockpile caps), *Mother Lode Survey* (seam respawn scales with waves survived), late node adds the **pact-card family** (risk-trades: more gold / harder thieves — empty-pool d, infinite by construction). Direct F5 fix: seams become the compounding economy engine you can build a run around.
- **Arsenal Works** (combat): **epoch-gated card families** entering the run pool (empty-pool a) + **mastery conversions** — a maxed family converts to rare cross-family synergy cards (firerate mastery feeds blast radius; empty-pool b). Direct F2 fix: the pool deepens combinatorially exactly where the wave-30 wall lives, without stat inflation.
- **Assay Works** (crafting + agent): order slots, **contract tier** raises (stat caps within the era's contract), **crafted cards enter their family's pool** (validated inventions become run content — empty-pool c), and **agent schooling** offers (late-run offers that teach the Prospector new tricks mid-run — empty-pool e, ADR-002's agent-track interplay).

**SPEND SURFACE.** v1 is the post-run **Research overlay** in canon voice (§5: plain frontier language, warm, specific — "The Elder proposes…"). No new in-run building yet: the Schoolhouse (art already generated in batch-029) becomes science's physical home in Town v1 (staged path S2), not before.

**NUMBERS SKETCH** (owner-tuned 2026-07-06: "8–12 experiences for one epoch are a lot… depends on their length and difficulty"): epoch-1 tree = 15 nodes (5 per branch); **"Steamworks (locked)" threshold at 6 steps** → with 1 pick per run + victory bonus, epoch-1 turns over in **~4–6 runs**. Epoch LENGTH RAMPS with the saga: later epochs have longer arcs (more steps, longer/harder contracts), first epochs turn over fast so the transformation magic shows early. Threshold per epoch lives in the epoch bundle — tuning stays data. Interface with task 021 (economy audit, queued): 021 owns in-run XP/gold pacing; science owns run-to-run structure; they meet at the SAME family definitions — 021 must not retune what a science node gates without updating the node text.

## Integration map (what each slice touches)
- `MetaProgress.tracks.science` — already persists; steps write here.
- NEW `src/meta/ResearchTree.ts` — data-driven from the epoch bundle; pure functions + localStorage via existing meta storage; e2e-seedable.
- `src/game/Upgrades.ts` — pool assembly gains a `familyGate` filter (science node ids). Mechanical, additive; the 14 existing defs become epoch-1 baseline families.
- Run Ledger → Research overlay hook (`src/ui/`); death and victory paths both flow through it.
- Assay bench reads contract tier from science state (M5 tie-in; after 037/039 land).
- UNTOUCHED: Economy (sole gold writer — research is meta, spends nothing in-run), CombatSystem, wave scheduler, determinism/event-log invariants (multiplayer hooks), sim timestep.

## Slices (lane-ready; each ends playable)
- **SCI-01 Research loop v1**: overlay + pick-1-of-2 + persistence + science meter with epoch threshold + THREE real nodes wired (one per branch, incl. the first seam buff so F5 improves on day one). Checkpoint: die, pick, next run's offers visibly differ.
- **SCI-02 Epoch-gated families + mastery**: full epoch-1 families.json, pool gating, mastery conversions. Checkpoint: the wave-30 wall moves (owner playtest gate).
- **SCI-03 Assay & agent branch**: contract tier, crafted-cards-into-pools, schooling offers. (Sequenced after the live assayer exists so tiers gate something real.)
- **SCI-04 Contract-family registry**: bundle folder structure, epoch-1 extraction, registry module, `epoch-2-steamworks/` STUB manifest proving the socket loads (no content). 
Every slice: tsc/build; own e2e both projects; sim-drift suites unmodified-green; canon-voice copy review; STATUS/spec updated.

## Laws (inherited + new, binding on all SCI lanes)
Pool depth is combinatorial, never inflationary. Victory compounds the world visibly, every time. Failure advances time. Generator proposes, contract + validation disposes — at every scale (items → cards → modes → maps). Canon: illustrated never gory; frontier-tech per ADR-001; naming per §9.4; satire playful, never textbook. Placeholder-first art; epoch assets accrue via the nightly drip, never block gameplay.

## Ratification — ANSWERED (Robin, 2026-07-06 evening)
1. **Replay Law: CONFIRMED.** Era-stamped replayable tiles + forward-transforming town is LAW.
2. **Branches**: question didn't land ("I can't follow you here") → orchestrator's call, made: three branches, presented in-game in plain terms — **one improves the mining economy, one improves your arsenal, one improves the AI crafting & your agent** (canon names Prospecting/Arsenal/Assay Works remain the flavor labels on top). Revisit only if playtests show confusion.
3. **Pacing: RULED — 8–12 is too many.** Threshold set to 6 steps (~4–6 runs for epoch-1), epoch length ramps in later eras, per-epoch threshold lives in the bundle (see Numbers Sketch).

## Owner UX ruling — RATIFIED (Robin, 2026-07-06 evening: "I like the idea of the town in between")
The between-runs town model below is LAW for S2+ slicing: contracts are chosen at the tavern board between runs; in-run buildings stay defense/economy machines.

(Original question, for the record: "Will I build a contract house in my game and jump into the next game from there?")
Design answer in this spec's model (see docs/VISION-EPOCHS.md S2/S3): contracts are chosen BETWEEN runs, in the TOWN — the tavern's contract board is where the next adventure (era-stamped tile + modifiers + posted family-authored tales) is picked; the Claim Office anchors territory; the Schoolhouse is science's home. In-run buildings stay defense/economy machines; runs stay tight roguelite runs. Bridge until Town v1 (S2): Run Ledger → research pick → Try Again, with the contract board arriving as the town's first interactive surface. If Robin wants an IN-RUN contract building instead, that's a design fork to argue before S2 — the between-runs model is this spec's recommendation.
