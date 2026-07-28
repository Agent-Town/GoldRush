# Task lane-b-claw-2x-triangle-billing-diagnosis: the Mare Claim scene bills the Salvage Claw's triangles exactly 2× per frame — name whether that is a legitimate second pass or a double-submit (LANE-B, commit prefix "perf:")

**FIRE-AUTHORED s1195 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

**THIS IS A DIAGNOSIS TASK. IT SHIPS A VERDICT AND ITS EVIDENCE — NOT A FIX.** Even if you prove a real
double-submit, you must **not** repair it here (see NO). The ledger has waited for a *name*, not a patch.

READ FIRST:
- `AGENTS.md`
- `docs/bench/boss-duel-perf-table.md` — **the whole file**, especially the table and "Anomaly 1".
- `src/systems/SalvageClawBossSystem.ts` — the mount path (`:478-501`) and `inspectModel` (`:504-525`).
- `src/systems/DredgeQueenBossSystem.ts` — the same two regions, as the 1× control.
- `src/world/LightRig.ts:120-140` (the sun + its shadow camera) and **`:167-170`**, where
  `renderer.shadowMap.enabled` and `sun.castShadow` are both gated on `quality === 'soft'`.
- `scripts/bench-boss-detail-sol-performance.mjs` — the existing harness whose pattern you extend.

CODEX: gpt-5.6-sol effort=medium

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(Measured by the authoring fire at 2026-07-29T04:3xZ: `lane/m4` was **1 ahead at `db322ee2`**, whose five own paths — `e2e/cp04-lever.spec.ts`, `src/meta/ContractFamilies.ts`, `src/meta/ContractUnlock.ts`, `src/vite-env.d.ts`, `tasks/runs/20260729-000631-*.md` — return an **EMPTY `git diff db322ee2 main --` over exactly those paths**, i.e. all five are byte-identical to main ⇒ SAFE DUPE, reset is loss-free. ⚠️ **Do not be alarmed by the two-dot `git diff main lane/m4`, which shows ~150 `D` rows: those are MAIN's newer commits against a stale base — phantom deletions, not lane deletes.** The authoring fire could not probe the worktree's dirt (its shell gate blocks `git -C` into a worktree), so **the uncommitted-edits half of the pre-flight above is yours to run and is not pre-cleared.*)*

## Why (a finding that named itself fire-investigable, and has sat unactioned)

`tasks/BACKLOG.md:1666`, verbatim:

> F-CLAW-2X (fire-investigable, from the perf run): the Mare Claim scene counts the Salvage Claw's
> triangles EXACTLY 2x per frame (both claw arms: scene-tri delta = 2x asset delta; queen scene counts
> 1x). Could be legit (shadow/extra pass on claw only) or a double-submit. **One fire should read the claw
> mount path + renderer.info accounting and name which.**

**The arithmetic was re-derived from the published table by the authoring fire, not inherited:**

| scene | asset Δ | scene-tri Δ | ratio |
|---|---|---|---|
| claw-detail-opus5 vs claw-shipped | 30,100 − 10,164 = **19,936** | 161,438 − 121,566 = **39,872** | **2.000** |
| claw-detail-sol vs claw-shipped | 34,540 − 10,164 = **24,376** | 170,318 − 121,566 = **48,752** | **2.000** |
| queen-detail-opus5 vs queen-shipped | **21,292** | 129,416 − 108,124 = **21,292** | **1.000** |
| queen-detail-sol vs queen-shipped | **31,144** | 139,268 − 108,124 = **31,144** | **1.000** |
| queen-unbound-solu vs queen-shipped | **762,636** | 870,760 − 108,124 = **762,636** | **1.000** |

Two claw arms at exactly 2×; **four** queen arms at exactly 1×, including one at 762,636 triangles. These
are not noisy ratios — they are exact integers, which is why this is worth a fire.

**Two facts the authoring fire established that KILL the most obvious hypothesis, so you do not spend the
run on it:**

