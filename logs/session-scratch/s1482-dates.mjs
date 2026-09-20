import { execSync } from 'node:child_process';
const q = (c) => execSync(c, { maxBuffer: 1 << 26 }).toString().trim();
console.log('=== commits that introduced/changed claimedByAnotherConfig in playwright.config.ts ===');
console.log(q('git log --format="%h %cI %s" -S "claimedByAnotherConfig" -- playwright.config.ts'));
console.log('\n=== commits that introduced the testIgnore of release-build ===');
console.log(q('git log --format="%h %cI %s" -S "release-build.spec.ts" -- playwright.config.ts'));
console.log('\n=== when was each ARM(b) offender master ADDED? ===');
const files = [
  'tasks/f1397-1-e1-release-door-drill-yard.md',
  'tasks/lane-a-cp04-lever-unlock-seed-realign.md',
  'tasks/lane-a-f1305-2-console-watch-single-source.md',
  'tasks/lane-b-approach-convergence-class.md',
  'tasks/lane-b-cp04-charter-name-composition.md',
  'tasks/lane-b-cp04-launch-clear-observability.md',
];
for (const f of files) {
  const add = q(`git log --diff-filter=A --format="%h %cI" -- "${f}" | tail -1`);
  console.log('  ' + f.replace('tasks/', '').padEnd(52) + (add || '(no add commit found)'));
}
