import fs from 'node:fs';

const p = 'tasks/goals.json';
const raw = fs.readFileSync(p, 'utf8');
const g = JSON.parse(raw);
const ft = g.goals.find((x) => x.id === 'factory-infra').subgoals.find((x) => x.id === 'factory-truth');

if (ft.tasks.some((t) => t.id === 'f1424-4-lane-shell-worker-arms')) {
  console.log('already present — no change');
  process.exit(0);
}

ft.tasks.push({
  id: 'f1424-4-lane-shell-worker-arms',
  title: 'F-1424-4 measurement: the lane runner reported town-t5 approach-barks as 9/10 nondeterministic while the draining fire got 5/5 at --workers=1, so a LANE-shell timing red currently rests on one observation per arm. F-1270-1 / fire.md §3.1 is a FIRE-shell finding and does not cover the lane shell, whose config deliberately keeps full parallelism. Replace the anecdote with a matched-arm RATE using the existing s1216 harness: produce a number and an honest verdict, change no behaviour.',
  taskFile: 'lane-a-f1424-4-lane-shell-worker-arms.md',
  lane: 'lane-a',
  status: 'queued',
  attempts: 0,
  authoredBy: 's1425 fire (FIRE-AUTHORED)',
  authorNotes: [
    'NOT A FIX TASK — a measurement whose four outcomes are pre-declared, three of which require changing nothing, and whose NULL result is explicitly a legitimate deliverable (s1216 got flat arms for two of its four subjects).',
    'PRIOR ART FOUND BEFORE AUTHORING, NOT INVENTED: logs/suite-red-inventory.md already carries F-1212-2(b) (default workers reddened the drain minimum 5-failed/29-passed versus 34/34 at --workers=1) and the F-1216-1 follow-up, which ran this exact protocol (one tree, external Vite on a scratch port, 8 interleaved cycles, requested/configured/actual workers agreeing in every arm). Its instrument scripts/concurrency-class-rate.mjs still exists and is parameterised: it self-tests, enforces --runs>=8, refuses port 5188 and a non-empty output dir, interleaves the arms inside each cycle, re-checks HEAD before every run and aborts if the tree moved, and retains raw Playwright JSON plus per-run loadavg. The master therefore FORBIDS writing a harness.',
    'CALIBRATION TRAP NAMED EXPLICITLY: the inventory row reading town-t5 16/17 (94.1%) sits in the Masking candidates table (heading :363, columns :367) and is a failing-line / body-lines RATIO, not a pass rate. s1216 published that same correction after nearly building an oracle on it, and s1425 nearly repeated the mistake before reading the column header. The master forbids using any number from that table as an oracle, expectation or acceptance threshold.',
    'TWO DESIGN POINTS SETTLED SO THE RUNNER CANNOT GET THEM WRONG: (1) the subject is the WHOLE spec file, not a file:line, because the spec holds 5 tests x 2 projects = 10 executions and a single-test subject would cap real concurrency at 2 regardless of the flag, silently measuring nothing — and F-1212-2(b)-s mechanism is precisely that NEIGHBOURS manufacture the load that reddens a test. (2) :104 (the 8s expect.poll inside expectBark, the failing line recorded in the inventory at :283-284) and :203 (the test declaration, which is the harness-s subject key at concurrency-class-rate.mjs:162) are different coordinates, and only :203 is a valid Playwright file:line filter; the master reports both and conflates neither.',
    'HARD STOP WIRED IN AS SCOPE 2: if the lane shell-s bare-default reporter header shows M=1 workers then the variable does not vary and the measurement is VOID — report M, CLAUDE_CONFIG_DIR (which playwright.config.ts:23 keys on) and the cpu count, and stop. That stop is itself a result, not a no-op, and the master says so.',
    'FIREWALLED BY NAME AGAINST THE THREE WAYS THIS TASK COULD DESTROY ITS OWN SUBJECT: the spec under test (editing it destroys the measurement and stabilising it is not this task), playwright.config.ts (fire.md §3.1 forbids touching workers there and scripts/fire-shell-serialisation.test.mjs asserts BOTH directions, so a flat workers:1 would tax every lane), and the instrument itself (if it is wrong, STOP and report rather than edit mid-measurement). --repeat-each is forbidden by name because it shares one process and worker pool and would change the very quantity being measured.',
  ].join(' '),
});

fs.writeFileSync(p, JSON.stringify(g, null, 2) + '\n');
console.log('leaf added; factory-truth tasks now', ft.tasks.length);
