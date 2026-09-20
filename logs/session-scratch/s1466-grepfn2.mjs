// s1466: broader hunt for how `grep` becomes a shell function in the snapshot.
import { readFileSync } from 'node:fs';
const src = readFileSync(process.argv[2], 'utf8').split('\n');
src.forEach((l, i) => {
  if (/(^|[^_a-zA-Z0-9])grep\s*\(\s*\)/.test(l)) console.log(`:${i + 1}  ${l}`);
});
console.log('--- context around 4700-4715 ---');
console.log(src.slice(4699, 4716).map((l, i) => `:${4700 + i}  ${l}`).join('\n'));
