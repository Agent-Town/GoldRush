/** One-shot: what the door tells a rider it can BUILD on the Ember Shore, and at what price. */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
const root = fileURLToPath(new URL('../..', import.meta.url));
const CONTRACT = 'e10-ember-shore';
const location = new URL(`http://e10s4.probe/?debug&contract=${CONTRACT}&seed=${CONTRACT}-01`);
globalThis.location = location;
globalThis.window = { location };
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const say = console.log;
console.log = console.info = console.debug = () => undefined;
try {
  const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
  const { listBoardContracts } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const contract = listBoardContracts().find((entry) => entry.id === CONTRACT);
  const manifest = deriveMechanicsManifest(contract);
  say(JSON.stringify({ buildables: manifest.buildables, posting: manifest.posting, rules: manifest.rules?.map((r) => r.id ?? r.title ?? r) }, null, 2));
} finally { await vite.close(); }
