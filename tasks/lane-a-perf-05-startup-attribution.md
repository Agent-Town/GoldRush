# lane-a-perf-05-startup-attribution — perf-05:213 is not a load flake; the artifacts name the cause

**FIRE-AUTHORED s1037 (attended review welcome).**
**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/m3`).

> **READ THIS BEFORE THE LADDER TELLS YOU OTHERWISE.** `tasks/BACKLOG.md:819` characterises
> `perf-05-startup:213` as *"threshold-shaped (TTI / deferred textures)"* and load-sensitive, and offers
> *"perf-05 may be pure CPU-load flake, which would be a cheap close."* **s1037 read the run's own
> artifacts and that characterisation is wrong** — every threshold in the test PASSED and the failure is a
> string match. The premise below replaces it. **This is a diagnosis task, not a flake-hunt: do not spend
> a single invocation trying to reproduce a load correlation.**

## READ FIRST (paths, in this order)
- `artifacts/perf-05/after-desktop-chrome.json` and `after-mobile-chrome.json` — **the measured evidence
  this task is built on.** Both were written by the failing run itself. Read them before anything else.
- `e2e/perf-05-startup.spec.ts:15-30` (the two needle lists), `:165-170` (the two windows), `:201-203`
  (`hasAny` — plain `String.includes`, no boundary), `:213-225` (the test; **`:223` is what fails**).
- `index.html:7-9` — the three `<link rel="icon">` tags.
- `reviews/perf-05.md` §Findings — **F-perf05-1**, the *real* load flake on `perf-01`, which is the
  pattern BACKLOG:819 reached for by analogy. Note that it is a **different spec**.
- `tasks/BACKLOG.md:819` — F-1034-3, the ledger entry you are closing or amending.
- `CLAUDE.md` §5 Mistake #1 (no-op) and #14 (reject-don't-stretch).

## WHY (read from the failing run's own artifacts — measured, not inferred)

Both projects wrote this, and the two files agree exactly on the part that matters:

```
desktop:  ttiMs 2701  firstFrameMs 2592   lazy.beforeFirstFrame: ["favicon-32.png"]
mobile:   ttiMs 1701  firstFrameMs 1606   lazy.beforeFirstFrame: ["favicon-32.png"]
          prefetchedBeforeWaveSpawn: []   consoleErrors/pageErrors/assetErrors: all []
