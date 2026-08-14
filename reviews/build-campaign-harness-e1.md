# build-campaign-harness-e1 — E1 profile-threading campaign harness

- **Task:** `tasks/build-campaign-harness-e1.md`
- **Main-slot runs:** `20260814-204651`, corrective `20260814-214944`
- **Candidate archive:** `archive/build-campaign-harness-e1-s1771-hold` at `87d16e350b21a90d40d9b0d500c5b23a5d971caf`
- **Merge:** `9849623b6e27d4d64e2c8b28b747c503de6c4b97`
- **Gated by:** s1771–s1773 in detached custody

## VERDICT: PASS — MERGED

The corrected six-file implementation is merged. F-1771-1 was cured at the gate topology:
the focused test now uses the repository's singular `.test.mjs` convention and is explicitly
called by `test:node-guards`.

## What the candidate does

It adds an injectable storage option to `HeadlessContractSim`, a small in-memory `FakeStorage`,
and an E1 campaign runner that selects legal contracts from carried profile state, writes a
checkpoint after each secured leg, supports resume, and hashes leg boundaries plus the whole
campaign. The deterministic fixture is explicitly test-only; per the ratified spec it proves
campaign plumbing, not that a script beats E1.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check --strict` | **CLEAR** — registered leaf remains `planned` |
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0** |
| focused campaign test as delivered | **3 pass / 0 fail** |
| single-contract control | **rc=0**, `eventLogHash` `fnv1a32:b128731a` |
| campaign determinism | two runs produced `fnv1a32:4f363fd5` |
| resume | resumed at `e1-dry-gulch`; final checkpoint has 5 legs, 5 scores, 10 research nodes |
| gate-caller audit as delivered | **rc=0**, but the plural test is outside its subject set |
| manufactured control: rename only to `.test.mjs` | **rc=1**, `NEW scripts/gr-sim-campaign.test.mjs NO CALLER` |

Full transcript: `artifacts/build-campaign-harness-e1-gate-s1771.txt`. Manufactured-red
transcript: `artifacts/build-campaign-harness-e1-manufactured-red-s1771.txt`. Campaign evidence:
`artifacts/gr-sim-campaign-e1-20260814/`.

The full Node battery was not repeated after the blocking caller-topology failure. The runner's
own full-battery attempt was red on pre-existing site anchors and did not make this new test part
of the battery.

## Finding

### F-1771-1 — BLOCKING: the new test evades the battery by filename

`package.json` enumerates singular `*.test.mjs` files in `test:node-guards` and contains no
`gr-sim-campaign` entry. `scripts/gate-caller-audit.mjs` likewise discovers only files ending in
`.test.mjs`. The submitted `.tests.mjs` file is the only plural instance under `scripts/`, so the
reported caller-audit green is vacuous for the feature's sole focused test.

The red path was manufactured rather than inferred: with no code change beyond renaming the file
to `scripts/gr-sim-campaign.test.mjs`, the audit exits 1 and names it `NO CALLER`. The minimal cure
is therefore both parts together: use the singular filename and add that exact test to
`test:node-guards`. The original firewall excluded `package.json`, making its own requirement that
the Node battery cover the new test impossible; the corrective rider below widens only that seam.

## Custody and next action

The candidate is preserved on `save/build-campaign-harness-e1-s1771-hold`; undecided code was never
committed to main. The original task now carries a narrow s1771 corrective rider. Re-run it after
the attended-owned `tasks/goals.json` edit clears, then repeat the full sim-required battery before
merge.

## s1772 corrective rerun — custody green, merge still held

Main rerun `20260814-214944` restored the banked candidate, renamed the focused test to
`scripts/gr-sim-campaign.test.mjs`, and added that test to `test:node-guards`. The done-move is
policy-clear. A detached gate at `/tmp/gr-s1772-gate.zLcJTk` was reconstructed from the banked ref;
all six candidate paths byte-match main's runner output.

Fresh drain-side evidence is green for `npx tsc --noEmit`, `npm run build`, the focused campaign
suite (3/3), and `gate-caller-audit --include-untracked`. The complete Node battery has not yet
produced admissible drain evidence: its first s1772 attempt self-reported `CONTENDED — 2 concurrent
batteries` while the independently claimed lane-b run was executing its own Node battery, so s1772
aborted it immediately. The slice remains **HOLD — NOT MERGED** until `npm run test:node-guards`
runs alone; no source verdict is inferred from the aborted run.

## s1773 final drain — PASS

All six candidate paths were re-hashed against detached custody and matched byte-for-byte. The
complete Node battery then ran alone: **464 tests / 457 passed / 5 skipped / 2 failed**. Both failures
are one pre-existing site-anchor defect (`news.html` links to missing `index.html#teaser`), once
directly and once through the fixture-owner wrapper; an isolated fresh worktree at clean main
reproduced the exact same failure while every site input was unchanged from candidate custody.

The campaign suite itself passed **3/3**, preserving the single-contract control hash
`fnv1a32:b128731a`, producing whole-campaign hash `fnv1a32:4f363fd5` twice, and resuming at
`e1-dry-gulch`. Plain-boot probes passed **1/1 desktop + 1/1 mobile** at `--workers=1`, including
zero console/page errors. Independent diff review found exactly the six declared paths and no
browser, balance, E2+, or single-contract change. The merge is bench infrastructure only; the
optional storage argument defaults to the old null stub and no browser caller supplies it.
