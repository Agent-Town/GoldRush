# Sol findings — finish-the-game master plan

- **Branch:** `sol/masterplan-review`
- **Plan reviewed:** `docs/MASTERPLAN-2026-07-10.md` at `e374f47`
- **Live-main evidence cutoff:** `8e40723` (read-only inspection; 072 landed at `2d901a9`)
- **Prior audit intake:** 58 findings merged at `bd7b890`; pass 1 disposition is `reviews/sol-triage-2026-07-10.md`
- **Active out-of-main context:** `sol/fixed-step-unification` is separately owned and in progress. This review does not count fixed-step as missing and does not review or modify that branch.
- **Verdict:** **NEEDS REVISION.** The five directions are broadly right, but the plan is not yet an executable route to its own definition of finished. The era spine stops at E2, save and multiplayer completion are narrower than their claims, Thread A is materially undercalled, and the two spare subscriptions are banked options rather than current throughput.
- **Merge classification:** review artifact only. No source, test, spec, lore, STATUS, BACKLOG, queue, task, asset, or live-branch changes.

## Executive finding

The plan's strongest call is Thread B's order: fixed-step, then snapshot completeness, then performance and a release gate. Keep that order and make it a hard ownership fence.

The largest missing piece is immediately after it: **072 activates Steamworks, but it does not create a reusable ten-era progression engine.** Current main has no typed, loaded runtime channel for epoch science nodes, the research tree is still a static Frontier list, and `activateEpoch()` explicitly rejects every target except E2. Therefore `072 → ceremony → WP-E3 auto-fires` is not true yet, even though 072 itself has now shipped.

Thread A should be treated as a hard multi-stage product program executed in small slices, not as medium automatic throughput. E3's graph solver is already done; E7's real difficulty is semantic playbook recording and replay rather than Echo tactics; E9 is one of the deepest state/persistence rewrites; and the Press becomes tractable only if its editor and validation kernel accrue from E4 onward.

## Current-state corrections to the published plan

| Published claim | Current-main correction |
|---|---|
| 072 is in flight | 072 is merged and gated at `2d901a9`. |
| E2 content is shipped | E2 contracts/enemies/activation are reachable, but E2 science nodes still have no manifest/runtime socket. |
| E3 power graph is future hard work | The deterministic solver is already merged dormant with 6/6 own gates; gameplay integration remains. |
| Lockstep is proven; only family friendliness remains | 067's observed paused-resync defect is fixed, but actor-scoped actions, established-room join/reconnect, snapshot authority, and full snapshot fidelity remain. |
| Town/Gazette work is ratified and authorable now | Town v2 is ratified and TS-01 is queued; Gazette House remains a `SEED` with two owner/canon choices open. |
| Telemetry is live | The client/routes exist, but the repository still cannot prove a production `TELEMETRY` binding or an ingest-to-readback success. |
| Two spare Max subscriptions are capacity | The runbook says they require owner logins and a runner variant and are explicitly not activated yet. |

## 1. Missing work that blocks “finished”

### F-SOL-MP-001 — [P0] The era spine is E2-specific, not a ten-era engine

**Evidence**

- The plan assumes `072 → E2 ceremony → WP-E3..E10 auto-fire` (`docs/MASTERPLAN-2026-07-10.md:6-7,30-31`).
- `EpochManifest.parts` has an open string index but no typed research reference; `loadEpoch()` does not load research data and `EpochBundle` exposes no epoch research nodes (`src/meta/ContractFamilies.ts:393-418,480-499`).
- The research tree is one static Frontier array (`src/meta/ResearchTree.ts:75-210`); the chart renders those branches plus only a Steamworks active/locked badge (`src/ui/ResearchChart.ts:154-180`).
- `activateEpoch()` requires the next ordered manifest **and** hard-requires `epoch-2-steamworks`, rejecting E3 and every later target (`src/meta/ContractFamilies.ts:562-570`).
- The saga requires three era-named research branches, growing node counts, thresholds, banked overflow, and Continued Study in every epoch (`specs/epoch-saga/README.md:46-48`).

