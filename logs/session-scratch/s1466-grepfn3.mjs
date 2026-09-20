import { readFileSync } from 'node:fs';
const src = readFileSync(process.argv[2], 'utf8').split('\n');
const start = src.findIndex((l, i) => i > 4715 && /^function grep\b|^\s*function grep\b/.test(l));
console.log('grep shadow at :' + (start + 1));
console.log(src.slice(start, start + 16).map((l, i) => `:${start + 1 + i}  ${l}`).join('\n'));
