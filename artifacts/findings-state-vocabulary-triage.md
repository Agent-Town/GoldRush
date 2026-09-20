# Findings-state vocabulary triage

## Population

Probe: `node logs/session-scratch/s1259/findings-double-state.mjs` on `main` at
`92c5a235`.

- Current headline: **427 declarations · `🟡` 22 · broad 34 · unmarked 23**.
- s1260 headline: **429 · 22 · 34 · 23**. Only the declaration total drifted
  (`-2`), which this task explicitly allows.
- All 23 named F-IDs were found in `tasks/BACKLOG.md`.
- The current probe reports the same 23 unmarked candidates and no new ones.

Verdict totals: **(a) 14 · (b) 2 · (c) 3 · (d) 0 · (e) 4 = 23**.

## Scope 1b — F-1260-2 prediction

| Predicted artefact | Result | Why |
|---|---|---|
| F-1032-1 | **CONFIRMED (e)** | The `📋` row says it was “opened s1032 by the drain above”; it is a retained origin/workflow row, not a present open-state declaration. The actual corrective is merged at `46f31b9e`. |
| F-1068-5 | **REFUTED (b)** | The `🧾` row explicitly says **“not fixed”** and “left to attended deliberately”; it does not declare closure in vocabulary the probe missed. The immediately following row closes it at `150fa9b7`, so the first row is lawful retained history. |
| F-1104-1 | **CONFIRMED (e)** | The alleged open line begins `🟢` and says **“IS DRAINED (`7f066ecc`)”**. `🟢`/`DRAINED` are closure vocabulary absent from `CLOSED_RE`. |
| F-1179-3 | **CONFIRMED (e)** | The alleged open line says **“DRAINED as a lawful STOP”** at `556f0789 (archive: pruned by the A3 rewrite)`. The later answer is a second lawful STOP, and leaf `factory-cp04-charter-name-composition` is `superseded`. |
| F-1252-1 | **REFUTED (c)** | The `🔺` row is a live owner-scope question: whether the citation ratchet should cover Markdown outside `tasks/`. `scripts/citation-title-guard.mjs` still scans `tasks/**/*.md` only and reports outside citations as `NOT GATED`; the closure at `cb9a757c` fixed the empty-subject bug, not this scope question. |

The probe also invents **F-1045-1**: its alleged `🚨` open row says the ART-slot
gates are **“NOW ACTUALLY IN THE LAW FILE”**. That is a completion declaration
whose verb phrase is absent from `CLOSED_RE`, confirmed at
`scripts/fire.md`’s `ART-SLOT LAW`.

## Candidate classifications

Line numbers refer to the current `tasks/BACKLOG.md`.

