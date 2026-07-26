# rf-36 — glob fallback completeness (F-1097-2)

**Slice:** `lane-glob-fallback-completeness` · **branch:** `lane/e2-arsenal` · **lane tip:** `828508b3`
**Merged to main:** `b5b46ebddeeb7b5c036ec6d8a303ba79481aa950` · **drained by:** s1098 fire, 2026-07-27
**Base (merge-base):** `43ac51d1`

## VERDICT: MERGED — green, and green was the required outcome

s1097 measured all five fallback maps as complete *before* authoring, so this guard was
specified to land green: "if it lands red, you have found a real gap and that is a FINDING
to report, not a number to adjust." It landed green, and I re-measured rather than inherited.

## What it does

`src/town/townEraProps.ts` and `src/meta/ContractFamilies.ts` each resolve their JSON two
ways: `import.meta.glob` under Vite, which discovers files **by pattern**, and a
**hand-written fallback object** under node, which discovers nothing. The two can drift, and
drift produces **empty data, not an error** — one degree quieter than rf-33, which cost nine
days while at least throwing. The eras are actively being built (E2 live, Charter Press at
E4+), so `era-props.e6.json`/`e7` will be authored by someone with no reason to know a second
hand-written list exists in another file.

The guard asserts **key-set equality against disk** (not counts — a count check would pass a
map that lists `epoch-3` twice and omits `epoch-4`) for all five maps, and names the symmetric
difference so a future red says *which* manifest is missing.

## Evidence (measured on the merged tree)

| gate | result |
|---|---|
| `npx tsc --noEmit` | **0** (note: `tsconfig` does not cover `scripts/`, so this is cited as unchanged-clean, **not** as proof the guard compiles) |
| `npm run build` | **0**, `✓ built in 1.68s`, asset-diet unchanged (235 GLBs 84% cut, 53 PNGs 87% cut) |
| node phase (`test:node-guards` list) | **tests 61 · pass 61 · fail 0** — was 60/60 on main; adds exactly one |
| `npx playwright test --list` | **`Total: 2378 tests in 330 files`**, exit **0** |
| `git show --stat` | **exactly 2 files**, +88/−1 |
| `git diff main lane/e2-arsenal -- src/ e2e/` | **empty** — firewall honoured |

⚠️ Overall `npm run test:node-guards` still exits **rc 1** on a green tree because of
**F-1088-1** (`test-ticker-stats.mjs`, a step *after* the node phase). **Judged by phase count.**
That trap has now misled eight drains.

### The five key-set comparisons

| map | fallback keys | on-disk files | conditional |
|---|---|---|---|
| `fallbackTownEraPropManifests` | **7** (= 7 static imports) | **7** | no |
| `fallbackManifests` | **10** | **10** | yes — `RELEASE_E1` |
| `fallbackFamilyBundles` | **1** | **1** | no |
| `fallbackCapsBundles` | **1** | **1** | no |
| `fallbackContractBundles` | **10** | **10** | yes — `RELEASE_E1` |

Matches s1097's pre-authoring baseline on every cell. **No on-disk manifest was found that no
fallback lists.**

## Mutation controls — re-run by me on the merged tree, not inherited from the run report

| # | mutation | result |
|---|---|---|
| a | drop `era-props.e5.json` from the town fallback | **RED**, `missing: assets/pilots/plaza-props-3d/era-props.e5.json` |
| b | drop `epoch-6-atomic` from the **else**-branch `fallbackManifests` | **RED**, `missing: assets/contracts/epoch-6-atomic/manifest.json`, label reads `non-release branch` |
| c | rename `fallbackTownEraPropManifests` in source | **RED** with `GlobFallbackSourceReadError: could not read fallbackTownEraPropManifests` — **not** a vacuous green |
| d | **EXTRA, not demanded by the master** — empty the `RELEASE_E1` **?** branch entirely | **GREEN at 10 keys** |

Control (d) is the one that actually proves **RULING 2**. The master demanded the test *name*
say "non-release branches"; (d) proves the *behaviour* matches the name — the guard genuinely
parses the else-branch and does **not** assert the release build's deliberate epoch-1 narrowing
into a bug. A guard can be named for a claim it does not test; this one isn't.

`git diff -- src/` and `git status -- src/` both **empty** after restores — src/ byte-identical.

## Merge classification

Merge-base `43ac51d1`. **Perfectly disjoint**, no graft needed:
- **LANE-TOUCHED:** `package.json`, `scripts/glob-fallback-completeness.test.mjs` (new)
- **MAIN-MOVED:** `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `tasks/lane-glob-fallback-completeness.md` — all s1097 bookkeeping, none touched by the lane

`main:package.json` proved **byte-identical to base** (`521899ee…`) before applying, so the
two lane files were taken directly. No conflict, no 3-way.

## Findings

**F-1098-1 (informational, no action) — the guard's denominator is 5, and 5 is complete.**
I checked rather than assumed, because a completeness guard with a narrow denominator is a
known trap here (F-1054-1, F-1055-1). There are **29** `import.meta.glob` sites in `src/` and
**7** node-fallback ternaries, but only **5** hand-written fallback maps. The other two —
`src/game/Upgrades.ts:308` and `src/crafting/StatSimHarness.ts:155` — fall back to `{}`
**by design**, and both modules are browser-only at runtime (callers: `src/main.ts` and the e2e
specs). Their `{}` is node **collection-safety**, not a driftable map: there is no key set to
compare. So five is the complete set of maps this guard could meaningfully cover.

**No blocking findings. No corrective task spawned.**

## Duties

- **No gazette item owed** — test-only slice, zero player-visible change, zero `src/` bytes.
- **No deploy owed** — no gameplay-affecting code merged (and F-1085-3 has deploy broken regardless).
- **No screenshots/boot probe owed** — the master waived them explicitly: node-side test, no
  rendering, no sim, no bundled code changed.
- **Goal leaf** `rf-36-glob-fallback-completeness` → `merged` + full 40-char `mergeHash`.
  ⚠️ My first edit used `mergeCommit` and `goal-tracker.test.mjs` caught it
  (`merged without Git evidence`); the field is **`mergeHash`**. Re-ran after my own
  bookkeeping — 2/2 pass. That is s1097's lesson ② working as intended.
