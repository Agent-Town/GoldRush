const fs = require('node:fs');
const { spawn, execFileSync } = require('node:child_process');
const dir = 'artifacts/s3005';
const started = Date.now();
const record = {
  startedAt: new Date(started).toISOString(),
  main: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  node: process.version,
  nodePath: process.execPath,
  command: 'npm run test:ledger-guards',
};
fs.writeFileSync(`${dir}/ledger-start.json`, `${JSON.stringify(record, null, 2)}\n`);
const fd = fs.openSync(`${dir}/ledger-guards.txt`, 'wx');
const child = spawn('/opt/homebrew/bin/npm', ['run', 'test:ledger-guards'], {
  env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH}` },
  stdio: ['ignore', fd, fd],
});
console.log(JSON.stringify({ ...record, pid: child.pid }));
child.on('error', (error) => { console.error(error.message); });
child.on('close', (code, signal) => {
  fs.closeSync(fd);
  const result = {
    ...record,
    finishedAt: new Date().toISOString(),
    code,
    signal,
    durationSeconds: (Date.now() - started) / 1000,
  };
  fs.writeFileSync(`${dir}/ledger-result.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result));
  process.exitCode = code ?? 1;
});
