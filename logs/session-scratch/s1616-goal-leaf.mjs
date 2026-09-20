import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const p = 'tasks/goals.json';
execFileSync('git', ['checkout', '--', p]);
const g = JSON.parse(readFileSync(p, 'utf8'));

let hit = null, owner = null;
const walk = (n) => {
  if (!n || typeof n !== 'object') return;
  for (const arr of ['subgoals', 'tasks']) {
    if (!Array.isArray(n[arr])) continue;
    for (const c of n[arr]) {
      if (c.id === 'f1614-1-advance-stream-walkthrough-table') { hit = c; owner = n; }
      walk(c);
    }
  }
};
g.goals.forEach(walk);
if (!hit) throw new Error('leaf not found');

hit.status = 'merged';
hit.mergeHash = '1e2172f450004e4170403c95a0257b537c751869';
hit.note = (hit.note || '') + ' DRAINED s1616 at 1e2172f45: gated on the merged tree in a detached worktree (scratch port 5199, since 5188 was held by lane-a) — tsc clean; build 1.55s; advance-stream-walkthrough 2/2 both projects --workers=1 (35.7s); adjacent advance-stream 10/10 both projects (28.1s); zero console/page errors asserted in-spec; table reproduced drain-side independently of the runner (town 2 WARM/8 COLD, contract1 7/8; only town-return moved, 2|8 vs 4|6). test:node-guards correctly OUT of battery per F-1460-1 — the diff is e2e/ plus two .md, zero src/. THE GATE CLAUSE IS MET ONLY LITERALLY: the prescribed tier=lite control returns ALL ZEROS in BOTH columns, which cannot distinguish "prefetch stopped warming" from "nothing was requested at all" — F-1616-1. It was unsatisfiable BY CONSTRUCTION (src/assets/AdvanceStream.ts:250-252 threeDimensionalAssetsEnabled gates the whole 3D path, demand-loads included; no prefetch-only flag exists), so it is NOT the runner’s fault. The discriminator is proved instead by WITHIN-ARM variance: town 2 WARM vs contract1 7 WARM in the same run, reproduced across two runs and two projects. Also F-1616-2 (the spec rewrites a TRACKED reviews/*.md on every run — a hard STOP in both pre-flight templates, confirmed by manufacture) and F-1616-3 (WARM counts prefetched-AND-re-requested, so a genuinely cache-warm asset is invisible to both columns). All three carried by f1616-1. Review: reviews/advance-stream-walkthrough-drain.md.';

const idx = owner.tasks.indexOf(hit);
owner.tasks.splice(idx + 1, 0, {
  id: 'f1616-1-walkthrough-artifact-and-real-control',
  title: 'F-1616-1 + F-1616-2: the walkthrough spec stops rewriting a tracked review file, and gets a prefetch-only control that is not vacuous',
  status: 'queued',
  taskFile: 'lane-f1616-1-walkthrough-artifact-and-real-control.md',
  lane: 'lane-c',
  note: 's1616 fire (FIRE-AUTHORED), carrying the two curable findings of the f1614-1 drain (1e2172f45). F-1616-2: e2e/advance-stream-walkthrough.spec.ts writes the TRACKED reviews/advance-stream-walkthrough.md on every run, and BOTH pre-flight templates in .claude/skills/author-task/SKILL.md end with the sentence naming modified tracked reviews/*.md as a hard STOP — the factory-churn and evidence-artifact exceptions cover artifacts/**, reviews/shots-* and .png, and deliberately not this. CONFIRMED BY MANUFACTURE at the drain rather than argued: a desktop-only run, then git status --short printed " M reviews/advance-stream-walkthrough.md". That is the exact predicate f1406-1 died on for 54,875 tokens (F-1407-1). It hid during two-project runs only because mobile runs last and its numbers happened to match the committed bytes. F-1616-1: the prescribed tier=lite control returns all zeros in BOTH columns, so the gate line "the WARM column collapses" is met while carrying no information; unsatisfiable by construction since threeDimensionalAssetsEnabled gates the whole 3D path. The cure is spec-side and needs NO src/ change: the spec already installs page.route on **/*.glb, so failing only the requests carrying x-gold-rush-prefetch:1 isolates prefetch while leaving demand-loads alive, and the control then asserts COLD>0 — the missing assertion that let an all-zero table read as a pass. Citation keys proved =1 on main before dispatch (F-1425-2).',
  gate: 'closes when the spec writes only artifacts/ under a per-project filename, a single-project run leaves NO modified tracked reviews/*.md (git status --short pasted as proof), and the control arm reports BOTH columns with COLD>0 while WARM collapses to 0, spec green in both projects at --workers=1.',
});

// Canonical form on disk: 2-space indent with every non-ASCII char escaped as \uXXXX.
// JSON.stringify emits them raw, which reformats ~900 lines and buries the real edit.
const escapeNonAscii = (s) => s.replace(/[-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
writeFileSync(p, escapeNonAscii(JSON.stringify(g, null, 2)) + '\n');
console.log('goal leaf updated + f1616-1 registered; owner=' + owner.id + ' tasks=' + owner.tasks.length);
