// s1225 / F-1125-1 re-derivation — RUN the guards that nothing runs.
//
// F-1125-1 (tasks/BACKLOG.md:1588) measured that seven npm guard scripts have no automated
// caller: no .github/workflows, and zero references in scripts/, .claude/skills/ or
// scripts/fire.md.  `test:node-guards` survives on fire habit; the other six on nothing.
// Re-verified true this fire.  An unrun guard is an UNREAD VERDICT — so read them.
//
// Exit codes are captured from each COMMAND, never from a pipe tail (fire.md §3), and each
// run's full stdout+stderr is written to disk rather than buffered through a pipe, because
// spawnSync silently truncates stdout under load.
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const outDir = path.join(root, 'logs/session-scratch/s1225-guard-runs');
fs.mkdirSync(outDir, { recursive: true });

// The six with no caller at all, plus node-guards last as a positive control: it is run every
// drain and read 78/78 on this exact tree in s1224, so if MY harness is broken it fails too.
const targets = [
  'test:power-budget',
  'test:stats',
  'test:accounts',
  'test:mp',
  'test:deploy-contract',
  'test:deploy-site-contract',
  'test:node-guards',
];

const results = [];
for (const t of targets) {
  const started = Date.now();
  const r = spawnSync('npm', ['run', '--silent', t], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    timeout: 300_000,
  });
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  const log = `$ npm run ${t}\n--- exit: ${r.status} (signal ${r.signal ?? 'none'}) in ${secs}s ---\n\n=== STDOUT ===\n${r.stdout ?? ''}\n\n=== STDERR ===\n${r.stderr ?? ''}\n`;
  fs.writeFileSync(path.join(outDir, `${t.replace(/[:/]/g, '-')}.log`), log);
  results.push({ script: t, exit: r.status, signal: r.signal ?? null, seconds: Number(secs) });
  const tail = (r.stdout ?? '').trim().split('\n').slice(-2).join(' | ').slice(0, 160);
  console.log(`${r.status === 0 ? 'PASS' : 'FAIL'}  ${t.padEnd(26)} exit=${String(r.status).padEnd(5)} ${secs}s   ${tail}`);
}

fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(results, null, 2));
const failed = results.filter((r) => r.exit !== 0);
console.log(`\n${results.length} guards run · ${failed.length} FAILING: ${failed.map((f) => f.script).join(', ') || 'none'}`);
console.log(`full logs: logs/session-scratch/s1225-guard-runs/`);
