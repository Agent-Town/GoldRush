# lane-baron-props-detail — F-BW-18: the Baron's luggage earns his coat

**Slice:** `tasks/lane-baron-props-detail.md`
**Branch:** `lane/perf` (lane-d) · **Tip commit drained:** `bec2b387`
**Merge-base:** `823999527279053f214ccf93f8aafd6b0565bd79`
**Drained by:** s1443 fire, 2026-08-03
**Verdict:** ✅ **MERGED FULL** — with one verified, owner-facing finding (F-1443-3) that no gate could have caught, recorded loudly below.

## What it does

The owner, gate walk 2026-08-03, verbatim: *"His objects (the rockets and the stone) are not optimal right now, but I can also not exactly say how to improve them."* The master's answer to an owner who cannot name the fix was **the craft names it** — apply the boss-detail bar to his props.

**What "the stone" turned out to be** (the master demanded this be identified, and the answer is genuinely good): it was never a thrown boulder. The Baron is authored as a *wrecker*, so he inherited the generic wrecker carry marker — `new THREE.DodecahedronGeometry(0.23, 0)` under `sackGeometry`, rendered for every active wrecker. At the run camera that shared brown low-poly sack read as a stone. The Baron now opts out (`carryMarkerVisible` gains `enemy.eliteKind !== 'baron'`) and carries a dedicated iron-banded timber powder keg. Other wreckers keep their sack.

Three meshes ship in one deterministic GLB (banded timber-and-brass shoulder launcher with three exposed powder rockets, the powder keg, and the detailed in-flight rocket), built by a committed Blender script.

| Prop | Triangles | Ceiling | Result |
|---|---:|---:|---|
| Launcher | 2,020 | 3,000 | PASS |
| Rocket | 876 | 3,000 | PASS |
| Powder keg | 704 | 3,000 | PASS |

One 512×512 atlas, one material, three named meshes. GLB SHA-256 `88ae8e3e…43a7`, atlas `fac23e02…b9ea84`. The loader validates named meshes, shared material and exact triangle counts before replacing the placeholder, and falls back to the placeholder on load failure.

## Evidence

All playwright `--workers=1` (§3.1). Gates in detached worktree `gate-s1443b` (§3.0b), removed after.

ⓘ **Port, stated correctly this time (see F-1443-4):** these gates ran on **5188**, playwright's configured default (`playwright.config.ts:4`). `PORT` is not a knob the config reads; scratch ports need `GR_CAPTURE_BASE_URL`. 5188 was verified FREE by `lsof` before gating, and playwright's `webServer` started `npm run dev` with cwd = the gate worktree. **Positive proof the right tree was served:** the own spec asserts the new GLB props mounted *without* the wrecker stone — impossible on main — and it passed.

| Gate | Result |
|---|---|
| `drain-block-check.mjs` | **UNKNOWN** — no goal leaf (rc=0 by DEFAULT, **not** a clearance, §3.0). Registered at drain — F-1443-1 |
| `npx tsc --noEmit` (gate tree) | **rc=0**, 3.9 s |
| `npm run build` (gate tree) | **rc=0**, 15.2 s wall / **975 ms** vite build |
| Own spec `lane-baron-props-detail` | **2/2 PASS** — desktop 3.7 s, mobile 3.8 s |
| Adjacent battery (8 suites, derived BY GREP) | **108 passed / 4 failed / 8 skipped**, 10.7 min |
| **Control run, clean main, same worktree/server/port** | same two titles red; `:186` both projects, `:656` desktop | 
| `npx tsc --noEmit` (merged **main** tree) | **rc=0** |
| Own spec on merged **main** tree | **2/2 PASS** — desktop 4.1 s, mobile 4.2 s |

Runner's own perf table (Baron beauty harness, live mid-volley), ceiling +15%: desktop **10.3 → 10.3 ms p95 (0.00%)**, mobile **9.8 → 9.9 ms p95 (+1.02%)**. PASS.

### The 4 reds are pre-existing — proven by control, not argued

Both failing titles live in `e2e/restore-validation.spec.ts`, which entered the adjacent set **because it references `blastCharge`** — a file this slice edits. That adjacency is exactly why a control was mandatory rather than optional.

| Failure | Merged tree | Clean-main control | Inventory |
|---|---|---|---|
| `:186` "page-load restore materializes run-manager state…" → asserts at **`:32`** (`assertNoErrors` → `consoleErrors`) | FAILS desktop + mobile | **FAILS desktop + mobile** | `logs/suite-red-inventory.md:203` — records `:32`, **exact inner-line match**, ~25% flake (F-1297-1) |
| `:656` "active megaproject wrecker references survive strict normalization…" → asserts at **`:708`**, `root.hero.position.y: 0.14559222393281415 != 0.2763519114255905` | FAILS desktop + mobile | **FAILS desktop**, mobile passed | `logs/suite-red-inventory.md:201-202` — records `:708` with the **byte-identical error string**; `:472` records **88.1% (52/59) both projects** |

`:656` passing once on mobile in the control is consistent with its recorded 88.1% rate, not evidence of a difference — and the merged arm is not *worse* than a suite that already fails ~9 runs in 10.

⚠️ **`:186` was the one that had to be checked at the content level, because this slice loads a NEW GLB and that assert is a console-error assert.** A failed load of `baron-props.glb` would land there. It did not: the 9–11 console errors are all `THREE.GLTFLoader: Couldn't load texture blob:http://127.0.0.1:5188/<uuid>` — the documented F-1436-1 texture-blob class, anonymous blob URLs, present identically on clean main. The new GLB is named nowhere in them, and the own spec proves it loads and validates.

