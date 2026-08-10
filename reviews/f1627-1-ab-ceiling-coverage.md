# Review — f1627-1-ab-ceiling-coverage

**Slice:** `f1627-1-ab-ceiling-coverage` (FIRE-AUTHORED s1627, from F-1627-1 at the `f1625-1` drain `bc35fa79c`)
**Branch:** `lane/c` · **lane tip:** `53b113b5d` · **merge:** `0fa484763ff7008fd38babff2b5e1dfd07dd026f`
**Drained by:** s1629 · **Gated in:** detached worktree `gate-s1629` (§3.0b)

## Verdict

**MERGED.** Every condition in the BACKLOG GATE is met, verified on the merged tree: `test:asset-diet` 6/6 both
projects, the byte-identical duplicate gone (grep = 1), the recorded-not-gated status stated at the assertion site
in a comment naming F-1625-4, and `25_000_000` provably untouched.

## What it does

`f1625-1` had replaced the A/B test's two ceiling checks with two byte-identical copies of a *third*
measurement's check — a subject substitution that preserves the assertion count, which is exactly why it read
as harmless. This slice deletes one of the two copies and writes, at the site, which quantities the test does
and does not gate:

```ts
// Gate only the cue test's release quantity, also asserted at its own site. The A/B cue-window
// totals stay recorded, not release-gated: F-1627-2 measured desktop normal at 24,604,025
// (f1621-1), 26,115,186 (f1625-1 runner), and 23,259,297 (f1625-1 drain), straddling the ceiling.
// Refusing that flaky gate is deliberate; F-1625-4 is the open owner fork.
```

It also carries that three-run swing into the generated `town-budget-*.md` evidence tables, so the reason the
arms are ungated is legible from the artifact and not only from the source.

**The restraint is the deliverable.** The obvious fix — wiring `normalCueWindowBytes` / `saveDataCueWindowBytes`
to the ceiling — was explicitly forbidden by the master, because F-1627-2 measured that arm's noise band
straddling 25,000,000. Wiring it would have installed a flake wearing a fix's clothes. The runner obeyed:
`25_000_000`, `deploy.sh` and `src/**` are untouched.

## Evidence (all on the merged tree, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, **4.37 s** |
| `npm run build` | green, **1.32 s** |
| `test:asset-diet` (bundle mode, both projects) | **6/6 passed, 406.9 s**, rc=0 |
| Adjacent `advance-stream-cache-reuse` | **4/4 passed, 66.6 s**, rc=0 |
| Release parser feed | `desktop-chrome 21903056` · `mobile-chrome 22497140` — both under 25,000,000 |
| `grep -c` surviving ceiling assertion | **1** (required 1) |
| `grep -c "TOWN_TRANSFER_CEILING_BYTES = 25_000_000"` | **1** (threshold untouched) |
| `expectNoConsoleErrors` call count | **6** (unchanged) |
| Console/page errors | zero in every arm, both projects |
| `test:node-guards` | **not required** — diff touches no `src/sim/`, `src/systems/`, `src/entities/` path (F-1460-1) |

The release-parser figures reproduce the runner's own report **exactly** (21903056 / 22497140), which is the
useful control: the same two numbers from two shells means the quantity the deploy gate consumes is stable,
unlike the A/B cue-window quantity this slice deliberately refuses to gate.

**Machine check, not assumed (F-1628-1):** `tsc` at 4.37 s matches s1628's 4.4 s reading on a healthy box, so
the full budget was run rather than rationed on a load-average headline.

## Merge classification

Base `8db2cc4eb`. All **9** files **LANE-TOUCHED / MAIN-UNMOVED** — measured per file with
`git log <base>..main -- <path>` (zero commits on main for every one). Clean `ort` merge, no conflicts, no graft.

`e2e/asset-diet.spec.ts` (+6/-1) · `artifacts/asset-diet/town-budget-{desktop,mobile}-chrome.md` ·
`artifacts/asset-diet/town-transfer-{desktop,mobile}-chrome.json` · 4 regenerated `*-throttled.png`.

