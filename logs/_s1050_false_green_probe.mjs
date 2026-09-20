// s1050 gate probe — run scripts/deploy.sh with a stub `wrangler` that exits 0
// while publishing nothing and printing no pages.dev URL (the F-1049-1 shape).
// Usage: node logs/_s1050_false_green_probe.mjs <label>
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const label = process.argv[2] ?? 'run';

const r = spawnSync('bash', ['scripts/deploy.sh'], {
  cwd: ROOT,
  env: { ...process.env, PATH: `/tmp/gr-s1050-stub:${process.env.PATH}` },
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

const deployLines = (r.stdout ?? '')
  .split('\n')
  .filter((l) => l.startsWith('[deploy]'));

console.log(`===== ${label}: [deploy] lines =====`);
console.log(deployLines.join('\n'));
console.log(`===== ${label}: exit code = ${r.status} (never-block law: must be 0) =====`);
console.log(`===== ${label}: logs/deploy-result.json =====`);
console.log(readFileSync(`${ROOT}/logs/deploy-result.json`, 'utf8').trim());
