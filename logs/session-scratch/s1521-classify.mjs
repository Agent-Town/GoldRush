// s1521 — merge classification for lane-fd3-boards-pass (drain skill §1).
import { execFileSync } from 'node:child_process';
const git = (a) => execFileSync('git', a, { encoding: 'utf8' }).trim();

const base = git(['merge-base', 'main', 'lane/b']);
console.log('base :', base.slice(0, 8), '|', git(['log', '-1', '--format=%cI %s', base]));
console.log('lane ahead:', git(['rev-list', '--count', 'main..lane/b']),
            ' behind:', git(['rev-list', '--count', 'lane/b..main']));
console.log();

const files = git(['diff', '--name-only', `${base}...lane/b`]).split('\n').filter(Boolean);
console.log('FILE'.padEnd(52), 'LANE', ' MAIN', '  CLASS');
for (const f of files) {
  const lane = +git(['rev-list', '--count', `${base}..lane/b`, '--', f]);
  const main = +git(['rev-list', '--count', `${base}..main`, '--', f]);
  const cls = main === 0 ? 'LANE-TOUCHED (clean apply)' : lane === 0 ? 'MAIN-ONLY' : 'BOTH-MOVED (3-way)';
  console.log(f.padEnd(52), String(lane).padStart(4), String(main).padStart(5), '  ' + cls);
}
