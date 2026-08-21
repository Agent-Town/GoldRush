# Task f2147-2-battery-manifest: the guard battery's tally becomes a NAME LIST, so a count delta is finally attributable (LANE-B, commit prefix "chore:")

**FIRE-AUTHORED (attended review welcome)** — s2150, 2026-08-22, on a verified-dry board (§2E authoring arm).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST:
- `AGENTS.md`.
- `tasks/BACKLOG.md`, the **F-2147-2** clause — grep it by content, it is one line: `grep -Fc "no fire banks the per-test name list" tasks/BACKLOG.md` must return **1**, and `grep -Fc "a tally cannot be diffed" tasks/BACKLOG.md` must return **1**. If either returns 0 your lane is stale — **STOP and report "stale lane"**, do not proceed and do not refresh it yourself.
- `package.json` — the `test:node-guards` and `test:ledger-guards` script definitions (`grep -Fc "test:node-guards" package.json` → **1**). These name the batteries this task instruments; you will root a new guard into one of them.
- `scripts/gate-caller-audit.mjs` — the audit that reds an un-rooted gate script. Your new `.test.mjs` MUST be rooted in the same commit that adds it.
- Any two existing `scripts/*.test.mjs` files of your choosing, to match house test idiom (`node --test`, `assert`, fixtures under a temp dir that the test REMOVES — `fixture-teardown` asserts every fixture owner cleans up).

## Why (evidence, quoted and dated)

**F-2147-2 (s2147, 2026-08-22), verbatim:** *"my 490 tests against s2146's **492** is **−2, and I cannot attribute it.** Both runs are `0 fail`/`5 skipped` on the same battery at commits 5 apart, so nothing is broken; but F-2146-4 has just taught that a battery's *count* is not a fingerprint, and the reason nobody can ever settle such a delta is that **no fire banks the per-test name list** — only the tally reaches the ledger, and **a tally cannot be diffed**. I declined to invent a cause. **A future fire that wants this answerable should bank the `✔`-line names alongside the tally**; until then, treat count deltas as uninformative and read only `fail`."*

That is a written disposition naming its own cure, with no owner word owed, no design fork and no canon question. Its sibling **F-2146-4 (s2146)** is why it matters: a runner reported `471 pass, 7 fail, 1 cancelled` and the same battery run ALONE returned `486 pass / 1 fail / 0 cancelled` — **six of seven reds evaporated with no code change.** Counts move with load; names do not. The battery has also grown `284 → 363 → 424 → 472 → 490/492` tests (F-2099-1, F-2146-4), so deltas are now routine and will keep arriving.

**Premise verified on main at s2150 before authoring:** no manifest, name list, or per-test bank exists anywhere — `logs/suite-runs/` holds only `calib-w*.log` playwright calibration logs, and no script parses battery test names.

## Scope (each item is checkable)

