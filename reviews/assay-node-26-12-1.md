# Drain review: `assay-node-26-12-1`, the county's Node pin moves to 26.12.1 with the replay-determinism proof (engine-pinned); the droplet switch is the next act

**Branch** `art/portraits-e5-e10-generated` at `357cf6e77` · **merge** `2bbc6df06` · engine hash #76 `aa1435e2` · drained attended 2026-10-22 09:27Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `asn1`).

**Verdict: LANDED.**

**Slice / branch / tip:** `assay-node-26-12-1`, lane-d `art/portraits-e5-e10-generated` (the branch name is history; the commit is path-scoped), `357cf6e77`, Astra gpt-6-astra, 124,876 tokens, 2026-10-22 08:16Z to 08:37Z. Engine-pinned landing (same era), attended, deployed.

**What it does.** The county's ledger, assay worker and ledger backup run Node 26.4.0 (2026-06-24); Node shipped security releases in July (fixed 26.5.1) and October 2026 (fixed 26.12.1), and the county's Node version is a law ("exactly"), kept so a tape replays to the same verdict on the worker as on the rider's machine. The task moved the pin the only lawful way: it installed 26.12.1 beside 26.4.0, selected 29 retained tapes carrying verified slips (heat 14 first, then heat 13), replayed every one under both runtimes with the assay instrument, and compared verdict, secured score, final gold, final wave, the secure snapshot and the replay's content hash. Twenty full replay pairs, zero disagreements; nine candidates could not produce a full replay under either runtime (identically) and are listed. Then the constant `CANONICAL_ASSAY_NODE_VERSION` became 26.12.1, the two unit files' ExecStart paths and the ops doc's paths and law sentence moved with it, and the worker's refusal fixture expects 26.12.1 and refuses 26.4.0.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| Replay proof | 20 of 20 full replay pairs byte-identical under 26.4.0 and 26.12.1; 0 disagreements; the table in `artifacts/assay-node-26-12-1/report.md` names every tape; `compare.py --fresh` re-runs all 29 |
| Of the twenty | 18 match their historical claim; 2 are rejected identically by both runtimes (heat-14 Twin Banks claimed 556 gold, replays 389; a heat-13 Dry Gulch): engine drift against those retained slips, the same under both runtimes, F-ASN1-1 |
| `scripts/assay-replay.test.mjs` / `assay-worker.test.mjs` / `river-assay.test.mjs` | 9/9, 12/12, 3/3 under 26.12.1 (re-run attended on the lane tree); the same under the Mac's homebrew 26.4.0 and the runner's 23.11.1 (the worker test resolves the canonical runtime from `~/.nvm`) |
| The refusal | `~/.nvm/versions/node/v26.4.0/bin/node scripts/assay-worker.mjs --once --dry-run` exits 1 before any API access: "assay worker requires Node 26.12.1 exactly; found 26.4.0" (`wrong-runtime.json`) |
| Engine hash | pre-change `2d180e6bad69…`, new `b813de7b3a09…`; pinned in era 6 by this landing |
| tsc / build | exit 0 / exit 0 (`tsc.log`) |
| Evidence budget | 0.5 MB added |
| Merge | `git merge-tree` clean against main (0 conflicts) |
| Release build / payload / halo / null floors / release suite / ledger battery / pin | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. Lane-touched: `scripts/assay-replay-agent.mjs` (the constant), `scripts/assay-worker.test.mjs` (the fixture), `ops/droplet/goldrush-assay.service`, `ops/droplet/goldrush-ledger-backup.service`, `docs/ops/agenttown-server.md`. New: `artifacts/assay-node-26-12-1/**`. No `src/**`; `hash: pin` because the constant's file is in the engine corpus.

**Findings.**
- **F-ASN1-1 (recorded, pre-existing):** two retained verified slips no longer reproduce under the current engine, identically under both runtimes; the county would reject those historical claims today. Not this landing's; a note for the assayer's lineage sweep.
- **The droplet switch is the next act:** on the owner's word, `scripts/attended/droplet-maintenance.sh node 26.12.1` installs the runtime with nvm, repoints the three units, restarts the ledger and the assay worker and verifies both start; until then the worker on the box (26.4.0) keeps running its current engine copy and the repo's pin is ahead of it.
- **The Mac:** `~/.nvm/versions/node/v26.12.1` is installed for the worker tests; the batteries themselves still run under the Mac's usual node.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| strict release build (the assertion) | `(strict, the assertion): rc=0 [release-build] E1-only: 1128 files, 97739109 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` |
| first-town payload | `34355296 bytes` |
| halo | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` |
| null floors | `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (374.5s).` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 162 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the release suite under its own config | `(own config): rc=0   30 passed (2.2m)` |
| e2e both projects, --workers=1 | `rc=0   24 passed (2.0m)  09:10Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 4 ℹ pass 3 ℹ fail 1 ℹ skipped 0 ℹ tests 5 ℹ pass 4 ℹ fail 1 ℹ skipped 0 ℹ tests 1048 ℹ pass 1041 ℹ fail 2 ℹ skipped 5  09:27Z` |
| engine hash | `merged: aa1435e29f312553b1fa9329ca6872bb1601a5b82b50741c400b95de8be895a3 (pinned 378f9213f5a7d0f63e063262bd691f2eb0c64df30a9bb3e58061fb5a45f2a817)` |
