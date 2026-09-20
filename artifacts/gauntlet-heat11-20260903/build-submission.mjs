// Heat 11 submission builder (operator tooling, transport only). Usage:
//   node build-submission.mjs <tape.json> <out.json> <rig> [harnessVersion] [worldModel] [config] [calls] [tokensIn] [tokensOut] [harnessDigest]
// rig ∈ probe | opus | fable. Identity + stack per the heat-8/10 law; epochId from winnability-receipts.json.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const [tapePath, outPath, rig, harnessVersion, worldModel, config, calls, tokensIn, tokensOut, harnessDigest] = process.argv.slice(2);
const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
if (tape.outcome?.secured !== true) throw new Error('refusing to submit an unsecured tape');
if (tape.meta?.era < 5) throw new Error(`wrong era: ${tape.meta?.era}`);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const receipts = JSON.parse(readFileSync(new URL('../../assets/rotations/winnability-receipts.json', import.meta.url), 'utf8'));
const epochId = receipts.contracts.find((c) => c.contractId === tape.contract)?.epochId;
if (!epochId) throw new Error(`no epochId for ${tape.contract}`);
const bench = JSON.parse(readFileSync(new URL('./bench-seeds.json', import.meta.url), 'utf8'));
const seedMode = (bench[tape.contract] ?? []).includes(tape.seed) ? 'bench' : 'live';
const identity = {
  probe: { profileName: 'Heat 11 Era Probe', anonId: sha256('heat11-probe').slice(0, 32), stack: { model: 'deterministic-controller', harness: 'operator-probe', harnessVersion: '1', worldModel: 'sim-import', config: 'replayed prior verified orders solely for build-skew gate' } },
  opus: { profileName: 'Claude Opus 5', anonId: '9677a7e7ba4a1704cafa3f083b74e935', stack: { model: 'claude-opus-5', harness: 'claude-code-cli' } },
  fable: { profileName: 'Claude Fable 5', anonId: '2020613c4e5317929b5e464812ee653e', stack: { model: 'claude-fable-5', harness: 'claude-code-cli' } },
}[rig];
if (!identity) throw new Error(`unknown rig ${rig}`);
const num = (v) => (v !== undefined && v !== '' && v !== '-' ? Number(v) : undefined);
const stack = rig === 'probe' ? identity.stack : {
  ...identity.stack,
  harnessVersion,
  ...(harnessDigest && harnessDigest !== '-' ? { harnessDigest } : {}),
  worldModel: worldModel && worldModel !== '-' ? worldModel : 'sim-import',
  config: config && config !== '-' ? config : 'attended-hosted headless ride (heat 11); charter + door manual + own notebook (self-memory); own controller authored in-ride',
  ...(num(calls) !== undefined ? { calls: num(calls) } : {}),
  ...(num(tokensIn) !== undefined ? { tokensIn: num(tokensIn) } : {}),
  ...(num(tokensOut) !== undefined ? { tokensOut: num(tokensOut) } : {}),
};
const submission = {
  contractId: tape.contract,
  epochId,
  score: { secured: true, waves: tape.outcome.waves, timeAlive: tape.outcome.timeAlive, gold: tape.outcome.gold, baseValue: 0 },
  profileName: identity.profileName,
  anonId: identity.anonId,
  difficulty: tape.difficulty,
  seed: tape.seed,
  seedMode,
  seedHash: sha256(tape.seed),
  inputLogHash: sha256(JSON.stringify(tape.inputLog)),
  stack,
  tape,
};
writeFileSync(outPath, `${JSON.stringify(submission)}\n`);
process.stdout.write(`${JSON.stringify({ tapeId: tape.id, contract: tape.contract, epochId, seed: tape.seed, seedMode, score: submission.score, papers: tape.meta, stack })}\n`);
