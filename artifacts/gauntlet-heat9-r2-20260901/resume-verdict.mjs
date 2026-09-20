import { readFileSync, writeFileSync } from 'node:fs';

const [submissionPath, outDir] = process.argv.slice(2);
const submission = JSON.parse(readFileSync(submissionPath, 'utf8'));
const endpoint = 'https://agenttown.app/api/standings';
const params = new URLSearchParams({ epoch: submission.epochId, contract: submission.contractId, season: '2', verdict: submission.tape.id });
let slip;
for (let poll = 0; poll < 60; poll += 1) {
  try {
    const response = await fetch(`${endpoint}?${params}`);
    if (response.ok) {
      slip = await response.json();
      if (slip.assay !== 'pending') break;
    }
  } catch {}
  await new Promise((done) => setTimeout(done, 2_000));
}
writeFileSync(`${outDir}/verdict-slip.json`, `${JSON.stringify(slip)}\n`);
if (slip?.assay !== 'verified') throw new Error(`assay ${slip?.assay ?? 'missing'}: ${slip?.assayReason ?? 'no reason'}`);
params.delete('verdict');
params.set('reel', submission.tape.id);
const response = await fetch(`${endpoint}?${params}`);
const text = await response.text();
writeFileSync(`${outDir}/watch-reel.json`, `${text}\n`);
if (!response.ok) throw new Error(`WATCH ${response.status}: ${text}`);
const papers = JSON.parse(text).reel?.meta;
if (papers?.buildId !== submission.tape.meta.buildId || papers?.engineHash !== submission.tape.meta.engineHash || papers?.era !== 5) throw new Error(`WATCH papers mismatch: ${JSON.stringify(papers)}`);
process.stdout.write(`${JSON.stringify({ tapeId: submission.tape.id, assay: slip.assay, assayHash: slip.assayHash, papers })}\n`);
