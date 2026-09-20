import { readFileSync, writeFileSync } from 'node:fs';
const before = JSON.parse(readFileSync('receipts-before.json', 'utf8'));
const targets = before.contracts.map((c) => ({ contractId: c.contractId, epochId: c.epochId }));
const endpoint = 'https://agenttown.app/api/standings';
const out = { label: 'after-32', measuredAt: new Date().toISOString(), source: endpoint, note: 'the ORIGINAL 32 unclaimed targets of 2026-09-03, re-measured from the live API; verified rows only', contracts: [] };
for (const c of targets) {
  const url = `${endpoint}?${new URLSearchParams({ epoch: c.epochId, contract: c.contractId })}`;
  let body = null, status = null, error = null;
  for (let a = 0; a < 3; a += 1) {
    try { const r = await fetch(url); status = r.status; body = await r.json(); if (r.ok) break; } catch (e) { error = String(e.message); }
    await new Promise((d) => setTimeout(d, 1200 * (a + 1)));
  }
  const rows = Array.isArray(body?.board) ? body.board : Array.isArray(body?.standings) ? body.standings : Array.isArray(body?.rows) ? body.rows : Array.isArray(body) ? body : [];
  const ver = rows.filter((r) => r.assay === 'verified' && r.secured !== false && r.score?.secured !== false);
  const names = ver.map((r) => `${r.profileName ?? '?'} w${r.score?.waves ?? r.waves}/${r.score?.gold ?? r.gold}g`);
  const e = { contractId: c.contractId, epochId: c.epochId, httpStatus: status, error, rowsTotal: rows.length, verifiedRows: ver.length, status: ver.length ? 'claimed' : 'unclaimed', rows: names };
  out.contracts.push(e);
  process.stdout.write(`${e.contractId.padEnd(22)}${String(status).padEnd(5)}verified=${String(e.verifiedRows).padEnd(3)}→ ${e.status}${names.length ? `  [${names.join(' | ')}]` : ''}\n`);
  await new Promise((d) => setTimeout(d, 300));
}
out.summary = { targets: targets.length, claimed: out.contracts.filter((c) => c.status === 'claimed').length, unclaimed: out.contracts.filter((c) => c.status === 'unclaimed').length };
writeFileSync('receipts-after-32.json', `${JSON.stringify(out, null, 2)}\n`);
process.stdout.write(`\nSUMMARY ${JSON.stringify(out.summary)}\n`);
