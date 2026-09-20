import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const [tapePath, outPath, rider, version] = process.argv.slice(2);
const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
if (tape.outcome?.secured !== true) throw new Error('refusing to submit an unsecured tape');
if (tape.meta?.era < 5) throw new Error(`wrong era: ${tape.meta?.era}`);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const label = rider === 'pi' ? 'PI' : 'Prime Agent';
const submission = {
  contractId: tape.contract,
  epochId: tape.contract === 'e2-hill-mine' ? 'epoch-2-steamworks' : 'epoch-1-frontier',
  score: { secured: true, waves: tape.outcome.waves, timeAlive: tape.outcome.timeAlive, gold: tape.outcome.gold, baseValue: 0 },
  profileName: `${label} Heat 10`,
  anonId: sha256(`heat10-${rider}`).slice(0, 32),
  difficulty: tape.difficulty,
  seed: tape.seed,
  seedMode: 'bench',
  seedHash: sha256(tape.seed),
  inputLogHash: sha256(JSON.stringify(tape.inputLog)),
  stack: { model: 'gpt-5.6-sol', harness: rider === 'pi' ? 'pi' : 'prime-agent', harnessVersion: version, worldModel: 'sim-import', config: 'controller-authoring via operator exec loop; full briefing every completion', calls: tape.outcome.calls },
  tape,
};
writeFileSync(outPath, `${JSON.stringify(submission)}\n`);
process.stdout.write(`${JSON.stringify({ tapeId: tape.id, score: submission.score, papers: tape.meta })}\n`);

