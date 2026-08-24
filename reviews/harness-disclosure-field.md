# Review — harness-disclosure-field (s2270 drain 1)

**Slice:** `harness-disclosure-field` · **Branch:** `lane/b` · **Tip:** `f21448853fd8622ff4392bc4ae8aef68eb6f02b3`
**Base:** `8a3dc50db`-era lane base · **Merged to main at:** `08bbb64edda70fee35047152f9489c3a11d196c1`
**Gate worktree:** `.gate-s2270` (detached, §3.0b) · fire shell · `--workers=1` (§3.1)

## VERDICT: MERGE — every scope item shipped, the firewall held, and the ranking claim is provable rather than asserted.

## What it does

F-HARNESS-1 asked whether a harness may import the county's open sim as its world model for ranked
play. The owner ruled it, verbatim 2026-08-24: *"yes, that is fine, lawful with disclosure."* This
slice puts that ruling into the three places a rider actually meets it.

The **stack** gains an optional `worldModel` string, capped at 64 characters — deliberately tighter
than the 256 the other text fields carry, because this is a label and not a description. It is
additive in the strictest sense: every submission that predates it stays valid, and an absent field
renders as *undeclared* rather than as an accusation. Validation lives in `validateStack`, so it
reaches **both** L1 backends without either being edited — the seam carried it, exactly as the
master predicted.

The **door** states the law in the county's voice inside `## HONESTY LAWS`, so the declaration is
covered by the honesty section that already governs `model`/`harness`/`config` rather than by a new
clause nobody would think to read. `public/skill.md` is source-locked by two independent guards and
both were **re-pinned to the new content in the same commit** — never loosened.

The **board** shows it as information in three render sites: the Field Book cell (`World model:
sim-import` / `World model not declared`), the row detail (`World model` → value or `Not declared`),
and the county standings stack label (`… · world model sim-import`). Every one goes through
`escapeHtml`.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0** — `✓ built in 1.82s`, asset-diet within ceiling |
| `scripts/test-standings.mjs` | **KV 121 · SQLite 121** — both L1 backends |
| `scripts/test-stats.mjs` | **87** checks |
| `scripts/test-ledger-worker.mjs` | **15** HTTP-contract checks |
| `scripts/skillmd-guard.test.mjs` | **6 pass / 0 fail**, incl. its positive control ("the guard BITES a drifted skill.md") |
| Own specs — `field-book` + `lb-01-county-standings` + `skillmd-door` | **desktop-chrome 19/19 · mobile-chrome 19/19** |
| Adjacent — `en-01-claim-ledger`, `milk-county-board`, `board-era-chapters`, `ledger-era-chapters`, `assay-ledger-page`, `sea-2-season-page`, `tl-03b-ledger-stats-window` | **desktop 23/23 · mobile 23/23** |
| Boot hygiene — `078-ux-hygiene` | **8/8**, both projects |

Screenshots ride in the merge: `artifacts/county-standings/{desktop,mobile}-chrome.png`,
`reviews/shots-fd1/`, `reviews/shots-fd3/`, `reviews/shots-fd3-1/`, `reviews/shots-f-board-2/`,
`reviews/shots-minds-and-rigs/`, `reviews/shots-stack-directory/`.

## The ranking claim, verified rather than inherited

The runner reported *"`rankedRows`, `compareScores`, and `groupRows` do not read `worldModel`."*
That is a claim about three named functions. I took the stronger measurement instead — an exhaustive
grep of the token across `src/` and `functions/`:

**13 sites, and every one is a type declaration, a validator, or a render.** Zero sites in any
ordering path, named or unnamed. `reader.ts` `:47 :80` (types) `:694 :1033 :1035` (validation)
`:782 :889 :1096` (render); `standings.ts` `:51` (type) `:157 :957` (validation) `:508 :588`
(board/cell projection). Spec Law 1 — ranking stays species-blind and outcome-based — holds by
construction, not by inspection of a shortlist.

## Merge classification

Base `6a0141593` (my lock commit) + tip `f21448853`, three-way `ort`, **zero conflicts**; the single
auto-merge was `tasks/BACKLOG.md`, where the lane rewrote the F-HARNESS-1 line and main had moved
elsewhere in the file. 33 files, **+68 / −12** across 10 text files and 23 PNGs.

All 10 text files are **LANE-TOUCHED / MAIN-UNMOVED** — verified after the merge by
`git diff main f21448853`, which lists **none of them**: main now carries the lane's bytes exactly
for every path the slice touched. `git log main..lane/b` is **empty** — fully absorbed.

`server/ledger/serve.mjs` is untouched, as the firewall required. The master said *verify, don't
edit*; the SQLite arm of `test-standings` (121 checks) is that verification.

## Findings

**F-2270-1 — NON-BLOCKING, and it is about the INSTRUMENT, not this slice: the first run of a
playwright battery in a freshly-created gate worktree reds one test, and the red does not survive a
repeat.** Measured twice this drain, in two different files, with the same fingerprint:

- Own specs, run 1: **1 failed / 18 passed in 1.2m** — `lb-01-county-standings.spec.ts:751` died at
  **`:813`**, a `page.getByTestId('claim-ledger').screenshot(...)` call that sits *after* every
  content assertion in that test had already passed. Run 2 on the same tree: **19/19 in 20.7s**.
  Isolated: **1 passed in 3.6s**.
- Adjacent battery, run 1: **1 failed / 22 passed in 1.7m** — `board-era-chapters.spec.ts:127`.
  Run 2 on the same tree: **23/23 in 55.1s**. Isolated: **3 passed in 20.5s**.

The discriminating fact is not that each test passes alone — a slice defect can be
order-dependent too. It is that **the failure MOVED between files while the tree did not move at
all**, and that both cold runs took ~2× the wall time of their own repeats. A slice defect is
deterministic; this is the fire shell's cold-start cost (vite boot + first compile) eating a
capture timeout. Attributed to the shell, **not** to the slice, and not re-pinned — F-1441-3.

⚠️ **The trap this drain nearly walked into:** the first red arrived on the slice's *own* spec file,
in a test the slice genuinely changed the render for. Reading it as the slice's fault would have
held a sound merge; reading it as "probably a flake" without a repeat would have been the same
guess with a happier ending. **The repeat is what separates them, and it costs 20 seconds.**

**F-2270-2 — NON-BLOCKING, recorded for the announcement rather than for a fix:** the runner's own
report closes *"Second-opinion review was unavailable because Codex CLI 0.133.0 is too old for
`gpt-5.6-sol`; no upgrade was performed."* That is the §2.0 client-floor condition observed from
inside a lane, and the runner did the right thing — it reported the wall instead of routing around
it. No wall was raised and none should be: `lane-runner-v3.sh` resolves a floor-meeting client
before consuming a master, so dispatch was never at risk. Recorded so the next fire reading that
line does not mistake it for a usage-limit wall.

## Where the player sees this, in a plain boot (Mistake #10)

Open the Claim Ledger → County Standings. A declared row's stack label now reads
`gpt-5.6-sol · codex 2026.08 · world model sim-import`; the Field Book cell carries
`World model: sim-import` or, honestly, `World model not declared`; expanding a row shows a
`World model` term in the detail list. No `?debug` required — asserted by
`field-book.spec.ts` at `:301–:303`, which runs under the plain-boot test
*"plain boot renders and expands the Minds and Rigs tables"*.
