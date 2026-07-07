# Drain review — SS-01 beat-engine ⑤ + tile-identity-pass (E1)

**Slice/branch/tip:** `lane/polish` @ `e3bfb91` (tip); two stacked commits landed:
- `07ea885` story: add beat engine (SS-01)
- `e3bfb91` feat: add E1 tile identity descriptors (tile-identity-pass)
**Merge base:** `9c6b693` (pre-s176-E2). **Landed onto:** main @ `7bbb7a7` (s177 lock, tip = 08b336f E2 foundation).
**Fire:** s177. **Verdict:** ✅ PASS — merged clean via 3-way, one additive-union conflict resolved.

## What it does
**SS-01 (story beat engine):** adds a `src/story/` module (StoryRuntime, beats, signals, speakers, seenState, settings, index) that fires one-shot narrative beats — founding, first-contract, Prospector-XP — as portrait story cards. Wired through `Game.ts` (`emitStorySignal`), `main.ts`, `TownScene.ts`, `Hud.ts`, `ProspectorPanel.ts`, `StartMenu.ts` (Tales on/off setting), `ProfileStorage.ts` (seen-state persistence), `story.css`. A "Tales" setting silences beats at the queue level; a pointer glow clears on first interaction; a story card defers until the wave banner clears when both fire the same tick.
**tile-identity-pass:** adds place-descriptor types to `ContractFamilies.ts` (ContractHeightfieldDescriptor, ContractPaletteDescriptor, ContractScatterDescriptor, ContractGravelBar, ContractWaterDescriptor, ContractBuildableFixture) and wires them into `Terrain.ts`, `Scatter.ts`, `Water.ts` + `assets/contracts/epoch-1-frontier/contracts.json`, so E1 contracts (Dry Gulch, Night Shift, Twin Banks) render distinct terrain/scatter/water identity while The Claim keeps its default seeded fingerprint.

## Merge classification (base 9c6b693; main drifted ahead with s176 E2 drains)
Two-way `main..lane/polish` is polluted (shows E2 files as differing — main added them post-base). The **3-way merge** is authoritative: applies only the two commits' delta.
| File | Class | Resolution |
|------|-------|------------|
| src/game/Game.ts | both moved | AUTO-merged (E2 rail imports + SS-01 story import union, no conflict) |
| src/vite-env.d.ts | both moved | AUTO-merged |
| src/meta/ContractFamilies.ts | both moved | **CONFLICT** — HEAD added RailPath{Point,Descriptor} (E2), lane added tile-identity descriptors, both inserted after ContractStakeMarker. Resolved as additive union: kept both, closed RailPathDescriptor with its own `};`. Verified ContractManifest intact below. |
| src/story/*, Terrain/Scatter/Water, contracts.json, e2e specs, artifacts | lane-only | clean apply |
| Economy.ts, RailPath.ts, WaveSystem.ts, e2-* specs, reviews, BACKLOG, STATUS | main-only | kept at main's version (lane unchanged vs base) — **no E2 regression** |

Staged set audited pre-commit: 24 src/e2e/assets files + 32 artifacts (ss-01, tile-identity, e1-dry-gulch/night-shift/twin-banks only). Zero E2 src touched. Pre-existing working-tree noise (logs/dashboard.html, e2-pressure/e2-rail/e2-stamp/e1-baron artifacts) left unstaged.

## Evidence (merged tree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (baseline main also clean) |
| `npm run build` | ✓ built 250ms, dist emitted |
| ss-01-beats.spec.ts | **8/8** (desktop 4 + mobile 4) |
| tile-identity-pass.spec.ts | **4/4** (desktop 2 + mobile 2) |
| e2-pressure-economy.spec.ts | 6/6 (adjacent, no regression) |
| e2-rail-entity.spec.ts | 6/6 (adjacent) |
| e2-stamp-mill.spec.ts | 2/2 (adjacent) |
| e1-dry-gulch.spec.ts | 12/12 (adjacent — tile-identity shared files) |
| e1-night-shift.spec.ts | 10/10 (adjacent) |
| e1-twin-banks.spec.ts | 10/10 (adjacent) |
| **Adjacent total** | **46/46** both projects |
| Boot probe | clean epoch-1 boot asserted green (e2-pressure epoch-1 HUD test) + founding beat fires in plain contract play (ss-01) — zero console/page errors in-suite |

Gate run via `playwright.s177.config.ts` (vite preview on :5237, --workers=1, desktop-chrome + mobile-chrome 390px).

## Player-visible check (Mistake #10)
- SS-01 beats: player sees portrait story cards on founding / first contract / Prospector XP in normal play (ss-01 spec exercises no-`?debug` founding path). "Tales" toggle in StartMenu settings.
- tile-identity: player sees distinct terrain/scatter/water per E1 contract (Dry Gulch spring, Night Shift lantern dark, Twin Banks two-bank) — the identity render shots are the evidence.

## Findings
- **F-177-1 (non-blocking):** `ContractFamilies.ts` conflict was a benign additive union (two feature branches each declaring new types at the same anchor). No semantic overlap. Resolved and tsc-verified. No corrective needed.
- Pre-existing dirty working-tree artifacts (e2-pressure/e2-rail/e2-stamp/e1-baron/blast-relief/audio-integration/profile-first-boot/run-suspend PNGs + logs/dashboard.html) predate this fire and were left untouched (not this drain's concern; likely prior gate-run regens).
