# node guards — the whole class enumerated, run, and WIRED

**Slice:** F-1060-1 corrective — `package.json` wiring for seven never-wired node guards
**Branch/tip:** main, direct §2D correction (no lane, no task master)
**Fire:** s1060, 2026-07-26
**Verdict:** ✅ **SEVEN unwired guards, all seven GREEN, now reachable by two npm commands — proven fail-closed by mutation control.**

---

## What it does

s1059 closed the unrun-guard family for the **deploy pair** (`test-deploy-contract.sh`,
`test-deploy-site-contract.sh`) by wiring both into `package.json`. This fire asked the
next question in that arc: **is the deploy pair the whole class?**

It is not. A caller audit over every guard-shaped script in `scripts/` — separating
*references* (STATUS archives, review prose, BACKLOG entries, artifact reports) from
**executable callers** (`package.json`, `.sh`, `.mjs`, CI, Makefile) — found **seven**
node guards with **zero executable caller**:

| guard | executable callers before this fire | result when run |
|---|---|---|
| `scripts/e3-mask-tables.test.mjs` | none (2 task masters *instruct Codex to extend it*, not to run it) | **30/30** |
| `scripts/goal-tracker.test.mjs` | none | **2/2** |
| `scripts/stream-curate.test.mjs` | none (1 historical artifact report) | **2/2** |
| `scripts/stream-director.test.mjs` | none (1 historical artifact report) | **6/6** |
| `scripts/stream-showcase-queue.test.mjs` | none (1 historical artifact report) | **3/3** |
| `scripts/test-ticker-stats.mjs` | none | **8 checks pass** |
| `scripts/test-stats.mjs` | none (`docs/api-stats.md:93` is a *doc line*, not a caller) | **87 checks pass** |

---

## ⚠️ The honest correction that shapes this whole review

**I nearly shipped s1056's work as new, and caught it only by reading the live ledger.**

`tasks/BACKLOG.md:926` already records, from s1056:

> *"the four never-wired node guards were run and are **green** — `e3-mask-tables` 30/30,
> `stream-director` 6/6, `stream-showcase-queue` 3/3, `stream-curate` 2/2 (plus
> `goal-tracker` 2/2)."*

So **five of my seven had already been run four fires ago**, with matching counts. My
enumeration was a **re-discovery**, not a discovery, and this review would have been a
Mistake #13 (Premature Celebration) if I had reported those five greens as findings.
They are re-confirmations. Stated plainly so the next fire inherits the true baseline.

**Two things survive that correction, and they are the actual deliverable:**

1. **s1056's list was incomplete — it named four (+goal-tracker) of seven.**
   `test-ticker-stats.mjs` and `test-stats.mjs` were not in it. **`test-stats.mjs`
   (87 checks, 11.5 s cold) had never been run by any fire in the record.** It is green.
2. **s1056 RAN them; nobody WIRED them.** Running a guard inside one fire produces a
   green that **expires when that fire exits**. The proof is this fire: s1056 and s1060
   independently spent budget hand-enumerating and hand-running *the same file set*,
   four fires apart, because there was no command to name. That is the measurable cost
   of the unwired state, and it has now been paid **twice**.

**This is the same family, one layer out.** F-1044-1 / F-1047-1 / F-1049-1 / F-1052-1 /
F-1059-1 are all *"a guard nothing invokes rots silently."* The refinement this fire
adds: **a guard that a fire invokes by hand is still unwired** — the fire is not a
caller, it is a volunteer.

---

## What landed

`package.json`, `scripts` block only, **+2 lines**:

```json
"test:node-guards": "node --test scripts/e3-mask-tables.test.mjs scripts/goal-tracker.test.mjs scripts/stream-curate.test.mjs scripts/stream-director.test.mjs scripts/stream-showcase-queue.test.mjs && node scripts/test-ticker-stats.mjs",
"test:stats": "node scripts/test-stats.mjs",
```

`test-stats.mjs` is **deliberately kept out of the hermetic aggregate**: it spawns its own
`wrangler` worker and binds a port (11.5 s cold, 3.4 s warm), while the other six are
pure-fixture and finish in 6.7 s together. Mixing them would make the fast command slow
and the hermetic command network-shaped.

