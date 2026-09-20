import { readFileSync, writeFileSync } from 'node:fs';

const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
const old = lines[0];
if (!old.startsWith('Last updated:')) {
  console.error('UNEXPECTED line1:', old.slice(0, 80));
  process.exit(2);
}
const stamp = process.argv[2];
const nu =
  'Last updated: ' + stamp + ' s1455 fire, lock ACTIVE at ' + stamp +
  ' — board drain-dry a third fire (lane-c f1452-1 + lane-d f1453-1 both live, run logs growing this minute); building the s1454 (C) stale-HOLD-verdict guard, proved by manufacturing the defect, with test:ledger-guards as the last act.';
lines[0] = nu;
lines.splice(1, 0, '- **s1454 handoff (line-1 archive):** ' + old.replace(/^Last updated: /, ''));
writeFileSync(p, lines.join('\n'));
console.log('OK — archived', old.length, 'chars');
