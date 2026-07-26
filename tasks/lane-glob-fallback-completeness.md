# Task lane-glob-fallback-completeness: THE NODE FALLBACKS CAN SILENTLY SEE FEWER FILES THAN VITE DOES (LANE-C, commit prefix "test:")
**FIRE-AUTHORED (attended review welcome) — s1097, 2026-07-27. This is F-1097-2, opened by the fire that created the newest of the fallbacks it now asks you to guard. The invariant is MEASURED and currently TRUE, so this guard must land GREEN — if it lands red, you have found a real gap and that is a FINDING to report, not a number to adjust.**

You are Codex (worktrees/lane-c).

CODEX: model=gpt-5.6-sol effort=high

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4). `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run falls back to `effort=medium`.

## WHY (the evidence chain, dated)

**F-1097-2 (BACKLOG + `reviews/rf-35-town-era-props-node-safety.md`, s1097, 2026-07-27) — quoted verbatim:**
> "the fallback map is hand-written, so a **new** `era-props.e*.json` manifest (e6/e7 do not exist today; e2–e5, e8–e10 do) will be picked up by the Vite glob but **silently missing from the node fallback**. Under node the era would simply have no props — no throw, no red. The same latent gap already exists in `ContractFamilies.ts` (its fallback lists epochs by hand). Cheapest real fix is a guard asserting the fallback's key set equals the on-disk manifest set; that is a *shared* concern with ContractFamilies and should be authored once for both, not twice."

**The shape of the hazard, in one sentence:** these modules resolve their JSON two different ways — `import.meta.glob` under Vite (which discovers files by pattern, automatically) and a **hand-written fallback object** under node (which discovers nothing) — so the two paths can drift, and drift produces **empty data, not an error**. rf-33 cost nine days because a JSON-loading failure was invisible to every gate; this is the same family, one degree quieter: it would not even throw.

**Why this is worth a guard and not a comment:** the eras are actively being built (E2 Steamworks live, Charter Press at E4+), so `era-props.e6.json` and `era-props.e7.json` **will** be authored, and the person authoring them has no reason to know a second hand-written list exists in a different file.

## PRE-FLIGHT — verify by CONTENT, never by counting, and run the premise checks AFTER the reset

⚠️ **`git log main..lane/e2-arsenal` WILL PRINT ONE COMMIT (`7b5e765e runner(lane-c): lane-probe-launch-ordering.md`), AND THAT IS EXPECTED — IT IS *NOT* A REASON TO STOP.**
s1097 verified the reset is **loss-free by content, not by counting**: that commit touches exactly one file, `scripts/probe-base.test.mjs`, and `git rev-parse 7b5e765e:scripts/probe-base.test.mjs` is **byte-identical to `main:scripts/probe-base.test.mjs`** ⇒ classic false-ahead (an ahead-count is not a drain signal, F-1066-1 / F-1073-1).

1. `git log --oneline main..lane/e2-arsenal` prints **exactly `7b5e765e` and nothing else.** A **second** commit would be undrained work — **only then STOP and report.**
2. Start from fresh main: `git checkout -B lane/e2-arsenal main`. `7b5e765e` is safe to leave behind.
3. **NOW, and only now, run the premise checks** — a stale lane answers for its own tree, not for main, and a pre-flight that checks premises *before* the reset has STOPped a run wrongly before:
   - `grep -n "typeof import.meta.env === 'object'" src/town/townEraProps.ts` → **must print one hit.** Absent ⇒ rf-35 was reverted; STOP and report.
   - `ls scripts/glob-fallback-completeness.test.mjs` → **must not exist.** If it does, this task is already done; STOP and report.
   - `ls assets/pilots/plaza-props-3d/era-props.e*.json | wc -l` → **must print 7.** A different number is fine and expected in future, but say so in your report, because every count below is measured at 7.

## READ FIRST (in your worktree, before writing anything)

- `src/town/townEraProps.ts` — the whole file (21 lines before rf-35, ~38 after). The seven `import … with { type: 'json' }` lines, the `fallbackTownEraPropManifests` object, and the `typeof import.meta.env === 'object' ? glob : fallback` ternary. **Measured on main s1097: 7 static imports, 7 fallback keys, 7 files on disk (e2,e3,e4,e5,e8,e9,e10 — note e6 and e7 do NOT exist).**
- `src/meta/ContractFamilies.ts:1-22` — the 22 static JSON imports with `with { type: 'json' }`.
- `src/meta/ContractFamilies.ts:720-782` — the **four** fallback objects and their four ternaries. ⚠️ **`fallbackManifests` (`:720`) and `fallbackContractBundles` (`:740`) are `RELEASE_E1 ? {…} : {…}`** — a release build deliberately narrows them to epoch-1 only. **`fallbackFamilyBundles` (`:734`) and `fallbackCapsBundles` (`:737`) are unconditional and hold exactly ONE key each, and that is CORRECT — only `epoch-1-frontier` has `families.json`/`caps.json` on disk.**
- `scripts/town-era-props-node-safety.test.mjs` — the sibling guard rf-35 landed, and **the house pattern for this lane** (`node:test` + `node:assert/strict`).
- `scripts/ticker-stats.mjs` — **the in-repo precedent for reading a constant out of a `src/` file by regex** (`statsEndpoint()` regex-reads `const STATS_ENDPOINT` out of `src/encyclopedia/liveStats.ts`). Cited because RULING 1 tells you to do the same thing.

## THE MEASURED BASELINE (do not re-derive it; verify it)

s1097 measured all five maps against disk. **Every one is COMPLETE today**, which is why this guard must land green:

| map | file:line | fallback keys | on-disk files | conditional? |
|---|---|---|---|---|
| `fallbackTownEraPropManifests` | `townEraProps.ts` | **7** | **7** `era-props.e*.json` | no |
| `fallbackManifests` | `ContractFamilies.ts:720` | **10** | **10** `*/manifest.json` | **yes — RELEASE_E1** |
| `fallbackFamilyBundles` | `ContractFamilies.ts:734` | **1** | **1** `*/families.json` | no |
| `fallbackCapsBundles` | `ContractFamilies.ts:737` | **1** | **1** `*/caps.json` | no |
| `fallbackContractBundles` | `ContractFamilies.ts:740` | **10** | **10** `*/contracts.json` | **yes — RELEASE_E1** |

## THE THREE RULINGS (decided by measurement — do not revisit)

**RULING 1 — read the fallback keys from the SOURCE TEXT. Do NOT export the maps from `src/`, and do NOT import the modules to inspect them.**
Two alternatives were considered and killed:
- *Exporting the maps for testability* widens a `src/` public surface for a test's convenience, and this guard must not be able to change runtime behaviour at all.
- *Importing the module under node and reading the resolved map* cannot work: the maps are module-private, and `townEraPropsForOrder` exposes only prop **counts**, not key sets — the very drift you are hunting (a missing manifest) would show up as a smaller count with no name attached.
Read the text, with `scripts/ticker-stats.mjs`'s `statsEndpoint()` as the cited precedent. A regex that fails to match must **throw a named error**, never silently yield an empty set — an empty set would make this guard vacuously green, which is the exact failure mode rf-29's guard shipped with.

**RULING 2 — assert the NON-RELEASE branch of the two `RELEASE_E1` ternaries, and say so in the test name.**
The release build's narrowing to epoch-1 is deliberate and correct. A guard that demanded 10 keys from the release branch would be asserting a bug into existence. Parse the `:` (else) branch of those two objects.

**RULING 3 — the guard compares SETS and names the difference. Not counts.**
`assert.equal(keys.length, files.length)` would pass a fallback that lists `epoch-3` twice and omits `epoch-4`. Compare sorted key sets and put the symmetric difference in the assertion message, so a future red says *which* manifest is missing, not merely that a number moved.

## SCOPE (numbered; each item is testable)

1. **New file `scripts/glob-fallback-completeness.test.mjs`** — a `node --test` guard, mirroring `scripts/town-era-props-node-safety.test.mjs`'s shape.
2. For **`src/town/townEraProps.ts`**: assert the `fallbackTownEraPropManifests` key set, the set of static `era-props.e*.json` import specifiers, **and** the set of `assets/pilots/plaza-props-3d/era-props.e*.json` files on disk are **all three equal**. (Three-way, because a static import with no fallback key is just as broken as a fallback key with no import — the latter would not even compile, the former loads a file into the bundle and never uses it.)
3. For **`src/meta/ContractFamilies.ts`**: assert the same key-set-equals-disk-set property for all **four** maps, using the **else** branch for the two `RELEASE_E1` ones (RULING 2), against `assets/contracts/*/manifest.json`, `families.json`, `caps.json`, `contracts.json` respectively.
4. **Register it in `package.json`'s `test:node-guards`** list, in alphabetical position (the list is alphabetical — put it after `scripts/entry-damage-table.test.mjs`).
5. **MANDATORY MUTATION CONTROL, run and shown, both maps:** (a) delete one key from `fallbackTownEraPropManifests` → the guard must go **RED naming that manifest**; restore byte-exact. (b) delete one key from `ContractFamilies`' **else**-branch `fallbackManifests` → **RED naming that epoch**; restore byte-exact. Then (c) prove the regex-read is not silently empty: temporarily rename `fallbackTownEraPropManifests` in the source → the guard must fail with your **named read error**, not pass. Restore. Paste all three outputs and confirm `git diff -- src/` is **empty** at the end.

## FIREWALL

**TOUCH-ONLY:** `scripts/glob-fallback-completeness.test.mjs` (new) · `package.json` (the one `test:node-guards` line).
**NO — do not edit, for any reason:** anything under `src/` (this is a test-only slice; the mutation controls must be **reverted**, proven by an empty `git diff -- src/`) · anything under `e2e/` (F-1093-3 / F-1095-2: editing `e2e/` to reach green is a forbidden green on this board) · `scripts/town-era-props-node-safety.test.mjs` (rf-35's guard — leave it exactly as it is) · `scripts/deploy.sh` (F-1073-1) · `tasks/goals.json` / `STATUS.md` / `tasks/BACKLOG.md` / anything under `reviews/` (fire-owned bookkeeping) · the JSON assets themselves — **do not add `era-props.e6.json` or `e7`**; if you think a manifest is missing, that is a finding to REPORT.

## IF THE GUARD LANDS RED

Then a fallback really has drifted and the baseline table above is out of date. **Do not "fix" it by editing the guard, and do not add the missing key to `src/` yourself** (that is a one-line `src/` edit this firewall forbids, and it deserves its own reviewed slice). Report: which map, which key, and whether the file exists on disk. A red here is this task **succeeding**.

## SELF-CHECK (run these exact commands; paste real output, both projects where applicable)

1. `npx tsc --noEmit` → **0**. (Note honestly: `tsconfig` does **not** cover `scripts/`, so tsc says nothing about your new file — cite it as unchanged-clean, never as proof your guard compiles.)
2. `npm run build` → **0**.
3. `node --test scripts/glob-fallback-completeness.test.mjs` → **pass, 0 fail**, and paste the per-map assertion output.
4. `npm run test:node-guards` → node phase must read **tests 61 · pass 61 · fail 0** (it is **60/60** on main today — your file adds exactly one). ⚠️ **The overall command exits rc 1 on a green tree** because of **F-1088-1** (`scripts/test-ticker-stats.mjs` throws `StatsEndpointReadError: ticker-stats: could not read STATS_ENDPOINT from src/encyclopedia/liveStats.ts`), a separate step *after* the node phase. **Judge this gate by the phase counts, not the exit code — that trap has now misled seven drains.**
5. `npx playwright test --list` → must still print **`Total: 2378 tests in 330 files`** and exit **0**. (Zero is the failure signature; a non-zero total is the contract.)
6. The three mutation-control outputs from scope 5, plus `git diff -- src/` printing **nothing**.
7. `git show --stat HEAD` → **exactly two files**: the new script and `package.json`.

No screenshots and no boot probe are owed: this slice adds a node-side test and changes no rendering, no sim, and no bundled code.

**READY-FOR-GATES** — report: the five key-set comparisons with their real numbers, the three mutation-control outputs, the node-phase count, the collection total, and any manifest you found on disk that no fallback lists (a finding, not a fix).
