# AP-11 — every contract declares its own language (`lane-mechanics-manifest`)

**Slice:** `ap-11-mechanics-manifest` · **branch:** `lane/m3` · **tip:** `87b1a1cd5e514417225d22fc464683913e960892` · **base:** `3747bc5c` (= `088a9138` on main, the s1300 `verifiers-gate-and-stderr` graft)
**Drained by:** s1304 fire, 2026-07-31 · **Master:** `tasks/done/20260731-215132-lane-mechanics-manifest.md` (attended-authored)

## VERDICT: MERGE — with F-1304-1 filed and a corrective queued

The slice's subject is green in **every arm I ran, including the arms that went red**: manifest derivation, five-contract byte-stable determinism, the VIEW rider, and all five player-facing briefing lines all pass. The single red is the test's trailing zero-console rider, and it is a **pre-existing, documented environment class (F-1180-2) newly *observed* by an added assertion, not caused by this diff** — proven below by three interleaved arms, not asserted.

## What it does

`deriveMechanicsManifest(contractId | ContractManifest)` (`src/agent/MechanicsManifest.ts`, new, 152 lines) reads a contract's own data — `tileParams.prePlacedBuildables`, `.river`, `.ford`/`.fords`, `.waterSources`, `.buildZones`, `.stakeMarkers[].lossCondition`, `.lanes.spawnEdges`, and the `twist.*` block — and emits a sorted, deterministic `goldrush.mechanics.v1` object: interactables with their operations, named rules, and wave posting. **Nothing is hand-written**; operations are derived generically from `*Cost` field names (`relightCost` → `relight`), which is what makes the deriver's blindness diagnostic — a mechanic absent from the data is absent from the manifest, by construction, exactly as §AP-11 intends.

Two consumers:
1. **THE VIEW's stable prefix** (`src/agent/View.ts`, +6/−1) gains a `mechanics` key, so a rider reads the claim's vocabulary before it acts.
2. **The player-facing contract briefing** (`src/town/TownScene.ts`, +11) renders one warm line under the geography blurb — `This claim speaks: the river, water crossings.` — guarded to E1 contracts by an epoch membership check.

Five manifests are frozen as `e2e/fixtures/e1-mechanics-manifests.json` (272 lines) for the future assayer diff.

### Mistake #10 — where does the PLAYER see this in a plain boot?

**Answered with an assertion and two screenshots, not a claim.** The new e2e drives a **non-`?debug` boot** (`/?tier=lite` → start menu → enter town → walk to the tavern → open the board) and asserts each of the five briefings against `mechanicsManifestLine(deriveMechanicsManifest(id))`.

| Viewport | Evidence |
|---|---|
| desktop 1280×800 | `reviews/shots-ap-11-mechanics-manifest/desktop-chrome-contract-board-mechanics-line.jpeg` — Tavern Ledger → The Book → *"This claim speaks: the river, water crossings."* |
| mobile 390×844 | `reviews/shots-ap-11-mechanics-manifest/mobile-chrome-contract-board-mechanics-line.jpeg` — same line, wrapping cleanly above GOALS |

## Merge classification

Base `3747bc5c`; **all five files LANE-TOUCHED only**. Verified, not assumed:
`git diff --stat 3747bc5c main -- <the five paths>` is **EMPTY** → main never moved any of them since the lane's base, so the graft is a straight path-scoped checkout with no 3-way needed and no conflict to resolve.

| File | Class | Δ |
|---|---|---|
| `src/agent/MechanicsManifest.ts` | LANE-TOUCHED (new) | +152 |
| `e2e/fixtures/e1-mechanics-manifests.json` | LANE-TOUCHED (new) | +272 |
| `e2e/agent-view.spec.ts` | LANE-TOUCHED | +127 |
| `src/agent/View.ts` | LANE-TOUCHED | +6 −1 |
| `src/town/TownScene.ts` | LANE-TOUCHED | +11 |

`lane/m3`'s other ahead-commit, `3747bc5c`, is the **already-merged** s1300 slice (tip-graft residue) and was deliberately not re-landed.

## §3.0 block check

`node scripts/drain-block-check.mjs 20260731-215132-lane-mechanics-manifest.md` → **`? UNKNOWN — no goal leaf matches`** at **rc=0** on arrival. That is F-1303-2, and it is why s1303 declined this drain. s1304 **registered the leaf first** (`00e70f3d`, `ap-11-mechanics-manifest` under `multiplayer/agent-play`, status `building`), then re-ran: **`✅ CLEAR — lane-mechanics-manifest.md [ap-11-mechanics-manifest] status="building"`**, matched by name.

## Evidence

All playwright commands `--workers=1` (§3.1 / F-1270-1). Machine load stationary throughout: `5.67 / 5.39 / 5.07`.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean**, no output |
| `npm run build` | **green, 1.99 s** (`✓ built in 2.01s`; asset-diet 235 GLBs 592.2 MB → 92.8 MB) |
| Slice spec, both projects | **5 passed / 1 failed** — see F-1304-1 |
| Slice spec, subject only (`--grep "briefing speaks it"`, both projects) | **2 / 2 PASS** |
| Adjacent battery (5 specs, both projects) | **34 passed / 6 failed — all six fingerprint-matched known-reds** |

