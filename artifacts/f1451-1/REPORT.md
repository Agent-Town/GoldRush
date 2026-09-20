# F-1451-1 — ordinary E1 perf runs preserve retained evidence

## Cure

- The default `E1_PERF_STAGE` fallback is now `latest`. Explicit values, including
  `E1_PERF_STAGE=after`, still override it.
- Ordinary screenshots under `artifacts/e1-perf-pass/latest/` and ordinary census files matching
  `artifacts/e1-perf-pass/census-latest-*.json` are ignored. They are regenerable gate output, not
  retained factory history. The tracked `before/`, `after/`, `census-before-*`, and
  `census-after-*` evidence remains tracked and unignored.

## Required pre-cure / post-cure transcript

No `E1_PERF_*` variables were present for either reproduction command.

### Before the change

```text
$ npx playwright test e2e/e1-perf-pass.spec.ts --project=desktop-chrome --workers=1
✓ 1 [desktop-chrome] › E1 maps publish a pressure census and preserve pressure pixels (59.3s)
1 passed (1.0m)

$ git status --short -- artifacts/e1-perf-pass
 M artifacts/e1-perf-pass/after/desktop-chrome-e1-baron-pressure.png
 M artifacts/e1-perf-pass/after/desktop-chrome-e1-baron.png
 M artifacts/e1-perf-pass/after/desktop-chrome-e1-dry-gulch-pressure.png
 M artifacts/e1-perf-pass/after/desktop-chrome-e1-dry-gulch.png
 M artifacts/e1-perf-pass/after/desktop-chrome-e1-night-shift-pressure.png
 M artifacts/e1-perf-pass/after/desktop-chrome-e1-night-shift.png
 M artifacts/e1-perf-pass/after/desktop-chrome-e1-twin-banks-pressure.png
 M artifacts/e1-perf-pass/after/desktop-chrome-e1-twin-banks.png
 M artifacts/e1-perf-pass/after/desktop-chrome-the-claim-pressure.png
 M artifacts/e1-perf-pass/after/desktop-chrome-the-claim.png
 M artifacts/e1-perf-pass/census-after-desktop-chrome.json

$ git status --short -- artifacts/e1-perf-pass | wc -l
11
```

The live checkout measured 11 modified files, not the inherited estimate of 13: ten map PNGs plus
one census JSON.

```text
$ git checkout -- artifacts/e1-perf-pass
$ git status --short -- artifacts/e1-perf-pass
<empty>
```

### After the change

```text
$ npx playwright test e2e/e1-perf-pass.spec.ts --project=desktop-chrome --workers=1
✓ 1 [desktop-chrome] › E1 maps publish a pressure census and preserve pressure pixels (58.9s)
1 passed (1.0m)

$ git status --short -- artifacts/e1-perf-pass
<empty>

$ git status --short -- artifacts/e1-perf-pass | wc -l
0
```

The first post-cure check exposed that the root-level `census-latest-*.json` also needed an exact
ignore rule; the final two-project run below re-executed the same desktop path after that rule landed,
and the retained-tree status remained empty.

## Retained-evidence identity

These hashes were identical before the pre-cure run and after all final gates:

```text
29a95b6db12b3e0471daceb2b844cb7d8719a5024b82538e52179d73b9bcb9c5  artifacts/e1-perf-pass/before/desktop-chrome-e1-baron-pressure.png
06bcb5dd7fc703f96e7096efbae1a6fff08eb158892dbc3da772a5a7f96dc5f4  artifacts/e1-perf-pass/after/desktop-chrome-e1-baron-pressure.png
7b507a44198c9a06e9bd108e2ceff08fa05c948f22f7edd49eaf97953f46d7e3  artifacts/e1-perf-pass/census-before-desktop-chrome.json
ca204787106dfcb5774f796dc3a6beab0e4f93deec5ed0196f9ec551fa3f4b37  artifacts/e1-perf-pass/census-after-desktop-chrome.json
```

`git diff --exit-code HEAD -- artifacts/e1-perf-pass` also returned 0 after the final gate.

## Assertion identity and gates

The spec has nine `expect(...)` call sites before and after this edit; their text is unchanged.
The default path still executes, for each of the five contracts:

- pressure draw calls `<= 200`;
- pressure p95 `<= Balance.render.night.frameBudgetMs * Balance.render.night.collapseRatio`.

It then asserts empty console/page-error collections for both the census page and snapshot page.
The opt-in pixel-difference and cross-run baseline assertions remain unchanged behind
`E1_PERF_COMPARE_BASELINE=1`.

```text
$ npx tsc --noEmit
exit 0

$ npm run build
✓ built in 1.25s
[asset-diet] Herald dev-path art 1158214 bytes (1500000 byte ceiling).
exit 0

$ npx playwright test e2e/e1-perf-pass.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1
✓ desktop-chrome (58.7s)
✓ mobile-chrome (56.9s)
2 passed (2.0m)
```

Both error assertions stayed green; the server emitted only the existing `THREE.Clock` deprecation
warning, not a console or page error.

## Adjacent path census

`rg` over executable TypeScript/JavaScript found two references:

- `e2e/e1-perf-pass.spec.ts` is the sole direct reader/writer.
- `artifacts/f1440-2/gate-battery.mjs` is retained evidence tooling that passes
  `E1_PERF_ARTIFACT_DIR` to the spec; it does not directly read or write the tree.

