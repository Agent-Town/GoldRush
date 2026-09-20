# GZ-01 STANDING BACKFILL SWEEP — s1585, 2026-08-09

**Duty:** the standing sweep added by F-1546-1 — *"any fire backfills any real-change merge whose review
exists and whose hash is absent from `gazette-queue.md`"*.
**Window:** `--first-parent main --since=2026-08-06` (3 days, back through the F-1546-1 backfill's own window).
**Verdict:** ✅ **ZERO BACKFILLS OWED.** 31 `src/`-touching first-parent commits · **24 already in the queue**
· **7 absent and every one of them correctly absent**, each dismissed on a different kind of evidence.

---

## ⚠️ METHOD CORRECTION MADE MID-SWEEP — THE FIRST PASS UNDER-REPORTED, AND THE REASON GENERALISES

The first pass enumerated files with `git show --pretty=format: --name-only <h>`. **That is blind to merge
commits** — git suppresses the combined diff for a merge unless asked, so a merge commit reports only
conflicted paths, often none at all. Measured cost on this sweep:

| commit | first pass said | truth (`--diff-merges=first-parent`) |
|---|---|---|
| `c41ba89de` | `review[NONE]`, 2 code files | `reviews/milk-twin-sockets.md` **+ `AtomicSocket.ts` + `DeepwaterSocket.ts` (340 new src lines) invisible** |
| `d66bdbe35` | not surfaced at all | `reviews/milk-motor-socket.md` + `src/agent/MechanicsManifest.ts` |
| `f315ecd2b` | not surfaced at all | `src/sim/E9ArsenalSocket.ts` |
| `716f3e298` | not surfaced at all | `src/sim/E9CanalSocket.ts` |

Four of the seven absent commits — **the entire genuinely-interesting cluster** — were either invisible or
mis-read as review-less on the first pass. A sweep that trusted it would have reported "nothing to see"
for the wrong reason and been right by accident.

➡️ **Any future sweep MUST pass `--diff-merges=first-parent`** (or `-m --first-parent`). This is the same
class as the standing memory note *"`git log --name-only` is blind to MERGE commits"*; it is recorded here
because the GZ-01 sweep is exactly the kind of hash-oriented walk that trips on it.

---

## THE SEVEN ABSENT COMMITS, AND WHY EACH STAYS OUT

### 1–4. The era-socket cluster — SUBSTRATE, and proved so by the code, not by a guess
`c41ba89de` (milk/twin-sockets — E5 `DeepwaterSocket` + E6 `AtomicSocket`) ·
`d66bdbe35` (milk/motor-socket — E4 ORBIT road agent-visible) ·
`f315ecd2b` (`src/sim/E9ArsenalSocket.ts`) · `716f3e298` (`src/sim/E9CanalSocket.ts`)

All four carry review files and land real new `src/` code, so they pass the mechanical half of the test.
They fail the **player-visible** half, and the proof is a refusal written into the product code itself —
the `SUPPORTED_CONTRACTS` allowlist in `src/sim/HeadlessContractSim.ts` (cited by symbol, not by line —
coordinates rot):

```
  // E5/E6 stay out DESPITE their era sockets now running headlessly (DeepwaterSocket,
  // AtomicSocket). Admission was attempted and MEASURED, and the measurement refused it:
  // see reviews/milk-twin-sockets.md and the two census docs for the four numbers.
```

The allowlist admits **twelve contracts — E1 (5), E2 (4), E3 (3) — and nothing above E3**, verified by
reading the whole set. The sockets exist; the epochs they socket are **not admitted**, deliberately and on
measured grounds. So **nothing became runnable** — not for a player, and
not for an agent-operator sending a rig either. A roundup claiming "four eras came online" would have been
the plausible, fluent, and **false** write-up; the allowlist is what refutes it.

### 5. `c8807b4d2` — ALREADY ANNOUNCED, under a sibling hash
Headline reads `bench: prime-agent heat 1 …`, but the commit carries `renderFrontDesk()` — +99 CSS / +34 TS
in `src/encyclopedia/reader.*` plus four `reviews/shots-fd1/` screenshots. That is the **Front Desk card**,
and it *is* in the queue: item *"The county put a door on the front of the house"*, citing `c22738d0c`.

The two commits are **35 seconds apart** (`13:50:07` and `13:50:42`) and split the same slice — a broad-add
commit swallowed the fd1 work, then the commit named for it landed the rest. **The hash-grep says ABSENT;
the content is fully announced.** Announcing it again would have double-reported one change to the owner.

### 6. `c6b09a178` — no game change (already flagged by s1584's digest)
`f1550-1`: `takeBuildRejectionDetail` moves to a zero-import leaf. Files by path, but nothing in the game
changed — it took `npm test` from **0 back to 2,740 tests across 389 files**. s1584's TK-01 digest already
records this as the day's path-counter over-report. Not news; a repair to the instrument.

### 7. `d9cf62422` — a LATENT guard, not a reachable fix
`f1471-1` keys `objectiveAllowsSecure` on `powerGrid?.connect` rather than on any `powerGrid`, so beating
the Baron can no longer silently fail to secure. **Reachability measured**, not assumed —
`assets/contracts/epoch-3-voltage/contracts.json`, all four contracts:

| contract | powerGrid | connect | baron |
|---|---|---|---|
| `e3-blackout-ridge` | yes | **ABSENT** | **no** |
| `e3-fairground` | yes | **ABSENT** | **no** |
| `e3-canyon-works` | yes | present | yes |

The fixed path runs only on baron defeat. The two contracts with `powerGrid`-without-`connect` **have no
baron**; the one with a baron **has `connect`**, where old and new code agree. **No live contract can reach
the old bug.** Correct hardening, correctly not announced.

---

## WHAT THIS SAYS ABOUT THE LAW (F-1585-1)

F-1546-1 calls the hash-grep *"the whole check — and it costs one command"*, and adds an explicit warning:
**DO NOT mechanise this as a red guard that reds on any absent hash**, because *"player-visible" is a
judgement* and such a guard *"gets excused into uselessness within a week"* (the `cross-engine` fate).

This sweep is the first measurement of how right that warning is. On a **healthy** window — 24 of 31 merges
correctly announced, pipeline working — the mechanical check produces **7 false positives, a 23% false-alarm
rate**, and **no two were dismissible by the same evidence**: one needed a product-code allowlist, one a
35-second commit-timestamp collision, one a prior digest's own caveat, one a contract-data join across three
columns. A red guard here would have demanded seven items on its first run, and a WARN list would still have
cost a fire this same half-hour of probing.

**The one-command framing understates the duty.** The grep finds candidates in one command; **clearing a
candidate is research**, and on this window it was research four different ways. That is not an argument
against the sweep — it caught nothing today precisely because the pipeline is healthy, which is the answer
a sweep is supposed to be able to return. It is an argument against ever letting the grep's output be
read as a work list.

**Recommendation (no mechanism proposed, deliberately):** keep the sweep manual and keep the warning. If a
later fire wants cheaper repeat runs, the cheapest honest win is not a guard but a **dismissal ledger** —
this file — so the same seven are not re-derived every fire. Sweeps after this one should start at
`2026-08-09` and treat everything above as settled.
