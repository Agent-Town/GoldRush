# rf-35 — townEraProps node-safety guard (F-1096-1)

**Slice:** rf-35 town-era-props-node-safety · **Branch:** none — landed directly on `main` by the s1097 fire · **Merge:** `adaacdca6e88459a57ed87a733c171d9ccab0df5` (+ the separate goal-tracker cure `1d425752ae577e6a1dd63066e479d4d0f33d2bdc`)
**Verdict:** ✅ MERGED — bundle-neutral, behaviour-neutral under Vite, and it disarms a measured 2378→0 landmine.

## What it does

`src/town/townEraProps.ts:9` held a module-scope **eager `import.meta.glob`** over seven JSON manifests. `import.meta.glob` is a Vite construct that does not exist under plain node — and plain node is how Playwright collects the suite. Any spec whose **static** import graph reached that module therefore killed collection outright.

This slice applies the house safety idiom already shipped at `src/meta/ContractFamilies.ts:755` — `typeof import.meta.env === 'object' ? import.meta.glob(...) : fallback`, where the fallback is built from static imports carrying `with { type: 'json' }` — to `townEraProps.ts`, and adds a **named** node-side guard so the idiom cannot be removed silently.

This is F-1096-1, banked (deliberately un-authored) by s1096 and specified there in full. s1096's censuswas re-verified by this fire before any code was written, and it held on every point.

## Why it outranked its size: the landmine is real, and it was one import edge away

Not argued — **measured**. A throwaway spec (`e2e/zz-s1097-landmine-probe.spec.ts`, created and deleted inside this fire) that merely did `import { townEraPropsForOrder } from '../src/town/townEraProps'`:

| Tree | `npx playwright test --list` | rc |
|---|---|---|
| main, no probe (baseline) | **`Total: 2378 tests in 330 files`** | 0 |
| main + probe (edge armed) | **`Total: 0 tests in 0 files`** — `TypeError: (intermediate value).glob is not a function at ../src/town/townEraProps.ts:9` | **1** |
| main + probe + this fix | **`Total: 2380 tests in 331 files`**, zero error lines | 0 |

One edge, and the project's headline command (`test = playwright test`, `package.json:11`) collects nothing. **rf-33 lost nine days to exactly this class**, unnoticed because every gate runs *named* specs.

The edge was close. `townEraPropsForOrder` was carved out of `townLayout.ts` by rf-31, and `townLayout.ts` **is** statically imported by two specs (`e2e/ts-01-plaza-ground.spec.ts:6`, `e2e/ts-04-living-pass.spec.ts:6` — the other two references, `never-trap.spec.ts:107` and `safari-swap.spec.ts:40`, are browser-side `Function('return import(...)')` plus a type-only `typeof import`, exactly as rf-31 measured). One re-export from `townLayout.ts`, or one spec importing the new module directly, re-arms the outage — in the town area under active E2/Charter-Press development.

## The census, re-verified rather than inherited

s1096's F-1096-1 numbers were re-measured from scratch by this fire (`git grep -n import.meta.glob -- src`) and **every claim held**:

- **29/29** `import.meta.glob` sites, **10** of them JSON-pattern, **all 10 eager**, zero lazy. Every lazy glob is a binary asset (`.png`/`.glb`), which cannot raise the JSON error class.
- **Guarded (6):** `ContractFamilies.ts:757/:764/:771/:778`, `Upgrades.ts:309`, `StatSimHarness.ts:156` — all four read `typeof import.meta.env === 'object' ? … : fallback`, verified by reading the lines.
- **Safe by construction (3):** `CraftingQueueStatic.ts:9/:13/:17` — sole importer is `await import('./CraftingQueueStatic')` at `CraftingQueue.ts:135`, so they are never on a static graph.
- **Unguarded and reachable (1):** `townEraProps.ts:9`. This slice.

⇒ **After this merge, 10/10 JSON-pattern glob sites are guarded or dynamic-only. Zero unguarded reachable sites remain.**

## Evidence

