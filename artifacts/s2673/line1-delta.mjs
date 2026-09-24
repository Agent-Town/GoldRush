// s2673 — what does the working-tree line 1 carry that HEAD's does not?
// Reads only; writes nothing. The file is 20.5 MB, so slice line 1 out by index.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const head1 = (() => {
  const blob = execFileSync('git', ['show', 'HEAD:STATUS.md'], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  return blob.slice(0, blob.indexOf('\n'));
})();

const disk = readFileSync('STATUS.md', 'utf8');
const disk1 = disk.slice(0, disk.indexOf('\n'));

console.log('HEAD line1 chars:', head1.length);
console.log('DISK line1 chars:', disk1.length);
console.log('identical:', head1 === disk1);

// Common prefix / suffix, so the inserted span is named exactly.
let p = 0;
while (p < head1.length && p < disk1.length && head1[p] === disk1[p]) p++;
let s = 0;
while (
  s < head1.length - p &&
  s < disk1.length - p &&
  head1[head1.length - 1 - s] === disk1[disk1.length - 1 - s]
) s++;

console.log('common prefix:', p, ' common suffix:', s);
console.log('--- HEAD had, in the gap ---');
console.log(JSON.stringify(head1.slice(p, head1.length - s)).slice(0, 900));
console.log('--- DISK has, in the gap ---');
console.log(JSON.stringify(disk1.slice(p, disk1.length - s)).slice(0, 1400));

// Does either side still carry the desk, and how many items?
const deskCount = (l) => {
  const i = l.search(/OWNER.{0,2}S? DESK/i);
  return i === -1 ? null : (l.slice(i).match(/🔺/g) ?? []).length;
};
console.log('desk 🔺 count — HEAD:', deskCount(head1), ' DISK:', deskCount(disk1));
