# Review — harness-receipts (HarnessDev rung A)

- **Slice:** `tasks/harness-receipts.md` (lane-b, fire-authored ladder rung A)
- **Branch / tip:** `lane/b` @ `b3902ea57d7cb3136cc36fd9a1786d13fbab402e` (`runner(lane-b): harness-receipts.md`)
- **Gated commit:** `2d05839f4704c84029aecfff7ac163df46afb478` (detached worktree `gate-s2469`, §3.0b)
- **Merge hash:** `b1a5be3840d5fa87fba43c309062f82338a9ccc8`
- **Drained by:** s2469, 2026-09-03
- **VERDICT: MERGED.**

## What it does

A county standing has always declared its rider as strings — `"codex 0.x"`, `"claude-fable-5 / charter v3"`. Nothing proved *which* charter, notebook generation or controller code actually rode, so when a rig's standing moved nobody could say whether the model, the charter or the notebook moved. This is the HarnessDev paper's cleanest methodological point (arXiv:2609.01437): the harness must be a frozen, inspectable artifact per result.

This slice adds the rider-side receipt beside the engine-side pin, and nothing else:

- `src/agent/DeclaredStack.ts` gains two optional fields — `harnessDigest` (a content hash) and `harnessRef` (the almanac commit or HTTPS URL that froze the inputs) — plus `computeHarnessDigest()` and `assembleSelfDeclaredStack()`. The recipe is `lowercase hex SHA-256(UTF-8(JSON.stringify([charterText, notebookGenerationHeader, controllerVersion])))`, with the three entries exact strings in fixed order.
- `scripts/gr-sim.mjs` assembles the stack through that helper, reads `GR_HARNESS_CHARTER_TEXT` / `GR_HARNESS_NOTEBOOK_HEADER` from the environment, and gains one `--harness-ref` flag.
- `functions/api/standings.ts` accepts, shape-validates and stores both fields, and returns them on the board and in the stack cell.
- `site/assay-office.js` renders `harness <first 8 chars>` under the rider's stack line.
- `public/skill.md` documents the recipe and the law: **a standing without a digest is lawful but unfrozen.**

**Ranking is untouched.** `SCORE_KEYS` and `compareScores` are not in the diff; both fields are optional, and rows without them stay valid and rank unchanged. The receipt is attribution only.

## Evidence (all on the merged tree, in `gate-s2469`)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0, 5.4 s |
| `npm run build` | rc=0, 35.6 s |
| `npm run test:stats` | rc=0, 13.1 s — 87 + **207** + **207** + 19 checks |
| e2e `reel-deep-links` + `lb-01-county-standings` + `en-01-claim-ledger` + `skillmd-door` | rc=0, **38 passed**, desktop **and** 390px mobile, `--workers=1` |
| `npm run test:node-guards` (run **ALONE**) | rc=0, **1682.4 s**, **610 tests / 605 pass / 0 fail / 5 skipped** |

Zero console/page errors are asserted **in-spec**: the landing test collects page errors and asserts `errors` is empty.

**Suite-ran assertion (not merely suite-passed).** Per s2468's method note, `playwright --list` over the same four files reports `Total: 38 tests in 4 files`, matching the 38 that passed — so every named suite genuinely ran rather than being silently skipped.

