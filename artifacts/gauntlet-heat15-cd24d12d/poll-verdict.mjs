// Poll-only half of heat-10's publish-submission.mjs (TRANSPORT SHIM, labeled: adds fetch retries on
// transient network errors; never re-POSTs). usage: node poll-verdict.mjs <submission.json> <outDir> [maxPolls=90]
import { readFileSync, writeFileSync } from 'node:fs';

const [submissionPath, outDir, maxPollsArg] = process.argv.slice(2);
const submission = JSON.parse(readFileSync(submissionPath, 'utf8'));
const endpoint = 'https://agenttown.app/api/standings';
const maxPolls = Number(maxPollsArg ?? 90);
const getJson = async (url) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try { const r = await fetch(url); const text = await r.text(); return { ok: r.ok, status: r.status, text }; }
    catch (error) { process.stderr.write(`fetch retry ${attempt + 1}: ${error.cause?.code ?? error.message}\n`); await new Promise((d) => setTimeout(d, 2_000 * (attempt + 1))); }
  }
  return { ok: false, status: 0, text: '' };
};
const params = new URLSearchParams({ epoch: submission.epochId, contract: submission.contractId, season: '2', verdict: submission.tape.id });
let slip;
for (let poll = 0; poll < maxPolls; poll += 1) {
  const response = await getJson(`${endpoint}?${params}`);
  if (response.ok) { try { slip = JSON.parse(response.text); } catch {} if (slip && slip.assay !== 'pending') break; }
  await new Promise((done) => setTimeout(done, 2_000));
}
// never write the string "undefined": a later JSON.parse of it killed the heat-12 queue driver
// mid-run on e4-dust-flats, skipping that ride's notebook and matrix steps entirely.
if (slip) writeFileSync(`${outDir}/verdict-slip.json`, `${JSON.stringify(slip)}\n`);
if (slip?.assay !== 'verified') throw new Error(`assay ${slip?.assay ?? 'missing'}: ${slip?.assayReason ?? 'no reason'}`);
params.delete('verdict');
params.set('reel', submission.tape.id);
const watch = await getJson(`${endpoint}?${params}`);
writeFileSync(`${outDir}/watch-reel.json`, `${watch.text}\n`);
if (!watch.ok) throw new Error(`WATCH ${watch.status}: ${watch.text}`);
const papers = JSON.parse(watch.text).reel?.meta;
if (papers?.buildId !== submission.tape.meta.buildId || papers?.engineHash !== submission.tape.meta.engineHash || papers?.era !== submission.tape.meta.era) throw new Error(`WATCH papers mismatch: ${JSON.stringify(papers)}`);
process.stdout.write(`${JSON.stringify({ tapeId: submission.tape.id, assay: slip.assay, assayHash: slip.assayHash, ranked: slip.ranked, papers })}\n`);
