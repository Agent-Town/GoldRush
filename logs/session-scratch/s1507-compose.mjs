// s1507 — the last open question. town-dynamo-hall-blender:97 is 3/3 green ALONE in both arms,
// but red in the merged arm under the 3-spec composition. Either the merge moved it, or the test
// is load-sensitive under co-scheduling and the single control run got lucky.
//
// Decisive: run the SAME composition on the CONTROL arm repeatedly. If it can red there too, the
// flake is independent of the merge and the 3-vs-4 delta was sampling noise.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const GATE = join(ROOT, 'gate-s1507');
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

const SPECS = [
  'e2e/072-era-activation.spec.ts',
  'e2e/landmark-collision.spec.ts',
  'e2e/town-dynamo-hall-blender.spec.ts',
];
const PREMERGE = 'edda5d3de';
const MERGED = '75903bf48';
const TARGET = 'town-dynamo-hall-blender.spec.ts:97';

const git = (...a) => {
  const r = spawnSync('git', a, { cwd: GATE, encoding: 'utf8', env });
  if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

git('checkout', '--quiet', PREMERGE);
console.log(`CONTROL arm @ ${git('rev-parse', '--short', 'HEAD')}, 3-spec composition, 2 runs\n`);

for (let i = 1; i <= 2; i++) {
  const r = spawnSync('npx', ['playwright', 'test', ...SPECS, '--workers=1', '--reporter=line'], {
    cwd: GATE, encoding: 'utf8', env, maxBuffer: 128 * 1024 * 1024,
  });
  const out = `${r.stdout}${r.stderr}`;
  const tally = (out.match(/\d+ (?:passed|failed|flaky|skipped)/g) || []).join(', ');
  const hitTarget = out.includes(TARGET);
  const nums = [...out.matchAll(/Expected: <= ([\d.]+)[\s\S]{0,80}?Received:\s+([\d.]+)/g)]
    .map((m) => `${m[2]} vs <=${m[1]}`);
  console.log(`run ${i}: rc=${r.status}  ${tally}`);
  console.log(`        ${TARGET} present in failures: ${hitTarget}${nums.length ? '   ' + nums.join(' | ') : ''}`);
}

git('checkout', '--quiet', MERGED);
console.log(`\nrestored to ${git('rev-parse', '--short', 'HEAD')}`);
