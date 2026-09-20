// s1128 probe (F-1126-2 re-examination). Read-only.
// Question: does test:release's own dist assertion hold against the ALL-EPOCH
// artifact that scripts/deploy.sh actually publishes (deploy.sh:49 = `npm run build`)?
// assert-release-build.mjs only readdir/readFile/stat — no writes. See scripts/assert-release-build.mjs.
import { execFileSync } from 'node:child_process';

const root = process.cwd();
let rc = 0;
let out = '';
try {
  out = execFileSync(process.execPath, ['scripts/assert-release-build.mjs'], {
    cwd: root,
    env: { ...process.env, GR_RELEASE: 'e1' },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (error) {
  rc = error.status ?? 1;
  out = `${error.stdout ?? ''}${error.stderr ?? ''}`;
}
console.log(`rc=${rc}`);
console.log(out.split('\n').filter(Boolean).slice(0, 6).join('\n'));
