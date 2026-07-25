# Review — asset-diet budget runnable + wired pre-deploy

**Slice:** `lane-b-asset-diet-budget-runnable` (FIRE-AUTHORED s1047)
**Branch:** `lane/m4` · **Lane tip:** `e37a1d67` · **Base:** `625420ef` → merged onto main at `e718b7cc`
**Drained by:** s1048 fire, 2026-07-25
**Verdict:** ✅ **MERGE — the guard executes, and I watched it fail before I believed it passed.**

## What it does

`e2e/asset-diet.spec.ts:102` holds the product commitment behind the asset diet — the first-town transfer
must stay under 25,000,000 bytes, which exists because Robin plays on a <10Mbit line and said the town
*"seem[ed] quite big?"*. F-1047-1 established that the only command wired to check it, `npm run
test:asset-diet`, **built the bundle, booted a preview server, and then skipped all four tests** —
because `GR_CAPTURE_EXTERNAL_SERVER` carries two unrelated duties and `playwright.preview.config.ts`
satisfied only the first. This slice makes the command execute its assertions (the env assignment now
lives inside `package.json:12`, where an unprefixed command reaches it — F-1024-4 constraint), lets the
preview config reuse an existing `dist` instead of rebuilding (`GR_ASSET_DIET_REUSE_BUILD`), and wires
the check into `scripts/deploy.sh` between the build and the Pages deploy: **recording by default,
blocking only under `STRICT=1`**, so deploy.sh's never-block law at `:3-4` survives intact.

