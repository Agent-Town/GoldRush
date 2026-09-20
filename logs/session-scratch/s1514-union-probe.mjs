// Candidate 3: UNION — accept a title if EITHER the loose scan or the by-kind scan finds it.
// Should be a strict superset of baseline: fixes F-1501-5's case, loses nothing.
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const SRC = 'scripts/citation-title-guard.mjs';
const DST = 'scripts/zz-s1514-scratch-union.mjs'; // in scripts/ so ROOT resolves identically
const src = fs.readFileSync(SRC, 'utf8');

const OLD = 'const QUOTED = /["“”\'‘’`]([^"“”\'‘’`\\n]{12,160})["“”\'‘’`]/g;';
if (!src.includes(OLD)) throw new Error('QUOTED line not found verbatim');

const NEW = `const QUOTED = /["“”'‘’\`]([^"“”'‘’\`\\n]{12,160})["“”'‘’\`]/g;
const QUOTED_BY_KIND = /\`([^\`\\n]{12,160})\`|["“”]([^"“”\\n]{12,160})["“”]|['‘’]([^'‘’\\n]{12,160})['‘’]/g;
function quotedSpans(win) {
  const out = [];
  for (const re of [QUOTED, QUOTED_BY_KIND]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(win))) {
      const cap = m[1] ?? m[2] ?? m[3];
      if (cap !== undefined) out.push(cap);
    }
  }
  return out;
}`;

let out = src.replace(OLD, NEW);

// replace both sequential scan loops with a union walk
out = out.replace(
  `        let q;
        QUOTED.lastIndex = 0;
        while ((q = QUOTED.exec(win))) {
          const t = matchesATitle(q[1], titles);`,
  `        let q;
        for (const cap of quotedSpans(win)) {
          q = [null, cap];
          const t = matchesATitle(q[1], titles);`,
);
out = out.replace(
  `          QUOTED.lastIndex = 0;
          while ((q = QUOTED.exec(win))) {
            const t = matchesATitle(q[1], lines);`,
  `          for (const cap of quotedSpans(win)) {
            q = [null, cap];
            const t = matchesATitle(q[1], lines);`,
);

fs.writeFileSync(DST, out, 'utf8');
try {
  const r = execSync(`node ${DST} --report`, { encoding: 'utf8', maxBuffer: 32e6 });
  console.log(
    r.split('\n').filter((l) => /citations|CARRIES|NUMBER-ONLY|SPEC-GONE|NOT GATED/i.test(l)).join('\n'),
  );
} catch (e) {
  console.log('rc=' + e.status);
  console.log(((e.stdout || '') + (e.stderr || '')).split('\n').slice(0, 30).join('\n'));
} finally {
  fs.unlinkSync(DST);
  console.log('\n(scratch guard copy removed from scripts/)');
}
