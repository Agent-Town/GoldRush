// Mare Claim re-assay under the air-wall composition (ADR-004). Secret only in process.env at POST time; never logged.
import { writeFileSync } from 'node:fs';
const S = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/reassay-e8';
const epochId = 'epoch-8-orbital'; const contractId = process.argv[2];
const board = async () => (await fetch(`https://agenttown.app/api/standings?epoch=${epochId}&contract=${contractId}`, { signal: AbortSignal.timeout(20000) })).json();
const rows = (b) => (b.board ?? []).map((r) => ({ name: r.profileName, gold: r.gold, waves: r.waves, assay: r.assay, reel: r.reel?.id }));
const before = await board(); writeFileSync(`${S}/${contractId}-before.json`, JSON.stringify(before, null, 1));
const log = (l) => writeFileSync(`${S}/${contractId}-progress.log`, `${new Date().toISOString()} ${l}\n`, { flag: 'a' });
log(`before: retired ${before.retiredCount} rows ${JSON.stringify(rows(before))}`);
const secret = process.env.SECRET; if (!secret) { log('NO SECRET'); process.exit(2); }
const res = await fetch('https://agenttown.app/api/standings/reassay', { method: 'POST', headers: { 'content-type': 'application/json', 'x-assay-key': secret }, body: JSON.stringify({ epochId, contractId, reason: 'e8-air-wall-all-maps 3a9bab9c8: ADR-004 composition change (the same air wall on every Orbital contract)' }), signal: AbortSignal.timeout(30000) });
log(`POST ${res.status} ${(await res.text()).slice(0, 300)}`);
const started = Date.now();
for (let poll = 0; poll < 120; poll += 1) {
  await new Promise((d) => setTimeout(d, 60000));
  const b = await board(); const rs = rows(b); const pending = rs.filter((r) => r.assay === 'pending').length;
  log(`poll ${poll} pending ${pending} retired ${b.retiredCount} rows ${JSON.stringify(rs)}`);
  if (pending === 0) { writeFileSync(`${S}/${contractId}-after.json`, JSON.stringify(b, null, 1)); log(`DONE in ${Math.round((Date.now() - started) / 60000)} min: before retired ${before.retiredCount} → ${b.retiredCount}; ranked before ${rows(before).length} → ${rs.length}`); process.exit(0); }
}
