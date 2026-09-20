import fs from 'node:fs';

const P = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(P, 'utf8'));
const tasks = g.goals[0].subgoals[0].tasks;

if (tasks.some((t) => t && t.id === 'f1314-3-stockpile-tier-voice')) {
  console.log('leaf already present — no write');
  process.exit(0);
}

tasks.push({
  id: 'f1314-3-stockpile-tier-voice',
  title:
    'F-1314-3 + F-1314-4 — the stockpile became the 4th upgradeable buildable in bt-02b (07f0bcad) but three per-buildable branch lists never gained a 4th branch, so buying a Stockpile tier floats "Turret II - brass cadence quickens" (upgradeFloatText turret fallback, now reachable) and both menu surfaces (build card + encyclopedia) show no tier effect line. Fix the class: give the stockpile its branch, then make the turret fallback explicit so the NEXT archetype fails loudly instead of inheriting the turret voice.',
  taskFile: 'lane-a-f1314-3-stockpile-tier-voice.md',
  status: 'queued',
  lane: 'lane-a',
  spec: 'specs/building-tiers/README.md',
  authoredBy: 's1314 (fire-authored)',
  authorNotes:
    'Spawned by the bt-02b drain (reviews/bt-02b-stockpile-tiers.md) as its corrective, per the review bar that findings either go to the owner or spawn a corrective in the same commit. Both symbols VERIFIED AT SOURCE s1314: upgradeFloatText src/systems/BuildSystem.ts:1996-2001 falls through to a turret default at :2000 and is called at :1254 inside upgradeBuilding; buildableTierEffectLine src/game/buildables.ts:181-196 has palisade/sluice/turret branches and no stockpile. The runner named one consumer of that line; there are TWO - BuildSystem.ts:528 (build menu) and src/encyclopedia/registry.ts:353 (encyclopedia). DELIBERATELY UNVERIFIED and handed to the runner as scope 1: whether tierGain (:1990-1994) has its returned gain string rendered anywhere - the bt-02b runner said it is not and s1314 did not confirm it, so the master asks the runner to READ AND REPORT before editing rather than inherit the claim. Known reds the master must expect and NOT repair: the two bt-01-tiers assertions fingerprinted pre-existing at merge-base by the s1314 drain, and m2-04-gold-stealing:226 (F-1156-2, owner-gated cure).',
});

fs.writeFileSync(P, `${JSON.stringify(g, null, 2)}\n`);
console.log('leaf added; tasks now:', tasks.length);
