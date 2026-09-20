# lane-mill-horizon-copy — F-BW-15: the mill site explains the horizon

- **Slice:** `lane-mill-horizon-copy` (master `tasks/done/20260803-205046-lane-mill-horizon-copy.md`)
- **Branch/tip:** `lane/perf` @ `8aaa957c319b3098c0870fb799469d483f042833`
- **Base (lane parent):** `8aaa957c^`
- **Gated in:** detached worktree `worktrees/gate-s1444` at main `b82bdc22` (§3.0b — undecided content never entered main's working tree)
- **Drained by:** s1444 fire, 2026-08-03

## VERDICT: MERGE — FULL

## What it does

Owner, gate walk 2026-08-03, verbatim: *"the mill did not work for me in the last two maps (the upgrading of it) - is this because it is only the first epoch or a bug?"*

It is neither a bug nor a mystery: in the E1 release the frontier is physical **by design** (the Stamp Mill raise arm is absent, spec-asserted). But the in-run `megaproject_site` prompt still read **"Stamp Mill Site — The Steamworks door. Fund stages, hold waves, and the mill rises."** — an interactable advertising an action it will silently refuse. That is the mystery-box shape (F-BW-8's sibling).

Three changes, all release-gated:

1. `src/ui/WorldInfoNotes.ts` — the `megaproject_site` note now branches on `RELEASE_E1`, reusing the **exact shipped horizon lines** from `release-frontier.spec`: title *"The Stamp Mill stands ready."*, body *"The era turns when the wider world sends word."*, and `actionHint: undefined` so no affordance is advertised. The full-build strings are byte-unchanged in the `else` arm.
2. `src/game/Game.ts` — `fundMegaprojectStage()` and `megaprojectFundCandidate()` early-return under `__GR_RELEASE_E1__`, so the funding path is *suppressed*, not merely unlabelled. No dead button, and pressing Enter at the site does nothing.
3. `e2e/release-build.spec.ts` — a new test walks the hero to the site footprint in a **real release build** and asserts the horizon title/body, `building-context-prompt` hidden, `stamp-site-fund` hidden, and `megaproject.funded === false` after an Enter press.

The `RELEASE_E1` constant is read defensively (`typeof … !== 'undefined'`) in `WorldInfoNotes.ts`, which is imported by node-side guards; `Game.ts` uses the bare define, matching the file's existing single usage. `src/vite-env.d.ts:3` declares it and `vite.config.ts:33` defines it — both already on main, untouched by this slice.

## Evidence

| Gate | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit` (gate worktree) | **clean**, no output |
| Build | `npm run build` | **✓ built in 1.03s**; asset-diet ran (235 GLBs 84% cut, 54 PNGs 87% cut) |
| **Own spec** | `npx playwright test --config playwright.release.config.ts --workers=1` | **30 passed / 30**, both projects, 2.1m |
| Adjacent (by grep) | `045-megaproject` + `release-frontier` + `e2-stamp-mill`, `--workers=1` | **12 passed / 12**, both projects, 1.2m |
| Console/page errors | every `watchErrors` line in both runs | **`suppressed 0 known GLTFLoader blob error(s)`** — zero errors, zero suppressions |
| Screenshots | `artifacts/mill-horizon-copy/{desktop,mobile}-chrome-in-run.png` | regenerated **by this fire's gated release run** (23:25 / 23:26), not inherited from the lane |

**The slice's own spec does not run in a default battery.** `e2e/release-build.spec.ts` is excluded from `playwright.config.ts` under F-1296-3 (`claimedByAnotherConfig`), so it was gated through `playwright.release.config.ts` — which builds `GR_RELEASE=e1 npm run build:release` and previews on **port 5190**, and which re-opens the base ignore with its own `testIgnore` line (the s1301 vacuous-pass guard). 🚫 **The gap was NOT "fixed" by adding the file to the default config** — that is a standing prohibition.

**Full-build behavior proven unchanged, not assumed:** `release-frontier.spec.ts:99` (*"turning the release frontier off restores the Stamp Mill arm"*) and `045-megaproject.spec.ts:64` (*"debug dev megaproject reserves, funds, delays, completes, and persists"*) are both green on the grafted tree, on both projects. Those are the two tests that would red if the early-returns leaked out of the release flag.

**Port hygiene (F-1443-4):** the release config hardcodes 5190 and the default config 5188. Both were `lsof`-verified free before gating (5191 *was* held by an unrelated `node` pid 29695 — the release-base config's port — and was not used). No `PORT` variable was passed to anything; per the standing correction, `PORT` sets nothing.

## Merge classification

Base = `8aaa957c^`. Grafted with `git cherry-pick -n 8aaa957c` in the detached gate worktree.

| File | Class | Resolution |
|---|---|---|
| `src/game/Game.ts` | **BOTH-MOVED** (parent `df7ad9b2` → main `74d411ca`) | 3-way auto-merged, no conflict; the two guards land at `:4206` / `:4304` in main's numbering (main had grown 2 lines above) |
| `src/ui/WorldInfoNotes.ts` | **BOTH-MOVED** (parent `5d99b13c` → main `a14f4dad`) | 3-way auto-merged; the note block moved `:117` → `:119` in main |
| `e2e/release-build.spec.ts` | **MAIN-UNMOVED** (`c5f3cff5` both sides) | clean apply |
| `artifacts/mill-horizon-copy/*.png` | pure add | screenshots replaced with this fire's own gated-run output |

**Zero drift, measured:** the graft's numstat vs main is `27/0` + `2/0` + `5/3` — **identical to the lane commit's own numstat** for the same three paths. The three deleted lines in `WorldInfoNotes.ts` are the original title/lines/actionHint being replaced, read from the diff, not inferred; nothing of main's was dropped. All three landed files are **sha256-identical** to the gated tree.

## Findings

- **F-1444-1 🟡 — no goal leaf.** `node scripts/drain-block-check.mjs 20260803-205046-lane-mill-horizon-copy.md` answered **UNKNOWN** (rc=0 by *default* — §3.0: not a clearance). This is the **eighth consecutive fire** with goal-leaf debt (F-1438-3 → F-1439-2 → F-1440-1 → F-1441-1 → F-1442-2 → F-1443-1 → here). Leaf `e1-mill-horizon-copy` registered `merged` with the 40-hex hash in the drain bookkeeping commit. **The pattern is structural, not careless** — masters authored by runners from a lane task file never carry a leaf, and nothing STOPs them. It wants the attended ruling F-1443-1 already asked for.
