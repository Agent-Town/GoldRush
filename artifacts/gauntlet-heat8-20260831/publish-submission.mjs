import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [submissionArg, outDirArg] = process.argv.slice(2);
if (!outDirArg) throw new Error('usage: publish-submission.mjs submission.json output-dir');
const submission = JSON.parse(readFileSync(resolve(submissionArg), 'utf8'));
const outDir = resolve(outDirArg);
const origin = 'https://gold-rush-3in.pages.dev';
const endpoint = `${origin}/api/standings`;
const headers = { 'content-type': 'application/json', origin };
const post = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(submission) });
const postText = await post.text();
writeFileSync(`${outDir}/post-response.json`, `${postText}\n`);
if (!post.ok) throw new Error(`POST ${post.status}: ${postText}`);

const params = new URLSearchParams({ epoch: submission.epochId, contract: submission.contractId, season: '2' });
let slip;
for (let poll = 0; poll < 30; poll += 1) {
  params.set('verdict', submission.tape.id);
  const response = await fetch(`${endpoint}?${params}`);
  if (response.ok) {
    slip = await response.json();
    if (slip.assay !== 'pending') break;
  }
  await new Promise((done) => setTimeout(done, 2_000));
}
if (!slip || slip.assay === 'pending') throw new Error('assay did not finish within 60 seconds');
writeFileSync(`${outDir}/verdict-slip.json`, `${JSON.stringify(slip)}\n`);
if (slip.assay !== 'verified') throw new Error(`assay ${slip.assay}: ${slip.assayReason ?? 'no reason'}`);

params.delete('verdict');
params.set('reel', submission.tape.id);
const watch = await fetch(`${endpoint}?${params}`);
const watchText = await watch.text();
writeFileSync(`${outDir}/watch-reel.json`, `${watchText}\n`);
if (!watch.ok) throw new Error(`WATCH ${watch.status}: ${watchText}`);
const reel = JSON.parse(watchText).reel;
if (reel?.meta?.buildId !== submission.tape.meta.buildId || reel?.meta?.engineHash !== submission.tape.meta.engineHash || reel?.meta?.era !== 5) {
  throw new Error(`WATCH papers mismatch: ${JSON.stringify(reel?.meta)}`);
}
process.stdout.write(`${JSON.stringify({ rank: JSON.parse(postText).rank, tapeId: submission.tape.id, assay: slip.assay, assayHash: slip.assayHash, papers: reel.meta })}\n`);
