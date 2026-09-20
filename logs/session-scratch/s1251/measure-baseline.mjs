// s1251 — I predicted 128 + 7 = 135 node-guards and measured 134. Investigate rather than round.
// Run the roster exactly as it stood at HEAD (before this fire added a file) and count.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const headPkg = JSON.parse(spawnSync('git', ['show', 'HEAD:package.json'], { encoding: 'utf8' }).stdout);
const headRoster = headPkg.scripts['test:node-guards'];
// Strip the trailing `&& node scripts/test-ticker-stats.mjs` — count only the node --test roster.
const files = headRoster.split('&&')[0].trim().replace(/^node --test /, '').trim().split(/\s+/);

const r = spawnSync(process.execPath, ['--test', ...files], { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 1 << 27 });
const body = `${r.stdout ?? ''}${r.stderr ?? ''}`;
const pass = (body.match(/^ℹ pass (\d+)/m) ?? [])[1];
const fail = (body.match(/^ℹ fail (\d+)/m) ?? [])[1];

const mine = spawnSync(process.execPath, ['--test', 'scripts/assert-release-build.test.mjs'], { encoding: 'utf8' });
const mineBody = `${mine.stdout ?? ''}${mine.stderr ?? ''}`;
const minePass = (mineBody.match(/^ℹ pass (\d+)/m) ?? [])[1];

const summary =
  `HEAD roster files: ${files.length}\n` +
  `HEAD roster: pass=${pass} fail=${fail} rc=${r.status}\n` +
  `my new file alone: pass=${minePass}\n` +
  `arithmetic: ${pass} + ${minePass} = ${Number(pass) + Number(minePass)}\n` +
  `measured with my file in the roster: 134\n`;
writeFileSync(process.argv[2], summary + '\n=== HEAD roster raw tail ===\n' + body.slice(-4000));
console.log(summary);
