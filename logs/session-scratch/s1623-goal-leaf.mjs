import fs from 'node:fs';

const p = 'tasks/goals.json';
let t = fs.readFileSync(p, 'utf8');

const anchor = '"id": "f1621-1-town-budget-instrument-reconciliation",';
const i = t.indexOf(anchor);
if (i < 0) { console.error('anchor not found'); process.exit(1); }

const from = '"status": "queued",';
const j = t.indexOf(from, i);
if (j < 0 || j - i > 400) { console.error('status field not adjacent to anchor'); process.exit(1); }

const drainNotes = [
  'DRAINED s1623 2026-08-10, merge 181e1835b, review reviews/f1621-1-town-budget-instrument-reconciliation.md.',
  'Gated in detached worktree gate-s1623 (fire.md 3.0b, concurrent attended session on main), all --workers=1:',
  'tsc clean; build green; own suite e2e/asset-diet.spec.ts 6/6 PASSED both projects 3.4m;',
  'adjacent e2e/advance-stream-cache-reuse.spec.ts 4/4 passed 1.8m; zero console errors;',
  'node-guards not required (diff is e2e/ + artifacts/ only, F-1460-1).',
  'BOTH limbs of the F-1620-7 gate CLOSED: ceiling named once as TOWN_TRANSFER_CEILING_BYTES,',
  'the two townResponseBytes quantities renamed apart (cueWindowResponseBytes vs normalBytes),',
  'f1615-1 restated against the cue-window instrument.',
  'The runner reported the mobile normal arm RED at 26,542,805; the drain control run ~40 min later',
  'on the same machine is GREEN on both projects, so s1621 candidate (3) real-regression is REFUTED',
  'and (2) instability is CONFIRMED and dominant: the instrument swings up to 3.08x at fixed',
  'configuration and the 25,000,000 ceiling sits inside the spread (F-1623-1, now the open lead,',
  'superseding F-1620-7). Findings F-1623-1..5 filed. The reconciliation comment was superseded in',
  'the drain because its ten point figures did not reproduce; both artifact sets are retained',
  '(town-budget-<project>.md = runner, town-budget-<project>-s1623-control.md = drain).',
].join(' ');

const repl =
  '"status": "merged",\n' +
  '              "mergeHash": "181e1835b4eac19beda14619ed0b213d6f7f9073",\n' +
  '              "drainNotes": ' + JSON.stringify(drainNotes) + ',';

t = t.slice(0, j) + repl + t.slice(j + from.length);
fs.writeFileSync(p, t);
JSON.parse(fs.readFileSync(p, 'utf8'));
console.log('goal leaf updated by splice; JSON re-parses clean');
