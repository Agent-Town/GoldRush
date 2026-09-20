// s1500 probe — is f1328-1's central premise (F-1328-4: "the derivation ignores `practice`")
// still true on main? Derives the e1-drill-yard mechanics manifest through the same
// vite.ssrLoadModule harness every er01-*-census spec uses.
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const mod = await server.ssrLoadModule('/src/agent/MechanicsManifest.ts');
const cf = await server.ssrLoadModule('/src/meta/ContractFamilies.ts');

const ids = cf.listContracts().map((c) => c.id);
console.log('IDS', ids.length, JSON.stringify(ids));

const m = mod.deriveMechanicsManifest('e1-drill-yard');
console.log('interactables:', JSON.stringify(m.interactables));
console.log('rules:', JSON.stringify(m.rules.map((r) => r.id)));

await server.close();
