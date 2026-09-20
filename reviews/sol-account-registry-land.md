# Review — sol-account-registry-land (Astra's atomic account registry, landed behind a closed gate)

Slice: `sol-account-registry-land` · branch `sol/account-registry-land` · tip `b97fa403a` · base `2fbae0611` · gated by s2642 on a detached trial merge (`bc737cbe4`) in `gate-s2642/`.

## Verdict

**PASS — MERGE.** tsc and build green on the merged tree; the slice's own suite (`test:accounts`) goes from structurally RED on main to GREEN; both adjacent suites green at the runner's own counts; the closed-gate proof passes and **its two manufactured mutants both red**, verified by me rather than inherited. The three broad-battery failures the runner reported honestly are each proven to be structurally impossible for this diff.

## What it does

Lands the account registry Astra designed on 2026-09-08..12 and left uncommitted in a Codex worktree. `functions/api/_account-registry.ts` is a SQLite-backed Durable Object that owns account identity; `server/ledger/storage.mjs` gains the two matching local methods (`resolveAccount` via `INSERT … ON CONFLICT DO NOTHING`, `retireAccount` via an accountId-checked `DELETE`). `functions/api/_accounts.ts` replaces the old non-atomic KV get/put allocator: a first login now resolves through the atomic owner, and if no atomic owner is reachable it returns **503 `account_registry_unavailable`** rather than minting an identity. Deletion checks registry readiness first, retires only the authenticated generation, and preserves the retry session when the registry fails afterwards.

**Nothing is deployed and nothing migrates.** The Pages binding in `wrangler.toml` is landed as a *commented* deployment-day block with the scope deliberately unset, so `ACCOUNT_REGISTRY` and `ACCOUNT_REGISTRY_SCOPE` are both absent and the gate is closed by construction. `docs/ops/account-registry.md` is the owner's deploy-day checklist: five steps, each with its verification and its rollback sentence.

## Evidence

Gated on the merged tree in a detached worktree (§3.0b). Load average at gate time **24.10 on 16 CPUs**, with lane-a and lane-c runners live throughout — named per F-2452-1, because every duration below is a loaded reading and is therefore a ceiling, not a floor.

| Check | Result | Numbers |
| --- | --- | --- |
| `npx tsc --noEmit` | **rc=0** | 17.0 s, no output |
| `npm run build` | **rc=0** | 52.0 s, asset-diet 814,660,832 → 122,665,700 B |
| `npm run test:accounts` | **rc=0** | 13.9 s — **43 KV + 43 SQLite** |
| `npm run test:mp` | **rc=0** | 15.5 s — **466** relay checks |
| `npm run test:stats` | **rc=0** | 27.6 s — 87 stats + 320 KV + 320 SQLite + 26 ledger HTTP |
| `review-account-creation.test.mjs` | **rc=0** | 3.0 s |
| `closed-gate.test.mjs` (clean) | **rc=0** | 2.5 s |
| `bootstrap-dry-run.test.mjs` (clean) | **rc=0** | 1.0 s |
| `GR_REGISTRY_MUTANT=kv-fallback` | **rc=1 — EXPECTED FAIL** | 2.6 s (reverse control) |
| `GR_REGISTRY_MUTANT=delete-before-readiness` | **rc=1 — EXPECTED FAIL** | 2.2 s (reverse control) |

Every suite reproduces the runner's own counts to the digit, which is what makes its report believable rather than merely confident.

**The control that matters.** `test:accounts` is RED on main *structurally*, not by flake: `main:scripts/test-accounts.mjs:285` resolves `functions/api/_account-registry.ts`, and that path is **ABSENT from main** (`git cat-file -e` → fatal). So this slice turns a standing red green, and the greens above are a differential rather than a snapshot.

