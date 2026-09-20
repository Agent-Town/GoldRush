import { appendFileSync } from 'node:fs';

const p = 'artifacts/gr-sim/ap-07/report.md';
const note = `

---

## SUPERSEDING NOTE — appended 2026-08-01 (s1316 drain of \`ap-07-the-claim-pin-lift\`, merge \`f05fd161\`)

The sentence at line 14 above — *"It fails closed for contracts other than \`e1-dry-gulch\`; adding another
contract requires its real objective driver."* — was **true of this run** and is **left verbatim** per the
Retention Law. It is recorded here as **SUPERSEDED**, not corrected, because two later readers found the
second clause misleading and a third measured why.

- **First clause, still true in kind:** GR-SIM still fails closed. The pin is now a SET rather than a
  constant (\`SUPPORTED_CONTRACTS\`, \`src/sim/HeadlessContractSim.ts:34\`), and the throw **enumerates its
  members**, so the message cannot go stale the way this sentence did.
- **Second clause, FALSIFIED for \`the-claim\`** (F-1314-5, s1314, by running the sim rather than reading
  about it): \`the-claim\` needed **no new objective driver at all**. Its objective is data —
  \`twist.secureWave: 10\` — and \`startWave\` already read that field with no contract branch. It was
  admitted by moving the pin and nothing else.
- **Second clause, still TRUE for \`e1-twin-banks\`** (F-1314-5b): its \`twist\` declares only
  \`secureWave: 20\` while its briefing promises *hold both banks*, so the stated objective has no
  machine-readable form. Admitting it means inventing a loss mechanic — a design fork, **owner-gated**,
  not a pin-lift.

**Why this note exists** (F-1314-2, s1314): the sentence stated one undifferentiated rule over two
contracts whose answers are opposite. s1312 read it and inferred a cheap pin-lift; s1313 read it and
inferred heavy driver work; **both were right about one contract and wrong about the other, and neither
could have got the full answer from it.** This run's *measured* content — determinism, byte-identical
replays, the hashes — has held up perfectly under every re-check since, including two independent
reproductions of \`fnv1a32:3d75c580\`. Only the one generalising sentence ever cost anything.

Appended rather than edited because F-1314-2 asked for this sentence to be replaced while the pin-lift
master firewalled the file as **NO** (an artifact records a past merge; editing it falsifies the ledger).
Both instructions were correct; the Retention Law's own pattern — supersede, never delete — is what
satisfies them together.

💡 **Prose in an evidence artifact inherits the credibility of the numbers beside it.** Keep the numbers;
qualify the prose in place, at the bottom, dated — never by editing the record.
`;

appendFileSync(p, note);
console.log('superseding note appended to', p);
