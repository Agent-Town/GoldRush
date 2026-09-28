// test-truth-2 item 4: the ten secured pairs' census rows, read-only, from this task's own rows file
// (artifacts/test-truth-2/secure-rows.jsonl, copied line for line from the rows the branch's secure spec
// appended to artifacts/open-maps-acceptance-e1-e4/secure-rows.jsonl during batch A).
// Usage: node artifacts/test-truth-2/census-rows.mjs   (prints markdown rows in the census table's format)
import { readFileSync } from 'node:fs';

const ROWS = new URL('./secure-rows.jsonl', import.meta.url);
const CELLS = ['boots', 'secures', 'banks', 'board', 'reload', 'clean'];
const NAMES = new Map([
  ['e2-pressure-garden', 'The Pressure Garden'], ['e3-blackout-ridge', 'Blackout Ridge'], ['e9-seed-run', 'The Seed Run'],
  ['e9-devils-alley', "Devil's Alley"], ['e10-last-claim', 'The Last Claim'], ['e10-river', 'The River'],
]);
const ORDER = ['e2-pressure-garden', 'e3-blackout-ridge', 'e9-seed-run', 'e9-devils-alley', 'e10-last-claim', 'e10-river'];
// The morning census's verdict line for each pair in artifacts/open-maps-acceptance-e1-e4/secure-rows.jsonl,
// every one "secured, banks FAIL" on the click-only instrument (F-MPP1-1).
const MORNING = new Map([
  ['e2-pressure-garden desktop-chrome', 3], ['e2-pressure-garden mobile-chrome', 9], ['e3-blackout-ridge desktop-chrome', 5],
  ['e3-blackout-ridge mobile-chrome', 11], ['e9-seed-run mobile-chrome', 33], ['e9-devils-alley desktop-chrome', 28],
  ['e10-last-claim desktop-chrome', 30], ['e10-last-claim mobile-chrome', 36], ['e10-river desktop-chrome', 31], ['e10-river mobile-chrome', 37],
]);
const all = readFileSync(ROWS, 'utf8').split('\n').filter(Boolean).map((line, index) => ({ ...JSON.parse(line), line: index + 1 }));
const mark = (cell) => (cell.ok ? 'PASS' : /^skipped|^not run/.test(cell.detail) ? '-' : 'FAIL');
const engineWave = (r) => Number((r.notes.find((n) => n.startsWith('engine secureWave=')) ?? '').match(/=(\d+)/)?.[1] ?? NaN);
// Playwright's call log carries ANSI dim codes and " | Call log: | " separators; keep the words only.
const clean = (s) => String(s).replace(/\u001b\[[0-9;]*m/g, '').replace(/\[\d+m/g, '').replace(/\.? \| Call log: \| +- /g, ', ').replace(/\s+/g, ' ').trim();
const esc = (s) => clean(s).replace(/\|/g, '/');

// Hand-written, from reading the code and the probes (see artifacts/test-truth-2/report.md).
const ANNOTATE = new Map([
  ['e10-last-claim', 'board: an instrument limit (F-TT2-1), not the map: on the finale map Return to Town opens the Charter Press (Charter the River / Return to the Ark), never the run ledger the board step waits in'],
  ['e9-seed-run', 'secures: the generic kit survives this pair only sometimes (the F-MPP1-5 class): the morning secured at wave 20, these two runs died at 598.1 s and 512.7 s of the 600, so banks, board and reload stay unmeasured on this pair'],
]);
const out = [];
for (const id of ORDER) {
  for (const project of ['desktop-chrome', 'mobile-chrome']) {
    const runs = all.filter((r) => r.contract === id && r.project === project);
    const r = runs[runs.length - 1];
    if (!r) continue;
    const fail = CELLS.find((c) => !r[c].ok);
    const parts = [];
    if (r.secures.ok) parts.push(`Claim Secured: ${r.secures.detail.replace(/^Claim Secured at /, '')}`);
    else parts.push(`secures: ${r.secures.detail}`);
    for (const c of ['banks', 'board', 'reload']) if (!/^skipped/.test(r[c].detail)) parts.push(`${c}: ${r[c].detail}`);
    if (fail && !['secures', 'banks', 'board', 'reload'].includes(fail)) parts.push(`${fail}: ${r[fail].detail}`);
    const earlier = [
      `census line ${MORNING.get(`${id} ${project}`)}: secured, banks FAIL on the click-only instrument`,
      ...runs.slice(0, -1).map((x) => `test-truth-2 row ${x.line}: ${x.secures.ok ? 'secured' : `died at wave ${x.peakWave} / ${x.simAtEnd.toFixed(1)} s sim`}`),
    ].join('; ');
    const end = `${r.runStateAtEnd} at ${r.simAtEnd.toFixed(0)} s sim, ${Math.round(r.hpAtEnd)} HP, ${Math.round(r.goldAtEnd)} gold, ${r.builds.length} bldg`;
    const annotation = ANNOTATE.get(id) && (id !== 'e9-seed-run' || project === 'mobile-chrome') ? `; ${ANNOTATE.get(id)}` : '';
    out.push(`| ${NAMES.get(id)} (${id}) | ${project.replace('-chrome', '')} | ${CELLS.map((c) => mark(r[c])).join(' | ')} | ${r.peakWave} | ${engineWave(r)} / ${r.secureWave} | ${end} | test-truth-2 row ${r.line} (re-measured ${r.at.slice(0, 16)}Z) | ${esc(parts.join('; ') + annotation)}${earlier ? ` [${esc(earlier)}]` : ''} |`);
  }
}
console.log(out.join('\n'));
