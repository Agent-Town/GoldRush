// Re-mint e2e/fixtures/e1-mechanics-manifests.json from the merged tree, the way e2e/agent-view.spec.ts derives it
// ("all six E1 mechanics manifests match their byte-stable fixture"): listContracts() ids in order, deriveMechanicsManifest per id.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const ROOT = process.cwd();
const { createServer } = await import(pathToFileURL(ROOT + '/node_modules/vite/dist/node/index.js').href);
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const fam = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const man = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
  const listContracts = fam.listContracts ?? man.listContracts;
  const derive = man.deriveMechanicsManifest;
  if (typeof listContracts !== 'function' || typeof derive !== 'function') throw new Error('exports missing: listContracts=' + typeof listContracts + ' deriveMechanicsManifest=' + typeof derive + ' (ContractFamilies exports: ' + Object.keys(fam).join(',') + ')');
  const ids = listContracts().map((c) => c.id);
  const manifests = ids.map((id) => derive(id));
  const file = 'e2e/fixtures/e1-mechanics-manifests.json';
  const before = readFileSync(file, 'utf8');
  const beforeCompact = JSON.stringify(JSON.parse(before));
  const afterCompact = JSON.stringify(manifests);
  if (beforeCompact === afterCompact) { console.log('E1 manifest fixture: already byte-stable, nothing re-minted'); process.exit(0); }
  const indent = /\n  "/.test(before) ? 2 : 0;
  writeFileSync(file, JSON.stringify(manifests, null, indent) + (before.endsWith('\n') ? '\n' : ''));
  const b = JSON.parse(before), a = manifests; const changed = [];
  for (let i = 0; i < a.length; i++) if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) changed.push(a[i].contractId ?? ids[i]);
  console.log('E1 manifest fixture re-minted (F-SEF2-1): ids ' + ids.join(',') + '; changed manifests: ' + changed.join(', '));
} finally { await vite.close(); }
