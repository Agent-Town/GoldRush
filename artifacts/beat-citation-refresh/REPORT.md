# Beat citation refresh

Base: `c0fc424a0e89e07674e0d8e2451c093188f18c38 (archive: pruned by the A3 rewrite)`

Result: all **nine** live stale citation occurrences in `src/story/beats.ts` were re-derived from the dispatch tree and corrected. The review prose says ten, but its live-line inventory and the authoring probe both contain nine.

## Pre-flight

- Dependencies `a1be5ada70b3430de29d7dcb0e4c106bcb3b2f26` and `8480f7624cad832e084c14137cdf7dd62bfb8319` are ancestors of the base.
- Tracked pre-existing dirt was confined to the allowed `logs/**` factory-churn class.
- Preserved expected untracked host/factory debris under `.claude/`, `artifacts/deploy-budget-production-probe/`, `logs/`, `tasks/queue-paused/`, plus `skills-lock.json`.
- `npm run build` passed before editing.

## Re-derived replacements

| Live line | Subject | Before | After |
| ---: | --- | --- | --- |
| 1145 | E5 table | `796-981` | `796-997` |
| 1146 | E6 table | `1004-1127` | `1020-1143` |
| 1148 | `e5-tavern-locomotive-argument` | `902-911` | `902-921` |
| 1150 | `e6-gazette-the-printing` | `1108-1117` | `1124-1133` |
| 1329 | E6 table | `1004-1127` | `1020-1143` |
| 1332 | `e6-tavern-wrangler-drinks-free` | `1098-1107` | `1114-1123` |
| 1840 | E8 table | `1341-1588` | `1357-1604` |
| 1843 | `e8-tavern-river-question` | `1477-1486` | `1493-1502` |
| 2130 | `e8-riverward-launch` | `1507-1515` | `1523-1531` |

Historical LANDED/RE-BASED accounts, all other comments, every non-comment token, and every player-visible string are unchanged.

## Verification

- Authoring probe before: nine stale occurrences; `--assert-fixed` exited 1 as required (`before.json`, `before-assert-fixed.txt`).
- Authoring probe after: zero stale occurrences; all nine subjects exact (`after.json`).
- Installed TypeScript parser/scanner token stream with trivia excluded: **9,182** token kind/text pairs byte-identical to base (`compare-tokens.mjs`, `token-line-invariance.json`). The parser-backed stream is necessary because this file contains template literals requiring contextual scanner rescans.
- Source line count: **2,280 before / 2,280 after**.
- `npx tsc --noEmit`: exit 0 (`tsc.txt`).
- `npm run build` after: exit 0 (`build-after.txt`).
- Scoped source diff: exactly nine comment-digit replacements (`source.diff`); scoped `git diff --check` passes (`diff-check.txt`).
- Logs are complete and each is below 5 MB.

No browser run, screenshot refresh, full simulation battery, or new runtime test was run; none is required for this comment-only task.

## Engine provenance

The existing `computeEngineHash` tool measures the edited tree as `64d634d4aaf285f04f0fead86724213cbded79e28cec6544d18efcd136485229` in era 5. It is not present in the current registry; the drain owns the required same-era pin/re-pin and this task did not edit `assets/engine-era.json` (`engine-provenance.json`).