**Check-count corroboration of the merge resolution.** The runner reported `test:stats` at 87 + **204** + **204** + 19. The merged tree reads **207**/**207**. The +3 per storage path is exactly main's `cost-column` assertion set surviving alongside the lane's new digest assertions — the union kept both sides' *content*, not just both sides' lines.

**Player visibility (Mistake #10).** The rider cell renders at a plain landing URL with no `?debug`. The e2e asserts **both directions**: a row carrying a digest shows `harness deadbeef`, and a row without one does **not** contain `harness `.

## Merge classification

Base `f23b298af`; 10 lane files, all **LANE-TOUCHED**. Four files conflicted against s2468's `cost-column`, which had moved the same surfaces hours earlier — every conflict purely additive, resolved as **UNION**:

| File | Resolution |
|---|---|
| `public/skill.md` | both paragraphs kept (cost paragraph, then receipt paragraph) |
| `scripts/skillmd-guard.test.mjs` | both law constants and both tests kept |
| `scripts/test-standings.mjs` | both assertion blocks kept |
| `tasks/BACKLOG.md` | one row, both ladder annotations (A from lane, C from main) |

Main then moved **during** the 28-minute battery (attended landed `e9848b7a9` transfer-board and `75d4bbeeb` two masters — `specs/` and `tasks/` only). Rather than re-resolve, main was merged **into the gated commit**, and the code surface was proven byte-identical: `git diff 2d05839f4 HEAD -- src functions site scripts e2e public assets` is **EMPTY**. Main was then fast-forwarded, so what shipped is byte-identical to what was measured.

## Findings

**F-2469-1 — my own union resolver broke a file, and the content check passed anyway. (CURED IN THIS DRAIN.)**
The conflict hunk in `scripts/skillmd-guard.test.mjs` **straddled a syntactic boundary**: HEAD's side opened `test(...) {` and closed nowhere, lane's side opened its own `test(...) {` and carried the single `});`. A blind keep-both union therefore produced a nested, unterminated `test(` — `SyntaxError: Unexpected end of input`. My presence check passed, because **both sides' strings really were present**; only the *structure* was wrong. Caught by running the guard file directly (`rc=1`, 0 `not ok` lines, no summary block — the shape of a file that will not parse, not of a test that failed). Cured by closing the first test before the second; the file now reads 10/10.
*Reusable:* "both sides kept" is a claim about **content**, and a union resolver is a claim about **structure**. When a hunk's two sides are not both complete syntactic units, verify by **parsing**, never by grepping for each side's strings — and note that a broken test file reds with an *empty* failure list, which reads nothing like a failing assertion.

**F-2469-2 — `test:node-guards` is 1682.4 s, 3.2× the figure `scripts/fire.md` cites. (LAW-SURFACE CORRECTION OWED.)**
The law's §3 clause cites **529.8 s** (F-2166-2, s2166) and calls it a floor. Measured s2469 on the merged tree, run **ALONE**, fire shell, node v26.4.0, load avg ~7: **1682.4 s / 610 tests**. The sequence is now 181 → 284 → 363 → 424 → 472 → 503 → **610** tests and 55.6 → 181.3 → 280.9 → 404.7 → 529.8 → **1682.4** s.
*Priced honestly:* the battery did not get **slower**, it got **bigger and deeper** — cost per test rose 1.05 s → 2.76 s, which is `gr-sim.test.mjs` growing cross-engine contract replays (each `gr-sim --overtime` ride is minutes of real simulation). This is a healthy battery and must **never** be pruned to make a cited number true.
*Why it earns a finding:* this battery is the mandated last act of ledger-writing fires and a drain gate for every sim-touching slice. A fire budgeting off "529.8 s" under-budgets by **~19 minutes** — long enough to look like the F-2428-1 hang and provoke a wrong diagnosis. I nearly made that call myself and was corrected only by a `ps` showing `gr-sim` at 99.9% CPU.
*Owed:* restate the figure in `scripts/fire.md` §3. Cite it as a **band** (`~28 min alone, quiet`), not a point estimate, per F-2452-1.

**F-2469-3 — a lawful pre-flight STOP is sitting on the board wearing a real drain's filename. (NON-BLOCKING; renamed this fire.)**
`self-unified-grid` dispatched into lane-d at 11:21 while lane-d held undrained `refusal-taxonomy` work. The runner **correctly STOPPED** — *"Resetting would destroy undrained work across nine files. I made no changes"* — which is Mistake #2 prevented exactly as the lane-safety law intends. But its done-move landed **bare-dated**, so `dry-board-probe` classifies it as a REAL DRAIN, and would have done so forever. Renamed `stopped-s2469-lane-safety-preflight-…`; the master survives at `tasks/self-unified-grid.md` and is re-queueable once lane-d is drained.

## Not done here (deliberately)

Scope item 4 — the `PROTOCOL.md` freeze rule — is **docs in the gauntlet repo**, and the master explicitly forbids pushing there. The runner's proposed paragraph is carried verbatim for an attended session to land in the commons:

> Before submitting a standing, commit the exact charter and the notebook generation that rode in the almanac. Compute `harnessDigest` from the exact charter text, notebook generation header, and controller version using the county recipe, and submit `harnessRef` as that almanac commit. A standing without these papers remains lawful but unfrozen; neither field changes ranking.

## Drain duty discharged — engine pin

`src/` is inside `ENGINE_SOURCE_INPUTS`, so `src/agent/DeclaredStack.ts` re-hashes the engine identity. **Measured, not assumed:** main read `ac138d0f…` (matching the registry), the merged tree read `8ccbfe16…`. Pin appended to `assets/engine-era.json`, **era 5 unchanged**, pins **13 → 14**, cause recorded. The registry is out-of-corpus, verified: re-computing after the edit still yields `8ccbfe16…`, so the pin is not self-referential. The runner predicted this duty and correctly refused it as outside its firewall.
