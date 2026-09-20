// s1223: append the superseding measurement to the inventory that MINTED "25% mobile-only".
// Appending, never rewriting: the s1216 row is honest history (RETENTION LAW) — what needed
// correcting is that nothing next to it said the number had been superseded.
import { appendFileSync, readFileSync } from 'node:fs';

const P = 'logs/suite-red-inventory.md';
const MARK = '## SUPERSEDED — `ap-standing-orders.spec.ts:80` is CURED';

if (readFileSync(P, 'utf8').includes(MARK)) {
  console.log('already appended — no-op (dupe-guard)');
  process.exit(0);
}

const section = `

---

${MARK}, and "25% mobile-only" was never a property (APPENDED s1223)

⚠️ **The s1216 row above (\`mobile-chrome … 2/8 (25.0%) … monotonic\`) is the origin of the
"25% mobile-only at w4" label that then rode four task masters and three fires as a reason not to
look at this spec.** The row itself is honest — it states its tree, its denominator and its worker
count. What was not honest is what got copied out of it: a rate stripped of its denominator and its
load, re-quoted as a *property of the test*.

**The subject is now CURED** — s1222, \`a0aae876\`, **test-only** (\`git show --name-only\` over \`src/\`,
\`functions/\`, \`assets/\` is empty). The spec let the wave countdown EXPIRE before forcing wave 1, so
the \`:121\` assertion was correctly rejecting the transition. It was a deterministic sequencing bug
whose *visibility* was load-dependent — not a concurrency victim, and \`StandingOrders.ts\` was never
at fault.

**Pre-cure failure rate is a monotonic function of load, and is SYMMETRIC across projects:**

| Measurement | loadavg | desktop-chrome | mobile-chrome |
|---|---|---:|---:|
| s1216 (this table, dedicated box, w4) | quiet | 0/8 (0.0%) | 2/8 (25.0%) |
| s1223 control (interleaved T–C–T, w4) | 5.4 → 15.7 | **2/4 (50.0%)** | **2/4 (50.0%)** |
| s1222 control (drain load, w4) | ~25 | **4/4 (100.0%)** | **4/4 (100.0%)** |

➡️ **"mobile-only" was a small-sample artifact, and it is quantifiable rather than a matter of
opinion:** at the ~12.5% pooled rate this table measured, a desktop arm drawing 0/8 has probability
0.875⁸ ≈ **34%** — an unremarkable coin-flip, not evidence of a project-specific defect. Both later
measurements, at higher load and with the arms counted separately, put desktop and mobile at
*identical* rates.

**Post-cure:** **64/64 green**, both projects, across two independent fires and trees — s1222
(32/32 at loadavg 25.28) and s1223 (T1 16/16 at loadavg → 14.50; T2 16/16 at loadavg → **29.06**,
the heaviest load this subject has ever been measured under). A failure in this spec is now a **real
regression** and must be reported as one, not written off.

**Method note, and the reason this section exists:** s1223 set out to strike the label from task
prose per s1222's recommendation, and found that recommendation's premise wrong — s1222 recorded
"it is not in \`logs/suite-red-inventory.md\` (checked)", but the grep was for the task-prose label
\`:121\` while this file keys the same subject on \`:80\`. **The number was minted here.** Correcting
only the copies would have left the source able to regenerate them. s1223's own first control arm
was also thrown away rather than used: it reported a tidy 8/8 red that was \`ERR_CONNECTION_REFUSED\`
from a scratch dev server that had silently died — a contaminated control agreeing with the
conclusion it was supposed to test.
`;

appendFileSync(P, section);
console.log('appended.');
