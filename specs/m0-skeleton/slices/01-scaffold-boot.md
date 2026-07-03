# m0/01-scaffold-boot

**Contract:** a known-good Vite+TS+three.js game builds, runs, and passes its own harness inside this repo. Doubles as the sandbox spike (proves `npm install` in the mounted repo; if it fails, build in `~/work/goldrush` and rsync — record the finding in STATUS.md).

**Seam:** run `python3 vendor/skills/threejs-game-skills/skills/threejs-gameplay-systems/scripts/create_threejs_game.py` into a staging dir (repo root is non-empty), merge contents to root, project name `gold-rush`. Keep the scaffold demo (capsule + pickups) intact this slice — it IS the checkpoint. Owned deviations, all small: (a) Playwright `testDir` → `e2e/` (CLAUDE.md §4); (b) `vite.config.ts` `base: './'`; (c) add `src/core/Rng.ts` (mulberry32, seeded via `?seed=`) and a URL debug-param contract in `src/core/DebugParams.ts`: `?debug`, `?seed=`, `?timescale=`, `?nospawn`, `?stress=N` (parsed now, consumed by later slices — cheap now, expensive to retrofit).

**Playable checkpoint:** the stock scaffold arena — WASD moves the capsule, pickups collect.

**Verification:** GATE-STD; `npm install` outcome documented; scaffold's own visual spec green unmodified (relocated to `e2e/`); `scripts/inspect-threejs-canvas.mjs` non-blank.

**Deps:** none. Nothing else starts until this is green.

**Firewalls:** do not "improve" scaffold code beyond the three owned deviations. No game design. 15-min timebox on the staging-merge problem; fallback = hand-copy `assets/threejs-vite-game/`.
