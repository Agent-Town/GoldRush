# Twin Banks run 11: braid follows production water truth

2026-09-25, HM-06 run 2. **READY-FOR-GATES: HM-06 implementation complete.** Full project acceptance is not claimed: the drain-owned pin/status checks and two controlled pre-existing browser tests remain red.

The mounted pilot already had two ribbons. This change makes the production mask their authority, replaces the guessed source reach with the declared 4 × 4 m pool inside the existing confluence draw, and makes fallback water follow the mask. It does not add duplicate ribbons, lights, textures, simulation rules, or asset changes. Rectangular shallows join the shallow sheet; polyline shallows use the existing ribbon constructor. Twin Banks currently declares zero separate shallows regions.

The fallback builds the two piecewise-linear bands with round joins/caps, the source rectangle, and the declared ford shapes. Geometry is batched into the existing river draw; fords retain their shallow draws and animation. Masked river material no longer invents a ford at x=0. Offset mask fords use local UVs for their fade. The legacy maskless path is retained.

## Evidence and acceptance

- [Plain entry boards: 1280](board-entry-glance-1280.png), [390](board-entry-glance-390.png); [ordinary return view: 1280](board-plain-1280.png), [390](board-plain-390.png). Before/after use the same seed, viewport, HUD, and normal launch without a debug query or test hook. Zero console/page errors in all acceptance boots. These are unfrozen player views; story timing and water/sprite animation are not credited as improvements.
- [Braid diagnostic: 1280](board-braid-1280.png), [390](board-braid-390.png); [source pool: 1280](board-source-pool-1280.png), [390](board-source-pool-390.png). Diagnostics are labelled separately from plain entry. The pool probes are asserted in-frame. The pool and exterior continuations remain one mesh, with the guessed interior reach replaced rather than overlaid.
- [Fallback geometry proof](geometry-proof.json): **14,336 samples, zero wet/dry disagreements** against `Terrain.sample`; centre and both bar anchors are bank, walkable, and not buildable. [Fallback before](fallback-e1-twin-banks-1280-before.png) / [after](fallback-e1-twin-banks-1280-after.png) are isolated fixed-time water-construction captures, not ordinary game boards.
- [Legacy construction proof](legacy-proof.json): **10/10 exact PNG and geometry/material hashes**, at 1280 and 390 for the Claim, Night Shift, Baron, Dry Gulch (no river), and e10-river. These isolate the unchanged legacy river/ford surfaces; they are not a claim that independently timed whole-game screenshots are byte-identical.
- [Walk traces](walk-proof.json): **8/8 pass**, zero hero river samples. From either bank at x=0, the hero stops at z=±3.610993. At both fords the hero reaches z=6.040760, with 260 ford samples per crossing. Both projects' unmodified enemy-routing assertions pass with the existing corrected east spawn (17,14).
- [Paired hardware performance](performance-summary.json), [all frames](performance-paired.json): three interleaved runs per arm and width, 180 frames each, Apple M4 Max through ANGLE Metal, same seed and settled run camera. Desktop p95 median **9.0 → 8.7 ms (−3.33%)**, draws **95 → 95**. Phone **9.2 → 9.2 ms (0%)**, draws **65 → 65**. The four pilot water draws remain four; the unchanged beauty budget test also measures exactly +4 against `nochannelwater` at both widths. No new water draw.
- [Payload before](baseline-payload.json) / [after](payload.json): **34,346,281 → 34,349,803 B**, **+3,522 B**, under **52,000,000 B**. No asset bytes added.

**Visual verdict: candidate is less wrong.** The fallback now exposes the dry plait instead of flooding it; the mounted source reach follows the declared rectangle. The mounted braid was already present and is not claimed as new artwork. **Plain-entry composition remains a camera/HUD hold:** the phone glance reveals a homestead; neither that view nor the return-to-hero view exposes the whole braid. The separate river-station board proves water geometry, not full plate fidelity. No camera/HUD change is authorized here.

## Sculpt and floors

**No sculpt cut or re-bake was necessary.** Fresh samples from the mounted delivered GLB (`renderSource=glb`, `heightSource=baked-grid`) read north bed **−0.452156 m**, south **−0.315686 m**, centre plait **+0.259180 m**, west/east gravel-bar anchors **+0.711866 / +0.658148 m**, and ford shelves **−0.028718 / −0.046048 m**. Both cuts are below the water plane and the plait/bar sites above it. The measured bodies, mounts, stones and collision bytes remain unchanged. These grounding measurements apply to the mounted sculpt; the fallback’s pre-existing height function and decorative bar placement are outside the water-surface edit and remain unchanged. [Samples and mount diagnostics](after-capture.json); [protected-source and asset hashes](invariants.json).

`node scripts/null-floor-anchors.mjs --check` exits **0: 83/83 floors match**, including all three Twin Banks seeds. The printed eraStamp mismatch is explicitly provenance-only. **No floors moved.** `null-floors.json` and `assets/engine-era.json` are untouched; the drain owns the final same-era pin on the merged tree.

Store branch `astra/hm-06-braid` is clean at **5793a967da46e8f00c0ba16f92f17dc10d36558d** and was pushed. There is **no new store commit**, since no asset needed editing.

## Checks and precise limits

