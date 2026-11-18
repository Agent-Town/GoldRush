import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync, spawn} from 'node:child_process';

const dir = 'artifacts/s3554';
const runtime = '/Users/robin/.nvm/versions/node/v26.4.0/bin';
const developerTools = '/Library/Developer/CommandLineTools/usr/bin';
const git = (...args) => execFileSync(`${developerTools}/git`, args, {encoding: 'utf8', maxBuffer: 32e6, timeout: 120000}).trim();
const stamp = () => execFileSync('date', ['-u', '+%Y-%m-%dT%H:%MZ'], {encoding: 'utf8'}).trim();
if (process.version !== 'v26.4.0') throw Error('Expected repository Node 26.4.0');
if (JSON.parse(fs.readFileSync('artifacts/s3553/ledger-result.json')).code !== 0) throw Error('Inherited direct-Git mitigation lacks passing full-ledger receipt');
if (git('branch', '--show-current') !== 'main' || git('diff', '--cached', '--name-only')) throw Error('Main custody or index changed');

fs.mkdirSync(`${dir}/test-runtime`, {recursive: true});
fs.writeFileSync(`${dir}/test-runtime/node`, `#!/bin/sh\nif [ "$1" = "--test" ] && [ "$2" = "--test-timeout=300000" ]; then\n  exec ${runtime}/node --test-concurrency=1 "$@"\nfi\nexec ${runtime}/node "$@"\n`, {mode: 0o755});
const exclude = new Set(['bookkeeping-diff.txt', 'bookkeeping-late.diff', 'latest-run-tail.txt', 'ledger-manifest.json', 'ledger-result.json', 'ledger-guards.txt', 'test-runtime']);
const evidence = fs.readdirSync(dir).filter(name => !exclude.has(name)).map(name => `${dir}/${name}`);
const core = ['STATUS.md', 'tasks/BACKLOG.md', 'tasks/goals.json', 'tasks/CODEX-WALL', 'docs/HANDOVER-2026-09-06-attended.md', 'package.json', '.nvmrc', 'assets/rotations/rotation-seeds.json', 'public/skill.md', 'scripts/gazette-backfill-sweep.mjs', 'scripts/gazette-scan-space-guard.test.mjs'];
const inputs = [...core, ...evidence, `${dir}/test-runtime/node`];
const fingerprints = () => Object.fromEntries(inputs.map(p => [p, createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const env = {...process.env, PATH: `${process.cwd()}/${dir}/test-runtime:${developerTools}:${runtime}:${process.env.PATH}`};
const manifest = {command: 'npm run test:ledger-guards', head: git('rev-parse', 'HEAD'), started: stamp(), node: process.version, git: `${developerTools}/git`, scheduling: 'One test-file worker with process-bound idle-sleep inhibition. Complete package command, unchanged assertions, scan window and timeouts.', hashes: fingerprints()};
fs.writeFileSync(`${dir}/ledger-manifest.json`, JSON.stringify(manifest, null, 2));
const privateDir = `${process.env.HOME}/.goldrush/fire-evidence/s3554`;
fs.mkdirSync(privateDir, {recursive: true, mode: 0o700});
const raw = `${privateDir}/ledger-guards.txt`, fd = fs.openSync(raw, 'a', 0o600);
const awake = spawn('/usr/bin/caffeinate', ['-i', '-w', String(process.pid)], {stdio: 'ignore'});
awake.unref();
const child = spawn(`${runtime}/npm`, ['run', 'test:ledger-guards'], {env, stdio: ['ignore', fd, fd]});
console.log(JSON.stringify({gatePid: child.pid, started: manifest.started, git: manifest.git}));
child.on('close', (code, signal) => {
  fs.closeSync(fd);
  awake.kill('SIGTERM');
  let output = fs.readFileSync(raw, 'utf8');
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const i = line.indexOf('='); if (i < 0) continue;
    const value = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    if (value.length > 7) output = output.split(value).join('[REDACTED]');
    if (value.includes('@')) output = output.split(value.split('@').at(-1)).join('[PRIVATE HOST]');
  }
  output = output.replace(/\b(?:sk-(?:ant|proj|live|test)?-?[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9_]{30,}|xox[abp]-[A-Za-z0-9-]{20,})/g, '[REDACTED]');
  fs.writeFileSync(`${dir}/ledger-guards.txt`, output);
  const receipt = {code, signal, finished: stamp(), unchanged: JSON.stringify(fingerprints()) === JSON.stringify(manifest.hashes), headUnchanged: git('rev-parse', 'HEAD') === manifest.head, summary: output.split('\n').filter(l => /^(ℹ (tests|pass|fail|cancelled|skipped)|RESULT:|✖)/.test(l))};
  fs.writeFileSync(`${dir}/ledger-result.json`, JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt));
  if (!receipt.unchanged || !receipt.headUnchanged) throw Error('Concurrent input mutation; refusing clearance');
  const status = fs.readFileSync('STATUS.md', 'utf8');
  const tested = fs.readFileSync(`${dir}/tested-line1.txt`, 'utf8').trimEnd();
  if (status.split('\n')[0] !== tested || git('branch', '--show-current') !== 'main' || git('diff', '--cached', '--name-only')) throw Error('Closeout custody changed');
  if (code === 0) {
    const body = fs.readFileSync(`${dir}/handoff-body.txt`, 'utf8').trimEnd();
    fs.writeFileSync('STATUS.md', `Last updated: ${stamp()} s3554 handoff, lock CLEARED — ${body}` + status.slice(tested.length));
    fs.appendFileSync(`${dir}/report.md`, `\n\nClosing result ${receipt.finished}: READY-FOR-GATES. Complete ledger exited 0; inputs and HEAD unchanged. Counts and chained checks are in ledger-result.json and ledger-guards.txt. The clearing commit is the last write to main.\n`);
  } else {
    fs.appendFileSync(`${dir}/report.md`, `\n\nClosing result ${receipt.finished}: READY-FOR-GATES: NO. Complete ledger exited ${code}, signal ${signal}. STATUS remains ACTIVE. Inspect ledger-result.json and ledger-guards.txt before any changed-premise continuation.\n`);
  }
  git('diff', '--check', '--', 'STATUS.md', 'tasks/BACKLOG.md', 'docs/HANDOVER-2026-09-06-attended.md');
  git('add', '--', 'STATUS.md', 'tasks/BACKLOG.md', 'docs/HANDOVER-2026-09-06-attended.md', ...evidence, `${dir}/test-runtime/node`, `${dir}/ledger-manifest.json`, `${dir}/ledger-result.json`, `${dir}/ledger-guards.txt`);
  console.log(git('commit', '-m', code === 0 ? 's3554: handoff — dry board, current duties and ledger gates pass' : 's3554: blocked handoff — preserve ledger findings'));
  const head = git('rev-parse', 'HEAD');
  console.log(git('push', 'origin', 'main'));
  const remote = git('ls-remote', 'origin', 'refs/heads/main').split(/\s+/)[0];
  if (head !== remote) throw Error('Origin backup mismatch');
  console.log(JSON.stringify({head, remote, cleared: code === 0}));
  process.exitCode = code === 0 ? 0 : 1;
});
