# s1182 findings — a no-drain authoring fire

Fire s1182, 2026-07-28 ~21:24–21:55 local. **No drain was available** (six empty queues, zero
undrained done-moves, zero failed runs, no `tasks/CODEX-WALL`). The fire's act was to restart a
fully dry pipeline. Findings below are everything I measured that outlives this fire.

---

## F-1182-1 — `src/game/Balance.ts.orig` is tracked debris, and a runner broad-add put it there

**Verified:** the file is **355 lines** against `src/game/Balance.ts`'s **1098**, contains **zero**
conflict markers, and is referenced from **no** `src/`, `e2e/`, `vite.config.ts` or live script
(the only hits are old handoff prose in `scripts/_s*.mjs`). It entered git in
`680775c3 runner(art): art-batch-008-prospector-companion.md` — **an ART-batch commit**, i.e. a
runner broad-add swept a file that has nothing to do with art. This is the `F-1162-1` family
(the runner committing unrelated files), and it has been sitting in `src/` since.

The s67 handoff (2026-07-06) already listed it under *"Debris (untracked, rm not allow-listed —
Robin sweep by hand)"*. It was untracked debris then; the art runner has since **committed** it.

**Why it is worth one line of the owner's time:** it is a stale, truncated copy of the balance
constants living in `src/`, in a repo whose agents grep constantly. A future reader grepping a
balance value can read the **wrong number** from it with no signal that the file is dead.

**Fix (one command, fully reversible — git keeps every version of a tracked file):**
`git rm --cached src/game/Balance.ts.orig` and add `*.orig` to `.gitignore`.
**Not fire-executable:** `git rm` is absent from the `.claude/settings.json` allow list. I attempted
it once, was refused, and did **not** wrap it in `node` to route around the gate.
➡️ **OWNER / ATTENDED.**

---

## F-1182-2 — the runner's independent-review step 400s on an old CLI: measured 2/34 today, 2/110 lifetime

s1181 raised this as a note ("worth one look before it quietly degrades other lanes' self-checks").
I went to the artefact and then measured the rate, because one instance is a sample, not a rate.

**The artefact** (`tasks/runs/20260728-202122-lane-b-lane-town-store-collider.md.log:13137`), the
server's own words:

> `ERROR: {"type":"error","status":400,...,"message":"The 'gpt-5.6-sol' model requires a newer version of Codex. Please upgrade to the latest app or CLI and try again."}`

**Installed:** `codex-cli 0.133.0` (`/opt/homebrew/bin/codex`). `scripts/lane-runner-v3.sh:67`
documents **0.144.1** as the version that knows the 5.6 ids.

**The measured rate — and the scope limit that matters:**
| denominator | attempted `codex review --uncommitted` | 400'd on model version |
|---|---|---|
| today (`20260728-*`) | 34 | **2** |
| all run logs | 110 | **2** |

**The main task exec is NOT affected.** `scripts/lane-runner-v3.sh:68` runs
`codex exec -m gpt-5.6-sol` and that path works — the town-store-collider task it failed inside
shipped and merged as `422d2639`. Only the *nested* `codex review --uncommitted` self-check 400s.
So this is a lost optional quality gate, ~6% of today's runs, **not** a broken factory.

Codex behaved correctly both times: it refused to silently switch models without authorization and
wrote the gap into its report — which is why it was catchable at all.

**Recommendation:** `brew upgrade codex`. **Not a fire's unilateral act** — it mutates the live
runner's environment while the runner is running. ➡️ **OWNER**, low urgency.

---

## F-1182-3 — ⚠️ F-1181-2 is aimed at the wrong subject. Do NOT author the consolidation slice it recommends.

s1181's handoff item (3) offers F-1181-2 as fire-authorable: *"the hero and the enemy still carry
**two implementations of one movement law**"*. I went to read the two implementations before
authoring it, and **there is only one.**

**Verified at source:**
- `src/sim/TileHeight.ts:136` — `export function resolveTerrainMove(...)`, the shared law.
- `src/entities/Hero.ts:10` imports it; `Hero.ts:169` calls it.
- `src/entities/Enemy.ts:7` imports it; `Enemy.ts:1295` calls it.

