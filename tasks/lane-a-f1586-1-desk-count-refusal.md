# Task f1586-1: the desk's declared count is prose no guard reads — gate the LIVE desk on declared-vs-keyed at a tolerance the corpus justifies, not at the zero-tolerance an earlier fire correctly refused (LANE-A, commit prefix "fix:")

**FIRE-AUTHORED (attended review welcome)** — s1586, discharging the cure **F-1584-2** specified and deliberately left unauthored (s1584 had spent its one authored master; s1585 then declared PIPELINE-DRY and did not pick it up). I did not inherit F-1584-2's write-up: I re-measured the whole corpus this fire, and **the finding is both larger and differently shaped than it was reported** — see "Why". **The cure F-1584-2 prescribed is already half-built and was deliberately rejected once, with numbers.** Item 1 exists so you do not re-litigate that rejection; item 3 exists so you do not accept my replacement on trust either.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` row **F-1586-1** — the whole row, it is the specification; `scripts/desk-carryforward-guard.mjs` — **the entire file, but especially `deskItems()` and the `result.unkeyed` advisory block at the print site in `main()`; that advisory is the thing you are converting, and its comment is the objection you must answer**; `scripts/desk-carryforward-guard.test.mjs` — its fixture style, which you extend rather than replace; `scripts/desk-declaration-guard.mjs` — **read-only context, but read it**: its header records two prior cures in this exact family (F-1471-3's fail-open, F-1472-1's lapsed convention) and one *refuted* design (F-1334-1) plus one *measured-then-narrowed* parser decision (the separator whitelist), and you must not re-introduce any of them; `CLAUDE.md` §6 (quality bars) and §4.5 (firewalls are contracts).

**Pre-flight (LANE-SAFETY, runner-auto-commit aware):** ✓ **MEASURED AT DISPATCH (s1586, `node scripts/lane-usable.mjs --all`): `lane-a lane/a ahead=0 behind=7 paths=0 tracked-dirt=0 untracked=0 → USABLE`.** The lane holds nothing main has not absorbed, so a reset to main is provably lossless — **but USABLE is not CURRENT (F-1320-2), and this task depends on the s1586 authoring commit that carries its own finding row; the lane is refreshed to main at dispatch and the citation check below proves it.** Therefore: confirm `git -C worktrees/lane-a log main..lane/a --oneline` is **empty**; if it is, `git checkout -B lane/a main && git clean -fd` and PROCEED. **STOP-and-report if that log is NON-empty** (undrained work — resetting would DESTROY it, the w1-03/polish-02 casualty), or if the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP**; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-a status --short` → clean, with the **FACTORY-CHURN EXCEPTION (F-1407-1), always expected and never a STOP; list and proceed: (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*`, any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

**SEQUENCING / CITATION CHECK (F-1424-3 — run BOTH after the reset, before any edit).** Each key is a single line, verified by me to print `1` **on main** at dispatch (s1586), per F-1425-2 — a key that spans a line break matches nowhere, including in the file it was copied from:

```sh
grep -c 'F-1586-1' tasks/BACKLOG.md
grep -c 'ADVISORY, NEVER A REFUSAL, and the corpus is why' scripts/desk-carryforward-guard.mjs
```