---

## Evidence

| check | command | result |
|---|---|---|
| Aggregate green | `npm run test:node-guards` | **rc=0, 43 pass / 0 fail, 6.7 s** — and the ticker line printed, proving the `&&` second half ran |
| Stats guard green | `npm run test:stats` | **rc=0, "stats worker checks passed (87)", 3.4 s** |
| **MUT-1** failure buried mid-list | `node --test <5 real files> /tmp/gr_mut.test.mjs` | **rc=1, pass=43 fail=1** — goes red, and the 43 real tests still pass (not blanket-failing) |
| **MUT-2** second-half failure | `node --test <5> && node -e "process.exit(3)"` | **rc=3** — `&&` propagates; a ticker-stats failure cannot be swallowed |
| **MUT-3** control | `node --test <5 real files>` | **rc=0, pass=43 fail=0** |
| `package.json` valid | `JSON.parse` + print both entries | **parses, both entries resolve** |
| Types | `npx tsc --noEmit` | **rc=0, 3.6 s** |

`npm run build` **deliberately not run** — the only changed file is `package.json` and the
change is two script *aliases*: no dependency, no build field, no `tsc`/`vite` input moved.
It would prove nothing. (s1059 precedent, and named rather than padded into the table.)

---

## Findings

- **F-1060-1 (FIXED THIS FIRE).** Seven node guards had no executable caller. Now two
  npm commands cover all seven, mutation-proven fail-closed.

- **F-1060-2 (NON-FINDING, recorded so it is not "discovered" a fourth time).**
  `goal-tracker.test.mjs` is carried as **RED on main, "standing", "attended-owned"** in
  **eight review files** (`F-1` in `e3-fairground-mask-table.md`, `F-2` in
  `freed-walkers.md`, `F-e7-1`, `F-e8-1` ×2, `F-tp00-1`, `F-tp03-2`, and
  `e10-ember-shore.md`) — the hardcoded top-level category list at `:17`.
  **It is GREEN and has been since 2026-07-18.** Fixed by `6d7b107f`
  *("goal-tracker expects the owner-ordered eleven goals — expectation predated the
  2026-07-16 expansion")*, then maintained three more times: `5b5f40ec` (07-19, 10→12
  subgoals), `b638d687` (07-22, 12→13), `6d6fc7f4` (07-22, E1 tree).
  **This is NOT a ghost line and I am not reporting it as one.** Every one of those
  reviews was written 07-16/07-17, *before* the fix — they were **correct when written**,
  and reviews are archival documents, not a live ledger. The live ledgers
  (`BACKLOG.md`, `goals.json`, `HANDOVER`) carry **no open F-1**. Recorded only because
  a future fire grepping "goal-tracker" will hit eight confident RED claims and could
  spend a fire re-fixing something that was fixed eight days ago.

- **F-1060-3 (non-blocking, INHERITED LIMIT, not newly introduced).** npm wiring is
  **discoverability, not enforcement** — exactly the limit s1059 stated as F-1059-2, and
  it applies unchanged here. This repo has no CI and `npm test` is playwright, so these
  seven still run only when a fire or attended session chooses to invoke them. **Wiring
  them into a gate battery, or into `npm test`, is a scope call for attended, not a
  fire's** — it would change what every drain in the factory must pass. Flagged for the
  owner's desk rather than taken.

---

## Merge classification

Direct §2D correction on main. Files touched: `package.json` (+2 lines, `scripts` block
only), `reviews/node-guards-wired.md` (new), `tasks/BACKLOG.md` (ledger), `STATUS.md`
(lock/handoff). **Zero `src/`, zero assets, zero TypeScript, zero test-file edits** — the
seven guards themselves are **byte-unchanged**; this fire wired them, it did not touch
them. `logs/dashboard.html` churn left to its owner.

**Duties:** no gazette item (zero player-visible bytes — a guard) · no deploy (zero
gameplay bytes) · no `goals.json` leaf (s1057/s1059 precedent for a direct §2D
correction: the Goal Registration Law binds authored masters and drains; this is
neither) · no ART-slot audit owed (§2E: neither refilled, drained, nor processed raws).
