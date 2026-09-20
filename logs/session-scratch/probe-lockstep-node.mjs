import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const location = new URL('http://gr-sim.local/?debug');
globalThis.location = location;
globalThis.window = { location };

const root = fileURLToPath(new URL('file:///Users/robin/Claude/Projects/gr-milk-agent-seat/'));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const mod = await vite.ssrLoadModule('/src/mp/LockstepClient.ts');
  console.log('exports:', Object.keys(mod).join(','));
  const c = new mod.LockstepClient({ relayBase: 'http://127.0.0.1:1', code: 'A'.repeat(24), player: { name: 'Rig', town: 'Test' } });
  const s = c.state();
  console.log('state ok:', JSON.stringify({ tick: s.tick, code: s.code, connected: s.connected, partySize: s.partySize }));
  console.log('stepSeconds:', c.stepSeconds, 'shouldExchangeHash(0):', c.shouldExchangeHash(0), 'shouldExchangeHash(30):', c.shouldExchangeHash(30));
  console.log('globals: WebSocket=', typeof WebSocket, 'fetch=', typeof fetch, 'perf=', typeof performance.now, 'structuredClone=', typeof structuredClone);
  c.dispose();
} finally { await vite.close(); }
