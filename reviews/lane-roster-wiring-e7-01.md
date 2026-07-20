# Review — lane-roster-wiring-e7-01 (E7 Signal-era roster scaffold)

- **Slice:** E7-01 enemy roster scaffold — `rogue_automaton` (plain lane) + `data_rustler` (lane+thief), placeholder-first.
- **Branch/tip:** lane/perf `a4af3f4b` (`runner(lane-d): lane-roster-wiring-e7-01.md`), base `e67e266a` (author commit).
- **Drain commit:** (this commit) — path-scoped onto clean main `0f06002a`.
- **Fire:** s764, 2026-07-20.

## Verdict: MERGE ✅ (scaffold; placeholder-first, NO-BLOCKER law)

## What it does
Wires the first two E7 (Signal-era) enemies into the game as **data-driven roster rows**, mirroring the shipped E6 template `74a10b8c` id-for-id — the DATA-SHAPED scaffold only, decomposed per CLAUDE.md §7.5 to remove the partial-rejection risk s762 named:
- **Slots** (`slots.ts`): `charE7RogueAutomaton` / `charE7DataRustler`.
- **Generated bindings** (`generated.ts`): both slots point at the bandit walk8 placeholder — the swap to real `char-e7-*` art is one path change later.
- **Layer contract** (`characters.v2.json`): two slot entries; `frames.files` name the eight real cells `char-e7-{rogue_automaton,data_rustler}-sheet-walk8-r{0,1}c{0,1,2,3}.png` — **this PINS the Batch R-E7 sheet-filename convention** so the later art batch has a target (the unpinned convention is what forced E6's art recovery pass).
- **Pool binding** (`pools.ts`): `processedE7SpriteCells` glob + `e7SpriteBindings` map + `e7EnemySpriteBinding(id)` (placeholder=true until processed cells match); binding-resolution + `createEnemySpritePresentation` extended for e7 ids.
- **Balance** (`Balance.ts`): `e7Roster.variants` — `rogue_automaton` (hp 1.2 / spd 0.9 / scale 1.0 / contact 1.0 / tint `#5b8a8a` broken-teal) + `data_rustler` (hp 1.0 / spd 1.1 / scale 1.0 / contact 0.8 / tint `#c4883a` copper, `thief: true`). No `mixes` block (base waveMin filter suffices for 2 enemies).
- **Contracts** (`epoch-7-signal/contracts.json`): `twist.enemyRoster` rows added to the 4 E7 contracts (relay-valley/echo-canyon: both; dead-band: data_rustler only; relay-rush: data_rustler→rogue_automaton). `static_hare` omitted everywhere (deferred).
- **WaveSystem** (`WaveSystem.ts`): `e7RosterVariant(id)` helper + `e7-` stat-fallback seam; e6 mix branch byte-intact, e7 flows the base no-mix path.
- **Spec** (`e2e/e7-roster.spec.ts`, new): era-gating, roster stats/thief/cure-only-death, plain no-debug Signal boot, and a `renderer.calls <= 200` draw-call assertion.

## Evidence table
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean (merged tree) |
| `npm run build` | ✅ green, 1.29s |
| `e2e/e7-roster.spec.ts` | ✅ **6/6** desktop-chrome + mobile-chrome (incl. draw-call ≤200 + no-debug boot at :158) |
| `e2e/e6-roster.spec.ts` (regression) | ✅ **6/6** both projects — E6 Atomic roster NOT regressed |
| `e2e/vp-02-sprite-animation.spec.ts` (adjacent) | ⚠️ 10 failed / 12 passed — **fingerprint-matched pre-existing reds** (see F-1) |
| Draw-call law (`lazy:true`) | ✅ e7 batches route through `createEnemySpritePresentation`→`GeneratedSpriteBatch(... lazy:true)` (pools.ts:137/141), mirrors baron/E6; e7-roster spec asserts renderer.calls ≤200 |
| Console/page errors | ✅ zero (e7-roster :158 plain-boot probe green both projects) |

## Merge classification
Base `e67e266a`; main tip at drain `0f06002a`. Between base and main only **STATUS.md** moved (s763 handoff + s764 lock) — every content file is **LANE-TOUCHED-only**, no 3-way needed. STATUS.md = MAIN-MOVED, **not** merged (main's kept). Path-scoped `git checkout lane/perf -- <8 content files + 2 artifacts>`. The lane's stale STATUS.md hunk (captured pre-s763-handoff) was deliberately excluded.

## Findings
- **F-1 (non-blocking, adjacent-suite reds — PROVEN pre-existing).** `vp-02-sprite-animation.spec.ts` shows 10 failures on the merged tree. Fingerprinted against **clean main** (files restored to HEAD, full re-run): clean main = **13 failed / 9 passed**; merged = **10 failed / 12 passed**. The merged failing set `{350,447,506,541,699}×{desktop,mobile}` is a strict **subset** of the clean-main set `{303,350,382,447,506,541,699}×{...}` — E7-01 introduced **zero new failures** (:382 warmed-clip draw-calls and :303 hero-clip-on-sim-time are additionally flaky, passing on the merged run). All failures are hero-rotation / missing-sheet-fallback / screenshot-capture tests — none touch enemy-roster batches. Not caused by this slice; carried as a standing vp-02 hero-rotation baseline-red debt.
- **F-2 (non-blocking, downstream content gap — owner note).** Codex flagged "NOT READY-FOR-GATES" for one honest reason: `src/meta/ContractFamilies.ts:1125` redirects every E7 contract to The Claim because their `harvestAnchors` are empty, so a plain boot of an E7 contract renders the Signal-era **fallback** map, not a true E7 map — the placeholder screenshots (`artifacts/lane-roster-wiring-e7-01/`) show that fallback. This is **out of this slice's firewall** (terrain/contract routing content) and pre-existing. The roster data is correct and proven by the manifest-driven e7-roster spec; the enemies will appear once the E7 maps get their `harvestAnchors` (a future E7-map/terrain slice). Recorded for that slice — does NOT block the placeholder-first scaffold (NO-BLOCKER law, owner 2026-07-18).

## Deferred (untouched — confirmed byte-absent this slice)
`corrupted replay` mechanic (sample+misorder route beats — E7-02 owed) · `static_hare` 0.35x flock (E7-02) · `the_echo` boss (`lane-e7-boss.md`). No `src/playbook` edits, no boss hook, no mix scheduling.
