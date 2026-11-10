import fs from 'node:fs';
import { spawn } from 'node:child_process';
const dir = 'artifacts/s3511';
if (Date.now() < Date.parse('2026-11-10T02:10:00Z')) throw Error('LB-01 is not due yet');
if (JSON.parse(fs.readFileSync(`${dir}/private-visibility.txt`, 'utf8')).visibility !== 'PRIVATE') throw Error('Archive is not verified private');
const results = [];
async function run(name, command, args) {
  const start = Date.now();
  const fd = fs.openSync(`${dir}/${name}.txt`, 'a');
  const code = await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', fd, fd] });
    child.on('error', reject);
    child.on('close', (status, signal) => { results.push({ name, status, signal, started: new Date(start).toISOString(), seconds: (Date.now() - start) / 1000 }); resolve(status); });
  });
  fs.closeSync(fd);
  fs.writeFileSync(`${dir}/private-resume-results.json`, JSON.stringify(results, null, 2));
  console.log(name, code);
  if (code !== 0) throw Error(`${name} returned ${code}; read its retained log`);
}
await run('ledger-fill-gaps-retry', process.execPath, ['scripts/ledger-backup-pull.mjs', '--fill-gaps']);
await run('ledger-push', process.execPath, ['scripts/ledger-mirror-push.mjs']);
await run('fire-memory', process.execPath, ['scripts/fire-memory-mirror.mjs']);
await run('mirror-exposure', process.execPath, ['scripts/ledger-mirror-exposure.mjs', '--strict']);
await run('mirror-freshness', process.execPath, ['scripts/ledger-mirror-freshness.mjs']);
await run('private-heads', 'git', ['ls-remote', 'archive', 'refs/heads/ledger-backups', 'refs/heads/fire-memory']);
