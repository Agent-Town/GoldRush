# Review — `findings-state-vocabulary-triage` (F-1259-1's rung, attempt 2)

- **Slice:** `lane-b-findings-state-vocabulary-triage.md` — diagnosis-only: classify the double-state candidates the merged findings-state guard's `🟡`-only vocabulary cannot see, and measure what widening would cost.
- **Branch / tip:** `lane/m4` @ `d50e2887` (`runner(lane-b)`, auto-committed 15:35).
- **Base:** main @ `65e0de4e`.
- **Drained:** s1260 fire, 2026-07-30. **Merge `637e156e7acae8a2fa012b15f6366c6c1e400151`.**
- **Verdict:** **ACCEPT — merged.** Scope met in full, and the run **refuted the drain-fire's own prediction on two of five candidates, correctly.**

## Attempt history (this matters — it is why the slice succeeded)

**Attempt 1 (`20260730-150612`) STOPPED lawfully at scope 1 with no artifact**, ~3 min, 85,129 tokens: s1259 had pinned the gate to four scalars measured at `bd1889ff`, *before its own edits landed*, then struck three findings and wrote three new ones in `7acdaf07` four minutes before authoring. **F-1260-1** traces all four drifts to that one commit. Attempt 2 is a legitimate second attempt under `CLAUDE.md` §7.5 — **changed premise**: refreshed baseline, explicitly NAMED population, and a gate that STOPs only if a named F-ID cannot be located. It ran 208,630 tokens and delivered.

**The redesign was vindicated in flight.** The runner picks queue files off the filesystem, so it started at 15:25:16 against main `65e0de4e` — two minutes *before* my findings commit `0f248147` landed. It therefore measured **427 declarations** where my master said **429**, and did exactly what the new scope 1 instructs: **noted the −2 and carried on** (`report.md:8-10`). Under attempt 1's design that drift was the whole failure mode.

## What it does

`artifacts/findings-state-vocabulary-triage.md` (+98 lines, the only file) carries one row per candidate — F-ID, closed declaration with line, the probe's alleged open declaration with glyph, verdict, and **hash / leaf / file:symbol evidence for every single verdict**. Verdict totals: **(a) STALE 14 · (b) LAWFUL 2 · (c) GENUINELY OPEN 3 · (d) UNDETERMINED 0 · (e) INSTRUMENT ARTEFACT 4 = 23.**

## Evidence

| Gate | Result |
|---|---|
| Scope 1 — population located | **All 23 named F-IDs found; none missing, none new.** No STOP condition met. |
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green, 1.20 s** |
| `scripts/findings-state-guard.mjs` | **PASS**, `double-state : 0` — subject unperturbed |
| `node --test scripts/findings-state-guard.test.mjs` | **fail 0** |
| `scripts/citation-title-guard.mjs` | **PASS** |
| Firewall | **ONE file, +98/−0.** Zero `src/`, zero `e2e/`, zero `tasks/`, zero `package.json`, guard and s1259 probe untouched. 3-dot and single-commit diffs agree — no contamination. |

**A report with no BACKLOG diff is compliance, not an omission** — the firewall forbade the ledger, and the table is what lets a later fire strike safely.

### Spot-verified rather than inherited

Three verdicts re-checked independently, all confirmed:
- **F-1126-2 (c)** — claims `gate-caller-baseline.json` still records `npm:test:release` as NO CALLER. ✓ Confirmed twice: by grep, and because **my own `gate-caller-audit` run earlier this fire printed that exact line**.
- **F-1201-1 (b)** — claims the correct `/Total: [1-9]\d* tests/` regex is still in source. ✓ Present at `scripts/town-spec-collection.test.mjs:46-47`.
- **Four cited leaves** — `factory-build-mode-prompt-realign` `merged e42ed4ef`, `factory-run-guards-test-coverage` `merged 4499e696`, `factory-cp04-charter-name-composition` `superseded`, `factory-suite-red-inventory-run-tree-invariance` `merged e968557a`. ✓ All exactly as claimed.

## Scope 4 — the measured answer is NO, and that was an allowed answer

Widening yields **17 true positives ((a)+(c)) against 2 false positives ((b))**. The run then reports that **no defensible open-glyph + closure-verb rule exists under current ledger conventions**, with four reasons I find sound: glyphs are not states (`🚨` marks both live defects and completions; `🔻` marks live defects, stale defects, *and* a no-repair refutation); closure is free prose, not a verb vocabulary; some lawful history carries no closure verb on its own line (`F-1068-5`); and one F-ID can intentionally hold a fixed half and an open half (`F-1252-1`). The maximal rule it found is "a 23-row phrase lookup, not a guard vocabulary" — **overfit, and it says so.**

➡️ **Its recommendation is therefore an attended/owner ledger-convention decision, not a parser change:** one canonical leading state token (`OPEN` / `CLOSED` / `WORKFLOW` / `RETAINED`) on every declaration, with mixed-scope IDs split. **Until then the shipped guard stays narrow — and that is now a measured ruling rather than a guess.** This is the master's explicitly-permitted "no such rule exists" outcome, and reaching it is a success.

## Findings

- 🔬 **F-1260-6 (s1260, MEASURED — THE DRAIN FIRE'S OWN PREDICTION INSTRUMENT HAD THE SAME DEFECT IT WAS ACCUSING, ONE LEVEL DOWN: IT COULD NOT READ NEGATION).** My scope-1b prediction named 5 artefacts. The run **confirmed 3** (`F-1032-1`, `F-1104-1`, `F-1179-3`), **refuted 2** (`F-1068-5`, `F-1252-1`), and **found a 6th I missed** (`F-1045-1`, whose open row reads *"NOW ACTUALLY IN THE LAW FILE"* — a completion phrase). ✓ **I re-ran my own regex on the two refuted lines and the cause is exact and singular:** it matched `FIXED` inside **"not fixed"** (`F-1068-5`) and **"DELIBERATELY NOT FIXED"** (`F-1252-1`). **A closure-word vocabulary with no negation handling reads a refusal as a closure.** So the family runs three deep — F-1259-1: the guard's *open* vocabulary too narrow · F-1260-2: the probe's *closed* vocabulary too narrow · **F-1260-6: my own closure vocabulary blind to negation.** ➡️ Recorded, not fixed: the correct remedy is the run's ledger-convention recommendation above, not a fourth regex. **The reason this was caught at all is that the master framed the prediction as falsifiable and declared refutation valuable** — an instrument that cannot disagree with its author finds nothing.
- 🔻 **F-1260-7 (s1260, informational — the report demonstrates the very thing it classifies as open).** Merging this file moved the citation guard's `NOT GATED` count **862 → 866**: its own `file:line` citations sit outside `tasks/**`, which is precisely the scope question **F-1252-1** the report classified **(c) GENUINELY OPEN** and which sits on the owner's desk. No action — but it is a live, self-demonstrating datum for that ruling.

## The three (c) GENUINELY OPEN candidates — the actionable residue

`F-1126-2` (`test:release` still uncalled) · `F-1173-7` (one of four gates still leafless because the guard has no honest `attended-only` state, per F-1174-1) · `F-1252-1` (the citation-ratchet scope question). **All three are already on the owner's desk or blocked on an owner ruling** — so this table produces no fire-authorable corrective, which is itself worth knowing before someone spends an authoring slot looking.

## Retention

Nothing deleted. The strike list for a later fire is the 14 **(a) STALE** rows in the merged table, each carrying its own hash or leaf proof.
