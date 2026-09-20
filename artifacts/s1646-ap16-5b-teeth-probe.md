# s1646 gate evidence — AP-16-5b teeth probe (source + measured output)

Run in the detached gate worktree `gate-s1646` on the MERGED tree, independent of the runner's
report and of the shipped suite. Preserved per the RETENTION LAW rather than dying with the worktree.

## Measured output

```
| (index) | input                    | submit         | facingReachingSim |
| 0       | rotationSteps: 0         | ok             | 0                 |
| 1       | rotationSteps: 1         | ok             | 1                 |
| 2       | rotationSteps: 2         | ok             | 2                 |
| 3       | rotationSteps: 3         | ok             | 3                 |
| 4       | rotationSteps ABSENT     | ok             | 0                 |
| 5       | rotationSteps: 7         | INVALID_ARGS   | (refused)         |
| 6       | rotationSteps: -1        | INVALID_ARGS   | (refused)         |
| 7       | rotationSteps: 1.5       | INVALID_ARGS   | (refused)         |
| 8       | rotationSteps: "north"   | INVALID_ARGS   | (refused)         |
| 9       | rotationSteps: null      | INVALID_ARGS   | (refused)         |

ACCEPT arm (0,1,2,3 forwarded + omission=0): PASS
REJECT arm (7,-1,1.5,"north",null all INVALID_ARGS): PASS
```

## Control (same tree, same shell, same hour)

```
src/sim/SeatOrders.ts reverted to main, merged test file left in place:
  tests 6 | pass 5 | fail 1
  X the seat carries the facing, and refuses a facing the county does not keep
  actual:   { ok: false, reason: INVALID_ARGS, message: orders[0] does not match the BUILD schema. }
  expected: { ok: true, accepted: 1 }
restored byte-identically, blob e69fd44b86bb8f0caeda8082837b9b7c9894d1d6
```

## Probe source

```js
// s1646 drain teeth-proof — independent of the runner's own report and of the
// merged suite. Asks the merged seat the questions the master's scope 3+4 rule on,
// including three inputs (-1, 1.5, null) the shipped test does NOT cover.
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('.', import.meta.url));

const build = (rotationSteps) => ({
  verb: 'BUILD',
  what: 'sluice',
  where: { x: 3, z: 4 },
  when: { waveGte: 1 },
  ...(rotationSteps === undefined ? {} : { rotationSteps }),
});

const state = { wave: 5, gold: 9999 };
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const { SeatOrdersDriver } = await vite.ssrLoadModule('/src/sim/SeatOrders.ts');
  const rows = [];

  // ACCEPT arm: 0..3 accepted AND the facing reaches the sim's place_build action.
  for (const f of [0, 1, 2, 3]) {
    const d = new SeatOrdersDriver();
    const v = d.submit([build(f)]);
    const acts = v.ok ? d.fire(state) : [];
    rows.push({ input: `rotationSteps: ${f}`, submit: v.ok ? 'ok' : v.reason, facingReachingSim: acts.length ? acts[0].rotationSteps : '(none)' });
  }

  // OMISSION arm: must behave identically to today — facing 0.
  {
    const d = new SeatOrdersDriver();
    const v = d.submit([build(undefined)]);
    const acts = v.ok ? d.fire(state) : [];
    rows.push({ input: 'rotationSteps ABSENT', submit: v.ok ? 'ok' : v.reason, facingReachingSim: acts.length ? acts[0].rotationSteps : '(none)' });
  }

  // REJECT arm: validate-not-normalize, the ruling inherited from AP-16-5.
  for (const bad of [7, -1, 1.5, 'north', null]) {
    const d = new SeatOrdersDriver();
    const v = d.submit([build(bad)]);
    rows.push({ input: `rotationSteps: ${JSON.stringify(bad)}`, submit: v.ok ? 'ACCEPTED (WRONG)' : v.reason, facingReachingSim: v.ok ? 'LEAKED' : '(refused)' });
  }

  console.table(rows);

  const accepted = rows.slice(0, 5);
  const refused = rows.slice(5);
  const acceptOk = accepted.every((r, i) => r.submit === 'ok' && r.facingReachingSim === (i === 4 ? 0 : i));
  const refuseOk = refused.every((r) => r.submit === 'INVALID_ARGS');
  console.log('ACCEPT arm (0,1,2,3 forwarded + omission=0):', acceptOk ? 'PASS' : 'FAIL');
  console.log('REJECT arm (7,-1,1.5,"north",null all INVALID_ARGS):', refuseOk ? 'PASS' : 'FAIL');
  process.exitCode = acceptOk && refuseOk ? 0 : 1;
} finally {
  await vite.close();
}
```
