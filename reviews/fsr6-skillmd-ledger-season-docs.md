# fsr6-skillmd-ledger-season-docs — drain review (s2081)

**Slice:** `fsr6-skillmd-ledger-season-docs` (F-SR-6 cure)
**Branch:** `lane/b`
**Lane tip:** `a17efce96` — `runner(lane-b): fsr6-skillmd-ledger-season-docs.md`
**Base:** `980616ff1` (s2080's dispatch commit)
**Merge:** `8b69d821e3755af00b52f60a58811e25594e0ad3` (`--no-ff`, main was `c7d8c1e4f`)
**Authored by:** s2080, FIRE-AUTHORED (attended review welcome)

## VERDICT: MERGED — clean three-way, own spec green, single red proved pre-existing by control.

## What it does

`public/skill.md` — the doc served to BYO-agent rig authors at the headless door — was silent
about the **ledger season**, a dimension that governs every standings read and write. Measured
before the slice: `grep -Fc "season=" public/skill.md` = **0**.

The slice adds one `## LEDGER SEASONS` section (+6 lines), placed immediately before
`## SUBMITTING A STANDING`, stating: the numeric ledger season selects which county book a
request reads or writes; `?season=` is optional on reads and omitting it means the season now
riding; accepted values are `1` and `2`; an unaccepted value returns HTTP 400 `bad_season`;
every read response carries `season` and `assayEra`; season 1 admitted un-assayed rows while
season 2 (now riding) admits only assayable ones; writes aimed at the closed first ledger
return HTTP 403 `season_closed`.

It documents the **ledger axis only**. The adjacent-looking F-SR-5 edit (the chronicle
reader's missing `season` field) is deliberately NOT made — see Findings.

## Merge classification

| File | Class | Resolution |
|---|---|---|
| `public/skill.md` | **BOTH-MOVED** | three-way, zero conflicts — both sides survive |

Main moved `skill.md` at `a4bbf00f6` (E6 Homemaker: `e6-glow-mesa` added to the guarded
`skillmd-guard:door-contracts` block). The lane appended a new section *after* that block's
`:end` marker. `git merge --no-ff` resolved with **zero conflicts**; verified post-merge that
main's `"e6-glow-mesa",` survives at `:283` and the lane's `## LEDGER SEASONS` at `:293`.

⚠️ **The two-dot diff is a trap and is recorded here so the next reader does not repeat it.**
`git diff --stat main lane/b` reads **27 files / 685 insertions / 7269 deletions** — the E6
artifacts, the capture-loop probe, the door-completion sheet and `HeadlessContractSim.ts` all
apparently destroyed. **Every one is a stale-base phantom:** main had moved 10 commits under a
lane based at `980616ff1`. The real change, `base..lane/b`, is **1 file / +6 / −0**. This is
the identical shape s2080 recorded for the previous lane-b drain; measure `base..tip`.

## Evidence (merged tree, detached worktree `gate-s2081` per §3.0b, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean**, no output |
| `npm run build` | **green**, vite ✓ built in 1.58s; asset-diet ceilings respected (herald 1,158,214 / 1,500,000 bytes) |
| `scripts/skillmd-guard.test.mjs` (own spec) | **5/5 pass**, 3.36s — incl. *"the guard BITES a drifted skill.md (positive control, manufactured defect)"* |
| `scripts/same-game-audit.test.mjs` (adjacent — reads skill.md) | **3/3 pass**, 26.8s |
| e2e `skillmd-door` + `agent-seat` + `field-book`, `desktop-chrome` | **5 passed, 1 failed** (17.9s) |
| e2e same three, `mobile-chrome` (390px) | **4 passed, 1 skipped, 1 failed** (7.7s) |
| Content greps, merged tree | `season=` **1**, `season_closed` **1**, `LEDGER SEASONS` **1** |

**Adjacent suites derived, not assumed:** `grep -rln "skill\.md" scripts/ e2e/ src/` returns
`skillmd-guard.test.mjs`, `same-game-audit.mjs`, `seed-ladder.mjs`, `agent-seat-room.mjs`,
`e2e/skillmd-door.spec.ts`, `e2e/agent-seat.spec.ts`, `e2e/field-book.spec.ts`,
`src/encyclopedia/reader.ts` (plus four `tmp-s1*` scratch files). Every non-scratch reader with
a suite was run.

**`test:node-guards` NOT run in full, and the reason is the path rule, not convenience.** The
F-1460-1 trigger is a diff touching `src/sim/`, `src/systems/` or `src/entities/`; this diff
touches **one file under `public/`** and moves no behaviour the sim replays. The two guards in
that battery which actually read `skill.md` were run individually and are green.

## The one red — CONTROLLED, PRE-EXISTING, NOT THIS SLICE

`e2e/field-book.spec.ts:93` *"minds and rigs aggregate the same standings without changing
county ranking"* fails on both projects at `:126`:
`expect(countyBody.board[0]).toMatchObject({rank: 1, waves: 40, ...})` — *"Received has value:
undefined"*, i.e. the county board comes back empty.

**Control run, per the standing rule that a drain's own re-run is a free control:** the merge
changed exactly one file, so I reverted **only** that file (`git checkout main -- public/skill.md`,
confirmed `grep -c "LEDGER SEASONS"` = 0) and re-ran the identical test on the identical tree.
**It failed identically** — same assertion, same line, same `undefined`. Restored the merged
tree (`grep -c` back to 1) before landing.

The red is a property of main, not of these six lines of prose. **Not filed as a new finding:**
it is an empty-standings-fixture red in the field-book county aggregation and belongs to
whoever owns that fixture; a docs drain is the wrong place to open it. Recorded here so the
next fire that sees it has the control already paid for.

## Findings

**F-2081-1 (non-blocking, bookkeeping — the master's own restraint held).**
The master forbade the adjacent F-SR-5 edit and quoted s2080's HTTP-400 measurement so the
runner could not rediscover it the expensive way. **It worked:** `src/encyclopedia/reader.ts`
and `standings.ts` are untouched by this slice (`base..tip` = `public/skill.md` only). F-SR-5
remains an **owner design fork** — the reader holds a *chronicle* id (`founding-season`) while
`parseSeason` accepts only `/^[0-9]{1,4}$/` ∈ {1,2}, and `standings.ts:161-168` states the two
axes "must never be conflated". It stays on the owner's desk as **F-2080-3**; nothing here
changes its status.

**No blocking findings. No corrective task spawned.**

## Player-visibility (GZ-01)

**NOT player-visible.** `public/skill.md` is the agent-facing door doc; its audience is rig
authors driving the headless contract door. A player in a plain boot sees nothing change —
no UI, no sim, no art, no balance. Filed as a dismissal in the gazette queue rather than a
news item, on the same reasoning s2080 applied to the deepwater manifest pass.
