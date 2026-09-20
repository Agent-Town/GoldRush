// s1263: amend line-1 after the authored master's own gate refuted the fire's load arm.
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'STATUS.md';
const lines = readFileSync(p, 'utf8').split('\n');
let l = lines[0];

const edits = [
  [
    '**I WAS SENT TO IMPLEMENT A RECOMMENDATION AND THE MEASUREMENT REFUTED ITS UNIT.',
    '**I WAS SENT TO IMPLEMENT A RECOMMENDATION, MY MEASUREMENT REFUTED ITS UNIT — AND THEN THE MASTER I AUTHORED ON THAT MEASUREMENT REFUTED MY OWN LOAD ARM, IN THIS SAME FIRE, AND THE RUN IS RIGHT (F-1263-4). READ (C2) BEFORE TRUSTING ANY NUMBER BELOW.',
  ],
  [
    '🚀 **(E) THE CORRECTIVE IS AUTHORED, QUEUED, AND ALREADY RUNNING.**',
    '🚨 **(C2) THE REFUTATION, AND IT IS AGAINST ME.** My authored master ran and **STOPPED AT ITS OWN SCOPE-1 GATE — `PREMISE-NOT-REPRODUCED`**, no edits, no commit, 118,520 tokens (run `20260730-174518`). Its arms: quiet **3/3 subject / 15/15 file** at loadavg 5.89→4.75; **LOADED, the same 14 burners, 3/3 / 15/15, loadavg 5.63→26.18.** It reproduced **nothing, at a HIGHER load average than mine.** ➡️ **ITS NUMBER OUTRANKS MINE BECAUSE IT RAN THE SUBJECT AND I RAN A PROXY** — my probe inserts an extra `page.evaluate` (installing the sampler) *between* the before-sample and the click, so the span I attributed to the shipped assertion is not the shipped assertion\'s span. ⚠️ **WHAT FALLS: F-1263-1\'s "3/3 breach under load at `--workers=1`" is NOT ESTABLISHED.** ✅ **WHAT SURVIVES, arm-independently: the arithmetic** (7 u/s from `src/town/TownScene.ts:2613` ⇒ a `<1` bound is a ~143 ms latency budget — read from source, not sampled) **and F-1263-2 entirely** (the frame-vs-sim-time unit error was measured **in-page**, where no round-trip reaches; 16 frames → 1.010 stands). 🔎 **AND IT RESTORES THE ORIGINAL DISCRIMINATION TWO FIRES HAD DRIFTED FROM:** F-1211-6 said **workers=4 → 4/4 red, workers=1 at loadavg 20.72 → 12/12 green**; Codex just reproduced that green half at 26.18, and s1262\'s reds were at workers **2 and 6, never 1**. ➡️ **The discriminator is CONCURRENT BROWSER INSTANCES, not machine load — so F-1262-5\'s "the variable is MACHINE LOAD", which I inherited and amplified, is the reading that does not survive.** (`playwright.config.ts` sets no `fullyParallel`, so one spec file parallelises only across PROJECTS — which is exactly why CPU burners at `--workers=1` are a different experiment, not a stronger one.) 🚀 **(E) THE CORRECTIVE WAS AUTHORED AND QUEUED, AND ITS OWN GATE CANCELLED IT — WHICH IS THE SYSTEM WORKING.**',
  ],
  [
    '**The runner picked it up at 17:45 and lane-b is LIVE now** — its scope-1 QUIET arm has already passed **15/15 at loadavg 6.78**.',
    '**Leaf now `stopped`; done-move prefixed `stopped-premise-not-reproduced-s1263-…`.** ⛔ **DO NOT RE-QUEUE IT UNCHANGED** (CLAUDE.md §7.5) — but the changed premise is known and exact, so the next attempt is cheap: **re-author the load arm as CONCURRENT BROWSERS (`--project=desktop-chrome --project=mobile-chrome --repeat-each=3` at default workers), not CPU burners.**',
  ],
  [
    '✅ **F-1262-5 CLOSES: folded in, as you were advised** — the leaf stays retired and the authored master fixes the assertion; **no ruling needed from you.**',
    '✅ **F-1262-5 CLOSES, but NOT the way I first wrote it** — its *premise* ("the variable is machine load") is refuted by F-1263-4; its *conclusion* (leave the leaf retired) is unchanged and needs **no ruling from you**.',
  ],
  [
    '💡 **(J) THE THROUGH-LINE.**',
    '⚖️ **(I2) A SECOND JUDGEMENT WORTH A VETO WINDOW.** I let my own authored master\'s gate overrule my own six-run measurement **inside the same fire**, and wrote the refutation into the ledger against myself rather than defending the arm I had just spent half the fire building. If you would rather a fire defend its measurement and re-run the subject before conceding, say so — but conceding to the subject-level arm looks right and it was cheap: the gate cost 118k tokens and stopped a wrong cure from landing. 💡 **(J) THE THROUGH-LINE.**',
  ],
  [
    '**When a test has resisted four cures, stop proposing a fifth and go find out what its number is denominated in.**',
    '**When a test has resisted four cures, stop proposing a fifth and go find out what its number is denominated in.** ⚡ **AND THE HARDER HALF, LEARNED TWENTY MINUTES LATER: I measured that number with an instrument I built myself, and my instrument was wrong in exactly the way I had just accused the predecessor\'s of being wrong.** The gate I wrote to protect the house from my own confidence is the thing that caught me. **Write the STOP that can cancel your work — and then let it.**',
  ],
];

for (const [from, to] of edits) {
  if (!l.includes(from)) throw new Error('anchor missing: ' + from.slice(0, 60));
  l = l.replace(from, to);
}
lines[0] = l;
writeFileSync(p, lines.join('\n'));
console.log('handoff amended, line-1 length', l.length);
