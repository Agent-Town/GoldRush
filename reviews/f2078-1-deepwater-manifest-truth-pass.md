# f2078-1 — the deepwater manifest tells the truth after re-admission

**Slice:** `f2078-1-deepwater-manifest-truth-pass` (cure for F-E5AC-1)
**Branch:** `lane/b` · **Tip:** `edd0aaca5` · **Base:** `b569e99e1`
**Merge:** `5ca1c00c9d89b9c306bccd5ba2749786858bfd21` (main, s2080, 2026-08-20)
**Task master:** `tasks/f2078-1-deepwater-manifest-truth-pass.md` (authored s2078, FIRE-AUTHORED)

## Verdict

**MERGED.** All scope items delivered, firewall clean, every truth claim re-verified at source by
this drain rather than transcribed from the runner's report. One red in the adjacent battery,
fingerprint-matched to the known F-1606-1 and **reproduced on unmerged main as a control**.

## What it does

Merge `9dca8508` re-admitted `e5-deepwater-claim` through the ordinary door. The agent-facing
mechanics manifest did not notice: `MechanicsManifest.ts:293` still emitted a rule named
`deepwater_boss_socket_absent`, carrying `blocker: 'labelSprite/counterSprite call
document.createElement from instance field initializers'` and `consequence: 'the contract has no
reachable secure condition headlessly'`. Both statements had become false, and the manifest is
served to BYO agents — so this was a false fact handed to an external reader, not cosmetic prose.

The slice renames the rule to `deepwater_boss_socket` and replaces the two dead fields with
`constructsHeadlessly: true` / `secureConditionReachable: true`, keeping `wreckSites`, `eras` and
`bossWave`. It follows the identifier into `e2e/er01-e5-census.spec.ts:58`, where
`EXPECTED_SOCKET_RULES` pinned the old name — the fourth surface F-E5AC-1 never named, found by
s2078 grepping the identifier instead of trusting the finding's file list.

Two hygiene items ride along. `e2e/ap16-8-admission-probe.mjs` stopped hardcoding an 8-id exemption
list — a list git already knows — and now derives it from `CONTRACT_ADMISSION_EXEMPTIONS`, which the
file already imports. That is a structural cure: the old list still named the admitted
`e5-deepwater-claim` while `:28` asserts `row.lawful === false` for every id in it, so the probe was
one run away from asserting-FAIL in a way that would have read like a deepwater regression rather
than a stale constant. And `e2e/ap16-7-epoch-levers.spec.ts:20` drops an `admissionProbe: true` flag
that went inert the moment deepwater was admitted.

## Evidence

