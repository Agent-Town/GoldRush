import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const src = 'tasks/lane-town-t6-assay-supersession.md';
const dst = 'tasks/queue/lane-a/lane-town-t6-assay-supersession.md';

const buf = readFileSync(src);
writeFileSync(dst, buf);

const sha = (b) => createHash('sha256').update(b).digest('hex');
const a = sha(readFileSync(src));
const b = sha(readFileSync(dst));

console.log('master sha256:', a.slice(0, 12));
console.log('queued sha256:', b.slice(0, 12));
console.log(a === b ? 'IDENTICAL ✅' : 'MISMATCH ❌');

const lines = readFileSync(dst, 'utf8').split('\n');
const idx = lines.findIndex((l) => l.startsWith('CODEX:'));
console.log(`^CODEX: at line ${idx + 1}, column 0: ${lines[idx] === lines[idx].trimStart() ? 'YES ✅' : 'NO ❌'}`);