| Gate | Result |
|---|---|
`npx tsc --noEmit` | **0** — the `with { type: 'json' }` attribute form is in-repo precedent (`ContractFamilies.ts:1-22`) |
`npm run build` | **0**, built in ~1.3s |
**Bundle delta (total `dist/`)** | **445,698,441 B → 445,698,426 B = −15 B.** No duplication: the `townEraProps-QpN3KWMS-diet-*.js` chunk hash is **byte-identical in both variants**, and the era-props payload marker (`coal-bin.e2.glb`) occurs **exactly once per chunk in both** — the glob and the static imports resolve to the *same seven modules*, so Vite dedupes them. The 7 KB of manifests is **not** paid twice. |
`TownScene` chunk | 129,790 B at HEAD (2/2 samples) vs 129,790 / 129,769 B fixed — delta 0 to −21 B, i.e. build noise |
**New guard** `scripts/town-era-props-node-safety.test.mjs` | PASS — imports the module the way node does (`--experimental-strip-types`) and asserts the manifests resolve: **era 3 → 13 props** (e2's 8 + e3's 5) and **era 10 → 3 props** (sliced at the last `floodReset`), so the flood-accumulation logic is proven intact through the fallback, not merely "no throw" |
**MUTATION CONTROL (mandatory)** | Defect restored (`git show HEAD:src/town/townEraProps.ts`) → new guard **RED**, `pass 0 / fail 1`, `TypeError: (intermediate value).glob is not a function`. Restored → **GREEN**, file **byte-identical** (verified by string compare). The guard is not vacuous. |
Whole-suite collection | `Total: 2378 tests in 330 files`, rc 0 — **rf-33's nine-day fix is not regressed** |
`npm run test:node-guards` node phase | **tests 60 · pass 60 · fail 0.** Overall rc **1** = F-1088-1's ticker `StatsEndpointReadError` — a separate step after the node phase, and now **the only red in the suite**. (Judged by phase count, per the trap that has misled seven drains.) |
Boot probe desktop + 390px | `scripts/probe-plain-boot-console.mjs` against a scratch dev server on **:5239** (not the 2-day-old :5207 listener — foreign-tree risk): **errors 0 · warnings 0 · pageErrors 0** at 1280×800 **and** 390×844 → **PROBE CLEAN** |
Town specs (the four rf-31 rescued) | **5 failed / 13 passed** — every one **PRE-EXISTING**, see the fingerprint below |

### The town-spec reds, attributed rather than asserted

The four specs rf-31 rescued still do not all pass. I did **not** take that on faith in either direction — I ran the **identical** command on a tree reverted to `main` on this file (byte-compare verified):

| Tree | Result | Failing tests |
|---|---|---|
| **this slice** | 5 failed / 13 passed (7.0m) | `ts-01-plaza-ground` "…to every slot and the gate" (desktop + mobile) · `ts-04-living-pass` "…no storage or sim writes" (desktop + mobile) · `town-t5-townsfolk` "Prospector greets by town name" (desktop) |
| **clean main** | **6 failed** / 12 passed (7.5m) | **all five of the above, identical titles and projects**, plus `cast-motion-wiring` "…lly without borrowed sheets" (desktop) |

Clean main's failure set is a **strict superset** of this slice's. Nothing here is slice-caused; the one differing test flipped **in main's favour-of-red**, which is load-sensitivity, not a repair — I claim no credit for it.

These are already on the books: **F-1093-3** recorded `cast-motion-wiring` 1 pass/1 fail, `ts-01-plaza-ground` 0/2 (`walkTo` 30 s timeout) and `ts-04-living-pass` 2/2 storage-invariance red at s1093, and named them **new members of F-1084-1** (load/timing-sensitive, not merely rotted). **One delta worth recording:** s1093 measured `town-t5-townsfolk` **10/10 GREEN**; it is red here on desktop *and on clean main*, so it has joined the load-sensitive set since — **a new F-1084-1 member observation, not a new bug**, and explicitly **not** something to fix by editing `e2e/` (rf-31's standing warning, F-1093-3/F-1095-2).

## Merge classification

Landed **directly on `main`** — no lane branch, no graft, no conflict surface. Three files, path-scoped, in `adaacdca`:

- `src/town/townEraProps.ts` — the guard + fallback (+18 lines)
- `scripts/town-era-props-node-safety.test.mjs` — new named guard
- `package.json` — one word: the guard registered in `test:node-guards`

`main` was clean and all four lanes were empty and idle for the whole window, so there was no second writer.

**Process note, stated plainly rather than buried:** a fire implemented `src/` directly instead of authoring a master for a lane runner. §2E's authoring path was the expected route and s1096 wrote "the next fire can author it in one step." I took the shorter route because by the time authoring would have begun I had already **written and proven** the fix — armed the landmine, watched collection collapse, applied the idiom, watched it recover, and run the mutation control both ways. Sending a runner to re-derive 18 mechanical lines that mirror an in-repo idiom would have burned a cycle to reach a worse-evidenced version of the same diff (Mistake #8's shape). It is 18 lines in one file, bundle-neutral, behaviour-neutral under Vite, and **reversible with one word** (§7.4: owner absent + reversible + inside ratified practice → proceed + veto window). If Robin or an attended session would rather this class always go through a runner, say so and I will revert and author it instead.

