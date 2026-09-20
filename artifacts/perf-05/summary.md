# PERF-05 Startup Pass

Throttle profile: CPU 1.25x, network latency 1 ms, download 20,000,000 B/s, upload 5,000,000 B/s.

| Project | TTI before | TTI after | First frame before | First frame after | Boot bytes before | Boot bytes after |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| desktop-chrome | 2693 ms | 2625 ms | 2518 ms | 2464 ms | 5,949,428 | 3,860,316 |
| mobile-chrome | 1516 ms | 1459 ms | 1356 ms | 1324 ms | 5,952,840 | 3,867,510 |

Lazy set deferred from pre-first-frame:

- `bld-claim-office.png`
- `bld-palisade.png`
- `bld-sentry-beacon.png`
- `bld-signal-turret.png`
- `bld-sluice-works.png`
- `bld-stockpile-yard.png`
- `char-prospector-portrait.png`
- `char-prospector-sheet-hover4-a-r0c0.png`
- `char-prospector-sheet-hover4-a-r0c1.png`
- `char-prospector-sheet-hover4-a-r0c2.png`
- `char-prospector-sheet-hover4-a-r0c3.png`

After-state network assertions:

- Noncritical textures before first frame: none.
- Prefetched before first wave spawn: `bld-palisade.png`, `bld-sentry-beacon.png`, `bld-signal-turret.png`, `bld-sluice-works.png`, `bld-stockpile-yard.png`.
- Console errors: none.
- Page errors: none.
- Asset errors: none.

Validation:

- `npx tsc --noEmit`
- `npm run build`
- `e2e/perf-05-startup.spec.ts` on desktop and mobile
- Adjacent set on desktop and mobile: `044-start-screen`, `m1-01`, `m2-01`, `perf-01`, `perf-02`, `perf-04`, `task-025`
