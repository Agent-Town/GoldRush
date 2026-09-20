# Task f1584-1: the banked-master probe hears ONE spelling of a refusal the masters write THREE ways — widen the queueability banner and prove the widening captures nothing else (LANE-C, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1584, from **F-1584-1**, which I found and measured this fire while triaging a board three consecutive fires had declared PIPELINE-DRY. I did not infer this from prose: I ran `scripts/master-shipped-classifier.mjs` against the live corpus, read the `banner` assignment inside `classifyRoot`, then read all three flagged masters' first six lines verbatim and tested the regex against each. **The blast radius of the proposed cure was measured BEFORE the cure was written into this task** — see item 3, which asks you to re-derive that number rather than trust mine.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` row **F-1584-1** — the whole row, it is the specification; `scripts/master-shipped-classifier.mjs` — **the entire file, but especially the `banner` assignment inside `classifyRoot` and the `CANDIDATES` line inside the returned `counts` object; those two lines are the whole defect and the whole blast radius**; `scripts/master-shipped-classifier.test.mjs` — its existing fixture style, which you extend rather than replace; `tasks/BACKLOG.md` row **F-1569-1** — the finding that built this file to answer shipped-ness by evidence rather than by filename, and which is the same class as this one, one rung down; `CLAUDE.md` §6 (quality bars) and §4.5 (firewalls are contracts).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** ✓ **MEASURED AT DISPATCH (s1584, `node scripts/lane-usable.mjs --all`): `lane-c lane/c ahead=0 behind=15 paths=0 tracked-dirt=0 untracked=0 → USABLE`.** The lane holds nothing main has not absorbed, so a reset to main is provably lossless — **but USABLE is not CURRENT, and this task depends on `924e59711` (the f1569-1 merge that created this file), which I verified with `git merge-base --is-ancestor 924e59711 lane/c` → present.** Therefore: confirm `git -C worktrees/lane-c log main..lane/c --oneline` is **empty**; if it is, `git checkout -B lane/c main && git clean -fd` and PROCEED. **STOP-and-report if that log is NON-empty** (undrained work — resetting would DESTROY it, the w1-03/polish-02 casualty), or if the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP**; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-c status --short` → clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP; list and proceed: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH after the reset, before any edit).** Each key is a single line, verified by me to print `1` **on main** at dispatch (s1584), per F-1425-2 — a key that spans a line break matches nowhere, including in the file it was copied from:

```sh
grep -c 'F-1584-1' tasks/BACKLOG.md
grep -c 'Advisory evidence probe for task-master shipped-ness' scripts/master-shipped-classifier.mjs
```

