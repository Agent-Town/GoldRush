# Task f1578-1: the findings census reads two of the ledger's nine row markers — make the blind spot VISIBLE without reddening the board (LANE-B, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s1578, from **F-1578-1**, which I found and measured this fire while triaging an idle board. I did not infer the mechanism from prose: I read `scripts/findings-state-guard.mjs` end to end and ran its own exported `scan()` against the live 3.9 MB ledger before writing a line of this task. **Two of my own probes returned a false `0` before I got a true number** (an emoji character class without the `u` flag split surrogate pairs; an `[A-Z]{2,6}` id pattern excluded single-letter `F-`). Both are recorded in the Why because they are the trap this task walks into — see item 5.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` row **F-1578-1** — the whole row, it is the specification; `scripts/findings-state-guard.mjs` — **the entire file, but especially the header comment's CLOSURE VOCABULARY block and the marker-admission line `if (!lead.startsWith('🟡') && ...) continue;` inside `scan()`; you are adding an OPEN-side axis beside the existing CLOSED-side one and must not disturb either default**; `scripts/blocker-panel-closed-guard.mjs` — named in that header as the reason wide widens closed only, read it before you touch the closed axis; `tasks/BACKLOG.md` row **F-1567-1** — *"a fire meeting a refusal will read it as a bug and may fix it by widening the reader — which is how a fail-safe becomes a fail-open"*, the exact hazard this task must not commit; `CLAUDE.md` §6 (quality bars) and §4.5 (firewalls are contracts).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** ✓ **MEASURED AT DISPATCH (s1578, `node scripts/lane-usable.mjs --all`): `lane-b lane/b ahead=0 behind=11 paths=0 tracked-dirt=0 untracked=0 → USABLE`.** The lane holds nothing main has not absorbed, so a reset to main is provably lossless — **but USABLE is not CURRENT, and this task depends on commits inside those 11.** Therefore: confirm `git -C worktrees/lane-b log main..lane/b --oneline` is **empty**; if it is, `git checkout -B lane/b main && git clean -fd` and PROCEED. **STOP-and-report if that log is NON-empty** (undrained work — resetting would DESTROY it, the w1-03/polish-02 casualty), or if the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP**; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP; list and proceed: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH after the reset, before any edit).** Each key is a single line, verified by me to print `1` **on main** at dispatch (s1578), per F-1425-2 — a key that spans a line break matches nowhere, including in the file it was copied from:

```sh
grep -c 'F-1578-1' tasks/BACKLOG.md
grep -c 'CLOSURE VOCABULARY' scripts/findings-state-guard.mjs
```

