import { createServer } from 'vite';
import { writeFileSync } from 'node:fs';
const location = new URL('http://manifest.test/?contract=e5-regatta');
globalThis.location = location; globalThis.window = { location };
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
  const out = {};
  for (const id of ['e5-regatta', 'e5-deepwater-claim', 'e5-flotilla', 'e5-stillwater']) {
    const m = deriveMechanicsManifest(id);
    out[id] = {
      ruleIds: m.rules.map((r) => r.id),
      regatta_race: m.rules.find((r) => r.id === 'regatta_race')?.data ?? null,
      regatta_boat: m.rules.find((r) => r.id === 'regatta_boat')?.data ?? null,
    };
  }
  writeFileSync(new URL('./manifest-regatta-rows.json', import.meta.url), `${JSON.stringify(out, null, 2)}\n`);
  console.log(JSON.stringify(out['e5-regatta'], null, 2));
  console.log('OTHER E5 ruleIds carrying regatta rows:',
    ['e5-deepwater-claim','e5-flotilla','e5-stillwater'].map((id) => `${id}:${out[id].ruleIds.filter((r) => r.startsWith('regatta')).length}`).join(' '));
} finally { await vite.close(); }
