// F-2127-1 evidence probe — banked s2128 (2026-08-21), CITED by tasks/f2127-1-stdin-rejection-deadlock.md.
// PRODUCED the control that proved the deadlock; retained under the RETENTION LAW as evidence, not one-shot scratch.
//
// Does a REJECTED order deadlock gr-sim's stdin protocol? Sends orders at the FIRST view, then waits.
// If the protocol re-prompts, another view arrives and we exit fast. If it deadlocks, nothing arrives.
//
// Measured s2128, fire shell, same binary / contract / seed / first view — only the ORDERS' validity differs:
//   node scripts/f2127-stdin-rejection-probe.mjs invalid 25000  -> NO-FURTHER-VIEW, 23,228 ms, stderr names the rejection
//   node scripts/f2127-stdin-rejection-probe.mjs valid   25000  -> RE-PROMPTED,        218 ms, stderr silent
// 218 ms vs >=23 s on the same first view: the REJECTION is the hang, not the harness and not the contract.
import { spawn } from 'node:child_process';

const BUDGET_MS = Number(process.argv[3] ?? 25_000);
const MODE = process.argv[2] ?? 'invalid'; // 'invalid' | 'valid'

const child = spawn(process.execPath,
  ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--policy=stdin'],
  { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] });

let buffer = '', stderr = '', views = 0, sentAt = 0, firstView = true;
const timer = setTimeout(() => {
  console.log(JSON.stringify({
    verdict: 'NO-FURTHER-VIEW', mode: MODE, viewsSeen: views,
    msSinceSend: sentAt ? Date.now() - sentAt : null,
    stderrTail: stderr.trim().split('\n').slice(-3),
  }, null, 2));
  child.kill('SIGKILL');
  process.exit(0);
}, BUDGET_MS);

child.stdout.setEncoding('utf8');
child.stderr.setEncoding('utf8');
child.stderr.on('data', (c) => { stderr += c; });
child.stdout.on('data', (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, nl); buffer = buffer.slice(nl + 1);
    if (!line) continue;
    const msg = JSON.parse(line);
    if (msg.schema !== 'goldrush.view.v1') continue;
    views += 1;
    if (!firstView) {
      clearTimeout(timer);
      console.log(JSON.stringify({
        verdict: 'RE-PROMPTED', mode: MODE, viewsSeen: views,
        msSinceSend: Date.now() - sentAt,
        stderrTail: stderr.trim().split('\n').slice(-3),
      }, null, 2));
      child.kill('SIGKILL');
      process.exit(0);
    }
    firstView = false;
    const orders = MODE === 'invalid'
      ? [{ verb: 'PICK_UPGRADE', id: 'no-such-offer-id-s2128' }]
      : [{ verb: 'MOVE_HERO', pos: { x: 0, z: 12 } }];
    sentAt = Date.now();
    child.stdin.write(`${JSON.stringify(orders)}\n`);
  }
});
child.on('error', (e) => { console.error('spawn error', e); process.exit(1); });
