// s1167 independent re-derivation of suite-red-inventory.md's headline statistics.
// Deliberately does NOT import or reuse scripts/suite-red-inventory.mjs — a report
// checked by its own reducer is tautological (the s1162 second-kernel lesson).
// Written from the Playwright JSON shape alone.
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
        rows.push({
          file: spec.file ?? s.file,
          line: spec.line,
          title: spec.title,
          project: t.projectName,
          status: r.status,
          expected: t.expectedStatus ?? 'passed',
          errs: (r.errors ?? []).map((e) => e.message ?? '').join(' '),
          dur: r.duration ?? 0,
        });
      }
    }
    walk(s.suites);
  }
})(report.suites);

const bad = (x) => x.status !== x.expected && x.status !== 'skipped';

const target = rows.filter((x) => TARGET.has(x.project));
const other = rows.filter((x) => !TARGET.has(x.project));
const failed = target.filter(bad);

// logical test identity = file + declaration line + title
const key = (x) => `${x.file}::${x.line}::${x.title}`;
const byKey = new Map();
for (const x of target) {
  if (!byKey.has(key(x))) byKey.set(key(x), {});
  byKey.get(key(x))[x.project] = bad(x) ? 'FAIL' : x.status === 'skipped' ? 'SKIP' : 'PASS';
}

let both = 0, mobileOnly = 0, desktopOnly = 0, incomplete = 0;
const mobileOnlyList = [];
for (const [k, v] of byKey) {
  const d = v['desktop-chrome'], m = v['mobile-chrome'];
  if (!d || !m || d === 'SKIP' || m === 'SKIP') {
    if (d === 'FAIL' || m === 'FAIL') incomplete++;
    continue;
  }
  if (d === 'FAIL' && m === 'FAIL') both++;
  else if (m === 'FAIL') { mobileOnly++; mobileOnlyList.push(k); }
  else if (d === 'FAIL') desktopOnly++;
}

const isTimeout = (x) => /Test timeout of \d+ms exceeded/.test(x.errs);
const isCrash = (x) => /Target (page|browser)?.*(crash|closed)/i.test(x.errs);

console.log(JSON.stringify({
  totalTargetExecutions: target.length,
  passedTarget: target.filter((x) => x.status === 'passed').length,
  failedTargetExecutions: failed.length,
  otherProjectExecutions: other.length,
  otherProjectFailures: other.filter(bad).length,
  BOTH: both,
  MOBILE_ONLY: mobileOnly,
  DESKTOP_ONLY: desktopOnly,
  INCOMPLETE: incomplete,
  timeoutFailures: failed.filter(isTimeout).length,
  crashFailures: failed.filter(isCrash).length,
  logicalTests: byKey.size,
}, null, 2));
console.log('\nMOBILE-ONLY logical tests (independent):');
for (const k of mobileOnlyList.sort()) console.log('  ' + k);
