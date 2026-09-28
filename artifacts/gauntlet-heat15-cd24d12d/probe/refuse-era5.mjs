// HEAT 14 SKEW PROBE, proof 1 — re-POSTs heat 13's VERIFIED probe reel (byte-identical, era 5)
// to the era-6 door. The county must refuse it; the refusal is the gate's first proof.
import { readFileSync, writeFileSync } from 'node:fs';
const sub = JSON.parse(readFileSync(new URL('./heat13-verified-probe-submission.json', import.meta.url), 'utf8'));
const origin = 'https://agenttown.app';
const r = await fetch(`${origin}/api/standings`, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(sub) });
const text = await r.text();
const rec = { proof: '1-refusal', postedAt: new Date().toISOString(), source: "heat 13's verified probe reel, byte-identical", tapeId: sub.tape.id, papers: sub.tape.meta, httpStatus: r.status, body: text };
writeFileSync(new URL('./refusal-post-response.json', import.meta.url), `${JSON.stringify(rec, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(rec, null, 1)}\n`);
