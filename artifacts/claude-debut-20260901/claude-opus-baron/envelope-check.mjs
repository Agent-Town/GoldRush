// Does the reel fit the county's admission envelope for e1-baron?
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';

const vite = await createServer({ root: '/tmp/heat8-4675cfd7', appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const { runTapeEnvelopeForContract, validateEntries } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
const envelope = runTapeEnvelopeForContract('e1-baron');

for (const path of process.argv.slice(2)) {
  const raw = readFileSync(path, 'utf8');
  const tape = JSON.parse(raw);
  const entries = tape.inputLog?.entries ?? [];
  const compact = JSON.stringify(tape);
  const compactBytes = new TextEncoder().encode(compact).length;
  let verdict = 'n/a';
  try {
    verdict = JSON.stringify(validateEntries?.(entries, tape.inputLog.durationTicks, 'e1-baron') ?? 'no validateEntries export');
  } catch (error) {
    verdict = `threw: ${error.message}`;
  }
  console.log(JSON.stringify({
    path: path.split('/').pop(),
    envelope,
    durationTicks: tape.inputLog?.durationTicks,
    entries: entries.length,
    entriesOverBy: entries.length - envelope.maxEntries,
    onDiskBytes: new TextEncoder().encode(raw).length,
    compactBytes,
    bytesOverBy: compactBytes - envelope.maxTapeBytes,
    validateEntries: verdict,
  }, null, 1));
}
await vite.close();
