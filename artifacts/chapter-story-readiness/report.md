# Chapter story readiness evidence

- Date: 2026-09-07
- Branch: `main`
- Base: `03d9fe1a1bcd6c771d085175b51bc6e02583b10d`
- Node: `v23.11.1` (`/Users/robin/.nvm/versions/node/v23.11.1/bin/node`)
- Server: port 5315, private optimizer cache `/tmp/gr-chapter-story-readiness-vite.vTK8wV`; stopped after verification

## Readiness finding

`src/main.ts` schedules `import('./story')` through two `requestAnimationFrame` callbacks at lines 153-158 and 520-522. `StoryRuntime` publishes `window.__GR_STORY__` only from its constructor via `installDebugHandle` at lines 46-54 and 299-307. Contract diagnostics and the story reader therefore have separate readiness boundaries.

A bounded Chromium observation held only the `/src/story/index.ts` request. While that import was pending, `Boolean(window.__GR_STORY__)` was `false`. After releasing the import and waiting for the handle, the reader existed and `pending()` returned `[]`. Absence of the reader is therefore observably distinct from an installed reader with no queued beats.

A second five-load observation found the installed reader with an empty queue on every load; handle publication occurred at 220.3-430.5 ms after navigation start.

## Change

Added the existing `await page.waitForFunction(() => Boolean(window.__GR_STORY__))` readiness pattern immediately before the strict queue assertion in the six Frontier exclusion cases. No assertion, timeout, runtime path, helper, screenshot declaration, or error watch changed.

## Verification

The first browser command used an over-anchored title expression and exited 1 with `No tests found`; it ran no tests. The corrected collection command listed exactly 12 tests in six files: six titles on desktop-chrome and the same six on mobile-chrome.

```text
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5315 npx playwright test --project=desktop-chrome --project=mobile-chrome --workers=1 --trace=off --grep 'The Claim cannot load .* beats in Frontier' --reporter=line e2e/ss-06-e5-beats.spec.ts e2e/ss-07-e6-beats.spec.ts e2e/ss-08-e7-beats.spec.ts e2e/ss-09-e8-beats.spec.ts e2e/ss-10-e9-beats.spec.ts e2e/ss-11-e10-beats.spec.ts
```

Result: **12 passed in 1.3m**. Each case reported zero suppressed known GLTFLoader blob errors.

```text
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5315 npx playwright test --project=mobile-chrome --workers=1 --trace=off --repeat-each=3 --grep 'The Claim cannot load Signal beats in Frontier' --reporter=line e2e/ss-08-e7-beats.spec.ts
```

Result: **3 passed in 22.8s**. Each repeat reported zero suppressed known GLTFLoader blob errors.

```text
npx tsc --noEmit
```

Result: **PASS**, no output, 5.6s.

```text
npm run build
```

Result: **PASS**, 20.8s. Vite built 2,154 modules; asset-diet reported the herald at 1,158,214 bytes under the 1,500,000-byte ceiling and completed the manifest asset reductions. Existing Vite chunk-size and mixed static/dynamic-import warnings remained warnings.

```text
git diff --check -- e2e/ss-06-e5-beats.spec.ts e2e/ss-07-e6-beats.spec.ts e2e/ss-08-e7-beats.spec.ts e2e/ss-09-e8-beats.spec.ts e2e/ss-10-e9-beats.spec.ts e2e/ss-11-e10-beats.spec.ts
```

Result: **PASS**. Diff is six insertions in six files.

## Limitations

Per task scope, no full browser suite or Node battery was run. F-2537-2 (M2 placement) and the held chapter-evidence output-path patch were not investigated or changed.
