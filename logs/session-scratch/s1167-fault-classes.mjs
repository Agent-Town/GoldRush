// s1167: cluster the BOTH-failing logical tests by failure SIGNATURE.
// The inventory lists faults; it does not group them. F-1159-2 proved the board's
// red LABELS are welded (three tests, three mechanisms), so the useful next step is
// the inverse: find where many tests share ONE mechanism, so repairs target classes.
import fs from 'node:fs';
const report = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const TARGET = new Set(['desktop-chrome', 'mobile-chrome']);
const rows = [];
(function walk(suites) {
  for (const s of suites ?? []) {
    for (const spec of s.specs ?? []) {
      for (const t of spec.tests ?? []) {
        const r = t.results?.at(-1);
        if (!r) continue;
        rows.push({ file: spec.file, line: spec.line, title: spec.title, project: t.projectName,
          status: r.status, expected: t.expectedStatus ?? 'passed',
          errs: (r.errors ?? []).map((e) => e.message ?? '').join('\n') });
      }
    }
    walk(s.suites);
  }
})(report.suites);

const strip = (s) => s.replace(/\[\d+m/g, '');
const bad = (x) => x.status !== x.expected && x.status !== 'skipped';
const failed = rows.filter((x) => TARGET.has(x.project) && bad(x));

// signature = first meaningful error line, with volatile numbers/quotes generalised
function signature(x) {
  const first = strip(x.errs).split('\n').map((l) => l.trim()).filter(Boolean)[0] ?? '(no error text)';
  return first
    .replace(/\d+/g, 'N')
    .replace(/"[^"]*"/g, '"…"')
    .replace(/'[^']*'/g, "'…'")
    .slice(0, 110);
}

const groups = new Map();
for (const x of failed) {
  const sig = signature(x);
  if (!groups.has(sig)) groups.set(sig, { execs: 0, files: new Set() });
  const g = groups.get(sig);
  g.execs++;
  g.files.add(x.file);
}

const ranked = [...groups.entries()].sort((a, b) => b[1].execs - a[1].execs);
console.log(`${failed.length} failing executions across ${new Set(failed.map((x) => x.file)).size} spec files`);
console.log(`grouped into ${ranked.length} distinct failure signatures\n`);
let cum = 0;
for (const [sig, g] of ranked.slice(0, 14)) {
  cum += g.execs;
  console.log(`${String(g.execs).padStart(3)} execs | ${String(g.files.size).padStart(2)} files | ${sig}`);
}
console.log(`\ntop-14 signatures cover ${cum}/${failed.length} = ${(100 * cum / failed.length).toFixed(1)}% of failing executions`);

// the four town blender pilots specifically
console.log('\n--- town-*-blender pilots ---');
for (const x of failed.filter((r) => /town-.*-blender/.test(r.file) && r.project === 'desktop-chrome')) {
  console.log(`${x.file}:${x.line} => ${signature(x)}`);
}