| F-ID | Closed declaration | Probe “open” declaration and glyph | Verdict | Code or leaf evidence |
|---|---|---|---|---|
| F-1026-1 | L1215: “CLOSED — asset-diet gate now measures what it claims” | L1189 `(none)`: “pin `asset-diet.spec.ts` to the production bundle” | **(a) STALE** | Main merge `386cce80`; `e2e/asset-diet.spec.ts:15` gates on `GR_ASSET_DIET_BUNDLE`, and `package.json:12` runs the preview-backed suite. |
| F-1026-5 | L1209 half-closed; L1249 fully closed | L1195 `⚠️`: two red M1/M2 resource guards | **(a) STALE** | M1 cure `bebc1b1f`; M2 cure `1ee47bbd`. `src/game/Game.ts:warmVfx` warms the late uploads, and `e2e/m2-01-build-menu.spec.ts:340` now reaches the unchanged 200-call assertion. |
| F-1032-1 | L1220: shipped `46f31b9e` | L1237 `📋`: “opened s1032 by the drain above” | **(e) INSTRUMENT ARTEFACT** | Merge `46f31b9e`; the row self-identifies as a retained origin row rather than a current state claim. Current negative-resource guards install a 10,000-entry timing buffer (`mu-02`, `mu-03`, `e5-water-spike`). |
| F-1039-2 | L1316 closure; L1907 class closure | L1236/L1294 `🧭`: hand-computed future stamps | **(a) STALE** | Main commit `6a12b69c`; permanent `scripts/status-line1.mjs` substitutes `{STAMP}` and rejects future timestamps. |
| F-1045-1 | L1230: exposure closed/process gap open | L1317 `🚨`: gates “NOW ACTUALLY IN THE LAW FILE” | **(e) INSTRUMENT ARTEFACT** | Main commit `30e39698`; `scripts/fire.md` contains the ART-slot audit/refill law and calls `scripts/art-staging-audit.mjs`. The alleged open line is itself the completion row. |
| F-1047-1 | L1299: shipped `dca123b6` | L1292 `⚠️`: asset-diet command skips every assertion | **(a) STALE** | Merge `dca123b6`; `package.json:12` sets `GR_ASSET_DIET_BUNDLE=1`, and `scripts/deploy.sh:61` invokes the real budget leg. |
| F-1068-5 | L1356: closed at `150fa9b7` | L1355 `🧾`: “not fixed … left to attended deliberately” | **(b) LAWFUL** | `tasks/goals.json` now gives `e9-art` and `e10-art` real 40-character merge hashes. The first row was true for three minutes and is retained beside its explicit closure. |
| F-1104-1 | L1648: rider closed at `2fd1390c` | L1634 `🟢`: “IS DRAINED (`7f066ecc`)” | **(e) INSTRUMENT ARTEFACT** | Both hashes are ancestors of main. `src/encyclopedia/reader.ts:trapLedgerFocus` and `state.ts:readStoredDiscoveryValues` retain the cures; the line’s glyph and verb both mean closed. |
| F-1126-1 | L1735: corroborated after the first partial cure | L1731 `🔴`: seven non-browser guards had no callers | **(a) STALE** | Main merge `594e9180` added `npm run test:guards`; current `scripts/run-guards.mjs:43-49` calls all seven, and the drain skill now selects the required subset from the diff. |
| F-1126-2 | L1759: factual half re-verified | L1736 `🟡`: `test:release` and `test:asset-diet` had no callers | **(c) GENUINELY OPEN** | Partial closure: `test:asset-diet` is now called by `scripts/deploy.sh:61`, but `scripts/gate-caller-baseline.json` still records `npm:test:release` as **NO CALLER**. |
| F-1167-4 | L293: discharged at `c14a19ef` | L292 `🔻`: reducer resolves paths from `process.cwd()` | **(a) STALE** | Merge/leaf `c14a19ef`; `scripts/suite-red-inventory.mjs:65` resolves absolute paths against the raw’s `runRoot`, not the invoking cwd. |
| F-1168-1 | L300: cured and drained | L1291 `🔴`: external-server flag falsely runs bundle-only tests | **(a) STALE** | Main merge `45124d00`; `GR_ASSET_DIET_BUNDLE` now owns the bundle-only duty while `GR_CAPTURE_EXTERNAL_SERVER` owns server reuse. |
| F-1170-2 | L284: first owner-fork framing struck | L281 `✍️`: stale prompt specs need build-mode realignment | **(a) STALE** | Leaf `factory-build-mode-prompt-realign` is `merged` at `46d6308c…`. `e2e/bt-00-demolish.spec.ts:119-123` proves the ratified contract: hidden outside build mode, visible after enabling it. |
| F-1173-3 | L271: discharged at `0fae52bd…` | L267 `🔻`: `run-guards.mjs` had no test; L269 `✍️` is its ACTIONED row | **(a) STALE** | Leaf `factory-run-guards-test-coverage` is `merged`; `scripts/run-guards.test.mjs` black-box tests exit propagation, signals, filters, and changed-file routing. |
| F-1173-7 | L220: three of four registered; fourth refused | L222 `🔻`: four pending gates lacked leaves | **(c) GENUINELY OPEN** | Partial closure remains by design: three named gates now have `blocked`/`shipped`/`superseded` leaves, while `058b-adjacent-reds-fingerprint.md` still has no leaf because the guard has no honest `attended-only` state (F-1174-1). |
| F-1179-3 | L157: answered by lawful STOP `c2d1b690 (archive: pruned by the A3 rewrite)` | L153 `🔑`: “DRAINED as a lawful STOP” at `556f0789 (archive: pruned by the A3 rewrite)`; L169 is an AUTHORED row | **(e) INSTRUMENT ARTEFACT** | Leaf `factory-cp04-charter-name-composition` is `superseded`; both rows are workflow/STOP receipts, not simultaneous open work. |
| F-1198-2 | L229: shipped `1e351130…` | L227 `🔺`: inventory differs across checkouts; L257 `⚙️` is its authored row | **(a) STALE** | Leaf `factory-suite-red-inventory-run-tree-invariance` is `merged` at `1e351130…`; `suite-red-inventory.mjs` uses `config.rootDir`/`runRoot`. |
| F-1200-3 | L233: shipped `731b3582…` | L255 `🔻`: absolute-path guard passed its named mutation | **(a) STALE** | Merge `731b3582`; `scripts/suite-red-inventory.test.mjs` now asserts the absolute “Failing file:line” path and rejects leaked fixture roots. |
| F-1201-1 | L235: true half shipped at `46d4931e…` | L251 `🔻`: **“NO REPAIR NEEDED”**, the report doubled a correct regex | **(b) LAWFUL** | Source still uses the correct `/Total: [1-9]\d* tests/`; `46d4931e…` separately fixed the real cwd-invariance defect. This row is a retained refutation, not open work. |
| F-1202-1 | L237: shipped `df3e051c…` | L241 `🚨`: collection capture truncates under load | **(a) STALE** | Leaf `factory-collection-guards-spawnsync-truncation` is `merged`; both collection guards use `spawn` with file-backed stdout/stderr and read after `close`. |
| F-1210-5 | L1888: cured at `feb0a3d7…` | L1909 `🚨`: welcome blocks release suite board click | **(a) STALE** | Leaf `gg-01b-welcome-release-gate` is `merged`; `e2e/release-build.spec.ts:48` clicks `town-welcome-skip` before approaching the Tavern. |
| F-1252-1 | L107: empty-subject defect fixed at `cb9a757c` | L109 `🔺`: owner question over 853 out-of-scope citations | **(c) GENUINELY OPEN** | `scripts/citation-title-guard.mjs` still builds its gated set from tracked `tasks/**/*.md` and prints Markdown outside `tasks/` as `NOT GATED`. Closure was only of the empty-subject half. |
| F-1256-2 | L28: closed by execution at the GG-03e drain | L48 `🚨`: warning that the GG-03e master used a false absence probe | **(a) STALE** | Merge `8133dd91`; `src/news/heraldReader.ts:16-23` maps all eight engravings, including `ceremony`, and `scripts/asset-diet.mjs` still enforces the same ceilings. |

