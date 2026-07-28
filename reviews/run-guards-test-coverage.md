# Review — run-guards-test-coverage (F-1173-3)

**Slice:** `lane-c-run-guards-test-coverage`
**Branch/tip:** `lane/e2-arsenal` @ `2fb016e7` (runner auto-commit)
**Merge base:** `f7e4c80762f92c1efcd8786f594c37468336931a`
**Drained:** s1196 fire, 2026-07-29 (**authored AND drained in the same fire**)
**Verdict:** ✅ **ACCEPTED** — and the test is proven non-tautological by three mutations of the subject, not by its own green.

## What it does

`scripts/run-guards.mjs` is the file the factory built after F-1125-1/F-1126-1, when `test:node-guards` printed *"61/61 pass"* and then exited 1 — and **two fires in a row read the counter, never read `$?`, and recorded a green.** Its own header states the law it exists to enforce: *a gate is defined by its EXIT CODE, not by its output.* F-1173-3 (`tasks/BACKLOG.md:93`, raised s1173) recorded that this file — the one thing standing between the factory and that failure class — **had no test at all**, and declared a test its prerequisite for any fourth attempt on F-1160-2.

It now has one: `scripts/run-guards.test.mjs`, 4 tests covering 5 claims, **with zero bytes changed in the subject.**

## Evidence

**§3.0 `drain-block-check` ran FIRST**, before classification: ✅ CLEAR (`factory-run-guards-test-coverage`, status `queued`).

### 🔑 The test was refuted-tested, not trusted — three mutations of the SUBJECT, all caught

A test that passes proves nothing until you know it can fail. I mutated `scripts/run-guards.mjs` itself (never the test) and re-ran:

| mutation | what it reintroduces | test result |
|---|---|---|
| `process.exit(failed.length ? 1 : 0)` → `process.exit(0)` | **the exact F-1125-1 defect** — a runner that talks its way to a green | **2 of 4 tests FAIL** ✓ |
| `run.status === null ? 'signal:…' : run.status` → `… ? 0 : …` | a signal-killed guard counted as a **pass** | **1 of 4 FAILS** ✓ |
| unknown `--only` `process.exit(2)` → `process.exit(0)` | a typo'd guard name silently passing | **1 of 4 FAILS** ✓ |

Subject reverted and re-verified **byte-identical**: blob `3180529e5701f362b51e77ffe0aa600351ff3ce1` before and after. The middle mutation matters most — `run-guards.mjs:55-56` is a branch **nothing had ever exercised**, and it is now defended.

### The design, and why the one real hazard cannot fire

The mechanism was measured by the authoring fire before the master was written, so the run did not spend itself discovering it: `run-guards.mjs:50` spawns `npm run --silent <guard>`, and **npm resolves scripts from the nearest `package.json` to the cwd** — so running the real script with `cwd` = a temp fixture dir shadows all 8 guards with trivial fakes. Zero production edits, no browsers, **full 8-row battery in ~1 s**.

⚠️ The hazard the master named twice: `GUARDS[0]` **is** `test:node-guards`, the very script this new test file joins — so a spawn with `cwd` = the repo root would recurse **unbounded**. The implementation excludes it *structurally*: there is exactly one spawn helper, `run(dir, …)`, and it takes the fixture dir as its **first positional parameter**, so no call site can omit it. Every fixture is `fs.mkdtempSync` under `os.tmpdir()` and is removed via `t.after`.

**Proven, not argued** — I ran the loop-closing invocation myself from the repo root, where the real `test:node-guards` now contains the test that spawns `run-guards.mjs`:

```
node scripts/run-guards.mjs --only test:node-guards
→ PASS  rc=0  11s  test:node-guards      guards: 1/1 passed      exit 0, elapsed 11s
```

Bounded, green, no recursion.

### It is not tautological in the other direction either

The test spawns the **real** `scripts/run-guards.mjs`, resolved by `fileURLToPath(new URL('./run-guards.mjs', import.meta.url))`. The fixture controls only the *inputs* (what each guard does), never the subject. Assertions are on `result.status` — the exit code — not on the printed counter, which is the entire point of the file under test. The signal test asserts the **contract** (`rc && rc !== '0'`, i.e. *a signal-killed child is never a pass*) rather than the literal `signal:SIGKILL` string, which may vary with npm/OS — exactly as the master required.

### Gates (on the merged tree)

| gate | result |
|---|---|
| `drain-block-check` | ✅ CLEAR (ran first) |
| `npx tsc --noEmit` | **exit 0**, 4 s |
| `npm run build` | **exit 0**, 16 s (vite built in 1.17 s) |
| `test:node-guards` (now **13** files) | **65/65, exit 0**, 11 s |
| `test-ticker-stats.mjs` | **exit 0** |
| new spec alone, run twice | **4/4 exit 0**, 2.20 s and 2.18 s |
| repo-root recursion probe | **exit 0, 11 s, bounded** |
| subject `scripts/run-guards.mjs` | **ZERO bytes changed** (the central firewall) |

⚠️ **THE GUARD COUNT MOVED: 61 → 65.** Every fire that has gated anything for weeks has read *"61/61"* as the healthy number. **65/65 is now the healthy number.** A fire that sees 65 and reads it as drift will be wrong; a fire that still sees 61 has an unwired test file. This is recorded here, in the goal leaf, in BACKLOG and in the handoff precisely because a changed expected-value that is *not* broadcast becomes the next fire's phantom red.

**No playwright, and that is proportionate rather than thinned:** the merge is `package.json` (one line) plus a new `scripts/` test file — **zero `src/`, zero `e2e/`**. Mistake #10's *"where does the PLAYER see this?"* answers **nowhere, by construction**.

### Merge classification

Base `f7e4c807`. Lane's own changed paths: **exactly 2** — `package.json` and `scripts/run-guards.test.mjs` — which is precisely the master's TOUCH-ONLY list, no more. `git diff --name-only f7e4c807 main -- <the 2 paths>` = **empty** ⇒ **collisions NONE**, no 3-way graft. The `package.json` edit is a single line, inserting `scripts/run-guards.test.mjs` in alphabetical position between `rehearsal-base` and `stream-curate`, leaving the trailing `&& node scripts/test-ticker-stats.mjs` intact. The standing `logs/` churn was left untouched.

## Findings

**None blocking.** The run hit no STOP, obeyed the firewall exactly (2 files, and the subject untouched), reported its own numbers accurately — I re-derived every one of them — and its 5-minute wall time is not a red flag but a consequence of the master handing over a pre-measured mechanism.

- ⓘ **F-1196-3 (informational, no corrective owed)** — `scripts/tmp-s1146-run-guards.mjs` still sits beside the subject and is **not** covered by the new test. It is an untracked-style leftover of an earlier session, referenced by no npm script; the new coverage deliberately targets `run-guards.mjs` alone, per the master's firewall. Noted so a future reader does not mistake the new test's scope for covering both files.

## What this unblocks

F-1173-3 named itself *"the prerequisite for any fourth mechanism on F-1160-2"*. That prerequisite is now **discharged** — and discharged in the strong form, since the test demonstrably catches the reintroduction of the original defect rather than merely existing.
