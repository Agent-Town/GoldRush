# THE CHARTER PRESS — the machine that builds worlds (E10's ending; the Foundry's product; the kids' builder)
STATUS: DRAFT 2026-07-17 (attended-authored at owner order: "What about E10 and the Charter Press? That seems like a major tough one?" + earlier owner direction: "We even will build the level editor at the end... that would then be a potential product/engine that can be used for the next game"). Ratification questions batched at bottom. The e10-deepsky bundle owns the era staging (T10, the lever, THE RIVER); this spec owns the ENGINE and the layer ladder.

## What this is
A charter = a playable map, authored by a player, stamped by the Press. E10's last science node opens it; the ceremony is a child's hands under the hero's hands on the lever; the first charter is A RIVER, and the credits roll into it, playable. The same machine is the engine-as-product: the editor that could build the next game. Three layers, one ladder: **L1** the descriptor/inspector substrate (PARTIALLY LIVE on main — src/editor/ behind ?editor) · **L2** the full editor (terrain brush, palette, gizmos, validator — banked as sol/ed-02..05 spikes) · **L3** the kids' builder (the child-height lever).

## The laws (each kills a named way editors eat projects)
1. **CHARTERS ARE CONTRACTS (the anti-two-formats law).** A stamped charter compiles to the EXACT contract schema the shipped fifteen use — same tileParams, same mask truth, same loader path. One species of map, forever. The Press edits the same truth the factory ships; there is no "editor format." (This law is why the Press is also the Foundry's showcase.)
2. **THE VALIDATOR IS THE GATE.** Nothing stamps unless it runs: masks legal, spawn edges reachable, objectives present, budgets inside bounds (ed-03's placement validator grows into `stampCharter()`'s preflight). A charter that stamps, PLAYS — the no-crash-class-escapes law. Property-tested, not example-tested.
3. **THE CHILD-HEIGHT LEVER (Layer 3 law).** The kids' mode is choose-not-configure: pick a land, pick a story, pick who visits, press. No numbers, no blank canvas (every charter begins from a living template), no failure states, undo always, and nothing loved is deletable without the same warmth the game shows everywhere else.
4. **RECORDING IS PROGRAMMING'S SIBLING (the E7 bridge).** Charters and playbooks share the provenance envelope (author, date, lineage); a charter may EMBED playbooks as map content (a patrol taught by demonstration becomes an inhabitant's habit). Playbook-core's laws apply unchanged inside the Press.
5. **DETERMINISM + PERSISTENCE COMPOSE.** A charter declares its seed policy; TileStateStore treats a charter exactly as a shipped map — a child's river can keep its dug canals. "It's your claim now" means yours-that-STAYS (the reset-ache law extends to made worlds).
6. **IN-FICTION ARRIVAL AT E10; UTILITY EARLIER, GATED.** The tool exists debug-side today (?editor); layers go player-facing only by owner word; T10 (four hands, one lever) is the canonical public unveiling. The story blesses the tool; the tool never spoils the story.
7. **BOUNDED PALETTE v1.** First stamp speaks E1 vocabulary only (the proof target IS the ending: the child charters a river — E1's claim at dawn). Eras unlock as palette packs, each a small slice, never a rewrite.

## The slices (risk-first, like everything on this ladder)
- **CP-00 — SPIKE HARVEST (task authored, executable now):** audit the four ed-* branches against main's current src/editor; per branch: HARVEST (re-land clean behind ?editor), RE-LAND (stale but wanted — fresh implementation citing the spike), or RETIRE (superseded; archive per lifecycle). Exit: main's editor = best-of-spikes, fully debug-gated, plus the honest map of what L2 still lacks.
- **CP-01 — THE CHARTER SCHEMA (the make-or-break slice):** the charter envelope (provenance, seedPolicy, paletteId) + the compiler to contract JSON. GATE: THE ROUND-TRIP — a shipped contract imported as a charter and re-stamped must emerge byte-equivalent. If this slice holds, law 1 holds forever; if it can't, we learn it here for the price of one slice.
- **CP-02 — THE VALIDATOR GATE:** productize ed-03 into the stamp preflight; fuzz placements (property tests: no generated charter that stamps may fail to boot).
- **CP-03 — THE LOOP:** edit → stamp → PLAY (a stamped charter launches as a real run) → return to the Press. The dogfood milestone: the day the factory can build one of its own maps inside the Press, the product is real.
- **CP-04 — LAYER 3:** the child-height lever per law 3 — template-first, three choices and a press. Isolated from L2 so kid-UX iteration never destabilizes the tool.
- **CP-05 — THE RIVER:** author E1's-claim-at-dawn AS a charter, in the Press, and make it the post-credits payload. The ending, dogfooded. (If the Press can print THE RIVER, T10 is not a cutscene — it is a demonstration.)

## The named risks (what makes this "the major tough one," and where each dies)
Schema drift → dies at CP-01's round-trip gate. · Validator gaps (stamped-but-broken charters) → die under CP-02's property fuzz. · Scope creep (editors eat projects) → dies against the layer ladder + bounded palette + one-slice-one-gate. · Kid-UX misfires → contained in CP-04's isolation. · Fiction spoilage (the tool leaking before the story) → law 6.

## Integration map
Touches: src/editor/** (grows), a new charter module (envelope+compiler), the contract loader (READ path only — it already loads the schema charters compile to), ProfileStorage (charter shelf, profile-scoped). Reuses: playbook-core envelope (PB-01+), TileStateStore (TP-00), the 15 shipped contracts as import fixtures. NEVER touches: sim semantics, the shipped contracts' bytes, single-writer laws.

## Ratification questions (owner, batched — none block CP-00/01)
Q1. Palette v1 = E1 only (recommended)?
Q2. When does any layer go player-facing (recommend: L2 stays ?editor until after E5 ships; L3 decision belongs to the E10 push — the story's unveiling)?
Q3. Charter sharing/export — **ANSWERED (owner 2026-07-18, verbatim: "I think we don't have to park charter sharing/Q3 or park the co-op. We are fully in the process of finishing things up. So lets also work on that.") → CP-06 THE POST authored + queued (export file + paste-code import, full validator gate on import, lineage honesty; no server ever).**
Q4. Does the Press live as meta-menu tool, in-fiction hall, or both (recommend: meta now, the hall joins at E10 — same machine, two doors)?
