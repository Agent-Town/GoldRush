// HEAT 13 RECEIPTS SNAPSHOT — measures the board from the LIVE county API, verified rows only.
// usage: node receipts-delta.mjs <label> [--all] [--out=<file>]
//   default: the contracts the ledger calls `unclaimed`.  --all: every contract on the board (36).
// Writes receipts-<label>.json and prints one line per contract.
//
// ADAPTED FROM HEAT 11: adds --all (heat 12 re-rides CLAIMED maps whose mechanic changed, so the
// unclaimed-only target set of heat 11 cannot see its own delta), and records, per contract, the
// engineHash carried by each verified row so a "current-era receipt" can be told from an old one.
import { readFileSync, writeFileSync } from 'node:fs';

const [label, ...rest] = process.argv.slice(2);
if (!label) throw new Error('usage: receipts-delta.mjs <label> [--all]');
const args = Object.fromEntries(rest.map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=')]; }));
const receipts = JSON.parse(readFileSync(new URL('../../assets/rotations/winnability-receipts.json', import.meta.url), 'utf8'));
const targets = args.all !== undefined ? receipts.contracts : receipts.contracts.filter((c) => c.status === 'unclaimed');
const endpoint = 'https://agenttown.app/api/standings';
const out = { label, measuredAt: new Date().toISOString(), source: endpoint, scope: args.all !== undefined ? 'all-board-contracts' : 'ledger-unclaimed', contracts: [] };
for (const c of targets) {
  const url = `${endpoint}?${new URLSearchParams({ epoch: c.epochId, contract: c.contractId })}`;
  let body = null; let status = null; let error = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try { const r = await fetch(url); status = r.status; body = await r.json(); if (r.ok) break; } catch (e) { error = String(e.message); }
    await new Promise((d) => setTimeout(d, 1500 * (attempt + 1)));
  }
  const rows = Array.isArray(body?.board) ? body.board : Array.isArray(body?.standings) ? body.standings : Array.isArray(body?.rows) ? body.rows : Array.isArray(body) ? body : [];
  const verified = rows.filter((r) => r.assay === 'verified' && r.secured !== false && r.score?.secured !== false);
  const heat13 = verified.filter((r) => (r.stack?.harness ?? r.harness) === 'heat14-operator');
  // HEAT 13 FIX: the live board row is FLAT (model/harness/harnessVersion/reel.id at top level,
  // no stack wrapper and no engineHash at all) — heat 12's reader looked only under `stack`, so every
  // row it printed said `model: null, harness: null` and the receipts file could not tell a heat-13
  // row from a heat-11 survivor. Read both shapes.
  const describe = (r) => ({
    rank: r.rank ?? null,
    profileName: r.profileName ?? r.name ?? null,
    model: r.stack?.model ?? r.model ?? r.species ?? null,
    harness: r.stack?.harness ?? r.harness ?? null,
    harnessVersion: r.stack?.harnessVersion ?? r.harnessVersion ?? null,
    reelId: r.reel?.id ?? r.tapeId ?? r.reelId ?? r.id ?? null,
    waves: r.score?.waves ?? r.waves ?? null, gold: r.score?.gold ?? r.gold ?? null,
    engineHash: r.meta?.engineHash ?? r.engineHash ?? null,
    assayedAt: r.assayedAt ?? r.submittedAt ?? r.createdAt ?? null,
  });
  const first = verified.slice().sort((a, b) => String(a.assayedAt ?? a.createdAt ?? '').localeCompare(String(b.assayedAt ?? b.createdAt ?? '')))[0] ?? null;
  const entry = {
    contractId: c.contractId, epochId: c.epochId, ledgerStatus: c.status, ledgerDate: c.date ?? null, httpStatus: status, error,
    rowsTotal: rows.length, verifiedRows: verified.length, retiredCount: body?.retiredCount ?? null, season: body?.season ?? null,
    status: verified.length ? 'claimed' : 'unclaimed',
    heat14Rows: heat13.length,
    first: first ? describe(first) : null,
    verified: verified.map(describe),
    heat14: heat13.map(describe),
    rawKeys: body && typeof body === 'object' ? Object.keys(body) : null,
  };
  out.contracts.push(entry);
  process.stdout.write(`${entry.contractId.padEnd(22)} ${String(status).padEnd(4)} rows=${String(entry.rowsTotal).padEnd(3)} verified=${String(entry.verifiedRows).padEnd(3)} → ${entry.status}${first ? ` (first: ${entry.first.model} w${entry.first.waves}/${entry.first.gold}g)` : ''}\n`);
  await new Promise((d) => setTimeout(d, 400));
}
out.summary = { targets: targets.length, unclaimed: out.contracts.filter((c) => c.status === 'unclaimed').length, claimed: out.contracts.filter((c) => c.status === 'claimed').length, errors: out.contracts.filter((c) => c.error || (c.httpStatus && c.httpStatus !== 200)).length, heat14Rows: out.contracts.reduce((n, c) => n + (c.heat14Rows ?? 0), 0), heat14Contracts: out.contracts.filter((c) => c.heat14Rows).map((c) => c.contractId), unclaimedIds: out.contracts.filter((c) => c.status === 'unclaimed').map((c) => c.contractId) };
writeFileSync(args.out ?? new URL(`./receipts-${label}.json`, import.meta.url), `${JSON.stringify(out, null, 2)}\n`);
process.stdout.write(`SUMMARY ${JSON.stringify(out.summary)}\n`);
