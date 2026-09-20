// s1250 mutation harness — one mutation per branch, on the SUBJECT (never the guard script).
// Each mutation restores the file byte-identically before the next runs.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import crypto from 'node:crypto';

const SUBJECT = 'scripts/drain-block-check.mjs';
const BAK = 'logs/session-scratch/s1250/drain-block-check.mjs.bak';
const original = fs.readFileSync(BAK, 'utf8');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);

const MUTATIONS = [
  {
    name: 'M1 revert exact-match-first to the old pure longest-wins sort',
    from: `  const exact = (h) => h.taskKey === key;
  hits.sort((a, b) => (exact(a) !== exact(b) ? (exact(a) ? -1 : 1) : b.taskKey.length - a.taskKey.length));`,
    to: `  hits.sort((a, b) => b.taskKey.length - a.taskKey.length);`,
    predict: 'the two exact-match arms + the rider disclosure arm go red',
  },
  {
    name: 'M2 drop the "you asked about" blocked-sibling disclosure',
    from: `      if (hits[0] && hits[0].id !== blockedHit.id) {
        console.log(\`  you asked about : \${hits[0].id}  status="\${hits[0].status}" (\${hits[0].taskFile})\`);
        console.log(\`                    refused via the blocked SIBLING above, which also matched.\`);
      }`,
    to: '',
    predict: 'only the rider arm goes red',
  },
  {
    name: 'M3 drop the "also matched" disclosure on the CLOSED arm',
    from: `    if (hits.length > 1) {
      console.log(\`    also matched    : \${hits.slice(1).map((l) => \`\${l.id}[\${l.status}]\`).join(', ')}\`);
    }`,
    to: '',
    predict: 'only the exact-match false-CLEAR arm goes red',
  },
];

const log = [];
log.push(`baseline sha256 ${sha(original)}`);

for (const m of MUTATIONS) {
  if (!original.includes(m.from)) {
    log.push(`\n${m.name}\n  !! ANCHOR NOT FOUND — mutation did not apply, result would be meaningless`);
    continue;
  }
  fs.writeFileSync(SUBJECT, original.replace(m.from, m.to));
  const r = spawnSync('node', ['--test', 'scripts/drain-block-check.test.mjs'], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 180_000,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const pass = (out.match(/^# pass (\d+)$/m) || out.match(/ℹ pass (\d+)/) || [])[1];
  const fail = (out.match(/^# fail (\d+)$/m) || out.match(/ℹ fail (\d+)/) || [])[1];
  const reds = [...out.matchAll(/^✖ (.+?) \(/gm)].map((x) => x[1]);
  log.push(`\n${m.name}`);
  log.push(`  predicted : ${m.predict}`);
  log.push(`  rc=${r.status}  pass=${pass} fail=${fail}`);
  for (const red of reds) log.push(`  RED  ${red}`);
  fs.writeFileSync(SUBJECT, original);
  if (sha(fs.readFileSync(SUBJECT, 'utf8')) !== sha(original)) log.push('  !! RESTORE FAILED');
}

fs.writeFileSync(SUBJECT, original);
log.push(`\nrestored sha256 ${sha(fs.readFileSync(SUBJECT, 'utf8'))} (must equal baseline)`);
const text = log.join('\n');
console.log(text);
fs.writeFileSync('logs/session-scratch/s1250/mutation-result.txt', text + '\n');
