# f2397-2-multi-pin-lineage-arm — drain review (s2408)

**Slice:** `lane-d-f2397-2-multi-pin-lineage-arm` · **branch:** `lane/d` · **lane tip:** `04df6d7a0` · **merge:** `6a88887d9` · **base:** `011e2063d`

## VERDICT: MERGED — the restored arm has teeth, re-proven drain-side rather than inherited

## What it does

Restores the lineage arm F-2397-2 recorded as deleted: an assay tape stamped with an **earlier pin of the current era** must stay `verified`, not fall to `unassayable`. `assay-worker.mjs:91` decides engine skew with `!engineEra.pins.some((pin) => pin.engineHash === tapeEngineHash)` — a *set* membership test over the era's whole pin lineage, not equality against the head pin. Era 5 carries exactly **one** pin whose hash equals the top-level `engineHash`, so against the live registry the two readings are indistinguishable and the mechanism was untested.

The arm buys its own fixture: it copies the worker's entire non-builtin surface (exactly two files — `assay-worker.mjs`, `assay-replay-agent.mjs`) into a tmpdir beside a **two-pin fixture registry**, symlinks `node_modules`, and spawns the copy. That is what makes it work where the review's originally prescribed cure could not: `assay-worker.mjs:8` imports the registry by a *static module-relative* path, so `cwd` cannot swing it. Three tapes, one assertion: earlier pin → `verified`, head pin → `verified`, unknown pin → `unassayable`, with the reason naming `the Fixture Era` — which proves the copy read the fixture and not the repo's registry.

## Evidence (measured this drain, on the merged tree, in a detached gate worktree per §3.0b)

| Gate | Result |
|---|---|
| Merge shape | clean `ort`, **1 file**, +43/−3 |
| Production surface vs main | `assay-worker.mjs`, `assay-replay-agent.mjs`, `assets/engine-era.json` — **byte-identical** (`git diff --stat` empty) |
| `scripts/assay-worker.test.mjs` | **10 pass / 0 fail / 0 skipped**, 2.08 s; new arm 164 ms |
| **Teeth (manufactured defect)** | collapse `pins.some(...)` → head-pin equality: **the new arm reds ALONE**, `['unassayable','verified','unassayable']` vs expected `['verified','verified','unassayable']` |
| Teeth controls | head pin → `verified` and unknown pin → `unassayable` both **hold steady** under the defect — the arm discriminates the lineage mechanism, not the whole path |
| Defect reverted | gate tree `git status` clean but for the `node_modules` symlink |
| `npx tsc --noEmit` | green |
| `npm run build` | green, 2.32 s |

**The teeth check is the load-bearing gate here, not the green.** This corrective exists *because* the previous arm passed with the mechanism removed; a passing suite is exactly the evidence that was already known to be worthless. I manufactured the defect myself rather than inherit the runner's claim (Mistake #4).

## Merge classification

Single file, `scripts/assay-worker.test.mjs`, **LANE-TOUCHED only** — `git diff --name-only main <trial-merge>` returns exactly that one path. Main had not moved it since the lane branched (`behind=2`, neither commit touching it). No conflict, no graft.

**Rendering / player-visible:** none. Test-only change with a byte-identical production surface, so no boot probe or screenshot is owed and none is claimed. Filing no GZ-01 item is correct: nothing a player can see moved.

## Findings

### F-2408-1 — OPEN. Adding a guard to `package.json` moves the ENGINE IDENTITY HASH, and `engine-era-guard` has been red on main since 21:41

`engine-era-guard.test.mjs` is **red on unmodified main**, computed `386f971d…` against declared `c0a015ae…`. **Not caused by this slice** — verified: the merge touches one test file and leaves the registry and both worker files byte-identical.

**Cause proven by bisecting the corpus, not guessed.** `ENGINE_SOURCE_INPUTS` (`assay-replay-agent.mjs:36–48`) includes **`package.json`**. Exactly one first-parent commit has touched any corpus path since the era-5 pin was blessed: `e27259c67` (s2406, 21:41:03), and its *entire* `package.json` delta is **one guard filename** appended to the `test:ledger-guards` chain:

```
+ scripts/art-staging-gitdir-link-guard.test.mjs
```

**This is structural, not a one-off.** F-1300-4 *requires* every fire that writes a ledger row to root its new guard in that battery — and this file states in its own words that the set "is MEANT to grow". So the factory's own law mandates edits to a file inside the engine identity corpus, and **every guard-rooting fire will red this gate.** A test-script name cannot change what the headless replay executes, so this is a false positive of the corpus definition, and the guard's prescribed remedy (append a pin, or bump the era) is bookkeeping churn triggered by a non-event.

⚠️ **The decay has already started.** The lane runner's own report dismissed this as one of the "unrelated current-main failures". That is precisely the F-1460-1 `cross-engine` fate — a red nobody investigates — beginning on its first day.

**The live consequence, stated at its true confidence.** ✓ VERIFIED: `gr-sim.mjs:275` stamps tape meta with `engineHash: await computeEngineHash(root)`, and `assay-worker.mjs:91` judges a tape skewed when its hash is in no pin of the era. ? INFERRED, **not** measured end-to-end this fire: a tape generated from main today would therefore be stamped `386f971d…`, which is in no pin, and judged **`unassayable`** — the assay pipeline rejecting its own fresh tapes. **One command from verified; the next fire should measure it before acting, and should not repeat it as fact.**

**Deliberately NOT cured here, and the restraint is reasoned rather than lazy.** Choosing between *append a same-era pin* and *bump the era* is a judgement about whether engine behaviour changed — and an era bump is player-visible news by definition (GZ-01). §7.2 prescribes writing the finding, not making that call at the end of a fire under a one-drain budget.

🔗 **This drain is the guard that remedy needs.** Era 5 has one pin today, which is why the lineage mechanism was untestable. Appending `386f971d…` makes it **two** — and the arm merged here is exactly what proves the earlier pin stays assayable when that happens. The cure and its guard arrive in the right order.

### F-2397-1 — untouched, still attended-owed

The membership predicate has three implementations (`functions/api/standings.ts`, `src/game/Game.ts`, `scripts/assay-worker.mjs`) with no guard asserting they agree. Firewalled out of this master by design; its cure spans a browser bundle, a node worker and a Cloudflare Pages Function, which §2E reserves for an attended session.

## Environment notes

`test:node-guards` was **not** re-run whole for this drain, and the reason is structural rather than economy: the merged tree's only delta from main is one test file, and its own suite is green, so a red in any *other* file is pre-existing by construction. I verified that directly for the one red the runner named — `engine-era-guard` fails identically on unmodified main (F-2408-1 above). The runner's own aggregate run was `rc=1, 537 pass / 7 fail` under concurrent battery contention on Node 23; per F-2166-2 a lane-side red on that battery is a question about which interpreter ran it before it is a question about the slice.
