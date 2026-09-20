import fs from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));

let leaf = null;
const walk = (node) => {
  for (const t of node.tasks ?? []) if (t.id === 'e9-dome-basin-socket') leaf = t;
  for (const s of node.subgoals ?? []) walk(s);
};
for (const top of g.goals) walk(top);
if (!leaf) throw new Error('leaf e9-dome-basin-socket not found');

leaf.status = 'merged';
leaf.mergeHash = '79b6da0f24449396d5bf3657ad1d7fd91b656b21';
leaf.review = 'reviews/e9-dome-basin-socket.md';
leaf.drainedBy = 's1503 fire';
leaf.drainNotes = [
  'MERGED 79b6da0f2 (--no-ff, fully disjoint path sets, no graft). Gates on the merged tree: tsc clean; build green; er01-e9-census 8 passed (4 per project x 2), exactly the count the master DERIVED; test:node-guards 345 tests / 342 pass / 0 fail / 3 skipped, gr-sim Baron pin unmoved.',
  'HEADLINE PROVABLY UNMOVED: docs/bench/e9-readiness-census.md:9 still reads AGENT-READY: 0 of 4, and the four HeadlessContractSim throws-assertions are green and unedited. Determinism: both drives sha256:d2cb3ebb...949cf byte-identical. Refusals: bossStepsRefused 210, arsenalStepsRefused 210 over 210 ticks.',
  'ADJACENT LIST RE-DERIVED FROM THE TREE, not copied from the master (which named 1 e9 spec where the tree holds 5): 32 passed / 6 failed. e9-arsenal x2 fingerprint-matched KNOWN-RED (75% blast radius). e9-roster x4 were CLEAN-IN-INVENTORY so the ledger could not exonerate them - proved pre-existing by CONTROL RUN in a detached worktree at pre-merge 8ef4294c8, which fails identically. Filed as F-1503-3 (non-blocking, fire-authorable): the red inventory under-reports e9-roster, converting unknown into a false clean.',
  'Instrument note: the runner reported 343/345 on the lane shell (Node 23.11 timeout precedence); the fire shell on Node v26.4.0 is 0 fail. Two shells, two answers, neither about this slice.',
  'No gazette item (no player-visible change) and deploy correctly skipped (E9CanalSocket.ts is imported by no game code).',
].join(' ');

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('leaf closed:', leaf.id, leaf.status, leaf.mergeHash);
