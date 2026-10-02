const fs = require('node:fs');
const cp = require('node:child_process');
const dir = __dirname;
const started = new Date();
const fd = fs.openSync(`${dir}/ledger-guards.txt`, 'w');
const child = cp.spawn('/opt/homebrew/bin/npm', ['run', 'test:ledger-guards'], {
  env: { ...process.env, PATH: `/opt/homebrew/bin:${process.env.PATH}` },
  stdio: ['ignore', fd, fd],
});
console.log(`Ledger battery started: pid=${child.pid}, node=${process.version}`);
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('close', (code, signal) => {
  fs.closeSync(fd);
  const result = { started: started.toISOString(), ended: new Date().toISOString(), seconds: (Date.now() - started.getTime()) / 1000, code, signal, node: process.version };
  fs.writeFileSync(`${dir}/ledger-result.json`, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
  process.exitCode = code ?? 1;
});
