# f1623-1 — town-transfer determinism (settled, cap-bounded meter)

**Slice:** `tasks/lane-f1623-1-town-transfer-determinism.md` (lane-a, FIRE-AUTHORED s1623 from F-1623-1)
**Branch/tip:** `lane/a` @ `86fa1f3dd` · **base** `a5441e00df` · **merge** `1ed9c093575ef8bf8d5200003b7d18bf1b9906e1`
**Drained:** s1625 fire, 2026-08-10, in detached worktree `gate-s1625` (§3.0b — undecided content never entered main's tree)

## Verdict

**MERGED — with two findings filed and the corrective dispatched in the same fire.**

The slice does what it was asked and reports its own limits honestly. It is merged **despite leaving its
own suite 2/6**, because all four reds are the single assertion class the master predicted and
pre-authorised in writing, none is behavioural, and the cure is queued before this fire hands off.
That last clause is the condition of the verdict, not a courtesy: F-1460-1's lesson is that a red
nobody owns acquires an excused label and rots for days.

## What it does

`e2e/asset-diet.spec.ts` stops sampling the town transfer at the cue window and instead starts a meter
that runs until **1500 ms of network idle, capped at 20 s**, reporting per arm: `totalBytes`,
`uniqueBytes`, `duplicateBytes`, duplicate-URL count, settle duration, and whether the cap was hit.
It adds `artifacts/asset-diet/town-transfer-stability.md`. The motivation was F-1623-1: the old
cue-window number swung **3.08×** run-to-run, so no release decision could rest on it.

The improvement is real. Within one shell the quantity is now reproducible to well under 1%, against a
3.08× swing before. **What the slice does not do — and says so itself — is settle:** every cue, normal
and decomposition arm hit the 20 s cap; only the saveData arm reached genuine idle (~10.2 s). So the
released quantity is *bytes transferred in 20 seconds*, not *bytes to quiescence*.

## Evidence

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green, 1.25 s** |
| `e2e/asset-diet.spec.ts` (own suite, preview config, `--workers=1`) | **2 passed / 4 failed, 7.8 m (RC=1)** |
| Failure fingerprint | **4/4 are `expect(…).toBeLessThan(TOWN_TRANSFER_CEILING_BYTES)`** at `:226` (cue) and `:399` (normal arm). **Zero behavioural failures.** |
| Behavioural assertions in the same tests | **passed** — the cue-visibility expectations sit above `:226` and were reached and satisfied |
| Console/page errors | **zero**; `expectNoConsoleErrors` still called at **6** sites, unweakened |
| Merge classification | base `a5441e00df`; **all 8 files LANE-TOUCHED / MAIN-UNMOVED**; clean `ort` merge, no graft |
| Firewall | respected — only `e2e/asset-diet.spec.ts` + `artifacts/asset-diet/**`. No `src/`, no `scripts/deploy.sh`, no config, no `package.json` |
| Master invariants | currency warning `DO NOT QUOTE A SINGLE RUN…` **1**; deploy-gate string `townResponses: ` **1** |
| `test:node-guards` | **correctly out of battery** (F-1460-1): the diff touches no `src/sim/`, `src/systems/`, `src/entities/` path |

**The drain run reproduced the runner's headline exactly** — same 2/6, same four test ids — which is the
free control on the runner's own report.

## Findings

### 🔴 F-1625-2 — the slice breaks the RELEASE GATE's own test, and the deploy budget flips from 9.8 MB of headroom to ~21 MB OVER

`scripts/deploy.sh:68` runs this spec with `--grep "honest town and claim cues"` and `:81` parses
`[asset-diet] <project> townResponses: <n> bytes`, comparing it to `BUDGET_LIMIT=25000000` (`:52`).
That grepped test is **one of the four this slice reds**, and the number it emits is now the settled
one. Measured in this drain: **desktop 45,895,261 · mobile 45,263,441**, against a 25,000,000 limit.

So after this merge the deploy gate trips **both** of its failure conditions at once — `BUDGET_RC≠0`
and `BUDGET_OVER=1`. Consequence by mode, read from the code at `:87–:90`:

- **default mode** (what the DEPLOY LAW has fires run): `WARN: asset budget check failed` and **continues**.
- **`--strict`**: `ABORT: asset budget check failed in strict mode`, `finish budget_failed 5`.

⚠️ **Not one byte of game asset changed.** The ceiling was calibrated against the *cue-window* quantity
and is now being asked about a *20-second-settled* quantity — two different measurements wearing one
name, which is precisely the F-1620-7 class that f1621-1 had just finished curing on the other limb.
The comment block at `deploy.sh:82–:84` records that six deploys once shipped past an unmeasured budget
while *looking* like a pass; a permanent WARN on every deploy is how that lesson gets re-learned.

**This is the master's own "LATER task", and it is now urgent rather than later.** Corrective
`f1625-1-town-ceiling-recalibration` authored and dispatched to lane-c in this same fire.

### 🔬 F-1625-3 — the stability verdict is SHELL-LOCAL, because a cap-bounded meter measures the machine as well as the game

The runner reported max deviation **0.39%** (desktop) / **0.61%** (mobile) across three runs and a PASS.
Reproduced independently in the fire shell, the same quantity reads **45,895,261** (desktop) and
**45,263,441** (mobile) against the runner's band of **47,998,506–48,582,362** — **4.4% and 6.8% below
its minimum**, both in the same direction.

The mechanism is the slice's own honest caveat taken one step further: **every measured arm hit the
20 s cap**, so the number is "how many bytes fit in 20 seconds", which is a function of load and CPU.
The fire shell runs under a lower per-job ceiling than a lane shell (F-1269-1: 7.53× lane vs 3.47× fire),
so it fetches less within the cap and measures lower. Within a shell the meter is stable; across shells
it moves several percent.

⚖️ **This does not refute the slice — it qualifies its headline.** Reproducibility genuinely improved
(3.08× → sub-1% within shell). But "the release quantity is stable" is only true at constant load, and
a release gate is exactly a thing that runs in different shells. **Two data points are not a
distribution**, so this is filed as a measured observation, not a verdict; the recalibration corrective
is told to settle it rather than to assume it. s1623 pre-authorised **REFUTED** but forbade a widened
tolerance or a dropped run — neither was taken here.

## Merge classification

Base `a5441e00df` (the s1623 authoring commit). All eight paths LANE-TOUCHED with main unmoved on every
one, verified per-file by `git diff --name-only <base> main -- <path>` returning empty. No conflicts,
no three-way graft required.

| Path | Class |
| --- | --- |
| `e2e/asset-diet.spec.ts` | LANE-TOUCHED / MAIN-UNMOVED (the only code file) |
| `artifacts/asset-diet/town-transfer-stability.md` | LANE-TOUCHED (new) |
| `artifacts/asset-diet/cue-window-{desktop,mobile}-chrome.json` | LANE-TOUCHED (new) |
| `artifacts/asset-diet/town-budget-{desktop,mobile}-chrome.md` | LANE-TOUCHED / MAIN-UNMOVED |
| `artifacts/asset-diet/{desktop,mobile}-chrome-town-throttled.png` | LANE-TOUCHED / MAIN-UNMOVED |

## Note on the runner's report

One line is recorded rather than passed over: *"Second-opinion review entered a recursive repo-skill
loop; it was stopped after clean TypeScript/diff checks and no actionable finding."* The runner said so
plainly instead of implying a review happened. No action owed — but it means this slice had **one**
pair of eyes on it before the drain, which is part of why the drain re-ran the whole suite rather than
trusting the report.
