// Verify each ARM (b) hit by READING its deciding line + surrounding context.
import fs from 'node:fs';
const files = [
  ['tasks/f1397-1-e1-release-door-drill-yard.md', [38, 61]],
  ['tasks/lane-a-cp04-lever-unlock-seed-realign.md', [97]],
  ['tasks/lane-a-f1305-2-console-watch-single-source.md', [45]],
  ['tasks/lane-b-approach-convergence-class.md', [36, 60]],
  ['tasks/lane-b-cp04-charter-name-composition.md', [109]],
  ['tasks/lane-b-cp04-launch-clear-observability.md', [91]],
];
const SELFCHECK = /^\s*(#+\s*)?(\*\*)?(SELF-?CHECK|GATES?|SELF CHECK|ACCEPTANCE)/i;
for (const [f, ns] of files) {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  let sc = 'NONE';
  for (let i = 0; i < lines.length; i++) if (SELFCHECK.test(lines[i])) { sc = i + 1; break; }
  console.log('\n=========== ' + f + '   (self-check region starts :' + sc + ') ===========');
  for (const n of ns) {
    for (let i = Math.max(0, n - 2); i < Math.min(lines.length, n + 1); i++) {
      const mark = i + 1 === n ? '>>' : '  ';
      console.log(mark + ' :' + (i + 1) + '  ' + lines[i].trim().slice(0, 300));
    }
    console.log('   ---');
  }
}
