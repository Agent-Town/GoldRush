// s1402 lock: replace line-1 with the ACTIVE lock line and archive s1401's handoff line-1
// immediately (rather than transiently dropping it, which status-archive-audit tolerates but
// which loses the board for the duration of the fire).
import { readFileSync, writeFileSync } from 'node:fs';

const P = '/Users/robin/Claude/Projects/Gold Rush/STATUS.md';
const rows = readFileSync(P, 'utf8').split('\n');
const prev = rows[0];
if (!/s1401 handoff/.test(prev)) {
  console.error('line-1 is not s1401 handoff; aborting');
  process.exit(2);
}

const lock =
  'ACTIVE 2026-08-02T20:37Z (s1402 fire) — F-1402-1: the main slot has been runner-skipped ' +
  'for ~6h because the handoff archive bullet on line 2 satisfies the runner\'s own ' +
  '`head -2 | grep "ACTIVE 2"` gate; measuring and curing.';

const archived = '- **s1401 handoff (line-1 archive):** ' + prev;

writeFileSync(P, [lock, archived, ...rows.slice(1)].join('\n'));
console.log('line-1 replaced; s1401 handoff archived at line 2');
