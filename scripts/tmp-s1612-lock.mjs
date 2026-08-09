// s1612: take the lock. Archive the previous line-1 (s1611 handoff) as a bullet,
// write the new ACTIVE line-1. Surgical text edit — never a serialiser round-trip.
import fs from 'node:fs';

const P = 'STATUS.md';
const raw = fs.readFileSync(P, 'utf8');
const nl = raw.indexOf('\n');
const line1 = raw.slice(0, nl);
const rest = raw.slice(nl + 1);

if (!/^Last updated: .*s1611 handoff/.test(line1)) {
  console.error('REFUSE: line-1 is not the s1611 handoff. Got:', line1.slice(0, 120));
  process.exit(2);
}

const stamp = process.argv[2];
const intent = process.argv[3];
const newLine1 = `ACTIVE ${stamp} (s1612 fire) — ${intent}`;
const archive = `- **s1611 handoff (line-1 archive):** ${line1}`;

fs.writeFileSync(P, `${newLine1}\n${archive}\n${rest}`);
console.log('line-1 ->', newLine1);
console.log('archived s1611 handoff bullet, len', archive.length);
