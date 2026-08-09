#!/usr/bin/env node
// s1595 — correct F-1595-1 and its six banners after the gate probe REFUTED this
// fire's own severity claim. The row's header carried a false claim, and the whole
// point of F-1595-1 is that the header is the reader's index — so the correction
// must reach the HEADER, not only the tail. Practising what the row preaches.
import { readFileSync, writeFileSync } from 'node:fs'

const F = 'tasks/BACKLOG.md'
let text = readFileSync(F, 'utf8')

const subs = [
  // 1. The header claim itself.
  [
    'THE HEADER-SCAN CLASS IS NOT A LEDGER-HYGIENE NUISANCE, IT IS MISTAKE #8 ARMED AND RE-ARMING ITSELF ONCE PER SHIPPING FIRE).**',
    'THE HEADER-SCAN CLASS RE-ARMS ITSELF ONCE PER SHIPPING FIRE — BUT MY OWN "MISTAKE #8 ARMED" SEVERITY CLAIM WAS REFUTED BY PROBE IN THIS SAME FIRE, AND THE REFUTATION IS THE MORE USEFUL HALF).**',
  ],
  // 2. The injury paragraph's conclusion.
  [
    'and queues **attempt 6 against an already-merged diff** — Mistake #8, the 824k flail.',
    'and reaches for **attempt 6 against an already-merged diff**.',
  ],
]

for (const [from, to] of subs) {
  const n = text.split(from).length - 1
  if (n !== 1) { console.error(`REFUSING: substitution matched ${n} times: ${from.slice(0, 70)}`); process.exit(2) }
  text = text.replace(from, to)
}

// 3. Soften the six banners' Mistake #8 framing (they are now overstated too).
const bannerSubs = [
  ['so this row invites a `cp` that would re-derive an already-merged diff — Mistake #8, the 824k flail. The closure is recorded only in this row’s TAIL.**',
   'so this row invites a `cp` — which `drain-block-check --strict --queue` WILL refuse at rc=1 (probed s1595), so the cost is a wasted trip and a misread, not a flail. The closure is recorded only in this row’s TAIL.**'],
  ['Bannered anyway because an adjacent line is a weak mitigation for a cp-able shipped master (Mistake #8).',
   'Bannered anyway because an adjacent line is a weak mitigation for a cp-able shipped master.'],
  ['Bannered anyway — an adjacent line is weak protection for a cp-able shipped master.',
   'Bannered anyway — an adjacent line is weak protection for a cp-able shipped master.'],
]
for (const [from, to] of bannerSubs) {
  if (from === to) continue
  const n = text.split(from).length - 1
  if (n < 1) { console.error(`WARN: banner substitution not found: ${from.slice(0, 60)}`); continue }
  text = text.split(from).join(to)
  console.log(`banner softened (${n}x)`)
}

// 4. Append the refutation to the row's tail.
const APPEND = ' ⛔ **REFUTED BY PROBE, IN THE SAME FIRE THAT CLAIMED IT — AND THE CORRECTION IS WRITTEN INTO THE HEADER ABOVE, NOT ONLY HERE, BECAUSE THAT IS THIS ROW’S OWN LAW.** I wrote *“Mistake #8 armed and loaded”* and then, while checking §0.1 of `/author-task` before authoring the mechanism, ran the gate on all five flagged masters: **`node scripts/drain-block-check.mjs --strict --queue <master>` returns rc=1 `⛔ ALREADY SHIPPED — DO NOT QUEUE` for all five of them** (`f1592-3`, `f1591-1`, `f1589-4`, `f1522-1-dispatch-lane-safety`, `e3-voltage-socket`), each naming its `mergeHash` and `refusal arm=status="merged"`. **A live mechanism already stands between the misleading row and the disaster**, and `/author-task` §5 makes running it the mandatory LAST act before any `cp`. 📉 **SO THE SEVERITY IS: a reading hazard and a wasted trip, NOT a re-derivation.** A fire misled by one of these headers spends its attention, reaches for the master, and is stopped at the gate. That is worth the six banners — it is not worth a new guard. 🚫 **THEREFORE NO MASTER WAS AUTHORED, AND THAT IS THE FINDING’S OPERATIVE OUTPUT.** The mechanism I was about to write would have duplicated `drain-block-check --queue` (the refusal) and `scripts/master-shipped-classifier.mjs` (the census — it already classifies all **988** masters, **575 SHIPPED**, and reports **63 NO-TRACE of which 63 self-declare DO NOT QUEUE → 0 candidates**). ⚠️ **HOW I NEARLY MISSED IT, WHICH IS THE REUSABLE PART: I reasoned from the INVITATION to the INJURY without ever checking what stood in between.** The row genuinely invites; the disaster is genuinely bad; and the step I never questioned was whether the path between them was open. **“Prove the lever” (F-1590-1) is normally applied to a CURE — this is the same duty applied to a HAZARD CLAIM: an invitation is not an injury until you have shown the path from one to the other is unguarded.** ⓘ The three prior fires in this thread (s1593 header-vs-row, s1594 tail-only closures, s1595 dispatch rows) each escalated the stated stakes and **none of them ran the gate**; the escalation was rhetorical, not measured. 💡 *And the honest summary of the class, now that it is measured end to end: **the ledger is misleading in a way that costs attention, and the factory is defended in a way that costs nothing.** Fix the prose; do not build a second lock for a door that already has one.*'

const anchor = 'which is why every individual author and every individual drain looks blameless and the class still grows once per fire.*'
if (!text.includes(anchor)) { console.error('REFUSING: tail anchor not found'); process.exit(2) }
text = text.replace(anchor, anchor + APPEND)

writeFileSync(F, text)
console.log('F-1595-1 corrected: header claim retracted, banners softened, refutation appended.')
