// s1252 — pick an IN-SCOPE tasks/*.md with several citations, to use as the
// harness positive control (harness verdicts must equal the real guard's).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const CITE = /((?:[\w./-]*\/)?e2e\/[\w.-]+\.spec\.ts):(\d+)/g;
const files = execFileSync('git', ['ls-files', 'tasks'], { encoding: 'utf8', maxBuffer: 1 << 28 })
  .trim().split('\n').filter((f) => f.endsWith('.md'));
const rows = [];
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  CITE.lastIndex = 0;
  let n = 0;
  while (CITE.exec(t)) n++;
  if (n) rows.push([f, n]);
}
rows.sort((a, b) => b[1] - a[1]);
console.log(`in-scope files carrying citations: ${rows.length}`);
for (const [f, n] of rows.slice(0, 6)) console.log(`  ${String(n).padStart(4)}  ${f}`);
