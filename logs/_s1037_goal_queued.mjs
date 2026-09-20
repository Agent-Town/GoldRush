import { readFileSync, writeFileSync } from 'node:fs';

// Line surgery again (same reason as _s1037_goal.mjs): only the leaf's status moves,
// and the note gains the CODEX-RESUMED fact so the leaf explains its own state change.
const p = '/Users/robin/Claude/Projects/Gold Rush/tasks/goals.json';
const lines = readFileSync(p, 'utf8').split('\n');

const at = lines.findIndex((l) => l.includes('"id": "perf-05-startup-attribution"'));
if (at < 0) {
  console.error('leaf not found — aborting');
  process.exit(1);
}
const end = lines.findIndex((l, i) => i > at && l.trim() === '},');
if (end < 0 || end - at > 12) {
  console.error('leaf block boundary looks wrong — aborting', { at, end });
  process.exit(1);
}

const APPEND =
  " QUEUED SAME FIRE, s1037: the wall LIFTED. s1037's authorised PROBE-BY-QUEUE (lane-c's pre-authorised geometry-settle master) was grabbed at 16:47:25 and came back a REAL session — Codex v0.145.0, model gpt-5.6-sol, clean startup, executing commands, ~963KB of log in the first minute against the 16:23 outage's 4,303 bytes. " +
  "Verified honestly rather than by size alone: ZERO occurrences of codex_models_manager (s1036's early-warning signature, which fired twice in the degraded 15:53 run), and the 27 apparent hits for /503|circuit_open|throttled|server_error|Reconnecting/ ALL resolve to the finding id 'F-m503-1' in the STATUS/BACKLOG text the runner was reading — a substring collision, on the very fire that opened F-1037-1 about a substring collision. No real outage error in the log. " +
  "So tasks/CODEX-WALL was lifted (archived intact to logs/runs-archive/CODEX-WALL-20260725-0923Z-raised-s1036-lifted-s1037.md rather than deleted — retention law), refills resumed, and this master went to lane-a, lifting lane-a out of the PIPELINE-DRY it had sat in for three fires. status planned -> queued.";

let sawStatus = false;
let sawNote = false;
for (let i = at; i < end; i++) {
  const ind = lines[i].match(/^\s*/)[0];
  if (lines[i].trim().startsWith('"status":')) {
    lines[i] = `${ind}"status": "queued",`;
    sawStatus = true;
  } else if (lines[i].trim().startsWith('"note":')) {
    const prior = JSON.parse(lines[i].trim().replace(/^"note":\s*/, '').replace(/,$/, ''));
    lines[i] = `${ind}"note": ${JSON.stringify(prior + APPEND)}`;
    sawNote = true;
  }
}
if (!sawStatus || !sawNote) {
  console.error('expected fields not found — aborting', { sawStatus, sawNote });
  process.exit(1);
}

const out = lines.join('\n');
JSON.parse(out); // validate before writing
writeFileSync(p, out);
console.log('leaf perf-05-startup-attribution: status -> queued, CODEX-RESUMED note appended');
