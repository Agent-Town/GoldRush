// s1251 — mutate the SUBJECT (scripts/assert-release-build.mjs), never the test.
// One mutation per new branch, plus M0 = the whole pre-fix file. Subject restored byte-identical.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const SUBJECT = 'scripts/assert-release-build.mjs';
const PRE_FIX = 'logs/session-scratch/s1251/assert-release-build.mjs.pre-fix.bak';
const original = readFileSync(SUBJECT, 'utf8');
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);
const before = sha(original);
const out = [`SUBJECT sha256(post-fix, pre-mutation) = ${before}\n`];

const DIST_ASSERTION = "if (!files.length) fail(`no build to check — ${dist} is missing or empty; run \\`npm run build:release\\` first`);\n";
const DENOM_ASSERTION_START = 'if (!laterAssetStems.size) {';
const SUMMARY_SUFFIX = ' (checked against ${laterAssetStems.size} later-asset stems)';

function mutate(label, text) {
  writeFileSync(SUBJECT, text);
  const r = spawnSync(process.execPath, ['--test', 'scripts/assert-release-build.test.mjs'],
    { cwd: process.cwd(), encoding: 'utf8' });
  const body = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const pass = (body.match(/^ℹ pass (\d+)/m) ?? [])[1];
  const fail = (body.match(/^ℹ fail (\d+)/m) ?? [])[1];
  const reds = [...body.matchAll(/^✖ (.+?) \(/gm)].map((m) => m[1]);
  out.push(`\n########## ${label}\nRC=${r.status}  pass=${pass} fail=${fail}\nRED ARMS:\n` +
    (reds.length ? reds.map((t) => `  - ${t}`).join('\n') : '  (none)') + `\n\n--- raw ---\n${body}`);
  console.log(`${label}: rc=${r.status} pass=${pass} fail=${fail} reds=[${reds.join(' | ')}]`);
  writeFileSync(SUBJECT, original);
}

// M0 — revert the entire cure to the file as it stood before this fire.
mutate('M0 whole pre-fix subject', readFileSync(PRE_FIX, 'utf8'));

// M1 — drop ONLY the missing-dist refusal.
if (!original.includes(DIST_ASSERTION)) throw new Error('M1 anchor not found — harness is stale');
mutate('M1 drop the missing-dist refusal', original.replace(DIST_ASSERTION, ''));

// M2 — drop ONLY the empty-denominator refusal (the whole if-block).
const denomStart = original.indexOf(DENOM_ASSERTION_START);
if (denomStart < 0) throw new Error('M2 anchor not found — harness is stale');
const denomEnd = original.indexOf('}', original.indexOf('repoint it', denomStart)) + 2;
mutate('M2 drop the empty-denominator refusal', original.slice(0, denomStart) + original.slice(denomEnd));

// M3 — drop ONLY the denominator from the success line.
if (!original.includes(SUMMARY_SUFFIX)) throw new Error('M3 anchor not found — harness is stale');
mutate('M3 drop the denominator from the success line', original.replace(SUMMARY_SUFFIX, ''));

const after = sha(readFileSync(SUBJECT, 'utf8'));
out.push(`\n\nSUBJECT sha256(restored) = ${after}\nRESTORED BYTE-IDENTICAL = ${after === before}\n`);
writeFileSync(process.argv[2], out.join('\n'));
console.log(`restored byte-identical = ${after === before} (${after})`);
