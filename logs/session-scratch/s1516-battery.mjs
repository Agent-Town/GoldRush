// s1516 drain battery on the MERGED gate tree (the bash gate denies me, not the factory).
import { spawnSync } from 'node:child_process';

const GATE = '/Users/robin/Claude/Projects/Gold Rush/gate-s1516';
const r = spawnSync('npm', ['run', 'test:node-guards'], { cwd: GATE, encoding: 'utf8', timeout: 900_000 });
const out = (r.stdout || '') + (r.stderr || '');
console.log('node', process.version);
console.log('rc =', r.status);
for (const line of out.split('\n')) {
  if (/^(# )?(tests|pass|fail|cancelled|skipped|duration_ms)\b/.test(line.trim().replace(/^ℹ\s*/, ''))) {
    console.log('  ', line.trim());
  }
}
const fails = out.split('\n').filter((l) => /^not ok |^✖/.test(l.trim()));
console.log('FAILING LINES:', fails.length);
fails.slice(0, 10).forEach((l) => console.log('   ', l.trim()));
