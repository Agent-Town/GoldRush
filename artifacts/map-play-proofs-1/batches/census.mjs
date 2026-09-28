// map-play-proofs-1: read secure-rows.jsonl, emit the census table and the per-map status verdicts.
// Read-only. Usage: node census.mjs [--only <comma ids>]
import { readFileSync } from 'node:fs';
const ROWS = '/Users/robin/Claude/Projects/wt-mpp1/artifacts/open-maps-acceptance-e1-e4/secure-rows.jsonl';
const CELLS = ['boots', 'secures', 'banks', 'board', 'reload', 'clean'];
const MAPS = [
  ['e1-baron', 'The Claim-Jumper Baron'], ['e2-pressure-garden', 'The Pressure Garden'], ['e2-incline', 'The Incline'],
  ['e3-blackout-ridge', 'Blackout Ridge'], ['e3-canyon-works', 'The Canyon Works'], ['e3-fairground', 'The Fairground'],
  ['e4-dust-flats', 'The Dust Flats'], ['e4-gusher-county', 'Gusher County'], ['e4-boneyard', 'The Boneyard'],
  ['e8-far-side', 'The Far Side'], ['e8-low-orbit', 'Low Orbit'], ['e8-eclipse', 'The Eclipse'],
  ['e9-dome-basin', 'The Dome Basin'], ['e9-seed-run', 'The Seed Run'], ['e9-devils-alley', "Devil's Alley"],
  ['e9-old-canal', 'The Old Canal'], ['e10-last-claim', 'The Last Claim'], ['e10-river', 'The River'],
];
const rows = readFileSync(ROWS, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
const key = (r) => `${r.contract}|${r.project}`;
const runs = new Map();
for (const r of rows) {
  if (!runs.has(key(r))) runs.set(key(r), []);
  runs.get(key(r)).push(r);
}
const short = (s, n = 110) => (s.length > n ? `${s.slice(0, n)}...` : s).replace(/\|/g, '/');
const firstFail = (r) => CELLS.find((c) => !r[c].ok);
console.log('## Census table (last run per map and project)\n');
console.log('| map | project | secure wave | boots | secures | banks | board | reload | clean | peak | end | runs | note |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
const verdicts = [];
for (const [id, name] of MAPS) {
  for (const project of ['desktop-chrome', 'mobile-chrome']) {
    const all = runs.get(`${id}|${project}`) ?? [];
    const r = all[all.length - 1];
    if (!r) { console.log(`| ${name} (\`${id}\`) | ${project} | ? | NOT RUN | | | | | | | | 0 | no row |`); continue; }
    const marks = CELLS.map((c) => (r[c].ok ? 'PASS' : 'FAIL')).join(' | ');
    const ff = firstFail(r);
    console.log(`| ${name} (\`${id}\`) | ${project} | ${r.secureWave} | ${marks} | ${r.peakWave} | ${r.runStateAtEnd || '?'}, ${r.simAtEnd.toFixed(0)}s, ${r.killsAtEnd} kills, ${r.builds.length} built | ${all.length} | ${ff ? short(`${ff}: ${r[ff].detail}`) : 'all six'} |`);
  }
}
console.log('\n## Per-map verdict for the status doc\n');
for (const [id, name] of MAPS) {
  const d = (runs.get(`${id}|desktop-chrome`) ?? []).slice(-1)[0];
  const m = (runs.get(`${id}|mobile-chrome`) ?? []).slice(-1)[0];
  const ok = (r) => r && CELLS.every((c) => r[c].ok);
  let verdict;
  if (!d || !m) verdict = `INCOMPLETE (desktop ${d ? 'ran' : 'missing'} / mobile ${m ? 'ran' : 'missing'})`;
  else if (ok(d) && ok(m)) verdict = `PASS (desktop ${d.peakWave} / mobile ${m.peakWave})`;
  else {
    const bad = ok(d) ? m : d;
    const which = ok(d) ? 'mobile' : 'desktop';
    const ff = firstFail(bad);
    verdict = `FAIL: ${which} ${ff} - ${bad[ff].detail}`;
  }
  const seams = new Set();
  for (const r of [d, m]) for (const n of r?.notes ?? []) if (/unreachable on foot|could not fund|could not stand|did not place/.test(n)) seams.add(n.replace(/\s*\([^)]*\)/, ''));
  verdicts.push({ id, name, verdict, instrumentSignals: [...seams].slice(0, 4), desktopPeak: d?.peakWave ?? null, mobilePeak: m?.peakWave ?? null, secureWave: d?.secureWave ?? m?.secureWave ?? null });
  console.log(`- **${name}** (\`${id}\`): ${verdict}`);
}
console.log('\n## Counts\n');
const pass = verdicts.filter((v) => v.verdict.startsWith('PASS')).length;
const fail = verdicts.filter((v) => v.verdict.startsWith('FAIL')).length;
const inc = verdicts.filter((v) => v.verdict.startsWith('INCOMPLETE')).length;
console.log(JSON.stringify({ maps: MAPS.length, passBoth: pass, failed: fail, incomplete: inc, rowsInLedger: rows.length }, null, 1));
console.log('\n## Instrument signals per map (economy/geometry notes)\n');
for (const v of verdicts) if (v.instrumentSignals.length) console.log(`- \`${v.id}\`: ${v.instrumentSignals.join('; ')}`);
