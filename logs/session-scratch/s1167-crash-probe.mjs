// s1167: isolate the one execution my crash regex matched but the report called "Crashes: 0".
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
const bad = (x) => x.status !== x.expected && x.status !== 'skipped';
for (const x of rows.filter((x) => TARGET.has(x.project) && bad(x))) {
  if (/Target (page|browser)?.*(crash|closed)/i.test(x.errs)) {
    console.log('FILE :', x.file + ':' + x.line);
    console.log('TITLE:', x.title);
    console.log('PROJ :', x.project, '| result status:', x.status);
    console.log('ERR  :', x.errs.split('\n').slice(0, 6).join('\n       '));
  }
}
// also: how many executions carry playwright's own "interrupted"/"crashed" result status?
const byStatus = {};
for (const x of rows) byStatus[x.status] = (byStatus[x.status] ?? 0) + 1;
console.log('\nresult.status histogram (all projects):', JSON.stringify(byStatus));
