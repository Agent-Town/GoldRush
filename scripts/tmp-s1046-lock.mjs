import { readFileSync, writeFileSync } from 'node:fs';

const P = '/Users/robin/Claude/Projects/Gold Rush/STATUS.md';
const lines = readFileSync(P, 'utf8').split('\n');
const rest = lines.slice(1);

const new1 =
  'ACTIVE 2026-07-25T15:40Z (s1046 fire, ALT — primary weekly-walled until 23:00 Bangkok) - ' +
  'DRAIN 1/1 LANDED: ED-04 four vacuous editor guards (0e7ee088) + ledger (8feffdb3); F-1044-1 CLOSED. ' +
  'Also FIXED F-1046-1 — dashboard-gen.sh was archiving 14-line fossils over every run report ' +
  '(the Retention Law mirror was a stub). Now refilling six empty queues.';

writeFileSync(P, [new1, ...rest].join('\n'), 'utf8');
console.log('ok');
