# fire-shell-cpu-ceiling-control — the other arm

**Slice:** `fire-shell-cpu-ceiling-control` (lane-b slot, branch `lane/m4`, runner tip `2f97eb14`)
**Base:** `8a418a1a (archive: pruned by the A3 rewrite)` · **Drained:** s1269, 2026-07-30 · **Merge:** path-scoped, JSON only

## Verdict

**PASS — and it answers the question six fires have been circling.**

The lane arm read **7.53× / 7.39× / 7.04×** parallel throughput at 8 spawned children. The fire arm,
same box, same committed script, same work, read **3.09× / 3.33× / 3.47×**. The lane's *worst*
repetition is **2.03× the fire's best**; the three-rep ranges do not overlap or come close.

Per the master's own pre-registered decision table — written before either number existed — **~7–12×
means the ceiling is the FIRE'S PROCESS CONTEXT.** The box is exonerated. The fire shell is not a
neutral place to measure anything that spawns processes, and six chromium workers are exactly that.

## What it does

Nothing. It changes no code and fixes nothing: it runs one committed probe
(`logs/session-scratch/s1268/child-scaling-v2.mjs`) in a login-zsh lane shell — the arm no fire can
run, because every fire reading is taken inside the fire's own process tree, where a launchd
resource limit and "this box cannot do better" are indistinguishable.

## Evidence

Both arms, same script, same 16-core M4 Max, ~10 minutes apart:

| reading | FIRE (s1268, launchd job) | LANE (s1269 drain, login zsh) | ratio |
|---|---|---|---|
| 1-child wall (mean of 3) | 4.20 s | 3.83 s | 1.10× |
| 6-child wall (mean) | 8.48 s | 4.12 s | **2.06×** |
| 8-child wall (mean) | 10.19 s | 4.19 s | **2.43×** |
| 8-child throughput (3 reps) | 3.09 / 3.33 / 3.47× | **7.53 / 7.39 / 7.04×** | no overlap |
| widest-arm wall, `top` running | 9.84 s | 5.29 s | 1.86× |
| loadavg before (range) | 4.70 – 5.85 | 2.51 – 3.42 | — |

⭐ **The 1-child row is the control that makes the rest mean something.** Single-process work rate is
the same in both shells (within 10%). The divergence appears *only* as child count rises — which is
the signature of a per-job CPU cap, not of a slower machine, a slower runtime, or a busier box.

**The load confound is defused from inside the fire's own data.** The fire's three reps ran at
loadavg 4.70 → 5.09 → 5.85 and returned 3.09× → 3.33× → 3.47×: throughput *rose* as load rose. A
load explanation for the fire's ceiling has to run the other way, and it doesn't.

**Scope-4 cross-check (lane, same shell/session):** `Running 6 tests using 6 workers` → **6 passed,
13.6 s, 0 failed.** The lane's long-standing ~14 s green, reproduced once more beside its own CPU
reading — which is the pairing the master existed to obtain.

## Gate

Proportionate and stated as such: the merged content is **one untracked JSON of measurements** and
**zero lines of code**, so a full playwright battery would test nothing this merge can affect and
would only risk Mistake #12 contamination. Run and green: `npx tsc --noEmit` (rc=0) · `npm run build`
(rc=0, built in 2.76 s) · `node scripts/run-guards.mjs` **10/10 PASS**. Firewall verified by diff:
`git diff main 2f97eb14` touches **none** of `src/**`, `e2e/**`, `playwright.config.ts`,
`package.json`, `tasks/**`, `reviews/**`, or the shared instrument itself — the one `STATUS.md` line
in that diff is MAIN-MOVED (my own s1269 lock), not lane-touched.

**Merge classification:** `logs/session-scratch/s1268/child-scaling-lane.json` — LANE-TOUCHED, pure
add, merged. Six `artifacts/gazette-welcome/*.png` — LANE-TOUCHED regenerated evidence churn,
**deliberately not merged** (F-1266-1: regenerated screenshots are never work; never gate on their
byte identity). No conflicts; nothing three-way.

## Findings

### F-1269-1 — the fire shell's process ceiling is real, and it is the fire's context (CLOSED by measurement)

