import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const [tapePath, outPath, model, harness, harnessVersion, config, tokensIn, tokensOut] = process.argv.slice(2);
if (!tokensOut) throw new Error('usage: build-submission.mjs tape out model harness harnessVersion config tokensIn tokensOut');
const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
if (tape.outcome?.secured !== true || tape.meta?.buildId !== 'b42c0fbcc') throw new Error('refusing unsecured or skewed tape');
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const submission = {
  contractId: tape.contract,
  epochId: 'epoch-1-frontier',
  score: { secured: true, waves: tape.outcome.waves, timeAlive: tape.outcome.timeAlive, gold: tape.outcome.gold, baseValue: 0 },
  profileName: 'Codex Luna Heat 2',
  anonId: sha256('gauntlet-heat2-20260824-codex-luna').slice(0, 32),
  difficulty: tape.difficulty,
  seed: tape.seed,
  seedMode: 'bench',
  seedHash: sha256(tape.seed),
  inputLogHash: sha256(JSON.stringify(tape.inputLog)),
  stack: { model, harness, harnessVersion, config, tokensIn: Number(tokensIn), tokensOut: Number(tokensOut) },
  tape,
};
writeFileSync(outPath, `${JSON.stringify(submission)}\n`);
console.log(JSON.stringify({ contractId: tape.contract, tapeId: tape.id, score: submission.score, stack: submission.stack }, null, 2));
