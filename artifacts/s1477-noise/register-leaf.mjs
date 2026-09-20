import fs from 'node:fs';
const p = '/Users/robin/Claude/Projects/Gold Rush/tasks/goals.json';
const raw = fs.readFileSync(p, 'utf8');
const g = JSON.parse(raw);

function find(node, id) {
  if (node.id === id) return node;
  for (const k of [...(node.goals || []), ...(node.subgoals || []), ...(node.tasks || [])]) {
    const hit = find(k, id);
    if (hit) return hit;
  }
  return null;
}
let parent = null;
for (const root of g.goals) { parent = parent || find(root, 'factory-truth'); }
if (!parent) { console.error('factory-truth not found'); process.exit(2); }

const id = 'f1476-1-renderer-count-tolerance';
const bucket = parent.tasks ? 'tasks' : (parent.subgoals ? 'subgoals' : 'tasks');
parent[bucket] = parent[bucket] || [];
if (parent[bucket].some((n) => n.id === id)) { console.log('already registered'); process.exit(0); }

parent[bucket].push({
  id,
  title: 'F-1476-1 — the tracked renderer-count artifacts are rewritten every run because they record one sample of a partly-jittery quantity. Record what is reproducible (exact deltas + measured tolerance bands) instead, so a re-run of an unchanged tree is byte-identical and an out-of-band value becomes a real signal.',
  taskFile: 'lane-f1476-1-renderer-count-tolerance.md',
  status: 'queued',
  lane: 'lane-a',
  authoredBy: 's1477',
  registeredBy: 's1477',
  authorNotes: 'FIRE-AUTHORED from an OPEN finding with an explicit fire-authorable gate (F-1476-1, tasks/BACKLOG.md, cited by content per F-1310-1) PLUS a measurement this fire performed and committed BEFORE dispatch (artifacts/s1477-noise/REPORT.md at 1b64d48b1 — dispatch order per F-1424-3: evidence committed, lane refreshed, citation grep proved 1 on main, then cp). s1476 filed F-1476-1 and deliberately did NOT author a master for it, because its own mid-investigation measurement refuted the premise of the obvious cure (bisect-and-name-the-commit) — the predicate was non-monotonic and the same commit returned two answers back to back at n=2. s1477 supplied the denoised statistic the gate actually asked for: crawler n=12 and railcar n=10 at one commit (2822069b5), instrument pinned, --workers=1. Results: 18/20 and 10/18 metrics are byte-stable; geometries/textures jitter is COMMON-MODE so every phase-to-phase delta is exact across all runs and all six phase pairs; calls/triangles jitter independently with a +1-call/+2-triangle single-quad signature. This corrects s1476 on one point of record: coldBaseline.geometries is hard-stable at 81 (12/12), so it was never the noisy component and IS attributable. The task takes gate disjunct (a) — record a tolerance instead of a byte — over (b) — stop writing to the tracked tree — because the deltas are exact and carry the regression signal, so (b) would discard real evidence to fix churn. VERIFIED s1477 and load-bearing for that choice: nothing reads these files (git grep renderer-count over all tracked files returns the two writing specs and otherwise only prose), so the artifact detects nothing today and its whole present effect is F-1407-1 churn. UNMEASURED and explicitly delegated to the runner: mobile-chrome, which s1477 did not sample.',
});

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('registered ' + id + ' under factory-truth.' + bucket);
