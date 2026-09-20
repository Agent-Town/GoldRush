// s2664 teeth sweep — manufacture defects IN PLACE, restore BYTE-IDENTICALLY (sha256-asserted).
// Lives under artifacts/s2664/ and NOT under scripts/ (F-1665-1: scripts/ is the run surface;
// F-2663-2: this harness refuses /tmp, so artifacts/s<N>/ is the lawful route).
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const SUBJ = 'scripts/worktree-registry-ledger.mjs';
const orig = readFileSync(SUBJ, 'utf8');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const origSha = sha(orig);

const run = () => {
  const r = spawnSync('node', ['--test', 'scripts/worktree-registry-ledger-guard.test.mjs'], {
    encoding: 'utf8',
    timeout: 240_000,
    killSignal: 'SIGKILL',
  });
  const out = (r.stdout || '') + (r.stderr || '');
  return {
    rc: r.status,
    reds: [...new Set((out.match(/^✖ (\d+)\./gm) || []).map((x) => x.match(/\d+/)[0]))],
    ran: /tests \d+/.test(out),
  };
};

const UNVERIFIABLE_RETURN =
  "return { state: 'unverifiable', detail: `could not walk ${mainRef}: ${err.message}`, trees: [] };";

const variants = [
  ['V1 PRE-CURE verbatim (no declaration at all)',
    (s) => s.replace(/\n  \/\/ F-2664-1 — printed BEFORE[\s\S]*?\n  \}\n  say\(''\);/, "\n  say('');")],
  ['V2 POSITION: section gated on the delta (the exact s2664 shape)',
    (s) => s.replace('if (flight.trees.length) {', 'if (flight.trees.length && diffRegistry(base.worktrees, now).added.length) {')],
  ['V3 OVER-GENERAL: section printed unconditionally',
    (s) => s.replace('if (flight.trees.length) {', 'if (true) {')],
  ['V4 OVER-GENERAL: drop the containment test (list every worktree)',
    (s) => s.replace('if (mainCommits.has(e.head)) continue;', 'if (false) continue;')],
  ['V5 an unverifiable main returns an empty list SILENTLY',
    (s) => s.replace(UNVERIFIABLE_RETURN, "return { state: 'read', trees: [] };")],
  // NOTE: this variant must anchor on the UNCHANGED branch specifically. A naive
  // `.replace('if (update) mint(...)\n    process.exit(0);', ...)` hits the FIRST
  // occurrence, which is the ABSENT-BASELINE branch — a path arm 18's fixture never
  // reaches, so the variant is INERT and the arm reads as decoration. Anchor on the
  // verdict line above it.
  ['V6 REFUSE instead of declare (targets the real mechanism, on the UNCHANGED branch)',
    (s) => s.replace(
      /(say\(`✅ UNCHANGED[^\n]*\n    if \(update\) mint\(file, now, say\);\n    )process\.exit\(0\);/,
      "$1process.exit(flight.state === 'read' && flight.trees.length ? 1 : 0);")],
  ['V7 drop the HEAD SUBJECT line',
    (s) => s.replace(/\n        say\(`          \$\{t\.subject \?[\s\S]*?\);/, '')],
];

console.log('baseline (unmutated):', JSON.stringify(run()));
for (const [name, fn] of variants) {
  const v = fn(orig);
  if (v === orig) {
    console.log(name + '\n    ⚠️  EDIT MATCHED NOTHING — a construction refusal, NOT evidence about any arm');
    continue;
  }
  writeFileSync(SUBJ, v);
  const r = run();
  writeFileSync(SUBJ, orig);
  if (sha(readFileSync(SUBJ, 'utf8')) !== origSha) throw new Error('RESTORE FAILED — stop and repair by hand');
  console.log(name + '\n    rc=' + r.rc + ' ran=' + r.ran + ' reds=[' + r.reds.join(',') + ']');
}
console.log('\nrestored byte-identical, sha256 asserted:', sha(readFileSync(SUBJ, 'utf8')) === origSha);
