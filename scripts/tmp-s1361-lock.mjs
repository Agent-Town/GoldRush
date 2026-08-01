// s1361 lock: rewrite STATUS line-1, archive s1360's handoff line-1 as a bullet
// (F-1341-1: the predecessor's handoff is archived in the LOCK commit).
// Stamp comes from `date`, never from arithmetic (F-1039-2).
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const stamp = execFileSync('date', ['+%Y-%m-%dT%H:%MZ']).toString().trim();

const path = new URL('../STATUS.md', import.meta.url);
const lines = readFileSync(path, 'utf8').split('\n');
const prev = lines[0];

if (!prev.startsWith('Last updated:')) throw new Error('line-1 is not a handoff line: ' + prev.slice(0, 60));
if (!/s1360 handoff/.test(prev)) throw new Error('line-1 is not s1360 handoff');

const lock =
  `ACTIVE ${stamp} (s1361 fire) — board dry RE-DERIVED a 22nd consecutive fire ` +
  `(6 queues empty by direct find, no CODEX-WALL, assayer pending 0, no done-move since the s1360 handoff, ` +
  `lane/m3+e2-arsenal+perf 0 ahead, lane/m4 holds its 1 blocked commit). ` +
  `s1360 had CLEARED the lock, DISCHARGED the ticker duty (2026-08-01 digest landed) and declared the ` +
  `fire-authorable search exhausted on three passes. Intent: honour that — the next digest (2026-08-02) is ` +
  `not compilable until that day closes, so instead VERIFY the two art-audit figures four fires have restated ` +
  `without re-measuring, and test whether s1360's merge-blindness defect is baked into a shipped tool. ` +
  `Bookkeeping committed first per §2A (0f1c1d80).`;

lines[0] = lock;
lines.splice(1, 0, `- **s1360 handoff (line-1 archive):** ${prev}`);
writeFileSync(path, lines.join('\n'));
console.log('stamp:', stamp);
console.log('archived s1360 handoff, %d bytes', prev.length);
