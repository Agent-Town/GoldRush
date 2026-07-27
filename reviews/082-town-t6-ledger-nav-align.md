# 082 — Town T6 Claim Ledger nav alignment

- **Slice:** `082-town-t6-ledger-nav-align`
- **Branch/tip:** `lane/m3` @ `6acfd18f` (base `59d94c71`)
- **Drained by:** s1137 fire, 2026-07-27
- **Verdict:** **ACCEPT (merge).** One assertion realigned onto the shipped menu; the 4
  remaining reds proven to be a *different, older* supersession — diagnosed here as F-1137-3.
- Runner's own report preserved at `reviews/082-town-t6-ledger-nav-align-runner-report.md`.

## What it does

`e2e/town-t6-surfaces.spec.ts:96` expected the plain start menu to be
`['Enter Town', 'Profile', 'Settings']`. The shipped menu is four items — `Claim Ledger`
sits between Town and Profile. One assertion, `+1/−1`.

### It also independently confirms s1136's F-1136-3

s1136 withdrew a ledger rider (F-1132-9) that would have told this runner to fold in a
conditional *"Load a claim"* button, on the grounds that `seedProfile` calls
`localStorage.clear()` and writes only profile + town name, so **neither** conditional can
render. The runner reported the seeded menu rendered exactly
`["Enter Town", "Claim Ledger", "Profile", "Settings"]` — *"No conditional Continue or Load
button rendered."* **Measured from the other side, the withdrawal was correct.** Had the
rider stood, this one-line task would have failed against an unreachable branch.

## Merge classification

Base `59d94c71`; three-dot LANE-TOUCHED = **2 files**: the spec (`+1/−1`) and the runner's
report. `git log 59d94c71..main -- e2e/town-t6-surfaces.spec.ts` is **empty** — main never
moved the file, so **LANE-TOUCHED clean, no graft**. Everything else in the two-dot diff
(`STATUS.md`, `src/assets/SpriteAnimator.ts`, `reviews/vp-02e*`, `tasks/*`) is
**MAIN-MOVED-ONLY** — including this fire's own vp-02e merge — and correctly not taken.

## Evidence

Gated on scratch port 5237 with an external dev server, `--workers=1`.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | green (from this fire's vp-02e gate; this slice is test-only, tsc clean) |
| `e2e/town-t6-surfaces.spec.ts` desktop + mobile-390px | **6 passed / 4 failed** (was 4/6) |

`plain menu thins to town, profile, settings` — **RED → PASS on both projects**, which is
the whole slice. Adjacent suites are untouched by construction: the diff is one string
literal inside one test body. The runner separately ran `044-start-screen`,
`profile-first-boot` and `m1-01-claim-jumpers-death` at **34/34**. Console/page errors
asserted empty by `assertNoErrors` in every passing test, both projects.

## Findings

### F-1137-3 — the 4 remaining reds are RF-03b's INTENDED SUPERSESSION, and s931's corrective missed this one file (non-blocking, corrective owed)

All four failures are the same assertion in two tests — `assay-bench` never visible after
`town-open-assay`, at `:125` and `:170`, both projects. They are **fingerprint-identical to
the runner's own "before" measurement** (same tests, same two lines) and mechanically
independent of this slice, whose diff is a nav-array string in a *different* test.

**✓ VERIFIED at source that they can never pass, rather than filed as "known red":**
`src/crafting/AssayBench.ts:283-285` — `install()` returns `AssayBenchPanel` **only** when
the URL carries `debug`, else a `ComplaintDeskPanel`. This spec's `openTown()` (`:44`) does
`page.goto('/')` with **no `?debug`**. So `assay-bench` cannot render here at all; the
assertion contradicts shipped behaviour.

That is exactly **F-902-1** (RF-03b deliberately reversed the bench into `?debug` and put
the Complaint Desk in normal play), and **F-931-1** shipped the corrective — but against
`task-037` and `town-assay-office-blender` only.

**✓ I grepped the class rather than fixing the instance** (`grep -rn "assay-bench" e2e/`):
`run3d-assay-bench.spec.ts` boots `?debug` (fine) · `world-info-notes.spec.ts:211` sits
inside a `?debug` test (fine) · `task-037-assay-bench-ungate.spec.ts` was realigned by s931.
**`town-t6-surfaces.spec.ts` is the only survivor** — the cure's denominator was narrower
than the defect's class by exactly one file.

➡️ **Owed:** swap `:125-130` and `:170` onto the `complaint-desk` / `complaint-close`
testids, mirroring the canonical-green `bug-office-desk.spec.ts` — precisely the repair s931
already specified and shipped for the siblings.

⚠️ **This is NOT the do-not-author-blind case at `BACKLOG:76`** (F-m503-1, *"assay-bench
normal-play visibility ... needs INVESTIGATION not a blind fix"*). That question was
**answered** by RF-03b's owner-blessed pivot — the bench is *supposed* to be absent from
normal play now — and s931 is the shipped precedent defining the repair. Reading the nearest
shipped slice's scope is what separates the two; the older warning was written before the
pivot existed.