## Widening cost and vocabulary verdict

After removing the four instrument artefacts:

- **True positives:** `(a) + (c) = 14 + 3 = 17`.
- **False positives:** `(b) = 2`.
- **Undetermined:** `0`.

A rule can be overfit to these 23 rows: count `(none)`, `⚠️`, `🧭`, `🚨`,
`🔴`, `🟡`, `🔻`, `✍️`, and `🔺` as potentially open; treat leading `🟢`,
`DRAINED`, `LAWFUL STOP`, “opened … by the drain above”, “NOW ACTUALLY IN THE
LAW FILE”, and “NO REPAIR NEEDED” as closed/neutral; exclude the `🧾` receipt
row. That produces **17 true positives and 0 false positives on this sample**.

It is **not a clean rule for this file**:

1. Glyphs are not states. `🚨` is used for both live defects and completion;
   `🔻` is used for live defects, stale defects, and a no-repair refutation;
   `✍️`/`⚙️` are usually workflow receipts but can share an F-ID with a real
   open finding.
2. Closure is free prose, not a verb vocabulary. The missed closures include
   `DRAINED`, a glyph (`🟢`), `LAWFUL STOP`, “opened … by the drain above”, and
   “NOW ACTUALLY IN THE LAW FILE”.
3. Some lawful history has no closure verb on its own line (`F-1068-5`);
   closure is expressed by the adjacent later row.
4. One F-ID can intentionally name a fixed implementation half and a still-open
   policy half (`F-1252-1`).

Therefore **no open-glyph + closure-verb rule exists under the current ledger
conventions that is both file-wide defensible and demonstrated to retain the
17 true positives while guaranteeing zero false positives**. The maximal rule
above is a 23-row phrase lookup, not a guard vocabulary.

The next rung needs an attended ledger convention first: one canonical leading
state token (`OPEN`, `CLOSED`, `WORKFLOW`, `RETAINED`) on every declaration,
with mixed-scope IDs split into separate IDs. Until then, keep the shipped guard
narrow and use this table for the 14 safe strikes and three genuinely-open
follow-ups.
