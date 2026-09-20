// s1252 — mutation harness for scripts/citation-title-guard.mjs.
//
// "Mutate the SUBJECT, not the guard script." Each mutation disables exactly one branch of
// the cure; the arm named for that branch must go red and the others must stay green. M0
// restores the whole pre-fix file, which proves the pre-fix subject held every defect AND
// that the cure breaks nothing it already protected.
//
// The subject is restored byte-identically at the end (sha256 printed both sides).
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const SUBJECT = 'scripts/citation-title-guard.mjs';
const TEST = 'scripts/citation-title-guard.test.mjs';
const BACKUP = 'logs/session-scratch/s1252/citation-title-guard.mjs.bak';

// The shell gate rejects `| tee` / redirection compounds, so the harness keeps its own
// transcript (committed as evidence under the RETENTION LAW).
const LOG = 'logs/session-scratch/s1252/mutation-run.txt';
fs.writeFileSync(LOG, '');
const say = (line = '') => {
  console.log(line);
  fs.appendFileSync(LOG, line + '\n');
};

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const original = fs.readFileSync(SUBJECT, 'utf8');
fs.writeFileSync(BACKUP, original);
say(`subject sha256(16) BEFORE : ${sha(original)}`);

function runTests() {
  const r = spawnSync('node', ['--test', TEST], { encoding: 'utf8' });
  const out = r.stdout + r.stderr;
  const failed = [...out.matchAll(/^✖ (.+?) \(/gm)].map((m) => m[1]);
  const pass = Number((out.match(/^ℹ pass (\d+)$/m) || [])[1] ?? -1);
  const fail = Number((out.match(/^ℹ fail (\d+)$/m) || [])[1] ?? -1);
  return { rc: r.status, pass, fail, failed };
}

const headVersion = execFileSync('git', ['show', `HEAD:${SUBJECT}`], {
  encoding: 'utf8',
  maxBuffer: 1 << 28,
});

const MUTATIONS = [
  { id: 'M0', why: 'the WHOLE pre-fix file (HEAD)', apply: () => headVersion },
  {
    id: 'M1',
    why: 'drop the empty-denominator (0 task docs) refusal',
    apply: (s) => s.replace('if (taskDocs.length === 0) {', 'if (false) {'),
  },
  {
    id: 'M2',
    why: 'drop the zero-citations refusal',
    apply: (s) => s.replace('if (rows.length === 0) {\n    console.error(', 'if (false) {\n    console.error('),
  },
  {
    id: 'M3',
    why: 'drop the missing-baseline refusal',
    apply: (s) => s.replace('if (!fs.existsSync(BASELINE)) {\n  console.error(', 'if (false) {\n  console.error('),
  },
  {
    id: 'M4',
    why: 'drop the CARRIES-LINE (non-test source line) resolution',
    apply: (s) => s.replace("if (verdict === 'NUMBER-ONLY') {\n          const lines", 'if (false) {\n          const lines'),
  },
  {
    id: 'M5',
    why: 'drop the NOT GATED remainder line from the gate verdict',
    apply: (s) => s.replace('} else if (unGated.citations > 0) {', '} else if (false) {'),
  },
];

say('\n--- baseline (cure in place) ---');
const base = runTests();
say(`rc=${base.rc} pass=${base.pass} fail=${base.fail}`);

const results = [];
for (const m of MUTATIONS) {
  const mutated = m.apply(original);
  if (mutated === original) throw new Error(`${m.id}: mutation was a no-op — the anchor moved`);
  fs.writeFileSync(SUBJECT, mutated);
  const r = runTests();
  results.push({ ...m, ...r });
  say(`\n===== ${m.id} — ${m.why} =====`);
  say(`rc=${r.rc} pass=${r.pass} fail=${r.fail}`);
  r.failed.forEach((f) => say(`   ✖ ${f}`));
  fs.writeFileSync(SUBJECT, original);
}

const after = fs.readFileSync(SUBJECT, 'utf8');
say(`\nsubject sha256(16) AFTER  : ${sha(after)}`);
say(`RESTORED BYTE-IDENTICAL   : ${after === original}`);

say('\n--- summary ---');
say(`baseline: ${base.pass} pass / ${base.fail} fail`);
for (const r of results) say(`${r.id}: ${r.fail} red  [${r.failed.join(' | ')}]`);
