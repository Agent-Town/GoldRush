// s1606 — F-1605-1 RED 1 cure: walk the five shipped leaves that name the now-`stopped`
// `calibrate-suite-workers-v2` leaf, and record the reason each does NOT supersede it.
// Line-level insertion, not a JSON round-trip: re-stringifying tasks/goals.json would reformat
// every one of its ~6000 lines and bury the five-line change.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/goals.json';
const lines = readFileSync(P, 'utf8').split('\n');

const i = lines.findIndex((l) => l.includes('"id": "calibrate-suite-workers-v2"'));
if (i < 0) throw new Error('leaf calibrate-suite-workers-v2 not found');
let s = -1;
for (let k = i; k < i + 12; k++) if (lines[k].includes('"status": "stopped"')) { s = k; break; }
if (s < 0) throw new Error('status line not found inside the leaf');

const acks = {
  'factory-build-mode-prompt-realign':
    "NO -- e42ed4ed is a tests-only realign of 22 building-context-prompt rows onto the owner's 2026-07-12 build-mode-only contract. It names this leaf exactly once, in note_s1173, filing F-1173-4: 'the default worker count manufactures reds in this spec set, direct evidence for the parked calibrate-suite-workers-v2 blocker'. That CONTRIBUTES A DATUM to this leaf's subject and performs none of its scope -- no calibration sequence, no worker pin, no playwright.config.ts edit. Evidence for a parked question is not an answer to it. Walked s1606.",
  'factory-m3-05b-run-ledger':
    "NO -- f68a6215 ships the Run Ledger page on the Claim Office surface. It names this leaf exactly once, in note_s1180, where F-1180-2 records a load-sensitive run-suspend flake as 'direct extra evidence for the owner-gated calibrate-suite-workers-v2 load blocker'. Same shape as factory-build-mode-prompt-realign: a drain donating one observation to the load question while touching no calibration scope. Walked s1606.",
  'f1510-3-revision-metadata-esm':
    "NO -- 942afed2 lands revision metadata in playwright.config.ts. It names this leaf as a CITATION COORDINATE, not as scope: its title records that a top-of-file placement pushed 'workers:' from :50 to :69 and produced 'FAIL -- 3 pointer problem(s)' across scripts/fire.md, .claude/skills/drain/SKILL.md and tasks/goals.json[calibrate-suite-workers-v2], so the bottom-of-file arrangement was chosen precisely to HOLD the :50 pointer this leaf's own blockedReason cites. Preserving a leaf's citation is the opposite of superseding it. Walked s1606.",
  'f1534-2-desk-guard-slug-shape':
    "NO -- 1b2828e3 teaches desk-declaration-guard the slug key shape. It names this leaf only as one of three SPURIOUS ARM A hits in its own slug-widening probe ('aliases of items already keyed by their own F-ID'), i.e. as an example of what the guard must NOT count. A leaf cited as noise inside someone else's measurement carries none of its scope. Walked s1606.",
  'lane-d-f1152-1-confirmbuild-cause':
    "NO -- 1f563455 is a diagnosis-only confirmBuild() instrumentation slice. Its authorNotes name this leaf to assert the OPPOSITE of a supersession: 'lane-calibrate-suite-workers-v2 stays OWNER-BLOCKED and must not be drained or re-queued' -- a firewall written at authoring time because both masters pointed at the lane-d slot. An explicit non-supersession, re-confirmed s1606; the only thing that has changed since is the status word (blocked -> stopped, 9264046eb), not the scope. Walked s1606.",
};

const note =
  'F-1605-1 RED 1 CLOSED s1606 BY WALKING ALL FIVE PAIRS, NOT BY RETIRING THE LEAF. The guard fired the '
  + 'moment the attended desk sweep (9264046eb) flipped this leaf blocked -> stopped: five already-merged '
  + 'leaves name it in their prose, so it correctly asked whether any of them had superseded it. All five '
  + 'naming sites were READ, not inferred: two donate one observation each to the load question (F-1173-4, '
  + 'F-1180-2), one preserves the playwright.config.ts:50 pointer this leaf itself cites, one uses the id as '
  + 'a NEGATIVE example in a slug-noise measurement, and one declares the non-supersession outright. None '
  + 'performs an inch of the calibration scope. RETIREMENT AS `superseded` WAS CONSIDERED AND DELIBERATELY '
  + 'NOT TAKEN: `superseded` requires a `supersededBy`, and no leaf superseded this one -- the OWNER PARKED '
  + 'it (see closureReason, attended 2026-08-09, "reversible by one word"), so `stopped` + closureReason is '
  + 'the accurate pair of words, and `superseded` would have to invent a successor that does not exist. '
  + 'F-1605-1 warned that retiring a stopped leaf still holding live scope is the dangerous direction, and '
  + 'the residual lane/attended arm named at the end of blockedReason ("only the LANE/attended arm is '
  + 'uncalibrated ... any answer must be written as isFireShell ? 1 : N, never a flat pin") is exactly such '
  + 'scope. NOTE FOR THE NEXT READER: this is the same class as F-1300-4 one actor over -- a legitimate '
  + 'ledger edit by an attended session ARMED a guard against five slices it never touched, because a status '
  + 'flip is a code change to every guard keyed on that status.';

const ind = ' '.repeat(10);
const entries = Object.entries(acks);
const block = [
  `${ind}"supersessionChecked": {`,
  ...entries.map(([k, v], n) => `${ind}  ${JSON.stringify(k)}: ${JSON.stringify(v)}${n === entries.length - 1 ? '' : ','}`),
  `${ind}},`,
  `${ind}"note_s1606": ${JSON.stringify(note)},`,
];

lines.splice(s + 1, 0, ...block);
writeFileSync(P, lines.join('\n'));
JSON.parse(readFileSync(P, 'utf8')); // re-parse or throw
console.log(`inserted ${block.length} lines after line ${s + 1} — JSON re-parses clean`);
