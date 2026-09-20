// County-wide re-assay monitor: polls every claimed board until no row is pending, then writes after.json
// and a before/after table. Public GETs only; no secret.
import { readFileSync, writeFileSync } from 'node:fs';
const S = '/private/tmp/claude-501/-Users-robin-Claude-Projects-Gold-Rush/fe6b8d27-b064-40eb-934b-1d29d57a71db/scratchpad/reassay';
const before = JSON.parse(readFileSync(`${S}/before.json`, 'utf8'));
const contracts = Object.entries(before).map(([contractId, v]) => ({ contractId, epochId: v.epochId }));
const started = Date.now();
async function board(c) {
  const r = await fetch(`https://agenttown.app/api/standings?epoch=${c.epochId}&contract=${c.contractId}`, { signal: AbortSignal.timeout(20000) });
  return r.json();
}
for (let poll = 0; poll < 240; poll += 1) {
  const now = {};
  let pending = 0;
  for (const c of contracts) {
    try {
      const b = await board(c);
      const rows = (b.board ?? []).map((r) => ({ name: r.profileName, gold: r.gold, waves: r.waves, assay: r.assay, at: r.submittedAt, reel: r.reel?.id }));
      now[c.contractId] = { epochId: c.epochId, retired: b.retiredCount, rejected: b.rejectedCount, rows };
      pending += rows.filter((r) => r.assay === 'pending').length;
    } catch (e) { now[c.contractId] = { error: e.message }; pending += 1; }
  }
  writeFileSync(`${S}/latest.json`, JSON.stringify(now, null, 1));
  const line = `${new Date().toISOString()} poll ${poll} pending ${pending} (${Math.round((Date.now() - started) / 60000)} min)`;
  writeFileSync(`${S}/progress.log`, line + '\n', { flag: 'a' });
  if (pending === 0) {
    writeFileSync(`${S}/after.json`, JSON.stringify(now, null, 1));
    const lines = [];
    let kept = 0, retired = 0, goldMoved = 0, gone = 0;
    for (const c of contracts) {
      const b = before[c.contractId]; const a = now[c.contractId];
      for (const rb of b.rows) {
        const ra = (a.rows ?? []).find((r) => r.reel === rb.reel);
        if (!ra) { gone += 1; lines.push(`${c.contractId} | ${rb.name} | ${rb.gold} → RETIRED (no longer replays)`); continue; }
        kept += 1; if (ra.gold !== rb.gold) goldMoved += 1;
        lines.push(`${c.contractId} | ${rb.name} | ${rb.gold} → ${ra.gold} | ${ra.assay}`);
      }
      retired += (a.retired ?? 0) - (b.retired ?? 0);
    }
    lines.push(`SUMMARY kept ${kept}, gone from the ranked board ${gone}, gold moved ${goldMoved}, retiredCount delta ${retired}, ${Math.round((Date.now() - started) / 60000)} min`);
    writeFileSync(`${S}/table.txt`, lines.join('\n') + '\n');
    console.log(lines[lines.length - 1]);
    process.exit(0);
  }
  await new Promise((d) => setTimeout(d, 120_000));
}
console.log('monitor gave up after 8 h');
