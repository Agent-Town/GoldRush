# Task f1436-1-red-inventory-lookup: make the suite red inventory findable by the key drains actually use (lane-d, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1436, 2026-08-03. Corrective for **F-1436-2**, a finding whose
own first draft was wrong; read that story below before you start, because it defines the deliverable.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`
(branch `lane/perf`).

## READ FIRST

- `AGENTS.md`
- `reviews/f1435-1-ring-hints-for-a-ring-that-is-gone.md` — the drain that filed F-1436-2 (§ "Findings")
- `logs/suite-red-inventory.md` — **the artifact you are making findable.** Read its HEADER and the first
  ~20 rows of each table only; the file is 136 KB and you must not pull it all into context.
- `scripts/suite-red-inventory.mjs` — the reducer that WRITES that file. Its emit code is the spec for your
  parser: match its column order rather than guessing from the markdown.
- `tasks/lane-d-suite-red-inventory.md` — the s1159 master that produced the inventory (shape precedent)

## Pre-flight

**STOP pre-condition (hard — do not skip, do not "fix" it, report and exit if it fails).** Run these three
greps from the repo root of your worktree. Each must print exactly `1`:

```
grep -c "^_Bucket sizes count logical tests; totals count desktop/mobile project executions._$" logs/suite-red-inventory.md
grep -c "unfindable by the only key anybody uses" reviews/f1435-1-ring-hints-for-a-ring-that-is-gone.md
grep -c "^| Spec file | Test title | Project | Failing file:line | First error line | Duration | Bucket |$" logs/suite-red-inventory.md
```

All three were verified to return `1` on main at authoring time. A `0` means your lane is behind main and
does not yet contain this task's subject — **STOP and report "lane stale at dispatch", do not improvise.**
(F-1424-3 / F-1425-2: the key is proven against the source before it is written down, so a `0` here really
does mean the lane, and not a paraphrase.)

**LANE-SAFETY (safe-dupe, runner-auto-commit aware):** the lane branch being ahead is NORMAL — the runner
auto-commits. For each ahead commit: if its content is already merged to main (verify with `git log`/`git
diff`, not from memory), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED.
STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY
it), or the worktree holds uncommitted edits you did not make.

> **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them and proceed (F-1407-1):** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence. ⚠️ **The fire that authors a master creates this dirt in the same fire and cannot see it**, which is why it lives in the template rather than in anyone's memory. ⓘ What still STOPs, unchanged and load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — anything a live drain or concurrent task could actually own. ⚠️ **`logs/suite-red-inventory.md` is THIS TASK'S SUBJECT and is NOT covered by exception (a)** — if it is modified in your worktree, that IS a STOP.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (F-1436-2, s1436, 2026-08-03 — measured, not inferred)

The factory built a suite red inventory, shipped it, and then **stopped being able to find it.**

`logs/suite-red-inventory.md` lists **303 failing tests of 2388**, each with a `BOTH`/`MOBILE-ONLY`/
`DESKTOP-ONLY` bucket, and a second table giving each red's **blast radius** — how much of its spec sits
unexercised behind it. It even carries hand-added annotations the raw JSON never had, e.g.
`restore-validation` *page-load restore materializes run-manager state* is recorded as
**`~25%: 3/12 desktop, 3/12 mobile — measured s1297, interleaved, order-reversed, --workers=1; F-1297-1`**.

Three consecutive drains then re-derived rows that were already in it:

- **F-1434-2** (s1434) named `water-mask-engine:23`, `terrain3d-claim-pilot:166`, `e1-twin-banks:103`/`:122`
  as always-red-on-main and asked for a fix-or-retire ruling.
- **F-1435-2** (s1435) named `restore-validation:656`, `bt-01-tiers:205`/`:430` — *"the F-1434-2 class again,
  one fire later and still growing"*.
- **s1436** (this fire) re-confirmed `restore-validation:656`, added `world-info-notes:196`/`:293`/`:322`,
  and spent **four isolation runs** characterising `restore-validation:186` as *"moves between projects run
  to run"* — a property the inventory had already recorded, measured, **~140 fires earlier.**

**The cause is mechanical, not careless, which is why a fourth finding would not have fixed it.** Reviews cite
reds by `file:line`. The inventory records `file:line` too — *as of its run* — and specs have moved since.
Measured s1436:

| Key used | Hits against `logs/suite-red-inventory.md` |
|---|---|
| the ten cited `file:line` coordinates | **0 of 10** |
| the same ten by **test title** | **10 of 10** |

(`world-info-notes` 335→322, 111→196, 301→293 · `restore-validation` 708→656, 32→186 ·
`water-mask-engine` 39→23.)

The inventory is not missing and is not stale in substance. It is **unfindable by the only key anybody uses**
— F-1310-1 / F-1425-2 (*cite by content, coordinates rot*) biting the factory's own instrument instead of its
law files. Every drain therefore pays ~8 minutes of control runs to re-derive rows that already exist.

**You are not fixing any red test and you are not re-running the inventory.** You are building the lookup.

## Scope

1. **`scripts/red-inventory-lookup.mjs`** — a title-keyed lookup over `logs/suite-red-inventory.md`.

   ```
   node scripts/red-inventory-lookup.mjs <spec-path> [--title "<exact test title>"] [--json] [--strict]
   ```

   - Parse **both** tables the reducer emits: the per-failure table (`Spec file | Test title | Project |
     Failing file:line | First error line | Duration | Bucket`) and the blast-radius table. Derive the
     columns from `scripts/suite-red-inventory.mjs`'s emit code, not from eyeballing the markdown.
   - **Key on `(spec file, test title)`. NEVER on `file:line`.** That is the entire point of the task.
   - `<spec-path>` accepts `e2e/foo.spec.ts`, `foo.spec.ts` or an absolute path, and normalises them.

2. **Print a WORD, not just an exit code** — three outcomes, each named in the output text, because a reader
   who branches on the exit code alone will misread one of them (the `lane-usable.mjs` precedent, where
   `HOLDS`/`DIRTY`/`BUSY` deliberately share an exit code while naming three different owed acts):

   | Word | Meaning | Exit |
   |---|---|---|
   | `KNOWN-RED` | this spec has ≥1 red in the inventory — rows printed | 0 |
   | `CLEAN-IN-INVENTORY` | the spec **was run** by the inventory and had no failures | 0 |
   | `NOT-IN-INVENTORY` | the spec does not appear at all — **this is not a clearance**, it means "control-run it" | 1 |

   With `--title`, the same three words apply to that single test.

3. **Print the denominator you looked at.** One header line naming the inventory file, the total rows parsed,
   and the inventory's own recorded totals (`Total tests run` / `Total failed`) lifted from its header. A
   lookup that cannot say how much it read is a lookup nobody should trust (the `art-staging-audit` lesson:
   that instrument shipped a false zero **twice** because its headline was narrower than the question above
   it).

4. **Mark the coordinate as historical.** Every printed row shows the recorded `file:line` followed by a
   literal `(recorded at inventory run — may have rotted)`. Do **not** delete the column and do **not** try
   to re-resolve it against the current file; the line is still useful once the title has found the row.
   Print the bucket string **verbatim**, including hand-added annotations like the s1297 flake rate — those
   annotations are the most valuable content in the file and must survive the round trip uncut.

5. **`scripts/red-inventory-lookup.test.mjs`**, wired into `test:node-guards`. It runs against small
   **fixture** inventories it writes to a temp dir (never against the live 136 KB file, and never modifying
   it). It must assert, at minimum:
   - **the load-bearing case:** a fixture row whose title matches but whose `file:line` differs from the
     query is still found → `KNOWN-RED`. *This is the negative-control-shaped assertion that proves the tool
     does the one thing it exists for; if it can pass without this, the test is decoration.*
   - **the inverse:** a fixture row whose `file:line` matches but whose title differs is **not** reported for
     that title.
   - `CLEAN-IN-INVENTORY` and `NOT-IN-INVENTORY` are distinguished, and `NOT-IN-INVENTORY` exits 1.
   - the bucket string survives verbatim, including a comma-and-parenthesis-heavy annotation like
     `~25%: 3/12 desktop, 3/12 mobile — measured s1297 (F-1297-1)` — markdown tables use `|` as a delimiter,
     so prove your parser does not eat or split annotation text.
   - a malformed/absent inventory file fails **loudly**, never as a silent zero.

6. **Do not regenerate, edit, sort or "re-base" `logs/suite-red-inventory.md`.** Read-only. Re-running it
   takes hours and the coordinates would rot again on the next merge — that is the disease, not the cure.

## Firewall

**TOUCH-ONLY:** `scripts/red-inventory-lookup.mjs` (new) · `scripts/red-inventory-lookup.test.mjs` (new) ·
`package.json` (only if `test:node-guards` needs the new leaf added — nothing else in the file).

**NO:** `logs/suite-red-inventory.md` · `logs/suite-red-inventory-compact.json` ·
`scripts/suite-red-inventory.mjs` (read it, do not edit it) · any `e2e/**` · any `src/**` · `.claude/**` ·
`tasks/**` · `CLAUDE.md` · `STATUS.md` · `playwright.config.ts` · no test may be deleted, skipped, retitled
or have its assertions weakened anywhere in the repo.

Reporting an adjacent problem you cannot fix inside this firewall is **correct and wanted**. Fixing it is a
violation.

## Self-check before you report

1. `npx tsc --noEmit` clean · `npm run build` green.
2. `npm run test:node-guards` — green, and **name the new leaf's test count** in your report.
3. **Non-vacuity, demonstrated not asserted** — run the real lookup and paste the output:
   ```
   node scripts/red-inventory-lookup.mjs e2e/world-info-notes.spec.ts
   node scripts/red-inventory-lookup.mjs e2e/restore-validation.spec.ts --title "page-load restore materializes run-manager state after manager assignment"
   ```
   The first must return **`KNOWN-RED`** with the three known reds *and their blast radius percentages*; the
   second must surface the **s1297 `~25%` annotation verbatim**. Then paste, in the same report:
   ```
   grep -c "world-info-notes.spec.ts:196" logs/suite-red-inventory.md
   ```
   which is **0**. Those two outputs side by side are the acceptance evidence: the coordinate finds nothing,
   the title finds everything.
4. **Manufacture the failure of your own guard** (a passing test never executes its violation path, so its
   green is not evidence about the red): break the lookup so it keys on `file:line` instead of the title,
   show `test:node-guards` goes **rc=1** naming the load-bearing assertion, then revert and confirm the file
   is **byte-identical** (report the hash both times).
5. `git status` shows only the TOUCH-ONLY paths.

## Report

End with **READY-FOR-GATES** and report: the three lookup outputs from §3 and the `grep -c` zero beside them ·
the manufactured-red rc=1 and the byte-identical revert hashes · the new leaf's test count and the
`test:node-guards` total · anything you found in `scripts/suite-red-inventory.mjs` that makes the markdown a
worse parse target than the compact JSON (if the JSON is genuinely better, **say so and keep the markdown
parser anyway** — the hand-added annotations exist only in the markdown, and losing them would defeat the
task) · any adjacent problem you left alone.
