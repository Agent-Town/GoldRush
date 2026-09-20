// s1268 — insert the F-1268 findings into tasks/BACKLOG.md, in the same commit as the events.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/BACKLOG.md';
const lines = readFileSync(P, 'utf8').split('\n');

const F123 = [
  '✅ **F-1268-1/2/3 (s1268, MEASURED — THE PRESCRIBED SWEEP RAN, AND UNDER IT IS A HARD CEILING: THE FIRE SHELL\'S SPAWNED CHILD PROCESSES GET ~3.5× OF A 16-CORE BOX WHILE 45% OF IT SITS IDLE.)**',
  's1267 §4 prescribed a worker-count sweep in the fire shell; it ran — interleaved, 12 runs / 3 cycles, concurrency quoted from the reporter\'s own line every time, reds counted by s1267\'s signature verbatim.',
  '**F-1268-1 — the drift red is a GRADED DOSE on concurrent workers, measured inside ONE shell: 0/18 · 5/18 · 14/18 · 18/18 at 1 · 2 · 3 · 6 workers (n=72).**',
  'The assertion is not a coin that lands one way per shell; it is a curve, and this is the first time it has been measured as one (confirms F-1264-1\'s direction).',
  '⭐ **The serial arm is the load control and it is now decisive: w=1 ran three times at loadavg-before 2.46, 19.49 and 20.65 — an 8× spread including the two hottest moments of the fire — and produced 0 drift reds every time.**',
  'Machine load was refuted by s1264 with one control; it is refuted here with eighteen instances spanning the range.',
  '**F-1268-2 — at 6 workers every test inflates 6.7× (7.5 s → ~50 s) and total throughput falls BELOW serial (0.072 vs 0.125 tests/s): the box does less work with six browsers than with one.**',
  'And it is not busy: `top -l 2` reads **52.3% then 44.67% idle** during degraded arms, `memory_pressure` **79% free**, `pmset -g therm` no thermal or performance warning.',
  'Also killed cheaply: **no orphan accumulation** (one vite on 5188, mine; the 5247/5252 pair is 4 days old and idle), **no foreign load** (runner pid 35584 alive at 0.0%, no Codex task running), and **nice 0 / pri 20** on every browser process — no priority demotion anywhere in the tree.',
  '⭐ **F-1268-3 — THE MECHANISM, MEASURED WITH AN INSTRUMENT THAT CAN SEE IT: spawned CHILD PROCESSES cap at ~3.1–3.5× parallel throughput on 16 cores** (8 children: 10.14 s / 10.5 s / 9.92 s against 3.92 s for one).',
  'With eight CPU-bound children live, `top` shows all eight at **54.4–54.5% of a core each** while **45.32% of the box is idle** — eight independent processes converging on an identical share is a policy ceiling, not competition.',
  '**This is exactly the shape that produces the playwright collapse** (1–2 browsers fit under it, 3 degrades, 6 collapses), and it explains why serial work matches the lane while concurrent work does not.',
  '⚠️ **s1265\'s 5.04× was node WORKER THREADS inside one already-running process, and is blind to a policy binding on spawned child processes — which is what six chromium instances are.**',
  '✗ **Refuted by execution this fire, do not re-test: the SANDBOX** (identical probe with the sandbox disabled: **3.15× vs 2.93×**, indistinguishable — s1265\'s verdict was right and its instrument could not have shown it, since the fire-vs-lane gap is denominated in wall time while its arm measured redness on a box at loadavg 18.14);',
  '**the BACKGROUND QoS CLASS** (`taskpolicy -c background` = **0.51×**, i.e. 7× worse than where the fire sits, so the fire is nowhere near that tier);',
  'and **an inherited background designation** (`taskpolicy -B` on self, then re-measure: **3.64× → 3.76×**, nothing to remove).',
  'ⓘ **Reported and untouched: F-1267-2 did NOT reproduce** — the `:42` nearest-actor assertion (2/24 in s1267) is **0 misses in 72 instances** here.',
  'ⓘ **Honest note against my own design:** each cycle ran 1→2→3→6, so the middle steps always executed on a box my own earlier arms had heated. The **extremes are unconfounded** (cycle 2\'s w=1 ran straight after the hottest arm of the fire and still read 0/6; w=6 read 6/6 from three different starting loads), but **5/18 and 14/18 should be re-run in reversed order before anyone quotes them as rates.**',
  '⚖️ **The rule this earns:** *an instrument that measures parallelism must itself be parallel in the same unit as the subject — threads cannot answer a question about processes.*',
  'Evidence `logs/session-scratch/s1268/RESULTS.md`; instruments and all twelve raw run logs committed as tracked `.txt` beside it (F-1267-3\'s principle applied to my own evidence). Commit `7029e515`.',
].join(' ');

const F4 = [
  '🔺 **F-1268-4 (s1268, READ + MEASURED-AROUND — A DOCUMENTED CANDIDATE CAUSE FOR THE CEILING, DELIBERATELY NOT CLAIMED AS PROVEN. ONE LANE RUN DECIDES IT.)**',
  '`~/Library/LaunchAgents/com.goldrush.fire.plist` (read this fire) declares `Label`, `ProgramArguments`, `StartInterval 300`, `RunAtLoad`, `WorkingDirectory`, two log paths and two environment variables — and **no `ProcessType` key**.',
  '`man launchd.plist`: *"If left unspecified, the system will apply light resource limits to the job, **throttling its CPU usage and I/O bandwidth**."*',
  'That is a documented mechanism which predicts F-1268-3 exactly, and it fits every observation in the six-fire thread: serial work sits under the ceiling and matches the lane (~8–9 s/test, 49 s on both sides), 3+ concurrent browsers exceed it and collapse, CPU sits idle, nice/pri are untouched, and the sandbox, node version and working directory are all already refuted.',
  '🚫 **NOT ESTABLISHED, and this fire does not claim it:** every reading in F-1268-3 was taken *inside the fire\'s own process tree*, where a launchd resource limit and "this box simply cannot do better" produce identical numbers.',
  '➡️ **The separating control is one command in a shell no fire can reach**, so it is authored as a lane task: **`fire-shell-cpu-ceiling-control`** (`tasks/lane-b-fire-shell-cpu-ceiling-control.md`, leaf registered `queued`, commit `7029e515`).',
  'Both arms run the **same committed instrument** (`logs/session-scratch/s1268/child-scaling-v2.mjs`, tag `fire` vs tag `lane`) and the master forbids editing it, so the two readings are one measurement rather than two models of it.',
  '**Decision table, total: ~7–12× ⇒ the ceiling is the fire\'s process context, the six-fire divergence is explained, and the remedy is one key in one plist · ~3× like the fire\'s ⇒ the ceiling is the BOX, the fire\'s context is exonerated, and the lane\'s own 14 s green becomes the thing to re-measure · between ⇒ a partial ceiling, report and stop.**',
  '**GATE: none for the measurement — no owner ruling needed. If the lane reading lands in the ~7–12× row, the plist edit that follows IS owner-gated: it changes the owner\'s launchd configuration, outside the repo.**',
].join(' ');

// insert directly after the F-1267-3 entry (newest-last ordering in this block)
const idx = lines.findIndex((l) => l.startsWith('🚨 **F-1267-3'));
if (idx < 0) throw new Error('anchor F-1267-3 not found — refusing to guess a location');
lines.splice(idx + 1, 0, '', F123, '', F4);
writeFileSync(P, lines.join('\n'));
console.log(`inserted after line ${idx + 1}; file now ${lines.length} lines`);
