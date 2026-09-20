// s1606 — Goal Registration Law bookkeeping for the rf-34 re-dispatch: flip the leaf to `queued`
// and record the stale-check that licensed it. Line-level insert, not a JSON round-trip.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/goals.json';
const lines = readFileSync(P, 'utf8').split('\n');

const i = lines.findIndex((l) => l.includes('"id": "rf-34-hero-y-restore-roundtrip"'));
if (i < 0) throw new Error('rf-34 leaf not found');
let s = -1;
for (let k = i; k < i + 12; k++) if (lines[k].includes('"status": "planned"')) { s = k; break; }
if (s < 0) throw new Error('planned status line not found in the rf-34 leaf');

lines[s] = lines[s].replace('"status": "planned"', '"status": "queued"');

const note =
  'RE-AUTHORED AND RE-DISPATCHED s1606 (2026-08-09) TO lane-a, THIRTEEN DAYS AFTER BANKING, AFTER A '
  + 'STALE-CHECK RATHER THAN A BLIND RE-QUEUE (s1605 NEXT (B); Mistake #8). THE DEFECT IS ALIVE AND WAS '
  + 'RE-MEASURED, NOT ASSUMED: the named test still fails on desktop-chrome at --workers=1 with '
  + 'root.hero.position.y: 0.14559222393281415 != 0.2763519114255905 -- floats BYTE-IDENTICAL to the '
  + 'July measurement, restored:false, `exact` the only flipped key, `differences` still a single entry. '
  + 'Run against a 5199 scratch dev server (GR_CAPTURE_EXTERNAL_SERVER=1) so live lane-b kept 5188 '
  + '(Mistake #12). ALL SIX CITED COORDINATES HAD ROTTED and are re-based in the master: restoreHero '
  + '917->922, runSuspendFutureState 399->402, the spec 656->658, decodeVector3 1414->1440, heroPosition '
  + '532->536, vector3Snapshot 575->580 -- the file grew above them; nothing about the defect changed, and '
  + 's1095\'s narrowing (restoreHero already copies Y exactly) was re-read against today\'s body and still '
  + 'holds. F-1605-1 REDS 2+3 CLOSED HERE, WHICH IS WHERE THAT FINDING SAID THEY BELONGED: the pre-flight '
  + 'reset lane/m3 while worktrees/lane-a is on lane/a (F-1464-3, resolved from `git worktree list`, never '
  + 'from prose) and lacked the F-1407-1 FACTORY-CHURN clause. Both are fixed INSIDE this re-authoring and '
  + 'after the stale-check, never as a standalone pre-flight edit -- F-1605-1 called that the laundering '
  + 'shape, because it would turn a guard saying "do not queue this" green while the staleness it actually '
  + 'protects against went untouched. banked-master-preflight-guard is now 2/2. Lane measured USABLE '
  + 'immediately before dispatch (ahead=0 behind=62, no dirt); no janitor refresh requested because the '
  + 'master\'s STEP 2 resets to main BEFORE every premise check, so the 62-behind tree is cured by the '
  + 'master itself rather than by a .req the runner would consume only after dispatch (F-1424-3).';

const ind = ' '.repeat(14);
lines.splice(s + 1, 0, `${ind}"note_s1606": ${JSON.stringify(note)},`);

writeFileSync(P, lines.join('\n'));
JSON.parse(readFileSync(P, 'utf8'));
console.log('rf-34 leaf: status planned -> queued, note_s1606 added — JSON re-parses clean');
