// s2673 — compose the lock line: my intent + the desk tail CARRIED VERBATIM.
// Never compose the desk; slice it off the live line 1 and append it unchanged,
// with nothing after it (anything after the header reads as a desk item).
import { readFileSync, writeFileSync } from 'node:fs';

const disk = readFileSync('STATUS.md', 'utf8');
const line1 = disk.slice(0, disk.indexOf('\n'));

// The header as it is actually written, decoration included.
const DESK_HEADER = /🔺 \*\*OWNER.{0,2}S DESK —/;
const at = line1.search(DESK_HEADER);
if (at === -1) throw new Error('desk header not found in line 1 — refusing to compose one');
const deskTail = line1.slice(at);

const intent = process.argv[2];
if (!intent) throw new Error('usage: build-lock-line.mjs <intent text>');

const out = `${intent} ${deskTail}`;
writeFileSync('artifacts/s2673/lock-line.txt', out, 'utf8');
console.log('desk tail starts at char', at, 'of', line1.length);
console.log('desk items carried:', (deskTail.match(/🔺/g) ?? []).length - 1);
console.log('lock line chars:', out.length);
console.log('--- tail check (last 160) ---');
console.log(out.slice(-160));
