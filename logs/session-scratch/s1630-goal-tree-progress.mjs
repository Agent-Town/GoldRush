// attended 2026-08-10 ("Ok, can you update the Goal Tree? I think we are making progress."):
// fold today's ratified laws + season-1 gauntlet milestones into tasks/goals.json.
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'tasks/goals.json';
const d = JSON.parse(readFileSync(p, 'utf8'));

function findSubgoal(pred, node) {
  const list = node ? node.subgoals || [] : d.goals;
  for (const g of list) {
    if (pred(g)) return g;
    const hit = findSubgoal(pred, g);
    if (hit) return hit;
  }
  return null;
}
const agentPlay = findSubgoal((g) => (g.title || '').startsWith('AGENT PLAY'));
const storyCanon = d.goals.find((g) => (g.title || '').startsWith('Story & Canon'));
if (!agentPlay || !storyCanon) { console.error('anchor goals not found'); process.exit(1); }

// 1) THE SAME-GAME LAW subgoal under AGENT PLAY — adopt the existing leaves, add the closure ladder.
const takeIds = new Set(['ap16-audit', 'upgrade-clock']);
const taken = [];
(function strip(n) {
  if (n.tasks) {
    for (const t of n.tasks.filter((t) => takeIds.has(t.id))) taken.push(t);
    n.tasks = n.tasks.filter((t) => !takeIds.has(t.id));
  }
  for (const c of n.subgoals || []) strip(c);
})(agentPlay);
agentPlay.subgoals = agentPlay.subgoals || [];
if (!findSubgoal((g) => g.id === 'same-game-law')) {
  agentPlay.subgoals.push({
    id: 'same-game-law',
    title: 'THE SAME-GAME LAW (owner 2026-08-10): agents and humans play the same game — specs/agent-play/ap-16-same-game-law.md; ratified with SEASONS + the 30/20/10 pick clock + verbs the same day',
    tasks: [
      ...taken,
      { id: 'ap16-1-buildable-parity', title: 'AP-16-1: door narrows to the manifest; parity becomes a guard (cuts against the merged audit table)', status: 'planned' },
      { id: 'ap16-2-draft-reaches-door', title: 'AP-16-2: upgrade offers ride the view; PICK_UPGRADE + the 30/20/10 clock, both species; defaultedPicks in outcomes', status: 'planned' },
      { id: 'ap16-3-blast-verb', title: 'AP-16-3: BLAST_AT — the blast charge through the door at human cost/cooldown; then the rest of the audit list', status: 'planned' },
    ],
  });
}

// 2) SEASONS subgoal under Story & Canon.
storyCanon.subgoals = storyCanon.subgoals || [];
if (!findSubgoal((g) => g.id === 'seasons')) {
  storyCanon.subgoals.push({
    id: 'seasons',
    title: 'SEASONS — the county\'s history manifested in the app (owner 2026-08-10, verbatim in specs/seasons/seasons-v1.md); Season 2 "The Same Game" opens on the AP-16 era stamp',
    tasks: [
      { id: 'sea-1-registry', title: 'SEA-1: season registry + derived season label on rows (GET-only, additive)', status: 'planned' },
      { id: 'sea-2-season-page', title: 'SEA-2: the Season Page in the Field Book family (narrative · results · commentary · lessons)', status: 'planned' },
      { id: 'sea-3-season1-content', title: 'SEA-3: Season 1 "The Founding Season" written from the county\'s own ledgers', status: 'planned' },
    ],
  });
}

// 3) Season-1 gauntlet milestones — bench work that shipped today, recorded where it happened.
if (!findSubgoal((g) => g.id === 'gauntlet-season-1')) {
  agentPlay.subgoals.push({
    id: 'gauntlet-season-1',
    title: 'THE GAUNTLET, Season 1 — heats, ablations, instruments (bench/gauntlet + bench/foundry evidence)',
    tasks: [
      { id: 'omp-debut', title: 'omp debut: first-attempt the-claim secure, county rank 3; pi-family ablation complete on one map', status: 'shipped', mergeHash: '95853b2d0f380e90d055c0db1cd410e4d4024070' },
      { id: 'prime-sol-ablation', title: 'prime × Sol: the-claim SECURED run 1 (posted rank 7, replayed 2x deterministic); Baron w23 postmortem seeded F-SAME-1', status: 'shipped', mergeHash: 'fb148073dd26afd56c73998611f052cf7fb42b6b' },
      { id: 'mac-foundry-verdict', title: 'MAC foundry spike: TWO-ARM NEGATIVE, model-proof ("mass was not meaning"); Aider network-reach caught + patched; shelved pending assembly-level semantic QA', status: 'shipped', mergeHash: '149a10cc6882d37faac49d5141c0133f5994e87e' },
      { id: 'codex-bridge-instrument', title: 'codex-bridge v2: subscription OAuth → OpenAI-compatible localhost, tools both ways — seats any OpenAI-key harness on the owner\'s subscription (goldrush-gauntlet@13b73ed)', status: 'shipped' },
      { id: 'eliza-first-play', title: 'Eliza first-play: five-defect chain cured (timeout → misroute → zero-vector → models → tool calls); first orders ever submitted 2026-08-10, track live', status: 'building' },
    ],
  });
}

writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
console.log('goal tree updated: same-game-law + seasons + gauntlet-season-1');