- Pre-flight: lane `sol/map-art-campaign-2`, baseline **d4c0207c35cc857dc83bd7dda4967d1f29ae6683**, no ahead commits or uncommitted source. Exempt `logs/guard-stats.jsonl` retained. Install and initial build passed; npm's own 30-line lockfile churn restored. No pre-existing evidence discarded. Test-generated landmark-collision PNGs were copied under `_raw/` and their tracked originals restored; new out-of-scope test screenshot directories were moved under `_raw/`. Store was already on the run-1 branch at main; detached at main, then reset the requested branch as instructed.
- TypeScript, `npm run build`, and `GR_RELEASE=e1 npm run build`: **PASS**. [Build](build.log), [E1 build](release-build.log), [tsc](tsc.log). Initial union-type errors were corrected by typing the constructor's structural region view; the final targeted type guard also passes.
- Required five dev specs, both projects, `--workers=1`: **52 passed / 2 skipped / 2 failed**. [Final transcript](final-e2e.log). Four stale band assertions disappear. Both remaining failures have pre-task controls, below; no out-of-scope assertion is weakened.
- E1 release harness, `-c playwright.release.config.ts --workers=1`: **30/30 pass**. [Transcript](release-e2e.log).
- Targeted same-game audit, landmark-collision rows and worker type coverage: **13/13 pass**. [Transcript](target-node-guards.log).
- The two authorized tests and both-ford enemy route were rerun on the clean server: **6/6 pass**; see [focused transcript](final-focused-e2e.log).

## Full node battery and drain boundary

The final `npm run test:node-guards` ran with **Node 26.4.0**, as pinned by `.nvmrc`: **1,009 passed / 5 skipped / 4 failed / 0 cancelled**, exit 1. [Canonical transcript](node26-guards.log). The same-game audit passes, including every contract and the final door verbs; the Twin Banks headless driver consumes both crossings/build zones and secures wave 20. A separate canonical [landmark-collision run](node26-landmark-collision.log) also exits 0.

The four failures are fully named:

1. `bench-seeds`: the registry still pins **91dd025ed5e01410a9095d72db2669ccbffd930e4fc7067cc21455618938145f**, while the candidate is **c63def1bfc493e243f31b9b115344ec6e3aacd57075554ec6a2ce872dfd90bef**.
2. `engine-era-guard`: the candidate hash is not yet recorded in era 6. This is the explicitly drain-owned same-era pin, not an authorized lane edit.
3. `fixture-teardown`: its child `bench-seeds` check fails on that same pin; it is not an independently discovered resource leak.
4. `desk-declaration-guard`: the lane's tracked `STATUS.md` line 1 differs from current main. The task forbids updating that status; the gate must run on the integrated main corpus.

The shell initially selected Node 23.11.1. Earlier broad logs contain its file-level timeout semantics, contention, and a transient type error during implementation; they are not the final canonical verdict. Node 26 removes those timeout/cancellation failures. Since the canonical npm chain exits at its first battery, later `&&` subcommands are not claimed to have run. The separately requested landmark rows are covered by the explicit check above. No protected pin, floor, task, spec, or simulation rule was edited to force a green gate.

### Existing browser reds and harness corrections

1. **Reed motion:** desktop `beauty-twin-banks` “the reed field is alive in a still frame” fails both baseline and candidate. The unchanged probe expects >60 moving bank pixels after 600 ms. This is outside the two authorized tests. [Exact baseline transcript](baseline-e2e.log), [candidate](final-e2e.log).
2. **Seeded diagnostics boot race:** the unchanged test takes its snapshot before waiting for mounted GLB height. It compares hero Y **0.02688779068849728** (fallback) with **0.3672938919067383** (mounted). The identical mismatch reproduces **10/10** on the exact saved pre-task renderer source, five repeats per project. [Control transcript](stable-baseline-control.log), [baseline transport server](baseline-server.mjs). The proxy retains source bytes and only rebases Vite's optimized-dependency URL; timing changes expose the existing missing readiness wait.
3. A development HMR run failed scatter grounding because bare dynamic imports and hot imports saw different terrain module state. Both unchanged tests pass after a clean server restart, and in the final full battery. [Clean restart control](scatter-clean-server.log). An earlier focused camera probe was interrupted by an in-progress edit; it is not acceptance evidence.
4. Saved Vite dependency hashes expire on restart. The A/B transport rebases only those cache URLs and preserves raw baseline source separately. Failed transport attempts are not counted as plain boots or performance samples. Diagnostic source-pool captures wait for the normal entry glance to finish, then assert their subject in frame.

## Remaining list in order

1. Drain: run integration gates, re-record/check floors as required by the HM law, and append the same-era engine pin on the merged tree with the HM-06 cause. This slice changes none of the 83 pinned outcomes; no value changes are expected from re-recording alone.
2. Test owner: address the pre-existing reed-motion assertion and the seeded diagnostic's missing mounted-height readiness wait. Their protected tests were not changed here.
3. Camera/HUD owner: full paired-bank entry composition remains held as in run 10; the mask/render repair does not resolve that separate hold.

Implementation commit: **96fc2b9ce**. Evidence/report follow in a separate path-scoped `feat:` commit.

[Run 1 stop record, preserved](report-run-1.md). The run-2 task expressly lifted that constructor firewall.