**Impact**

E2 has no era science loop, and a player cannot progress from E2 to E3 through the same data contract. Fires can author E3 art/content references, but they cannot finish a playable E3 or its transition without another attended engine design.

**Required master-plan change**

Insert a generic epoch substrate before active WP-E3: manifest-declared research nodes and thresholds, data-driven megaproject/transition targets, generic activation, replay/migration rules, and one E2→E3 proof. Keep 072 credited as the E1→E2 vertical slice, not the finished spine.

### F-SOL-MP-002 — [P1] Banked bundles are creative banks, not auto-fireable engine specs

**Evidence**

- The saga master says E5–E10 are deliberately looser and each receives its complete bundle specification at build time (`specs/epoch-saga/README.md:1-6,142-143`).
- The repo requires a ratified status, laws, numbered playable slices, integration map, and gates before a spec is executable (`CLAUDE.md:55-60`). Missing specs and design forks are attended/owner work (`CLAUDE.md:63-67`).
- E7's whole engine plan is one paragraph covering action recording, validation, replay, corrupted mutations, Echo, LOS, and flock AI (`specs/epoch-saga/e7-signal-bundle.md:28-31`). E9 explicitly asks for a GT-01-grade substrate spec before its era work (`specs/epoch-saga/e9-redfields-bundle.md:28-31`).

**Impact**

“Auto-fire” is safe for already-contracted art, data, and narrow content slices. It is not safe for novel engine semantics. Spec production, owner decisions, and acceptance design are a hidden critical path currently assigned to nobody in the five threads.

**Required master-plan change**

Add an **epoch engine-specification lane** one epoch ahead of implementation. Each era needs separate substrate, integration, content, transition, and acceptance slices; “one engine slice” is not a credible unit for E4 onward.

### F-SOL-MP-003 — [P0] Thread D is correctness work plus a playtest, not an easy playtest

**Evidence**

- MP-05 is the ratified acceptance gate, not merely a UX outing (`specs/multiplayer/README.md:18-28`).
- Current main collapses all non-movement multiplayer actions to the first actor with any action intent, while build/confirm/weapon edge state remains global (`src/game/Game.ts:696-703,1348-1379,1516-1529`).
- The room joins a new client without the room's current tick, then rejects inputs older than `nextFlushTick` (`functions/api/_multiplayer.ts:168-220`).
- The relay accepts the latest snapshot from any peer as recovery authority (`functions/api/_multiplayer.ts:258-270`).
- The accepted snapshot-v2 brief correctly follows fixed-step and widens capture/restore/hash fidelity (`specs/mp-snapshot-completeness/README.md:1-16`), but it deliberately excludes relay changes.

**Impact**

Simultaneous family actions can suppress each other; late join/reconnect can enter with an invalid tick; recovery can choose a divergent peer. The act of family play is easy. A family-grade multiplayer product is still hard.

**Required master-plan change**

Treat a family session now as discovery only. Formal MP-05 follows fixed-step, snapshot v2, actor-scoped action/edge state, authoritative join/resync, and a green production Worker harness.

### F-SOL-MP-004 — [P0] “Snapshot complete” is not equivalent to “saves are unbreakable”

**Evidence**

- Profile import saves profile metadata, deletes the old profile data, and rewrites keys one by one without rollback (`src/game/ProfileTransfer.ts:87-108`).
- Cloud pushes are delayed by a timer with no page-exit flush (`src/game/AccountSync.ts:149-170`).
- Blank-device recovery can only pull a profile ID already known locally or retained in the session (`src/game/AccountSync.ts:208-233`).
- Save-slot compaction can retain five slots and still exceed the transfer/server budget (`src/game/SaveSlots.ts:183-191`).
- Cloud save version rotation is a non-atomic chain of KV reads and writes (`functions/api/_accounts.ts:190-209`).
- These are the still-live audit concerns `F-SOL-PERSIST-004/008/009` and `F-SOL-TRUST-005/009` (`reviews/sol-findings-persistence-multiplayer.md:81-95,150-178`; `reviews/sol-findings-ai-accounts-trust.md:98-114,164-177`).

