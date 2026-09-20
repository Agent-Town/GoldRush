// s1662 gate phase 3: the slice's own specs on the MERGED tree.
// --workers=1 (§3.1 correctness requirement, F-1270-1), niced, external scratch
// server on 5234 so nothing competes on 5188 (Mistake #12).
import { execFileSync } from 'node:child_process';
const cwd = '/Users/robin/Claude/Projects/Gold Rush/gate-s1662b';
const env = {
  ...process.env,
  GR_CAPTURE_EXTERNAL_SERVER: '1',
  GR_CAPTURE_BASE_URL: 'http://127.0.0.1:5234',
};
const SPECS = ['e2e/er01-e2-census.spec.ts', 'e2e/ap16-4-contract-admission.spec.ts'];
for (const project of ['desktop-chrome', 'mobile-chrome']) {
  const t0 = Date.now();
  let rc = 0, out = '';
  try {
    out = execFileSync('nice', ['-n', '19', 'npx', 'playwright', 'test', ...SPECS, '--project', project, '--workers=1', '--reporter=line'],
      { cwd, env, encoding: 'utf8', timeout: 1500000 });
  } catch (e) { rc = e.status ?? 'ERR'; out = (e.stdout || '') + (e.stderr || ''); }
  console.log(`\n=== ${project} === rc=${rc}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(out.split('\n').filter((l) => l.trim() && !/^\[/.test(l)).slice(-12).join('\n'));
}
