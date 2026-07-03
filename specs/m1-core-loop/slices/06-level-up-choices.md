# m1/06-level-up-choices

**Contract:** kills become levels; every level is a 3-card choice that visibly changes the run. The roguelite moment works.

**Seam:** `src/game/Progression.ts` — consumes XP from motes; `need(L) = 12 + 8(L−1)`; threshold → `GameState 'levelup'` (sim + wave clock frozen — sim-time rule from M0 means zero drift); `rollOffer(rng): [UpgradeDef ×3]` — seeded `core/Rng.ts`, 3 distinct, weighted, non-maxed, `beacon_dynamo` only offered once a beacon stands; `applyUpgrade(id)` mutates `StatSheet` only (additive % stacking on `Balance` base — the one stacking rule). Pool = the 9 defs in the M1 README (names are the charm — patent-office inventions). `src/ui/UpgradeOverlay.ts` — 3 parchment cards (§4.1/§4.3: one composition, obvious primary action), click or `1/2/3`, apply → resume. Debug `X` grants 50 XP (gated).

**Playable checkpoint:** level ~once per wave; pick Split Spark and *see* the second bolt immediately.

**Verification:** GATE-STD; e2e: `X` → overlay visible, sim frozen (enemy positions static across 500 ms), press `2` → `state === 'playing'`, chosen stat delta in diagnostics, **wave clock un-drifted after resume**; offer deterministic under fixed seed; no duplicate cards; maxed upgrades never offered (forced-stack probe); screenshot-critique of overlay (parchment cards, readable, delightful).

**Deps:** 02. ∥ with 03/05.

**Firewalls:** upgrades mutate `StatSheet` only — never `Balance`, never entity internals, no new combat mechanics beyond `volley`. Overlay is DOM-only. No reroll/banish (M3 candy).
