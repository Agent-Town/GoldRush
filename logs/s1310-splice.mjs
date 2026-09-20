import fs from 'node:fs';

const status = 'STATUS.md';
const lines = fs.readFileSync(status, 'utf8').split('\n');
const oldLine1 = lines[0];
if (!oldLine1.includes('ACTIVE') || !oldLine1.includes('s1310')) {
  console.error('line-1 is not my ACTIVE lock — aborting'); process.exit(2);
}
const handoff = fs.readFileSync('logs/s1310-handoff.txt', 'utf8').replace(/\n+$/, '');
lines[0] = handoff;
lines.splice(1, 0, '- **s1310 lock (line-1 archive):** ' + oldLine1);
fs.writeFileSync(status, lines.join('\n'));
console.log('line1 (first 100):', lines[0].slice(0, 100));
console.log('line2 (first 80) :', lines[1].slice(0, 80));
console.log('line3 (first 60) :', lines[2].slice(0, 60));
