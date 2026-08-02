# f1397-1-e1-release-door-drill-yard — drain review (s1398)

- **Slice:** `f1397-1-e1-release-door-drill-yard` (F-1397-2, the roster-shaped half of F-1396-3)
- **Branch:** `lane/e2-arsenal` (lane-c) · **tip** `67d28607` · **base** `59dacbd3`
- **Merge commit:** `2daeb68908a4c0e764d148ee382c82a63bbac908`
- **Block-check (§3.0, first command, `--strict`):** ✅ **CLEAR** — leaf `status="queued"`, not blocked. Read the WORD, not the exit code.

## Verdict

**MERGED — GREEN.** The E1 release door now boots **all six** shipping E1 contracts, and
`e1-drill-yard` passes through it. **F-1397-2 is CLOSED, measured, not assumed.**

## What it does

`e2e/release-build.spec.ts:18` held a five-name `CONTRACTS` roster that predated the
owner-ratified sixth E1 contract (`e1-drill-yard`, landed `f0bf5251`, 2026-08-01). That roster
drives a parameterised loop, so the release gate — the door a vE1.0 tag is measured through —
had **never booted one of the six contracts it is meant to certify**. The slice adds the name at
index 1. One file, `+1/−1`.

The master was deliberately **MEASURE-FIRST**: it instructed the runner to STOP, revert and
REPORT rather than fix if drill-yard reddened, because that would be a launch-readiness defect in
product code, not a chore. **The runner took the green branch — no product defect exists.**
This is the answer the owner needs *before* tagging vE1.0, not after.

## Evidence (merged tree, detached worktree §3.0b, `--workers=1` throughout §3.1)

| Gate | Command / harness | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | **clean** |
| Build | `npm run build` | **green, 1.09s** |
| Slice's own spec | `--config playwright.release.config.ts` | **28/28** (14 desktop + 14 mobile) |
| ↳ the new case | `e1-drill-yard boots through the E1 release door` | **green in BOTH projects** |
| Adjacent (grep-derived) | `cp01-charter-roundtrip` + `drill-yard-manifest` + `drill-yard` | **26/26** (13 per project) |
| Node guards | `node --test` × 37 files | **228/228** |
| Boot probes | `profile-first-boot` + `trail-guide-plain-boot` + `f1297-2-plain-boot-tape-button` | **16/16** desktop + 390px, zero console/page errors |

**Adjacency derived by grep, not inherited from the runner's list:** `grep -rln e1-drill-yard e2e/`
yields exactly four specs — the merged one plus the three run above. `grep -rln release-build e2e/ src/`
shows **no file imports the spec** (it names only itself), so the e2e blast radius is closed; the
node-side references (`assert-release-build`, `console-watch-single-source`, `citation-title-guard`,
`gate-caller-audit`) all sit inside the 228-test battery, which is why it was run in full.

## Merge classification

| File | Class | Proof |
|---|---|---|
| `e2e/release-build.spec.ts` | **LANE-TOUCHED** | `git log 59dacbd3..main -- e2e/release-build.spec.ts` → **empty**; main never moved it |

Clean merge, no conflicts, no 3-way graft needed. `main..lane/e2-arsenal` now empty (properly
merged, not falsely ahead).

⚠️ **The two-dot diff was alarming and meaningless** — `git diff main..lane/e2-arsenal` reported
**23 files / 1,197 deletions**. Every one is a phantom of a stale base (the lane forked at
`59dacbd3`, before s1397's handoff commits, so main's newer files read as lane-side "deletions").
`git show 67d28607` is the fact: **one file, +1/−1.** This is the second consecutive fire to meet
this shape on this lane; read the commit, never the two-dot.

## Red debt

s1397 measured **8** red project-results. This merge **cannot change that number**: it touches one
spec that the default config does not even collect, and none of the four red files
(`072-era-activation`, `agent-view`, `e1-baron`, `cp03-press-loop`). Stated as unchanged **by
construction — NOT re-measured this fire**, and flagged as such so no later reader promotes it to a
measurement it never was.

## Findings

### F-1398-1 🟢 — an authored master prescribed the wrong Playwright harness for its own spec

`tasks/f1397-1-e1-release-door-drill-yard.md:38` and `:61` both prescribe
`npx playwright test e2e/release-build.spec.ts --workers=1`, i.e. the **default** config. But
`playwright.config.ts:40` lists `'**/release-build.spec.ts'` in `claimedByAnotherConfig` and
ignores it. **The master's own self-check command cannot execute the spec it is checking.**

**Measured, not assumed:** the command prints `Error: No tests found.` and exits **rc=1**. My first
instinct was to call this a false-green hazard; it is not — it fails **loudly**. The real cost is a
runner cycle spent diagnosing a harness error, which this runner absorbed and reported correctly.

This is the **s1397-authored-it-but-could-not-run-it** class: an author with no way to execute its
own self-check ships an untested cure. Note `playwright.config.ts:27–32` records the *inverse*
direction of this same trap already biting once — a grep-adjacency swept this spec **into** the
wrong harness and manufactured **8 false reds**.

**REC (cheap, mechanical, fire-authorable):** `claimedByAnotherConfig` is a machine-readable list.
A guard can red when a task file names a claimed spec without naming its owning config. Not built
this fire — out of the drain's scope, and it wants its own slice.

### Non-findings, recorded so they are not re-hunted

- The five **SAMPLED** F-1396-3 sites (`panorama-framing`, `terrain-seamless`, `tr-02-splat-ground`,
  `contract-briefings`, `stream-capture`) remain correctly firewalled OUT and UNMEASURED, exactly as
  s1396 ruled and s1397 re-verified by reading each constant's definition. **Do not widen them.**
- The runner restored eight tracked evidence PNGs under `artifacts/pc-01b-drill-yard-parity/` that
  its adjacent run rewrote; the final diff is one line in one file, which I confirmed by
  `git show --stat`.

## Gazette / ticker

**No gazette item, correctly.** The filter law wants a *player-visible* change; this merge is
test-only and has no player surface. The launch-readiness *fact* it establishes is owner-facing and
belongs on the desk, which is where it went — not in the news queue.
