# THE COUNTY BOARD, COMPLETE — posse standings + watch-this-run

**Slice:** milk shift 2026-08-06 (`TASK.md` in this worktree) · **Branch:** `milk/county-board` · **Base:** `f38638438` · **Tip:** see `git log -1` at read time
~~**Verdict:** BUILT AND PUSHED, **NOT MERGED**. Every scope item is implemented, gated and mutation-proved on the branch. Nothing has landed on main; a drain is owed.~~

> ## ✅ DRAINED s1498 — MERGED `d7986be8` (6 of 8 off the milk pile). The drain that was owed is paid.
>
> Gated on the merged tree in detached `gate-s1498` (§3.0b), `--workers=1`, both projects: **tsc rc=0 ·
> build green 1.23s · own spec `e2e/milk-county-board.spec.ts` 14/14 · adjacent `tape-01` / `tape-02` /
> `f1297-2-plain-boot-tape-button` / `run3d-lantern-post` / `profile-first-boot` 32/32 ·
> `test:node-guards` 341 tests / 338 pass / 0 fail / 3 skipped.**
>
> **Merge surface re-measured at drain time per F-1497-1, and it was cheap:** 19 files on the branch,
> only **two** overlapping main (`tasks/BACKLOG.md`, `tasks/goals.json`), both append-surfaces resolved
> as unions — the county row newest-first in BACKLOG, the leaf appended after the er-01 census leaves.
>
> ⚠️ **THE FIRST MERGE ATTEMPT WAS ABORTED AND REDONE, AND THE REASON IS THE REUSABLE HALF.** The gate
> worktree was still detached at the `twin-sockets` **merge** commit — one behind main's `twin-sockets`
> **bookkeeping** commit — so the `goals.json` union silently dropped the `milk-twin-sockets` leaf. It
> was caught only because the resolution script asserted the merged JSON still contained **named
> leaves**, not merely that it **parsed**: a parse-only check goes green on a lossy union, because
> valid JSON is exactly what a dropped object leaves behind. Re-detached to main HEAD, redone, all four
> leaves re-verified PRESENT. Same class as *refresh the lane AFTER the evidence commit, not before*.
>
> 🔒 **Security posture READ, not assumed** — `functions/api/standings.ts` is a new public endpoint:
> allowlist key validation (`hasOnlyKeys`) on every nested shape, CORS origin allowlist, per-IP **and**
> per-anon rate limiting, 64KB tape cap, 100-row board cap, regex-validated hashes and ids, KV keys
> built only from `knownContract`-validated ids, no secrets client-side. **AP-06 species-blindness is
> structural rather than conventional**: `boardRow` hands the ladder rider NAMES only, and a declared
> stack is visible exclusively in the field book.
>
> 📰 **GZ-01 filed** in `marketing/outbox/gazette-queue.md` — this is a player-visible merge, so it owed
> a news item and has one. **DEPLOY runs this fire** for the same reason.

---

## What it does

The owner asked (2026-08-05, verbatim): *"should we make a leaderboard for that as well? It could then go into more detail - agent + human, human + human, agent + agent (which models and harnesses?)"* The ruled shape was: **posse boards rank WITHIN party size, ranking stays species-blind; composition detail lives in the FIELD BOOK — information, never ranking.**

That ruling is implemented as a **mechanical split, not an editorial one**, because an editorial one decays:

| Law | The mechanism that makes it unforgettable |
|---|---|
| The board is species-blind | `boardRow()` in `functions/api/standings.ts` projects `party.riders.map(rider => rider.name)`. A declared stack is not in scope at that call site. It cannot leak by omission. |
| The field book never ranks | The `byParty` branch mints no `rank` field anywhere and sorts by recency, exactly as `byStack` already did. |
| A posse never moves a solo rank | Party size **partitions the rows before ranks are minted** (`rows.filter(...).map(boardRow)`), rather than filtering a global ranking the way the difficulty chip does. |
| The board never carries the reel | The row carries a **handle** `{id, simVersion}`; the 64KB blob is a separate `?reel=<id>` fetch. |

Plus AP-09's parked **TAPE-03**: a standings row carrying a tape gains WATCH THIS RUN, which hands the reel to the **shipped** Lantern Show — same viewer, same version law, same refusal line as the tape shelf. `specs/agent-play/tape-02-lantern-semantics.md` law 6 says this half "rides the same viewer"; it does.

