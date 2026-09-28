// map-play-proofs-1 item 4 (second implementer): the census tables, read-only, straight from secure-rows.jsonl.
// Usage: node artifacts/map-play-proofs-1/census-table.mjs   (prints markdown to stdout)
// The verdict row of a map x project is its LAST complete row (a partial row, cells left "not run" because the
// batch was stopped under it, is superseded by any complete row); earlier rows of the same pair are the first
// pass and are cited in the note. The map-level class is hand-written below from the code and the contract data.
import { readFileSync } from 'node:fs';

const ROWS = new URL('../open-maps-acceptance-e1-e4/secure-rows.jsonl', import.meta.url);
const CELLS = ['boots', 'secures', 'banks', 'board', 'reload', 'clean'];
const MAPS = [
  ['e1-baron', 'The Claim-Jumper Baron'], ['e2-pressure-garden', 'The Pressure Garden'], ['e2-incline', 'The Incline'],
  ['e3-blackout-ridge', 'Blackout Ridge'], ['e3-canyon-works', 'The Canyon Works'], ['e3-fairground', 'The Fairground'],
  ['e4-dust-flats', 'The Dust Flats'], ['e4-gusher-county', 'Gusher County'], ['e4-boneyard', 'The Boneyard'],
  ['e8-far-side', 'The Far Side'], ['e8-low-orbit', 'Low Orbit'], ['e8-eclipse', 'The Eclipse'],
  ['e9-dome-basin', 'The Dome Basin'], ['e9-seed-run', 'The Seed Run'], ['e9-devils-alley', "Devil's Alley"],
  ['e9-old-canal', 'The Old Canal'], ['e10-last-claim', 'The Last Claim'], ['e10-river', 'The River'],
];
const PROJECTS = ['desktop-chrome', 'mobile-chrome'];
const all = readFileSync(ROWS, 'utf8').split('\n').filter(Boolean).map((line, index) => ({ ...JSON.parse(line), line: index + 1 }));
const partial = (r) => CELLS.some((c) => r[c].detail === 'not run');
// Rows that are not a verdict candidate, by their own `at`: the second implementer's two attribution controls on
// today's tree, and the first implementer's queued drive-cw.sh run, a second repeat of the one re-run of its pair.
const EXTRA = new Map([
  ['2026-09-25T06:01:14.224Z', 'control A1'],
  ['2026-09-25T06:09:55.424Z', 'control C1'],
  ['2026-09-25T06:16:39.484Z', 'extra repeat (drive-cw)'],
]);
const RERUN_FROM = '2026-09-25T05:23:29Z'; // rr-e1-baron start: every non-extra row after it is the one re-run
const label = (x) => EXTRA.get(x.at) ?? (partial(x) ? 'partial' : x.at >= RERUN_FROM ? 're-run' : x.line === 1 ? 'smoke' : 'first pass');
const mark = (cell) => (cell.ok ? 'PASS' : /^skipped|^not run/.test(cell.detail) ? '-' : 'FAIL');
const engineWave = (r) => Number((r.notes.find((n) => n.startsWith('engine secureWave=')) ?? '').match(/=(\d+)/)?.[1] ?? NaN);
const esc = (s) => String(s).replace(/\|/g, '/');

const out = [];
const counts = { rows: 0, boots: 0, clean: 0, cleanRun: 0, secures: 0, banksReached: 0, banksPass: 0, zeroBuild: 0 };
out.push('| map (id) | project | boots | secures | banks | board | reload | clean | peak wave | secure wave (engine / spec) | end state | verdict row | note |');
out.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const [id, name] of MAPS) {
  for (const project of PROJECTS) {
    const runs = all.filter((r) => r.contract === id && r.project === project);
    const complete = runs.filter((r) => !partial(r) && !EXTRA.has(r.at));
    const r = complete[complete.length - 1] ?? runs[runs.length - 1];
    if (!r) { out.push(`| ${name} (${id}) | ${project} | no row |||||||||||`); continue; }
    const first = runs.find((x) => x !== r);
    const fail = CELLS.find((c) => !r[c].ok);
    const note = r.secures.ok
      ? `Claim Secured: ${r.secures.detail.replace(/^Claim Secured at /, '')}; banks: ${r.banks.detail.replace(/ \(0 new row.*$/, '')}`
      : `${fail}: ${r[fail].detail}`;
    const earlier = runs.filter((x) => x !== r).map((x) => `line ${x.line} ${label(x)}: peak ${x.peakWave}, ${x.runStateAtEnd}${x.secures.ok ? ', secured' : ''}${x.banks.ok || !x.secures.ok ? '' : ', banks FAIL'}`).join('; ');
    const end = `${r.runStateAtEnd} at ${r.simAtEnd.toFixed(0)} s sim, ${Math.round(r.hpAtEnd)} HP, ${Math.round(r.goldAtEnd)} gold, ${r.builds.length} bldg`;
    out.push(`| ${name} (${id}) | ${project.replace('-chrome', '')} | ${CELLS.map((c) => mark(r[c])).join(' | ')} | ${r.peakWave} | ${engineWave(r)} / ${r.secureWave} | ${end} | ${label(r)}, line ${r.line} (${runs.length} in all) | ${esc(note)}${earlier ? ` [${esc(earlier)}]` : ''} |`);
    counts.rows += 1;
    if (r.boots.ok) counts.boots += 1;
    if (r.clean.detail !== 'not run') { counts.cleanRun += 1; if (r.clean.ok) counts.clean += 1; }
    if (r.secures.ok) counts.secures += 1;
    if (r.secures.ok) counts.banksReached += 1;
    if (r.banks.ok) counts.banksPass += 1;
    if (r.builds.length === 0) counts.zeroBuild += 1;
    void first;
  }
}
const eighteen = new Set(MAPS.map(([id]) => id));
const others = all.filter((r) => !eighteen.has(r.contract));
out.push('');
out.push(`verdict rows ${counts.rows}; boots ${counts.boots}/${counts.rows}; clean ${counts.clean}/${counts.cleanRun} complete; secures ${counts.secures}/${counts.rows}; banks ${counts.banksPass}/${counts.banksReached} reached; 0-building verdict rows ${counts.zeroBuild}; all rows in the file ${all.length} (outside the verdict: ${all.filter((r) => EXTRA.has(r.at) || !eighteen.has(r.contract)).map((r) => `line ${r.line} ${r.contract} ${r.project.replace('-chrome', '')} (${EXTRA.get(r.at) ?? 'not one of the eighteen'})`).join(', ') || 'none'})`);
console.log(out.join('\n'));
