import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const WS = '/tmp/heat12-038cc280/artifacts/heat12/opus/e4-gusher-county';
const src = WS + '/tune-1-tape.json', dst = WS + '/attempt-1-tape.json';
fs.copyFileSync(src, dst);
const t = JSON.parse(fs.readFileSync(src, 'utf8'));
const es = t.inputLog.entries;
const env = {
  durationTicks: t.inputLog.durationTicks,
  lastEntryTick: es[es.length - 1].tick,
  entries: es.length,
  bytes: fs.statSync(src).size,
  tapeEventLogHash: t.eventLogHash,
  metaViewVersion: t.meta && t.meta.viewVersion,
  era: t.meta && (t.meta.engineEra || t.meta.engineHash),
};
console.log('ENV', JSON.stringify(env));
console.log('identical', fs.readFileSync(src).equals(fs.readFileSync(dst)));
try {
  const out = execFileSync('node', ['scripts/assay-replay-agent.mjs', dst],
    { cwd: '/tmp/heat12-038cc280', encoding: 'utf8' });
  console.log('ASSAY', out.slice(-1200));
} catch (e) { console.log('ASSAY ERR', String(e.stdout || '').slice(-800), String(e.message).slice(0, 300)); }
const outcome = JSON.parse(fs.readFileSync(WS + '/tune-1-summary.json', 'utf8')).outcome;
const final = {
  ...outcome,
  tape: dst,
  scored: true,
  runsSoFar: 2,
  scoredAttempts: 1,
  worldModel: 'sim-import',
  note: 'tune-1 secured on its first controller ride; the rules stop the ride at the first SECURED outcome, so tune-1 IS the scored attempt. attempt-1-tape.json is a byte-identical copy of tune-1-tape.json — ONE ride under two filenames. Submit the tape named in this field.',
  envelope: env,
};
fs.writeFileSync(WS + '/gauntlet-outcome.json', JSON.stringify(final, null, 2));
console.log('WROTE', JSON.stringify(final).slice(0, 700));
