// F-1398-1: price every candidate predicate arm on the real corpus, and reconcile
// against s1479's inherited counts (21 name / 7 no-config / 4 offenders / 2 command-form).
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const tracked = execSync('git ls-files "tasks/*.md" "tasks/**/*.md"', { maxBuffer: 1 << 28 })
  .toString().trim().split('\n').filter(Boolean);

const defaultCfg = fs.readFileSync('playwright.config.ts', 'utf8');
const claimed = [...defaultCfg.match(/const claimedByAnotherConfig = \[([\s\S]*?)\];/)[1]
  .matchAll(/'\*\*\/([^']+)'/g)].map((m) => m[1]);
const configs = fs.readdirSync('.').filter((f) => /^playwright\..*\.config\.ts$/.test(f));
const owner = {};
for (const spec of claimed) {
  const base = spec.replace(/\.spec\.ts$/, '');
  for (const c of configs) {
    const tm = fs.readFileSync(c, 'utf8').match(/testMatch:\s*(.+)/);
    if (tm && tm[1].includes(base)) { owner[spec] = c; break; }
  }
}
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const alias = {};
for (const [k, v] of Object.entries(pkg.scripts))
  for (const c of Object.values(owner)) if (v.includes(c)) (alias[c] ||= []).push(k);

const SELFCHECK = /^\s*(#+\s*)?(\*\*)?(SELF-?CHECK|GATES?|SELF CHECK|ACCEPTANCE)/i;
const ADJACENT = /adjacent[^\n]*(unmodified|green)|unmodified-green/i;
const RUNCMD = /(npx\s+)?playwright\s+test/;

const rows = [];
for (const f of tracked) {
  let txt; try { txt = fs.readFileSync(f, 'utf8'); } catch { continue; }
  const hits = claimed.filter((s) => txt.includes(s));
  if (!hits.length) continue;
  const lines = txt.split('\n');

  // where does the self-check / gates region begin?
  let scStart = Infinity;
  lines.forEach((l, i) => { if (i < scStart && SELFCHECK.test(l)) scStart = i; });

  const namesOwningConfig = hits.some((s) => {
    const c = owner[s];
    return txt.includes(c) || (alias[c] || []).some((a) => txt.includes(a));
  });
  const namesAnyConfig = /playwright\.[a-z0-9.-]*config\.ts/i.test(txt) || namesOwningConfig;

  const specLines = [];
  lines.forEach((l, i) => { if (hits.some((s) => l.includes(s))) specLines.push({ n: i + 1, t: l }); });

  const cmdForm = specLines.some((sl) => RUNCMD.test(sl.t) && !/--config/.test(sl.t));
  const gateForm = specLines.some((sl) => (sl.n - 1) >= scStart || ADJACENT.test(sl.t));

  rows.push({ f, namesOwningConfig, namesAnyConfig, cmdForm, gateForm, scStart, specLines });
}

const namesSpec = rows.length;
const noOwning = rows.filter((r) => !r.namesOwningConfig);
const noAny = rows.filter((r) => !r.namesAnyConfig);
const armA = noOwning.filter((r) => r.cmdForm);
const armB = noOwning.filter((r) => r.cmdForm || r.gateForm);
const armC = noOwning; // "any mention, no owning config"

console.log('DENOMINATOR  tracked tasks/**.md            :', tracked.length);
console.log('             name a claimed spec            :', namesSpec, '   (s1479 said 21)');
console.log('             ...naming no OWNING config     :', noOwning.length);
console.log('             ...naming no config AT ALL     :', noAny.length, '  <-- reconciles s1479\'s 7?');
console.log('');
console.log('ARM (a) command-form, no owning config      :', armA.length);
armA.forEach((r) => console.log('        ', r.f));
console.log('ARM (b) command OR gate/adjacent context    :', armB.length);
armB.forEach((r) => console.log('        ', r.f, r.cmdForm ? '[cmd]' : '[gate]'));
console.log('ARM (c) any mention, no owning config       :', armC.length);
armC.forEach((r) => console.log('        ', r.f));
console.log('');
console.log('--- files in ARM (c) but NOT ARM (b): the ones a broad rule would over-flag ---');
armC.filter((r) => !armB.includes(r)).forEach((r) => {
  console.log('  ' + r.f + '  (selfcheck starts line ' + (r.scStart === Infinity ? 'NONE' : r.scStart + 1) + ')');
  r.specLines.forEach((sl) => console.log('     :' + sl.n + '  ' + sl.t.trim().slice(0, 180)));
});
