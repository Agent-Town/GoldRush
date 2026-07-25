import { readFileSync, writeFileSync } from 'node:fs';

const P = '/Users/robin/Claude/Projects/Gold Rush/STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
const old = lines[0];
const rest = lines.slice(1);

const new1 =
  'ACTIVE 2026-07-25T14:02Z (s1045 fire) - triage: lane-c ED-04 run live, all queues empty; ' +
  'verifying F-1044-2 (e10 art in no commit) and refilling an idle lane';
const archive = '- **s1044 handoff (line-1 archive):** ' + old;

writeFileSync(P, [new1, '', archive, ...rest].join('\n'), 'utf8');
console.log('ok');
