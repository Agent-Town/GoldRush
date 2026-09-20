import fs from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));

function findNode(node, id) {
  if (Array.isArray(node)) {
    for (const x of node) { const r = findNode(x, id); if (r) return r; }
    return null;
  }
  if (node && typeof node === 'object') {
    if (node.id === id) return node;
    for (const k of ['goals', 'subgoals', 'tasks']) {
      if (node[k]) { const r = findNode(node[k], id); if (r) return r; }
    }
  }
  return null;
}

const parent = findNode(g.goals, 'factory-truth');
if (!parent) throw new Error('parent factory-truth not found — refusing to guess placement');
if (!Array.isArray(parent.tasks)) throw new Error('factory-truth has no tasks array');

if (parent.tasks.some((t) => t.id === 'f1467-1-alpha-recipe-ab')) {
  console.log('leaf already present, no-op');
  process.exit(0);
}

const anchorIdx = parent.tasks.findIndex((t) => t.id === 'f1450-4-attribute-the-edge-softness-delta');

const leaf = {
  id: 'f1467-1-alpha-recipe-ab',
  title:
    'F-1464-2 SETTLED BY MEASUREMENT, not by an owner: in-game A/B of the two extraction recipes at play scale, per alphaTest tier — unblocks F-1464-1 (1075/1314 haloed sprites)',
  status: 'queued',
  taskFile: 'lane-f1467-1-alpha-recipe-ab.md',
  note:
    "s1467 fire (FIRE-AUTHORED). F-1464-2's gate is a DISJUNCTION — \"closes when an attended eye rules the recipe at play scale, OR an in-game A/B measures it\" — and s1465/s1466 both carried it forward as \"ATTENDED EYE\", collapsing it to the owner branch. It is not on the OWNER'S DESK (verified by walking the desk headers) and no owner was ever asked, so a 🔺 blocker sat parked behind a person who was never required. Mirror of the count-the-CONJUNCTS class: a BLOCKING gate needs its conjuncts counted, a CLOSING gate needs its DISJUNCTS counted. Authoring also found the discriminator the finding lacked: there is no single alphaTest. Two tiers, measured by reading every site — 0.35 (~alpha 89/255) at generated.ts:263 single sprites, SpriteAnimator.ts:279, TownScene.ts:2966, where two-step's 1845 bilinear-manufactured partials are at real erosion risk since everything under ~89 is discarded; and 0.04 (~alpha 10/255) at generated.ts:377 batched, Game.ts:455, pools.ts:1202, Embodiment.ts:49, TownScene.ts:4396, BuildingSign.ts:52, DrillYard.ts:372, where nearly every partial survives and the same recipe reads as softening. So the answer may be per-tier; the master measures both tiers and is explicitly permitted to return a split verdict or 'indistinguishable' rather than manufacture a preference. Scoped OFF assets/ and src/ entirely — it measures the game as it is; re-extraction is F-1464-1 and is gated on this answer. Retention: F-1464-2's primary evidence (artifacts/f1450-4 arms/blobs/variants, 4.4 MB / 12 files) was untracked and was committed e86f6481 before authoring.",
};

parent.tasks.splice(anchorIdx >= 0 ? anchorIdx + 1 : parent.tasks.length, 0, leaf);
fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('leaf inserted after index', anchorIdx, '- total tasks now', parent.tasks.length);