1. **The mesh flags do not discriminate.** `SalvageClawBossSystem.ts:519-520` sets
   `mesh.castShadow = true; mesh.receiveShadow = true` — and `DredgeQueenBossSystem.ts:582-583` sets
   **exactly the same two lines**. So "the claw casts shadows and the queen doesn't" is **false at the
   mesh level**, and any explanation must live somewhere else.
2. **There is exactly one shadow-casting light, and it is gated.** `LightRig.ts` creates a single
   `DirectionalLight` (`LedgerLowSun`, `:69`) at `(-28, 18, -22)` targeting `(4, 0, 8)`, with a **bounded**
   shadow camera (`near 0.5`, `far 76`, `left/right/top/bottom ±48`). At `:167-170`, **both**
   `renderer.shadowMap.enabled` and `sun.castShadow` are set to `quality === 'soft'`.

⇒ The live hypotheses are: **(A) LEGIT** — the claw sits inside the sun's shadow-camera frustum and is
therefore submitted twice (shadow map pass + main pass) while the queen sits outside it, or is otherwise
excluded from the shadow pass; or **(B) DEFECT** — the claw model is genuinely submitted twice in the main
pass (a double `add`, a retained stale clone, or a second render call). **Your job is to say which, with
evidence that would survive someone re-running it.**

## Scope

1. **Reproduce the anomaly before explaining it.** Stand up a dev server on a **scratch port** (5243 —
   not 5188, which lane worktrees share, and not 5237) and sample `renderer.info.render.triangles`,
   `.calls`, and the scene's own asset triangle count for **both** production contract scenes:
   `e5-deepwater-claim` (queen) and `e8-mare-claim` (claw). Report the raw numbers.
   **If the claw does not reproduce ≈2× and the queen ≈1×, STOP** (see STOPs) — the finding would be
   stale or load-dependent, and that is a real, publishable result.

2. **Rule out a literal double-add — read the scene graph, do not reason about it.** With the claw scene
   live, traverse `scene` and count (a) how many `Object3D`s are named `SalvageClaw3d`, (b) how many
   distinct `THREE.Mesh` instances carry the claw's geometry, and (c) their summed triangles. The mount at
   `SalvageClawBossSystem.ts:490` is a single `this.group.add(scene)` guarded by a `modelLoadSerial`
   check, and `inspectModel` **rejects** any model that is not exactly 3 meshes / 1 material /
   `MODEL_TRIANGLES` — so a double-add would be a surprise. **Report the counts either way**; "exactly one
   instance, 3 meshes" is the expected and useful answer.

3. **THE DECISIVE EXPERIMENT — turn the shadow pass off and re-measure both scenes.** Drive the quality
   setting so `quality !== 'soft'` (which flips both `renderer.shadowMap.enabled` and `sun.castShadow` to
   `false` at `LightRig.ts:167-170`) and re-sample scope 1's counters on **both** scenes.
   - **Claw 2× → 1× while queen stays 1×** ⇒ hypothesis **(A) LEGIT**: the second billing is the shadow
     map pass. Say so plainly.
   - **Claw stays 2×** ⇒ hypothesis **(B) DEFECT**: a genuine double-submit that shadows do not explain.
     Say so plainly, and say what scope 2 saw.
   - Anything else (e.g. the *queen* also halves) ⇒ report it; that would mean the queen is *also* in the
     shadow pass and the 1×/2× split has a different cause entirely.
   **Prefer driving the existing quality setting over editing `src/`.** If and only if no runtime path can
   reach a non-`soft` quality, you may take the measurement by toggling `renderer.shadowMap.enabled` from
   the page's console/`page.evaluate` — **a runtime toggle, still not a `src/` edit.**

4. **Explain the asymmetry you found.** If (A), report the concrete reason the queen escapes the shadow
   pass — the most likely candidate is the **shadow camera frustum**: log each boss's world position and
   bounding box against the sun's `±48 / far 76` volume and say whether each is inside or outside. If the
   frustum does *not* explain it, keep looking and report what does (or report honestly that you could not
   name it — an unexplained asymmetry, clearly labelled, is better than a guessed one).

