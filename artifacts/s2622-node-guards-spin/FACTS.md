# s2622 — a live `test:node-guards` spin, measured 2026-09-18 (clock local, UTC+07)

Companion evidence: `repair-under-radius-spin-sample.txt` (macOS `sample 36092 3`, 128,317 B).

## The process

| fact | value |
|---|---|
| subject | `scripts/repair-under-radius.test.mjs` (a `node --test --test-isolation=process` leg) |
| spinning pid | `36092`, ppid `92036` (the `node --test` parent) |
| lstart | `Fri Sep 18 11:25:51 2026` local |
| at measure | `etime 03:50:11`, cumulative CPU `229:03.92`, `%CPU 100.0`, `stat RN` |
| duty cycle | **~99.5% of one core for its ENTIRE life** (13,633 s CPU / 13,700 s elapsed) |
| bounds dead | parent carries `--test-timeout=300000`; elapsed is ~45x that and it never fired |
| tty | `??` on every ancestor — nobody is sitting at it |

Ancestry (measured, not assumed):

```
36092  <- 92036 (node --test)
       <- 92007 (node scripts/run-node-guards.mjs ...)
       <- 92006 (sh -c)
       <- 91977 (npm run test:node-guards)
       <- 1317  (bash .../scratchpad/poc-gates.sh)
       <- PPID 1 (reparented to launchd)
```

## Ownership — ATTENDED, not the factory

The launcher is `bash /private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/poc-gates.sh`
— an attended scratchpad session (`fe6b8d27-...`), **not** this fire and **not** the lane runner.

`poc-gates.sh` runs a gate battery over an attended `wt-poc-land` worktree. Its
second-to-last step is `GR_GUARD_NO_ARTIFACT=1 nice -n 5 npm run test:node-guards`,
and it is blocked there:

- `poc-gates-summary.txt` — last written `04:25:01Z`; carries `tsc rc=0`, `e1 build rc=0`,
  `payload rc=0 (34,641,316 bytes)`, `build rc=0`, `e2e rc=1 (2 failed / 4 skipped / 36 passed)`,
  `churn restored: 24 png`. The `battery rc=` line and the closing `POC-GATES-READ` marker
  have **never been appended** and never will be.
- `poc-battery.log` — last written `04:40:09Z`, i.e. silent for ~3.5 h at measure time.

## MEASURED mechanism

`sample 36092 3` — **2056 samples, ALL on the main thread, in ONE stack**:

```
uv_run -> uv__io_poll -> uv__async_io
  -> v8impl::ThreadSafeFunction::AsyncCb
    -> rolldown-binding.darwin-arm64.node (+0x223208 -> +0x38148)
      -> napi_wrap -> v8impl::ReferenceWithFinalizer::New -> operator new
         1695 recursive operator new, beneath it _sigtramp (1402 + 288)
           -> uv__signal_handler -> uv__signal_unlock -> write   (libuv signal self-pipe)
         361 _xzm_xzone_malloc_freelist_outlined
```

Every V8 worker thread is parked in `TaskQueue::BlockingPop` / `uv_cond_wait` — idle.
So this is a **single-threaded spin on the main thread inside a native N-API callback**.

That also explains, mechanically, the two facts F-2563-3 recorded without a site: the
async callback never returns, so no timer can be serviced (`--test-timeout` and any
per-test `{ timeout }` are unreachable), and a JS-level SIGTERM handler can never run.

Attribution is **measured, not inferred from the name**: `package.json` pins `vite ^8.0.13`,
installed `vite 8.0.13` depends on `rolldown`, and
`node_modules/@rolldown/binding-darwin-arm64/rolldown-binding.darwin-arm64.node` exists (18,496,544 B).

## What is INFERENCE, labelled as such (F-2182-1)

That this is the **same** mechanism as F-2563-3's spin. That spin
(`secure-choice-refusal.test.mjs`) is long dead and was never sampled, so the claim rests on a
matching **signature** — ~100% CPU from the start, every bound dead, SIGTERM ignored — and not
on a stack. Two subjects, one sampled.

## Why this fire did not kill it

F-2563-3 cleared its own spin on the stated grounds that it was *"orphaned, every bound blown
>100x, the battery idempotent and holding no artifact anyone was waiting on."* The first three
hold here; **the fourth does not.** This battery IS holding an artifact someone is waiting on,
and the shell that is waiting appends its verdict unconditionally:

```
... npm run test:node-guards > $S/poc-battery.log 2>&1; echo "battery rc=$? ..." >> $S/poc-gates-summary.txt
```

So killing pid 36092 would not merely stop the waste — it would unblock `poc-gates.sh` and write
a **non-zero `battery rc=` into the attended PoC summary**, where it reads as *"the PoC's
land-worktree code fails the battery."* That is a fabricated gate verdict (F-2462-1's harm)
aimed at an attended decision, produced by a fire, in someone else's scratchpad.

Reported, not touched (F-2561-1 / F-2489-1). The attended session owns the re-run.
