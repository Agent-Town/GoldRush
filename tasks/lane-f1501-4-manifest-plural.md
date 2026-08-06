# Task f1501-4-manifest-plural: the claim should say "straw men" (LANE-C, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1505, from F-1501-4 with every fact re-measured on main.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST:
- `AGENTS.md`
- `tasks/BACKLOG.md` — the row **F-1501-4** (its GATE is now OPEN; see Why)
- `src/agent/MechanicsManifest.ts` — lines **418-425** (`mechanicsManifestLine`), **427-470** (`interactables`), **482-488** (`humanize` / `toSnakeCase`)
- `reviews/f1504-1-drill-yard-stale-absence.md` — the slice that just landed on the same card

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**CLEANLINESS:** `git -C worktrees/lane-c status --short` → must be clean.
> **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1):**
> (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified
> tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**CURRENCY GATE (STEP 2, after the refresh, before any edit).** Run:

```
grep -c "export function mechanicsManifestLine(manifest: MechanicsManifest): string {" src/agent/MechanicsManifest.ts
```

**Expect exactly `1`.** Derivation: that signature is declared once, at `:418`, and nothing else in the file repeats it (measured on `origin/main` at authoring time, s1505). **`0` means your lane is stale or the function was renamed — STOP and report; do not improvise a new location.**

## Why (F-1501-4, filed s1501; GATE OPENED by `abcfffb88`, s1504; every fact below RE-MEASURED on main by s1505)

The Drill Yard board card now prints its manifest line to any player who opens the board, and that line reads:

> "This claim speaks: assay tent faucet, drill bell, rolling logs, **straw mans**, drill wave, ledger free practice, practice buildables, practice gold grant, practice target respawn, the river, water crossings."

`mechanicsManifestLine` pluralises by appending a bare `s` (`src/agent/MechanicsManifest.ts:420`):

```ts
...manifest.interactables.map(({ id, count }) => `${humanize(id)}${count === 1 ? '' : 's'}`),
```

`humanize` (`:482-484`) only maps `_` → space. So `straw_man` ×3 renders **"straw mans"**. This is player-visible today; it was invisible before `abcfffb88` only because the Drill Yard card was the one card rendering no briefing at all.

### THE 42-CONTRACT SWEEP — DONE FOR YOU, SO YOU DO NOT RE-DERIVE IT, AND IT IS THE REASON THIS SLICE IS SMALL

F-1501-4 warned that "the same de-slugger feeds every contract's line, so a fix is a class fix with 42 consumers." **True — and s1505 swept all 42 and measured that the class currently emits exactly FIVE pluralised terms, of which exactly ONE is wrong.** `count === 1` appends nothing, so singular terms cannot be damaged and are out of scope entirely.

| Rendered today | id | count | source | contracts |
|---|---|---|---|---|
| ❌ **`straw mans`** | `straw_man` | 3 | `practice.targets` | `e1-drill-yard` |
| ✅ `lantern posts` | `lantern_post` | 7 | `prePlacedBuildables` | `e1-night-shift` |
| ✅ `lantern posts` | `lantern_post` | 2 | `prePlacedBuildables` | `e3-blackout-ridge`, `e3-canyon-works` |
| ✅ `rolling logs` | `rolling_log` | 2 | `practice.targets` | `e1-drill-yard` |
| ✅ `sentry beacons` | `sentry_beacon` | 3 | `prePlacedBuildables` | `e3-blackout-ridge` |
| ✅ `turrets` | `turret` | 2 | `prePlacedBuildables` | `e3-canyon-works` |

⚠️ **One measuring trap, recorded because it caught the author first and would catch you.** Interactable ids reach the pluraliser from **three** sources (`:427-470`), and they are **not normalised the same way**: `tileParams.prePlacedBuildables` and `practice.stations` use the id **raw**, while `practice.targets` passes `kind` through `toSnakeCase` — which, unlike `humanize`, **also maps `-` → `_`** (`:486-488`). The Drill Yard's targets are authored as `straw-man` and `rolling-log` **with hyphens**; a sweep that forgets `toSnakeCase` reports `"straw-mans"` and `"rolling-logs"` and sends you hunting a hyphen de-slug bug **that does not exist**. Mirror `:482-488` byte-for-byte in any probe you write.

## Scope

1. **Cure the plural at RENDER time, inside `mechanicsManifestLine` only.** Add a small, explicit irregular-plural map (`straw_man` → `straw men` is its only required entry today) consulted before the `+ s` fallback. Keep the fallback for everything else — the four ✅ rows above must render byte-identically.
   - 🚫 **Do NOT write a general English pluraliser.** One irregular exists across 42 contracts. Inventing `-y`/`-ch`/`-sh`/`-x` rules is vocabulary the board does not ask for and cannot exercise (Mistake #14, reject-don't-stretch). If you believe a second entry is warranted, it must be a row you can point at in the table above.
   - Key the map on the **id**, not on the rendered text — the id is the stable thing.
2. **Add the assertion that makes the cure provable**, in `e2e/agent-view.spec.ts`. ⚠️ **This is mandatory and it is the crux of the task.** The existing check at `:348-352` — inside the test starting at `:297`, **("the derived manifest rides THE VIEW and every E1 briefing speaks it")** — compares the DOM against `mechanicsManifestLine(deriveMechanicsManifest(id))` **computed inside the test**, i.e. the renderer against itself. It is **tautological for this defect**: it passed while the card said "straw mans" and would pass again if you changed the plural to "straw manss". Add an assertion that pins the **literal expected words** for `e1-drill-yard` — that the line contains `straw men` and does **not** contain `straw mans`.
3. **Prove the other four rows did not move.** In the same spec, assert the literal rendered text for at least `lantern_post` (plural, `e1-night-shift`) and `rolling logs` (`e1-drill-yard`) — the second is the sharp control, because it is the *other* `practice.targets` entry on the *same card* and it is currently CORRECT. A cure that fixes `straw men` by mangling `rolling logs` must go red.
4. **Manufacture the defect before you believe the green** (the s1299/s1301 standard, and the house standard on this card — see `reviews/f1504-1-drill-yard-stale-absence.md`). Revert your `mechanicsManifestLine` change, prove your new assertion **FAILS**, restore it, and **report both outcomes with the exact `Expected:`/`Received:` text**. A green alone is not evidence about a violation path that never executed.

## Firewall

**Touch ONLY:**
- `src/agent/MechanicsManifest.ts` — **inside `mechanicsManifestLine` (`:418-425`) and a new module-local constant beside it. Nothing else in the file.**
- `e2e/agent-view.spec.ts`

**NO changes to:**
1. 🚫 **`deriveMechanicsManifest` and everything it calls** — `interactables` (`:427-470`), `humanize` (`:482-484`), `toSnakeCase` (`:486-488`), `rule`, `byId`. The manifest **data** is not the defect and must not move. Editing `humanize` would change every consumer of the derivation, not just the sentence.
2. 🚫 **`e2e/fixtures/e1-mechanics-manifests.json`.** ⓘ **Verified by s1505 rather than assumed: the fixture holds raw ids (`straw_man` is present) and NEVER the rendered sentence (`This claim speaks` is absent from all 7,459 bytes).** So a render-time cure **cannot** move it — and if you find yourself needing to edit it, you have put the fix in the wrong place. That fixture is byte-stable and is the subject of the still-open `f1328-1` owner question; moving it would re-open a design fork.
3. 🚫 **`assets/contracts/**`.** Renaming the `straw-man` target kind would "fix" the sentence by editing the world. The id is correct; the English is wrong.
4. 🚫 **`src/town/TownScene.ts`.** It merely calls the line function at `:3270`. It was edited by two slices in the last two hours; leave it alone.
5. 🚫 **`e2e/drill-yard.spec.ts`.** It landed **this hour** (`9559633aa`) and derives its expected rules from `loadEpoch`, not from the manifest line — it is disjoint from your change and must stay so.
6. 🚫 Any other `src/`, `scripts/`, `specs/`, `tasks/` file. **No firewall lift is granted by this master**; if scope 1 or 2 appears to need one, that is a FINDING — report it and stop that edit (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/agent-view.spec.ts --workers=1` — both projects. **Expect 8 passed across desktop+mobile** *(DERIVED, not optimistic: the spec holds 4 `test(...)` titles today — confirm with `grep -c '^test(' e2e/agent-view.spec.ts` before you trust this number — × 2 projects. Scope 2 and 3 add assertions INSIDE existing tests; **add no new `test(...)` title**, so the count must not change. If you see 10, fold your assertion back into an existing test.)*
- **`npm run test:node-guards`** — **MANDATORY, your diff touches `src/`** (F-1460-1). ⚠️ **If the `gr-sim` Baron pin moves, that is a FINDING with a named cause, never a re-pin** (F-1441-3). This slice changes one rendered string and nothing the sim replays, so the pin **must not move**.
- Adjacent, **re-derived from the tree rather than copied from this list** (a master's adjacent-suite list is perishable — run `grep -rln 'mechanicsManifest\|contract-board-mechanics\|claim speaks' e2e` and run what it returns): at minimum `e2e/drill-yard.spec.ts`, `e2e/drill-yard-manifest.spec.ts`, `e2e/contract-briefings.spec.ts`. Both projects, unmodified-green.
  - ⓘ Before filing any red as new, run `node scripts/red-inventory-lookup.mjs <spec>` — it answers KNOWN-RED or NOT-IN-INVENTORY in a second, and a **grep** of the inventory returns a false zero by construction. Membership is never exoneration (F-1444-2): it tells you where to spend a control run.
- Zero console/page errors, plain boot desktop **and** 390px.
- **Screenshot the Drill Yard card showing the cured line, both viewports**, to `artifacts/f1501-4-manifest-plural/{desktop,mobile}-chrome-drill-yard-line.png`. This is a player-visible copy fix; it gets read by eye, not only by markup (F-1332-2).

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

**READY-FOR-GATES** + report: the exact before/after text of the Drill Yard line; the irregular-plural map you added and **why each entry is in it**; the `Expected:`/`Received:` text from BOTH halves of the scope-4 probe (defect present → red, restored → green); confirmation that `deriveMechanicsManifest`, `humanize`, `toSnakeCase` and `e2e/fixtures/e1-mechanics-manifests.json` are **untouched**; the re-derived adjacent-suite list you actually ran; and any finding you were told to report rather than repair.
