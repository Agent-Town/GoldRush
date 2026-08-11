import fs from 'node:fs';

const L = fs.readFileSync('STATUS.md', 'utf8').split('\n');
if (!L[0].startsWith('Last updated: 2026-08-11T12:09Z s1655 handoff')) throw new Error('line-1 is not my handoff');
if (L[0].includes('CLOSING BATTERY, RE-RUN')) throw new Error('already appended');

const add = ' ✅ **CLOSING BATTERY, RE-RUN AFTER BOTH CURES: FULLY GREEN.** '
  + '169/169 node ledger-guard tests (exit 0) · ghost-ladder-row `--strict` 0 ghosts · findings-state · blocker-panel · '
  + 'ruling-propagation **0 stale** · citation-title · desk-declaration (23 desk F-IDs, **0 undeclared**) · desk-birth · '
  + 'status-archive **CLEAN** · attended-owed 1 known OPEN (the s1343 drain-SKILL custody item, attended-only) · nul-audit CLEAN · '
  + 'and all 5 bash guards PASS (main-lock-gate, janitor-rejection, lane-dispatch-safety, codex-client-floor, runner-restart-recipe). '
  + 'Working tree at handoff carries ONLY factory churn (the tracked `logs/` accounting) and the runner\'s own queue-consumption deletions — '
  + 'none of it mine, and none of attended\'s uncommitted work was ever staged. All commits pushed to origin.';

L[0] += add;
fs.writeFileSync('STATUS.md', L.join('\n'));
console.log('appended; line-1 is now', L[0].length, 'chars');
