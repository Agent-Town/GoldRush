# Fresh-main perf chunk/atlas harvest

- **Fresh base:** `origin/main` at `2f1544da`
- **Read-only salvage:** `origin/sol/perf-chunk-atlas` at `bb19d760`
- **Scenario:** production preview, Chromium, 1280x800, active Claim at `/?debug&profile&nolevel&nopause&seed=harvest-perf`
- **Verdict:** retain the measured startup split; drop the stale atlas implementation

## Per-item disposition

| Salvage item | Status | Fresh-main evidence |
|---|---|---|
| Lazy `Game` run graph | **ALREADY-ON-MAIN** | `src/main.ts` already dynamically imports `Game`; the baseline emits a separate 704,245 B raw `Game` chunk. |
| Lazy `SpriteAnimator` prefetch graph | **LANDED** | Normal entry raw/gzip fell 195,338 B / 27,345 B; `SpriteAnimator` is now a separate 189,313 B raw chunk loaded by the existing post-frame prefetch. |
| Full-base benchmark outside normal startup | **LANDED** | Normal boot no longer installs the benchmark; `?bench=fullbase` loads a separate 6,646 B raw chunk and passes the desktop/mobile benchmark gate. |
| Character-frame atlases | **DROPPED-STALE** | Current character cells are no longer uniformly 256x256 (including 400x256, 384px, and 435x512 sources). A fresh native-size atlas cut reduced requests 250→94 and active p95 17.6→17.1 ms, but raised encoded active-run payload 20,266,027→28,488,040 B (+40.6%). A 256-only hybrid retained 250 requests and raised payload to 25,800,870 B (+27.3%). Both violate the measured-win law. |
| Atlas generator, runtime atlas owner, fixtures, comparator, and capture rig | **DROPPED-STALE** | These only support the rejected atlas path. Re-landing 1,000+ lines of one-off machinery would add no product win. |
| Async-load failure dialog | **DROPPED-STALE** | No new failure surface is introduced: `Game` was already lazy on main, and both retained imports use existing noncritical/diagnostic paths. |

## Static build comparison

Both builds use the same dependency tree and Vite production mode. Gzip values use Node `zlib.gzipSync`.

| Metric | Fresh main | Harvest | Delta |
|---|---:|---:|---:|
| Entry JS raw | 1,447,052 B | 1,251,714 B | -195,338 B (-13.5%) |
| Entry JS gzip | 339,303 B | 311,958 B | -27,345 B (-8.1%) |
| Total emitted JS files | 1,087 | 1,089 | +2 split chunks |
| Total emitted JS raw | 3,137,184 B | 3,138,049 B | +865 B (+0.03%) |
| Total emitted JS gzip | 874,558 B | 874,900 B | +342 B (+0.04%) |
| Emitted PNG files | 917 | 917 | unchanged |
| Emitted PNG bytes | 89,162,514 B | 89,162,514 B | unchanged |

The two new lazy outputs are `SpriteAnimator` (189,313 B raw / 25,253 B gzip) and `fullBaseBenchmark` (6,646 B raw / 2,426 B gzip).

## Startup trace

Resource rows use `responseEnd <= playable` for startup and a five-second active window for totals. Timing is inherently noisy, so the frame-law result below uses four alternating fresh-main/harvest pairs rather than either cold trace.

| Metric | Fresh main | Harvest |
|---|---:|---:|
| First frame | 1,541 ms | 1,537 ms |
| Playable | 1,697 ms | 1,696 ms |
| Startup requests | 40 | 41 |
| Startup encoded body | 10,982,723 B | 10,980,940 B |
| Five-second active requests | 250 | 250 |
| Five-second active encoded body | 20,221,208 B | 20,076,771 B |
| Runtime errors | 0 | 0 |

### Frame p95 law

Four alternating five-second active-Claim samples produced:

| Pair | Fresh main | Harvest |
|---|---:|---:|
| 1 | 17.4 ms | 17.5 ms |
| 2 | 17.6 ms | 17.2 ms |
| 3 | 16.9 ms | 17.5 ms |
| 4 | 17.1 ms | 17.0 ms |
| **Median** | **17.25 ms** | **17.35 ms** |

The median delta is **+0.58%** (`1.0058x`), passing the `<=15%` regression law.

## Gates

| Gate | Result |
|---|---|
| `npm install` | PASS |
| Preflight `npm exec -- tsc --noEmit` | PASS |
| Preflight and final `npm run build` | PASS |
| Final `git diff --check` | PASS |
| Production-preview current sprite/perf battery, desktop + mobile | PASS — 10/10 (`cast-motion-wiring`, `run-scene-animation-refresh`, `perf-01-stress-budget`, `perf-02-fullbase-bench`) |
| Plain production boot | PASS — canvas/profile ledger visible; zero console errors; zero page errors |
| Paired active-Claim frame budget | PASS — +0.58%, no runtime errors |

The salvage-era `066`, `task-031`, and `task-042` assertions are stale on current main because they require the retired four-frame Hero; current main's approved Hero is walk8. `perf-05` also currently classifies `favicon-32.png` as an `icon-` gameplay texture. Neither pre-existing assertion was edited; the current equivalents and perf/baseline gates above are green on both projects.
