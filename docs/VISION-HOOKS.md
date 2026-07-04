# Vision hooks (Robin, 2026-07-04) — design-now, build-later (§10 M7+ pattern)

## Multiplayer ladder (each rung stands alone)
1. **Human + agent co-op** — IS M4 (lane B running). The two-actor model everything else grows from.
2. **Many actors, one machine** — M6 recruited agents already gives "multiplayer with agents" locally (playbook-driven actors through the SAME typed tool surface).
3. **Online co-op (2-4 humans + their agents)** — milestone-class (post-M6). Our three pre-built advantages, now BINDING invariants no lane may break: (a) Economy event log = single replayable truth (state-sync model exists today); (b) typed tool surface = the only action API (tools are network-serializable commands BY DESIGN); (c) sim on fixed timestep, render decoupled. Keep these and netcode is an adapter, not a rewrite. Break them and multiplayer dies in the crib.
4. **Modes/mods ("Bombman" etc.)** — buildable defs + Balance knobs + wave scheduler are already data; a mode = manifest (def subset + knob overrides + win condition). Cheap post-M5.
5. **AI-generated UGC maps** — maps = seed + layout contract; M5's law (generator proposes, typed contract + validation disposes) extends verbatim from items to maps. UGC is M5's pattern at map scale.

## True-3D question (world, not characters — characters stay ADR-001 sprites)
The game IS 3D (scene/camera/lighting); flat READ comes from tile ground + billboard buildings. If depth is wanted: **2.5D relief pilot** — ONE building (Sluice Works) as procedural mesh (BufferGeometry in-repo, no Blender/gen-3D dependency) + NPR engraved-ledger shader (sepia ramp + hatching), judged in-game against its billboard. Art direction law: the Frontier Ledger look survives or the pilot dies. Parked behind M2-07 + M3/M4 scaffolds; pull card = "vp-3d-pilot".

## North star (Robin, 2026-07-04): family co-op + family-authored adventures
Robin wants to play this with his children, and wants the family to modify the game together — "make our own adventures." Design implications, effective now:
1. Canon holds (illustrated never gory, warm even when tense) — for teens this is a TASTE line, not a protection line: storybook + cool coexist when the craft is high (Cult-of-the-Lamb precedent, we stay warm). Quality of execution is what earns the line respect.
2. CORRECTION (Robin): the kids are 12 & 14, HARDCORE gamers — the bar is not simplicity, it is being WOWED. Design bar: craft + depth, zero condescension. What earns teen-gamer respect here: (a) feel — snappy, precise, zero jank (juice yes, shake no); (b) depth — upgrade synergies and build variety worth theorycrafting (M3), skill expression in kiting/base layout; (c) challenge — endless scaling + local leaderboard rivalry (top-5 exists; add per-player stats in co-op later); (d) the WOW CARDS nobody else has: directing a real AI agent mid-run (M4), and SIBLING-AUTHORED adventures — they build brutal challenge modes to defeat each other's runs (agent-composed, validation-bounded). M4 UX still needs clarity (receipts, clean verbs) — clarity is craft, not childproofing.
3. "Our own adventures" end-state: adventure authoring THROUGH the agent — describe the adventure in words, the agent composes a mode manifest + map layout within validation contracts (M5 law at adventure scale). The mode-manifest substrate (rung 4) is what family adventures compile to; keep it human-readable.
