// HEAT 14 PATIENT DELIVERY — F-HEAT14-6/7's cure, made a script. The county clerk's POST quota is not
// a short window: a burst of four re-POSTs two minutes apart drained it, and it was still refusing
// eight minutes later — and the refusal landed on ride 37's OWN first submission, which the operator
// caused. So: ONE reel at a time, a 429 is not a delivery (retry the same reel later, never move on),
// a 200 is this reel's one delivery and it moves to the next. Nothing is rebuilt; nothing is edited.
// usage: node deliver.mjs <gapSeconds> <ride> [ride...]
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
const [gapArg, ...rides] = process.argv.slice(2);
const gap = Number(gapArg) * 1000;
const origin = 'https://agenttown.app';
const log = (s) => { const line = `${new Date().toISOString().slice(11, 19)}Z ${s}`; process.stdout.write(`${line}\n`); appendFileSync(new URL('./deliver.log', import.meta.url), `${line}\n`); };
const sleep = (ms) => new Promise((d) => setTimeout(d, ms));

const pollFor = async (submission, dir, tries) => {
  const params = new URLSearchParams({ epoch: submission.epochId, contract: submission.contractId, season: '2', verdict: submission.tape.id });
  for (let i = 0; i < tries; i += 1) {
    await sleep(4000);
    try {
      const r = await fetch(`${origin}/api/standings?${params}`);
      const body = await r.json().catch(() => null);
      if (body?.ok && body.assay !== 'pending') { writeFileSync(`${dir}/verdict-slip.json`, `${JSON.stringify(body)}\n`); return body; }
    } catch (error) { log(`  poll transport: ${error.cause?.code ?? error.message}`); }
  }
  return null;
};

for (const ride of rides) {
  const dir = new URL(`./rides/${ride}/`, import.meta.url).pathname.replace(/\/$/, '');
  if (!existsSync(`${dir}/submission.json`)) { log(`${ride}: no submission.json — skipped`); continue; }
  let slip = null; try { slip = JSON.parse(readFileSync(`${dir}/verdict-slip.json`, 'utf8')); } catch {}
  if (slip?.assay === 'verified') { log(`${ride}: already verified — skipped`); continue; }
  const submission = JSON.parse(readFileSync(`${dir}/submission.json`, 'utf8'));
  const body = JSON.stringify(submission);
  let delivered = false;
  for (let attempt = 1; attempt <= 12 && !delivered; attempt += 1) {
    let r; let text;
    try { r = await fetch(`${origin}/api/standings`, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body }); text = await r.text(); }
    catch (error) { log(`${ride} attempt ${attempt}: transport ${error.cause?.code ?? error.message}`); await sleep(gap); continue; }
    if (r.status === 429) { log(`${ride} attempt ${attempt}: 429 rate_limited — waiting ${gap / 60000} min (not a delivery)`); await sleep(gap); continue; }
    writeFileSync(`${dir}/deliver-response.json`, `${text}\n`);
    log(`${ride} attempt ${attempt}: HTTP ${r.status} ${text.slice(0, 160)}`);
    if (!r.ok) { log(`${ride}: the door refused it — not retried`); break; }
    delivered = true;
    const got = await pollFor(submission, dir, 45);
    log(`${ride}: slip ${got ? `${got.assay}${got.assayHash ? ` ${got.assayHash}` : ''}${got.ranked === false ? ' UNRANKED' : ''}` : 'still none after 180 s'}`);
  }
  if (!delivered) log(`${ride}: NEVER DELIVERED — the clerk refused every attempt`);
  await sleep(gap);
}
log('DELIVERY RUN COMPLETE');
