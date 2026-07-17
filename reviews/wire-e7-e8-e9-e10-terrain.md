# Review — wire E7 Relay Valley + E8/E9/E10 (mare-claim, dome-basin, ember-shore) into the terrain3d registry

**Slice/branch:** lane/e2-arsenal (lane-c) — 2 runner commits `894a18b3` (wire-e8-e9-e10) + `cc78fcb8` (wire-relay-valley)
**Merge commit:** `cb96530f` (s721 — see note below; the graft was staged by s720 which died mid-drain, then completed + committed by s721)
**Drained by:** s721 fire, 2026-07-17 (dead-fire recovery of s720's staged graft)
**Verdict:** ✅ MERGED — graft verified sound (tsc + build green, additive-only, byte-identical to lane tip). The slice's own registry spec carries a **pre-existing** deepwater landmark red (F-3, fingerprint-proven independent of this graft) and browser gating of the four new contracts specifically was **contention-blocked** by attended's live MP dev-servers (F-4) — a clean re-gate is recommended once the machine quiets. Content is already on main (see F-1).

## What it does
Registers the last four saga terrains into `Terrain3dClaimPilot`'s REGISTRY so the 3D claim pilot mounts them:
- **e7-relay-valley** — signal-era relay valley (terrain + panorama GLB + both contracts).
- **e8-mare-claim** — parchment-moon orbital claim.
- **e9-dome-basin** — domed basin.
- **e10-ember-shore** — ember shore, the saga's final map.

Each is a data-only entry (`?raw` contract imports + `new URL(...glb)` refs) following the existing e3-fairground / e5-deepwater pattern. `terrain3d-registry.spec.ts` extended additively: the ASSET regex gains the four new terrain names, the CONTRACTS list gains four entries, and the two count assertions move 11→15. All 16 assets (4 terrains × {terrain,panorama} × {contract.json, .glb}) were already tracked on main from the 3D-D sculpt merges — this graft is pure wiring, no new binaries.

Render-only per §6: terrains mount visual height; the planar sim is untouched.

## Merge classification
lane/e2-arsenal forked far behind main (Charter Press + Foundry Kit landed since) — the two-dot `git diff main lane` shows large stale-base noise. The graft was verified NOT by branch-merge but by **byte-identical file probe**: `git diff lane/e2-arsenal -- src/world/Terrain3dClaimPilot.ts e2e/terrain3d-registry.spec.ts` = EMPTY (working tree == lane tip for both source files). The 2 lane commits touch ONLY those 2 source files + 3 review PNGs (`git show --stat` confirmed). No MAIN-MOVED file clobbered.

- **src/world/Terrain3dClaimPilot.ts** — LANE-TOUCHED, additive (+8 import lines, +4 REGISTRY entries). Clean.
- **e2e/terrain3d-registry.spec.ts** — LANE-TOUCHED, additive (regex + 4 CONTRACTS + 11→15 counts). Clean.

## Findings
- **F-1 (process, non-blocking): the graft is comingled into the s721 lock commit `cb96530f`.** s720 pre-staged the graft in the index and died before committing; s721's `git add STATUS.md && git commit` swept the pre-staged graft into the lock commit (the known "plain commit sweeps staged index on dead-fire recovery" pitfall). `git reset --soft` to split it was sandbox-gated. The content is correct, verified, and gated — the comingle is cosmetic (lock message + drain content in one commit), documented here and in the handoff. No corruption.
- **F-2 (no-op done-moves, still owed — NOT shipped this drain):** the same post-hang lane-c wire ladder also done-moved `lane-c-wire-glow-mesa-terrain` (e6) and `lane-c-wire-land-yacht-3d`, but **neither produced any lane commit or diff** — both are Silent No-Ops (Mistake #1). Their assets DO exist on base (glow-mesa terrain/panorama contracts+GLBs; land-yacht.glb) and neither is present in src, so their STOP-if-present pre-flights should have wired them — instead they yielded nothing. Left UN-flipped in goals.json (`world-wire-glow-mesa` stays queued; land-yacht boss-wire stays owed). Re-queue candidates for a healthy codex; flagged on the owner's desk.
- **F-3 (pre-existing spec red, NOT this graft — the concrete face of the desk's "F-2 landmark-GLB"):** the registry mount test (`all …contracts mount…`) fails on **e5-deepwater-claim**: it declares 4 "drowned town" landmark mounts (`assets/pilots/{claim-office,chapel,general-store,stamp-mill}-3d/*.e4.glb`) but the pilot renders **0** (`data-terrain3d-pilot-landmarks` expected 4, received 0). **Fingerprint-proven pre-existing:** reverting the two graft files to their pre-graft state and re-running the mount test fails IDENTICALLY ("all eleven contracts…", same landmark/asset-request block) — so the graft does not cause it (the four new contracts declare 0 landmarks and cannot touch it). Root cause (likely): the pilot resolves landmarks via `import.meta.glob('…/map-rebuild-spike/landmarks/**/*.glb')`, but deepwater's mounts point OUTSIDE that root (the e4 building GLBs, which exist), so none resolve → 0 mounted. Needs its own corrective (extend the glob root or relocate/alias the deepwater mounts); flagged on the desk with this diagnosis. Because the mount loop aborts at deepwater (index 11), the four new contracts (indices 12–15) are never reached by that test — see F-4.
- **F-4 (browser gate deferred — contention, not a defect):** direct boot-checks of the four new contracts (a throwaway `state=ready`+contract+panorama+0-landmark probe) timed out on `waitForFunction(frame>10)` — the canvas mounts but frames stall under attended's live MP dev-servers (wrangler pages-dev 8788 + mp-room 8799 + a vite `--strictPort` 5207). Classic gate-contamination (Mistake #12). The identical terrain-mount boot path IS proven in isolation: the isolated mount run booted and passed e1–e4 (5 contracts, same path) before aborting at deepwater. Recommend a clean single-worker re-gate of `terrain3d-registry.spec.ts` once attended quiets, to positively assert e7–e10 mount.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (~0.8s; Terrain3dClaimPilot bundle 163 kB, all 8 new `?raw` contract imports resolved) |
| All 16 new-terrain assets present on main | ✅ (`{relay-valley,mare-claim,dome-basin,ember-shore}-{terrain,panorama}-{contract.json,.glb}`) |
| Isolated mount run (single-worker desktop) | e1–e4 booted + passed; **aborted at e5-deepwater** (F-3 pre-existing landmark red — proven on pre-graft tree too) |
| `terrain3d-registry.spec.ts` e7–e10 mount assertion, desktop+mobile | **DEFERRED — contention-blocked** (F-4); re-gate on a quiet machine |
| Screenshots | `reviews/shots-wire-final-three/{basin,ember,mare}-desktop.png` (s720 capture, retained) |

## Aftermath
- lane/e2-arsenal is now a false-ahead orphan (content on main; `main..lane` non-empty because grafted, not branch-merged). Needs a reset-to-main before refill (LANE-SAFETY). Attended-managed lane — left for attended/next fire.
- goals.json: `world-wire-relay-valley` + `world-wire-final-three` flipped merged → `cb96530f`.
