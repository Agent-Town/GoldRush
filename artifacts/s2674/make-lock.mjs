// Build the s2674 lock line: intent + the OWNER'S DESK tail carried VERBATIM from line 1.
// Carrying the tail is the lawful path past F-2671-2's refusal (nothing is lost, so it
// never fires) and it keeps the desk on the board during the fire, not only in git.
import fs from 'node:fs';

const s = fs.readFileSync('STATUS.md', 'utf8');
const line1 = s.slice(0, s.indexOf('\n'));
const deskIdx = line1.indexOf('\u{1F53A} **OWNER' + String.fromCharCode(39) + 'S DESK');
if (deskIdx < 0) throw new Error('desk header not found in line 1 — STOP, do not write');
const deskTail = line1.slice(deskIdx);

const intent =
  'ACTIVE {STAMP} (s2674 fire) — board DRY and the word earned (dry-board-probe 0 real drains, ' +
  'lane-usable --all a/b/c/d all ahead=0, all six queues empty, tasks/running/ empty); ' +
  'CODEX-WALL still UP (mtime 09-24 12:14) so NO refills/dispatch/re-queues; taking the ' +
  'predecessor’s named next gate, F-2673-1 (the unbounded status-archive-audit walk must ' +
  'state its price and its known legacy verdict, or the row is accepted as comments-only), ' +
  'plus the LB-01/FM-01 coverage-day duties. ';

fs.writeFileSync('artifacts/s2674/lock-line.txt', intent + deskTail + '\n');
console.log('deskTail bytes', deskTail.length);
console.log('total bytes', (intent + deskTail).length);
console.log('desk head:', deskTail.slice(0, 60));
