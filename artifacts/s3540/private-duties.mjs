import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const dir = 'artifacts/s3540';
const privateDir = process.env.HOME + '/.goldrush/fire-evidence/s3540';
fs.mkdirSync(privateDir, {recursive: true, mode: 0o700});
const node = '/Users/robin/.nvm/versions/node/v26.4.0/bin/node';
const env = {...process.env, PATH: '/Users/robin/.nvm/versions/node/v26.4.0/bin:' + process.env.PATH,
  RSYNC_RSH: 'ssh -o BatchMode=yes -o ConnectTimeout=5 -o ServerAliveInterval=5 -o ServerAliveCountMax=2',
  GIT_SSH_COMMAND: 'ssh -o BatchMode=yes -o ConnectTimeout=5 -o ServerAliveInterval=5 -o ServerAliveCountMax=2'};
function scrub(text) {
  for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
    const i = line.indexOf('='); if (i < 0) continue;
    const value = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    if (value.length > 7) text = text.split(value).join('[REDACTED]');
    if (value.includes('@')) text = text.split(value.split('@').at(-1)).join('[PRIVATE HOST]');
  }
  return text.replace(/\b(?:sk-(?:ant|proj|live|test)?-?[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9_]{30,}|xox[abp]-[A-Za-z0-9-]{20,})/g, '[REDACTED]');
}
const receipts = [];
function run(name, cmd, args, timeout = 180000) {
  const started = Date.now();
  const r = spawnSync(cmd, args, {encoding: 'utf8', env, timeout, maxBuffer: 16e6});
  const raw = (r.stdout ?? '') + (r.stderr ?? '');
  fs.writeFileSync(`${privateDir}/${name}.txt`, raw, {mode: 0o600});
  fs.writeFileSync(`${dir}/${name}.txt`, scrub(raw));
  const receipt = {name, code: r.status, signal: r.signal, error: r.error?.code, seconds: (Date.now()-started)/1000};
  receipts.push(receipt); fs.writeFileSync(`${dir}/private-duty-results.json`, JSON.stringify(receipts,null,2));
  console.log(receipt);
  return r;
}
const visibility = run('private-visibility', 'gh', ['repo','view','Agent-Town/GoldRush-archive','--json','visibility'], 30000);
if (visibility.status !== 0 || JSON.parse(visibility.stdout).visibility !== 'PRIVATE') throw Error('Private archive not verified');
run('ledger-fill-gaps', node, ['scripts/ledger-backup-pull.mjs', '--fill-gaps']);
run('ledger-push', node, ['scripts/ledger-mirror-push.mjs']);
run('fire-memory', node, ['scripts/fire-memory-mirror.mjs']);
run('mirror-exposure', node, ['scripts/ledger-mirror-exposure.mjs','--strict']);
run('mirror-freshness', node, ['scripts/ledger-mirror-freshness-guard.mjs']);
run('private-heads', 'git', ['ls-remote','archive','refs/heads/ledger-backups','refs/heads/fire-memory'], 30000);
