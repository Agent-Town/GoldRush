// s1664 lock writer — splice STATUS.md line 1, archive the prior handoff as a bullet.
// One-shot scratch script (kept in-repo per the retention law; delete only by a tracked commit).
import fs from 'node:fs';

const path = 'STATUS.md';
const raw = fs.readFileSync(path, 'utf8');
const lines = raw.split('\n');
const prev = lines[0];

if (!prev.startsWith('Last updated:')) {
  console.error('REFUSE: line 1 is not a handoff line — got:', prev.slice(0, 60));
  process.exit(2);
}

const stamp = process.argv[2];
const intent = process.argv[3];
const newLine1 = `ACTIVE ${stamp} (s1664 fire) — ${intent}`;

const archive = `- **s1663 handoff (line-1 archive):** ${prev}`;
const out = [newLine1, archive, ...lines.slice(1)].join('\n');
fs.writeFileSync(path, out);

console.log('line1 ->', newLine1.slice(0, 120));
console.log('archived s1663 handoff at line 2, length', archive.length);
