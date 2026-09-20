import { readFileSync } from 'node:fs';
import { createServer } from 'vite';
const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { validateTape } = await vite.ssrLoadModule('/functions/api/standings.ts');
  const { validateRunTape, submittedRunTape } = await vite.ssrLoadModule('/src/game/RunTape.ts');
  const files = {
    domeBasin: 'artifacts/gauntlet-heat12-20260905/rides/e9-dome-basin.attempt-1/work/tune-3-tape.json',
    relayValley: 'artifacts/gauntlet-heat11-20260903/rides/e7-relay-valley/opus/work/tune-1.json',
    relayRushCurrent: 'artifacts/gauntlet-heat12-20260905/rides/e7-relay-rush/submission.json',
    relayRushRetired: 'artifacts/gauntlet-heat11-20260903/rides/e7-relay-rush/opus/work/attempt-1-tape.json',
  };
  for (const [name, rel] of Object.entries(files)) {
    let raw = JSON.parse(readFileSync(rel, 'utf8'));
    const tape = raw.tape ?? raw;
    const verbs = new Set();
    for (const e of tape.inputLog.entries) for (const a of e.a) for (const o of a.orders ?? []) verbs.add(o.verb);
    const actionTypes = new Set();
    for (const e of tape.inputLog.entries) for (const a of e.a) actionTypes.add(a.type);
    console.log('==', name, '| verbs:', [...verbs].join(','), '| actionTypes:', [...actionTypes].join(','));
    console.log('   simVersion', tape.simVersion, 'runStart?', !!tape.runStart, 'meta keys', tape.meta ? Object.keys(tape.meta).sort().join(',') : '(none)');
    console.log('   validateRunTape:', validateRunTape(tape) === null ? 'NULL(refused)' : 'ok');
    console.log('   validateTape(county):', validateTape(tape, tape.contract, tape.seed, tape.difficulty) === null ? 'NULL(refused)' : 'ok');
    console.log('   submittedRunTape:', submittedRunTape(tape) === undefined ? 'undefined(refused)' : 'ok');
  }
} finally { await vite.close(); }