**Both already call the same helper.** What the enemy has *in addition* is a persistent
goal-directed side latch (`terrainSlideSide`), and the hero has **no equivalent and structurally
cannot** — `resolveTerrainMove` takes an optional `goal` argument, the enemy passes one, and the
hero passes none because *the player is the goal*. `grep -rn "terrainSlideSide" src/` returns
`Enemy.ts` only. Consolidating "the hero's and the enemy's resolvers" would mean consolidating
something one of them does not have.

**The real duplication is smaller, and it is entirely inside `Enemy.ts`:** the side-pick expression
`(northSouth ? Math.sign(goalX) : Math.sign(goalZ)) || this.avoidanceSide()` appears **twice**,
at `:1253-1255` and `:1266-1268`; the ford expression is likewise duplicated at `:1312` and `:1316`.
That is a ~10-line local extraction with **no player-visible checkpoint**, in movement code that
shipped hours ago and whose specs carry known reds (`gt-03:125`, `gt-03:254`, `gt-02:254`).

**Verdict:** the finding's *premise* (the substitution was minimal) is true; its *subject* (two
movement laws) is false. Low value, non-trivial risk. Not authored. If anyone still wants the
tidy-up, scope it as "de-duplicate four expressions within `Enemy.ts`", never as a hero/enemy merge.

---

## F-1182-4 — the GAZETTE-ART gate had been dead ~11 hours while still being carried as live

`tasks/BACKLOG.md:1650` gates the batch verbatim on *"Fire-authorable AFTER art-e7-town-icons
completes (one batch in flight law)"*. s1181's handoff still listed GAZETTE-ART as *"blocked behind
art-e7-town-icons"*.

**Re-derived by ancestry, not by message-grep (Mistake #16):** `art-e7-town-icons` shipped —
`tasks/done/shipped-7873eaee-20260728-100138-art-e7-town-icons.md` exists **and**
`git merge-base --is-ancestor 7873eaee main` returns true (LEDGER row 62). Siblings E6/E8/E9 are on
main too. `tasks/queue/art/` and `tasks/running/` were both empty, so one-batch-in-flight
(`assets/LEDGER.md:7`) was genuinely clear.

**Acted on:** master `tasks/art-gazette-engravings.md` authored + queued, goal leaf
`gazette-art-engravings` registered in the same commit (`14738cf4`), BACKLOG:1650 updated.
The runner picked it up at **21:52:14** and Codex went live — the dry board is over.

**The general lesson, which is Mistake #4 wearing art-slot clothes:** *when a whole board reads
PIPELINE-DRY, audit the BLOCKER, not the queue.* Every queue being empty looked like "nothing is
ready"; it was actually "one gate is stale and nobody re-ran the check". The check cost two
commands.

---

## Duties discharged this fire
- **ART staging audit** (law: I touched the ART slot): **AT RISK 748 files / 566.47 MB** — flat
  against the standing F-1120-2, so this fire put **no new bytes at risk** — and **LOCAL-ONLY 0**.
  ⚠️ Method note: my first run piped the audit through `tail -25` and **cut off the very headline
  the law requires**. The script was fine; the instrument was pointed at part of the question. Re-run
  whole. *(A third false-zero would have been mine, not the script's.)*
- **ASSAYER:** `assets/crafting-queue/pending/` listed, **empty** — no verdict owed.
- **GZ-01 gazette:** **no item owed** — this fire merged nothing player-visible (filter law).
- **TK-01 ticker:** **not owed**, re-derived at the file's own header —
  `marketing/outbox/ticker-digest-2026-07-27.md:1` records the **07-28** compile, so the 07-28
  digest falls due after 06:00 on **07-29**.
- **DEPLOY:** not attempted, deliberately, per s1181's standing order (*"if the owner has cleared
  it — otherwise leave it and say so"*). Verified **not** cleared:
  `grep -c "deploy" .claude/settings.json` = **0**, and the Bash allow list contains no `bash` entry
  at all. Third fire to confirm it structurally. **Five gameplay slices from s1181 remain undeployed.**
