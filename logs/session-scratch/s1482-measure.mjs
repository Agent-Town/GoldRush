// F-1398-1 predicate pricing. Measures the corpus, both candidate arms, and prints
// every matching LINE so the choice is made by reading, not by trusting a count.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const tracked = execSync('git ls-files "tasks/*.md" "tasks/**/*.md"', { maxBuffer: 1 << 28 })
  .toString().trim().split('\n').filter(Boolean);
console.log('tracked tasks/**.md files:', tracked.length);

// derive claimed specs from the DEFAULT config, then find each owner by testMatch.
const defaultCfg = fs.readFileSync('playwright.config.ts', 'utf8');
const block = defaultCfg.match(/const claimedByAnotherConfig = \[([\s\S]*?)\];/);
const claimed = [...block[1].matchAll(/'\*\*\/([^']+)'/g)].map((m) => m[1]);
console.log('claimed specs:', claimed.join(', '));

const configs = fs.readdirSync('.').filter((f) => /^playwright\..*\.config\.ts$/.test(f));
const owner = {};
for (const spec of claimed) {
  const base = spec.replace(/\.spec\.ts$/, '');
  for (const c of configs) {
    const txt = fs.readFileSync(c, 'utf8');
    const tm = txt.match(/testMatch:\s*(.+)/);
    if (tm && tm[1].includes(base)) { owner[spec] = c; break; }
  }
}
console.log('owners:', JSON.stringify(owner, null, 2));

const ownerTokens = new Set(Object.values(owner));
// an npm script counts as naming the config too
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const scriptAliases = {};
for (const [k, v] of Object.entries(pkg.scripts)) {
  for (const c of ownerTokens) if (v.includes(c)) (scriptAliases[c] ||= []).push(k);
}
console.log('npm aliases:', JSON.stringify(scriptAliases));

const rows = [];
for (const f of tracked) {
  let txt;
  try { txt = fs.readFileSync(f, 'utf8'); } catch { continue; }
  const hits = claimed.filter((s) => txt.includes(s));
  if (!hits.length) continue;
  // does the file name ANY owning config (file name or its npm alias) anywhere?
  const namesConfig = hits.some((s) => {
    const c = owner[s];
    if (txt.includes(c)) return true;
    return (scriptAliases[c] || []).some((a) => txt.includes(a));
  });
  const lines = txt.split('\n');
  const specLines = [];
  lines.forEach((l, i) => { if (hits.some((s) => l.includes(s))) specLines.push({ n: i + 1, t: l.trim() }); });
  rows.push({ f, hits, namesConfig, specLines });
}

console.log('\n=== masters naming a claimed spec: ' + rows.length + ' ===');
const noConfig = rows.filter((r) => !r.namesConfig);
console.log('=== of those, naming NO owning config anywhere: ' + noConfig.length + ' ===\n');
for (const r of noConfig) {
  console.log('--- ' + r.f + '  [' + r.hits.join(',') + '] ---');
  for (const sl of r.specLines) console.log('   :' + sl.n + '  ' + sl.t.slice(0, 400));
  console.log('');
}
