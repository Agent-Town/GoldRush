# Review — `lane-d-collection-guards-spawnsync-truncation`

**Slice:** the two Playwright collection guards capture `--list` output with `spawnSync`, which
silently returns TRUNCATED stdout under load while reporting `status` 0 → the node-guards battery
had become ~36–75% red on a race that reports success.
**Branch:** `lane/perf` · **tip** `641140f6` · **base** `98c62443` (ancestor of main, verified)
**Merge:** grafted to main — see the drain commit for the hash.
**Drained by:** s1205 fire, 2026-07-29.

## Verdict

✅ **MERGE.** The cure is sound, and it is *architecturally* stronger than the one the master
specified: the child's stdout/stderr are redirected to file descriptors, so there is **no pipe to
race** rather than a pipe that races less. Nine consecutive green batteries on the merged tree
(74/74 each), including three under deliberate concurrent load. Zero `src/`, zero `e2e/` bytes.

## What it does

Both `scripts/whole-suite-collection.test.mjs` and `scripts/town-spec-collection.test.mjs` replace
`spawnSync(..., {encoding:'utf8'})` with an async `collect()` that `spawn`s the child with
`stdio: ['ignore', stdoutFd, stderrFd]` pointed at files in a `mkdtemp` dir, awaits `close`, then
reads the files back. It preserves the `{ status, stdout, stderr }` shape exactly, so the `tail()`
diagnostic and all three original assertions survive unchanged — including both
`/Total: [1-9]\d* tests/` regexes, which the master forbade touching (F-1201-1: they were already
refuted once as a phantom defect) and which are indeed untouched.

Each guard also gains **one** completeness assertion: `Total: N tests in M files` must be the
**last non-empty line** of stdout, with a failure message that says *truncated* in words.

## Evidence (all measured by this fire, on the MERGED tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean, rc=0** |
| `npm run build` | **green, 1.58 s** |
| `npm run test:node-guards` × 5 (quiet) | **5/5 rc=0**, 15.2 / 16.9 / 16.7 / 17.8 / 18.5 s |
| same, counts read in full | **`tests 74 · pass 74 · fail 0`**, rc=0 |
| same × 3 **under concurrent `npm run build`** | **3/3 rc=0**, 18.4 / 18.5 / 18.9 s |
| **total** | **9 batteries, 0 red** |
| root-invariance from `scripts/` | whole `pass=1 fail=0` · town `pass=1 fail=0` |
| root-invariance from a **tmpdir outside the repo** | whole `pass=1 fail=0` · town `pass=1 fail=0` |
| `run-guards.mjs --only test:node-guards` | **PASS rc=0** (13 s) |
| graft byte-identity vs `lane/perf` | **empty diff** (before and after the mutation control) |

⚠️ **The quiet green was deliberately not the whole case.** The defect is a load-dependent race, so
a battery that passes on an idle machine proves little; the three `--load` arms exist so the green
is earned under contention (`logs/session-scratch/s1205-battery.mjs --load`).

### Mutation control m1 — re-run by this fire, not inherited

Injected `result.stdout = result.stdout.slice(0, 150000)` immediately after `collect()` in the
whole-suite guard (mimicking the measured 143,290-char real failure):

```
ℹ tests 1 · pass 0 · fail 1
AssertionError [ERR_ASSERTION]: stdout capture is truncated: Total summary is not the last non-empty line
```

The new assertion fires, and it fires **before** the older `/Total:/` match, so the truncation
message is the one the operator reads. Subject restored; `git diff lane/perf` empty again.

## Merge classification

Base `98c62443` is an ancestor of main. `git log 98c62443..main -- <the two files>` is **empty** —
main never moved either file — so both are **LANE-TOUCHED-ONLY** and the graft is a straight
`git checkout lane/perf -- <paths>`. No 3-way merge, no conflict. Byte-identity vs the lane tip
verified before gating and again after the mutation control. Nothing else on `lane/perf` (the one
other ahead commit, `278ad24c`, was already merged as `fbefb903` — proved by the empty diff the
master itself recorded).

## Findings

**F-1205-1 — the runner REFUTED the master's own prototyped cure, and was right to. (non-blocking,
recorded)** The s1202 authoring fire measured promisified `execFile` at **0/8 red** and wrote it
into the master as "the cure, prototyped and measured … not proposed from theory". The implementing
run measured that same `execFile` prototype **still truncating** under current load, and switched to
file-backed capture. Two fires, contradictory results on the same mitigation — which per house
practice means the earlier arm was **undersampled**, not that either lied: `execFile` still reads
through a pipe, so it is a *smaller* race window, not the absence of one. The shipped fix removes
the pipe entirely and is therefore immune by construction rather than by margin. ➡️ The durable
lesson is the one that keeps recurring: **a prototyped cure is a hypothesis with a sample size.**
No corrective needed — the better fix shipped.

**F-1205-2 — the new completeness assertion is a DIAGNOSTIC discriminator, not new detection
coverage; the review says so rather than overclaiming. (non-blocking)** Under *real* truncation the
pre-existing `assert.match(result.stdout, /Total: [1-9]\d* tests/)` already failed — that is exactly
how this defect surfaced. The new assertion does not catch a case the old one missed; its value is
that it **names** the cause instead of presenting as "Playwright collected nothing", which is what
cost a full drain to diagnose. That matches scope 3's stated intent ("make its failure message say
so in words"), so this is not a scope miss — but the slice should not be cited later as having
closed a detection gap.

**F-1205-3 — the anchored last-line form is stricter than the property it guards; one benign
trailing line from Playwright would redden both guards. (non-blocking, watch)** The assertion is
`/^Total: [1-9]\d* tests in [1-9]\d* files$/` against the last non-empty line. Anything Playwright
ever prints *after* its Total summary — a deprecation notice, an experimental-loader warning, a
reporter addendum — turns both guards red for a reason that has nothing to do with capture
completeness. Measured green 9/9 on the current Playwright, so this is a watch item, not a blocker;
if it ever fires spuriously the fix is to assert `Total:` appears within the last *few* non-empty
lines rather than exactly the last one. Noting it because a guard that can go red benignly is how
known-reds get born.

**F-1205-4 — battery wall-time on main is ~3× what the run report measured. (non-blocking,
explains a future surprise)** The run reported a post-cure median of **5.9 s**; this fire measures
**16.9 s** quiet / **18.5 s** under load on the merged tree, with `duration_ms 14716` internally.
The two collection guards themselves are fast (`whole` 1.63 s, `town` 0.51 s), so the difference is
elsewhere in the 15-file battery, not in this slice — and the *pre-cure* figure the master quoted
was 16–21 s, so the honest reading is **"the cure did not make the battery slower"**, not the
report's "faster". Recorded so the next fire that reads 5.9 s in the ledger does not treat 17 s as
a regression.

## Firewall compliance

`git diff main...lane/perf --stat` = exactly the two TOUCH-ONLY paths (+63 / −13). Confirmed
untouched: `collection-guards-cwd-invariance.test.mjs` (the detector), `package.json` (battery
still 15 files / 74 tests), both `/Total:/` regexes, `playwright.config.*`, `suite-red-inventory.*`,
`logs/suite-red-inventory.md`, all of `src/**` and `e2e/**`.

Zero rendering bytes ⇒ no screenshots and no browser boot probe are required for this slice; the
master states this explicitly and the drain agrees rather than silently omitting them.
