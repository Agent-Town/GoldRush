import { readFileSync, writeFileSync } from 'node:fs';

const [submissionPath, outDir] = process.argv.slice(2);
const submission = JSON.parse(readFileSync(submissionPath, 'utf8'));
const origin = 'https://agenttown.app';
const endpoint = `${origin}/api/standings`;
const post = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', origin }, body: JSON.stringify(submission) });
const postText = await post.text();
writeFileSync(`${outDir}/post-response.json`, `${postText}\n`);
if (!post.ok) throw new Error(`POST ${post.status}: ${postText}`);
const params = new URLSearchParams({ epoch: submission.epochId, contract: submission.contractId, season: '2', verdict: submission.tape.id });
let slip;
for (let poll = 0; poll < 60; poll += 1) {
  const response = await fetch(`${endpoint}?${params}`);
  if (response.ok) {
    slip = await response.json();
    if (slip.assay !== 'pending') break;
  }
  await new Promise((done) => setTimeout(done, 2_000));
}
writeFileSync(`${outDir}/verdict-slip.json`, `${JSON.stringify(slip)}\n`);
if (!slip || slip.assay !== 'verified') throw new Error(`assay ${slip?.assay ?? 'missing'}: ${slip?.assayReason ?? 'no reason'}`);
params.delete('verdict');
params.set('reel', submission.tape.id);
const watch = await fetch(`${endpoint}?${params}`);
const watchText = await watch.text();
writeFileSync(`${outDir}/watch-reel.json`, `${watchText}\n`);
if (!watch.ok) throw new Error(`WATCH ${watch.status}: ${watchText}`);
const reel = JSON.parse(watchText).reel;
if (reel?.meta?.buildId !== submission.tape.meta.buildId || reel?.meta?.engineHash !== submission.tape.meta.engineHash || reel?.meta?.era !== 5) throw new Error(`WATCH papers mismatch: ${JSON.stringify(reel?.meta)}`);
process.stdout.write(`${JSON.stringify({ rank: JSON.parse(postText).rank, tapeId: submission.tape.id, assay: slip.assay, assayHash: slip.assayHash, papers: reel.meta })}\n`);

