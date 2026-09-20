/**
 * E10S-4 replay probe — WHAT THE PROVER'S TAPE REPLAYS, measured.
 *
 *   node artifacts/e10s-4-door/replay-probe.mjs > artifacts/e10s-4-door/replay.json
 *
 * F-E10S3-8 warned that "a stoke records no run-tape action (`LockstepAction` carries only
 * upgrade/demolish/fund/recover) ... so a replayed Ember Shore tape would not re-stoke", and asked
 * this slice to state what the tape can and cannot reproduce. The measurement is kinder than the
 * warning and the difference matters, so it is taken rather than argued:
 *
 *   - A gr-sim agent tape does NOT record one action per stoke. It records the rider's ORDER
 *     ARRAYS, one `agent_orders` entry per submission (`scripts/gr-sim.mjs`'s `writeAgentTape`),
 *     and a `{verb:'CONTEXT_ACTION',action:'stoke'}` order rides inside them like any other. The
 *     canonical tape below carries 29 stoke orders and 144 HARVEST orders.
 *   - So the replay re-plays the whole errand, stokes included, and reproduces the run's outcome
 *     field for field.
 *   - It does NOT reproduce the run's `eventLogHash`, and the reason is structural rather than
 *     mechanical: the rider answers `SECURE_CHOICE` at the instant the run ends, which
 *     `writeAgentTape` records at tick `durationTicks - 1 + 1`, and `AgentTapeReplaySession`
 *     refuses to resume at or past `durationTicks` ("resume tick must be an integer between 0 and
 *     10800"). That one entry can never be fed back, so the replay defaults the choice instead.
 *   - THE CONTROL PROVES THAT IS THE WHOLE DIFFERENCE: the same prover with the secure choice
 *     deliberately defaulted produces exactly the hash the replay produces, and ITS tape replays
 *     to that hash too.
 *
 * ⚠️ It also records a HAZARD found by tripping it: `scripts/gr-sim.mjs:140` reads
 * `options.tape ?? options.resume`, so a bare `--resume tape.json` OVERWRITES the tape it just
 * replayed. Every replay below therefore passes `--tape` to a scratch path. Reading a recording
 * should not destroy it.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const scratch = mkdtempSync(path.join(tmpdir(), 'e10s4-replay-'));
const blanks = path.join(scratch, 'blank-lines.txt');
writeFileSync(blanks, '\n'.repeat(50));

const tapeFacts = (file) => {
  const tape = JSON.parse(readFileSync(path.join(root, file), 'utf8'));
  const orders = tape.inputLog.entries.flatMap((entry) => entry.a.flatMap((action) => action.orders ?? []));
  return {
    file,
    durationTicks: tape.inputLog.durationTicks,
    entries: tape.inputLog.entries.length,
    lastEntryTick: tape.inputLog.entries.at(-1).t,
    lastEntryOrders: tape.inputLog.entries.at(-1).a[0].orders,
    stokeOrders: orders.filter((order) => order.action === 'stoke').length,
    harvestOrders: orders.filter((order) => order.verb === 'HARVEST').length,
    ordersLogHash: tape.eventLogHash,
    recordedOutcome: tape.outcome,
  };
};

const replay = (file, run) => {
  const out = execFileSync(process.execPath, [
    'scripts/gr-sim.mjs', '--resume', file, '--tape', path.join(scratch, `scratch-${run}.json`),
  ], { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], input: readFileSync(blanks, 'utf8'), maxBuffer: 256 * 1024 * 1024 });
  const outcomes = out.trim().split('\n').map((line) => JSON.parse(line)).filter((message) => message.now === undefined);
  return outcomes.at(-1);
};

const report = {
  note: 'see this file\'s header; every number below is produced by the command in it',
  canonical: {
    tape: tapeFacts('artifacts/e10s-4-door/prover-01.tape.json'),
    runOutcomeHash: 'fnv1a32:84aace38',
    replays: [1, 2].map((run) => replay('artifacts/e10s-4-door/prover-01.tape.json', `canon-${run}`)),
  },
  control: {
    tape: tapeFacts('artifacts/e10s-4-door/control-default-secure.tape.json'),
    runOutcomeHash: 'fnv1a32:b7cb15c0',
    replays: [1, 2].map((run) => replay('artifacts/e10s-4-door/control-default-secure.tape.json', `ctl-${run}`)),
  },
};
report.canonical.replayReproducesRunHash = report.canonical.replays.every((row) => row.eventLogHash === report.canonical.runOutcomeHash);
report.control.replayReproducesRunHash = report.control.replays.every((row) => row.eventLogHash === report.control.runOutcomeHash);
report.replayOfCanonicalEqualsControlRun = report.canonical.replays.every((row) => row.eventLogHash === report.control.runOutcomeHash);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