1. **`scripts/battery-manifest.mjs` — a PARSER, not a runner.** It reads a `node --test` output stream and emits a manifest. It **MUST NOT invoke the battery itself** — a probe that runs the real command inherits the real command's cost and its flakiness, and this one would cost ~8–9 minutes per invocation. Accept input two ways only: `--from-log <path>` and stdin. Emit JSON: every test as a stable `{file, name, status}` record (`pass`/`fail`/`skip`), sorted deterministically (by `file` then `name`), plus a `totals` block (`tests`, `pass`, `fail`, `skipped`, `cancelled`). **Determinism is the whole product** — the same log must produce a byte-identical manifest twice; prove it in the report with two runs and a `sha256` of each.
2. **`--diff <a.json> <b.json>` — the mode that answers F-2147-2.** Print tests **ADDED** in b, **REMOVED** from b, and **STATUS-CHANGED**, each by full `file :: name`. Then state whether the name-level delta **accounts for** the `totals.tests` delta, and say so explicitly when it does not (that residue is the interesting case — it means a file failed to collect, the F-2143-3 shape, where a suite goes EMPTY rather than red and every gate behind it passes by running nothing). Exit 0 in every state: **this is an INSTRUMENT, not a gate** — the `drain-block-check` advisory-default precedent. Do not add a `--strict` that reds a board on a count change.
3. **`scripts/battery-manifest.test.mjs` — proven by MANUFACTURING the defect, never by watching a green pass.** A passing guard never executes its violation path (the s1299/s1300 standard). Ship fixture logs under a temp dir the test removes, and assert at minimum: (a) two manifests differing by exactly two named tests → `--diff` names **both**, and the residue line reads "accounted for"; (b) identical inputs → empty diff; (c) a log where a file collected **zero** tests → the residue is reported as UNACCOUNTED, not silently swallowed; (d) a status flip `pass → fail` with an unchanged tally → reported as STATUS-CHANGED (the delta a tally is structurally blind to). **Paste the red you manufactured for at least (a) and (c) — a scratch-copy mutation that makes each assertion fail — alongside the restored green.**
4. **Root it in the same commit.** Add the new `.test.mjs` to **`test:node-guards`** in `package.json` (that is where the sibling `scripts/*.test.mjs` guards live — `canyon-terminal-probe-binding.test.mjs` and `same-game-report-guard.test.mjs` are the precedent). Then run `node scripts/gate-caller-audit.mjs` and paste its PASS with `unrouted 0`. An un-rooted gate reds the audit under an innocent name.
5. **Bank ONE real baseline manifest.** Run `npm run test:node-guards` **ALONE** — nothing else concurrent, per §3.1 and the s1536 contamination — capture its full output to a log, and commit both the log and the generated manifest under `artifacts/battery-manifest/` (`<ISO-stamp>-node-guards.log` + `.json`). **Budget ≥9 minutes** (the sequence is `55.6 → 181.3 → 280.9 → 404.7 → 493.4 s` and only ever rises). Report the totals and compare them to the two banked readings: **s2147 = 490 tests / 485 pass / 0 fail / 5 skipped**, **s2146 = 492 / 486 / 1 / 5**. If your number matches neither, that is a RESULT, not a problem — your manifest is precisely the artifact that makes it investigable, so say which names differ if you can.

## Firewall

TOUCH ONLY: `scripts/battery-manifest.mjs` (new) · `scripts/battery-manifest.test.mjs` (new) · `package.json` (the ONE script-rooting line) · `artifacts/battery-manifest/**` (new, the banked baseline).

NO changes to: **`src/**` entirely** (this task has no sim, render or gameplay surface — if you believe it needs one, STOP and report) · any **existing** `scripts/*.test.mjs` or `scripts/*.mjs` · `e2e/**` · `tasks/**`, `specs/**`, `reviews/*.md`, `docs/**` · `playwright.config.ts` (its `workers: isFireShell` line is law-bearing — F-1270-3) · **any pinned constant in `scripts/gr-sim.test.mjs`**. ⚠️ **If the battery reds, FINGERPRINT it against main and REPORT — never re-pin, and never regenerate a bench report to make a red go away** (F-1441-3; F-2146-1's standing prohibition on `docs/bench/same-game-audit.md`). A red you did not cause is evidence, not a chore.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate (Mistake #1).

## Self-check (evidence, not vibes)

`npx tsc --noEmit` rc 0 · `npm run build` rc 0. The new guard green, **with its manufactured reds pasted**. `node scripts/gate-caller-audit.mjs` PASS, `unrouted 0`. `npm run test:node-guards` run **ALONE**, full tally reported, log + manifest banked. `npm run test:ledger-guards` green as your LAST act (you touch `package.json`, a gate-topology surface — the s1301 duty). Determinism proof: two parses of the same log, two `sha256`, identical. **No e2e, no screenshots and no perf table are owed** — the diff contains no `src/**` and no render surface, so the plain-boot answer to "where does the PLAYER see this?" is *nowhere*; say so explicitly rather than leaving it unanswered (Mistake #10 inverted).

End: **READY-FOR-GATES** + report: the manifest totals vs s2147's 490 and s2146's 492 · the two manufactured reds and their restored greens · the `--diff` demo output on your fixtures · the determinism `sha256` pair · `gate-caller-audit` line · anything in the battery you had to fingerprint rather than fix.
