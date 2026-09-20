// Regenerates e2e/fixtures/e1-mechanics-manifests.json from the live deriver. The fixture is the
// byte-stable pin `e2e/agent-view.spec.ts` and `e2e/drill-yard-manifest.spec.ts` compare against.
import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';
const location = new URL('http://fixture.test/?contract=the-claim');
globalThis.location = location; globalThis.window = { location };
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
  const { listContracts } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const ids = listContracts().map(({ id }) => id);
  const manifests = ids.map(deriveMechanicsManifest);
  writeFileSync('e2e/fixtures/e1-mechanics-manifests.json', `${JSON.stringify(manifests, null, 2)}\n`);
  console.log('wrote', ids.join(', '));
} finally { await vite.close(); }
