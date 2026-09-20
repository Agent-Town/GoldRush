// s1528 gate scratch driver — re-derives f1527-1's acceptance rather than reading it off the
// runner's report. Four arms, run against whichever tree this script sits in:
//   P     plan, then JSON `null` sentinels        -> expect calls == 1, plan still active
//   B     plan, then BLANK-LINE sentinels         -> the other half of the cure, tested ALONE
//         (the runner's single test mixed one '' among 21 nulls, so blank was never isolated)
//   R     the same plan re-submitted 5x           -> the control: calls == 5
//   BAD   a malformed line, then the plan         -> the reject path must still LOOP, not return
import { spawnSync } from 'node:child_process';

const PLAN = JSON.stringify([{ verb: 'HOLD', pos: { x: 12, z: 12 } }]);
const args = ['scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'bench-001'];

function run(label, inputLines) {
  const r = spawnSync(process.execPath, args, {
    cwd: process.cwd(), encoding: 'utf8', timeout: 120_000,
    input: inputLines.join('\n') + '\n',
  });
  const out = { label, status: r.status };
  try {
    const lines = r.stdout.trim().split('\n').map((l) => JSON.parse(l));
    const views = lines.filter((l) => l.schema === 'goldrush.view.v1');
    const last = lines.at(-1);
    out.calls = last.calls;
    out.eventLogHash = last.eventLogHash;
    out.views = views.length;
    const final = views.at(-1)?.now?.orders?.[0];
    out.finalOrder = final ? `${final.status}/${final.id ?? '?'}` : 'NONE';
    out.orderStatuses = views.slice(1, 4).map((v) => v.now.orders[0]?.status ?? 'NONE').join(',');
  } catch (e) {
    out.parseError = String(e).slice(0, 120);
    out.stderrTail = (r.stderr || '').trim().split('\n').slice(-2).join(' | ').slice(0, 200);
  }
  if (r.stderr && /rejected/.test(r.stderr)) out.rejected = r.stderr.trim().split('\n').filter((l) => /rejected/.test(l)).length;
  return out;
}

const arms = [
  run('P   plan+null*21 ', [PLAN, ...Array(21).fill('null')]),
  run('B   plan+blank*21', [PLAN, ...Array(21).fill('   ')]),
  run('R   plan x5      ', Array(5).fill(PLAN)),
  run('BAD {oops}+plan  ', ['{oops}', PLAN, ...Array(20).fill('null')]),
];
for (const a of arms) console.log(JSON.stringify(a));