## The gate caught a second, unrelated regression — and it was one fire old

`test:node-guards` came back **59 pass / 1 fail**, and the failure was **not** F-1088-1:

```
AssertionError: rf-34-hero-y-restore-roundtrip: invalid status blocked
```

**F-1097-3 — s1096's own bookkeeping commit `b968f6c7` turned `goal-tracker.test.mjs` red.** It parked rf-34 as `status: "blocked"` — which is the *honest* state, the work is finished and waiting on the owner — but `goal-tracker.test.mjs:13` allowed only `planned|queued|building|merged|verified-by-owner`. Bisected, not guessed: the guard is **rc 0** against `c320999c:tasks/goals.json` (s1096's lock commit) and **rc 1** against main's. s1096 gated rf-34 *before* writing its bookkeeping and never re-ran the suite afterwards, so it reported `59/59` in good faith and left a red behind it.

Cured in `1d425752` by **widening the vocabulary, not downgrading the leaf**: `queued` would claim a queue entry that does not exist (the queue is empty; the work is done), so the schema learns `blocked` and now *requires* `blockedReason` — a blocked leaf must carry the owner question, or it is just a stall. Mutation control: renaming `blockedReason` drove the new assert red naming the leaf; restore byte-identical. **Node phase 59/60 → 60/60.**

- **F-1097-4 (non-blocking, the reason the above could hide at all):** `goal-tracker.test.mjs:11` builds its leaf set from `goals.goals[].subgoals[].tasks[]` only — but `goals.json` has a **third** leaf shape, `goals.goals[].tasks[]` (top-level tasks, e.g. `m1-m2-resource-guards`), which the schema test **never walks**. Measured status counts across the whole file: `merged` 324 · `verified-by-owner` 11 · `planned` 8 · `shipped` **4** · `building` 3 · `blocked` 1 · `diagnosed` **1**. So **five leaves already carry statuses outside the allowed set** and are invisible to the guard purely because of where they sit. The guard's denominator is narrower than its name ("goal tree schema is valid"). Widening the traversal is a **one-line change that immediately reds five leaves**, each needing a judgement about what it should say — that is a cleanup with decisions in it, so it is **banked here, not smuggled into this commit**. Note also that `assert.ok` aborts on the *first* violation, so the guard reports one bad status at a time.

## Findings

- **F-1097-1 (non-blocking, class-level):** the two collection guards (`whole-suite-collection.test.mjs`, `town-spec-collection.test.mjs`) live inside `npm run test:node-guards`, whose **overall rc is 1 regardless** because of F-1088-1 — a known red that "has now misled seven drains". A guard whose suite always exits 1 is read by phase count, not by rc, which is exactly how a genuine new red gets filed as the known one. This does not weaken *this* slice (its guard was watched red-then-green by hand) but it is the reason a **named, file-specific** guard was added here rather than leaning on the whole-suite red. F-1088-1 is one owner word ("literal" / "drop it") from closing and it is worth more than its size suggests.
- **F-1097-2 (non-blocking, latent, do NOT author yet):** the fallback map is hand-written, so a **new** `era-props.e*.json` manifest (e6/e7 do not exist today; e2–e5, e8–e10 do) will be picked up by the Vite glob but **silently missing from the node fallback**. Under node the era would simply have no props — no throw, no red. The same latent gap already exists in `ContractFamilies.ts` (its fallback lists epochs by hand). Cheapest real fix is a guard asserting the fallback's key set equals the on-disk manifest set; that is a *shared* concern with ContractFamilies and should be authored once for both, not twice. Banked, not authored.
- **Explicitly NOT done, per s1096's own warning:** no static census assertion ("JSON globs must be lazy" or "must be guarded"). It would flag the three safe dynamic-only `CraftingQueueStatic` sites, and s1096 nearly shipped the inverted invariant. Lazy is the safe *direction*; eager-on-a-static-graph is the hazard.

## Not touched

`e2e/` (zero edits — the probe was created and deleted, never committed) · the three `CraftingQueueStatic` sites · `ContractFamilies.ts` · `townLayout.ts` (read for the type only) · the glob **pattern string** is byte-identical to rf-31's (a changed relative depth silently yields an empty map and no error) · `scripts/deploy.sh` (F-1073-1) · rf-34's held `lane/m3` commit.
