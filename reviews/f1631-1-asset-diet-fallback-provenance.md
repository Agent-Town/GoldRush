# Review — f1631-1: the town-budget ceiling assertion names WHICH bytes it gated

- **Slice:** `f1631-1-asset-diet-fallback-provenance` (from **F-1629-1**, filed s1629 at the f1627-1 drain)
- **Branch / tip:** `lane/c` @ `a44c31c12` (runner auto-commit, dispatched 16:29:34 on **`gpt-5.5` effort=high**)
- **Base:** `1321f9fc6` · **Merge:** `e43e0223c76a8709c1918cae2533981255033253` · drained s1634
- **Gated in:** detached worktree `worktrees/gate-s1634` (§3.0b custody — undecided content never entered main's working tree), merged as **one act** per §3 / F-1589-5.

## VERDICT: **MERGE** — scope complete, firewall clean, and all three provenance paths proven in the drain's own gate.

## What it does

`e2e/asset-diet.spec.ts` has two tests sharing a module-level `Map`. The cue test populates it; the
budget test reads it, falling back to the committed `artifacts/asset-diet/town-transfer-<project>.json`
when the map is empty — which is exactly what a solo `-g` run, a shard, or the **prescribed F-1627-3
timeout re-run** produces. In that case the release-gated ceiling assertion gates *a committed file
rather than the build*, and nothing at the site said so.

This slice makes that provenance **visible in three places**: a boolean captured at the read site with
an F-1629-1 comment naming both paths; a new `provenance` column on the *Release-gated cue-window
transfer total* table in the generated report; and a message on the `expect` itself, so a failure names
which bytes it gated. **The fallback still works exactly as before** — the cure is visibility, not
enforcement, as the master required.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (no output) |
| `npm run build` | **green** — built in 1.46 s; asset-diet bundle report emitted |
| `npm run test:asset-diet` (`--workers=1`, preview config) | **6 passed / 7.3 m**, exit 0 — `desktop-chrome` + `mobile-chrome` |
| Console/page errors | **zero** — every arm logged `watchErrors suppressed 0 known GLTFLoader blob error(s)` |
| Screenshot tolerance test | passed both projects (5.2 s desktop / 9.4 s mobile) — nothing renders differently |
| Solo fallback, artifact **≠** HEAD | **1 passed / 3.6 m**, exit 0 |
| Solo fallback, artifact **==** HEAD | **1 passed / 3.5 m**, exit 0 |
| `test:node-guards` | **not owed** — no `src/sim`, `src/systems`, `src/entities` path in the diff (F-1460-1). Stated, not omitted. |
| Adjacent suites | **none owed** — one spec file, no `src/**`, so no other suite can observe it. |

### All three provenance labels, measured here (not inherited from the runner's report)

| Path | Label emitted in `town-budget-<project>.md` | cueWindowTotalBytes | Headroom |
|---|---|---:|---:|
| map-HIT (full suite) | `measured in this run` | 22,497,140 | 2,502,860 |
| map-MISS, artifact **≠** HEAD | `read from the on-disk fallback artifact (not measured in this run)` | 22,497,140 | 2,502,860 |
| map-MISS, artifact **==** HEAD | `read from the committed artifact` | 21,903,056 | 3,096,944 |

Assertion message resolves to `release-gated cue test bytes were <label>`.

🔑 **The substance, quantified:** the committed desktop baseline is **21,903,056** while the same build
measured fresh is **22,497,140**. So the vacuous path was reporting **594,084 bytes of headroom the
build does not have** (3,096,944 vs 2,502,860). That gap is precisely what the label now names.

### Firewall / NO-list conformance — each verified against the blobs, not the report

- Exactly **one** file changed: `e2e/asset-diet.spec.ts` **+33 / -5** (matches the runner's own numstat).
- `25_000_000` **absent from the diff**; literal count **1 on main and 1 on lane/c** — unchanged.
- `TOWN_TRANSFER_CEILING_BYTES` occurrence count **4 on both sides** — unchanged.
- The cue test's own live assertion (`expect(cueWindowResponseBytes).toBeLessThan(...)`, `:241`) **intact**.
- `artifacts/**` **not in the diff**; A/B arms **not** wired to the ceiling; existing F-1627-2 / F-1625-4
  comment block **extended, not replaced**.

## Merge classification

Base `1321f9fc6` (`git merge-base main lane/c`). Lane touched **one** path. `git log 1321f9fc6..main --
e2e/asset-diet.spec.ts` is **empty** → **LANE-TOUCHED / MAIN-UNTOUCHED**; no graft, no conflict, `ort`
merged cleanly. The `main..lane/c` two-dot diff additionally listed `STATUS.md`, `logs/**`,
`scripts/fire.md`, `scripts/law-pointer-baseline.json`, `tasks/BACKLOG.md` — **all pure main-moved
drift** (the lane sat 8 behind), which is why the three-way merge produced one file and not nine.
Post-merge `main..lane/c` is **empty**; `lane-usable lane-c` → **USABLE, ahead=0**.

## Findings

### F-1634-1 — `matchesCommittedFile`'s 1 MB `maxBuffer` is a silent-mislabel ceiling (NON-BLOCKING, 7.8× headroom today)

The runner's `matchesCommittedFile` helper shells out to `git show HEAD:<path>` with
`{ maxBuffer: 1_000_000 }`. Today's artifacts are **127,971** and **128,183** bytes — **7.8× of headroom**,
so this is safe now and I am recording it rather than curing it. If those artifacts ever grow past 1 MB,
`execFile` rejects, the `catch` returns `false`, and a genuine *committed-artifact* read gets labelled
`read from the on-disk fallback artifact` instead. **The degradation direction is safe** (toward the more
cautious label, never toward a false "measured in this run"), so this can mislead a reader but cannot
launder a red into a green. No corrective task queued; a future toucher of this helper should raise the
buffer or stream the compare.

### F-1634-2 — the runner's out-of-scope third label is LOAD-BEARING, and it is the path most real fallbacks take (CONFIRMED, this is a commendation not a defect)

The master's scope asked for two labels. The runner shipped **three**, adding
`read from the on-disk fallback artifact (not measured in this run)` after its own `codex review
--uncommitted` observed that "committed artifact" can be false once the artifact has been rewritten on
disk — and it **reported the adaptation plainly** rather than burying it.

I measured that this third label is not decoration. **Mid-gate, my own full-suite run had already
rewritten `town-transfer-desktop-chrome.json` (127,023 bytes on disk vs 127,971 at HEAD) while
`mobile-chrome` still matched** — i.e. a suite run leaves the artifact ≠ HEAD as a matter of course.
Therefore the **real** F-1627-3 fallback (a timeout part-way through a suite, then a solo re-run in the
same worktree) lands on the **third** label, and `read from the committed artifact` appears only on a
genuinely clean tree. Both shapes are proven above by deliberate construction: I ran the solo case
dirty, then restored both artifacts from HEAD (verified byte-equal) and ran it again.

Had the runner implemented the master literally, the common fallback case would have claimed
`read from the committed artifact` while gating bytes that were **not** the committed artifact — a new
false statement inside the very cure written to remove one.

### F-1634-3 — `gpt-5.5` at `effort=high` produced merge-quality work; s1632's priority (B) is ANSWERED, refills to lanes a/b/d are unblocked

s1632 deliberately dispatched **one** master to `gpt-5.5` rather than four, because the tier sits below
the owner's 2026-07-10 "Sol over Terra" ruling and no `gpt-5.5` output had ever been gated here. **This
drain is that verdict, and it is positive:** scope complete on all four numbered items, firewall exactly
respected (one file, ceiling provably untouched), gates met at the level the master demanded, an honest
report, and the single deviation from literal scope was an **improvement** that the runner surfaced
itself and that this gate confirmed load-bearing (F-1634-2).

**Recommendation: resume normal §2E refills on `gpt-5.5` + `effort=high` headers while `tasks/CODEX-WALL`
stands.** This is one slice — a small, test-only one — so it is evidence, not proof, about the tier;
a `src/**` slice would test it harder. It does not touch **F-1631-3** (buying credits stays owner-only)
and it does not reinstate `gpt-5.6-sol`, which remains quota-walled until 2026-08-16 03:30.

## Not owed

No GZ-01 gazette item: this is test-instrumentation, **not player-visible** — nothing in the game
changes. No deploy: no gameplay-affecting code merged. No `reviews/shots-*` directory: nothing renders
differently, and the suite's own screenshot-tolerance test passed in both projects.
