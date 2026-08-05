#!/usr/bin/env node
// nul-audit — find raw NUL bytes in tracked TEXT sources (F-1465-1).
//
// WHY THIS EXISTS. A single raw NUL byte makes `grep` classify a file as BINARY and
// print NOTHING (exit 1) — silently, with no warning, for every pattern. It is not a
// locale effect: measured s1465, `LC_ALL=en_US.UTF-8 grep -c PowerGraph src/game/Game.ts`
// is just as blind as the C-locale run. So any session that concludes "X is absent from
// src/" from a grep has a FALSE NEGATIVE on every NUL-bearing file, and the bigger the
// file the more expensive the wrong conclusion.
//
// That is not hypothetical. s1465 measured `src/game/Game.ts` (8,640 lines, the game's
// largest file) as returning ZERO matches for `import` — a string it contains 134 times —
// and was one commit away from filing a finding claiming four era systems were dead code.
// They are all constructed in that very file (WrangleSystem :646, MothSwarm :667,
// PressureSystem :1310, PowerGraphSystem :3757). The instrument was broken, not the code.
//
// The cure is byte-level and behaviour-preserving: write the delimiter as the six-character ESCAPE
// backslash-u-0-0-0-0 instead of a raw 0x00 byte. JS parses both to the same
// one-character string, so the runtime value is identical and grep can read the file again.
//
// Usage:
//   node scripts/nul-audit.mjs            # report; exit 1 if any NUL found
//   node scripts/nul-audit.mjs --quiet    # exit code only
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const NUL = String.fromCharCode(0);
const quiet = process.argv.includes('--quiet');

// Extensions we expect to be text. Binary assets legitimately contain NULs and are skipped.
const TEXT_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|md|css|html|yml|yaml|sh|txt)$/i;

function trackedFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
  return out.toString('utf8').split('\0').filter(Boolean);
}

const hits = [];
for (const rel of trackedFiles()) {
  if (!TEXT_EXT.test(rel)) continue;
  let buf;
  try {
    if (statSync(rel).size === 0) continue;
    buf = readFileSync(rel);
  } catch {
    continue; // deleted-but-tracked, or unreadable — not this audit's business
  }
  if (buf.indexOf(0) === -1) continue;

  // Report per line so the fix site is unambiguous.
  const text = buf.toString('utf8');
  const lines = text.split('\n');
  const sites = [];
  let total = 0;
  lines.forEach((line, i) => {
    const n = line.split(NUL).length - 1;
    if (n > 0) {
      total += n;
      sites.push({ line: i + 1, count: n, sample: line.trim().slice(0, 110) });
    }
  });
  hits.push({ file: rel, total, sites });
}

if (!quiet) {
  if (hits.length === 0) {
    console.log('nul-audit: CLEAN — no raw NUL bytes in tracked text sources.');
  } else {
    console.log(`nul-audit: ${hits.length} file(s) carry raw NUL bytes — grep is BLIND to these files.\n`);
    for (const h of hits) {
      console.log(`  ${h.file}  (${h.total} NUL byte(s))`);
      for (const s of h.sites) {
        console.log(`    :${s.line}  x${s.count}  ${s.sample}`);
      }
      console.log('');
    }
    console.log('Cure: replace each raw 0x00 with the six-character escape \\u0000.');
    console.log('The parsed string is identical, so runtime behaviour does not change.');
  }
}

process.exit(hits.length === 0 ? 0 : 1);
