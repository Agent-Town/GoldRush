import { readFileSync, writeFileSync } from 'node:fs';

const [submissionPath, outDir] = process.argv.slice(2);
const submission = JSON.parse(readFileSync(submissionPath, 'utf8'));
const origin = 'https://agenttown.app';
const endpoint = `${origin}/api/standings`;
// HEAT 13 CURE (F-HEAT13-2): the POST had NO retry. On ride 9 (`e8-eclipse`, a contract heat 12
// could not secure) one `UND_ERR_SOCKET` — 114,062 bytes written, 0 read — threw before
// post-response.json was ever written, and land-ride correctly concluded "POST itself failed".
// A won run was dropped by a transient socket, not by the county. Heat 12's note recorded the same
// class on the POLL wire and cured only that half. Three tries, backed off; the door's own refusals
// (any HTTP answer at all) are NOT retried, only transport failures.
let post; let postText; let lastError = null;
for (let attempt = 0; attempt < 3; attempt += 1) {
  try {
    post = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(submission) });
    postText = await post.text();
    lastError = null;
    break;
  } catch (error) {
    lastError = error;
    process.stderr.write(`POST transport retry ${attempt + 1}/3: ${error.cause?.code ?? error.message}\n`);
    await new Promise((d) => setTimeout(d, 4_000 * (attempt + 1)));
  }
}
if (lastError) throw lastError;
writeFileSync(`${outDir}/post-response.json`, `${postText}\n`);
if (!post.ok) throw new Error(`POST ${post.status}: ${postText}`);
const params = new URLSearchParams({ epoch: submission.epochId, contract: submission.contractId, season: '2', verdict: submission.tape.id });
let slip;
for (let poll = 0; poll < 60; poll += 1) {
  const response = await fetch(`${endpoint}?${params}`);
  if (response.ok) { slip = await response.json(); if (slip.assay !== 'pending') break; }
  await new Promise((done) => setTimeout(done, 2_000));
}
writeFileSync(`${outDir}/verdict-slip.json`, `${JSON.stringify(slip)}\n`);
if (slip?.assay !== 'verified') throw new Error(`assay ${slip?.assay ?? 'missing'}: ${slip?.assayReason ?? 'no reason'}`);
params.delete('verdict');
params.set('reel', submission.tape.id);
const watch = await fetch(`${endpoint}?${params}`);
const watchText = await watch.text();
writeFileSync(`${outDir}/watch-reel.json`, `${watchText}\n`);
if (!watch.ok) throw new Error(`WATCH ${watch.status}: ${watchText}`);
const papers = JSON.parse(watchText).reel?.meta;
if (papers?.buildId !== submission.tape.meta.buildId || papers?.engineHash !== submission.tape.meta.engineHash || papers?.era !== submission.tape.meta.era) throw new Error(`WATCH papers mismatch: ${JSON.stringify(papers)}`);
process.stdout.write(`${JSON.stringify({ rank: JSON.parse(postText).rank, tapeId: submission.tape.id, assay: slip.assay, assayHash: slip.assayHash, papers })}\n`);

