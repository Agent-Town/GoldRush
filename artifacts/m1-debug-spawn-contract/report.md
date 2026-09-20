# M1 debug spawn contract

Base: `1498270e4005f366b13189bbf29b9aba27780217`

## Before

- Pre-flight: clean lane, `main..HEAD` empty, required F-RPA-4 dependency present on `main`, no matching undrained done-move.
- Existing positive case boots `/?nowaves&nolevel` without debug consent, presses `T`, then expects an enemy.
- Reproduction: `before-desktop.txt` records the positive case failing after its plain boot: expected `enemiesAlive > 0`, received `0` after the 5-second poll.

## After

- Positive case now opts into the existing `?debug` URL contract while preserving its spawn, contact-death, restart, health, and error assertions.
- Added one plain `?nowaves&nolevel` negative control that waits for a running frame, presses `T`, waits for another frame, and asserts zero enemies and zero console/page errors.
- Browser gate: `10 passed (1.1m)` with `--workers=1` (`5` desktop-chrome, `5` mobile-chrome); the positive and negative cases both assert zero console/page errors.
- `npx tsc --noEmit`: PASS (exit 0, no output).
- `npm run build`: PASS, including the asset-diet gate.
- `git diff --check` and touch-only diff check: PASS.
- Full simulation replay: not run; not required for this test-only URL/negative-control change.

## Evidence

- `before-desktop.txt`: bounded clean-base reproduction, 1 failed.
- `after-browser-gates.txt`: complete desktop/mobile M1 spec, 10 passed.
- `tsc.txt`, `build.txt`, `scope-checks.txt`: complete command logs and exit/result evidence.
