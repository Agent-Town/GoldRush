// HEAT 12 VERDICT SWEEP — operator bookkeeping. For every ride that put a tape forward, re-asks the
// door for its verdict slip and rewrites verdict-slip.json when one now exists. The county's assay
// is asynchronous: land-ride's 120 s + 250-poll window is usually enough, but not always, and a
// missing slip at landing time is not a verdict. Nothing is re-POSTed — this is read-only.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const endpoint = 'https://agenttown.app/api/standings';
const rides = readdirSync(join(HERE, 'rides'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
const out = [];
for (const ride of rides) {
  const dir = join(HERE, 'rides', ride);
  if (!existsSync(join(dir, 'submission.json'))) continue;
  const submission = JSON.parse(readFileSync(join(dir, 'submission.json'), 'utf8'));
  let slip = null;
  try { slip = JSON.parse(readFileSync(join(dir, 'verdict-slip.json'), 'utf8')); } catch {}
  const before = slip?.assay ?? null;
  if (slip?.assay === 'verified') { out.push({ ride, tapeId: submission.tape.id, before, after: 'verified', changed: false }); continue; }
  const params = new URLSearchParams({ epoch: submission.epochId, contract: submission.contractId, season: '2', verdict: submission.tape.id });
  let body = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try { const r = await fetch(`${endpoint}?${params}`); body = await r.json(); break; } catch { await new Promise((d) => setTimeout(d, 1500 * (attempt + 1))); }
  }
  const after = body?.ok ? body.assay : (body?.error ?? 'unreachable');
  if (body?.ok) writeFileSync(join(dir, 'verdict-slip.json'), `${JSON.stringify(body)}\n`);
  out.push({ ride, tapeId: submission.tape.id, before, after, ranked: body?.ranked ?? null, assayHash: body?.assayHash ?? null, changed: before !== after });
  await new Promise((d) => setTimeout(d, 400));
}
for (const row of out) process.stdout.write(`${row.ride.padEnd(30)} ${String(row.before).padEnd(10)} → ${String(row.after).padEnd(18)}${row.ranked === true ? ' ranked' : row.ranked === false ? ' UNRANKED' : ''}${row.assayHash ? ` ${row.assayHash}` : ''}${row.changed ? '  *CHANGED*' : ''}\n`);
process.stdout.write(`${JSON.stringify({ submitted: out.length, verified: out.filter((r) => r.after === 'verified').length, notFound: out.filter((r) => r.after === 'assay_not_found').length, other: out.filter((r) => r.after !== 'verified' && r.after !== 'assay_not_found').map((r) => `${r.ride}:${r.after}`) })}\n`);
