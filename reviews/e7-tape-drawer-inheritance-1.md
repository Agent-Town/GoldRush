# Drain review: `e7-tape-drawer-inheritance-1`, a Signal-Era profile keeps its Tape Reel on earlier maps again; F-SPH2-2 closed

**Branch** `sol/open-findings-astra` at `5670f2134` · **merge** `f6b61e4c5` · engine hash #72 `2f11c1a5` · drained attended 2026-09-28 11:38Z in a detached chain worktree with the scratch store at `5793a96`; deployed (scripts/attended/land.sh, config `tdi1`).

**Verdict: LANDED.**

**Slice / branch / tip:** `e7-tape-drawer-inheritance-1`, lane-a `sol/open-findings-astra`, four commits (attempt 1 `0d7949951` + `7eda17dd7`, attempt 2 `fdfef8530` + `5670f2134`), Astra gpt-6-astra, 234,073 tokens in all, 2026-09-28 06:58Z to 07:31Z. Attended pinned landing under `land-held.sh`, after the music toggle (pinned landings one at a time); the fires' diff-selected wrapper cannot finish a `src/**` landing's full Node battery (F-2737-1).

**What it does.** Closes F-SPH2-2: since `7c2744e5a` (2026-09-12) a `?contract=` boot took the contract's epoch for everything, so a profile that had reached the Signal Era lost its Tape Reel on every earlier map. One exported helper in `src/meta/ContractFamilies.ts` returns the campaign epoch's order for a contract boot when it is the higher; the mount at `src/game/Game.ts:1925` uses it. Explicit `?epoch=` previews (the debug boots the spec's `open()` helper uses) keep the previewed map's own state, which is what the acceptance spec encodes and what attempt 1 had missed. `activeEpochId()`'s map-content semantics are unchanged; no gameplay or sim change.

**Evidence (real numbers).**

| Check | Result |
|---|---|
| `e2e/e7-playbook-surface.spec.ts` ("the tape drawer arms at the Signal Era and remains inherited afterward"), both projects | exit 1 → 0; 4 of 4 passed; the spec untouched |
| Plain-boot probes | 2 of 2: a fresh E6 profile has no drawer; an E7 profile keeps it on E1 and E6 maps with the correct map epochs |
| Adjacent (the audit spec, m2-01, task-025 and the rest of the task's list) | 26 of 26 |
| tsc / build / console and page errors | green; zero errors in the checked boots |
| Evidence | 1,156,332 B kept in the tree; the first attempt's 577,200,597 B of traces and results moved to `~/.goldrush/evidence/e7-tape-drawer-inheritance-1/` |
| tsc / release build / payload / halo / null floors / release suite / the four specs / ledger battery / pin | measured by this landing's gates (see the gates log) |

**Merge classification.** Base: main at the chain cut. New: `artifacts/e7-tape-drawer-inheritance-1/**` (compact). Lane-touched: `src/game/Game.ts` (the mount condition), `src/meta/ContractFamilies.ts` (one exported helper). `src/**` changed: `hash: pin`, measured last. Conflicts: none expected; the toolkit records any.

**Findings.**
- **F-SPH2-2 closed** by this landing.
- **Attempt 1 read the spec as contradictory** (the E7-seeded profile's E6 preview expecting no drawer); it was not: the spec distinguishes an epoch preview from a contract boot. Recorded in the task's attempt-2 paragraph; no new finding.
- **Owner's desk:** nothing new.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| strict release build (the assertion) | `(strict, the assertion): rc=0 [release-build] E1-only: 1128 files, 97727876 bytes, zero later manifest ids or plate/GLB assets (checked against 283 later-asset stems)` |
| first-town payload | `34350679 bytes` |
| halo | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaqu` |
| null floors | `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (306.9s). — re-run 10:59Z in the chain worktree under the drain lock after the first run's vite transport disconnect (crash, not a moved floor)` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| the ledger battery | `rc=0 ℹ tests 1263 ℹ pass 1260 ℹ fail 0 ℹ skipped 3` |
| the release suite under its own config | `(own config): rc=0   30 passed (2.2m)` |
| e2e both projects, --workers=1 | `rc=0   30 passed (5.1m)  10:18Z` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 4 ℹ pass 3 ℹ fail 1 ℹ skipped 0 ℹ tests 5 ℹ pass 4 ℹ fail 1 ℹ skipped 0 ℹ tests 1040 ℹ pass 1033 ℹ fail 2 ℹ skipped 5  10:36Z` |
| engine hash | `merged: 2f11c1a5b75338d48d7ce7823646ff4d5ff1bd0d55ab13a865cf5d0917e5a92c (pinned 2d180e6bad6933ef15db2a006aaa0a1a3be8a97efdf9416cbc4646be71be4f6d)` |