Both must print `1`. **If either prints `0`, STOP and report "lane drifted or predecessor absent" — do NOT improvise.** The first proves the s1584 authoring commit (this task's own finding row) is present; the second proves you are looking at the probe revision this task describes.

## Why (F-1584-1, measured s1584 against the live corpus)

`master-shipped-classifier` is the instrument that answers the one dry-board question the goal tree **structurally cannot**. `scripts/fire.md` §3.0 records that **538 of 941 masters carry no goal leaf**, so a goal-tree census is blind to unregistered banked work by construction. s1581, s1582 and s1583 each declared PIPELINE-DRY from a goal-tree walk; none ran this probe.

Run this fire, first time on a dry board:

```
TOTAL 979 · SHIPPED 566 · RAN-UNMERGED 350 · NO-TRACE 63, of which 60 self-declare DO NOT QUEUE → 3 candidates · DISAGREES 96
```

**Those 3 candidates are the headline a fire acts on** — never-run masters that do *not* refuse to be queued.

✗ **All three refuse, in their FIRST line, and the probe cannot hear them.** The test is `/DO NOT QUEUE|DO-NOT-QUEUE/i` over the first six lines. The three masters declare:

| master | its own words | regex |
|---|---|---|
| `058b-adjacent-reds-fingerprint.md` | "OPEN BY DELIBERATE CHOICE — ATTENDED/OWNER, **NOT FIRE-QUEUEABLE**" | NO MATCH |
| `archive-CODEX-WALL-dead-flag-s915.md` | "NOT A WORK MASTER — **NEVER QUEUE**" | NO MATCH |
| `art-era-motion-hero-e2.md` | "OPEN BUT **NOT QUEUEABLE** — ITS INPUT DOES NOT EXIST AND ITS PIPELINE IS CREDIT-GATED" | NO MATCH |

✅ **The true candidate count is ZERO** — the mechanical confirmation of PIPELINE-DRY that three fires asserted from a census that could not see this axis.

🔑 **THE INSTRUCTIVE HALF.** This is the **same class as F-1568-1/F-1569-1, which built this very file**: those cured *shipped-ness answered by a filename* by replacing it with an evidence probe — and the same commit left *queueability answered by one spelling*. **A tool can be rigorous on the axis it is named for and naive on the axis it merely also reports.** The `verdict` axis got a three-transform evidence probe with a disagreement counter; the `banner` axis got a two-alternative literal nobody measured against the corpus.

⚖️ **DIRECTION, STATED HONESTLY: this defect fails SAFE.** It over-reports work, so a fire reads three masters and finds three noes — it costs three file reads, never a wrong queueing. **This slice is therefore about the HEADLINE being trustworthy, not about a near-miss.** Do not oversell it in your review, and do not let anyone (including me) describe it as a averted incident. What it is: the number the dry-board question turns on, wrong by 100%, in the instrument built to answer that question.

⛔ **The hazard this task must not commit (F-1567-1): a fire meeting a refusal reads it as a bug and "fixes" it by widening the reader, turning a fail-safe into a fail-open.** Here the widening runs the *other* way — it makes the probe hear MORE refusals, so it can only ever SHRINK the candidate list. That is the safe direction, but it has a real failure mode of its own: **a pattern loose enough to match prose that merely discusses queueing would silently HIDE genuinely queueable banked work.** Item 3 exists to make that impossible to do by accident.

## Scope

1. **Widen the banner pattern to the vocabulary the corpus actually uses.** Replace the two-alternative literal with a named, commented constant — e.g. `NOT_QUEUEABLE` — covering `DO NOT QUEUE` / `DO-NOT-QUEUE` / `NEVER QUEUE` / `NOT QUEUEABLE` / `NOT-QUEUEABLE` / `NOT FIRE-QUEUEABLE` / `NOT-FIRE-QUEUEABLE`. The pattern I measured is `/DO[- ]NOT[- ]QUEUE|NEVER QUEUE|NOT[- ](?:FIRE[- ])?QUEUEABLE/i`; **you are not required to adopt it — you are required to justify whatever you ship against item 3's measurement.** Keep the six-line window unchanged (a refusal that is not in the header is not a declaration).

2. **Make the banner's PURPOSE legible at the site.** One comment naming what `banner` gates (`CANDIDATES` only, over `NO-TRACE` masters only) and stating the direction argument in one clause: widening can only shrink the candidate list, so the risk is hiding real work, not surfacing fake work. This is the sentence that stops the next reader from "tidying" it back to one literal.

3. **RE-DERIVE THE BLAST RADIUS YOURSELF — do not trust my number.** Over **all** masters (not just NO-TRACE), count how many the old pattern matches, how many the new one matches, and **list by name every master newly captured**. I measured **exactly 3 newly captured across all 979, all three of them the NO-TRACE candidates above, zero collateral**. **If your count differs from 3, that is a finding, not a discrepancy to smooth over: say so loudly in your review and STOP before editing anything else.** Then state in one line why collateral among SHIPPED/RAN-UNMERGED masters would have been harmless anyway (`banner` gates only the NO-TRACE-scoped `CANDIDATES` count) — this is the difference between a safe change and a change that happened to be safe.

4. **Tests in `scripts/master-shipped-classifier.test.mjs`** (extend, match its fixture style): (a) each of the three real spellings — `NEVER QUEUE`, `NOT QUEUEABLE`, `NOT FIRE-QUEUEABLE` — is recognised as a banner, one arm each, **with the fixture text quoting the real master's wording** so a future rewording breaks the test loudly; (b) `DO NOT QUEUE` / `DO-NOT-QUEUE` still are — the regression arm, labelled as such; (c) a master with **no** banner is still a candidate (the tool must not become blind to real work — this is the arm that guards the dangerous direction); (d) a refusal appearing **below** the six-line window is NOT a banner; (e) a master whose prose merely *mentions* queueing without refusing (e.g. "queue this after the drain") is NOT a banner — construct it deliberately and say what wording you chose.

5. **MANUFACTURE THE RED** (F-1299/F-1300 standard — a passing test never executes its violation path, so a green is not evidence about the red). Revert the pattern to the old two-alternative literal with the new tests in place, run them, and **quote the exact failing output with actual-vs-expected**. Restore, and confirm the restore leaves the file byte-identical to your intended cure. **A green suite alone does not close this task.**

6. **Re-run the probe on the LIVE corpus and quote the full headline line verbatim**, before and after. Expected after: `NO-TRACE 63, of which 63 self-declare … → 0 candidates`. **If it does not read 0, do NOT adjust the pattern until it does** — investigate which master still refuses in a fourth spelling, name it, and report; a pattern tuned until the number looks right is exactly the failure this task is about. Also quote `DISAGREES` before and after and confirm it is **unchanged at 96** (you touched nothing on the verdict axis; if it moved, you did).

## Firewall

**Touch ONLY:** `scripts/master-shipped-classifier.mjs` — the banner pattern, its named constant, and the comments in items 1–2; **no change to `verdictFor`, `SHIPPED`, `TRACE_DIRS`, `namesFile`, `bareStem`, the `disagrees` logic, the evidence formatting, or the printed table's columns** · `scripts/master-shipped-classifier.test.mjs` — additions only, do not rewrite existing arms · `reviews/f1584-1-banked-master-banner-vocabulary.md` (new, your report).

**NO changes to:** any file in `tasks/` — ⛔ **especially the three masters named above: their wording is the TEST SUBJECT, and editing a subject to match your pattern inverts the whole exercise** · `tasks/BACKLOG.md` · `tasks/goals.json` · `scripts/findings-state-guard.mjs`, `scripts/desk-state-audit.mjs`, `scripts/drain-block-check.mjs`, `scripts/goal-tracker.test.mjs` — sibling ledger readers, read-only context · `scripts/run-node-guards.mjs` · `package.json` — **no new npm script; this probe is advisory and deliberately un-rooted (F-1569-1's design), so re-rooting it here would change a decision this slice has no evidence about** · `.claude/skills/**` · `scripts/fire.md` · `CLAUDE.md` · `STATUS.md` · any `src/**`, `e2e/**`, `specs/**`.

🔓 **No firewall lift is granted.** If you find an adjacent defect — and item 6 may well surface a fourth spelling — **report it in your review file; do not fix it** (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc=0. `npm run build` green — quote the Vite time. `node --test scripts/master-shipped-classifier.test.mjs` — quote tests/pass/fail and name each new arm. `npm run test:ledger-guards` green — quote the totals and name which chained leaves ran; **state explicitly whether `law-pointer-guard` reddened** (you are inserting lines into a script other law surfaces cite) **and what you re-based**. `node scripts/master-shipped-classifier.mjs` on the live corpus — **quote the full headline line before and after**, and confirm rc=0 both times.

⚠️ **The `test:node-guards` battery is ~181 s and must be run ALONE, never overlapped with another battery** (s1536 hung ~19 min doing exactly that on shared fixtures). Run it and quote the tests/pass/fail/skip line.

**No Playwright is owed or claimed** — this slice touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/` or `src/entities/`, so neither the slice-spec rule nor F-1460-1's sim-guard rule binds; **say so explicitly rather than silently skipping.**

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate (Mistake #1).

**READY-FOR-GATES** + report: the live headline quoted before and after with the candidate count going 3 → 0 · your independently re-derived blast-radius count and the names of every newly captured master (and a loud flag if it is not 3) · `DISAGREES` unchanged at 96 · the manufactured red's exact assertion output and the confirmed restore · the wording you chose for the item-4(e) "mentions queueing but does not refuse" fixture · whether `law-pointer-guard` reddened and what you re-based · anything adjacent you found and deliberately did not fix.
