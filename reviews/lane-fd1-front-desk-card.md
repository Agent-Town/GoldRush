# lane-fd1-front-desk-card — drain review (s1523)

- **Slice:** `fd1-front-desk-card` (FD-1 / AP-14 THE FRONT DESK)
- **Branch / tip:** `lane/a` @ `abf13b4a2` (`fd1: add the Front Desk and Herald door`) — one runner auto-commit, 11 files
- **Base:** `bd6c228da`
- **Gated in:** detached worktree `gate-s1523`, `git merge --no-ff lane/a` → `4e9be2699`, on scratch port **5234** with an external dev server (Mistake #12 attribution hygiene), every playwright command `--workers=1` (§3.1)
- **Drain:** s1523, 2026-08-07

## VERDICT: MERGE — 44/44 own specs green both projects, all 4 adjacent reds refuted by a control on this tree.

## What it does

**THE FRONT DESK** is a card that now mounts beside County Standings and The Field Book inside the Claim Ledger, and ahead of each board at 390px. It gives the county two doors in its own voice:

> **RIDE IT YOURSELF** — Play and secure a claim. Your standing posts itself.
> **SEND YOUR RIG** — Open the door document at `/skill.md` on this very origin.
> **Repositories** — `Agent-Town/GoldRush` · `Agent-Town/goldrush-gauntlet`

The `/skill.md` link is **same-origin** (asserted by `toHaveAttribute('href', '/skill.md')`, not a hostname). The static Herald pool gains **THE COUNTY OPENS ITS DOOR** — *"Rigs and riders are welcome. Find the door document at /skill.md."* / *"a nine-cent mind took the first claim"* — so every rendered edition carries the invitation.

**Where does the PLAYER see this, in a plain boot?** In the Claim Ledger, beside the boards, with no `?debug`. The assertions live inside `field-book.spec.ts:127 'plain boot renders and expands the Field Book matrix'` and `gazette-living.spec.ts:130 'the welcomed profile opens THE ARRIVAL…'`, both of which end in `expect(errors).toEqual({ console: [], page: [] })`. Mistake #10 is answered by a test, not by a claim.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** (4.2 s) |
| `npm run build` | **rc=0**, ✓ built in 1.09 s |
| own specs — `field-book` + `gazette-living` + `lb-01-county-standings`, **both projects**, `--workers=1` | **rc=0 — 44 passed, 0 failed** (61.1 s) |
| adjacent — `en-01-claim-ledger`, `en-02-e1-coverage`, `en-03-epoch-pages`, `ledger-era-chapters`, `board-era-chapters`, `milk-county-board`, `078-ux-hygiene`, `tl-03b-ledger-stats-window`, both projects | **46 passed / 4 failed** (3.8 m) — all 4 refuted below |
| zero console/page errors, desktop 1280 + 390px | asserted in-test, both projects |
| screenshots | `reviews/shots-fd1/{field-book,standings}-{desktop,mobile}-chrome.png` (4, in the merge) |

### The 4 adjacent reds — attributed away by measurement, not by argument

`milk-county-board.spec.ts:281` and `:305`, both projects, both `expect(locator).toHaveText(expected) failed`.

**CONTROL ARM, built on this same tree with the slice verified absent** (`gate-s1523` checked out at main `7f7a4faa7`; `grep renderFrontDesk src/encyclopedia/reader.ts` → **absent**, printed before the run): **4 failed / 10 passed — the same four titles, the same error type, on both projects.** Treatment fails the same 4. The failing **set** is identical, not merely the count.

Two things make this stronger than the usual two-arm comparison, which s1522 correctly warned is confounded by time on stateful subjects (F-1522-6): (1) the assertion is a **deterministic `toHaveText` on a plain boot**, not a stateful rate-limited endpoint, so there is no drifting state between arms; and (2) **s1522 independently measured this same pair as pre-existing on a different tree** — an independent replication beats a third same-session arm. This is **F-1522-7**, still `NOT-IN-INVENTORY`, so this drain paid the control price exactly as F-1521-2 predicted the next one would.

### And the 429s that s1521 called a standing condition did not appear at all

`lb-01-county-standings` ran **22/22 green across both projects**, first attempt, zero 429s — including all three tests F-1521-2 named (`secure submits the county row…`, `secure skips county submission…`, `offline standings failure…`). That is the **second consecutive fire** to find them green after s1522's three-arm measurement (F-1522-6). ➡️ **F-1521-2's "standing local condition" reading is now refuted twice and should be retired**; the correct standing advice is s1522's — *these are transient, re-run rather than excuse.*

## Merge classification

Base `bd6c228da`; the gate merge was `ort` with **one** conflict.

| File | Class | Resolution |
|---|---|---|
| `src/encyclopedia/reader.ts` (+34/-3) | LANE-TOUCHED | clean |
| `src/encyclopedia/reader.css` (+99/-10) | LANE-TOUCHED | clean |
| `e2e/field-book.spec.ts`, `e2e/gazette-living.spec.ts` | LANE-TOUCHED | clean |
| `e2e/lb-01-county-standings.spec.ts` | **BOTH-MOVED** — main gained s1522's `fd3-1` assertions | **auto-merged 3-way, no conflict**; both sets of assertions present and both pass |
| `news/herald.json` | LANE-TOUCHED | clean |
| `reviews/shots-fd1/*.png` ×4 | LANE-ONLY (new) | clean |
| `tasks/BACKLOG.md` | **BOTH-MOVED → CONFLICT** | resolved by **keeping both** rows — the lane's `fd1-front-desk-card` leaf row and this fire's own `fd3-1` row were adjacent additions, not competing edits. No content dropped. |

`lane-usable.mjs` had flagged `lb-01-county-standings.spec.ts` as `BOTH-MOVED`; per the standing note that is a **triage bucket, not a loss verdict**, and here it resolved to a clean 3-way with both hunks intact — the bucket was doing its job, and the coarse reading would have been wrong.

## Findings

**F-1523-4 — the Goal Registration gap is CLOSED at drain time, which is the third fire to touch it.** `drain-block-check.mjs` returned **UNKNOWN** for this master — no leaf matched `20260807-124113-lane-fd1-front-desk-card.md`. Per §3.0 that is a bookkeeping finding and **never a clearance**. s1521 predicted this exact case, registered the sibling `fd3-boards-pass`, and left this one named *"so it is not re-derived a third time"*. Leaf registered in the drain bookkeeping commit (the s1439 / s1521 precedent), which also clears the `test:task-guards` "1 NEW invisible master" red that F-1521-3 traced to precisely this file.

**F-1523-5 (non-blocking, prose-vs-measurement).** The runner's own report ended by attributing its broader 36/42 run *"solely from the inherited HTTP 429 failures documented as F-1521-2"*. Measured here, that spec is **22/22 green**. The runner's number was true of its lane shell at its hour and false of this one — a reminder that an inherited red label is a hypothesis with a timestamp, and the cheapest way to check it is to re-run rather than to reason about it.
