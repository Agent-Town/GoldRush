// map-play-proofs-1 item 4: build the census doc and the eighteen status-doc cells from the rows.
import { readFileSync, writeFileSync } from 'node:fs';
const W = '/Users/robin/Claude/Projects/wt-mpp1';
const CELLS = ['boots', 'secures', 'banks', 'board', 'reload', 'clean'];
const MAPS = [
  ['e1-baron', 'The Claim-Jumper Baron'], ['e2-pressure-garden', 'The Pressure Garden'], ['e2-incline', 'The Incline'],
  ['e3-blackout-ridge', 'Blackout Ridge'], ['e3-canyon-works', 'The Canyon Works'], ['e3-fairground', 'The Fairground'],
  ['e4-dust-flats', 'The Dust Flats'], ['e4-gusher-county', 'Gusher County'], ['e4-boneyard', 'The Boneyard'],
  ['e8-far-side', 'The Far Side'], ['e8-low-orbit', 'Low Orbit'], ['e8-eclipse', 'The Eclipse'],
  ['e9-dome-basin', 'The Dome Basin'], ['e9-seed-run', 'The Seed Run'], ['e9-devils-alley', "Devil's Alley"],
  ['e9-old-canal', 'The Old Canal'], ['e10-last-claim', 'The Last Claim'], ['e10-river', 'The River'],
];
const rows = readFileSync(`${W}/artifacts/open-maps-acceptance-e1-e4/secure-rows.jsonl`, 'utf8')
  .trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
const partial = (r) => CELLS.some((c) => r[c].detail === 'not run');
const runsOf = (id, project) => rows.filter((r) => r.contract === id && r.project === project);
const best = (id, project) => { const all = runsOf(id, project); const full = all.filter((r) => !partial(r)); return full[full.length - 1] ?? all[all.length - 1] ?? null; };
const kitDenied = (r) => (r?.notes ?? []).some((n) => n.startsWith('no build offer for'));
const esc = (s) => String(s).replace(/\|/g, '/').replace(/\n/g, ' ');
const firstFail = (r) => CELLS.find((c) => !r[c].ok);
// classify one project's run
function classify(r) {
  if (!r) return { kind: 'MISSING', note: 'no row' };
  if (partial(r)) return { kind: 'PARTIAL', note: `stopped mid-run (cells left "not run"); boots ${r.boots.ok ? 'passed' : 'failed'}, peak wave ${r.peakWave}` };
  if (CELLS.every((c) => r[c].ok)) return { kind: 'PASS', note: 'all six' };
  if (r.secures.ok) return { kind: 'SECURED', note: `secured at wave ${r.peakWave}; ${firstFail(r)} then fails: ${r[firstFail(r)].detail}` };
  if (kitDenied(r) && r.builds.length === 0) return { kind: 'INSTRUMENT', note: `the generic kit is not on this map's build menu, 0 buildings: ${(r.notes.find((n) => n.startsWith('no build offer')) ?? '')}` };
  return { kind: 'FAIL', note: `${firstFail(r)}: ${r[firstFail(r)].detail}` };
}
const out = [];
const verdicts = [];
for (const [id, name] of MAPS) {
  const d = best(id, 'desktop-chrome'); const m = best(id, 'mobile-chrome');
  const cd = classify(d); const cm = classify(m);
  for (const [r, c, project] of [[d, cd, 'desktop-chrome'], [m, cm, 'mobile-chrome']]) {
    out.push(r
      ? `| ${name} (\`${id}\`) | ${project} | ${r.secureWave} | ${CELLS.map((k) => (r[k].ok ? 'PASS' : (r[k].detail === 'not run' ? '-' : 'FAIL'))).join(' | ')} | ${r.peakWave} | ${r.runStateAtEnd || '?'} | ${r.simAtEnd.toFixed(0)} | ${r.builds.length} | ${r.killsAtEnd} | ${c.kind}: ${esc(c.note).slice(0, 190)} |`
      : `| ${name} (\`${id}\`) | ${project} | ? | - | - | - | - | - | - | - | - | - | - | MISSING: no row |`);
  }
  // one verdict per map, for the status doc
  let cell;
  if (cd.kind === 'PASS' && cm.kind === 'PASS') cell = `play proof 2026-09-25: PASS (desktop ${d.peakWave} / mobile ${m.peakWave})`;
  else if (cd.kind === 'MISSING' || cm.kind === 'MISSING' || cd.kind === 'PARTIAL' || cm.kind === 'PARTIAL') cell = `play proof 2026-09-25: INCOMPLETE (desktop ${cd.kind}, mobile ${cm.kind})`;
  else if (cd.kind === 'INSTRUMENT' || cm.kind === 'INSTRUMENT') cell = `play proof 2026-09-25: instrument limit: the generic kit is not offered on this map, 0 buildings raised, no combat reached (F-MPP1-2)`;
  else if (cd.kind === 'SECURED' && cm.kind === 'SECURED') cell = `play proof 2026-09-25: instrument limit: secured on both projects (desktop wave ${d.peakWave} / mobile wave ${m.peakWave}), banks unanswerable by the harness (F-MPP1-1)`;
  else {
    const bad = cd.kind === 'FAIL' ? ['desktop', d] : ['mobile', m];
    const other = cd.kind === 'FAIL' && cm.kind === 'FAIL' ? ` (mobile too: ${firstFail(m)} ${m.runStateAtEnd} wave ${m.peakWave})` : '';
    cell = `play proof 2026-09-25: FAIL: ${bad[0]} ${firstFail(bad[1])} - ${bad[1][firstFail(bad[1])].detail}${other}`;
  }
  verdicts.push({ id, name, cell, desktop: cd.kind, mobile: cm.kind });
}
const counts = verdicts.reduce((a, v) => { const k = v.cell.includes('PASS (') ? 'pass' : v.cell.includes('instrument limit') ? 'instrumentLimit' : v.cell.includes('INCOMPLETE') ? 'incomplete' : 'fail'; a[k] = (a[k] ?? 0) + 1; return a; }, {});
writeFileSync(`${S_OUT()}`, JSON.stringify({ counts, verdicts }, null, 1), 'utf8');
function S_OUT() { return '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/verdicts.json'; }
console.log('| map | project | secure wave | boots | secures | banks | board | reload | clean | peak | end state | sim s | built | kills | classification |');
console.log('|---|---|---:|---|---|---|---|---|---|---:|---|---:|---:|---:|---|');
for (const line of out) console.log(line);
console.log('\nCOUNTS ' + JSON.stringify(counts));
for (const v of verdicts) console.log(`VERDICT ${v.id} :: ${v.cell}`);
