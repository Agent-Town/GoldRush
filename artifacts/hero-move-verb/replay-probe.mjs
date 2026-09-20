/** hero-move-verb: replay a MOVE_HERO tape and record the hash + outcome the guard pins. */
import { writeFileSync, readFileSync } from 'node:fs';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../..', import.meta.url));
const tapePath = process.argv[2];
const outPath = process.argv[3];
globalThis.location = new URL('http://replay.local/?contract=the-claim');
globalThis.window = { location: globalThis.location };
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { replayAgentTape } = await vite.ssrLoadModule('/src/replay/AgentTapeReplay.ts');
  const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
  const first = await replayAgentTape(structuredClone(tape));
  const second = await replayAgentTape(structuredClone(tape));
  const record = {
    tape: tapePath,
    tapeEventLogHash: tape.eventLogHash,
    tapeOutcome: tape.outcome,
    eventLogHash: first.eventLogHash,
    outcome: first.outcome,
    ticks: first.ticks,
    engine: first.engine,
    replayIdempotent: JSON.stringify(first) === JSON.stringify(second),
  };
  if (outPath) writeFileSync(outPath, `${JSON.stringify(record, null, 2)}\n`);
  console.log(JSON.stringify(record, null, 2));
} finally { await vite.close(); }
