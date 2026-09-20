import fs from 'node:fs';

const P = 'STATUS.md';
const lines = fs.readFileSync(P, 'utf8').split('\n');
const old = lines[0];
if (!old.startsWith('Last updated:')) {
  console.error('REFUSE: line-1 does not look like a cleared handoff:', old.slice(0, 80));
  process.exit(2);
}
const lock = 'ACTIVE 2026-08-11T17:46Z (s1663 fire) — board re-verified NOT inherited: six queues EMPTY, every done-move prefixed, tasks/failed clean, no CODEX-WALL. lane-a BUSY and genuinely alive (f1643-2 suite-red attribution, log written 17:41, progress 1,708/2,804); lanes b/c/d ahead=0 USABLE and idle. Authoring the F-1662-2 cure (same-game-audit prose count); DISPATCH deliberately deferred while lane-a’s attribution run is live.';
const archive = '- **s1662 handoff (line-1 archive):** ' + old;
const out = [lock, archive, ...lines.slice(1)].join('\n');
fs.writeFileSync(P, out);
console.log('ok: archived s1662 handoff, wrote s1663 lock');
