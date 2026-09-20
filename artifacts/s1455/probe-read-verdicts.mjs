import { readFileSync } from 'node:fs';
const files = process.argv.slice(2);
for (const f of files) {
  const t = readFileSync('reviews/' + f + '.md', 'utf8');
  const i = t.search(/^##\s*VERDICT:/im);
  console.log('===================== ' + f);
  console.log(t.slice(i, i + 700));
  console.log('');
}
