# build-campaign-harness-e1 — E1 profile-threading campaign harness

- **Task:** `tasks/build-campaign-harness-e1.md`
- **Main-slot run:** `20260814-204651`
- **Candidate:** `save/build-campaign-harness-e1-s1771-hold` at `87d16e350b21a90d40d9b0d500c5b23a5d971caf`
- **Gated by:** s1771 in detached worktree `/tmp/gr-s1771-gate-20260814`

## VERDICT: HOLD — NOT MERGED

The five-file implementation is banked intact, but its focused test is named
`scripts/gr-sim-campaign.tests.mjs`. That plural suffix excludes it from both the normal
Node battery and the gate-caller audit. Renaming the same file to the repository's singular
`.test.mjs` convention immediately produces the real result: `NO CALLER` (F-1771-1).

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