ⓘ **`e1-baron.spec.ts` was 12/12 GREEN on both projects.** The runner's report claimed *"20/22 PASS; both projects stop at the same pre-existing contract-board census assertion on line 350"*. **That did not reproduce here at all.** Recorded because it is the second inherited claim this fire that measurement contradicted — neither was load-bearing, but both would have been repeated as fact by a drain that trusted the report.

### Deferred coverage, stated rather than silently capped

The grep also matched `072-era-activation`, `e7-arsenal`, `m1-06-level-up-choices`, `release-frontier`, `research-chart`, `research-impact-law`, `ss-02-beats` — all on the broad `rocket` token (research/era text), none touching the volley VFX, blast-charge or carry-marker paths this slice edits. They were **not run** and are **not claimed as green**. The runner independently reports `release-frontier` 6/6 and the two release configs 28/28 + 4/4 green; that is its evidence, not mine.

## Merge classification

| Path | Class | Handling |
|---|---|---|
| `src/entities/pools.ts` | **BOTH-MOVED** — main moved +54/−30 since merge-base (s1440 perf **plus this fire's own boss-bar merge**, `43ba0ed9`); lane +1/−1 | **3-way graft**, clean auto-merge; regions disjoint |
| `src/game/Game.ts` | **BOTH-MOVED** — main +93/−8; lane +95/−1 | **3-way graft**, clean auto-merge |
| `src/systems/BaronVolleyVfx.ts`, `src/entities/BlastCharge.ts`, `src/vite-env.d.ts`, `e2e/lane-baron-props-detail.spec.ts`, `assets/pilots/baron-props-3d/**`, `artifacts/baron-props/**` | LANE-TOUCHED | applied |

**Both sides verified surviving, not assumed.** All **52** of main's substantive added lines in `Game.ts` are present in the graft, **0 missing** (checked line-by-line, not by eyeball). In `pools.ts`, this fire's own boss-bar markers (`BOSS_BAR_HEAD_ANCHORS`, `bossBarOrientation`, the Mistake #6 comment, `quaternion.identity()`) and s1440's perf markers (`renderedLightFactors`, `lightDimmingSources`) are all **PRESENT** alongside the lane's carry-marker guard.

**The graft carries zero drift:** graft numstat across all six source paths is **identical** to the lane's own `bec2b387^..bec2b387` numstat, and reproduced when the decided merge was applied to main.

## Firewall

TOUCH-ONLY was *prop assets + mount wiring + contract JSONs + specs*; NO was *fight behavior, the Baron SPRITE, volley cadence*. Damage, targeting, cadence and impact timing are untouched — `057-baron-rocket-cart` is 12/12 green including the determinism and lethality cases, and the Baron sprite is not in the diff. See F-1443-3 for the one place the boundary is arguable.

## Findings

- 🟡 **F-1443-3 (VERIFIED, non-blocking, OWNER-FACING — the Baron's rockets no longer show where they will land).** `BlastCharge.sync()` gains an early return for owner ids prefixed `baron_rocket`, which calls `hide(index)` and skips `syncTelegraph()`. **Read at the code, not inferred:** `syncTelegraph` draws two things — the flight arc *and* a ground circle at the **target**, at the **blast radius**, at `MARKER_Y = 0.07`, refreshed every frame while the charge is in flight (`BlastCharge.ts:286-299`); and `hide()` zeroes that slot's line buffer (`:325-330`). So the incoming-blast **ground footprint is gone for Baron rockets only**. The runner's report describes this as replacing "the generic full-path wire presentation" and does not mention the target ring. **What the player still gets, verified:** the Baron's pre-launch arming telegraph is intact and tested (`057-baron-rocket-cart.spec.ts:255-257` polls `telegraphActive` and asserts the `blast-charge-arm` sound — **green both projects**); the detailed rocket visibly arcs to its target with a trail; and `BaronVolleyVfx.impact()` still lands a dust ring on the ground — but **on landing, not before it** (`BaronVolleyVfx.ts:203-209`). **Why this is not a merge block:** damage, cadence and timing are unchanged, the primary warning survives, the change is deliberate and inside the visual remit the owner asked for, and it is reversible in four lines. **Why it is not silence either:** losing a landing footprint is a legibility question a gate cannot answer and no test asserts. ➡️ **OWNER: on your next Baron walk — can you still tell where a rocket will land? If not, restoring the ring for `baron_rocket` while keeping the new mesh is a small corrective.**
- 🟡 **F-1443-1 (bookkeeping):** no goal leaf; `drain-block-check` answered UNKNOWN at rc=0 by default. Registered `e1-baron-props-detail` merged. Same debt as this fire's other drain — see that review for the seven-fire pattern.
- 🟢 **F-1443-4 (method, cured):** my first review this fire claimed "scratch port 5199". `PORT` is not read by `playwright.config.ts`; the runs used 5188. Corrected in `928695ad` with the reasoning intact. Recorded here because the mistake was mine and the next fire should not inherit a scratch-port habit that does not work.
- ⓘ **Non-finding, noted:** `assets/pilots/baron-props-3d/baron-props.blend1` is a Blender auto-backup (479 KB). It is not debris to delete under the RETENTION LAW and it is already in the lane's history; landed as-is.

## Player-facing (Mistake #10)

Plain boot, no `?debug`: reach the Baron contract at wave 20. He carries a banded timber-and-brass launcher with three visible powder rockets on his shoulder and an iron-banded powder keg at his hip — no brown low-poly lump. His volley now throws a banded rocket with a short ash/ember trail instead of a wire arc. Boards: `artifacts/baron-props/comparison/desktop-props-and-flight.png` and `mobile-props-and-flight.png` (390px), with exact mid-volley side-by-sides alongside.
