import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createServer } from 'vite';

const list = execFileSync('bash', ['-lc', "find artifacts -name '*tape*.json' -o -name 'tune-*.json'"], { encoding: 'utf8' }).split('\n').filter(Boolean);
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { runTapeEnvelopeForContract } = await vite.ssrLoadModule('/src/playbook/PlaybookFormat.ts');
  const rows = [];
  const byOrders = new Map();
  for (const rel of list) {
    let t; try { t = JSON.parse(readFileSync(rel, 'utf8')); } catch { continue; }
    const tape = t?.inputLog ? t : (t?.tape?.inputLog ? t.tape : null);
    if (!tape?.contract || !Array.isArray(tape.inputLog?.entries)) continue;
    const env = runTapeEnvelopeForContract(tape.contract);
    const compact = Buffer.byteLength(JSON.stringify(tape));
    const entries = tape.inputLog.entries;
    let maxEntryBytes = 0, maxOrders = 0, totalOrders = 0;
    for (const e of entries) {
      const b = Buffer.byteLength(JSON.stringify(e));
      if (b > maxEntryBytes) maxEntryBytes = b;
      let n = 0;
      for (const a of (e.a ?? [])) if (a?.kind === 'agent_orders') n += (a.orders?.length ?? 0);
      totalOrders += n;
      if (n > maxOrders) maxOrders = n;
      const bucket = byOrders.get(n) ?? { n: 0, sum: 0, max: 0 };
      bucket.n++; bucket.sum += b; if (b > bucket.max) bucket.max = b;
      byOrders.set(n, bucket);
    }
    rows.push({ rel, contract: tape.contract, compact, ceiling: env.maxTapeBytes, over: compact > env.maxTapeBytes,
      entries: entries.length, maxEntries: env.maxEntries, ticks: tape.inputLog.durationTicks, maxTicks: env.maxTicks,
      overTicks: tape.inputLog.durationTicks > env.maxTicks, overEntries: entries.length > env.maxEntries,
      maxEntryBytes, maxOrders, avgOrders: entries.length ? totalOrders / entries.length : 0,
      bytesPerEntry: entries.length ? compact / entries.length : 0,
      bytesPerTick: tape.inputLog.durationTicks ? compact / tape.inputLog.durationTicks : 0 });
  }
  console.log(`tapes examined: ${rows.length}`);
  const over = rows.filter((r) => r.over);
  console.log(`OVER the byte ceiling (compact): ${over.length}`);
  for (const r of over) console.log(`  ${r.compact}/${r.ceiling} ${r.contract} ${r.rel}`);
  console.log(`OVER maxEntries: ${rows.filter((r) => r.overEntries).length}  OVER maxTicks: ${rows.filter((r) => r.overTicks).length}`);
  console.log('--- highest bytes-per-entry ---');
  for (const r of rows.slice().sort((a, b) => b.bytesPerEntry - a.bytesPerEntry).slice(0, 10)) {
    console.log(`  ${r.bytesPerEntry.toFixed(0)} B/entry avgOrders=${r.avgOrders.toFixed(1)} maxEntryBytes=${r.maxEntryBytes} entries=${r.entries} compact=${r.compact}/${r.ceiling} ${r.contract} ${r.rel}`);
  }
  console.log('--- highest bytes-per-tick (projects worst to full clock) ---');
  for (const r of rows.slice().sort((a, b) => b.bytesPerTick - a.bytesPerTick).slice(0, 10)) {
    console.log(`  ${r.bytesPerTick.toFixed(1)} B/tick -> at 18002 ticks = ${(r.bytesPerTick * 18002).toFixed(0)} vs ${r.ceiling} | entries=${r.entries} ticks=${r.ticks} ${r.contract} ${r.rel}`);
  }
  console.log('--- entry bytes by orders-in-entry ---');
  for (const [n, b] of [...byOrders.entries()].sort((x, y) => x[0] - y[0])) {
    console.log(`  orders=${n}: count=${b.n} mean=${(b.sum / b.n).toFixed(1)} max=${b.max}`);
  }
} finally { await vite.close(); }
