import fs from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));

let leaf = null;
const walk = (n) => {
  if (!n || typeof n !== 'object') return;
  if (n.id === 'f1328-1-drill-yard-census-debt') leaf = n;
  for (const k of Object.keys(n)) {
    const v = n[k];
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') walk(v);
  }
};
walk(g);
if (!leaf) { console.error('leaf not found'); process.exit(2); }
if (leaf.note_s1500) { console.log('ALREADY NOTED'); process.exit(0); }

// Retention Law: the prior reason is retained verbatim; the measurement is PREPENDED as a pointer.
leaf.blockedReason =
  'READ note_s1500 FIRST — THIS LEAF STAYS BLOCKED (blockClass "disputed": only an attended session or the owner rules) BUT ITS RESERVED QUESTION IS NOW MEASURED VACUOUS AS STATED, AND ITS SCOPE ITEM 1 HAS BEEN DISPATCHED ELSEWHERE (leaf f1496-1-drill-yard-fixture-six, lane-a, s1500). --- ' +
  leaf.blockedReason;

leaf.note_s1500 =
  'MEASURED s1500 THROUGH THE CENSUS HARNESS (vite.ssrLoadModule), PROBE RETAINED AT logs/session-scratch/s1500-drill-yard-derive.mjs. The reserved judgement here is "does a byte-stable fixture of F-1328-4 wrong derivation bless it or catch it?" — and F-1328-4 PREMISE IS NOW FALSE ON MAIN. It claimed deriveMechanicsManifest("e1-drill-yard") returns interactables:[] because "the derivation ignores practice". It returns FOUR interactables: assay_tent_faucet/top_up, drill_bell/ring, rolling_log x2/strike, straw_man x3/strike — every one sourced from practice.stations or practice.targets — plus five practice rules (drill_wave, ledger_free_practice, practice_buildables, practice_gold_grant, practice_target_respawn), alongside river/water_crossings. The bell, the dummies, the practice gold and the buildables that F-1328-4 named as MISSING are ALL PRESENT. CURED BY A DEDICATED SLICE: 23868f4d6 "runner(lane-a): lane-a-drill-yard-practice-derivation.md", 2026-08-02, verified an ancestor of main — i.e. FOUR DAYS AFTER this block was written, and nobody re-read the block afterwards. THERE IS NO WRONG DERIVATION LEFT TO BLESS. WHY THIS LEAF IS NOT CLOSED ANYWAY, DELIBERATELY: blockClass is "disputed", which fire.md 3.0 says to treat as owner-fork until an attended session rules; a fire may close a block that has become vacuous but this one also carries note_s1330 disputing its own reason, so the honest act is to record the measurement and leave the word to a human. RECOMMENDATION: close it — either by one attended word, or automatically when f1496-1-drill-yard-fixture-six merges, since that slice performs this leaf scope item 1 (regenerate the byte-stable fixture) under a firewall that forbids touching the derivation. RESIDUAL, STATED SO THIS IS NOT OVERSOLD: s1500 verified the four defects F-1328-4 NAMED are cured; it did not audit the derivation for other correctness faults. If the f1496-1 runner reports that some field of the derived drill-yard manifest looks wrong, THAT PARTIALLY REVIVES THIS QUESTION and belongs on the desk rather than in a cure. The separate census-count debt (board-card-images.spec.ts:37 and map-census.spec.ts:63, both toHaveLength(41)) remains carved out to f1330-1-count-shaped-censuses and is untouched by any of this.';

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('note_s1500 written to f1328-1-drill-yard-census-debt');
