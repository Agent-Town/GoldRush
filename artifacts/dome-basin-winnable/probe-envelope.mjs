import { readFileSync } from 'node:fs';
import { createServer } from 'vite';

const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
  const { MAX_JSON_BYTES, validateTape } = await vite.ssrLoadModule('/functions/api/standings.ts');
  const { submittedRunTape, validateRunTape } = await vite.ssrLoadModule('/src/game/RunTape.ts');
  console.log('MAX_JSON_BYTES', MAX_JSON_BYTES);
  for (const id of ['e9-dome-basin', 'e7-relay-valley', 'e1-baron', 'the-claim']) {
    console.log(id, JSON.stringify(runTapeEnvelopeForContract(id)));
  }
  const fixtures = [
    ['w16 dome-basin', 'artifacts/gauntlet-heat12-20260905/rides/e9-dome-basin.attempt-1/work/tune-3-tape.json'],
    ['heat11 relay tune-1', 'artifacts/gauntlet-heat11-20260903/rides/e7-relay-valley/opus/work/tune-1.json'],
  ];
  for (const [label, p] of fixtures) {
    const raw = readFileSync(p, 'utf8');
    const t = JSON.parse(raw);
    const compact = Buffer.byteLength(JSON.stringify(t));
    const env = runTapeEnvelopeForContract(t.contract);
    const v = validateTape(t, t.contract, t.seed, t.difficulty);
    const vr = validateRunTape(t);
    const sr = submittedRunTape(t);
    console.log(`${label}: contract=${t.contract} file=${Buffer.byteLength(raw)} compact=${compact} ceiling=${env.maxTapeBytes} entries=${t.inputLog.entries.length}/${env.maxEntries} ticks=${t.inputLog.durationTicks}/${env.maxTicks} doorValidateTape=${v ? 'ACCEPT' : 'REFUSE'} validateRunTape=${vr ? 'ACCEPT' : 'REFUSE'} submittedRunTape=${sr ? 'ACCEPT' : 'REFUSE'} underByteCeiling=${compact <= env.maxTapeBytes} underMaxJson=${compact <= MAX_JSON_BYTES} prettyUnderMaxJson=${Buffer.byteLength(raw) <= MAX_JSON_BYTES}`);
  }
} finally { await vite.close(); }
