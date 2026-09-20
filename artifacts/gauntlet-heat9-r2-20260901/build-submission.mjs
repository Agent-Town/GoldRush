import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const [tapePath, outPath, profileName = 'Heat 9 R2 Era Probe', model = 'deterministic-controller', harness = 'operator-probe', harnessVersion = '1', config = 'replayed prior verified orders solely for build-skew gate'] = process.argv.slice(2);
const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
if (tape.outcome?.secured !== true) throw new Error('refusing to submit an unsecured tape');
if (tape.meta?.era !== 5) throw new Error(`wrong era: ${tape.meta?.era}`);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const submission = {
  contractId: tape.contract,
  epochId: tape.contract === 'e2-hill-mine' ? 'epoch-2-steamworks' : 'epoch-1-frontier',
  score: { secured: true, waves: tape.outcome.waves, timeAlive: tape.outcome.timeAlive, gold: tape.outcome.gold, baseValue: 0 },
  profileName,
  anonId: sha256(`heat9-r2-${harness}`).slice(0, 32),
  difficulty: tape.difficulty,
  seed: tape.seed,
  seedMode: 'bench',
  seedHash: sha256(tape.seed),
  inputLogHash: sha256(JSON.stringify(tape.inputLog)),
  stack: { model, harness, harnessVersion, worldModel: 'sim-import', config, calls: tape.outcome.calls },
  tape,
};
writeFileSync(outPath, `${JSON.stringify(submission)}\n`);
process.stdout.write(`${JSON.stringify({ tapeId: tape.id, score: submission.score, papers: tape.meta })}\n`);
