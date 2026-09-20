// F-1514-1 discipline: run the CANDIDATE CURE on the LIVE CORPUS before authoring it.
// Copies the guard to a scratch path, swaps ONLY line 66's QUOTED regex, runs both.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const SRC = 'scripts/citation-title-guard.mjs';
const DST = 'logs/session-scratch/s1514-guard-bykind.mjs';
const src = fs.readFileSync(SRC, 'utf8');

const OLD_LINE = 'const QUOTED = /["“”\'‘’`]([^"“”\'‘’`\\n]{12,160})["“”\'‘’`]/g;';
if (!src.includes(OLD_LINE)) throw new Error('QUOTED line not found verbatim — read the file');

const NEW_LINE =
  'const QUOTED = /`([^`\\n]{12,160})`|["“”]([^"“”\\n]{12,160})["“”]|[\'‘’]([^\'‘’\\n]{12,160})[\'‘’]/g;';

// the scan sites read q[1]; with alternation the capture may be in 1, 2 or 3.
// Normalise by wrapping exec at every call site: simplest is a shim on the regex.
let out = src.replace(OLD_LINE, NEW_LINE);
// q[1] -> first defined capture
out = out.replaceAll('matchesATitle(q[1],', 'matchesATitle((q[1] ?? q[2] ?? q[3]),');
fs.writeFileSync(DST, out, 'utf8');

const run = (path) => {
  try {
    return { rc: 0, out: execSync(`node ${path} --report`, { encoding: 'utf8', maxBuffer: 32e6 }) };
  } catch (e) {
    return { rc: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') };
  }
};

for (const [name, p] of [['BASELINE (main)', SRC], ['CANDIDATE (by-kind)', DST]]) {
  const r = run(p);
  console.log(`\n======== ${name} ========  rc=${r.rc}`);
  console.log(
    r.out
      .split('\n')
      .filter((l) => /citations|CARRIES|NUMBER-ONLY|SPEC-GONE|grandfathered|NOT GATED|FAIL|violation/i.test(l))
      .join('\n'),
  );
}