Gated on the **merged** tree in a detached worktree (`gate-s2080`, §3.0b — undecided content never
entered main's working tree), Playwright `--workers=1` serial per §3.1.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | rc=0, built in 14.38s |
| `e2e/er01-e5-census.spec.ts` | **8 passed** (31.4s), desktop-chrome + mobile-chrome |
| `e2e/ap16-7-epoch-levers.spec.ts` | **2 passed** (4.0s), desktop-chrome + mobile-chrome |
| `node e2e/ap16-8-admission-probe.mjs` | **rc=0**, ~12m46s, 56 sims, every `lawful === false` assertion held |
| `npm run test:node-guards` | 468 tests, **462 pass / 1 fail / 5 skipped**, 630.5s — see below |

**Both viewports are covered** by the two Playwright specs (each ran in both projects); this slice
renders nothing, so no screenshot set applies and none was fabricated.

**Truth claims re-verified at source, not inherited:**
- `DredgeQueenBossSystem.ts:723-724` and `:738-739` — `counterSprite()` and `labelSprite()` both now
  open with `if (typeof document === 'undefined') return new THREE.Sprite();`. The retired `blocker`
  string is therefore genuinely false. ✓
- `:139-145` → `:310-336` — `onComponentKilled('hold')` in act 2 reaches `finishFight()`, which is
  pure sim state plus `persistWreck()`, no DOM. `secureConditionReachable: true` holds. ✓
- `CONTRACT_ADMISSION_EXEMPTIONS` (`HeadlessContractSim.ts:73-102`) has **exactly 7 keys** and
  `e5-deepwater-claim` is not among them. The probe's id set is correct *by construction* now that
  it derives from that object. ✓
- `admissionProbe` is consumed at `HeadlessContractSim.ts:353` only for contracts absent from
  `SUPPORTED_CONTRACTS`. Removing it from the deepwater call is correct, and the runner correctly
  **kept** it at `ap16-7:41` for `e6-showroom`, which is still exempt. ✓
- `grep` for the old identifier across `src e2e scripts specs docs public reviews`: the only live
  code hits were the two files this merge updates. No external consumer keys on the old name. ✓

**The one red, and its control.** `scripts/node-guards-contention.test.mjs` failed with *"node-guards
board did not stay quiet for 300ms"*. Running the same guard through the same harness on **plain,
unmerged main** reproduces the identical assertion (rc=1) — so it is not this slice's. It is the
`F-1606-1` fingerprint recorded at `reviews/f1605-1-e2s3-door-delist.md:81-89`.

Worth noting what the merged tree *fixed*: the runner reported four reds (missing `index.html#pillars`
×2, two Node-26 `localStorage` CLI tests). None of them appear here. The `#pillars` pair was cured on
main by `6e61749d5`, which the lane's base predates — the drain's own re-run on the merged tree was a
free control, and it retired two thirds of the runner's red list without anyone touching a test.

## Merge classification

Base `b569e99e1`; `main..lane/b` **1 ahead** (`edd0aaca5`). Main moved **10 commits** in the window
(including the attended season roll `8086ee597`), so the two-dot `main..lane/b` diff showed 24 files
and 470 deletions — `e2e/assay-season-roll.spec.ts`, `reviews/assay-season-roll.md`, four screenshots
and most of `functions/api/standings.ts`. **Every one of those was a stale-base phantom, not a
deletion.** The runner's actual change, measured `base..lane/b`, is 4 files / +10 / −10.

| File | Class | Resolution |
|---|---|---|
| `src/agent/MechanicsManifest.ts` | LANE-TOUCHED | taken whole |
| `e2e/er01-e5-census.spec.ts` | LANE-TOUCHED | taken whole |
| `e2e/ap16-8-admission-probe.mjs` | LANE-TOUCHED | taken whole |
| `e2e/ap16-7-epoch-levers.spec.ts` | LANE-TOUCHED | taken whole |

`git log base..main -- <the four paths>` is **empty** — main never moved any of them, so no
three-way graft was needed and `--no-ff` resolved with zero conflicts. `main..lane/b` is empty after
the merge.

**Firewall: clean.** The master authorised exactly these four files and the runner touched exactly
these four. Scope 6 (`deepwater_levers_unreachable`) was correctly left unedited and reported.

## Findings

**F-2080-1 (non-blocking, extends F-1606-1 — no cure proposed, see why below).**
`node-guards-contention.test.mjs`'s `waitForQuietBoard()` (`:35-48`) decides the board is busy from
`pgrep -f 'run-node-guards'` — a **machine-wide substring match on command lines**, not a check for
running batteries. At the moment of this drain's battery the two matching processes were both
**attended-session watcher shells** (`~/.claude/shell-snapshots/…`, not this fire's
`~/.claude-fires/`), each running a loop of the shape
`until ! pgrep -f "run-node-guards.mjs"; do sleep 5; done` — i.e. *waiting for the board to go quiet*.
Neither was a battery. The stamp read `CONTENDED — 3 concurrent batteries` where the test's own
fixture expects 2.

So the guard counts **observers as batteries**, and the idiom used to coordinate with it is the thing
that breaks it: a session waiting for quiet can, by waiting, prevent quiet. This narrows F-1606-1's
remedy — *"run the curated npm list, alone, and it is green"* — which assumes "alone" is something the
running fire can achieve. It is not, when the contending process belongs to another session and is
not a battery at all. A fire that follows F-1606-1 literally will re-run a 10-minute battery and get
the same red.

**No cure is proposed, deliberately.** The obvious fix — match the harness more precisely, or exclude
shells — is a guard tightening whose failure mode is silent under-counting, and the honest
discrimination it is trying to make (battery vs observer) is not reliably available from a command
line. Recording the fingerprint so the next fire spends one control run instead of ten minutes is the
whole value here. **GATE: none — no owner word owed, nothing added to the desk.**

**F-2080-2 (bookkeeping, corrects an inherited claim).** s2079's handoff states that F-SR-5 and
F-SR-6 were *"folded into a truth-pass successor carrying F-E5AC-1, which is the master lane-b is
running right now"*. Measured: `tasks/done/20260820-091416-f2078-1-…md` contains **zero** occurrences
of `season`, `F-SR` or `skill.md`, and its firewall (`:40`) names four files, none of which is
`public/skill.md` or the Founding-Season matrix. **This master carried F-E5AC-1 only.** F-SR-5 (the
one-param, player-visible Founding-Season fix) and F-SR-6 (skill.md season docs) remain **open and
unaddressed by any merged work.** The BACKLOG row's own wording — *"one truth-pass agent after E6
lands"* — is consistent with them being a *different, later* agent than this one. Do not treat them
as shipped. **GATE: none from a fire — `reviews/assay-season-roll.md` records the attended session as
dispatching these; the next fire should check what was actually dispatched before authoring.**