Promoted from s1268's F-1268-3, which could only observe the ceiling from inside it. The two-arm
comparison above establishes it: **~2.0–2.4× less parallel child throughput in the fire shell than
in a login shell on the same machine, with matched serial baselines.** This is a sufficient
mechanism for the entire six-fire divergence (F-1264-3): at 6 workers each chromium gets roughly
half the CPU it gets in the lane, every test inflates, and a timing-sensitive position poll goes
red — matching s1268's measured dose curve exactly (0/18 · 5/18 · 14/18 · 18/18 at 1 · 2 · 3 · 6
workers).

### F-1269-2 — the shared instrument's telemetry self-destructs on a healthy shell (NEW, instrument defect)

`child-scaling-v2.mjs:sampleDuringWidest()` fires `top -l 2` at a **hard-coded t=3500 ms**, and
`top -l 2` needs ~2 s more to take its true second sample. In the fire that lands *inside* a 9.84 s
arm (8 node children photographed at 54.4–54.5% each, 45.32% idle). In the lane the arm is **5.29 s**,
so the sample lands **after the children have exited** — which is why the lane's JSON carries
`childCpuPercents: []` and `idlePercent: 77.61`.

⚠️ **Therefore the run report's line "idle during 8-child arm: 77.61%" is mislabeled** — it is a
*post*-arm idle, and Codex copied the probe's own label faithfully. Proof is in the artifact, not
inferred: `topRaw` is stamped `21:12:36` at `Load Avg: 4.06` and its top-12-by-CPU list contains
**no node process at all**.

➡️ **Consequence for this drain, applied:** the idle% and per-child-%CPU rows are **excluded from the
comparison above** and no conclusion here rests on them. The verdict stands on wall-clock throughput,
which is immune to when the sample fired. Anyone re-using this probe must sample proportionally to
the measured arm, not at a constant.

### F-1269-3 — a guard that scans TRACKED files certifies nothing about a master you have not committed yet (NEW, process)

s1268's handoff reports `test:citations` **PASS, 335 scanned**. Re-run this fire on the same tree:
**FAIL, 336 scanned**, the single offender being s1268's *own* authored master citing
`e2e/gazette-welcome.spec.ts:88` bare. The guard walks `trackedTaskDocs()`, so it could not see the
master until it was committed — s1268 ran it before the `git add`, and the green it recorded was
true of a tree that did not yet contain its work.

➡️ **Fixed in this drain** (title quoted beside the citation; counts moved 264→263 NUMBER-ONLY and
50→51 CARRIES-TITLE, so the fix landed rather than merely reporting green). **The general rule is
the finding:** run the author-duty guards *after* the master lands, or state which tree they covered.

## F-1268-4 — status change: candidate → leading named cause, still unconfirmed

`~/Library/LaunchAgents/com.goldrush.fire.plist` declares no **`ProcessType`** key, and
`man launchd.plist` says the system then applies *"light resource limits to the job, throttling its
CPU usage and I/O bandwidth."* That is now the leading explanation of F-1269-1: it predicts a per-job
cap that binds on aggregate CPU while leaving single-process speed untouched, which is precisely the
shape measured.

🚫 **It is still NOT proven, and this drain does not claim it.** What is proven is the *location* of
the ceiling (the fire's process context), not its *mechanism*. The confirming test is one edit —
add `<key>ProcessType</key><string>Interactive</string>`, reload the agent, re-run the probe in a
fire — and it is **owner-side**, because it modifies Robin's launchd configuration outside this repo.

## Recommendation

1. 🔺 **OWNER, one word:** authorize the plist `ProcessType` edit. It is the confirming test *and*
   the remedy in the same action, and it is the only step left in a six-fire thread.
2. ⭐ **Available now, needs nobody:** fires that must gate a timing-sensitive suite can pass
   **`--workers=1`**. s1268's dose curve read **0 reds / 18 at w=1 across a loadavg spread of
   2.46 → 20.65** — the serial arm is immune to exactly the pressure that produces the red. It costs
   wall time and buys a trustworthy gate today, without touching the owner's machine.
   (`playwright.config.ts` sets no `workers` key — verified by grep — so the flag is the whole
   mechanism; nothing in-repo needs changing to adopt it.)
