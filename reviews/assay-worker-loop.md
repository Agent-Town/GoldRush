# Review — assay-worker-loop (slice 2 of `specs/agent-play/assay-worker.md`)

- **Slice**: `assay-worker-loop` — the assayer himself: poll, replay, verdict
- **Branch / tip**: `lane/lane-d` @ `888a29672fb0b1e31e0fdcde83a373b6eef683b9`
- **Base (merge-base with main)**: `9cb0aba4faf91b0d4fe6a2bc1153006e9bdf6bca`
- **Merge commit on main**: `a8d5164db67ca5c177e3007478b65babd867f07e`
- **Drained by**: s2057 fire, 2026-08-18
- **Transcripts**: `artifacts/s2057-assay-worker-gate.txt` (gate) · `artifacts/s2057-assay-worker-control.txt` (control + isolation arms)

## VERDICT: MERGED

## What it does

Adds the resident worker that closes the assay loop. `scripts/assay-worker.mjs` polls
`GET /api/standings/assay-queue` (URL from `ASSAY_API_BASE`, secret from `ASSAY_WORKER_SECRET`,
`x-assay-key` header), and for each pending row — one at a time, oldest first — writes the tape to a
temp dir, spawns `scripts/assay-replay.mjs` as a child, and compares the instrument's
`{eventLogHash, outcome}` against the row's claim before POSTing a verdict to `assay-verdict`.

The forbidden green the master names is structurally closed: `verdict` is initialised to
`'rejected'` (`scripts/assay-worker.mjs:76`) and is assigned `'verified'` at exactly one site
(`:90`), reachable only after the tape is `version === 2`, the instrument returned a hash matching
`/^fnv1a32:[a-f0-9]{8}$/`, that hash equals the claim, **and** `outcomeMismatch()` returns null on
all four of `{secured, waves, timeAlive, gold}`. Every other path — malformed tape, legacy v1,
instrument crash, malformed instrument JSON, hash mismatch, outcome mismatch — falls to `rejected`
with a reason string, capped at 256 chars. A thrown error inside `assay()` is caught and becomes a
rejection reason rather than a skipped row, so the loop is fail-honest rather than fail-silent.

Ops shape per scope item 2: `--once` drains the queue once and exits (and rethrows API errors rather
than backing off, so a smoke run fails loudly); `--dry-run` prints the verdict line and POSTs
nothing; no daemonisation in-script. SIGTERM/SIGINT set a `stopping` flag that is checked between
rows and inside `sleep()`, so shutdown finishes the row in flight and never leaves a half-posted
verdict. API failures back off geometrically from `ASSAY_BACKOFF_INITIAL_MS` to a 5-min cap.
`docs/assay-worker-runbook.md` carries the systemd unit (`nice -n 15`, `Restart=always`), the
two-variable `.env`, secret rotation, and the local smoke command. No secret is in any tracked file.

## Evidence

| Gate | Result | Detail |
|---|---|---|
| `npx tsc --noEmit` | **rc=0** | merged tree, gate worktree |
| `npm run build` | **rc=0** | built in 2.12s |
| own test `scripts/assay-worker.test.mjs` | **3/3 pass, rc=0** | 0.5s — verified/mismatch/crash/legacy in one arm, `--dry-run`, backoff `10→20→20ms` |
| adjacent `task-025` + `m1-01` + `m2-01` | **32/32 pass, rc=0** | 3.2m, **both projects** (desktop + mobile-chrome @390px) |
| `npm run test:node-guards` (merged, full) | rc=1 — **3 reds, all attributed off the slice** | 506.1s; see the control table below |
| runner's own report | 3/3 worker, build green, caller audit green, adjacent 32/32 | agrees with this drain's independent re-run |

### The three node-guards reds, attributed

Control method: same root (`gate-s2057`), content reverted to plain main via `git reset --hard`,
so **only the content varies** between arms.

| Failing test | merged, full battery | control: reverted, same root | merged, isolated |
|---|---|---|---|
| `site-contract` — *"every in-page anchor targets an element that exists"* | rc=1 | **rc=1 (identical)** | — |
| `fixture-teardown` — *"all 34 fixture owners remove their temp directories"* | rc=1 | **rc=1 (identical)** | — |
| `gr-sim` — *"headless landmark starts release before enemies can stall"* | rc=1 | **rc=0** | **rc=0** |

