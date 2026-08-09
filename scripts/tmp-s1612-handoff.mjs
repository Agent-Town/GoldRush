// s1612 handoff: archive MY lock line (not s1611's — the s1472 trap), write line-1.
import fs from 'node:fs';

const P = 'STATUS.md';
const raw = fs.readFileSync(P, 'utf8');
const nl = raw.indexOf('\n');
const line1 = raw.slice(0, nl);
const rest = raw.slice(nl + 1);

if (!/^ACTIVE .*\(s1612 fire\)/.test(line1)) {
  console.error('REFUSE: line-1 is not my own s1612 lock line. Got:', line1.slice(0, 120));
  process.exit(2);
}

const newLine1 = fs.readFileSync('/tmp/s1612-line1.txt', 'utf8').replace(/\n+$/, '');
const archive = `- **s1612 lock line (archived):** ${line1}`;
fs.writeFileSync(P, `${newLine1}\n${archive}\n${rest}`);

// The duty is about the END STATE: s1611's handoff must still be archived exactly once.
const after = fs.readFileSync(P, 'utf8');
const n = (after.match(/s1611 handoff \(line-1 archive\)/g) || []).length;
console.log('s1611 handoff archive bullets:', n, n === 1 ? 'OK' : 'WRONG');
console.log('line-1 chars:', newLine1.length);