```

Line them up against the assertions at `:218-224` and the attribution is not ambiguous:

| line | assertion | result |
|---|---|---|
| `:218` | `ttiMs < 3000` | **PASS** (2701 / 1701) |
| `:219` | `firstFrameMs < ttiMs` | **PASS** |
| `:220-222` | console / page / asset errors empty | **PASS** (all three empty) |
| `:223` | `lazy.beforeFirstFrame` **is empty** | ❌ **FAILS** — holds `favicon-32.png` |
| `:224` | `prefetchedBeforeWaveSpawn.length > 0` | ❌ **would also fail** — empty; never reached |

**Every threshold passed.** There is no TTI problem, no error, and nothing that CPU load would move. So
the ledger's "threshold-shaped / load-sensitive" reading is refuted by the run's own numbers, and
"cheap close by an isolated re-run" was never available — **a green isolated run would have proved
nothing, because the failure is not a timing draw.**

### Defect 1 — the needle `'icon-'` matches `favicon-32.png` (a substring collision)
`hasAny` (`:201-203`) is a bare `String.includes` with no separator or boundary. `NON_CRITICAL_TEXTURES`
(`:28`) contains `'icon-'`, intended for the UI icon sheets. The URL `…/favicon-32.png` contains the
substring `icon-` at offset 3 — **fav`icon-`32.png**. Verified directly:

```
'http://localhost:5173/favicon-32.png'.includes('icon-')  ->  true
```

The favicons are declared in `index.html:7-9` as `<link rel="icon">`, so the browser requests them during
document parse — necessarily long before `firstFrameMs` (2592ms desktop). **When a resource-timing entry
for the favicon exists at all, `:223` fails with certainty.** That is not a flake; it is a guard that
mis-classifies a browser-chrome icon on the deliberate critical path as a deferred game texture.

**The open question this task must answer, because it decides whether anything else is wrong:** the
favicon files are dated **Jul 5**, which is *before* perf-05 shipped 2/2 green (s216, `8bd9eca`,
`reviews/perf-05.md`). Something changed between then and now. The two candidates worth one measurement
each are (a) headless Chromium's favicon-fetch behaviour changed under a Playwright/browser bump, so the
resource-timing entry now exists where it used to be absent, or (b) a favicon `<link>` / filename changed.
**Do not guess between them — measure, and say which one it was.** If it is neither, that is the finding.

### Defect 2 — `prefetchedBeforeWaveSpawn` is EMPTY, and this one may be real
`:224` guards perf-05's own shipped deliverable: the wave-1 prefetch of
`bld-sentry-beacon / bld-palisade / bld-sluice-works / bld-stockpile-yard / bld-signal-turret` between
first frame and wave spawn. The measured window is **wide** — desktop 2592→6133ms, ~3.5 seconds — and
**nothing landed in it.** Three readings are open and they are not equally bad:
1. the prefetch still runs but the resource names/URLs no longer contain those needles (measurement bug);
2. the prefetch runs *earlier* than first frame, or *later* than wave spawn (window bug);
3. **the wave-1 prefetch stopped happening** — a real regression against `8bd9eca`'s shipped behaviour.

Reading 3 is a **product** finding and is out of your firewall. Diagnose which one it is; do not fix
reading 3 (see FIREWALL).

## SCOPE (numbered, each testable)
1. **Reproduce the attribution, cheaply and once per project.** One isolated invocation of
   `e2e/perf-05-startup.spec.ts`, `--workers=1`, desktop and mobile. Confirm from the freshly written
   `artifacts/perf-05/after-*.json` that `:223` fails on `favicon-32.png` and that every threshold at
   `:218-222` passes. **One invocation per project is sufficient and correct here** — the defect is a
   string match, not a timing draw, so repetition buys nothing. **If instead you get a green run, STOP
   and report it as a class change**: that would mean the favicon entry is intermittent, which changes
   the whole diagnosis and is worth more than any fix you could land.
2. **Settle the favicon question with a measurement, not a story.** Print the full resource-timing rows
   (name, `startTime`, `initiatorType`, bytes) for every entry matching `/icon/` in a fresh run, plus the
   browser version Playwright launched. State plainly which of (a)/(b) above is true, with the evidence
   line that decides it. **This series is a deliverable in its own right** — a run that diagnoses
   precisely and patches nothing is NOT a no-op, provided the series is in the report.
3. **Fix defect 1 by NARROWING the matcher, never by weakening the guard.** Make the icon needle unable
   to match a favicon — e.g. anchor it to a path separator (`'/icon-'`) or to the real asset prefix — and
   apply the same boundary reasoning to any other needle in `NON_CRITICAL_TEXTURES` / `PREFETCH_TEXTURES`
   that can collide (audit all of them and report the audit, even if only one collides).
   **This is a narrowing, not a relaxation, and you must prove that:** see scope 4.
4. **Prove the repaired guard can still fail — THIS IS THE PRIMARY ACCEPTANCE EVIDENCE.** Mandatory, and
   it has two halves because the edit has two ways to go wrong:
   - **still-bites:** a temporary local mutation that causes a genuine `icon-*` (or other listed
     non-critical texture) to load before first frame must turn `:223` **red**. Revert and verify.
   - **no-longer-false:** with the mutation reverted, `favicon-32.png` must no longer appear in
     `beforeFirstFrame` while the favicon request itself is still observably happening (show it in the
     scope-2 row dump). A guard that went quiet because the resource vanished is not a fix.
   **Why this outranks green runs (F-1036-2):** green runs corroborate, they never certify — and this
   board has now closed F-1026-1, F-1026-5, F-1029-3 and F-1032-1 on exactly this deterministic control.
   **A narrowed matcher that no longer bites is the F-1032-1 vacuous-guard defect wearing a fix's coat.**
5. **Diagnose defect 2 and classify it — do not fix reading 3.** Using the same row dump, determine which
   of the three readings is true and report it with the evidence. If it is reading 1 or 2, the correction
   is inside your firewall (needle or window), and scope 4's still-bites discipline applies to it too:
   prove `:224` can still fail by removing/blocking a prefetch. **If it is reading 3 — the prefetch really
   stopped — STOP on that half, change no `src/`, and report it as a product finding for the owner.**
   Landing scopes 1-4 with defect 2 diagnosed-but-unfixed is a COMPLETE task.

## FIREWALL
**TOUCH-ONLY:** `e2e/perf-05-startup.spec.ts` and `artifacts/perf-05/**`.

**NO:**
- **No `src/` changes, no `index.html` changes.** Do **not** rename, move, or remove a favicon to make the
  test green — the favicons are correct and the `<link>` tags are deliberate. The test is wrong about
  them, not the other way round.
- **Do not delete the `'icon-'` needle outright, do not delete an entry from either list, and do not
  loosen any threshold at `:218-222`.** The fix is a *narrower* match, not a smaller list. Removing the
  needle would make the UI icon sheets unguarded — reject-don't-stretch.
- **Do not `test.skip`, comment out, or soften `:223` or `:224`.** If your evidence says an assertion is
  unsatisfiable for a legitimate reason, **STOP and report** — that is a finding, not an edit.
- Do not add a bare `waitForTimeout` anywhere, and do not widen the `firstFrame`/`waveSpawn` windows to
  make entries fall outside them. Widening a window is how this guard becomes vacuous later.
- Do not touch any other expected number on this board: `m2-01`'s **200** draw calls, `m1-01`'s **77**
  geometries, `m2-05`'s **94** geometries, `asset-diet`'s **25,000,000** bytes.
- Do not touch `ed-04-gizmos` — the other half of F-1034-3 is explicitly **not** fire-authorable and is
  not yours. If you notice something about it, report it; do not act on it.
- No refactors, no drive-by tidying, no other suites.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is
already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE →
`git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's
content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted
edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching
anything.

**Pre-proved for you (s1037, verified this fire, not inherited):** `git log main..lane/m3` returned
**empty** — `lane/m3` holds nothing that is not already on main, so the reset is loss-free.
*(Honest limit: the lane worktree's uncommitted-dirt state was NOT independently probed —
`git --git-dir/--work-tree` is permission-gated for fires. The `git clean -fd` above covers residue, but
treat anything you find there as a finding worth reporting, not as expected.)*

## No-op guard
If you find yourself about to exit without changes, WRITE WHY into your report first. **There is no
"did not reproduce" exit on this task** — the defect is a string match, and a green run is a class change
that must be reported as such (scope 1), not treated as a close. **Scope 2's row dump and scope 5's
classification are deliverables in their own right:** a run that lands the scope-3 narrowing with the
scope-4 control, and reports defect 2 as diagnosed-but-owner-owned, is a complete task even if it never
reproduces a second failure.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green.
**The slice's own gate:** `e2e/perf-05-startup.spec.ts` green **desktop + mobile** at `--workers=1`,
isolated. Report the `after-*.json` contents for both projects **before and after** your change — the
before/after pair on `lazy.beforeFirstFrame` IS the result.
Adjacent unmodified-green both projects at `--workers=1`: `e2e/m1-01-first-claim.spec.ts`,
`e2e/m2-01-fixture-coordinate.spec.ts`, `e2e/perf-02-fullbase-bench.spec.ts`,
`e2e/task-025-wet-powder.spec.ts`.
**Do NOT run `e2e/ed-04-gizmos.spec.ts` as an adjacent** — it is a documented known-red (F-cp00-1,
BACKLOG:425) and running it only re-imports someone else's failure into your report.
Zero console/page errors on both viewports.

End: **READY-FOR-GATES** + report: the scope-1 attribution confirmation (which assertion, which string),
the scope-2 icon row dump + browser version + which of (a)/(b) explains the drift since `8bd9eca`, the
audit of every needle in both lists for collision, **the scope-4 two-halves control (the acceptance
evidence)**, and the scope-5 classification of defect 2 with its evidence — naming plainly whether it is
a measurement bug you fixed or a product regression you are handing to the owner.
