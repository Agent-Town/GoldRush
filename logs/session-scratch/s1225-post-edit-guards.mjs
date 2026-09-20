// s1225 — re-run the guards whose INPUTS my ledger edits touched, before the handoff commit.
// tasks/BACKLOG.md feeds task-guard-audit; tasks/goals.json feeds goal-tracker (unmodified,
// but node-guards is the cheap whole-family re-assert, as s1224 did after its inventory append).
import { spawnSync } from 'child_process';
import fs from 'fs';

const out = 'logs/session-scratch/s1225-guard-runs';
fs.mkdirSync(out, { recursive: true });

for (const t of ['test:task-guards', 'test:node-guards']) {
  const r = spawnSync('npm', ['run', '--silent', t], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 300_000,
  });
  fs.writeFileSync(`${out}/postedit-${t.replace(/:/g, '-')}.log`,
    `$ npm run ${t}\nexit: ${r.status}\n\n${r.stdout ?? ''}\n=== STDERR ===\n${r.stderr ?? ''}\n`);
  const tail = (r.stdout ?? '').trim().split('\n').slice(-3).join(' | ').slice(0, 200);
  console.log(`${r.status === 0 ? 'PASS' : 'FAIL'}  ${t}  exit=${r.status}\n   ${tail}\n`);
}
