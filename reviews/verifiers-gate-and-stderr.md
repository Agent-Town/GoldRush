# verifiers-gate-and-stderr — drain review (s1300)

**Slice:** `lane-a-verifiers-gate-and-stderr` (FIRE-AUTHORED s1299)
**Branch:** `lane/m3` @ `3747bc5c` · **Base:** `e74265db` · **Merge:** `818aa398` · **Corrective:** `abd174f0`

## Verdict

**MERGED — SPLIT VERDICT.** The slice has two halves and they earned different marks.

- **Scope 3–5 (regression test + `_read_sim_reply` fix): PASS, independently reproduced.**
- **Scope 1–2 (the venv bootstrap): FAIL as delivered — `rc=1` in the fire shell.** Cured in the same
  fire at `abd174f0` (F-1300-1), because the fire shell is the *only* shell that reproduces it.

Merging rather than withholding: the defective half is a brand-new script with **zero consumers**, so
it regresses nothing, while the proven half closes a real fault. Withholding the whole slice would have
discarded a verified fix over a defect in an inert helper — and left F-1298-3 open a second time.

## What it does

`_read_sim_reply` starts a stdout reader and a stderr reader and waits for the first to finish. When
GR-SIM dies without emitting a view, stdout's `readline()` completes **empty**, so the old code took the
`else` path, cancelled **only** `stdout_task`, and then called `await process.stderr.read()` — while
`stderr_task` was **still pending on that same stream**. Two readers, one stream: whatever the pending
`readline()` had already consumed never reached `detail`, and the operator saw a `RuntimeError` missing
the diagnostic the sim had in fact printed.

The fix cancels **both** tasks and *awaits* their cancellation under `contextlib.suppress(CancelledError)`
before re-reading, and keeps a line the stderr reader already captured instead of discarding it. Async
throughout (§AP-07).

The slice also adds `scripts/verifiers-venv.sh`, whose purpose is to give this package a re-runnable
gate at all — F-1298-3's ask.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, built in **1.35 s** |
| `node scripts/citation-title-guard.mjs` | **PASS, 0 offenders** of 365 scanned |
| `npm run test:node-guards` | **rc=0** (findings-state PASS 175/137/38 double-state 0 · blocker-panel PASS · ruling-propagation PASS) |
| python suite, **main's tree**, pyenv 3.11.13 | **Ran 4 tests — OK, rc=0** |
| `scripts/verifiers-venv.sh` **as delivered** | ⛔ **rc=1**, twice |
| `scripts/verifiers-venv.sh` **after `abd174f0`** | ✅ rc=0 cold (probes → clear → install → 4 tests OK); rc=0 warm (reused, no reinstall, **1.52 s**) |
| playwright | **not run — stated, not skipped silently.** A python package plus a shell script; zero runtime surface. §3.1's `--workers=1` is moot here. |

**Merge classification:** `ahead=1`, `paths=5`, **LANE-ONLY 5, BOTH-MOVED 0** — main moved only
`STATUS.md`, `logs/suite-red-inventory.md`, `tasks/BACKLOG.md`, `tasks/goals.json` and the master itself,
all disjoint from the lane's five. Exact path-scoped apply, **no 3-way**. All five blobs
**hash-asserted equal to the lane tip** (F-1295-1): `90a8d71b`, `31464681`, `5c31ae07`, `a07aeebf`, `48e97a35`.

**The runner obeyed the hard sequencing ask.** s1299's §G(1) said *"if the report does not paste the RED,
that is the finding."* It pasted it, and the content is itself the confirmation:

```
AssertionError: 'GR-SIM crashed\nstack frame: applyOrders' not found in
                'GR-SIM exited before the next view: stack frame: applyOrders'
```

Line 2 survived and **line 1 was gone** — precisely the leaked-reader race F-1298-2 predicted, rather
than a test that merely fails for some reason. A weaker report would have said "test failed".

I did not take the runner's green on trust: its interpreter (pyenv 3.11.13) is not on the fire shell's
PATH, so I re-ran the suite against **main's** tree and asserted
`goldrush.__file__ = <main>/env/goldrush-verifiers/goldrush/__init__.py` before believing the 4/4.

## Findings

### F-1300-1 — the bootstrap meant to end "unreproducible greens" produced one, in three compounding ways · **CURED `abd174f0`**

The irony is exact: F-1298-3 exists because this package once shipped a green nobody could reproduce.
The script written to close that hole **failed in the fire shell**, which is the shell that gates.

1. **Wrong bound.** The probe enforced `requires-python = ">=3.10"` — this package's own floor. But the
   dependency `verifiers` publishes **nothing outside `>=3.10,<3.14`**. The fire shell has only Python
   **3.14.2**; it cleared the floor, was selected, and pip died with
   `No matching distribution found for verifiers>=0.1.8`. *A floor is not a window.*
2. **PATH is not the machine.** pyenv **3.11.13** was installed on this disk the whole time — it is the
   interpreter the runner used. The probe searched PATH names only, and a headless shell lacks the pyenv
   shims an interactive one has. So the script declared failure while a working interpreter sat metres away.
3. **The bad choice was permanent.** Reuse keyed on `bin/python` existing — which becomes true the moment
   `venv` creation succeeds, i.e. **before** the install fails. The half-built venv was therefore
   re-selected by every later run and the probe never ran again. **Measured `rc=1` twice**, recoverable
   only by deleting `.venv` by hand.

Plus a label defect of the kind this factory keeps meeting: the header printed `$VENV/bin/python` beside
the **probed** interpreter's version. On a first run that path does not exist yet — the label named one
subject and the number another.

**Cure (`abd174f0`)** checks both bounds with the ceiling's source named in a comment; probes pyenv and
homebrew install roots as well as PATH; gates reuse on the post-install marker *and* a re-checked window,
rebuilding via `venv --clear` rather than `rm -rf`; and reports the interpreter actually selected.

**Why fire-side rather than a corrective master:** a lane runner has pyenv on PATH and **cannot reproduce
this failure**. A cure authored there would have been untestable by its own author — the exact
anti-pattern. I had the failing environment, so the fix was proven where it breaks: `bash -n` rc=0; cold
run over the broken half-built venv selects `/Users/robin/.pyenv/versions/3.11.13/bin/python3.11` and ends
`Ran 4 tests — OK`; warm run reports `reused venv: yes`, no reinstall, **1.52 s**, `OK`.

### F-1300-2 — the diff carries one unrequested hunk (non-blocking)

`goldrush/__init__.py` loses its trailing blank line at EOF — outside the master's scope, harmless, and
noted only so the next reader does not hunt for meaning in it.

### F-1300-3 — `verifiers` resolved to **0.2.1**, not the runner's 0.1.8 (non-blocking, worth knowing)

The runner recorded a floor check at `verifiers==0.1.8`; my cold install resolved **0.2.1**. Both satisfy
`>=0.1.8` and the suite is green on both, so nothing is wrong today — but this package pins no upper
bound, so **the gate's dependency set drifts between runs**. If it ever goes red on a machine where the
code did not change, look here first. Pinning is an owner-adjacent call (it changes what the eval
environment *is*), so it is flagged, not done.

## Standing consequence

**F-1298-3 is now genuinely closed**, and for the first time the claim is falsifiable: any session can run
`bash scripts/verifiers-venv.sh`, read the interpreter it names, and get the same 4/4. The package that
had no re-runnable gate has one that has now been run from two different shells on two different
interpreters.
