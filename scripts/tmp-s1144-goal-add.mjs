// s1144: register the successor master's goal leaf (Goal Registration Law).
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/goals.json';
const goals = JSON.parse(readFileSync(path, 'utf8'));
const tasks = goals.goals[4].tasks;

if (tasks.some((t) => t.id === 'lane-vp-02b-jumper-slot-repair')) {
  console.log('leaf already present');
} else {
  const prevIdx = tasks.findIndex((t) => t.id === 'lane-vp-02b-jumper-slot-red');
  tasks.splice(prevIdx + 1, 0, {
    id: 'lane-vp-02b-jumper-slot-repair',
    title:
      'Retire the dead char.claim_jumper runtime lookup across the seven stranded e2e specs (rename propagation left half-done by 82543f27).',
    status: 'queued',
    taskFile: 'lane-vp-02b-jumper-slot-repair.md',
    lane: 'lane-b',
    spec:
      'reviews/vp-02b-jumper-slot-red-stop.md (F-1144-1 stranded class, F-1144-2 two classes + masking); ' +
      'root cause 82543f27 src/entities/pools.ts:337/:355; reviews/vp-02d.md:26; reviews/vp-02e.md:60; reviews/vp-02e-runner-report.md:81,:108',
    authoredBy: 's1144 (fire-authored, attended review welcome)',
    mergeHash: null,
    authorNotes:
      'Successor to the lawful STOP of lane-vp-02b-jumper-slot-red. Scope is Class B only (the slot rename), which is mechanical and verifiable. ' +
      'Class A (hero walk4 -> walk8; measured Expected 4 / Received 8 at task-031:202) is deliberately EXCLUDED and routed to the owner: whether the hero being walk8 is intended or a regression is a design fork, and 066-walk8-engine:200-205 asserts .not.toContain(walk8) on purpose. ' +
      'Class A fails FIRST in 066:81, task-042:59, task-031:202 and masks their jumper asserts, so those three stay red after this lands -- stated up front in scope 4 so the runner is not judged for it. ' +
      'visual-polish-assets is a STOP-and-report judgement (boot canary), not a blind rename. Scope 5 warns that asserts unexecuted since 2026-07-12 may surface true reds and licenses reporting them over greening them.',
    drainNotes: null,
  });
  writeFileSync(path, JSON.stringify(goals, null, 2) + '\n');
  console.log('leaf registered after index ' + prevIdx);
}