5. **Publish the verdict.** Append a short **"F-CLAW-2X resolved: <LEGIT|DEFECT|UNRESOLVED>"** section to
   `docs/bench/boss-duel-perf-table.md` — the one-line answer, the before/after shadow-pass numbers, the
   scene-graph instance counts, and a pointer to your run report. Keep the existing table and its
   "Anomaly 1" sentence **byte-unchanged**; you are appending the answer beneath it, not editing history.

## TOUCH-ONLY

- `docs/bench/boss-duel-perf-table.md` — **append only**, at the end.
- `scripts/tmp-s1195-claw-2x-probe.mjs` (or similar `tmp-s1195-*` name) — your probe, **retained** per the
  RETENTION LAW, not deleted at the end.
- `tasks/runs/<your run report>.md`

## NO — do not touch, for any reason

- **`src/` — anything at all. This task changes no product code.** That includes
  `SalvageClawBossSystem.ts`, `DredgeQueenBossSystem.ts`, `LightRig.ts`, `Renderer.ts`. **You are reading
  and measuring them, not editing them.** If you believe a `src/` edit is needed, that is a STOP.
- **The fix, even if you prove hypothesis (B).** Naming the defect IS the deliverable; the repair is a
  separate slice with its own gate, and a diagnosis that also patches cannot be reviewed as either.
- **The existing table rows, the "Reading (5 sentences)" paragraph, and the "Anomaly 1" sentence** in
  `docs/bench/boss-duel-perf-table.md`. Historical measurement — append beneath.
- `assets/**`, `e2e/**` — this slice adds no test. (A guard against a *fixed* double-submit belongs with
  the fix, not with the diagnosis.)
- `STATUS.md`, `reviews/**`, `tasks/BACKLOG.md`, `tasks/goals.json` — fire-owned surfaces.
- Port **5188** (shared by lane worktrees — using it can kill a live run) and port **5237**.

## Self-check before you report

- `npx tsc --noEmit` exit 0; `npm run build` exit 0. *(Both should be trivially green — you changed no
  code. If either is red, that is a STOP and a finding about main, not about you.)*
- `npm run test:node-guards` → **61/61, exit 0.** *(If the npm script trips on its internal `&&`, run
  `node --test scripts/*.test.mjs` directly and say so. A bare `node --test scripts/` is a **vacuous
  red** — "Cannot find module …/scripts" is a harness invocation error, not a failure.)*
- `git status --short src/` → **empty.** Paste it; it is the proof of the central firewall.
- **The numbers table**, filled in from your own runs — not copied from the published table:

  | scene | shadow pass | asset tris | scene tris | calls | ratio |
  |---|---|---|---|---|---|
  | e8-mare-claim | ON | | | | |
  | e8-mare-claim | OFF | | | | |
  | e5-deepwater-claim | ON | | | | |
  | e5-deepwater-claim | OFF | | | | |

- **Scene-graph counts** for the claw scene: objects named `SalvageClaw3d`, distinct claw meshes, summed
  triangles.
- **The verdict, in one sentence, using the word LEGIT or DEFECT or UNRESOLVED** — and the single
  measurement that decides it.
- **State your load conditions** (`uptime` before and after each sample). The published table is explicitly
  load-contaminated; your *ratios* are counter-based and load-invariant, which is exactly why they are the
  signal — say so rather than quoting frame-ms.
- **Paste `git diff --stat`.**

**Three pre-declared STOPs, all SUCCESSES if they fire:**
- **The anomaly does not reproduce** (claw not ≈2×, or queen not ≈1×) → STOP and report both scenes' raw
  counters. A finding that has evaporated is a result; do not go hunting for a 2× that is not there.
- **You cannot reach a non-`soft` quality and cannot toggle the shadow map at runtime either** → STOP with
  scopes 1, 2 and 4 delivered. Three of five scopes with honest numbers beats a `src/` edit.
- **You prove hypothesis (B), a real double-submit** → STOP after scope 5, having *named* it. Do not fix
  it, and do not widen scope to find its cause in `src/` beyond what reading tells you.

READY-FOR-GATES + report: the numbers table, the scene-graph counts, the one-sentence verdict, the
frustum/asymmetry explanation, the empty `git status --short src/`, your load conditions, and `git diff --stat`.
