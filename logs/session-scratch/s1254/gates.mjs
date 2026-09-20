// s1254 gate battery driver — spawnSync argv arrays (shell gate cannot run these as one line).
import { spawnSync } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';

const out = new URL('./gates-transcript.txt', import.meta.url);
writeFileSync(out, `s1254 gate battery\n`);

function run(label, cmd, args) {
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const body = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  appendFileSync(out, `\n===== ${label} =====\n$ ${cmd} ${args.join(' ')}\nrc=${r.status} ${secs}s\n${body}\n`);
  // print only a tail so the transcript stays the record
  const tail = body.split('\n').slice(-25).join('\n');
  console.log(`\n===== ${label} — rc=${r.status} ${secs}s =====\n${tail}`);
  return r.status;
}

const jobs = JSON.parse(process.argv[2]);
const results = {};
for (const [label, cmd, ...args] of jobs) results[label] = run(label, cmd, args);
console.log('\nSUMMARY ' + JSON.stringify(results));
appendFileSync(out, '\nSUMMARY ' + JSON.stringify(results) + '\n');
