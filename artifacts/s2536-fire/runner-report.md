# Chapter evidence opt-in report

Date: 2026-09-07

## Provenance

- Base commit: `b10b52514cbf7e460f0f22f69bda3c376d21bf9a` (`main` and lane HEAD at pre-flight).
- Required ancestors: `81eca582848186527e04a825786f1a10dfe2cbd9` and `9b3da574e939fcbf8ca590eabfaf119c7a923a49` both present on `main`.
- Engine era: 5, `the Replayed Board`.
- Current engine-era pin: `32c940079ba3dd1921ca2be10a4a0d5a1de36f49c9199e1f99ecc02230f9f33d` (`assets/engine-era.json`, pinned 2026-09-07).
- Pre-flight: clean tree, `main..HEAD` empty; `npm ci` and `npm run build` green before edits.

## Change

Seven existing writers now use `test-results/evidence/<existing-basename>/` by default and retain their original tracked path only when `GR_REFRESH_EVIDENCE=1`: the six SS-06 through SS-11 screenshot helpers and the Moth Season ride writer. Screenshot calls, names, options, assertions, triggers, test titles, seed, trace and simulation code are unchanged. No helper or dependency was added.

## Moth Season refresh

| Measurement | Before | Explicit refresh |
| --- | --- | --- |
| `eventLogHash` | `fnv1a32:e16244f9` | `fnv1a32:5872d6c4` |
| Trace array rows | 93 | 94 |
| File SHA-256 | `e27aa13ae1aaa4692fde4e6f3131013594cc947ca372b8b512704257a572f105` | `754a51b4e6aa342bbdc9e7d944cea50c67c0b0b462bb6c13a600d98dc5f667e7` |

`253927e1f` introduced the retained ride with the old hash and 93 trace records. F-AGE2-3 later identified that retained baseline as stale. The direct diff from `253927e1f` to this refresh changes the hash and appends exactly one terminal trace object (`turn: 93`, wave 12, dark/cut corridor). The review's historical “22 more trace rows” is the JSON line-diff size: the current structured count is 93 to 94, while the diff adds 22 textual lines (the hash line plus the multi-line object). Today's measured hash matches the review's `5872d6c4`; no simulation code was changed to chase historical evidence.

Moth command evidence:

- Plain run before refresh: 3/3 pass; retained SHA stayed `e27aa...`; scratch ride created.
- Explicit refresh run: 3/3 pass; retained ride updated once to `754a...`.
- Plain run after refresh: 3/3 pass; retained SHA stayed `754a...` byte-identically.

## Verification

- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS before and after the edit. Existing missing raw-asset and chunk-size warnings only; asset-diet PASS at 1,158,214 / 1,500,000 bytes.
- Browser command: the six named specs, desktop-chrome + mobile-chrome, one worker, `--trace=off`, external server `http://127.0.0.1:5313`; owned PID stopped and port 5313 confirmed free.
- Browser result: 66/68 PASS in 22.1 minutes. Every screenshot-producing flow passed on both projects with zero console/page errors.
- Scratch evidence: 50 PNGs created under the six `test-results/evidence/shots-ss-*` directories.
- Retained evidence: all 50 current tracked PNG index blob IDs remained byte-identical. The task/review says 48, but the live index has 50: 10 + 6 + 8 + 8 + 10 + 8 across SS-06 through SS-11. The sparse checkout intentionally does not materialize those retained PNGs; index blob comparison avoids changing that state.
- Opt-in inspection: all six `SHOTS` branches still select their original `reviews/shots-ss-*` directory for literal `GR_REFRESH_EVIDENCE=1`; the Moth branch still selects `artifacts/e3-moth-season`.
- `git diff --check`: PASS.

## Pre-existing browser red

Both projects failed only `every SS-10 artKey names a plate that is actually on disk`: `e9-dome-basin-arrival -> plate-contract-e9-dome-basin`. `assets/raw/plate-contract-e9-dome-basin.png` is tracked in `HEAD` as blob `b8d61f147eb748354fd2c4e545a54220c3cdd480` but is absent from this sparse worktree, so `existsSync` returns false independently of this path-only change.

The prescribed lookup initially failed because `logs/suite-red-inventory.md` is also sparse-omitted. Running the same tool against temporary copies read from `HEAD` returned:

`NOT-IN-INVENTORY — e2e/ss-10-e9-beats.spec.ts — every SS-10 artKey names a plate that is actually on disk — snapshot date 2026-08-11`

It also warned that the snapshot is stale (26 days; 361 subject commits). No assertion was weakened and no out-of-scope asset was materialized.