Both must print `1`. **If either prints `0`, STOP and report "lane drifted or predecessor absent" — do NOT improvise.** The first proves the s1586 authoring commit (this task's own finding row) is present; the second proves you are looking at the guard revision this task describes — and it is deliberately the very sentence you are about to rewrite.

## Why (F-1586-1, measured s1586 across all 112 counted desks in STATUS.md)

The OWNER'S DESK is the queue with Robin at the far end. `desk-carryforward-guard.mjs` defends it by comparing the previous fire's desk against this fire's and reddening on a silent drop. Its denominator is `deskItems(tail)`, which anchors on 🔺 and keys each segment by its first F-ID or first **backticked** slug.

**The header's declared count — "OWNER'S DESK — 24 awaiting a word" — is prose no guard reads.** So when a fire writes items the parser cannot key, the denominator silently collapses and **any successor trivially satisfies the carry-forward check.**

✓ **MEASURED THIS FIRE, over every line-1 STATUS.md has ever held (112 desks state a count):**

```
delta (declared − parsed)   desks
  -1                          1
   0                         48      <- exact agreement (42.9%)
  +1                         30
  +4                          1      <- s1585
  +7                          7
  +8                          2
  +9                         10
 +16                          4
 +18                          1
 +19                          7
 +22                          1      <- s1583
```

⭐ **THE GAP IS THE WHOLE DESIGN INPUT: there are ZERO desks at delta 2, 3, 5 or 6.** The corpus separates cleanly into a noise band of exactly `{-1, 0, +1}` (79 desks, 70.5%) and a defect band starting at 4. That is not a threshold I chose; it is one the data already drew.

🚨 **AND F-1584-2 UNDERSTATED THE DEFECT — it reported s1583 as a regression, i.e. one fire. It is a RECURRENCE.** `s1549`–`s1560` is a run of **twelve consecutive fires** whose desks declared 17–20 items and parsed to **1–3** (deltas 16–19). `s1561`–`s1582` is then **22 consecutive fires at delta 0**, so the conforming shape is established practice and not an aspiration. Then `s1583` (delta 22) broke it, `s1584` repaired forward (delta 0) — **and `s1585`, the fire that deferred this cure, shipped delta 4.**

✗ **The four items s1585's own desk lost are the four that CANNOT move without Robin:**

| segment | as written | why unkeyed |
|---|---|---|
| 21 | `🔺 **rf-34-hero-y-restore-roundtrip BLOCKED owner-fork**` | no backticks → `SLUG` cannot match, no F-ID present |
| 22 | `🔺 **e3-fairground-socket BLOCKED owner-fork**` | same |
| 23 | `🔺 **bt-04-homestead-automation BLOCKED owner-fork**` | same |
| 24 | `🔺 **f1328-1-drill-yard-census-debt BLOCKED disputed**` | same |

s1584 wrote these same four **with** backticks and parsed 24/24. One character each, and the four owner-fork leaves left the carry chain.

⛔ **NOW THE HALF THAT MUST NOT BE SKIPPED: F-1584-2's PRESCRIBED CURE IS ALREADY BUILT, AND IT WAS REJECTED ON PURPOSE.** F-1584-2 says *"compare the header's `— <n> awaiting a word` against `deskItems(tail).length` and refuse on mismatch"*. That comparison **already exists** — `analyse()` computes `declared` and `unkeyed`, and the print site carries this comment:

> `ADVISORY, NEVER A REFUSAL, and the corpus is why. … Measured s1533 across the 60 post-cure desks that state a count: 11 agree and 49 do not, nearly all by exactly one … Refusing on a mismatch would fail CLOSED on 82% of legitimate desks`

**s1533 was right, and its measurement is not what changed.** What changed is that nobody ever priced the *other* gate: s1533 refuted **zero-tolerance**, and the corpus's own gap at 2–3 means **±1 tolerance is a different instrument entirely**. Priced against current practice this fire:

- **last 25 counted desks: 2 would refuse at ±1 (8%) — `s1583` (22) and `s1585` (4) — and BOTH are genuine defects.** Zero false positives.
- the 30 legitimate +1 desks and the single −1 desk s1533 was protecting all pass untouched.

⚠️ **THE SECOND DEFECT, WHICH F-1584-2 DID NOT NAME AT ALL: the advisory reads the PREVIOUS desk.** `analyse()` computes `unkeyed` from `prev`, so the fire that is told about a broken desk is the one fire that **cannot fix it** — the author has already handed off. That is why twelve consecutive fires could ship a collapsed desk while a guard printed a note about it every single time. **A gate that accuses the wrong fire is not a gate.**

## Scope

1. **Answer s1533's objection explicitly, in a comment at the site, before changing behaviour.** Rewrite the advisory block's comment so it records: what s1533 measured (60 desks, 11 agree, 49 do not, nearly all by one), that its refutation was of a **zero-tolerance** gate, the s1586 full-corpus histogram above with its **empty 2–3 band**, and why ±1 therefore admits every desk s1533 was protecting. **Do not delete s1533's numbers** — restate them (the drift *is* the provenance; the F-1537-1 convention). A future reader must not be able to conclude the earlier fire was careless.

2. **Gate the LIVE desk, at tolerance ±1.** Add to `analyse()` the same declared-vs-keyed comparison for **line-1's own desk**, and refuse (`exit 1`) when `|declared − keyed| > 1`. Keep the existing `prev`-side computation exactly as it is — **advisory, never a refusal** — because archived desks are immutable history and reddening on them would freeze the board permanently (Retention Law: history is restated, not rewritten). Say that in one clause at the site.

3. **RE-DERIVE THE HISTOGRAM YOURSELF — do not trust mine.** Walk every line-1 STATUS.md has ever held (line 1 plus every `- **sNNNN handoff (line-1 archive):**` and `- **sNNNN lock line (archived):**` bullet), and report: how many state a count, the full delta histogram, and **how many of the last 25 counted desks your chosen tolerance would refuse, naming each.** **If your 2–3 band is NOT empty, or your last-25 refusal count is not 2 (`s1583`, `s1585`), that is a finding, not a discrepancy to smooth over: say so loudly in your review and STOP before editing anything else.** My probes are in `logs/session-scratch/s1586/` — **read them only AFTER you have written your own**, and say in the review whether you agreed.

4. **The refusal message must name the actual repair, because the failure is one character.** On refusal, print the declared count, the keyed count, **and the unkeyed segments' opening text** (as `desk-unkeyed-s1585.mjs` does), then the fix: key each item by an F-ID or a `` `backticked-slug` `` at the very front of its 🔺 segment. A guard that says "24 ≠ 20" and stops has made the fire do the diagnosis twice. **Quote the real s1585 segments in your review as the worked example.**

5. **Tests in `scripts/desk-carryforward-guard.test.mjs`** (extend, match its fixture style): (a) delta 0 passes; (b) delta +1 and −1 **pass** — the s1533-protection arm, labelled as such; (c) delta +4 **refuses**, fixture built from s1585's real four unbackticked slugs; (d) delta +22 **refuses**, fixture built from s1583's ·-separated-run shape; (e) a header with **no** declared count still passes (many desks state none — do not invent a second refusal); (f) an **ACTIVE lock** line-1 still SKIPs, unchanged; (g) the `prev`-side advisory still does **not** gate — a fixture whose *previous* desk is collapsed but whose live desk is clean must PASS.

6. **MANUFACTURE THE RED** (F-1299/F-1300 standard — a passing test never executes its violation path, so a green is not evidence about the red). With the new tests in place, revert the tolerance to accept everything, run them, and **quote the exact failing output with actual-vs-expected**. Restore, and confirm the restore leaves the file byte-identical to your intended cure. **A green suite alone does not close this task.**

7. **State what the live board does at gate time, and why it is not a red.** At the moment you run `test:ledger-guards`, STATUS.md line-1 on main is an **ACTIVE lock** (s1586 holds it), so both desk guards SKIP — your fixtures are the only real subject. **Say this explicitly in the review rather than reporting a green that read nothing** (the F-1471-3 fail-open shape). Then state, in one line, what the gate will do to the *next* handoff: s1586's desk is written to parse at delta 0, so the first live evaluation should pass.

⛔ **DO NOT cure any of this by loosening `deskItems()` to accept ·-separated runs or unbackticked slugs.** That is F-1567-1's trap (widening a reader until a refusal goes away) and it would re-key items by whichever id happened to fall first — the exact `(1)` bug the parser's own comment says it replaced. The desk convention is one 🔺 per item with the key at the front; this slice **enforces** that convention, it does not relax it.

## Firewall

**Touch ONLY:** `scripts/desk-carryforward-guard.mjs` — the advisory comment (item 1), the live-desk comparison and refusal in `analyse()`/`main()` (items 2, 4); **no change to `deskItems()`, `deskTail()`, `previousDesk()`, `acknowledged()`, `DESK_WORD`, `FINDING`, `SLUG`, `KEY_ZONE`, or the existing silent-drop logic and its exit code** · `scripts/desk-carryforward-guard.test.mjs` — additions only, do not rewrite existing arms · `reviews/f1586-1-desk-count-refusal.md` (new, your report) · `artifacts/s1586-desk-histogram/` (new, optional — your item-3 re-derivation if you want it durable).

**NO changes to:** `STATUS.md` — ⛔ **absolutely not, under any circumstances: it is the TEST SUBJECT and a live fire holds its lock; editing it to make a guard pass inverts the whole exercise** · `scripts/desk-declaration-guard.mjs` and its test — sibling, read-only context (its flat F-ID scan is a *deliberately different* parser; see its SLUG note) · `scripts/desk-state-audit.mjs` · `scripts/desk-birth-guard.mjs` · `scripts/findings-state-guard.mjs` · `tasks/BACKLOG.md` · `tasks/goals.json` · `scripts/run-node-guards.mjs` · `package.json` — **no new npm script; this guard is already rooted in `test:ledger-guards`, and adding a root would trip `gate-caller-audit`** · `.claude/skills/**` · `scripts/fire.md` · `CLAUDE.md` · any `src/**`, `e2e/**`, `specs/**` · `logs/session-scratch/s1586/**` (my probes — read-only).

🔓 **No firewall lift is granted.** If you find an adjacent defect — item 3 may well surface one — **report it in your review file; do not fix it** (CLAUDE.md §4.5).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc=0. `npm run build` green — quote the Vite time. `node --test scripts/desk-carryforward-guard.test.mjs` — quote tests/pass/fail and name each new arm. `npm run test:ledger-guards` green — quote the totals and name which chained leaves ran; **state explicitly whether `law-pointer-guard` reddened** (you are inserting lines into a script other law surfaces cite) **and what you re-based**.

⚠️ **The `test:node-guards` battery is ~181 s and must be run ALONE, never overlapped with another battery** (s1536 hung ~19 min doing exactly that on shared fixtures). Run it and quote the tests/pass/fail/skip line.

**No Playwright is owed or claimed** — this slice touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/` or `src/entities/`, so neither the slice-spec rule nor F-1460-1's sim-guard rule binds; **say so explicitly rather than silently skipping.**

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate (Mistake #1).

**READY-FOR-GATES** + report: your independently re-derived histogram, the emptiness (or not) of the 2–3 band, and your last-25 refusal count with each desk named — **flagged loudly if it is not 2** · the manufactured red's exact assertion output and the confirmed restore · the refusal message's full text on the s1585 fixture, showing it names the four unkeyed segments · confirmation that the `prev`-side advisory still cannot gate (item 5g) · your one-line statement of what the live board does at gate time and why that green is not evidence · whether `law-pointer-guard` reddened and what you re-based · anything adjacent you found and deliberately did not fix.
