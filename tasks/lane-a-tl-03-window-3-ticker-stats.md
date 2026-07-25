# lane-a: TL-03 WINDOW 3 — the Ticker/Gazette quotes the ONE endpoint (real numbers, never invented)

**FIRE-AUTHORED s1042 (attended review welcome).** Closes the last open window of an owner-ordered
spine whose other two windows are already live.

**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/m3`). **Commit prefix:** `tl:`

## Why (evidence, quoted and dated — not a hunch)
`specs/accounts/README.md:29` marks the slice **fire-authorable** and states the owner order verbatim
(2026-07-09): *"connect it somewhere in the ledger so we can directly see it working as a statistics page
that shows a bit of information about the runs on the website. see it being alive immediately"*.
Window 3 is spec'd at `specs/accounts/README.md:32`: *"**The Ticker/Gazette**: quote the SAME endpoint for
real numbers — never invented, never token talk (marketing spec laws unchanged)."* Its LAW, one line
below: *"all three windows render the one endpoint; **no surface computes its own truth**."*

**Preconditions verified by file-probe at authoring time (s1042), not inherited:**
- TL-02 (`GET /api/stats`) shipped; **Window 1** live at `site/assay-office.js:1`; **Window 2** live at
  `src/encyclopedia/liveStats.ts:4` — both already read the endpoint.
- **F-tl01-1 is FIXED** (`functions/api/telemetry.ts:74` and `functions/api/stats.ts:60` both read
  `context.env.TELEMETRY ?? context.env.ACCOUNTS`, landed `41d8e1ae` + `47c5fb20`), so the endpoint serves
  REAL tallies, not the empty state. BACKLOG's lane-a header called this blocker "unchanged" for five days;
  that ghost line was corrected in the same commit as this master.
- The consuming surface exists and its format is settled: `marketing/outbox/ticker-digest-<date>.md`
  (TK-01 duty) and `marketing/outbox/gazette-queue.md` (GZ-01 duty), both written by FIRES. Read
  `marketing/outbox/ticker-digest-2026-07-24.md` for the voice before you write a line of code.

**Why a drafting helper is the faithful implementation (read this so you don't widen the slice):** the
Ticker/Gazette are not code surfaces — they are markdown drafts a fire authors, and **publication stays
owner-only, always** (`specs/marketing/README.md:23` Stage 2.7: *"owner approves the day in ONE morning
action"*; `specs/gazette-house/README.md:13`: *"Owner approval stays the publication gate."*). So Window 3
= the drafter can QUOTE real aggregates instead of inventing them. You are building the quoting tool and
its honesty guards. **You are NOT touching the approval flow, and NOT posting anything anywhere.**

## READ FIRST
`AGENTS.md` · `specs/accounts/README.md` §TL-01..TL-03 (the three-window law) · `specs/marketing/README.md`
STAGE 2.7 **THE TICKER — its HARD LAWS paragraph verbatim** · `scripts/test-stats.mjs` (**the house harness
pattern you will mirror** — node script, fixture-driven, no network) · `functions/api/stats.ts` (the payload
shape you consume: runs today/7d/all-time, deepest wave, median-duration BUCKET, busiest contract,
tier/device split, frame-p95, histograms) · `marketing/outbox/ticker-digest-2026-07-24.md` (voice).

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is
already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE →
`git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's
content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted
edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching
anything.

**Pre-proved for you (s1042, freshly measured — not inherited):** `git log main..lane/m3` shows **exactly
two** commits, `d1743150` (WIP-SALVAGE) and `cec50777`, and **both are content-merged**:
`git diff lane/m3 main -- e2e/perf-05-startup.spec.ts` is **EMPTY** (byte-identical), and main's
`artifacts/perf-05/*` were last written by **s1039's drain `63161278`** — the gate RE-RUN, i.e. strictly
newer than the lane's pre-gate raws. **Nothing can be lost by the reset; proceed.**
*(Honest limit: the lane worktree's uncommitted-dirt state is NOT independently probed — `git -C` on a
worktree is permission-gated for fires. `git clean -fd` covers residue; treat anything else you find there
as a finding worth reporting, not as expected.)*