Both must print `1`. **If either prints `0`, STOP and report "lane drifted or predecessor absent" — do NOT improvise.** The first proves the s1578 authoring commit (this task's own finding row) is present; the second proves you are looking at the guard revision this task describes.

## Why (F-1578-1, measured s1578 against the live ledger)

`findings-state-guard` is the factory's answer to *"is any finding declared open and closed at once?"*. It runs in `test:ledger-guards`, a fire's mandated last act. On the live ledger it currently prints:

```
declared subjects : 411
declared closed   : 261
declared open     : 150
double-state      : 0
findings-state-guard: PASS
```

✓ **VERIFIED by reading `scan()`, not inferred:** the admission line is

```js
if (!lead.startsWith('🟡') && !lead.startsWith('✅') && !struck && !bulletClosed) continue;
```

**Every row whose leading marker is not 🟡 or ✅ (or struck / bullet-closed) is skipped entirely, before its state word is ever read.**

✓ **The ledger does not use two markers. It uses nine** — counted this fire over every marker-led row in `tasks/BACKLOG.md`:

| ✅ | 🟡 | 🔺 | 🟢 | 🔬 | 🔴 | 🟠 | ⛔ | 🟣 |
|---|---|---|---|---|---|---|---|---|
| 319 | 159 | 94 | 75 | 29 | 29 | 21 | 10 | 1 |

Excluding the 🔺 desk markers, **165 marker-led rows are invisible to the census**.

📊 **The consequence, measured with the guard's OWN exported `scan()` and its OWN `FINDING` pattern (`/\bF-\d+-\d+\b/g`) and `SUBJECT_CHARS = 90`** — five F-IDs are declared `OPEN` in the subject zone of a row the guard skips:

- **F-1563-3 — a MISSED CONFLICT.** The guard reports it **closed-only** (its ✅ row) while the ledger simultaneously carries a 🟠 row whose subject declares it **OPEN**. `double-state: 0` is therefore a **false green on the guard's own headline predicate** — the one thing it exists to catch.
- **F-1577-3, F-1572-1, F-1147-1, F-1093-1 — invisible entirely.** The guard has never heard of them; they appear in neither the open nor the closed census. F-1577-3 is the rung that was executing in lane-c while this task was written.

🔑 **THE INSTRUCTIVE HALF, and the reason this is a mechanism question rather than four typos.** That header comment reasons *carefully and at length* about the **CLOSED** vocabulary: narrow vs wide, measured at s1291, *"narrow sees 1 of its 136 occurrences, leaving 56 F-IDs closed only by a row the census cannot read"*, with the default deliberately left alone and callers made to opt in and say why. **The OPEN vocabulary got none of that scrutiny and was left at a single literal.** The axis that received the attention got measured; the axis that did not silently narrowed the denominator every fire since. Same family as F-1576-1 and F-1577-1 — *a mechanism's stated job and what it actually controls are different claims, and only one of them was checked.*

⚖️ **DIRECTION MATTERS, AND IT IS THE SAFE ONE — SAY SO IN THE HEADER.** Widening the **CLOSED** vocabulary makes findings disappear from the open census: fail-**open**, which is why the existing header refuses to do it by default. Widening the **OPEN** vocabulary can only ADD open declarations, so it can only ADD conflicts: fail-**safe**. F-1567-1 warns that a fire meeting a refusal may "fix" it by widening the reader — this task widens the reader **on the axis where widening tightens the guard**, and must not touch the other.

⛔ **Two things this task must NOT do.** It must not change the `closedVocabulary` axis, its default, or `blocker-panel-closed-guard.mjs`'s contract with it. And it must not turn a widened open vocabulary into a **red board**: this guard gates `test:ledger-guards`, a fire's last act, so a change that reds the live ledger blocks *every fire* until someone triages rows nobody has ruled on. Item 2 exists to make that impossible.

## Scope

1. **Add an OPEN-side vocabulary axis to `scan()`, mirroring the existing closed-side one.** A new option (`openVocabulary = 'narrow' | 'wide'`, default `'narrow'`) — with `'narrow'` **byte-identical to today in every respect**, which is a regression arm you must assert, not merely believe. `'wide'` additionally admits rows led by **🟠, 🔬, 🔴, 🟢, 🟣** *and whose 90-char subject zone declares a state word* — a marker alone must never imply open. Note in the header **why 🟢 in particular cannot be admitted on its marker**: the ledger uses it for RULING rows that are resolutions, so the subject's state word is the signal and the marker is only the gate. 🔺 desk rows stay excluded; say why in one clause.

2. **The PASS/FAIL predicate stays on the narrow vocabulary; the wide reading ships as an ALWAYS-PRINTED ADVISORY LINE.** Every run prints one extra line naming what the narrow census cannot see — count of skipped marker-led rows, count of F-IDs declared open only on such a row, and how many of those the narrow census reports **closed-only** (the missed-conflict number, which today is 1 and is the number that matters). **This must not change the exit code.** Precedent to copy and to cite in the header: `desk-state-audit.mjs` and `attended-owed-audit.mjs` — *a gate whose usual output is a printed backlog does not belong in a pre-merge battery*. An opt-in flag alone would be inert (nobody would pass it); an advisory line is seen by every fire at no cost.

3. **Resolve F-1563-3, or state precisely why it cannot be resolved here.** Determine whether a separate 🟠-led row for an F-ID that also has a ✅ row is (a) a genuine double-state the ledger should retire, or (b) the normal Retention-Law shape of a preserved original. **Measure it, do not guess:** the house pattern I observed is that a preserved original is folded into the SAME line as its closure row, with the old marker appearing MID-line (e.g. `… **Original finding preserved below.** 🟠 **(as filed sNNNN):** …`), which the guard correctly never reads as a leading marker. Count how many closed F-IDs have their original folded mid-line versus standing as a separate leading-marker row. If F-1563-3 is the anomaly, **fix that one BACKLOG row** — retire the state word in the stale row's subject per Mistake #5 (retire, never delete; the Retention Law keeps the prose). If separate preserved rows turn out to be common, **do NOT edit the ledger** — report the count and say the advisory line needs a preserved-original exclusion, which is then a successor's slice.

4. **Tests in `scripts/findings-state-guard.test.mjs`** (extend the existing file if there is one; match its fixture style): (a) narrow is unchanged — a fixture exercising 🟡/✅/struck/bullet-closed produces byte-identical output with and without the new option present, **labelled as the regression arm**; (b) a 🟠-led row declaring `OPEN` is invisible under narrow and visible under wide; (c) a 🟢-led RULING row with **no** state word is admitted by neither; (d) an F-ID with a ✅ row and a separate 🔬-led `OPEN` row is reported as a conflict under wide and not under narrow; (e) the advisory line's counts are asserted on a fixture with a known answer; (f) **the exit code is identical under both vocabularies for the same fixture** — the item-2 promise, asserted rather than assumed.

5. **MANUFACTURE THE RED, and manufacture the two PROBE failures too** (F-1299/F-1300 standard — a passing test never executes its violation path, so a green is not evidence about the red). Three demonstrations, each with exact output quoted: (i) break the wide path so a 🟠 `OPEN` row is missed, and show which arm fails with actual-vs-expected; (ii) show that an emoji character class written **without** the `u` flag fails to match a leading 🟠 (this is how my first probe returned a false `0`); (iii) show that an id pattern of `[A-Z]{2,6}-…` matches no `F-nnnn-n` at all (my second false `0`). Restore after each, and confirm the restore. **(ii) and (iii) are why the header must tell the next reader to reuse this file's exported `scan()` and `FINDING` rather than re-deriving either** — add that sentence.

6. **Re-run against the LIVE ledger and quote both censuses verbatim** — narrow (which must match the block in Why byte-for-byte, or you have found a second finding: say so) and wide, with the delta named F-ID by F-ID. If wide surfaces conflicts beyond the five I measured, **list them; do not act on them** — ruling on a finding's state is not this slice's business.

## Firewall

**Touch ONLY:** `scripts/findings-state-guard.mjs` — the open-vocabulary option, the advisory line, and header prose; **no change to `SUBJECT_CHARS`, `FINDING`, `BULLET_CLOSED`, the `closedVocabulary` axis, or any narrow-path behaviour** · `scripts/findings-state-guard.test.mjs` — additions only, do not rewrite existing arms · `tasks/BACKLOG.md` — **ONLY the single stale state word in the one row item 3 may identify, and ONLY if item 3's measurement says it is the anomaly; nothing else in this 3.9 MB file is yours** · `reviews/f1578-1-findings-state-open-vocabulary.md` (new, your report).

**NO changes to:** `scripts/blocker-panel-closed-guard.mjs` — ⛔ the header names it as the reason the closed axis is narrow; it is read-only context, and changing it would silently move a second guard · `scripts/desk-state-audit.mjs`, `scripts/desk-declaration-guard.mjs`, `scripts/citation-title-guard.mjs`, `scripts/goal-tracker.test.mjs` — sibling ledger readers, read-only · `scripts/run-node-guards.mjs` · `package.json` — **no new npm script; `test:findings-state` already roots this guard, so §0.5's rooting question is already answered and re-rooting it would double-count it** · `tasks/goals.json` · `.claude/skills/**` · `scripts/fire.md` · `CLAUDE.md` · `STATUS.md` · any `src/**`, `e2e/**`, `specs/**`.

🔓 **No firewall lift is granted** beyond the single ledger row named in item 3. If you find an adjacent defect, **report it in your review file — do not fix it** (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc=0. `npm run build` green — quote the Vite time. `node --test scripts/findings-state-guard.test.mjs` — quote tests/pass/fail and name each new arm. `npm run test:ledger-guards` green — quote the totals and name which chained leaves ran; **state explicitly whether `law-pointer-guard` reddened** (you are inserting lines into a file other law surfaces cite) **and what you re-based**. `node scripts/findings-state-guard.mjs` on the live ledger — **quote the full output including the new advisory line**, and confirm rc=0.

⚠️ **The `test:node-guards` battery is ~181 s and must be run ALONE, never overlapped with another battery** (s1536 hung ~19 min doing exactly that on shared fixtures). Run it and quote the tests/pass/fail/skip line.

**No Playwright is owed or claimed** — this slice touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/` or `src/entities/`; **say so explicitly rather than silently skipping.**

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate (Mistake #1).

**READY-FOR-GATES** + report: both censuses (narrow and wide) quoted verbatim with the delta named F-ID by F-ID · the advisory line's exact wording · item 3's measurement (folded-mid-line vs separate-row counts) and what you did or deliberately did not do to the ledger · all three manufactured failures with their exact assertion output and confirmed restores · whether `law-pointer-guard` reddened and what you re-based · anything adjacent you found and deliberately did not fix.