**The mutants are the teeth.** A passing gate proof is not evidence about the defect it claims to catch, so both manufactured defects were re-run by me on the merged tree. `kv-fallback` (restore main's old KV allocator) and `delete-before-readiness` (move save deletion ahead of the readiness check) each red at rc=1 while the clean run is green. The proof is not decoration.

## Merge classification

Base `2fbae0611`; main had moved **17 paths** since. Lane paths: **42**, of which 35 are `artifacts/sol/account-registry-land/**` evidence and 7 are production surfaces. **Every lane path is LANE-ONLY — the overlap between main's 17 moved paths and the lane's 42 is empty**, which is why `ort` merged with no conflict and why no hunk needed a three-way resolution. Merged as the gated commit itself, not a fresh resolution.

## No screenshots, and why

The gate bar asks for screenshots "when anything renders". Measured rather than asserted: `src/`, `assets/`, `e2e/`, `public/` and `site/` are **each touched by exactly 0 files**. Nothing renders, no boot probe is owed, and the door's behaviour with no binding is byte-identical to main — which is the property `closed-gate.test.mjs` asserts directly.

## Findings

**F-2642-1 — the runner's three broad-battery reds are structurally impossible for this diff, and one of them is a property of the lane worktree rather than of the repo.** The runner reported `run-guards --changed-since` at **4/8, exit 1**, and — to its considerable credit — refused to waive it. All three named failures are disposed of by the file-set above:

- `claim-boat-asset.test.mjs:8,29` — missing `assets/raw/claim-boat-material-atlas.png` and `flotilla-material-atlas.png`. **MEASURED on main: both files are present on disk (3,453,363 B and 3,076,261 B, dated 2026-09-14) and `git ls-files -v` reports `H` for both — not `S`, i.e. not skip-worktree.** The absence is local to the lane-b worktree and cannot follow the merge.
- `assay-replay.test.mjs:183` — overtime replay exceeds a 240,000 ms bound. The diff touches **0 files under `src/`**, so the sim it replays is byte-identical to main.
- power budget p95 = 154.215 ms — same argument, plus F-2462-1, which measured a **2.9× swing** on a timing assertion purely from concurrent load. The runner recorded host load **98.31 / 109.28 / 69.05**; a timing assertion taken there is measuring the machine.

Non-blocking. No corrective task is owed, because there is no defect to correct.

**F-2642-2 — the emptied `logs/task-stats.jsonl` is lane-worktree churn only; main is intact and growing.** The report flags, honestly and with attribution declared unverified, that the file "changed from 799 tracked rows to an empty file". **MEASURED: `worktrees/lane-b/logs/task-stats.jsonl` is 0 bytes, but main's copy is 97,189 B / 803 rows against a HEAD blob of 96,736 B / 799 rows — i.e. main not only survived, it gained four rows.** The emptied copy is uncommitted (it appears in no lane commit and in no merged path), so a lane refresh cures it. **Nothing is lost and the RETENTION LAW is untouched.** Recorded so a successor does not spend a budget chasing it.

**F-2642-3 (OWNER, non-blocking) — landing is not deploying, and the deploy day is still owner-only.** `docs/ops/account-registry.md` names five prerequisites the repo cannot automate: the owner must quiesce every identity writer including previews, independently verify a complete private export, deploy the worker and set its migration secret, bootstrap with a matching receipt, then enable the Pages binding *and* scope together and smoke-test legacy saves before reopening — removing the public migration secret afterwards. Until that day the commented block in `wrangler.toml` keeps the gate shut, and routine Pages deploys are unaffected. **No fire may enable this**; it is on the desk, not on the board.

## Known limitation, carried from the runner and not expanded

No atomic transaction spans KV saves, sessions and the registry. A post-readiness failure can partially delete saves, and an ambiguous retirement may require signing in again. The ordering is nonetheless the safe one for a *delete-account* flow: saves are removed before identity is retired, so a failure leaves the user's data gone (which is what they asked for) rather than orphaned behind a retired identity. Documented in the runbook; deliberately not widened into unrelated session work.
