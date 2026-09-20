// F-NCB-9 bisect: where in the rider-parity-retirement shape does the native death happen?
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
const root = fileURLToPath(new URL('../..', import.meta.url));
const stage = process.argv[2];
const say = (m) => { process.stderr.write(`STAGE ${m}\n`); };
const mk = async () => createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
say('start');
if (stage === 'open-close') { const v = await mk(); say('opened'); await v.close(); say('closed'); }
if (stage === 'open-load-close') { const v = await mk(); say('opened'); await v.ssrLoadModule('/src/agent/StandingOrders.ts'); say('loaded'); await v.close(); say('closed'); }
if (stage === 'two-servers') {
  const a = await mk(); say('a-opened'); await a.ssrLoadModule('/src/agent/StandingOrders.ts'); say('a-loaded'); await a.close(); say('a-closed');
  const b = await mk(); say('b-opened'); await b.ssrLoadModule('/src/agent/StandingOrders.ts'); say('b-loaded'); await b.close(); say('b-closed');
}
if (stage === 'open-load-noclose') { const v = await mk(); say('opened'); await v.ssrLoadModule('/src/agent/StandingOrders.ts'); say('loaded — leaving the server open'); }
say('end-of-script');
