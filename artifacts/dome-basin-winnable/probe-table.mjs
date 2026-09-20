import { createServer } from 'vite';
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
  const { MAX_JSON_BYTES } = await vite.ssrLoadModule('/functions/api/standings.ts');
  for (const id of ['the-claim', 'e1-drill-yard', 'e1-dry-gulch', 'e1-night-shift', 'e1-twin-banks', 'e1-baron', 'e2-trestle']) {
    const e = runTapeEnvelopeForContract(id);
    console.log(`    ['${id}', ${e.maxTicks.toLocaleString('en-US').replace(/,/g, '_')}, ${e.maxTapeBytes.toLocaleString('en-US').replace(/,/g, '_')}, ${e.maxEntries.toLocaleString('en-US').replace(/,/g, '_')}, ${MAX_JSON_BYTES.toLocaleString('en-US').replace(/,/g, '_')}],`);
  }
  console.log('MAX_JSON_BYTES', MAX_JSON_BYTES);
} finally { await vite.close(); }
