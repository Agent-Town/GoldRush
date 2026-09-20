# lane-prime-env — the verifiers package: `prime eval run goldrush` becomes real

- **Slice:** `lane-prime-env` (AP-07's Python side; GR-SIM was its merged prerequisite)
- **Branch / tip:** `lane/m3` @ `8eee3956` (runner commit `runner(lane-a): lane-prime-env.md`)
- **Base:** `079c3cc6`
- **Merged to main:** `96e7b58b` (s1298)
- **Goal leaf:** `ap-07-prime-env`, registered in this drain (was UNKNOWN — see F-1298-3)

## Verdict

**MERGED — 5 of the lane's 7 paths, with the other 2 deliberately withheld.**

The package is careful work that respected the two laws easiest to break here: it drives
GR-SIM **asynchronously** (`asyncio.create_subprocess_exec` + NDJSON, never a sync
subprocess) as §AP-07's async law requires, and it scores **only the objective** — `secured`
at weight 1.0, with `waves`/`gold`/`timeMs` carried as weight-0 metrics — so there are no
shape rewards (Examiner law 2). It also declined to fabricate Claim support: the five
`the-claim` rows are frozen for comparability and **fail closed**, and the README says so in
plain words instead of hiding it. That is reject-don't-stretch applied by the implementer to
its own dataset.

## What it does

`env/goldrush-verifiers/` maps one deterministic contract run to one multi-turn rollout. A
`vf.MultiTurnEnv` subclass boots `scripts/gr-sim.mjs`, feeds each model turn's JSON array of
Standing Orders to the runner's stdin, and returns the next `goldrush.view.v1` record as the
following observation. Node ≥20 is verified early with a clear error. Every rollout
serialises its tape (orders + views + outcome + runner stderr) into the rollout artifacts —
the Lantern-compatible replay handoff. Ten frozen eval rows ship as data.

## Evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0, 2.27 s** |
| Plain-boot probe (`trail-guide-plain-boot`) | **2/2 passed, 51.1 s**, desktop + mobile-390px, `--workers=1`, zero console/page errors |
| `run-guards --changed-since` | **4/5** — sole red `test:citations` at **exactly 12** |
| `test:citations` attribution | **Net contribution ZERO** — the 5 merged files contain **zero** citation-shaped strings (`grep -E "\.spec\.ts:[0-9]+\|\.ts:[0-9]+"`), and 12 is s1297's recorded inherited baseline. All 12 sit in `tasks/BACKLOG.md` + two `lane-c-agent-rung-honest-gate*` masters. |
| Blob custody | **All 5 merged blobs byte-identical to lane tip `8eee3956` by `git hash-object`**, not by a clean `git status` (F-1295-1) |
| Classification | `ahead=1 paths=7`, **LANE-ONLY 7, BOTH-MOVED 0, MAIN-ONLY 0** → exact path-scoped apply, **no 3-way** |
| Python syntax | `py_compile` **OK** on both sources (3.14.2) |
| Dataset shape | **10 rows**, `{contractId, seed, difficulty}` exactly; **the 5 runnable `e1-dry-gulch` rows are ordered first** — verified by reading the JSONL, so the README's "default five-example ordering is the runnable rows" claim is **true**, not assumed |
| Rubric weights | `[1.0, 0.0, 0.0, 0.0]` read from source |
| Goal guards | `goal-tracker` + `goal-closure-reason` **4/4 pass** |
| `goals.json` | round-trip **byte-identical**, 2-space canonical preserved, **+7 lines only** |
| Findings census | 169/132/37 → **172/132/40**, double-state 0, PASS |

### The gate I could NOT run, stated as such

**The package's own test suite is UNVERIFIED BY THIS DRAIN.** The runner reports "Fresh
Python 3.10.16: 3/3 tests passed" and a `verifiers==0.1.8` floor run. I could not reproduce
either: `verifiers` and `datasets` are absent from **every** interpreter on this machine
(system 3.14.2 and pyenv 3.11.13, both probed directly), and the runner's venv did not
survive. I declined to install a heavy ML dependency tree inside a fire.

So I gated on a **different and, for a merge, more decisive question: can this regress
anything that ships?** Proven no — see F-1298-3's evidence line: **818 shipping files
searched across `src/ e2e/ scripts/ functions/ public/ index.html package.json`, ZERO
references** to the package, with a **positive control** (`gr-sim` → 10 hits) proving the
search apparatus actually executed. A first grep attempt died on shell glob expansion and its
`||` fallback printed a false "zero"; that reading was discarded and is recorded here rather
than quietly replaced, because it is precisely the "a probe that executes nothing reports
zero" failure.

## Merge classification

All 7 paths were **pure additions** to a new directory (`base=ABSENT`, `main=ABSENT`). No
file main had moved; no conflict; no 3-way graft. Two paths were withheld — see F-1298-1.

## Findings

### F-1298-1 — the lane committed Python bytecode; withheld at the drain, and the *class* fixed — **CLOSED**
`env/goldrush-verifiers/goldrush/__pycache__/__init__.cpython-311.pyc` and
`tests/__pycache__/test_goldrush.cpython-311.pyc` (~30 KB) were in the lane commit because
nothing in `.gitignore` covered them — this is the repo's **first tracked Python package**, so
the rule had never been needed. They are interpreter- and version-specific build debris, they
rot against the 3.10+ floor the package itself declares, and they regenerate on every import.
**Action:** the two blobs were not merged, and `.gitignore` gained `__pycache__/` + `*.py[cod]`
with a comment naming this finding. Fixing the class rather than the instance, so the next
Python package cannot repeat it. *(Note this is a withholding, not a rewrite — the 5 merged
files are byte-identical to the lane.)*

### F-1298-2 — `_read_sim_reply` can double-read stderr and leak its reader task — **OPEN, non-blocking**
`env/goldrush-verifiers/goldrush/__init__.py`, `_read_sim_reply`. The function races a stdout
and a stderr `readline()`. When **stdout completes but is empty** (EOF — GR-SIM crashed or
exited without emitting a view) and the stderr task has **not** yet completed, control falls
through to `await process.stderr.read()` while `stderr_task` is *still pending a readline on
that same `StreamReader`*. asyncio raises `RuntimeError: read() called while another coroutine
is already waiting for incoming data`. The same path never cancels `stderr_task`, so a pending
task is also destroyed.

**Failure scenario:** GR-SIM dies mid-episode. Instead of the intended, useful
`"GR-SIM exited before the next view: <diagnostic>"`, the operator gets an opaque asyncio
`RuntimeError` and loses the runner's actual error text.

**Why non-blocking:** it is confined to the diagnostic path of an already-failing rollout — it
degrades error reporting, not scoring or determinism, and cannot affect the game. **Fix:**
cancel `stderr_task` on every exit path and await it (or read the remainder from the completed
task) instead of re-reading the stream. Fire-authorable as a one-function correction.

### F-1298-3 — the master shipped with no goal leaf, and its test evidence is unreproducible — **PARTLY CLOSED**
Two halves, one root: nobody could check this slice's claims from outside the lane.

1. **No goal leaf.** `drain-block-check` returned **UNKNOWN** — a Goal Registration Law
   bookkeeping gap, *not* a clearance. Worth restating because the default exit code for
   UNKNOWN is **0, identical to CLEAR**: I read the word, not the code. **CLOSED** — leaf
   `ap-07-prime-env` registered in this drain and the check now returns ✅ CLEAR.
2. **Unreproducible test evidence.** **OPEN.** The report's "Fresh Python 3.10.16" is also in
   mild tension with the committed artefacts, which are **cpython-311** — pyenv here holds
   exactly `3.11.13`, so at least one unreported interpreter ran. Not an accusation of
   dishonesty: most likely both were used and only one was written down. But the standing
   consequence is that **this package has no re-runnable gate in the factory**. Every future
   drain touching it will hit the same wall.

   **Recommendation (fire-authorable):** a tiny `env/goldrush-verifiers/` bootstrap — a
   `make check` / `scripts/` entry that creates a throwaway venv, installs the declared
   floor, runs `python -m unittest discover -s tests`, and prints the interpreter it used.
   Then the claim is checkable by whoever drains it next, which is the whole point.

## Player-visible? — GZ-01 filter: **NO ITEM**

This is internal evaluation infrastructure. No player sees anything change; nothing renders;
no gameplay path touches it (0 consumers of 818 files searched). Per the filter law — the
review must name a player-visible change — **no gazette item is appended.** The *eventual*
news here is an agent posting a county-standings score, which belongs to the attended smoke,
not to this merge.

## Owner

Nothing gated. The attended smoke is one command, in the README, and **requires
`--skip-upload`** — Prime local evaluations upload by default, and publication is owner-only.
