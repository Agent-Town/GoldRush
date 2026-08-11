# Review — f1643-2: refresh the suite red inventory

**Slice:** `tasks/lane-a-f1643-2-suite-red-inventory-refresh.md` (FIRE-AUTHORED s1646)
**Branch:** `lane/a` · **Tip gated:** `a27f41f4c15f3bd09ef480e7fdc1f32567b1429a`
**Merged to main:** `1981d2b3a86edc3d9872e3127ccb5369ab09cffc` (s1688, 2026-08-12)
**Lane tip quarantined:** `archive/lane-a-s1688-f1643-2-raw-quarantine` (LOCAL-ONLY, never pushed)

## Verdict

**MERGED** — path-scoped, two tracked paths only. The run completed its full mandate, including the
serial attribution pass that four previous attempts never reached.

## What it does

Replaces a 14-day-stale red-inventory snapshot with one measured 2026-08-11. The inventory is the
instrument a drainer uses to price an adjacent-suite red *without* spending a control run on it;
while stale it answered `NOT-IN-INVENTORY` + `STALE SNAPSHOT` for anything newer than 2026-07-28,
so every adjacent red in the window cost a fire a full control run (~4 min) to price.

The run produced the raw report the reducer needs (it did not exist on disk — the 2026-07-28 input
was gone), reduced it with an *observed* positive control, regenerated the compact JSON, recorded the
concurrent machine load at both ends, and then re-ran every failing spec file serially to separate
load-induced reds from real ones. That last step is what makes this snapshot trustworthy rather than
merely fresh.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (drain re-run, merged tree) |
| `npm run build` | green, built in 1.44s |
| `node scripts/red-inventory-lookup.mjs e2e/front-door-parity.spec.ts` — **the master's acceptance test** | `CLEAN-IN-INVENTORY — snapshot date 2026-08-11`, **no staleness warning** (was `NOT-IN-INVENTORY` + `STALE SNAPSHOT — 14 days old`) |
| `node --test scripts/red-inventory-lookup.test.mjs` | **18/18 pass**, 1.40 s |
| `node --test scripts/suite-red-inventory.test.mjs` | **15/15 pass**, 2.91 s |
| Corrections-section preservation (scope 6 STOP condition) | **byte-identical** across the merge, verified by section extraction on `HEAD~1` vs `HEAD` |
| Staged set at merge | exactly the 2 tracked paths; `raw.json` asserted absent |
| `logs/suite-red-inventory-raw.json` on main | **untracked and absent**, by design |

The two adjacent suites were run as **separate `node --test` processes** — batching them into one
process manufactures a red (known hazard).

### Headline numbers, old vs new

| Measure | Old (2026-07-28) | New (2026-08-11) | Change |
|---|---:|---:|---:|
| Run | 2,388 | 2,796 | +17.1% |
| Passed | 2,006 | 2,156 | +7.5% |
| Failed | 303 | 546 | **+80.2%** |
| BOTH | 135 | 210 | **+55.6%** |
| MOBILE-ONLY | 17 | 64 | **+276.5%** |
| DESKTOP-ONLY | 11 | 43 | **+290.9%** |

Every bucket above the master's ~20% call-out threshold is explained by the same two causes, and the
run separated them rather than asserting: **273 of the parallel failures passed in the serial rerun**
(load-attributable), **274 remained red** (genuine drift), **0 unresolved**. So roughly half the
apparent explosion is the machine, not the code — which is precisely the discrimination the old
snapshot could not offer, and the reason the +80.2% figure must not be quoted without its serial half.

### Run conditions (the gate's third clause — declared, not assumed)

