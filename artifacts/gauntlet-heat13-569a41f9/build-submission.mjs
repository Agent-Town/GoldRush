// Heat 13 submission builder (operator tooling, transport only). Usage:
//   node build-submission.mjs <tape.json> <out.json> <rig> [harnessVersion] [worldModel] [config] [calls] [tokensIn] [tokensOut] [harnessDigest]
// rig ∈ probe | opus. Identity + stack per the heat-8/10/11 law; epochId from winnability-receipts.json.
//
// ADAPTED FROM HEAT 11 (cited in heat12-note.md §rig):
//  (1) seedMode is resolved from the CANONICAL bench-seed registry (assets/contracts/bench-seeds.json)
//      instead of a hand-kept copy beside the rig, so a stale copy can never mislabel a bench ride
//      as a live-county standing.
//  (2) The ride stack declares `harness: heat13-operator` per the heat-12 brief; `config` carries the
//      full truth of what produced it (headless `claude -p`, Claude Code CLI <version>).
//  (3) The operator probe keeps `harness: operator-probe`, which public/skill.md:52 defines as
//      "verified but never ranked" — the heat's law that a probe never touches the board.
//  (4) A tape whose seed is a ROTATION seed is refused outright (heat-12 law: never ride rotation seeds).
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
const rotations = JSON.parse(readFileSync(new URL('../../assets/rotations/rotation-seeds.json', import.meta.url), 'utf8'));
for (const rotation of rotations.rotations ?? []) {
  if (Object.values(rotation.seeds ?? {}).includes(tape.seed)) throw new Error(`refusing a ROTATION seed (${rotation.id}): ${tape.seed}`);
}
const bench = JSON.parse(readFileSync(new URL('../../assets/contracts/bench-seeds.json', import.meta.url), 'utf8'));
const seedMode = (bench[tape.contract] ?? []).includes(tape.seed) ? 'bench' : 'live';
const identity = {
  probe: { profileName: 'Heat 13 Grammar Probe', anonId: sha256('heat13-probe').slice(0, 32), stack: { model: 'deterministic-controller', harness: 'operator-probe', harnessVersion: '1', worldModel: 'sim-import', config: 'replayed heat 12 orders with the ADR-005 retired verbs dropped, solely for the build-skew gate' } },
  opus: { profileName: 'Claude Opus 5', anonId: '9677a7e7ba4a1704cafa3f083b74e935', stack: { model: 'claude-opus-5', harness: 'heat13-operator' } },
}[rig];
if (!identity) throw new Error(`unknown rig ${rig}`);
const num = (v) => (v !== undefined && v !== '' && v !== '-' ? Number(v) : undefined);
const stack = rig === 'probe' ? identity.stack : {
  ...identity.stack,
  harnessVersion,
  ...(harnessDigest && harnessDigest !== '-' ? { harnessDigest } : {}),
  worldModel: worldModel && worldModel !== '-' ? worldModel : 'sim-import',
  config: config && config !== '-' ? config : `attended-hosted headless \`claude -p\` ride (heat 13, the 1:1-grammar re-ride) on Claude Code CLI ${harnessVersion}; charter + door manual + own notebook (self-memory); own controller authored in-ride`,
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
process.stdout.write(`${JSON.stringify({ tapeId: tape.id, contract: tape.contract, epochId, seed: tape.seed, seedMode, score: submission.score, papers: tape.meta, durationTicks: tape.inputLog?.durationTicks ?? null, lastEntryTick: tape.inputLog?.entries?.length ? tape.inputLog.entries[tape.inputLog.entries.length - 1].t : null, stack })}\n`);
