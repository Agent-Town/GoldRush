import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const dir = 'artifacts/s3471';
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const read = p => fs.readFileSync(p, 'utf8');
const result = JSON.parse(read(`${dir}/ledger-result.json`));
const manifest = JSON.parse(read(`${dir}/ledger-manifest.json`));
if (result.code !== 0 || !result.unchanged || !result.headUnchanged) throw Error('Ledger battery did not accept this tree');
if (run('git', ['rev-parse', 'HEAD']) !== manifest.head) throw Error('HEAD changed since verification');
for (const [p, hash] of Object.entries(manifest.hashes)) {
  if (createHash('sha256').update(fs.readFileSync(p)).digest('hex') !== hash) throw Error(`Tested bytes changed: ${p}`);
}
if (run('git', ['branch', '--show-current']) !== 'main') throw Error('Not on main');
if (run('git', ['diff', '--cached', '--name-only'])) throw Error('Unexpected staged paths');
const source = run('git', ['diff', '--name-only', '--', 'src', 'scripts', 'assets', 'public', 'e2e', 'package.json']);
if (source) throw Error('Unexpected product changes: ' + source);
const files = [
  'dry-board.txt', 'lanes.txt', 'queue-state.json', 'duties.json', 'runner-scan.json', 'launcher.json',
  'live-probe.json', 'health.txt', 'private-visibility.txt',
   'mirror-freshness.txt', 'private-heads.txt',
  'duty-verification.json', 'skillmd-tests.txt', 'latest-run-resolution.json', 'main-state.json',
  'ledger-selection.json', 'status-archive.txt', 'report.md', 'handoff-body.txt', 'predecessor.txt', 'desk-tail.txt',
  'entry-head.txt', 'lock.txt', 'lock-commit.txt', 'bookkeeping-commit.txt', 'tested-line1.txt', 'probe.mjs', 'prepare-handoff.mjs', 'run-ledger.mjs',
  'test-runtime/node', 'ledger-manifest.json', 'ledger-result.json', 'ledger-guards.txt', 'vault-paths.json', 'closeout.mjs',
].map(p => `${dir}/${p}`);
const secretish = /(\bsk-(?:ant|proj|live|test)?-?[A-Za-z0-9_-]{24,}|\bAKIA[0-9A-Z]{16}\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bghp_[A-Za-z0-9]{30,}|\bxox[abp]-[A-Za-z0-9-]{20,})/;
for (const p of files) if (secretish.test(read(p))) throw Error(`Refusing secret-shaped evidence: ${p}`);
const status = read('STATUS.md');
const tested = read(`${dir}/tested-line1.txt`).trimEnd();
const body = read(`${dir}/handoff-body.txt`).trimEnd();
const tail = read(`${dir}/desk-tail.txt`).trimEnd();
if (status.split('\n')[0] !== tested || !tested.endsWith(body) || !body.endsWith(tail)) throw Error('Handoff mismatch');
const stamp = run('date', ['-u', '+%Y-%m-%dT%H:%MZ']);
const cleared = `Last updated: ${stamp} s3471 handoff, lock CLEARED — ${body}`;
fs.writeFileSync('STATUS.md', cleared + status.slice(tested.length));
run('git', ['diff', '--check', '--', 'STATUS.md', 'tasks/BACKLOG.md', 'docs/HANDOVER-2026-09-06-attended.md']);
run('git', ['add', '--', 'STATUS.md', 'tasks/BACKLOG.md', 'docs/HANDOVER-2026-09-06-attended.md', ...files]);
console.log(run('git', ['commit', '-m', 's3471: handoff — dry board and daily receipts verified; ledger gates green']));
const head = run('git', ['rev-parse', 'HEAD']);
console.log(run('git', ['push', 'origin', 'main']));
const remote = run('git', ['ls-remote', 'origin', 'refs/heads/main']).split(/\s+/)[0];
if (remote !== head) throw Error('Origin backup differs from the clearing commit');
console.log(JSON.stringify({ head, origin: remote, lock: cleared, ledger: result }, null, 2));