- Command: `PLAYWRIGHT_JSON_OUTPUT_NAME=… nice -n 19 npx playwright test --reporter=json --workers=3`
  (the owner's throttle law, verbatim: *"can we limit the amount of threads it uses? … I woke up in the middle of the night to it."*)
- Wall clock **6 h 32 m 52 s** (13:37:35 → 20:10:27 +0700); physical cores **16**; Playwright 1.61.1
- Harness line: configured workers **3**, actual **3**, fully-parallel false
- Load at start (>20% CPU): `fseventsd` 167.2% · WindowServer 47.8% · `audioanalyticsd` 24.0%
- Load at end: WindowServer 52.7% · Codex Renderer 24.0% · **Blender absent** (it was at 100% for 2h26m when the master was authored)
- Serial attribution: **199** failing spec files, **1,706** executions, ~5.1 h
- `Reduction check:` reconciled **547/547** failure rows
- Raw report: **158,154,953 B (150.83 MiB)**

### Positive control — observed, not asserted

One synthetic mobile-only failure injected into a copy of the raw JSON produced **exactly one**
MOBILE-ONLY row carrying the injected marker:

```
| e2e/_s106-prospector-boot-probe.spec.ts | … | mobile-chrome | … | F1643_SYNTHETIC_MOBILE_ONLY | 14.5 s | MOBILE-ONLY |
```

`scripts/suite-red-inventory.mjs:8` makes `--positive-control-passed` pure assertion, so this step is
the only thing that makes the flag true. It was performed.

## Merge classification

Base: `lane/a` at `a27f41f4c`, one runner commit touching **3 files, all `logs/`** — no source, no
`e2e/`, no `scripts/`. Firewall respected exactly.

| Path | Class | Disposition |
|---|---|---|
| `logs/suite-red-inventory.md` | LANE-TOUCHED (main untouched since) | merged, path-scoped |
| `logs/suite-red-inventory-compact.json` | LANE-TOUCHED | merged, path-scoped |
| `logs/suite-red-inventory-raw.json` | LANE-ONLY, **150.83 MiB** | **deliberately NOT merged** |

`git merge --no-ff` was **not** used, by design: it would have carried the 150.83 MiB raw report into
main's permanent history. This follows the proven 2026-07-28 precedent (a 163.40 MiB raw report
quarantined to a local-only archive ref and never allowed onto main). The raw report survives in the
local object database at `archive/lane-a-s1688-f1643-2-raw-quarantine` **and** on disk in the lane
worktree as an untracked file, per the master's *"leave it on disk, do not delete it — RETENTION LAW,
and it is the only provenance the next refresh will have."* Neither `lane/a` nor the archive ref is
pushed to origin.

Because path-scoped `checkout` has **no** "Already up to date" alarm where `merge --no-ff` speaks up,
the staged set was asserted explicitly before committing: exactly the two tracked paths, each with a
real content delta, `raw.json` absent. Checkout and commit were a single act — nothing was left
staged on main (the s1589 sweep hazard).

## Findings

### F-1688-1 — the inherited acceptance predicate resolves to the WRONG section, and would have passed here by one blank line

**Non-blocking; no owner word needed.** Nine handoffs carried an instruction to gate this drain on
*"the merged copy's load-attribution section DIFFERS FROM MAIN'S — byte-identical ⇒ premature."*

Measured on the real artifact, that predicate is **not discriminating**. The merged file now contains
**two** sections with that name:

- `### Load-attributable (parallel-only) failures` at **line 1380** — belonging to the *aborted*
  2026-08-11 attempt, reading **"Not classified. The raw report was not emitted."**
- `## Load-attributable (parallel-only) failures` at **line 1397** — the real deliverable:
  *"273 parallel failures passed in the required serial rerun; 274 remained red and 0 were unresolved"* + the full list

A header-keyed comparison finds the **H3 first**. Against main it differs by **exactly one trailing
blank line** (188 vs 189 bytes, prose identical). So the prescribed check:

- **passed this drain for an entirely spurious reason** — a whitespace delta, not the deliverable; and
- had the reducer emitted one fewer blank line, it would have returned *byte-identical* and ordered a
  **STOP as premature** while the completed deliverable sat 17 lines below it.

Both arms are wrong. The predicate was a coin flip on a blank line.

**The discriminator that actually works** is content, not position: the load-attribution body is
either `**Not classified.**` or it states a serial-rerun count. One `grep` for `Not classified` under
that heading answers it in either direction, and is immune to heading level, line number and
whitespace. This is the same lesson as *cite by CONTENT, coordinates rot* — applied to an acceptance
predicate rather than a law pointer.

### F-1688-2 — the aborted attempt's block now contradicts the fresh one 17 lines above it

**Non-blocking; fixed in this drain's follow-up commit.** `## Refresh attempt — 2026-08-11 (ABORTED;
snapshot unchanged)` (line 1363) and its two sub-sections are a legitimate, dated observation and the
ADDITIVE-ONLY law correctly forbids rewriting them. But left unmarked they read as current, and they
say the opposite of the truth: *"no reduction, positive control, compact JSON refresh, serial failure-file
classification … was possible."* All five of those things then happened.

Cure is additive and follows the file's own precedent (`## SUPERSEDED —` at line 1200): a pointer line
under the ABORTED heading naming the run that superseded it. The observation is preserved verbatim;
only a signpost is added.

### Noted, not a finding — the runner committed a file the master expected to stay untracked

The master's Touch-ONLY list marks `logs/suite-red-inventory-raw.json` *"(untracked; leave it on disk)"*,
and the runner's auto-commit swept all 150.83 MiB into `a27f41f4c` anyway. This cost nothing here —
the drain is path-scoped precisely because this was the predicted outcome (it is the 2026-07-28 shape)
— and the runner's own report correctly declared the file and its size. Recording it so the next
refresh's author knows the auto-commit does not honour an "untracked" annotation and must be planned
around rather than relied on.

## Gate exceptions

None. No environment exceptions were taken; no red was excused.
