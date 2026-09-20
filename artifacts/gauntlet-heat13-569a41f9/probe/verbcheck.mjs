import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
const server = await createServer({ root: '/tmp/heat13-569a41f9', server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const mod = await server.ssrLoadModule('/src/agent/StandingOrders.ts');
const tape = JSON.parse(readFileSync('/tmp/heat13-569a41f9/artifacts/gauntlet-heat13-569a41f9/probe/heat12-verified-probe-tape.json', 'utf8'));
const out = [];
let idx = 0;
for (const entry of tape.inputLog.entries) {
  for (const a of entry.a) {
    if (a.kind !== 'agent_orders') continue;
    const r = mod.validateStandingOrders(a.orders);
    if (!r.ok) out.push({ entryIndex: idx, tick: entry.t, orders: a.orders.length, error: r.error ?? r.reason ?? JSON.stringify(r).slice(0,300) });
  }
  idx += 1;
}
const res = { totalEntries: tape.inputLog.entries.length, refusedEntries: out.length, firstRefusal: out[0] ?? null, lastRefusal: out[out.length-1] ?? null };
writeFileSync('/tmp/heat13-569a41f9/artifacts/gauntlet-heat13-569a41f9/probe/door-verb-refusal.json', JSON.stringify({ ...res, allRefusals: out.slice(0, 5) }, null, 2) + '\n');
console.log(JSON.stringify(res, null, 2));
await server.close();
process.exit(0);
