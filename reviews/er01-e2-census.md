# ER-01 — E2 READINESS CENSUS (lane-b)

**Slice:** `lane-er01-e2-census` · **branch:** `lane/b` · **tip:** `ecee66cd` · **base:** `dad6fbff`
**Drained by:** s1458 fire, 2026-08-05 · **Gate worktree:** `gate-s1458/` (detached, §3.0b custody — main's working tree was never touched)

## VERDICT: ✅ MERGED `96d409889e4bdd502431da48a7386a5fcc90d1f8` — after being REFUSED and CURED in the same fire

> ⏸️ **SUPERSEDED — THE ORIGINAL VERDICT IS RETAINED BELOW, NOT DELETED, because the refusal is the load-bearing half of this review.**
> **First verdict (s1458, ~19:50): REFUSED — NOT MERGED.** *"The slice's substance is sound and valuable, and every census assertion it makes holds. It is refused on one narrow, fully-diagnosed defect: its own new spec fails 8/8 under the house playwright command on the repo's pinned Node, and that is a NEW failure, not a documented known-red (drain SKILL §44)."*
> **What changed:** the corrective `f1458-1` was authored, dispatched and returned **within the same fire** (`f7632e33`, 64,865 tokens, one file, +4/-1). The gate-side hold was then lifted by **satisfying its stated condition**, never by an owner word — and the merge and both leaf flips moved together (F-1384-1, two commits, one fire).

**Final tip gated:** `f7632e33` (= `ecee66cd` census + `f7632e33` cure).

## Final gate battery — on the merged tree, detached worktree `gate2-s1458/` (§3.0b), `--workers=1` (F-1270-1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green, 1.20s** |
| `e2e/er01-e2-census.spec.ts`, plain house command, Node 26.4.0 | ✅ **8/8** desktop + mobile (35.4s) |
| **Guard teeth, planted on the PINNED Node** | ✅ planted `console.error` → **4/4 RED**, captured verbatim; removed → green. The narrow filter is not a blanket silence. |
| `gr-sim` + `bench-seeds` + `cross-engine-skip` | **13 pass / 1 fail** — the one red **control-proven pre-existing** |

**The red, proven rather than labelled** (a known-red claim is not exoneration): `gr-sim.test.mjs` → *"the Baron driver runs the declared fight and keeps medal writes off headless"*. Same worktree, same hour, same command, reset to clean main `2d6da94f`: **identical 13/1**, and identical **to the digit** — received `kills: 861` vs pinned `869`, `eventLogHash: fnv1a32:36004eab` vs `fnv1a32:b9566c6d` in **both arms**. This is the **F-1403-1 / F-1404-2 cross-engine class** (the same Node 23-vs-26 split this review's own F-1458-2 is about), not this merge.

ⓘ The lane's own `tasks/BACKLOG.md` line was **deliberately not landed**: it read *"READY-FOR-GATES on lane/b"*, which the merge makes false. The merged verdict is written directly instead, so no half-retired entry is left behind.

## What it does

Admits the two non-pressure E2 board contracts (`e2-trestle`, `e2-incline`) to `HeadlessContractSim`, pins two bench seeds for each of the four Steamworks contracts, and publishes `docs/bench/e2-readiness-census.md` in the E1 census format: **1 AGENT-READY, 3 DATA-GAP, 0 BROKEN**. `e2-hill-mine` and `e2-pressure-garden` are explicitly **rejected** rather than force-admitted, because their `twist.pressureEnabled` mechanic has neither manifest vocabulary nor a headless consumer — AP-11 reject-don't-stretch, applied correctly. Three findings are filed as stubs (F-ER01-1..3); **no balance or content fix is folded in**, exactly as the master's NO-list required.

## Evidence (all measured this fire, gate worktree, `--workers=1` per F-1270-1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **green**, built in 1.47s, asset budgets within ceilings |
| `e2e/er01-e2-census.spec.ts` (house command, pinned Node) | ❌ **8 failed / 8** — desktop + mobile |
| same spec, `NODE_OPTIONS=--no-warnings` | ✅ **8 passed (47.1s)**, rc=0 |
| same spec, with the cure below | ✅ **8 passed (48.5s)**, desktop + mobile |

The middle two rows are the whole finding: **every substantive assertion in the slice passes.** The failure is entirely in the spec's console-capture channel.

## Merge classification (computed from the true merge-base `dad6fbff`, not assumed)

| Path | Class |
|---|---|
| `assets/contracts/bench-seeds.json` | LANE-TOUCHED (main never moved it since base) |
| `docs/bench/e2-readiness-census.md` | LANE-TOUCHED (new file) |
| `e2e/er01-e2-census.spec.ts` | LANE-TOUCHED (new file) |
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED (main never moved it since base) |
| `tasks/BACKLOG.md` | BOTH-MOVED — lane appends 1 line at tail, main appends elsewhere; trivial append merge, no conflict |

Verified byte-exact into the gate tree by blob hash on all four code/doc paths. The `src/` diff is **purely additive**: two contract ids added to `SUPPORTED_CONTRACTS`, nothing removed or altered. Firewall respected.

## Findings

### 🔺 F-1458-1 — THE SPEC'S ZERO-CONSOLE ASSERTION CAPTURES **NODE'S OWN PROCESS WARNINGS**, SO IT REDS 8/8 ON THE PINNED INTERPRETER (BLOCKING — this is the refusal)

`e2e/er01-e2-census.spec.ts:32-33` hooks `console.error`/`console.warn` into a `consoleErrors` array, then asserts `expect(consoleErrors).toEqual([])` at `:44` and `:74`. **Node's default `'warning'` handler prints through `console.error`**, so a process-level warning lands in that array and reds the assertion.

Node ≥ 26 emits exactly one such warning the first time anything reads `globalThis.localStorage` without `--localstorage-file`:

```
(node:9667) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
```

**Measured on both interpreters, same code, same machine, same hour:**

| Node | `globalThis.localStorage` access | stderr |
|---|---|---|
| **v23.11.1** — what the Codex runner executes | `typeof undefined` | *empty* |
| **v26.4.0** — what fires execute, and what `.nvmrc` pins | `typeof undefined` | the ExperimentalWarning |

Because `process.emitWarning` delivers on a **later tick**, the warning arrives inside the window where the spec has the console hooked — which is why it is captured even though the triggering read happens during module init.

⚠️ **The obvious cure does not work, and I know because I ran it.** Stubbing `globalThis.localStorage` before the access (the `scripts/gr-sim.test.mjs` house pattern, and the pattern this very spec already uses for `location`/`window`) left it **still 8/8 red** — the read happens deep in the vite-SSR module graph, before the test body. Prescribing that cure unmeasured would have sent the corrective into a dead end.

✅ **CURE, MEASURED GREEN 8/8 under the plain house command** — own the warning channel instead of the global:

```js
const previousWarningListeners = process.listeners('warning');
process.removeAllListeners('warning');
process.on('warning', () => {});
// ... restore in finally
```

Full patch: `artifacts/f1458-1/er01-console-capture-cure.patch` (lane blob `0867a696` → cured blob `06fd7284`).

⚖️ **Stated against my own cure, because the corrective must decide this and not inherit it:** suppressing *all* process warnings widens the silence — a genuine deprecation warning from app code would also stop reding this spec. The narrower alternative is to filter only the specific warning text in the capture hook, keeping every other process warning fatal. **I did not choose between them, and that choice is exactly why this is a corrective rather than a drain-time drive-by:** the change alters the semantics of the slice's central gate, and a gate should not be quietly widened by the unreviewed author of its own fix.

### 🔺 F-1458-2 — THE RUNNER VALIDATES ON AN **OFF-PIN INTERPRETER**, SO ITS GREENS ARE NOT EVIDENCE FOR THE PINNED ENVIRONMENT (the reusable half)

The runner reported this spec **8/8 green** and was telling the truth about its own shell. `.nvmrc` pins **26.4.0** (root and `worktrees/lane-b` both). The Codex binary this run executed lives at `/Users/robin/.nvm/versions/node/v23.11.1/...` — **verified for this specific run** from its own run log, not inherited from F-1404-2.

So the factory's implementer certifies work on an interpreter the repo does not pin, while every fire gates on the one it does. F-1403-1/F-1404-2 already established this split for a *hash* divergence and treated it as an exotic cross-V8 `Math.pow` curiosity with a documented skip mechanism. **This finding shows the same split produces ordinary, everyday reds** — any spec asserting on console output is exposed, and the runner cannot see it.

This is F-1457-1 one turn further out: not "a fire can pick the wrong instrument", but **"the two halves of the factory routinely run different instruments, and only one of them matches the pin."**

**Recommendation (owner/attended, not fire-decidable):** align the runner onto `.nvmrc`, or declare 23.11.1 the runner's supported engine and gate that claim. Until one of those happens, every console-asserting spec is a latent drain refusal.

### 🟡 F-1458-3 — ER-01 HAD NO GOAL LEAF (Goal Registration Law)

`drain-block-check.mjs` returned **UNKNOWN** for the done-move filename. Per F-1457-3 I did not read that as clearance and searched the tree by leaf id: `agent-play ▸ e2-readiness ▸ er-01-e2-census` genuinely **does not exist** in `tasks/goals.json`, though the lane's own BACKLOG line announces it as if it did. Registered this fire. Not a block — bookkeeping debt, the 21st consecutive fire of F-1448-6's class.

## Custody

Both gate batteries ran entirely in detached worktrees (`gate-s1458/`, `gate2-s1458/`), removed at handoff — **main's working tree was never used to evaluate undecided content** (§3.0b, F-1295-1). `lane/b` was never reset: it held `ecee66cd` throughout the refusal, the corrective built the second commit on top of it, and both landed together. The corrective's master was made **self-contained** (the cure inlined) precisely because the lane deliberately was not refreshed and could not see `reviews/` or `artifacts/` on main — the F-1424-3 failure mode, avoided by checking rather than assuming.
