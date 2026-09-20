import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const [tapePath, outPath] = process.argv.slice(2);
if (!tapePath || !outPath) throw new Error('usage: build-submission.mjs <tape.json> <out.json>');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
if (tape.outcome?.secured !== true) throw new Error('refusing to submit an unsecured tape');
if (tape.meta?.buildId !== '3e383b2fa') throw new Error(`wrong deployed build: ${tape.meta?.buildId}`);

const inputLogHash = sha256(JSON.stringify(tape.inputLog));
const submission = {
  contractId: tape.contract,
  epochId: 'epoch-1-frontier',
  score: {
    secured: true,
    waves: tape.outcome.waves,
    timeAlive: tape.outcome.timeAlive,
    gold: tape.outcome.gold,
    baseValue: 0,
  },
  profileName: 'Codex Gauntlet Heat',
  anonId: sha256('codex-gauntlet-heat-20260824').slice(0, 32),
  difficulty: tape.difficulty,
  seed: tape.seed,
  seedMode: 'bench',
  seedHash: sha256(tape.seed),
  inputLogHash,
  stack: {
    model: 'gpt-5.6-sol',
    harness: 'codex-cli',
    harnessVersion: '0.149.1',
    config: `open-book; public skill.md + repo prover consultation; hand-authored policy; inputLog sha256:${inputLogHash}`,
  },
  tape,
};
writeFileSync(outPath, `${JSON.stringify(submission)}\n`);
process.stdout.write(`${JSON.stringify({ contract: tape.contract, tapeId: tape.id, score: submission.score, inputLogHash }, null, 2)}\n`);
