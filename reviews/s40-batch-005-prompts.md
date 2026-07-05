# s40 — batch-005 prompts lane (doc/LEDGER/contract; zero src)

**Scope shipped**
- `assets/requests/batch-005.md` — NEW: 5 prompts (3 props gray-key, 2 one-shot FX flourish sheets ff00ff 3x2), 2 candidates each, measured QA gate (batch-007 discipline), canon §9.2 bloodless-poof constraint baked into the death prompt, blank claim tag (no-text law).
- `assets/layer-contracts/m1-core.layer-contract.v1.json` — +2 rows: `vfx.death_poof`, `vfx.levelup_flourish` (DORMANT, slots-before-prompts §7.1; compact one-line style preserved, diff = 2 rows).
- `assets/LEDGER.md` — queue entry 6 rewritten (PROMPTS WRITTEN s40, queued behind batch-007); slot board: prop row source corrected batch-004→batch-005, +1 vfx flourish row.

**Gates run (doc-adjacent lane, one runtime-touching file)**
1. JSON validity: `JSON.parse` + node parse pass, 12 slots, order preserved.
2. Consumer audit — the contract is bundled (`Terrain.ts:2` `?raw` import). Proof of inertness: `Terrain.ts:385–391` does `slots.find(entry => entry.slot === assetSlots.terrainBank)` inside try/catch with hardcoded fallback — by-id lookup, no slot iteration, no eager-load by filename. `SpriteAnimator.ts` reads `characters.v2.json` (untouched). No file in `e2e/` or `scripts/` reads this contract (grep). Appended rows are unreachable code-side until a wiring slice names them.
3. Consistency re-read: filenames/slot ids identical across request ↔ contracts ↔ LEDGER ↔ `slots.ts:10–12`; prop sizes match contract [512,512]; extractor flags (`--key ff00ff --grid 3x2`, default gray, `--deshadow`) all exist per LEDGER process notes.
4. Tree: only the 4 intended paths (+ this review) differ.

**Boot probe: WAIVED, with cause.** VM was recycled — every warm env (`~/gr`, `/tmp/gr*`, npm cache, chromium) is owned by `nobody` and unreadable; a full rebuild for two provably-inert dormant rows fails proportionality for a 15-min fire. Rider for the next fire that builds for any reason: its boot probes retroactively confirm this (expected: zero delta — the rows are dead data until wired).

**Env/debris notes**
- Stale `.git/index.lock` (0 B, ~30 min old) blocked the lock commit → renamed `.stale` per s9af DELETE LAW.
- NEW mount behavior this fire: git cannot unlink its own lock/tmp files (`index.lock`, `HEAD.lock`, `objects/tmp_obj_*`, `maintenance.lock`) — every git op strands debris. Recipe: `mv` each to `*.stale` after every git command; Mac janitor sweeps. `git checkout -- <file>` also fails (unlink) — restore via `git show HEAD:<path>` + in-place write instead.

**Decisions (orchestrator authority, noted for Robin — none block)**
- Flourishes specced as 3x2 one-shot sheets on magenta (sheet convention since batch-003), 2 candidates not 3 (decoration budget).
- Flourish slots live in m1-core contract (char/vfx home), DORMANT mirroring bld.portrait precedent; CombatVfx procedural stays live (placeholder-first).
- batch-005 stays queue 6 BEHIND batch-007 (§7 enemy > decoration) — prompts ready ≠ send; one batch in flight.
