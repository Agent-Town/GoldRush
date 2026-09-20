// HEAT 13 RE-POST — F-HEAT12-4's standing order, made a script. Re-POSTs the IDENTICAL submission
// bytes of one ride whose assay locator was dropped, then polls once. Never re-rides, never rebuilds.
// usage: node repost.mjs <ride-name>
import { readFileSync, writeFileSync } from 'node:fs';
const ride = process.argv[2];
const dir = new URL(`./rides/${ride}/`, import.meta.url).pathname;
const submission = JSON.parse(readFileSync(`${dir}submission.json`, 'utf8'));
const origin = 'https://agenttown.app';
// F-HEAT13-2 again: this host's link to agenttown.app drops sockets mid-POST. Retry the TRANSPORT
// only; any HTTP answer, including a refusal, is the door speaking and is never retried.
let r; let text; let err = null;
for (let a = 0; a < 4; a += 1) {
  try { r = await fetch(`${origin}/api/standings`, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(submission) }); text = await r.text(); err = null; break; }
  catch (e) { err = e; console.log(`POST transport retry ${a + 1}/4: ${e.cause?.code ?? e.message}`); await new Promise((d) => setTimeout(d, 5000 * (a + 1))); }
}
if (err) throw err;
writeFileSync(`${dir}repost-response.json`, `${text}\n`);
console.log(`REPOST ${ride} HTTP ${r.status} ${text}`);
const params = new URLSearchParams({ epoch: submission.epochId, contract: submission.contractId, season: '2', verdict: submission.tape.id });
for (let i = 0; i < 40; i += 1) {
  await new Promise((d) => setTimeout(d, 3000));
  let body = null;
  try { const g = await fetch(`${origin}/api/standings?${params}`); body = await g.json().catch(() => null); }
  catch (e) { console.log(`poll transport retry: ${e.cause?.code ?? e.message}`); continue; }
  if (body?.ok && body.assay !== 'pending') { writeFileSync(`${dir}verdict-slip.json`, `${JSON.stringify(body)}\n`); console.log(`SLIP ${JSON.stringify(body)}`); process.exit(0); }
  if (i === 0) console.log(`first poll: ${JSON.stringify(body)}`);
}
console.log('still pending after 120s — the end-of-heat sweep will re-check');