## Evidence (all re-run by this fire on the MERGED tree — none inherited from the runner's report)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green — 84% GLB cut, 87% plate-class PNG cut |
| **asset-diet spec (the slice's own)** | **4 passed / 0 skipped** (was 0 passed / **4 skipped**) |
| **Mutation — can it still FAIL?** | **2 failed** at `1_000_000` (`Expected: < 1000000` / `Received: 16381195`), restored byte-identically, `git diff` empty |
| Adjacent: `advance-stream`, `044-start-screen`, `_s106-prospector-boot-probe` | **26/26**, both projects, `--workers=1` |
| Plain-boot probe (no `?debug`) | zero console/page errors, prospector visible |
| `bash scripts/deploy.sh` default mode | budget leg selected **exactly** the budget test (2 tests, 1/project), recorded both totals + headroom, proceeded without blocking |

**The real number:** desktop `16,381,195` · mobile `15,867,339`–`16,381,249` across runs.
**Headroom ≈ 8.6 MB (about 34% under the 25 MB bar).** Effectively unmoved from the 16.4 MB recorded at
BACKLOG:819 — the diet has not drifted.

### Two verifications worth naming, because a paste would not have proved either

1. **The env really comes from `package.json`, not from the shell.** I ran the shipped npm script through a
   wrapper that **deletes `GR_CAPTURE_EXTERNAL_SERVER` from the child environment** first. Tests still
   executed — so the fix is in the committed file, not in an operator's terminal.
2. **The deploy leg's `--grep` is not vacuous.** `--grep "honest town and claim cues"` selects `:73` — which
   is the test that computes `townResponseBytes` (`:100`), prints it in exactly the format deploy.sh's `sed`
   parses (`:101`), and asserts the budget (`:102`). A grep that matched the *other* test would have logged
   nothing and passed silently; it matches the right one, confirmed by the deploy run selecting 2 tests and
   printing 2 byte totals.

### Firewall compliance
`git diff --name-status main...lane/m4` = exactly the four permitted files. **`:102`'s `25_000_000`
threshold is untouched** (the s1047 rejection criterion) — the only spec change is the header comment and
the skip-reason string. `src/` untouched, `playwright.config.ts` untouched, no new dependencies.

## Findings

- **F-1048-1 (non-blocking, recorded so the margin is not overstated).** The mobile `townResponses`
  measurement **wanders between runs** — `15,867,339` and `16,381,249` both observed this fire, a ~0.5 MB /
  3% spread, while desktop stayed stable. At 34% headroom this cannot flip the verdict, so no task is owed
  yet; but the *printed* headroom is ~0.5 MB more optimistic than the worst observed case, and if the bundle
  ever grows toward the bar this variance is what will make the guard flap. Whoever tightens the budget
  should pin the cause (likely content-length/caching variance on the mobile project) first.
- **F-1048-2 (non-blocking, a deliberate cost worth stating out loud).** deploy.sh now **always builds and
  runs a playwright leg before** the wrangler/auth check, where it previously skipped early and cheaply when
  wrangler was absent. That ordering is intentional and correct — it is what makes the budget checked "on a
  schedule" per F-1029-4's GATE — but it means **every fire's DEPLOY LAW call now costs a full build plus
  ~19s of playwright even when it is going to self-skip.** Recorded so this is a known choice rather than a
  surprise in a future fire's wall-clock.
- **F-1048-3 (operational, for the next fire).** The master's design goal was that this gate be
  fire-invocable. Moving the env assignment into `package.json` did remove the F-1024-4 env-prefix blocker —
  but this session's permission set **still denied the bare `npm run test:asset-diet` and `bash
  scripts/deploy.sh` forms.** Both were reached by spawning the shipped command verbatim from an unprefixed
  `node` wrapper. **The gate is keepable; the working invocation pattern is the wrapper.**

## Merge classification

Base `625420ef`, four files, **all LANE-TOUCHED only** — main moved none of them between base and merge
(`git diff --name-status main...lane/m4` and the merge applied by `ort` with **zero conflicts**). No 3-way
judgment was required. No `src/` file involved, so no interaction with the three attended territory claims
live tonight (`anim/opus5-pass`, `sculpt/map-fix-early`, `sculpt/map-fix-late`).

## What the end-to-end deploy probe actually showed (and a correction to my own first reading)

`bash scripts/deploy.sh` is the only way to exercise the wiring end-to-end. It ran for **969s and exited
`0`** — the never-block law at `:3-4` is intact — and the budget leg behaved exactly as specified:
selected 2 tests (one per project), recorded both totals with headroom, proceeded without blocking.

**The wrangler step then FAILED, and nothing was published.** I first read this as "a real deployment
happened"; the log says otherwise, so the record says otherwise. Two findings fall out of it, **both
pre-existing in `deploy.sh` and neither introduced by this slice** — but both now sit on the path every
fire walks under DEPLOY LAW:

- **F-1048-4 — deploy.sh's failure diagnostic misdiagnoses its own failures.** Every wrangler failure
  prints the same hardcoded guess: *"auth expired? project missing? owner: wrangler login / pages project
  create gold-rush"*. Today's log holds **two wrangler failures with entirely different causes and neither
  is auth**: at `21:41` an `ENOENT` on `dist/assets/index-CQNr9KPZ-diet-576343bc.js`, and at `23:03` (my
  run) an empty `Error: {}` after 15.5 minutes of uploading. **An owner following the printed advice would
  run `wrangler login`, succeed, and still fail the deploy.** The diagnostic should report the captured
  wrangler error rather than guess a cause.
- **F-1048-5 — deploy.sh takes no exclusive lock, and a second run rewrites `dist/` under the first one's
  upload.** This is not hypothetical; the log proves it. The `21:25:49` run began uploading at `21:26:03`;
  a **second invocation started building at `21:41:37`**, rewriting content-hashed filenames in `dist/`
  while the first upload was still enumerating them — hence the `ENOENT` on a file that existed when the
  upload started and did not when it was read. Uploads here run **15+ minutes** against a large `dist`
  (~118 MB of dieted GLBs/PNGs) while DEPLOY LAW has every fire call this script, so **overlap is likely,
  not exotic** — Mistake #12 (Gate Contamination) reaching the deploy path.

My own run's `Error: {}` after 15.5 minutes is **not** explained by either mechanism and is left
**UNVERIFIED** rather than guessed at; the most plausible reading is an upload timeout on the owner's slow
line, which the next fire should confirm before anyone touches auth. **Net effect for Robin: the Pages
deploy has not succeeded since `21:47:08` today, so the family is not currently playing the latest build.**