**Impact**

Snapshot v2 can make an in-run restore faithful while import, cloud recovery, payload limits, or concurrent saves still lose a family's town. That does not satisfy Thread B's “saves are unbreakable” finish claim.

**Required master-plan change**

Define save completion across five surfaces: versioned run state, transactional import, blank-device family-profile discovery, bounded/flushable cloud sync, and concurrent version recovery. Snapshot v2 is one gate in that program, not its whole scope.

### F-SOL-MP-005 — [P1] Time v1 and generational continuity disappeared from all five threads

**Evidence**

- The binding north star makes visible calendar progression, aging, marriage, children, schooling, succession, and persistent relationships core pillars (`docs/VISION-EPOCHS.md:4-9`).
- Its staged order places Time v1 before E2 and calls for child succession in E2 (`docs/VISION-EPOCHS.md:18-19`).
- The saga says every transition ages the cast and moves children into new roles (`specs/epoch-saga/README.md:25,39-46`).
- 072 owns epoch keys, the Stamp Mill flip, ceremony cards, reachability, and safety; it does not define a calendar or family continuity (`tasks/072-era-activation.md:6-15`).

**Impact**

Without continuity and consent rules, the “generational saga” becomes a sequence of visual reskins, or later work must reinterpret irreversible marriages, births, deaths, and profile histories after they have shipped.

**Required master-plan change**

Restore Time v1 as a named Thread-A prerequisite. The current E2 ceremony may remain a visual/era activation, but no lineage mutation should ship until calendar cadence, representation/consent, permanence, profile divergence, and multiplayer reconciliation are ruled.

### F-SOL-MP-006 — [P1] The plan has no whole-product family acceptance gate

**Evidence**

- Existing gates prove slices and owner ceremonies, not unaided comprehension and return behavior across the combined product (`reviews/sol-findings-governance-scope.md:19-35`).
- First-run guidance stops before a successful building placement or a plain explanation of the human/Prospector partnership (`reviews/sol-findings-product-content-accessibility.md:93-109`).
- Difficulty exists in storage but is not selectable through normal play, and Greenhorn does not soften the whole failure curve (`reviews/sol-findings-product-content-accessibility.md:111-126`).

**Impact**

The factory can ship ten individually green eras while the intended family audience cannot learn, survive, understand the partnership, recover a save, or voluntarily return.

**Required master-plan change**

Add a fresh-profile family gate before scaling E3: unaided Town→board→contract, first successful build, role comprehension, suitable difficulty, return to Town, save/reopen on another session, and voluntary second-session evidence. Era ceremonies remain content acceptance; this is product acceptance.

### F-SOL-MP-007 — [P1] “Finished game” and “public release” are conflated

**Evidence**

- The definition of finished is saga + family multiplayer + self-reporting Town (`docs/MASTERPLAN-2026-07-10.md:4`), but Thread E is also presented as one of the five finish threads (`docs/MASTERPLAN-2026-07-10.md:14-15`).
- The owner already reserved title review, moderation, privacy, and monetization as real public-readiness work (`specs/epoch-saga/README.md:129-132`).
- Accessibility and broad Safari/Firefox coverage remain absent (`reviews/sol-findings-product-content-accessibility.md:194-210`; `reviews/sol-findings-verification-operations.md:107-121`).
- Deployment is not reproducible from one checked-in Cloudflare contract and the current deploy wrapper cannot report authoritative failure (`reviews/sol-findings-verification-operations.md:123-155`).

**Impact**

If public launch is outside “game complete,” Thread E should not distort the completion critical path. If it is inside, the legal hour is not its only hard gate.

