CODEX: model=gpt-5.6-sol effort=medium
# Task main-beat-citation-refresh: re-derive the nine stale live beat citations (MAIN, commit prefix "docs:")

FIRE-AUTHORED (attended review welcome), s2532, 2026-09-07.
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root on main. Leave the result uncommitted for the FIRE drain; do not switch branches.
READ FIRST: AGENTS.md; `reviews/portraits-era-aging-2-batch.md` finding F-AGE2-2; `specs/story-spine/README.md` Laws; STATUS.md verification lessons; `artifacts/s2532-fire/beat-citations-before.json`.
Sequencing: verify `ae0df5b060474c064f5b70300189dd57aed9da13` and `9b3da574e939fcbf8ca590eabfaf119c7a923a49` are ancestors of HEAD with `git merge-base --is-ancestor`. Missing dependency: STOP and report; never recreate it.

Pre-flight: `git status --short` must show no staged/modified TRACKED file OUTSIDE the two factory-churn classes below; if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris is expected; list briefly and proceed. **FACTORY-CHURN EXCEPTION (F-1407-1):** (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png` are expected factory accounting or generated evidence. List and preserve them; never reset, clean, or restore another run's output. Modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` still STOPs. Record the base hash. Run `npm run build` before editing. The main-slot claim remains valid if a FIRE takes its lock after this task was dispatched with line 1 clear.

## Why (F-AGE2-2, measured on main at 3a26525a4)

The attended review authorizes a comment-only correction after story-correctives moved the cited tables. Its prose says ten stale citations but lists nine live comment lines; all nine reproduce now. The authoring probe derives the actual ranges from the table and beat definitions, not a remembered offset. Historical LANDED/RE-BASED paragraphs describe past trees and are not current pointers.

| Comment line in `src/story/beats.ts` | Subject | Current citation | Measured definition |
| --- | --- | --- | --- |
| 1145 | E5 table | 796-981 | 796-997 |
| 1146 | E6 table | 1004-1127 | 1020-1143 |
| 1148 | e5-tavern-locomotive-argument | 902-911 | 902-921 |
| 1150 | e6-gazette-the-printing | 1108-1117 | 1124-1133 |
| 1329 | E6 table | 1004-1127 | 1020-1143 |
| 1332 | e6-tavern-wrangler-drinks-free | 1098-1107 | 1114-1123 |
| 1840 | E8 table | 1341-1588 | 1357-1604 |
| 1843 | e8-tavern-river-question | 1477-1486 | 1493-1502 |
| 2130 | e8-riverward-launch | 1507-1515 | 1523-1531 |

## Scope

1. Re-derive these live citations against the dispatch tree, then replace only the nine stale numeric ranges in their comments. Preserve the file's line count. Preserve historical rebasing accounts, all other comments, and every non-comment token and player-visible string. Do not append another historical account.
2. Save a short report and before/after evidence under `artifacts/beat-citation-refresh/`. Name the actual occurrence count and base. If the layout changed since authoring, locate the named symbols again; do not apply these coordinates blindly. Other defects are report-only.

## Firewall

Touch ONLY: the nine comment ranges in `src/story/beats.ts`; `artifacts/beat-citation-refresh/**`. NO changes to runtime behavior, beat data/copy/speakers, sim semantics, other source, existing tests/assertions, scripts, assets, engine-era registry, STATUS.md, specs, BACKLOG, goals, or attended/other-lane work. No new permanent guard, dependency, or framework. The drain owns any engine re-pin: a comment edit under src still changes the engine identity, even though runtime tokens are identical.

## Self-check (evidence, not vibes)

- Run `python3 artifacts/s2532-fire/verify-citations.py` before and after. On the authoring layout, `--assert-fixed` must fail before and pass after, with nine subjects enumerated. If dispatch moved the layout, adapt a copy in your own evidence directory after re-deriving its anchors. Inspect each live pointer and the cited definition by eye too.
- Compare the base and result using TypeScript's installed scanner with trivia skipped: the sequence of token kinds and token text must be byte-identical. Separately assert equal source line counts and inspect the diff for exactly the intended comment-digit replacements. Retain the runnable comparison under your evidence directory and its output.
- `npx tsc --noEmit` and `npm run build` green after editing; preserve complete bounded logs (each under 5 MB). This is comment-only; no browser run, screenshot refresh, full simulation battery or new runtime test is needed. Report those as not run, not green. Measure the new engine hash using the existing engine-era tool and report the drain-owned pin duty without editing the registry.

End: READY-FOR-GATES with the count, before/after ranges, token/line invariance, build/typecheck results and engine provenance. If already fixed at dispatch, write the proving commits into your report and exit without reimplementation. If exiting without changes for any other reason, write why first.
