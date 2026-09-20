// s1206 — flip the trail-guide plain-boot proof leaf to `stopped` with its escalation note.
// Goal Registration Law: the drain updates the leaf in the drain commit. This is a lawful
// STOP, so it carries review + runReport + archiveRef + stopNote and deliberately NO
// mergeHash (F-1179-5: mergeHash is a GUARD INPUT; writing one would make
// drain-block-check --queue answer "ALREADY SHIPPED — DO NOT QUEUE", which is false).
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = 'tasks/goals.json';
const goals = JSON.parse(readFileSync(PATH, 'utf8'));

let leaf = null;
(function walk(node) {
  if (Array.isArray(node)) { node.forEach(walk); return; }
  if (!node || typeof node !== 'object') return;
  if (node.id === 'e1-trail-guide-plain-boot-proof') leaf = node;
  for (const key of ['goals', 'subgoals', 'tasks', 'children']) if (node[key]) walk(node[key]);
})(goals.goals);

if (!leaf) throw new Error('leaf e1-trail-guide-plain-boot-proof not found');
console.log('BEFORE:', JSON.stringify({ status: leaf.status, taskFile: leaf.taskFile }));

leaf.status = 'stopped';
leaf.review = 'reviews/trail-guide-plain-boot-observed-beats.md';
leaf.runReport = 'tasks/runs/20260729-094453-lane-b-lane-trail-guide-plain-boot-observed-beats.md.log';
leaf.archiveRef = 'archive/lane-m4-trail-guide-observed-beats (tip 45f78f6e); predecessors archive/lane-m4-trail-guide-d7d8ba03 and archive/lane-m4-trail-guide-timeouts-7b2d63f5';
leaf.stopNote = [
  'ESCALATED BY s1206 UNDER §5 — THIRD CONSECUTIVE FAILURE, THIRD DISTINCT PREMISE.',
  'No mergeHash by design (F-1179-5: a lawful stop ships no work, and mergeHash is a GUARD INPUT — writing one here would make drain-block-check --queue answer "ALREADY SHIPPED — DO NOT QUEUE", which is false).',
  'Attempt 1 d7d8ba03 premise the-spec-is-correct -> 4/4 red. Attempt 2 7b2d63f5 premise raise-the-waits-as-a-class -> 3/4 red, premise refuted. Attempt 3 45f78f6e premise later-barks-OVERTAKE-a-single-slot-feed -> 3/4 red, premise NOT confirmed.',
  'THE RUN WAS GOOD: it delivered the recorder exactly as ordered (addInitScript before goto, history-polling positives, current-text dismissal negatives, m1+m2 mutation controls both passing, zero src/, plain-boot and no-?debug assertions intact) and it STOPPED ON ITS OWN FIRST RED AND REPORTED IT — the behaviour whose absence made attempt 2 untrustworthy.',
  'WHY PARKED RATHER THAN RE-CURED: its own report offers two readings and cannot choose between them — verbatim, the result "refutes the overtaking-only premise—or shows that reading current text from a batched MutationObserver callback can itself miss an intermediate mutation." THOSE ARE DIFFERENT DEFECTS WITH OPPOSITE CURES.',
  'THE SHARP EVIDENCE: at failure the recorded history held TWO entries (the first-run line and ""), while s1205 measured the same feed at the same beat alive and cycling 43 samples of barks (horn 23x, knock 6x, taught 14x). A working recorder watching that feed cannot record two entries. So EITHER the recorder went deaf (it binds the FIRST matching node; the trailing "" fits that node being emptied or detached while a replacement carried the real messages) OR the feed genuinely stayed empty in these runs — which kills the overtaking premise and makes this a src/ finding, the test having been right all along.',
  'DO NOT AUTHOR A FOURTH CURE BEFORE F-1206-1 SEPARATES THEM: one instrumented run that dumps, at the moment of failure, BOTH the recorded history AND a live independent sample of the feed node, plus whether the node identity changed since install.',
  's1206 ATTEMPTED THAT A/B ITSELF AND FAILED TWICE TO REACH THE SUBJECT STATE, and records both nulls rather than dressing them as inference: run 1 waited in town, where hud-agent-feed does not exist (recorder 0 / poll 0 / 473 ticks / feedPresentAtEnd false — a probe that executes nothing reports zero); run 2 drove town->board->Launch and never reached the tavern (activePrompt null at 30s, n=1, confounded). Probe retained at logs/session-scratch/s1206-probes/.',
  'THE SLICE REMAINS WORTH FIXING SLOWLY: it is the Mistake #10 guarantee that a plain-boot player is actually taught the first claim.',
].join(' ');

writeFileSync(PATH, `${JSON.stringify(goals, null, 1)}\n`);
console.log('AFTER: status =', leaf.status);