**Required master-plan change**

Split two milestones: **GAME COMPLETE** (the plan's line-4 definition) and **PUBLIC RELEASE** (legal/tips, title, privacy/telemetry consent, accessibility, browser matrix, deploy/binding contract, abuse controls, and moderation if public sharing exists).

### F-SOL-MP-008 — [P1] “Self-reporting Town” lacks a production truth gate

**Evidence**

- The plan calls telemetry live and makes a self-reporting Town part of finished (`docs/MASTERPLAN-2026-07-10.md:2,4`).
- Both ingest and public stats require `env.TELEMETRY`; without it they honestly accept-without-store or return an empty payload (`functions/api/telemetry.ts:41-55`; `functions/api/stats.ts:53-62`).
- The tracked backlog says the live namespace was named `ACCOUNTS` while the code reads `TELEMETRY`, with contradictory “blocker” and “unblocked” statements on the same ledger line (`tasks/BACKLOG.md:96`).
- Gazette House is still a `SEED`; its paper name and newsie identity are unanswered (`specs/gazette-house/README.md:1-17`).

**Impact**

An out-of-band binding may exist, but the repository cannot currently prove that a real run becomes a stored aggregate and then appears in the website, Ledger, and Gazette. The Gazette content feed also cannot be queued as ratified work yet.

**Required master-plan change**

Give “self-reporting” one end-to-end release gate: deployed run → stored aggregate → public read → all three windows, with a checked-in non-secret binding contract. Ratify Gazette after TS-01 fixes its plaza anchors; then author GZ-H1.

### F-SOL-MP-009 — [P1 product promise] The plan never decides whether the finished game has a real bounded agent path

**Evidence**

- The brief's strongest architecture promise is an in-browser agent runtime that decides through typed tools; it explicitly forbids faking agent decisions in backend handlers (`docs/GOLD_RUSH_BRIEF.md:195-205`).
- Current gameplay installs a deterministic AgentStub; the audit correctly treats that as a useful fallback but not the promised runtime (`reviews/sol-findings-ai-accounts-trust.md:18-40`).
- Task 070 makes the production Assay UI honest but explicitly leaves the real KV queue/assayer bridge for later (`tasks/070-assay-honest-wire.md:1-12`).
- E7 playbooks and the Press both assume that recorded or described intent can execute through validated, permissioned tools (`specs/epoch-saga/e7-signal-bundle.md:25-31`; `specs/epoch-saga/README.md:113-120`).

**Impact**

The five threads can mechanically reach E10 while the product's differentiator remains a scripted companion and an operator-only crafting pipeline. That may be an acceptable family-first product, but it must be a deliberate finish contract rather than an unmentioned gap.

**Required master-plan change**

Choose before E7: either add a bounded, fallback-safe agent/runtime + deployable Assay/Press queue thread, or explicitly define the deterministic companion and file/operator workflow as the finished scope and narrow product/marketing promises to match.

### F-SOL-MP-010 — [P1 governance] Audit pass 2 is scheduled work, not a finish gate

**Evidence**

- Only eight of 58 Sol findings have a pass-1 disposition; the remaining 50 plus the stopped swarm's cache are still owed dedupe/triage (`reviews/sol-triage-2026-07-10.md:1-15`).
- The master plan says pass 2 is running and that correctives will stream, but it never defines when audit debt is sufficiently closed to call the game finished (`docs/MASTERPLAN-2026-07-10.md:9,30-31`).

**Impact**

The plan could reach its last era with accepted P0/P1 product, persistence, multiplayer, trust, or release findings still open, because “triaged” and “correctives streaming” are activities rather than exit criteria.

**Required master-plan change**

Add an audit burn-down gate: every accepted blocker-severity finding is closed with evidence or explicitly owner-parked with the finish promise narrowed. Re-run a scoped final audit against the release candidate; do not require every P2 polish item to block completion.

## 2. Difficulty calls to change

### F-SOL-MP-DIFF-001 — [P1] Thread A is HARD overall; its content lanes are medium

The `MEDIUM, mostly factory-automatic` label and one-era-per-1–2-weeks forecast only fit content production **after** each era's engine substrate is proven.

- E4 contains vehicle movement/fuel, driver composition, movable cargo, convoy AI, orbit spawns, weather, road mutation, and a moving component boss (`specs/epoch-saga/e4-motor-bundle.md:80-92`).
- E5 contains boat physics, a buildable moving base, deck anchors, diving/air, a storm scheduler, a spline creature, and a competing boss (`specs/epoch-saga/e5-deepwater-bundle.md:41-48`).
- The two integration choke points already concentrate unrelated ownership and collision risk (`reviews/sol-findings-performance-architecture.md:89-104`).
- Production art alone is 65–80 generations for E3, 75–90 for E4, and 80–95 for E5, with two-to-three-week leads (`specs/epoch-saga/e3-voltage-bundle.md:48-49`; `e4-motor-bundle.md:55-56`; `e5-deepwater-bundle.md:24`).

**Changed call:** E4 and especially E5 are hard mini-programs. One-to-two weeks may be a post-substrate content/art cadence, not an all-in era estimate.

### F-SOL-MP-DIFF-002 — [P1] E3's graph core is easier than the plan says; activation is the remaining work

**Evidence**

- The deterministic, id-sorted producer/pylon/consumer solver is already merged dormant and passed 6/6 own desktop/mobile gates (`reviews/e3-power-graph.md:5-20`).
- It currently exists only behind `?debug&power=dev` and does zero work in a plain boot (`reviews/e3-power-graph.md:8-9`).
- The E3 contract still needs placed/cut spans, dynamic downstream darkness, the brown-out ledger UI, light-based spawn behavior, save/hash coverage, and the Crawler drain interaction (`specs/epoch-saga/e3-voltage-bundle.md:72-83`).

**Changed call:** `power graph core = SHIPPED`; each E3 integration slice is `MEDIUM-HIGH`, while the full live-grid package is hard in aggregate. Do not spend a Max-class engine slot re-solving graph theory. The hard part is composing the solver with player-built topology, persistence, lighting, spawns, sabotage, boss drain, and UI.

### F-SOL-MP-DIFF-003 — [P1] E7 is hard, but Echo is not the hardest part

**Evidence**

- Echo is specified as a deterministic hostile base/combat pattern adapted from the player's actual layout (`specs/epoch-saga/e7-signal-bundle.md:10,25-31`), not as an ML opponent that invents tactics.
- Current building diagnostics already expose buildable id/index, tier, HP, and position—enough to ground a layout adapter once snapshot identity is corrected (`src/systems/BuildSystem.ts:41-83,469-520,1315-1342`).
- The current EventBus is ephemeral pub/sub with eight event variants, not a durable semantic action log (`src/core/EventBus.ts:13-110`).
- The tool surface has seven present-day verbs, while AgentStub receipts are retained only as a short feed and full debug memory (`src/agent/ToolSurface.ts:33-107`; `src/agent/AgentStub.ts:125-147`).
- E7 requires record → name → validate → persist → replay, bounded corrupted mutations, execution through permissioned tools, LOS networks, and drone flocks (`specs/epoch-saga/e7-signal-bundle.md:25-31`).

**Changed call:** `Echo layout-to-hostile-combat adapter = MEDIUM-HIGH after snapshot v2 establishes stable identity`; `semantic playbook vocabulary/versioning/validation/replay = HARD/HARD+ and the real E7 critical path`. “Fights like you” must not accidentally become an open-ended tactical-AI project.

### F-SOL-MP-DIFF-004 — [P0 planning] E9 is HARD++, not one hard persistence slice

**Evidence**

- Terrain and tile choice are captured as module constants; sim height is analytic and the render mesh samples/bakes height once (`src/sim/TileHeight.ts:1-61`; `src/world/Terrain.ts:71-88,956-966`).
- LOS caches results with no mutation invalidation contract (`src/sim/TileHeight.ts:28-29,93-134,342-347`).
- The descriptor advertises grid/`heightsRef`, but current sim height consumes only analytic functions (`src/meta/ContractFamilies.ts:372-382`; `src/sim/TileHeight.ts:31-61`).
- E9 mutation must alter routes, spawns, economy, water, and green spread, then survive restart/suspend (`specs/epoch-saga/e9-redfields-bundle.md:15-31`).
- Any sparse terrain delta must fit an already-failing 180/200 KiB transfer budget (`reviews/sol-findings-persistence-multiplayer.md:164-178`).

**Impact**

This spans mutable sim sampling, render updates/normals, LOS/nav/build/water invalidation, deterministic flood staging, multiplayer hash/resync, sparse encoding, migration, and save-slot semantics. A still-open product question is whether loading an old run slot rolls the shared planet backward.

**Changed call:** E9 is one of the deepest engine milestones in the saga and must be multi-slice. Seed the mutation sampling/invalidation/versioning substrate earlier through ED-02 and E4 road grading; E9 should scale a proven substrate across runs.

### F-SOL-MP-DIFF-005 — [P1] The Press is a cross-era program, not an E10 engine task

**Evidence**

- The owner moved Press work to E4+; Layer 3 remains the E10 capstone (`specs/epoch-saga/README.md:113-123,125-132`).
- Current main already identifies the in-game contract editor as the Press's first floor: T0 conversational editing, T1 ED-01..03, and T2 guardrails/kid UX/sharing (`specs/contract-editor/README.md:1-16`).
- Contracts are currently eager build-time imports, while Terrain captures the active contract/tile at module load; live documents/imports are not yet a runtime substrate (`src/meta/ContractFamilies.ts:444-471`; `src/world/Terrain.ts:71-88`).
- The success gate is a 12-year-old creating and iterating a playable adventure unassisted (`specs/epoch-saga/README.md:113-120`), which is a product-usability program, not only UI plumbing.
- E10 also contains procgen world families, aura rendering/audio, era weapon gating, and portrait-history composition (`specs/epoch-saga/e10-deepsky-bundle.md:15-21`).

**Changed call:** if the editor kernel, versioned verb registry, validator, and file import/export accrue from E4, E10's engineering shell becomes medium-high; cross-era verb composition and the unassisted-child acceptance gate remain hard product/UX work. If deferred to E10, Press is harder than HARD and circularly blocks E10's own gate.

### F-SOL-MP-DIFF-006 — [P1/P2] Other calls to move

| Area | Published call | Changed call | Evidence |
|---|---|---|---|
| E8 gravity/air | HARD in Thread A; omitted from the final HARD list | **MEDIUM-HIGH after prerequisites** if it stays planar and reuses E5 air, E3 power/day, and E6 timers. Atmosphere/breach topology, persistence/hash, procgen interior v2, descending boss phases, layered audio, and feel validation keep it above a data-only change. | `CLAUDE.md:24-31`; `specs/epoch-saga/e8-orbital-bundle.md:15-32` |
| Release gate/CI | MEDIUM | **MEDIUM-HIGH until prerequisites are fixed**, then easy-medium aggregation. Worker harnesses do not boot, preview includes dev-only behavior, and deploy truth is fragmented. | `reviews/sol-findings-verification-operations.md:22-89,123-155` |
| Thread D | EASY | The family session is easy; completion remains **HARD** until the correctness findings in F-SOL-MP-003 close. | `reviews/sol-findings-persistence-multiplayer.md:97-149` |
| Era soundtracks | parked low priority | Track generation may stay parked, but **multi-bus audio architecture cannot**: E8 requires interior/exterior/radio layers and E10's Quiet eats channels. Current SoundSystem has one master gain. | `specs/epoch-saga/e8-orbital-bundle.md:3-5,31-32`; `e10-deepsky-bundle.md:10,20-21`; `src/audio/SoundSystem.ts:68-90,243-272,455-469` |

## 3. Sequencing risks

### F-SOL-MP-SEQ-001 — [P0] Fence the active simulation foundation before sim-active E3 and formal MP-05

The next-72-hours line starts WP-E3 while fixed-step and snapshot v2 proceed (`docs/MASTERPLAN-2026-07-10.md:30-31`). Fixed-step owns Loop/Game/Combat cadence and a full feel/regression gate (`specs/sim-fixed-step/README.md:5-22`); snapshot v2 then redefines future-state capture and the multiplayer hash (`specs/mp-snapshot-completeness/README.md:10-16`). E3 introduces new future-affecting graph/light/cut state.

**Safe order**

1. Finish the already-owned fixed-step implementation, reconcile it with then-current main (including 072's `Game.ts`/diagnostic changes), rerun its gates, drain it, and obtain the feel verdict. Earlier branch logs are not current-main gate evidence.
2. Land snapshot v2 and its wider hash.
3. Baseline the **fast sim-touch merge gate** on that simulation law; build the complete Worker/deploy/browser release gate in parallel rather than blocking E3 on all of it.
4. Activate sim-affecting E3 grid/day-night/saboteur behavior and add its state to capture/hash.
5. Run formal MP-05 only after the remaining actor/join/recovery concerns close.

E3 art, data, prompt preparation, Town work, and other render-only/file-disjoint work can continue in parallel. Do not duplicate or touch the active fixed-step branch.

### F-SOL-MP-SEQ-002 — [P1] ED-02, E4 road grading, and E9 terraforming need one mutation API with layered documents

The editor plans a terrain brush (`specs/contract-editor/README.md:10-13`), E4 plans per-run road grading (`specs/epoch-saga/e4-motor-bundle.md:91-92`), and E9 plans permanent world mutation (`specs/epoch-saga/e9-redfields-bundle.md:28-31`). Building three unrelated sampling/invalidation/versioning paths would force E9 to migrate editor maps and E4 roads later.

**Required order:** specify the shared sampling/invalidation/versioning API now, with distinct layers for an authored ED-02 base grid, an E4 per-run road-cost mask, and E9 persistent terrain deltas. Sim integration follows fixed-step; snapshot/hash integration follows the v2 contract. Let ED-02 and E4 prove the API at smaller scope before E9 persists and scales it.

### F-SOL-MP-SEQ-003 — [P1] Runtime asset architecture must lead the next production-art wave

- The current performance baseline is 250 requests / 11.93 MB after ten seconds, driven heavily by sprite frame chunks (`reviews/sol-findings-performance-architecture.md:19-69`).
- The already-generated saga-library art is explicitly raw reference-plate work with no extraction or runtime wiring (`assets/LEDGER.md:106-115,207-211`); the E3 graph review likewise labels its gameplay surface dormant (`reviews/e3-power-graph.md:8-9`).
- Only one art batch may be in flight (`CLAUDE.md:72-73`), while E3–E5 each need two-to-three-week production leads.

**Required order:** set request/byte budgets and the atlas/scene-manifest contract before wiring the next large character wave. Production art runs one epoch ahead; reference generation does not satisfy that schedule and the spare Max accounts do not multiply the image-generation lane.

### F-SOL-MP-SEQ-004 — [P1] Smaller gates that will otherwise bite

- **Gazette after plaza:** GZ-H1 anchors its newsie on the plaza (`specs/gazette-house/README.md:7-10`), while TS-01 moves the plaza and approach anchors (`specs/town-v2-style/README.md:8`). Finish TS-01, ratify the paper/newsie, then author GZ-H1.
- **E6 audit before E7:** E7 is gated on a clean unified decay-tick audit, because replay determinism depends on it (`specs/epoch-saga/e6-atomic-bundle.md:34-35`; `e7-signal-bundle.md:28-31`). Put that audit on the visible critical path during E6.
- **Press layers before E10:** editor/Layer 1 at E4+, conversational iteration after the schema stabilizes, playbook actors after E7, Layer 3 at E10. Do not first open the Press workstream at the capstone.
- **VERIFY before a new writer:** author the release-gate master now and establish its fast merge gate after fixed-step. More implementation lanes before repeatable attribution increase the drain pile, not throughput (`CLAUDE.md:21-22,40,46,69`).

## 4. Where the two spare Max subscriptions buy wall-clock

### F-SOL-MP-CAP-001 — [P1] Use one to remove authoring/review latency and one to remove routine implementation latency

The master plan counts both subscriptions as capacity, but the runbook says activation needs owner logins plus a runner variant and is currently deferred (`docs/runbooks/account-switching.md:44-45`). Treat them as burst options until Robin lifts that ruling. They cannot shorten ceremonies, verdicts, legal, posting, or family play (`docs/MASTERPLAN-2026-07-10.md:17-22`).

| Priority | Subscription role | Highest wall-clock work | Do not assign |
|---|---|---|---|
| 1 | **Spare #2 — batch/audit account** | Pass-2 dedupe of the remaining 50 Sol findings plus swarm results; VERIFY-001 master/gate design; one-epoch-ahead engine spec decomposition; adversarial E7 replay and E9 migration corpora; independent reviews while attended/Fires continue. This matches the runbook's headless batch route and creates ready work without another shared-core writer. | Interactive owner decisions, drains, or final authority. |
| 2 | **Spare #1 — standard implementer lane** | Ratified, file-disjoint routine work: Town v2 after each anchor lands, EN/Gazette after ratification, era data/content, narrow accepted correctives, and later production-art integration. This frees Sol for fixed-step → snapshot → editor/playbooks/persistence. Activate only once the fast merge gate exists and Fires have drain headroom. | Fixed-step duplication, snapshot core, Echo/playbook state ownership, E9 persistence core, or a second writer in `Game.ts`/`RunSuspend.ts`/terrain. |

The topology in runbook §E is correct. The sequencing is the correction: **batch/audit first, extra implementation second**. The factory's own incident record says throughput lives in drains, not deep queues (`CLAUDE.md:40,46`); two extra hot-core writers would spend the subscriptions on merge recovery.

## Minimum critical-path rewrite

1. Fixed-step current-main reconciliation/drain + feel verdict → snapshot v2 → fast sim-touch gate baseline.
2. In parallel: TS-01; audit pass-2 dedupe and engine-spec authoring; file-disjoint performance work (budgets, chunking, atlases, scene manifests); one-epoch-ahead production art. Hot-path diagnostics changes and final remeasurement follow fixed-step.
3. Complete the wider save-safety program: transactional import, blank-device recovery, bounded/flushable sync, and concurrent version recovery.
4. Generic science/activation substrate → E2 science loop → E2→E3 transition proof.
5. Time v1/continuity rules → fresh-profile family product gate. Do not scale E3 content while that combined-product gate is red.
6. Multiplayer actor/join/recovery completion → formal MP-05.
7. E3 active integration; then per-era engine specs, content, transition, and product play gates.
8. E4+: Press/editor Layer 1 and the shared mutation API/layer model.
9. E6 decay audit → E7 semantic playbooks → Echo.
10. E9 persistent mutation at save/multiplayer scale.
11. E10 Press Layer 3 + Quiet/audio → final family gate → audit blocker burn-down.
12. Self-reporting ingest/readback is a GAME COMPLETE gate; public release remains separate unless Robin explicitly puts it inside “finished.”

## READY-FOR-GATES

Review-only artifact is ready for Fable's plan revision. It contains no implementation and does not authorize queueing or source changes.
