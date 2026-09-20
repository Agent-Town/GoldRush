import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const [tapePath, outPath, profileName, anonSeed, model, harness, harnessVersion, config] = process.argv.slice(2);
if (!config) throw new Error('usage: build-submission.mjs tape out profile anonSeed model harness harnessVersion config');

const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
const limits = { 'e1-night-shift': 22_501 };
const limit = limits[tape.contract] ?? 18_000;
const duration = tape.inputLog?.durationTicks;
const entries = tape.inputLog?.entries;
if (!Number.isInteger(duration) || duration < 0 || duration > limit) throw new Error(`invalid tape durationTicks: ${duration}`);
if (!Array.isArray(entries) || entries.some(({ t }) => !Number.isInteger(t) || t < 0 || t >= duration)) throw new Error('invalid tape entry tick');
if (tape.outcome?.secured !== true) throw new Error('refusing to submit an unsecured tape');
if (tape.meta?.buildId !== '730046c8f') throw new Error(`wrong deployed build: ${tape.meta?.buildId}`);

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const submission = {
  contractId: tape.contract,
  epochId: tape.contract === 'e2-hill-mine' ? 'epoch-2-steamworks' : 'epoch-1-frontier',
  score: { secured: true, waves: tape.outcome.waves, timeAlive: tape.outcome.timeAlive, gold: tape.outcome.gold, baseValue: 0 },
  profileName,
  anonId: sha256(anonSeed).slice(0, 32),
  difficulty: tape.difficulty,
  seed: tape.seed,
  seedMode: 'bench',
  seedHash: sha256(tape.seed),
  inputLogHash: sha256(JSON.stringify(tape.inputLog)),
  stack: { model, harness, harnessVersion, worldModel: 'sim-import', config, calls: tape.outcome.calls },
  tape,
};
writeFileSync(outPath, `${JSON.stringify(submission)}\n`);
process.stdout.write(`${JSON.stringify({ tapeId: tape.id, score: submission.score })}\n`);
