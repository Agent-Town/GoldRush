import { readFileSync } from 'node:fs';
const lines = readFileSync('STATUS.md', 'utf8').split('\n');
for (let i = 1; i < 14; i++) {
  const l = lines[i] ?? '';
  console.log(`${i + 1}| ${l.slice(0, 220)}${l.length > 220 ? ' …[' + l.length + ']' : ''}`);
}
