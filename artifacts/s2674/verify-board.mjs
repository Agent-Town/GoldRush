// Final board check before the clearing commit: line 1 is the handoff, the desk survived
// intact, and BOTH displaced lines are on the board as archive bullets.
import fs from 'node:fs';

const lines = fs.readFileSync('STATUS.md', 'utf8').split('\n');
const l1 = lines[0];
const desk = l1.slice(l1.indexOf('\u{1F53A} **OWNER' + String.fromCharCode(39) + 'S DESK'));

console.log('line1 chars      :', l1.length);
console.log('line1 head       :', l1.slice(0, 84));
console.log('desk markers     :', (desk.match(/\u{1F53A}/gu) ?? []).length, '(header + items)');
console.log('desk tail is LAST:', l1.endsWith(desk));
console.log('');
const bullets = lines
  .map((line, i) => [i + 1, line])
  .filter(([, line]) => /^- \*\*.+ \(line-1 archive/.test(line))
  .slice(0, 4);
for (const [n, line] of bullets) console.log(`  L${n}: ${line.slice(0, 120)}`);
console.log('');
console.log('s2673 handoff archived:', lines.some((l, i) => i > 0 && /\(line-1 archive/.test(l) && /s2673 handoff/.test(l)));
console.log('s2674 lock archived   :', lines.some((l, i) => i > 0 && /\(line-1 archive/.test(l) && /s2674 lock/.test(l)));
