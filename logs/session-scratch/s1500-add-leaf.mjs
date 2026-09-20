import fs from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));

let parent = null;
const walk = (n) => {
  if (!n || typeof n !== 'object') return;
  if (n.id === 'factory-truth') parent = n;
  for (const k of Object.keys(n)) {
    const v = n[k];
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') walk(v);
  }
};
walk(g);
if (!parent) { console.error('no factory-truth node'); process.exit(2); }
if (parent.tasks.some((t) => t.id === 'f1496-1-drill-yard-fixture-six')) {
  console.log('ALREADY PRESENT'); process.exit(0);
}

parent.tasks.push({
  id: 'f1496-1-drill-yard-fixture-six',
  title: 'F-1496-1: e2e/agent-view.spec.ts :264/:297 are red on BOTH projects because e1-drill-yard became the sixth E1 contract while :269 expects five and e2e/fixtures/e1-mechanics-manifests.json holds five entries. Regenerate the fixture to six DERIVED entries and correct the id list and the test title.',
  taskFile: 'lane-f1496-1-drill-yard-fixture-six.md',
  lane: 'lane-a',
  status: 'queued',
  attempts: 0,
  authoredBy: 's1500 fire (FIRE-AUTHORED)',
  authorNotes:
    'AUTHORED AFTER REMOVING THE BLOCK THAT WAS ACTUALLY IN THE WAY, WHICH THREE FIRES HAD NOT NOTICED. F-1496-1 has been carried since s1496 as cheap / fire-authorable / unowned, but its prescribed cure (regenerate the byte-stable fixture) is scope item 1 of the OWNER-BLOCKED leaf f1328-1-drill-yard-census-debt, whose reserved judgement is "does a byte-stable fixture of F-1328-4 wrong derivation bless it or catch it?". Authoring it blind would have been the rf-34 shape (fire.md 3.0): building a case toward the thing the owner reserved. MEASURED INSTEAD, through the same vite.ssrLoadModule harness the census specs use (probe retained at logs/session-scratch/s1500-drill-yard-derive.mjs): the F-1328-4 premise is FALSE on current main. It claimed deriveMechanicsManifest("e1-drill-yard") returns interactables:[] because "the derivation ignores practice". It returns FOUR interactables - assay_tent_faucet/top_up, drill_bell/ring, rolling_log x2/strike, straw_man x3/strike - every one sourced from practice.stations or practice.targets, plus five practice rules (drill_wave, ledger_free_practice, practice_buildables, practice_gold_grant, practice_target_respawn). The bell, the dummies, the practice gold and the buildables that the block named as missing are ALL present. Cured by a dedicated slice, 6e4e728ec "runner(lane-a): lane-a-drill-yard-practice-derivation.md" (2026-08-02, on main), four days AFTER the block was written. There is no wrong derivation left to bless, so the owner question is VACUOUS and the fixture regeneration is ordinary hygiene. A fire may close a block that has become vacuous; it may not lift one that has not (s1499 precedent, F-1462-1). THE MASTER FIREWALLS THE TWO ADJACENT TEMPTATIONS BY NAME: src/agent/MechanicsManifest.ts (editing the derivation to flatter the fixture would re-open the vacated question) and the toHaveLength(41) census-count debt in board-card-images.spec.ts / map-census.spec.ts, which is carved out to f1330-1-count-shaped-censuses and will be sitting right next to the runner.',
  authorNotesSuccessor:
    'GATE BOTH PROJECTS - that is the entire content of F-1496-1, which was filed because its parent review gated one project, reported "2 desktop reds", and the truth was 4 across both. Expect 8/8 desktop-chrome AND 8/8 mobile-chrome. The master also demands proof that the five PRE-EXISTING fixture entries are semantically unchanged by the regeneration: a byte compare alone cannot say which entry moved. If the runner reports that the derived drill-yard manifest looks wrong in some field, that is a FINDING for a separate slice, not a licence to edit the derivation - and it would partially revive f1328-1, so route it to the desk rather than curing it.',
});

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('leaf added; factory-truth tasks now', parent.tasks.length);
