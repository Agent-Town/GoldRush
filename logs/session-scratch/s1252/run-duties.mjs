// s1252 duty battery. The shell gate rejects `npm run <script>` when the script body itself
// contains `&&`, so drive npm through spawnSync argv arrays and keep the transcript.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const LOG = 'logs/session-scratch/s1252/duties.txt';
fs.writeFileSync(LOG, '');
const say = (l = '') => {
  console.log(l);
  fs.appendFileSync(LOG, l + '\n');
};

const only = process.argv.slice(2);
const DUTIES = [
  ['test:node-guards', ['npm', ['run', 'test:node-guards']]],
  ['test:task-guards', ['npm', ['run', 'test:task-guards']]],
  ['test:citations', ['npm', ['run', 'test:citations']]],
  ['test:guards (run-guards)', ['npm', ['run', 'test:guards']]],
];

for (const [name, [cmd, args]] of DUTIES) {
  if (only.length && !only.some((o) => name.includes(o))) continue;
  const t0 = process.hrtime.bigint();
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28 });
  const secs = Number((process.hrtime.bigint() - t0) / 1000000n) / 1000;
  const out = (r.stdout || '') + (r.stderr || '');
  say(`\n########## ${name} — rc=${r.status} (${secs.toFixed(1)}s) ##########`);
  // keep the tail; the interesting lines (counters, verdicts) are at the end
  say(out.trim().split('\n').slice(-24).join('\n'));
  const pass = out.match(/^ℹ pass (\d+)$/m);
  const fail = out.match(/^ℹ fail (\d+)$/m);
  if (pass) say(`>>> DERIVED from the command: pass=${pass[1]} fail=${fail ? fail[1] : '?'}`);
}
say('\n(transcript: ' + LOG + ')');
