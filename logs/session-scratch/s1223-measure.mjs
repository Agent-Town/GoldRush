// s1223: re-derive F-1222-3's premise before acting on its remedy.
// Runs e2e/ap-standing-orders.spec.ts against a scratch server and reports PER-PROJECT counts.
// Pooling desktop+mobile is forbidden here (s1221 standing warning) — the whole stale label was
// a scope claim ("mobile-only"), so the arms must be counted separately or the answer is unreadable.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';

const port = process.argv[2] || '5233';
const repeat = process.argv[3] || '4';
const outFile = process.argv[4] || 'logs/session-scratch/s1223-ap-standing-orders.json';

console.log('loadavg at start:', os.loadavg().map((n) => n.toFixed(2)).join(' '));

const r = spawnSync(
  'npx',
  [
    'playwright', 'test', 'e2e/ap-standing-orders.spec.ts',
    '--workers=4', `--repeat-each=${repeat}`,
    '--reporter=json',
  ],
  {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 512 * 1024 * 1024, // spawnSync silently truncates stdout under load — give it room
    timeout: 20 * 60_000,
    env: {
      ...process.env,
      GR_CAPTURE_EXTERNAL_SERVER: '1',
      GR_CAPTURE_BASE_URL: `http://127.0.0.1:${port}`,
      PLAYWRIGHT_JSON_OUTPUT_NAME: outFile,
    },
  },
);

console.log('exit code:', r.status);
console.log('loadavg at end:', os.loadavg().map((n) => n.toFixed(2)).join(' '));

let report;
try {
  report = JSON.parse(fs.readFileSync(outFile, 'utf8'));
} catch {
  try { report = JSON.parse(r.stdout); } catch {
    console.log('NO PARSEABLE REPORT. stderr tail:\n' + (r.stderr || '').slice(-3000));
    process.exit(1);
  }
}

const tally = new Map();
const failures = [];
const walk = (suites) => {
  for (const s of suites ?? []) {
    for (const spec of s.specs ?? []) {
      for (const t of spec.tests ?? []) {
        const key = t.projectName;
        const acc = tally.get(key) ?? { pass: 0, fail: 0 };
        for (const res of t.results ?? []) {
          if (res.status === 'passed') acc.pass++;
          else {
            acc.fail++;
            failures.push({
              project: key,
              title: spec.title.slice(0, 60),
              line: res.error?.location?.line ?? spec.line,
              msg: (res.error?.message ?? '').split('\n')[0].slice(0, 110),
            });
          }
        }
        tally.set(key, acc);
      }
    }
    walk(s.suites);
  }
};
walk(report.suites);

console.log('\n=== PER-PROJECT (never pooled) ===');
for (const [proj, acc] of tally) {
  const total = acc.pass + acc.fail;
  const rate = total ? ((acc.fail / total) * 100).toFixed(1) : 'n/a';
  console.log(`${proj}: ${acc.fail}/${total} failed (${rate}%)`);
}
if (failures.length) {
  console.log('\n=== FAILURES ===');
  for (const f of failures) console.log(`  ${f.project} :${f.line} ${f.title} — ${f.msg}`);
} else {
  console.log('\nzero failures.');
}
