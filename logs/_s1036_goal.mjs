import { readFileSync, writeFileSync } from 'node:fs';

// Line-level surgery, NOT a re-serialize: tasks/goals.json mixes raw-UTF8 and
// \uXXXX escaping across entries, so JSON.stringify of the whole document
// churns ~180 unrelated lines whichever style you pick. Only the leaf moves.
const p = '/Users/robin/Claude/Projects/Gold Rush/tasks/goals.json';
const lines = readFileSync(p, 'utf8').split('\n');

const at = lines.findIndex((l) => l.includes('"id": "m2-05-geometry-settle"'));
if (at < 0) {
  console.error('leaf not found — aborting');
  process.exit(1);
}
const end = lines.findIndex((l, i) => i > at && l.trim() === '},');
if (end < 0 || end - at > 12) {
  console.error('leaf block boundary looks wrong — aborting', { at, end });
  process.exit(1);
}

const OUTCOME =
  "ATTEMPT 1 = NO MERGE, and it was a LAWFUL no-op, not a Silent No-Op: the runner took this master's own pre-authorised scope-1 exit ('0/6 twice in a row') and named it, reporting 'READY-FOR-GATES — authorized measurement-only stop. Pre-fix desktop isolated: 6/6, then 6/6 again.' s1036 VERIFIED that measurement rather than taking it (F-1035-2's lesson): from codex rollout 019f987b, two real invocations of --repeat-each=6 --trace=off, each '6 passed' (58.4s, 53.5s) with real per-test durations 9.4/8.7/9.2s; rc=0, task_complete, 197s. Branch reset to main and e2e/ + src/ byte-identical (diff -rq both trees), so zero diff and nothing was at risk from the reset. BUT s1036 then RE-MEASURED on the same tree and same machine and REPRODUCED the defect: 2 fail / 6 at :361, correct F-1030-1 fingerprint. Four batches, repo root, same -g shape: A (1st of session, default trace, warm vite) 2 FAIL/6; B (trace=off) 0/6; C (default trace) 0/6; D (trace=off, vite dep cache PARKED aside) 0/6. Two hypotheses KILLED so no one re-derives them: (1) '--trace=off is the lever' — rejected, A and C share the default flag and differ only in order (2/6 then 0/6); s1036 also self-corrects an initial wrong read that tracing doubles runtime (A's 1.8m was failure-artifact writing; C ran the same config green in 58.8s). (2) 'the vite dep-optimize cache is the cold thing' — rejected by batch D. WHAT FITS EVERY SAMPLE: playwright.config.ts:20-25 starts a fresh dev server per invocation but all repeats INSIDE one invocation share one browser launch and one warmed GLB cache, so --repeat-each=6 buys ONE draw of the slow variable. Line up the invocation counts and the disagreement dissolves without anyone being dishonest: s1035 = 3 invocations spread across a drain -> 3 failures/12; this runner = 2 back-to-back invocations straight after npm install + build -> 0/12; s1036 batch A = 1 cold invocation -> 2 failures/6; s1036 B/C/D = 3 warm invocations -> 0/18. Roughly ONE failure per COLD invocation; every warm invocation by anyone went green. Review: reviews/m2-05-geometry-settle.md. Done-move retired as noop-s1036-authorized-measurement-stop-reproduced-by-fire-*. No deploy, no gazette (zero src/ bytes, no bundle change, no player-visible change).";

const NOTE_PREFIX =
  "ATTEMPT 2, s1036 REFRESHED (CLAUDE.md §7.5 changed-premise rule — the premise genuinely moved: a reproduction plus a rate MODEL plus two dead hypotheses that attempt 1 did not have). THE KEY EDIT: the '0/6 twice in a row' stop clause is DELETED. It was satisfiable by measuring the wrong regime, and that is exactly what happened — a green sample is now explicitly NOT an acceptable reason to stop, because s1036 reproduced the defect after attempt 1 reported it gone. Scope 1 is re-shaped from one invocation of --repeat-each=6 into SIX SEPARATE invocations of --repeat-each=1, with the expectation stated as 1-3 failures of six and low counts explicitly not a stop reason. Scope 4 (the deterministic mutate/red/revert negative control) is PROMOTED to the primary acceptance evidence and the four-shape table is demoted to corroboration that may not be presented as a close — because at ~1 failure per cold invocation, proving absence by observation is statistically hopeless and cannot distinguish 'fixed' from 'the machine was warm', whereas the mutation control either goes red or the wait has made the guard vacuous. Both dead hypotheses are handed over by name. F-1036-1 (residue reproduces, leaf does not close) and F-1036-2 (the shape of the acceptance bar, AMENDING F-1035-2 one fire later: the count was never the defect — repeats inside one invocation are not independent samples of a cold-start race, so the F-1030-3 timing list needs 'N separate invocations', not a bigger --repeat-each). Scopes 2 and 3 (instrumentation series; STABILITY wait folded into waitForRendererSettle, bare waitForTimeout forbidden) and the FIREWALL are UNCHANGED — still no src/ changes, still no relaxing :361's toBe or widening :362's +2 tolerance. SAFE-DUPE re-proved by s1036: lane/e2-arsenal is reset to main with e2e/ and src/ byte-identical (diff -rq), zero undrained content. PRIOR s1035 NOTE FOLLOWS. ";

let sawAttempts = false;
let sawNote = false;
for (let i = at; i < end; i++) {
  const ind = lines[i].match(/^\s*/)[0];
  if (lines[i].trim().startsWith('"attempts":')) {
    lines[i] = `${ind}"attempts": 1,`;
    sawAttempts = true;
  } else if (lines[i].trim().startsWith('"note":')) {
    const prior = JSON.parse(lines[i].trim().replace(/^"note":\s*/, '').replace(/,$/, ''));
    lines[i] = `${ind}"outcome": ${JSON.stringify(OUTCOME)},\n${ind}"note": ${JSON.stringify(NOTE_PREFIX + prior)}`;
    sawNote = true;
  }
}
if (!sawAttempts || !sawNote) {
  console.error('expected fields not found — aborting', { sawAttempts, sawNote });
  process.exit(1);
}

const out = lines.join('\n');
JSON.parse(out); // validate before writing
writeFileSync(p, out);
console.log('leaf updated (line surgery): attempts=1, outcome added, note prefixed');
