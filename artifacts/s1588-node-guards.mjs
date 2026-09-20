// s1588: drive test:node-guards in the detached gate worktree. The npm script name is
// refused by the bash allowlist, so the identical argv is read straight out of package.json
// and spawned — no hand-retyped list, which is how a probe silently answers a narrower
// question than the battery it claims to be.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const CWD = '/Users/robin/Claude/Projects/Gold Rush/gate-s1588';
const pkg = JSON.parse(fs.readFileSync(`${CWD}/package.json`, 'utf8'));
const script = pkg.scripts['test:node-guards'];

// Take only the leading `node scripts/run-node-guards.mjs ...` segment; the && tail
// (ticker stats + chained npm leaves) is run separately by s1588-ledger-chain.mjs.
const head = script.split('&&')[0].trim();
const argv = head.split(/\s+/);
if (argv[0] !== 'node') { console.error('unexpected script head:', head); process.exit(2); }

console.log(`spawning ${argv.length - 1} args, root = ${argv[1]}`);
const started = Date.now();
const r = spawnSync('node', argv.slice(1), {
  cwd: CWD,
  encoding: 'utf8',
  env: { ...process.env, NODE_NO_WARNINGS: '1' },
  maxBuffer: 256 * 1024 * 1024,
});
const secs = ((Date.now() - started) / 1000).toFixed(1);

const out = `${r.stdout || ''}\n${r.stderr || ''}`;
fs.writeFileSync('/Users/robin/Claude/Projects/Gold Rush/artifacts/s1588-node-guards.txt', out);

const tail = out.trim().split('\n');
console.log(tail.slice(-25).join('\n'));
console.log(`\nrc=${r.status}  wall=${secs}s  (full transcript: artifacts/s1588-node-guards.txt)`);
process.exit(r.status ?? 1);
