// s1553 one-shot: register the mp-07c-3 leaf + close the mp-07c-2 residues.
// Preserves the file's existing \uXXXX escaping so the diff is the leaf and nothing else.
import fs from 'node:fs';

const p = 'tasks/goals.json';
const g = JSON.parse(fs.readFileSync(p, 'utf8'));
const tasks = g.goals[8].subgoals[0].tasks;

const prev = tasks[9];
if (prev.id !== 'mp-07c-2-view-wire') throw new Error('anchor moved: ' + prev.id);

prev.drainNotes += ' [s1553 UPDATE - BOTH RESIDUES NOW CLOSED: the attended session filed reviews/mp-07c-2-view-wire.md at b33cbd146 (12:19, 40m26s after the merge) with BETTER guard evidence than the rescued transcript (node-guards re-run on the pinned node v26.4.0: 383 tests / 381 pass / 2 fail, live-worktree collection class, vs the transcript v23.11.1 F-1507-1 timeout red); and s1553 wrote the gazette item that the review unblocked (ROUNDUP - Your Agent Now Sees The Claim It Rides, covering 073fca17f + 85807714a). See F-1553-1 for the mechanism: the GZ-01 sweep keys on the review file, which the drainer writes at an unbounded lag after the merge, so the s1551 CLEAR verdict at 11:36:34 was true when taken and false 132 seconds later.]';

if (tasks.some((t) => t.id === 'mp-07c-3-the-invitation')) throw new Error('leaf already exists');

tasks.splice(10, 0, {
  id: 'mp-07c-3-the-invitation',
  title: 'MP-07c-3: THE INVITATION - the Ride Together panel seats a player agent(s) in one paste; roster marks agent riders',
  status: 'queued',
  taskFile: 'lane-mp07c3-the-invitation.md',
  lane: 'lane-b',
  attempts: 0,
  authoredBy: 's1553 (fire)',
  authorNotes:
    'FIRE-AUTHORED s1553 from spec slice MP-07c-3, on a dry board (six queues empty; lanes c+d BUSY, lanes a+b idle and USABLE). Both predecessors are merged (mp-07c-1 073fca17f, mp-07c-2 85807714a), and the spec states explicitly that everything through 07c-3 proceeds without the two open owner questions (those gate only 07c-4), so this is unblocked. THE PREMISE WAS VERIFIED AT SOURCE, NOT INHERITED, AND ONE CHECK NEARLY KILLED THE SLICE: the spec calls the target "the co-op room panel", and src/ui/ contains NO room or invite UI at all - "grep -rn -i invite src/" returns nothing, and rooms are entered via URL params (multiplayerConfigFromSearch, LockstepClient.ts:905). Had that been the whole picture the slice would have needed a design fork (build a panel from scratch) and been UNAUTHORABLE per the section-2E hard limit. It is not: the Ride Together panel DOES exist, in src/town/TownScene.ts (a details block carrying data-testid ride-code-word / ride-join-input / ride-start, and the handlers openRideTogetherClaim, launchRideTogether, joinRideTogether), backed by src/mp/RideTogether.ts. So the slice is a real bounded edit to an existing surface. The gap it closes is the Mistake #10 shape caught one rung early: mp-07c-1 and mp-07c-2 shipped a working human+agent ride that NO PLAYER CAN REACH - the seat invocation is documented only in public/skill.md, i.e. in the door doc an agent reads, not the game a person plays. Dispatch followed F-1424-3: master committed first, two citation keys each proved to grep exactly 1 on main before the cp.',
});

const NON_ASCII = new RegExp('[\\u0080-\\uffff]', 'g');
const escapeNonAscii = (s) =>
  s.replace(NON_ASCII, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

fs.writeFileSync(p, escapeNonAscii(JSON.stringify(g, null, 2)) + '\n');
console.log('leaf registered; tasks now', tasks.length);
