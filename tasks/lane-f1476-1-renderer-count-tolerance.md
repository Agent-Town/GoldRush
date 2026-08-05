CODEX: model=gpt-5.6-sol effort=xhigh

# lane-f1476-1-renderer-count-tolerance — stop the renderer-count artifacts churning, by recording what is REPRODUCIBLE instead of one sample of what is not

**FIRE-AUTHORED s1477 (attended review welcome).** Authored from an OPEN finding with an explicit,
fire-authorable gate (F-1476-1 in `tasks/BACKLOG.md`) **plus a measurement this fire performed and
committed first** (`artifacts/s1477-noise/REPORT.md` at `1b64d48b1`). No spec slice, no design fork,
no canon: this is factory-evidence hygiene, the F-1407-1 artifact-churn class.

ROLE: implementer on lane-a. WORKDIR: `worktrees/lane-a` (branch `lane/a`). Commit prefix `rct:`.
Never touch STATUS.md, reviews/, tasks/queue/, tasks/goals.json, or other lanes.

---

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 exists because a master offered the refresh as a conditional and put a currency probe
beside it; the runner ran the probe first against a stale lane and truthfully reported a failure that
was only staleness. Refresh FIRST, probe SECOND, always.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```

**STEP 2 — CURRENCY PROBE (only after step 1). Both must print `1`:**
```
grep -c "jitter is perfectly COMMON-MODE" artifacts/s1477-noise/REPORT.md
grep -c "A METRIC CANNOT BE CLASSIFIED BY ITS NAME" artifacts/s1477-noise/REPORT.md
```
*(Both were verified to return exactly 1 against main at authoring time, on a single line each, per
F-1425-2 — a key that spans a line break matches nowhere, including in the file it was copied from.
If either prints `0` after a successful STEP 1, STOP and report: the evidence commit is missing, not
the lane stale.)*

**STEP 3 — confirm clean:** `git -C worktrees/lane-a status --porcelain` prints nothing.

---

## READ FIRST (paths, in this order)

1. `artifacts/s1477-noise/REPORT.md` — the measurement. **This is your specification of what is and
   is not reproducible. Do not re-derive it; do not contradict it without re-measuring.**
2. `artifacts/s1477-noise/spread-desktop-chrome.json` and `spread-wire-railcar-3d-desktop-chrome.json`
   — per-(phase, metric) verdicts, machine-readable.
3. The F-1476-1 row in `tasks/BACKLOG.md` (cite by content per F-1310-1, the line begins
   `- 🟡 **F-1476-1 (s1476, drain of`) — in particular its GATE sentence and its closing prohibition.
4. `e2e/wire-crawler-3d.spec.ts` (the artifact write is the single `writeFile` near the end of the
   first test) and `e2e/wire-railcar-3d.spec.ts` (same shape, plus one LIVE assertion on a delta).

---

## WHY (the evidence, quoted and dated)

F-1476-1 (s1476, 2026-08-06) established that the four tracked `renderer-counts-*.json` files are
rewritten on every run and that their `calls`/`triangles` component is run-to-run noise, so **no
commit can be blamed for the movement**. It closed with a gate and a prohibition:

> **GATE: closes when either (a) the counts are re-characterised with a measured noise band and the
> artifact records a tolerance instead of a byte, or (b) the spec stops writing them into the tracked
> tree.** … **Do NOT "refresh" these baselines as a drive-by: it would bless one sample of a noisy
> quantity as truth and restart the same misreading.**

s1476 could not supply the band — it measured n=2 and correctly refused to bisect a non-monotonic
predicate. s1477 supplied it: **crawler n=12, railcar n=10, one commit (`659f4efe0`), instrument
pinned, `--workers=1`, same shell.** The three results that decide this task:

1. **Most metrics are already byte-stable.** Crawler: 18 of 20 stable across 12 runs. Railcar: 10 of
   18 stable across 10 runs.
2. **`geometries` and `textures` jitter is COMMON-MODE — every phase-to-phase delta is exact.** All
   six railcar phase pairs gave a single delta value across all 10 runs (`geometries` 8, 5, 5, −3,
   −3, 0). The absolutes move; the differences do not. This is why the railcar spec's live assertion
   `disposedCounts.geometries - baseline.geometries < 8` is sound and has never flaked.
3. **`calls`/`triangles` jitter INDEPENDENTLY per phase**, with a `+1 call ⟺ +2 triangles` signature
   in every sample of both specs — one 2-triangle quad present or absent in the sampled frame.

⚠️ **And the trap: a metric CANNOT be classified by its name.** `geometries` is hard-stable at 81
(12/12) in the crawler's `coldBaseline` and noisy in four railcar phases. Noise is a property of the
**(spec, phase, metric) triple, measured.** Any global whitelist is wrong on this evidence.

✓ Load-bearing fact, verified s1477: **nothing reads these files.** `git grep renderer-count` over all
tracked files returns the two specs that WRITE them and otherwise only prose. There is no consumer,
guard, or assertion against the committed JSON — so the artifact's whole present effect is churn.

---

## SCOPE — numbered, each item testable

1. **Change what both specs WRITE, so that a re-run of an unchanged tree produces a byte-identical
   artifact.** For each `(phase, metric)` the report marks STABLE, keep the exact integer. For each
   it marks NOISY, record a **tolerance**, not the sample — a band plus its provenance (n, commit,
   project), so the file states what it is. The exact JSON shape is yours; it must be readable by a
   human reviewer without a decoder, and it must not lose information the report calls reproducible.

2. **Record the reproducible deltas explicitly.** Because `geometries`/`textures` deltas are exact
   while their absolutes are not, the artifact must carry the phase-to-phase deltas for those two
   metrics as plain integers. These are the part that carries regression signal; they are the reason
   this task is cure (a) and not cure (b).

3. **A value leaving its band must FAIL the spec, loudly, naming the metric and the band.** The
   artifact stops being write-only: today nothing reads it, so it detects nothing. Choose bands from
   the measured spreads with headroom (the measured spreads are 1 for `calls`/`geometries` and 2 for
   `triangles`); do not fit them so tightly that ordinary jitter reds the board. State the chosen
   headroom and your reason in the review.

4. **Regenerate and commit the four tracked artifacts in the new format** (`artifacts/wire-crawler-3d/`
   and `artifacts/wire-railcar-3d/`, `desktop-chrome` and `mobile-chrome` each). ⚠️ `mobile-chrome`
   was **NOT sampled by s1477** — measure it yourself (n≥8 per spec per project) before choosing its
   bands, and record those samples under `artifacts/f1476-1/`. Do not copy the desktop bands across.

5. **Prove the churn is gone, and prove the guard bites.** See self-check.

---

## FIREWALL

**TOUCH-ONLY:**
- `e2e/wire-crawler-3d.spec.ts`, `e2e/wire-railcar-3d.spec.ts`
- `artifacts/wire-crawler-3d/renderer-counts-*.json`, `artifacts/wire-railcar-3d/renderer-counts-*.json`
- new evidence under `artifacts/f1476-1/`
- a shared helper under `e2e/` if you factor one out (both specs may use it)

**NO — do not touch, and report rather than fix:**
1. 🚫 **Any `src/` file.** This slice must move zero product code. If you believe the flickering quad
   is a real defect worth fixing, **write it up and stop** — that is a different task with a different
   gate, and the F-1460-1 `test:node-guards` trigger keys on `src/sim|systems|entities`.
2. 🚫 **The specs' existing behavioural assertions** — the three crawler tests, the railcar
   `geometries - baseline.geometries < 8` delta assertion, the zero-console `expect(errors)` checks,
   the tier/dispose pins landed by `1c8b344a`. Item 3 ADDS a check; it removes none.
3. 🚫 **`tasks/BACKLOG.md`, `tasks/goals.json`, `STATUS.md`, `reviews/`** — the drain does that.
4. 🚫 **The other two `artifacts/**` renderer files' siblings** (PNGs, `report.md`) and any other
   spec's artifacts. Ten PNGs also churn per run; that is the SAME F-1407-1 class but a different
   subject, and mixing them makes the diff unreviewable. Note it in your report if you wish.
5. 🚫 **Do NOT "refresh" the old-format baselines as a drive-by** — F-1476-1's own closing
   prohibition. You are replacing the format, not re-sampling the numbers.

---

## SELF-CHECK — run these exactly, report every number

All playwright commands take `--workers=1` (§3.1: at default workers the fire/lane shell manufactures
drift reds; a red seen at default workers is not evidence until it reproduces at `--workers=1`).

1. `npx tsc --noEmit` — clean.
2. `npm run build` — green, report the wall time.
3. `npx playwright test e2e/wire-crawler-3d.spec.ts e2e/wire-railcar-3d.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1` — all pass, both projects, zero console/page errors.
4. **THE CHURN TEST, which is the point of the whole task.** From a clean tree, run the two specs
   once, then `git status --porcelain artifacts/wire-crawler-3d artifacts/wire-railcar-3d`. The
   `renderer-counts-*.json` entries **must not appear**. Then run them a SECOND time and check again.
   Report both outputs verbatim. (PNGs may still appear — item 4 of the firewall; say so plainly
   rather than quietly passing.)
5. **PROVE THE NEW GUARD BITES, BY MANUFACTURING THE DEFECT — a passing assertion never executes its
   violation path, so its green is not evidence about the red (the s1299/s1300/s1301 standard).**
   Temporarily force an out-of-band value (e.g. hard-code a `calls` reading far outside its band),
   show the spec goes **rc=1** with a message naming the metric and the band, then revert the probe
   and show the tree is byte-identical **by content comparison, not by `git status`** (F-1295-1: a
   sweep's signature is the ABSENCE of dirt, so `git status` cannot discriminate).
6. Screenshots: the specs' own shots land under `artifacts/`; note their paths. No new shots needed.

**REPORT:** the two `git status` outputs from item 4, the rc and message from item 5, the bands you
chose for every NOISY `(spec, phase, metric, project)` with the n and spread behind each, your
mobile-chrome sample counts, and anything you touched that this master did not name.

**READY-FOR-GATES.**
