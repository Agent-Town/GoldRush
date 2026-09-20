import { createServer } from 'vite';
const location = new URL('http://regatta-view.test/?debug&contract=e5-regatta');
globalThis.location = location; globalThis.window = { location };
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { HERO_ORDER_REFUSALS, BOAT_ORDER_REFUSALS } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');
  console.log('HERO_ORDER_REFUSALS:', JSON.stringify([...HERO_ORDER_REFUSALS]));
  console.log('BOAT_ORDER_REFUSALS:', JSON.stringify([...BOAT_ORDER_REFUSALS]));
  const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
  for (const id of ['the-claim','e5-regatta']) {
    const rule = deriveMechanicsManifest(id).rules.find((r) => r.id === 'hero_orders');
    console.log(id, 'hero_orders.refusals:', JSON.stringify(rule.data.refusals));
  }
} finally { await vite.close(); }
