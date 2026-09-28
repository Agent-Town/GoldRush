// HEAT 15, ride 3 — ONE re-POST of the refused reel, byte-identical (the F-HEAT14-6 protocol:
// re-POST once and record it). The tape is NOT edited: its papers are what the arena stamped.
import { readFileSync, writeFileSync } from 'node:fs';
const sub = JSON.parse(readFileSync(new URL('./submission.json', import.meta.url), 'utf8'));
const origin = 'https://agenttown.app';
const r = await fetch(`${origin}/api/standings`, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(sub) });
const text = await r.text();
const rec = { proof: 'ride-3 re-POST, byte-identical, once', postedAt: new Date().toISOString(), tapeId: sub.tape.id, papers: sub.tape.meta, httpStatus: r.status, body: text };
writeFileSync(new URL('./repost-response.json', import.meta.url), `${JSON.stringify(rec, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(rec, null, 1)}\n`);
