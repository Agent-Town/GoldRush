// HEAT 11 RECEIPTS SNAPSHOT — measures the unclaimed set from the LIVE county API, verified rows only.
// usage: node receipts-delta.mjs <label> [--out=<file>]  → writes receipts-<label>.json and prints one line per contract
import { readFileSync, writeFileSync } from 'node:fs';

const [label, ...rest] = process.argv.slice(2);
if (!label) throw new Error('usage: receipts-delta.mjs <label>');
const args = Object.fromEntries(rest.map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
const receipts = JSON.parse(readFileSync(new URL('../../assets/rotations/winnability-receipts.json', import.meta.url), 'utf8'));
const targets = receipts.contracts.filter((c) => c.status === 'unclaimed');
const endpoint = 'https://agenttown.app/api/standings';
const out = { label, measuredAt: new Date().toISOString(), source: endpoint, contracts: [] };
for (const c of targets) {
  const url = `${endpoint}?${new URLSearchParams({ epoch: c.epochId, contract: c.contractId })}`;
  let body = null; let status = null; let error = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try { const r = await fetch(url); status = r.status; body = await r.json(); if (r.ok) break; } catch (e) { error = String(e.message); }
    await new Promise((d) => setTimeout(d, 1500 * (attempt + 1)));
  }
  const rows = Array.isArray(body?.board) ? body.board : Array.isArray(body?.standings) ? body.standings : Array.isArray(body?.rows) ? body.rows : Array.isArray(body) ? body : [];
  const verified = rows.filter((r) => r.assay === 'verified' && r.secured !== false && r.score?.secured !== false);
  const first = verified.slice().sort((a, b) => (a.assayedAt ?? a.createdAt ?? 0) - (b.assayedAt ?? b.createdAt ?? 0))[0] ?? null;
  const entry = {
    contractId: c.contractId, epochId: c.epochId, httpStatus: status, error,
    rowsTotal: rows.length, verifiedRows: verified.length, retiredCount: body?.retiredCount ?? null, season: body?.season ?? null,
    status: verified.length ? 'claimed' : 'unclaimed',
    first: first ? { profileName: first.profileName ?? first.name ?? null, model: first.stack?.model ?? first.species ?? null, reelId: first.tapeId ?? first.reelId ?? first.id ?? null, waves: first.score?.waves ?? first.waves ?? null, gold: first.score?.gold ?? first.gold ?? null, assayedAt: first.assayedAt ?? null } : null,
    rawKeys: body && typeof body === 'object' ? Object.keys(body) : null,
  };
  out.contracts.push(entry);
  process.stdout.write(`${entry.contractId.padEnd(22)} ${String(status).padEnd(4)} rows=${entry.rowsTotal} verified=${entry.verifiedRows} → ${entry.status}${first ? ` (first: ${entry.first.model} ${entry.first.reelId})` : ''}\n`);
  await new Promise((d) => setTimeout(d, 400));
}
out.summary = { targets: targets.length, unclaimed: out.contracts.filter((c) => c.status === 'unclaimed').length, claimed: out.contracts.filter((c) => c.status === 'claimed').length, errors: out.contracts.filter((c) => c.error || (c.httpStatus && c.httpStatus !== 200)).length };
writeFileSync(args.out ?? new URL(`./receipts-${label}.json`, import.meta.url), `${JSON.stringify(out, null, 2)}\n`);
process.stdout.write(`SUMMARY ${JSON.stringify(out.summary)}\n`);