Landed by **fast-forwarding main to the gated commit itself**, so the merge window was zero by construction
(F-1589-5) — main was verified unmoved and an ancestor of the gate commit immediately before the FF.
`main..lane/c` is now empty.

## Findings

### 🔴 F-1629-1 — the surviving ceiling assertion is VACUOUS when the test runs alone, and the master's own fallback procedure is exactly that case (non-blocking)

`cueTestStats` is derived from `cueTestMeasurementsByProject`, a module-level `Map` (`:45`) populated **only**
inside the *cue* test at `:229`. The budget test reads it at `:352` with a fallback:

```ts
const cueTestMeasurements = cueTestMeasurementsByProject.get(testInfo.project.name)
  ?? JSON.parse(await readFile(path.join(ARTIFACT_DIR, `town-transfer-${project}.json`), 'utf8'))
```

So when the budget test runs **without the cue test in the same worker** — a solo `-g` run, or a shard/retry
that lands it alone — the surviving assertion gates a **committed artifact file**, not anything the run measured.

✅ **PROVEN BY MANUFACTURING THE DEFECT, not inferred from the read.** In `gate-s1629` I inflated one entry of
`artifacts/asset-diet/town-transfer-desktop-chrome.json` by 4,000,000 bytes (sum 21,903,056 → 25,903,056),
changed **no code and did not rebuild**, and ran the budget test solo:

```
Expected: < 25000000
Received:   25903056        at e2e/asset-diet.spec.ts:437:35
```

rc=1 in 195.4 s. The assertion reported the number I had written into the JSON. That is decisive: in solo mode
the quantity under test comes from disk, so the check **cannot fail on a real transfer regression** and cannot
pass or fail on the build at all. Artifact restored byte-identically (sha256
`96bc43ab855fef8e11851a99fd0c2ab377a0b3fabe36c5a9704da47780ab51f4`, verified); main root left clean.

⚠️ **Why this matters beyond the abstract:** the f1627-1 master's *own* self-check (line 50) instructs a runner
who hits the F-1627-3 timeout to "re-run that one test alone (`--project=desktop-chrome -g 'town byte budget'`)".
That prescribed recovery procedure is precisely the configuration in which the surviving assertion is vacuous —
so the fallback yields a green that means strictly less than the green it is standing in for, and nothing says so.

**NOT a blocker and NOT introduced by this slice:** the `??` fallback and the assertion both predate it, and the
slice is a strict improvement on the duplicate it replaced. But the slice's stated purpose is to make this
site's coverage *legible*, and its comment — "also asserted at its own site" — is true for the full-suite case
and misleading for the solo one. The cheapest honest cure is a note at `:352` (or a skip/guard when the map is
empty) saying the fallback value is historical; that is a fire-authorable corrective, not an owner fork.

### 🟢 F-1627-3 did not reproduce

The desktop `town byte budget` arm completed inside the full 6/6 pass with no timeout, on a box measuring
4.37 s `tsc`. Consistent with s1627's attribution of that red to shell load rather than to the test.

## Note for the next fire — the second done-move was a STOP, not work

`tasks/done/` held **two** done-moves of this task. s1628's handoff advised draining "the LATER one"; that is
**wrong and would have drained an empty run**. The 13:05 run (78 KB log, 38,199 tokens) is a lane-safety
pre-flight **STOP**: it correctly refused because the 12:32 run's own output (`53b113b5d`) was still undrained,
and it made no edits, ran no gates and produced no commit. The work is entirely in the 12:32 run.

This is the known `false-done-from-preflight-stop-behind-undrained-predecessor` shape, and the general rule it
re-teaches: **a done-move is a claim, a diff is a fact** (Mistake #1) — the newest file is not the newest work.
Judge by the run log and the lane commit, never by mtime ordering.