## Scope (numbered, each item testable)
1. **`scripts/ticker-stats.mjs` — the drafter's quoting tool.** Fetches the aggregate endpoint and prints
   ready-to-paste ledger-voice lines, each **≤140 chars** (the Ticker's own cap), every number traceable to
   a field in the payload. Flags: `--json` (raw payload passthrough for a drafter who wants to pick), and
   `--url <endpoint>` for the harness. **Honour the "no surface computes its own truth" law:** the tool
   RENDERS payload fields and derives nothing — no ratios, no trends, no "up from yesterday" (the payload
   carries no history to support it). If a line you want needs arithmetic the payload cannot justify, **do
   not compute it — report it as a finding** (reject-don't-stretch, CLAUDE.md Mistake #14).
2. **The endpoint comes from ONE place.** Do not re-type the URL: read/export the constant already used by
   the other windows (`src/encyclopedia/liveStats.ts:4`). If a shared export requires touching a shipped
   surface beyond a pure re-export, **STOP and report it as a finding instead** — and note in your report
   that Window 1 (`site/assay-office.js:1`) and Window 2 hard-code the same string separately, which is a
   real (pre-existing, out-of-scope) duplication the three-window law arguably owes a fix. **Report it, do
   not fix it.**
3. **Graceful and never blocking.** Endpoint unreachable, non-200, malformed JSON, or the graceful empty
   state → print the honest quiet-wire line (reuse the in-universe wording already established for the
   offline case; the game's own fallback is *"the wire is quiet"*) and **exit 0**. A fire compiling a digest
   must NEVER be blocked, and must never be handed a number the endpoint did not send.
4. **The hard laws, enforced in code AND asserted in the test.** Emitted text must contain **no** token /
   price / trading / value-expectation words and **no** hype adjectives (`specs/marketing/README.md:23`:
   *"the Ticker NEVER mentions the token, price, trading, or value expectations … no hype adjectives (the
   merge hash IS the excitement)"*). Implement as an explicit deny-list check over the produced output that
   throws if it ever trips — a guard that can fail, not a comment promising good behaviour.
5. **`scripts/test-ticker-stats.mjs`, mirroring `scripts/test-stats.mjs`.** Fixture payloads, **zero
   network**: (a) populated → expected lines, every number present in the fixture, all ≤140 chars; (b)
   graceful-empty payload → the quiet-wire line, exit 0; (c) unreachable/500/garbage-JSON → quiet-wire
   line, exit 0, no throw; (d) **a poisoned fixture whose contract copy contains a banned word → the guard
   THROWS** (this is the mutation control that proves scope 4 is not vacuous — an assertion that cannot
   fail is worse than no assertion, F-1026-1 class).
6. **One line into the digest format** so the duty actually changes behaviour: state in
   `marketing/outbox/ticker-digest-2026-07-24.md`'s successor format — i.e. document it where the drafting
   fire will read it (a short "STATS LINE" note in the outbox format or the script's `--help`) — that stats
   quoted in a digest come from `scripts/ticker-stats.mjs` + the endpoint, with the fetch timestamp cited.
   **Do not back-edit past digests** (they are published history).

## Firewall
**TOUCH ONLY:** `scripts/ticker-stats.mjs` (new) · `scripts/test-ticker-stats.mjs` (new) · a pure
re-export of the existing endpoint constant if and only if scope 2 allows it without editing shipped
behaviour · the one format note of scope 6 · `package.json` scripts entry **only if** the repo's existing
convention has one for `test-stats.mjs` (check first; if not, don't add one).
**NO:** game `src/` behaviour changes · `functions/` (the endpoint is shipped and correct) · `site/` ·
the approval/publication flow · any posting/automation/cron · any network call in a test · any edit to
already-published digests or `news/herald.json` · Balance/sim/e2e game specs.

## No-op guard
If you are about to exit without changes, **write WHY into your report first.** "The endpoint was
unreachable" is NOT a reason to stop — scope 5 is fixture-driven precisely so this task never depends on
the network. A finding under scope 2 (shared-constant refactor would exceed the firewall) is a legitimate
partial: ship scopes 1, 3, 4, 5, 6 with the URL passed via `--url` plus a documented default, and report
the constant question.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green (both projects unaffected — this is additive tooling).
`node scripts/test-ticker-stats.mjs` → **all cases pass, and case (d) demonstrably FAILS when the guard is
removed** (state that you checked this by temporarily removing it — that is the control, and put the
control's output in the report). Run `node scripts/ticker-stats.mjs` once against the real endpoint and
paste the actual emitted lines into your report (if the wire is quiet, paste that instead — either is
valid evidence). Adjacent game suites are untouched by construction; run `e2e/m1-01` boot **zero-console**
as the cheap proof nothing leaked into the client bundle. No screenshots owed (no rendering surface).

**End: READY-FOR-GATES** + the emitted lines verbatim + the scope-4 control result + the scope-2 finding
(shared constant: done as a pure re-export, or reported with the reason) + anything the payload could not
honestly express.
