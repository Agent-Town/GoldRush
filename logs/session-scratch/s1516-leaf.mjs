// s1516: GOAL REGISTRATION LAW — the authored master's leaf, added in the SAME COMMIT.
import fs from 'node:fs';

const P = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(P, 'utf8'));

function find(n, id) {
  if (Array.isArray(n)) { for (const x of n) { const r = find(x, id); if (r) return r; } return null; }
  if (n && typeof n === 'object') {
    if (n.id === id) return n;
    for (const k of ['subgoals', 'tasks', 'goals']) if (n[k]) { const r = find(n[k], id); if (r) return r; }
  }
  return null;
}

const parent = find(g.goals, 'factory-truth');
if (!parent || !Array.isArray(parent.tasks)) { console.error('factory-truth parent not found'); process.exit(2); }
if (find(g.goals, 'f1510-3-inventory-revision-metadata')) { console.error('leaf already exists'); process.exit(2); }

parent.tasks.push({
  id: 'f1510-3-inventory-revision-metadata',
  title:
    "F-1510-3 successor (the revised s1514 gate): capture the TESTED tree's revision in playwright.config.ts metadata and have the reducer COPY it verbatim into logs/suite-red-inventory.md, so the inventory names the commit the suite ran at. PRICED s1516 before authoring (docs/bench/s1516-f1510-3-successor-pricing.md): the scope note's fear that this 'reaches the run harness' is true but cheap — report.config.metadata already exists carrying Playwright-injected actualWorkers, and the reducer already consumes it at suite-red-inventory.mjs:262 with the exact ?? 'unrecorded' degradation needed. Proven by probe outside the repo that a user-declared metadata block survives into the JSON report verbatim alongside actualWorkers. Measured price ~12 lines / 3 files. Three constraints the row did not anticipate, each of which would have cost a lane run: (a) the dirty marker must be TRACKED-ONLY (main = 128 porcelain entries but only 8 tracked, so a naive marker calls every run dirty); (b) workers: isFireShell sits at playwright.config.ts:50 and THREE baselined law pointers cite that coordinate, so any line inserted above :50 reds law-pointer-guard — hence the mandated hoisted function declaration at EOF and a hard grep -n bar; (c) logs/suite-red-inventory-raw.json is ABSENT from disk, so the cure cannot be proved end-to-end and the fixture harness is the proof path. Ships the MECHANISM only: the gate closes on the NEXT REAL REGENERATION, so the drain must mark this cured-pending-regeneration, NOT closed.",
  status: 'queued',
  taskFile: 'lane-f1510-3-inventory-revision-metadata.md',
  lane: 'lane-b',
  attempts: 0,
  authoredBy: 's1516 (fire)',
  authorNotes:
    "Authored s1516 with no drain available (lane-a was BUSY on f1515-1 attempt 2, no done-move, no failed run), discharging s1515's NEXT (C): 'F-1510-3's successor still needs PRICING before authoring — it reaches the Playwright run harness, not just the reducer; queueing it half-priced repeats what F-1514-1 names.' Method, per F-1514-1: asked the gate's OWN PREDICATE conjunct by conjunct — would performing this scope make the sentence TRUE? — and answered YES on all five in a table, rather than only asking whether the gate is met and whether the cure is cheap. The decisive evidence is a PROBE, not source reading: a minimal Playwright project in /tmp (outside the repo, so no guard or suite could see it) declaring metadata: { revision: <git rev-parse HEAD> } produced {\"revision\":\"e67840916ccc...\",\"s1516Probe\":\"threaded-from-config\",\"actualWorkers\":1}, where the sha is exactly this fire's lock commit — proving user keys survive alongside Playwright's injected ones (runner/index.js:6092 MUTATES the metadata object rather than replacing it). Deployment condition verified separately: git rev-parse and the dirty probe both work with cwd inside a LINKED WORKTREE (lane-a, lane-d measured), which is where the suite actually runs per report.config.configFile = worktrees/lane-d/playwright.config.ts. Dispatch order per F-1424-3: pricing evidence committed FIRST (17556e86f), master+leaf SECOND, lane refreshed THIRD, keys re-grepped in the lane, cp LAST. All three citation keys are file-scoped and were measured 1 on main BEFORE being written down (F-1425-2), so neither this note nor the master can self-rot them. A negative result is explicitly licensed and a specific failure mode is named: if __dirname under the TS config loader does not point at the tested tree, the revision must ride in from a reporter instead — precedent e47354c6, where refusing to manufacture arms for output proved false was the correct call.",
});

fs.writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('leaf added under factory-truth; tasks now', parent.tasks.length);