1. **`site-contract` #teaser — PRE-EXISTING, RECORDED KNOWN-RED.** The assertion is
   `news.html links to "index.html#teaser" but index.html has no element with id="teaser"` —
   nothing the slice touches. It reproduced with the slice **absent** in the same root, and it is
   already documented twice in `tasks/BACKLOG.md` as the *"exact inherited `news.html` missing-`#teaser`
   red reproduced on untouched main"* (F-1796-1 and F-1815-1). Also confirmed rc=1 from main's own
   root. Fingerprint-matched with proof, per the §6 adjacent-suite allowance.
2. **`fixture-teardown` — CASCADE OF (1), NOT A TEMP-DIR LEAK.** Despite the headline naming temp
   directories, the assertion body is `scripts/site-contract.test.mjs child failed: … 1 !== 0` —
   it re-runs each fixture-owning test as a child and reds because that child's exit code is
   non-zero. The new `assay-worker.test.mjs` cleans up correctly (`await rm(directory, {recursive:
   true, force: true})` in a `finally` in both `fixture()` consumers), and this red reproduces with
   the slice absent.
3. **`gr-sim` landmark — LOAD ARTIFACT, NOT A BEHAVIOUR CHANGE.** The failure is not an assertion
   about the sim: it is `Error: transport was disconnected, cannot call "fetchModule"` from vite's
   module-runner. It **passed rc=0 in the reverted control AND rc=0 on the merged tree when run
   isolated** (17 pass / 0 fail / 2 skipped, 242.0s), so the red tracks the 506s full-battery load,
   not the content. Per F-1441-3 nothing was re-pinned and no test was touched.

## Merge classification

Base `9cb0aba4`; main moved **none** of the four paths between the base and the merge
(`git diff --name-only <base> main -- <the four paths>` → empty), so there was no three-way work to
do and the 'ort' merge reported no conflicts.

| File | Class | Note |
|---|---|---|
| `scripts/assay-worker.mjs` | LANE-ONLY (new) | +150 |
| `scripts/assay-worker.test.mjs` | LANE-ONLY (new) | +131 |
| `docs/assay-worker-runbook.md` | LANE-ONLY (new) | +75 |
| `package.json` | LANE-TOUCHED, MAIN-UNMOVED | +1 token: `scripts/assay-worker.test.mjs` inserted into `test:node-guards`. Firewall-exact — the master permits `package.json` **only** for this wiring, and the diff contains nothing else. |

Firewall honoured in full: the diff is exactly the four permitted paths. No change to
`scripts/assay-replay.mjs`, `functions/api/**`, the sim, or any client code — so the runner did not
need the "STOP and report" arm.

## Findings

**None blocking.** Two notes, neither spawning a corrective:

- **F-2057-1 (INFORMATIONAL, no action).** `gr-sim.test.mjs` can fail with a vite
  `transport was disconnected` crash under full-battery load while passing in isolation on the same
  content. This is the load-ceiling shape already recorded for the fire shell (F-1269-1/F-1270-1),
  observed here on the *node* battery rather than playwright. Recorded so the next fire that meets
  this red re-runs it isolated before believing it. No re-pin, no test edit.
- **Not a GZ-01 item.** The duty's filter is *"the review names a player-visible change"*. This
  slice adds an operator-run script, its test, and a runbook; it ships no client code, and nothing
  in a plain boot changes. The verdicts it will post become player-visible only once the worker is
  deployed against production — that is the runbook's step, not this merge's. Deliberately dismissed
  rather than silently skipped.

## Where does the PLAYER see this, in a plain boot?

Nowhere yet, by design — and that is the honest answer rather than a Mistake #10 evasion. This is
slice 2 of a three-part program: the instrument (merged), the endpoints (merged), the worker (here).
The player-visible surface is the standings badge that stops saying *pending*, and it turns on when
an operator follows `docs/assay-worker-runbook.md` on the box. No `?debug` gate is involved because
no client code is involved.
