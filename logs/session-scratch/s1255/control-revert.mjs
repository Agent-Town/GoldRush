// s1255 control arm: park the staged graft, restore HEAD, run a probe, then re-apply
// and PROVE byte-identity by sha256. Usage: node control-revert.mjs park | restore
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
// s1255: URL.pathname percent-encodes the space in "Gold Rush", so git apply got a path that
// does not exist and the restore silently did nothing. The sha guard caught it; this is the cure.
import { fileURLToPath } from 'node:url';

const PATCH = new URL('./graft.patch', import.meta.url);
const SHA = new URL('./graft.sha', import.meta.url);
const CODE = ['e2e', 'src'];
const PNGS = [
  'artifacts/profile-first-boot/desktop-chrome-name-only-creation.png',
  'artifacts/profile-first-boot/mobile-chrome-name-only-creation.png',
];

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28 });
  console.log(`$ ${cmd} ${args.join(' ')}\nrc=${r.status}\n${r.stdout ?? ''}${r.stderr ?? ''}`);
  return r;
}
const h = (s) => createHash('sha256').update(s).digest('hex');

const mode = process.argv[2];

if (mode === 'park') {
  const diff = spawnSync('git', ['diff', '--cached', '--', ...CODE], { encoding: 'utf8', maxBuffer: 1 << 28 }).stdout;
  writeFileSync(PATCH, diff);
  writeFileSync(SHA, h(diff));
  console.log('parked bytes=' + diff.length + ' sha=' + h(diff).slice(0, 16));
  run('git', ['reset', '-q', 'HEAD', '--', ...CODE, ...PNGS]);
  run('git', ['checkout', 'HEAD', '--', ...CODE]);
  for (const p of PNGS) if (existsSync(p)) rmSync(p);
  run('git', ['status', '--porcelain']);
} else if (mode === 'restore') {
  run('git', ['apply', '--index', fileURLToPath(PATCH)]);
  for (const p of PNGS) run('git', ['checkout', '40ea99a4', '--', p]);
  const back = spawnSync('git', ['diff', '--cached', '--', ...CODE], { encoding: 'utf8', maxBuffer: 1 << 28 }).stdout;
  const want = readFileSync(SHA, 'utf8').trim();
  console.log('restored bytes=' + back.length + ' sha=' + h(back).slice(0, 16) + ' want=' + want.slice(0, 16));
  console.log('BYTE-IDENTICAL: ' + (h(back) === want));
  run('git', ['status', '--porcelain']);
} else {
  console.error('need park|restore');
  process.exit(2);
}
