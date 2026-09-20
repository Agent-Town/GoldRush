import { execSync } from 'node:child_process';
const script = process.argv[2] || 'test:node-guards';
const pkg = JSON.parse(execSync('cat package.json', { encoding: 'utf8' }));
console.log('SCRIPT:', script, '=>', pkg.scripts[script]);
let out = '', rc = 0;
try {
  out = execSync(`npm run ${script}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
} catch (e) {
  rc = e.status ?? 1;
  out = (e.stdout || '') + (e.stderr || '');
}
console.log('rc=' + rc);
const lines = out.split('\n');
const tally = lines.filter((l) => /^#? ?(tests|suites|pass|fail|cancelled|skipped|todo|duration_ms) /.test(l.trim()));
console.log('--- TALLY ---');
console.log(tally.join('\n'));
console.log('--- FAILURE LINES ---');
console.log(lines.filter((l) => /^not ok |AssertionError|✖/.test(l)).slice(0, 40).join('\n') || '(none)');
