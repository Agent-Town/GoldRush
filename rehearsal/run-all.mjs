// Sequential orchestrator: run the rehearsal in saga order on ONE shared profile.
// Each is a child process so the persistent-profile lock is released between
// segments. Any failure stops the traversal for diagnosis.
import { spawn } from 'node:child_process';

const SEQUENCE = [
  'e1-01-founding',
  'e1-01b-first-claim-run',
  'e1-02-baron',
  'e1-03-mill-and-t1',
  'e2-01-hill-mine',
  'e2-02-t2',
  'e3-01-canyon-crawler',
  'e3-02-t3',
  'e4-01-dust-flats-yacht',
  'e4-02-t4',
  'e5-01-deepwater-queen',
  'e5-01b-deepwater-40min-probe',
  'e5-02-t5',
  'e6-01-mesa-homemaker',
  'e6-02-the-wall',
  'e6-03-board-chapters-proof',
  'e7-01-relay-echo',
  'e8-01-mare-claw',
  'e9-01-basin-digger',
  'e10-01-finale',
];

const start = Number(process.argv[2] ?? 0);
const results = [];
for (let i = start; i < SEQUENCE.length; i += 1) {
  const name = SEQUENCE[i];
  console.log(`\n========== [${i}] ${name} ==========`);
  const code = await new Promise((resolve) => {
    const child = spawn('node', [`rehearsal/segments/${name}.mjs`], { stdio: 'inherit' });
    const timer = setTimeout(() => { console.log(`!! ${name} exceeded 13min — killing`); child.kill('SIGKILL'); }, 13 * 60_000);
    child.on('exit', (c) => { clearTimeout(timer); resolve(c ?? -1); });
  });
  results.push({ name, code });
  console.log(`---------- [${i}] ${name} → exit ${code} ----------`);
  if (code !== 0) {
    console.log(`STOP: ${name} failed; diagnose its footage/log before resuming at index ${i}.`);
    process.exitCode = code;
    break;
  }
}
console.log('\n=== SEQUENCE SUMMARY ===');
for (const r of results) console.log(`${r.code === 0 ? 'OK ' : 'ERR'} ${r.name} (exit ${r.code})`);
