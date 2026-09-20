import fs from 'node:fs';
const s = fs.readFileSync('tasks/goals.json', 'utf8');
const enc = (o) =>
  JSON.stringify(o, null, 2).replace(
    /[-￿]/g,
    (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'),
  ) + '\n';
const r = enc(JSON.parse(s));
console.log('identical?', r === s);
const a = s.split('\n');
const b = r.split('\n');
console.log('file lines', a.length, 'enc lines', b.length);
let shown = 0;
for (let i = 0; i < Math.max(a.length, b.length) && shown < 3; i++) {
  if (a[i] !== b[i]) {
    shown++;
    console.log('--- line', i + 1);
    console.log('FILE:', JSON.stringify((a[i] || '').slice(0, 200)));
    console.log('ENC :', JSON.stringify((b[i] || '').slice(0, 200)));
  }
}