**Where the PLAYER sees it in a plain boot** (Mistake #10): title screen → **Claim Ledger** → **County Standings** → the party chips are the second chip row → a row with a reel shows **Watch this run** → the Lantern Show. Asserted with no `?debug`, both viewports, in `e2e/milk-county-board.spec.ts`.

---

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, clean |
| `npm run build` | green, **1.04 s** |
| Own spec `e2e/milk-county-board.spec.ts` | **14/14**, desktop-chrome + mobile-chrome (390×844) |
| `lb-01-county-standings` + `field-book` + `tape-02-lantern-show` + `tape-01-run-tape` | **30/30 both projects, files UNMODIFIED** |
| `npm run test:node-guards` | **exit 0**, 302 `✔` assertions, 0 failures |
| `node --test scripts/goal-tracker.test.mjs` | 2/2 pass (leaf schema + sampled receipts) |
| `playwright test --list` | **2680 in 381 files → 2690 in 382** — pure add (+5 tests × 2 projects, +1 file), measured **both ways** by moving the spec out and back (sha256 identical after) |
| Console / page errors | zero on the offline arm; on the aborted-request arm zero page errors and every console line is Chromium's own `net::ERR_FAILED` transport log — see the honesty note below |
| Screenshots | `reviews/shots-milk-county-board/` — posse board, field-book composition view, and the Lantern Show reached from a row, each desktop + 390px |

Browser gates ran against a scratch dev server on **port 5266** (`GR_CAPTURE_EXTERNAL_SERVER=1` + `GR_CAPTURE_BASE_URL`), because 5188 is `strictPort` and three sibling milk shifts are live; `lsof` was checked before gating and the external-server guard classified the server as `dev`.

`GR_RELEASE=e1 npm run build:release` was **not** run: F-RB-1's single-line law governs `vite.config.ts`'s `'e2-…'` pilot table, and this slice touches no release-transformed surface (`git diff --stat` names no `vite.config.ts`).

---

## The guards were proved able to fail

A test written against already-correct behaviour is green the moment it is written, including when it is written wrong. Four mutations, each reddening **exactly one** test and each restored byte-exact by sha256:

| Mutation | Subject | Result |
|---|---|---|
| Delete the party partition (`rows.map(boardRow)`) | `standings.ts` | 1 failed / 4 passed — *"a posse ranks only within its own size"* |
| Delete the `simVersion` check in `readStandingsReel` | `LanternShow.ts` | 1 failed / 4 passed — the browser refusal, `waiting for getByTestId('tape-version-refusal')` |
| Force `const agents = 0` in `partyComposition` | `standings.ts` | 1 failed / 4 passed — *"the field book reads composition…"* |
| Leak `rider.stack?.model ?? rider.name` into the board's rider list | `standings.ts` | 1 failed / 4 passed — the species-blindness assertion |

Restore proof: `functions/api/standings.ts` sha256 `80d4cec3…07d73e` and `src/ui/LanternShow.ts` sha256 `7544953e…b98583d`, identical before the first mutation and after the last restore.

### One defect was found by LOOKING at the screenshot, not by an assertion

The first render of the party chips read **"Posse of 2 · Posse of 3 · Posse of 4 · Solo"**. `Object.keys(PARTY_LABELS)` puts integer-like keys first, so the **default** board sat at the end of its own row — and every presence-only assertion (`toBeVisible`, `getByTestId`) stayed green through it. Cured with an explicit `PARTY_ORDER`, and the spec now asserts the chips **by order**: `toHaveText(['Solo', 'Posse of 2', 'Posse of 3', 'Posse of 4'])`. This is the reason the shot is in the evidence table rather than only in the folder.

---

## Findings

### F-MCB-1 — the board field is named `reel`, not `tape`, and that is a decision, not an accident (non-blocking, DECLARED)

`e2e/lb-01-county-standings.spec.ts:250-265` loops a shipped stack-blindness assertion that includes `expect(row).not.toHaveProperty('tape')`. TAPE-03 requires the board to advertise a reel. Rather than edit an adjacent spec (outside this shift's TOUCH-ONLY), the row publishes `reel: {id, simVersion}`.

This is **not** a rename to dodge a guard, and the difference is checkable: that assertion's purpose is that no private or bulk field rides the public board, and it remains literally true — the 64KB tape blob, `inputLog`, `eventLogHash`, `anonId`, `seed*` and `stack` are all still absent, now asserted again in this slice's own spec (`expect(JSON.stringify(rows)).not.toContain('inputLog')`). What ships is a public handle to a reel whose owner opted into publishing it, which is exactly what AP-09 TAPE-03 ratified.

**Recommendation for the drain:** add `reel.id`-shaped coverage to lb-01's blindness loop (or a note beside it) so a future reader does not conclude the loop still covers the whole tape surface. **GATE: a follow-up touching lb-01, out of this shift's scope.**

### F-MCB-2 — two edits sit outside the literal TOUCH-ONLY list (non-blocking, DECLARED)

TOUCH-ONLY named "tape-shelf/viewer wiring for row-watch" as a surface rather than a file list. Two files outside the other named paths were touched, both as that wiring:

1. **`src/game/RunTape.ts`** — one word, `export`, on the existing `validateRunTape`. A reel arriving over the network gets the **same** validator the local tape ring already trusts, instead of a second, weaker one written for this slice. No behaviour change; `validateRunTape` deliberately accepts any `simVersion >= 1` so the version law stays a separate, single decision in `LanternShow.ts`.
2. **`src/main.ts`** — one line, `onWatchTape: watchRunTape`, on the out-of-game `openClaimLedger` call. `Game.ts` is deliberately **not** touched, so the in-run ledger is never handed the viewer and a reel cannot tear down a live run from behind the modal.

**GATE: none — reversible, and named here so the drain can rule on them explicitly.**

### F-MCB-3 — a rider NAME is coerced, not rejected (non-blocking, informational)

`validateParty` runs each rider name through the house `cleanName`, so `{name: 7}` stores as `Anonymous Prospector` rather than 400-ing the standing. This follows `profileName`'s existing behaviour rather than Mistake #14's reject-don't-stretch, deliberately: the *structure* is strict (`riders.length` must equal `riderCount`, bounded 2..4, unknown keys rejected) because a half-named posse makes its own composition unreadable, but a garbled name should not cost a whole run its place. Both halves are asserted. **GATE: none — recorded so the asymmetry is a choice on the record, not a gap.**

### F-MCB-4 — the fixture reel reports "replay differed", correctly (non-blocking, informational)

`reviews/shots-milk-county-board/watch-this-run-*.png` shows the Lantern Show's status reading **"Reel ended · replay differed"**. That is the viewer being honest: the e2e fixture tape carries a fabricated `eventLogHash` (`fnv1a32:1234abcd`), so the re-simulation legitimately does not match it. TAPE-01/TAPE-02 already prove hash identity for *real* tapes (`e2e/tape-01-run-tape.spec.ts` "every ended run writes a keepable tape whose replay reproduces its event hash", green here). Recorded so nobody reads the screenshot as a determinism regression. **GATE: none.**

### F-MCB-5 — this shift's gate run rewrote two adjacent slices' tracked screenshots (non-blocking, handled)

Running the adjacent battery re-captured `reviews/shots-field-book/*`, `artifacts/county-standings/*` and `reviews/shots-tape-02/*`. These were triaged rather than committed wholesale:

- **Kept** (`shots-field-book`, `artifacts/county-standings`): genuinely changed *by this slice* — the new "By rig / By posse" chips and the party chip row are visible in them. Verified by opening the image, not by the byte count. A stale shot there would claim a surface that no longer exists.
- **Discarded** (`shots-tape-02`, `git checkout --`): this slice changes neither the shelf nor the show; the byte deltas are run-to-run render churn. The tracked evidence stays as its own slice recorded it.

Both files are tracked, so the Retention Law is satisfied either way (git keeps every version); the point is that a refreshed screenshot should mean something changed. **GATE: none.**

---

## Merge classification

All changes are **LANE-TOUCHED** on a branch forked from `f38638438`; no main-side movement has been assessed because nothing has been merged. A drain must re-derive that itself.

| Path | Change |
|---|---|
| `functions/api/standings.ts` | Additive: `party` on POST + stored row, `?party=` filter with pre-rank partition, `?view=byParty`, `?reel=<id>`, `reel` handle on board rows. `groupRows`/`showing` factored so `byStack` and `byParty` share one grouping (byStack behaviour unchanged — its 30/30 adjacent green is the control). |
| `src/encyclopedia/reader.ts` | Party chips + posse rider line + WATCH THIS RUN + refusal message; field-book view toggle + composition matrix; `onWatchTape` option. |
| `src/encyclopedia/reader.css` | Chip row (wrapping at 390px), watch button, rider line, refusal message, refused-row tint. |
| `src/ui/LanternShow.ts` | `readStandingsReel` + `LANTERN_REEL_UNAVAILABLE`. Viewer internals untouched. |
| `src/game/RunTape.ts` | One word: `export` on `validateRunTape` (F-MCB-2). |
| `src/main.ts` | One line: hands the shipped viewer to the out-of-game ledger (F-MCB-2). |
| `e2e/milk-county-board.spec.ts` | New, +5 tests × 2 projects. |
| `tasks/goals.json`, `tasks/BACKLOG.md` | Leaf `mcb-posse-board-and-row-watch` (`building`) + its ledger row, registered in the same commit as the work. |

## What is NOT in this slice, deliberately

- **No client submits a `party` yet.** `Game.ts` is outside TOUCH-ONLY and "relay/mp code" is an explicit NO, so scope item 1 ships as the additive server contract a co-op/agent submitter will post to. The board and field book are proved against it end to end; the submitter is a separate slice.
- **No ranking-law change.** `compareScores` is byte-unchanged. Party size partitions the field; it does not re-weight anything inside a partition.
- **No required-field tightening.** `party` is optional everywhere, on read and on write.