### Adjacent set — DERIVED by grep, not inherited

Grepped `e2e/` for the symbols this diff actually changes (`stablePrefix`, `contract-board-briefing`, `briefing-geography`, `renderContractBriefing`, `MechanicsManifest`). The broad `town-open-board` sweep returned 38 files; the precise question returned **five**, and I gated all five plus `second-rider` (the other VIEW consumer):
`contract-briefings` · `town-t3-board` · `ed-03-placement-validator` · `e10-river-boot-guard` · `second-rider`.

The six reds, each matched to `logs/suite-red-inventory.md` by test name, project, **and** failure text:

| Spec | Line | Fingerprint (mine) | Inventory row |
|---|---|---|---|
| `ed-03-placement-validator` | `:18` | `expect(received).toBe(expected) // Object.is equality` | `:125`–`:126`, BOTH |
| `ed-03-placement-validator` | `:169` | `Test timeout of 90000ms exceeded.` (`waitForEvent "load"`) | `:127`–`:128`, BOTH |
| `second-rider` | `:96` | `TimeoutError: page.waitForFunction: Timeout 20000ms exceeded.` | `:212`–`:213`, BOTH (10.6% flake) |

`contract-briefings`, `town-t3-board`, `e10-river-boot-guard` — the three specs that actually render the surface this slice modified — are **fully green on both projects**.

## Findings

### 🟡 F-1304-1 — the new zero-console rider is ORDER-DEPENDENT ACROSS PROJECTS, and it is the F-1180-2 class, not this slice

`e2e/agent-view.spec.ts:283` fails its closing `expect(errors).toEqual([])` on **mobile-chrome only, and only when the desktop project's full file has run first in the same worker**. The errors are 8 × `THREE.GLTFLoader: Couldn't load texture blob:http://127.0.0.1:5188/<uuid>` — nothing else.

**The measurement is the finding.** Three arms, same tree, same shell, same hour, all `--workers=1`:

| Arm | Command | n | Result |
|---|---|---|---|
| A | full file, **both** projects | **3** | **3/3 FAIL** — mobile `:283` only |
| B | full file, `--project=mobile-chrome` | **2** | **2/2 PASS** |
| C | `--grep "briefing speaks it"`, **both** projects | 1 | **PASS** (2/2 instances) |

Arm B alone would have justified *"flaky, ignore"*. Arm C is the one that names the mechanism: running **both** projects but only the new test **passes** — so the poison is not "the desktop project ran", it is the heavy preceding `:342` seeded-rider boot (`?debug&nowaves&nolevel&nopause`) exhausting something in the persistent chromium, after which the next town entry's texture blobs fail to decode. **`:342` is a pre-existing test this slice does not touch.** The new test is merely the first assertion positioned to see it.

**Not this diff, proven not assumed:** the diff adds one `<p>` element and one plain JSON object; it touches no asset path, no renderer, no GLTF loader. And in the failing arm **the board still renders the correct line** — the manifest, VIEW and all five briefing assertions pass; only the trailing error-array comparison fails.

**Documented class, cited:** `THREE.GLTFLoader: Couldn't load texture blob:` is **F-1180-2** (`tasks/BACKLOG.md:424`, load-sensitive, "absent from the red map… the next full-suite comparison will read it as a NEW red and mis-attribute it"), and it recurs in `reviews/blocked-storage-boot.md:91`, `reviews/m3-05b-run-ledger.md:50`, `reviews/gg-01b-welcome-release-gate.md:42`, `reviews/gg-03c-herald-art-dev-path-weight.md:99`, and `tasks/BACKLOG.md:295/297/1766/2151`. F-1180-2's own prediction is that the next comparison mis-attributes it — this drain is that comparison, and it did not.

⚠️ **But it is DETERMINISTIC in the prescribed gate shape, so merging it puts a reliably-red test on main.** That cost is paid down two ways in this same commit: a row in `logs/suite-red-inventory.md` so no future fire can mis-attribute it, and a corrective queued to lane-a (`lane-a-f1304-1-manifest-view-console-rider.md`) that narrows the rider to ignore **exactly** this documented transient while still reddening on any other console error. The corrective deliberately does **not** attempt the underlying renderer-determinism cure — F-1083-2 rules that "diagnosing renderer determinism is not fire-authorable".

### 🔵 F-1304-2 — the master shipped without a goal leaf (closed by this drain)

Recorded for the pattern, not for blame: `lane-mechanics-manifest.md` was queued and run with no `tasks/goals.json` leaf, so §3.0's first command returned UNKNOWN at rc=0 — a word that means *bookkeeping is missing*, dressed in the exit code that means *cleared*. It cost one full fire of drain throughput (s1303 correctly declined). Registered at `00e70f3d`; **closed**.

## Non-blocking notes

- The briefing line is E1-gated by `loadEpoch(DEFAULT_EPOCH_ID).contracts.some(...)`. Correct for this slice (the fixture covers exactly the five E1 contracts), but it means E2+ contracts silently render no line — worth a deliberate ruling when the era doors open, not a defect today.
- `mechanicsManifestLine` pluralises by appending `s` to a humanised id (`lantern_post` → `lantern posts`). Fine for the current vocabulary; the first irregular noun will need a lookup.
